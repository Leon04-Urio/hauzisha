<?php
/**
 * Rate Limit Cache Cleanup Script
 * Run this periodically via cron job to clean up expired rate limit entries
 */

require_once __DIR__ . '/../middleware/RateLimiter.php';

class RateLimitCleanup {
    private $rateLimiter;
    private $logFile;
    
    public function __construct() {
        $this->rateLimiter = new RateLimiter();
        $this->logFile = __DIR__ . '/../cache/cleanup.log';
    }
    
    /**
     * Run cleanup process
     */
    public function run() {
        $startTime = microtime(true);
        $this->log("Starting rate limit cleanup...");
        
        try {
            // Clean up expired cache files
            $this->rateLimiter->cleanup();
            
            // Clean up old violation logs (keep last 30 days)
            $this->cleanupViolationLogs();
            
            // Clean up old cleanup logs (keep last 7 days)
            $this->cleanupOldLogs();
            
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            $this->log("Cleanup completed successfully in {$duration}ms");
            
        } catch (Exception $e) {
            $this->log("Cleanup failed: " . $e->getMessage());
        }
    }
    
    /**
     * Clean up old violation logs
     */
    private function cleanupViolationLogs() {
        $violationLogFile = __DIR__ . '/../cache/rate_limit_violations.log';
        
        if (!file_exists($violationLogFile)) {
            return;
        }
        
        $lines = file($violationLogFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $cutoffDate = date('Y-m-d', strtotime('-30 days'));
        $keptLines = [];
        
        foreach ($lines as $line) {
            if (preg_match('/^\[(\d{4}-\d{2}-\d{2})/', $line, $matches)) {
                if ($matches[1] >= $cutoffDate) {
                    $keptLines[] = $line;
                }
            }
        }
        
        if (count($keptLines) < count($lines)) {
            file_put_contents($violationLogFile, implode("\n", $keptLines) . "\n");
            $removed = count($lines) - count($keptLines);
            $this->log("Cleaned up {$removed} old violation log entries");
        }
    }
    
    /**
     * Clean up old cleanup logs
     */
    private function cleanupOldLogs() {
        if (!file_exists($this->logFile)) {
            return;
        }
        
        $lines = file($this->logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $cutoffDate = date('Y-m-d', strtotime('-7 days'));
        $keptLines = [];
        
        foreach ($lines as $line) {
            if (preg_match('/^\[(\d{4}-\d{2}-\d{2})/', $line, $matches)) {
                if ($matches[1] >= $cutoffDate) {
                    $keptLines[] = $line;
                }
            }
        }
        
        if (count($keptLines) < count($lines)) {
            file_put_contents($this->logFile, implode("\n", $keptLines) . "\n");
        }
    }
    
    /**
     * Log cleanup activities
     */
    private function log($message) {
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] {$message}\n";
        file_put_contents($this->logFile, $logEntry, FILE_APPEND | LOCK_EX);
        echo $logEntry;
    }
    
    /**
     * Get cleanup statistics
     */
    public function getStats() {
        $cacheDir = __DIR__ . '/../cache/rate_limits/';
        $violationLogFile = __DIR__ . '/../cache/rate_limit_violations.log';
        
        $stats = [
            'cache_files' => 0,
            'cache_size' => 0,
            'violation_entries' => 0,
            'last_cleanup' => null
        ];
        
        // Count cache files
        if (is_dir($cacheDir)) {
            $files = glob($cacheDir . '*.json');
            $stats['cache_files'] = count($files);
            
            foreach ($files as $file) {
                $stats['cache_size'] += filesize($file);
            }
        }
        
        // Count violation entries
        if (file_exists($violationLogFile)) {
            $lines = file($violationLogFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $stats['violation_entries'] = count($lines);
        }
        
        // Get last cleanup time
        if (file_exists($this->logFile)) {
            $lines = file($this->logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if (!empty($lines)) {
                $lastLine = end($lines);
                if (preg_match('/^\[([^\]]+)\]/', $lastLine, $matches)) {
                    $stats['last_cleanup'] = $matches[1];
                }
            }
        }
        
        return $stats;
    }
}

// Run cleanup if called directly
if (basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    $cleanup = new RateLimitCleanup();
    $cleanup->run();
}