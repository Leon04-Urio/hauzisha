<?php
/**
 * Rate Limiter Middleware
 * Prevents API abuse by limiting requests per IP address
 */

class RateLimiter {
    private $redis;
    private $useRedis;
    private $cacheDir;
    
    // Rate limit configurations
    private $limits = [
        'default' => ['requests' => 100, 'window' => 3600], // 100 requests per hour
        'auth' => ['requests' => 10, 'window' => 900],      // 10 auth attempts per 15 minutes
        'search' => ['requests' => 200, 'window' => 3600],  // 200 search requests per hour
        'upload' => ['requests' => 20, 'window' => 3600],   // 20 uploads per hour
        'strict' => ['requests' => 30, 'window' => 3600]    // 30 requests per hour for sensitive endpoints
    ];
    
    public function __construct() {
        $this->cacheDir = __DIR__ . '/../cache/rate_limits/';
        
        // Create cache directory if it doesn't exist
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
        
        // Try to use Redis if available, fallback to file-based cache
        $this->useRedis = false;
        if (extension_loaded('redis')) {
            try {
                $this->redis = new Redis();
                $this->redis->connect('127.0.0.1', 6379);
                $this->useRedis = true;
            } catch (Exception $e) {
                $this->useRedis = false;
            }
        }
    }
    
    /**
     * Check if request is within rate limit
     */
    public function checkLimit($endpoint = 'default', $identifier = null) {
        $identifier = $identifier ?: $this->getClientIdentifier();
        $limit = $this->limits[$endpoint] ?? $this->limits['default'];
        
        $key = "rate_limit:{$endpoint}:{$identifier}";
        $current = $this->getCurrentCount($key);
        
        if ($current >= $limit['requests']) {
            $this->logRateLimitExceeded($identifier, $endpoint, $current);
            return [
                'allowed' => false,
                'limit' => $limit['requests'],
                'remaining' => 0,
                'reset_time' => time() + $limit['window'],
                'retry_after' => $limit['window']
            ];
        }
        
        // Increment counter
        $this->incrementCounter($key, $limit['window']);
        
        return [
            'allowed' => true,
            'limit' => $limit['requests'],
            'remaining' => $limit['requests'] - ($current + 1),
            'reset_time' => time() + $limit['window'],
            'retry_after' => 0
        ];
    }
    
    /**
     * Get client identifier (IP + User Agent hash for better uniqueness)
     */
    private function getClientIdentifier() {
        $ip = $this->getClientIP();
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        return $ip . '_' . substr(md5($userAgent), 0, 8);
    }
    
    /**
     * Get real client IP address
     */
    private function getClientIP() {
        $headers = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_X_FORWARDED_FOR',      // Load balancer/proxy
            'HTTP_X_FORWARDED',          // Proxy
            'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
            'HTTP_FORWARDED_FOR',        // Proxy
            'HTTP_FORWARDED',            // Proxy
            'REMOTE_ADDR'                // Standard
        ];
        
        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                $ip = trim($ips[0]);
                
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
    
    /**
     * Get current request count
     */
    private function getCurrentCount($key) {
        if ($this->useRedis) {
            return (int) $this->redis->get($key) ?: 0;
        }
        
        $file = $this->cacheDir . md5($key) . '.json';
        if (!file_exists($file)) {
            return 0;
        }
        
        $data = json_decode(file_get_contents($file), true);
        if (!$data || $data['expires'] < time()) {
            unlink($file);
            return 0;
        }
        
        return $data['count'];
    }
    
    /**
     * Increment request counter
     */
    private function incrementCounter($key, $window) {
        if ($this->useRedis) {
            $this->redis->incr($key);
            $this->redis->expire($key, $window);
            return;
        }
        
        $file = $this->cacheDir . md5($key) . '.json';
        $current = $this->getCurrentCount($key);
        
        $data = [
            'count' => $current + 1,
            'expires' => time() + $window
        ];
        
        file_put_contents($file, json_encode($data), LOCK_EX);
    }
    
    /**
     * Log rate limit exceeded attempts
     */
    private function logRateLimitExceeded($identifier, $endpoint, $count) {
        $logFile = __DIR__ . '/../cache/rate_limit_violations.log';
        $timestamp = date('Y-m-d H:i:s');
        $ip = $this->getClientIP();
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        
        $logEntry = "[{$timestamp}] RATE_LIMIT_EXCEEDED - IP: {$ip}, Identifier: {$identifier}, Endpoint: {$endpoint}, Count: {$count}, User-Agent: {$userAgent}\n";
        
        file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Send rate limit response
     */
    public function sendRateLimitResponse($result) {
        http_response_code(429);
        header('Content-Type: application/json');
        header('X-RateLimit-Limit: ' . $result['limit']);
        header('X-RateLimit-Remaining: ' . $result['remaining']);
        header('X-RateLimit-Reset: ' . $result['reset_time']);
        header('Retry-After: ' . $result['retry_after']);
        
        echo json_encode([
            'success' => false,
            'error' => 'Rate limit exceeded',
            'message' => 'Too many requests. Please try again later.',
            'limit' => $result['limit'],
            'remaining' => $result['remaining'],
            'reset_time' => $result['reset_time'],
            'retry_after' => $result['retry_after']
        ]);
        exit;
    }
    
    /**
     * Clean up expired cache files (call periodically)
     */
    public function cleanup() {
        if ($this->useRedis) {
            return; // Redis handles expiration automatically
        }
        
        $files = glob($this->cacheDir . '*.json');
        foreach ($files as $file) {
            $data = json_decode(file_get_contents($file), true);
            if ($data && $data['expires'] < time()) {
                unlink($file);
            }
        }
    }
    
    /**
     * Get rate limit status for an identifier
     */
    public function getStatus($endpoint = 'default', $identifier = null) {
        $identifier = $identifier ?: $this->getClientIdentifier();
        $limit = $this->limits[$endpoint] ?? $this->limits['default'];
        $key = "rate_limit:{$endpoint}:{$identifier}";
        $current = $this->getCurrentCount($key);
        
        return [
            'limit' => $limit['requests'],
            'remaining' => max(0, $limit['requests'] - $current),
            'reset_time' => time() + $limit['window'],
            'current' => $current
        ];
    }
    
    /**
     * Whitelist an IP address (bypass rate limiting)
     */
    public function isWhitelisted($ip = null) {
        $ip = $ip ?: $this->getClientIP();
        
        $whitelist = [
            '127.0.0.1',
            '::1',
            // Add your server IPs here
        ];
        
        return in_array($ip, $whitelist);
    }
}