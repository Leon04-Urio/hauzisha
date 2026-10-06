<?php
/**
 * Simple File-Based Cache Helper
 * Caches API responses to improve performance
 */

class SimpleCache {
    private $cacheDir;
    private $defaultTTL = 300; // 5 minutes
    
    public function __construct($cacheDir = null) {
        $this->cacheDir = $cacheDir ?: __DIR__ . '/../cache/';
        
        // Create cache directory if it doesn't exist
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }
    
    /**
     * Get cached data
     */
    public function get($key) {
        $filename = $this->getCacheFilename($key);
        
        if (!file_exists($filename)) {
            return null;
        }
        
        $data = file_get_contents($filename);
        $cache = json_decode($data, true);
        
        if (!$cache || !isset($cache['expires']) || $cache['expires'] < time()) {
            // Cache expired
            @unlink($filename);
            return null;
        }
        
        return $cache['data'];
    }
    
    /**
     * Set cache data
     */
    public function set($key, $data, $ttl = null) {
        $ttl = $ttl ?: $this->defaultTTL;
        $filename = $this->getCacheFilename($key);
        
        $cache = [
            'expires' => time() + $ttl,
            'data' => $data
        ];
        
        file_put_contents($filename, json_encode($cache));
    }
    
    /**
     * Delete cache entry
     */
    public function delete($key) {
        $filename = $this->getCacheFilename($key);
        if (file_exists($filename)) {
            @unlink($filename);
        }
    }
    
    /**
     * Clear all cache
     */
    public function clear() {
        $files = glob($this->cacheDir . '*.cache');
        foreach ($files as $file) {
            @unlink($file);
        }
    }
    
    /**
     * Get cache filename
     */
    private function getCacheFilename($key) {
        return $this->cacheDir . md5($key) . '.cache';
    }
}

// Global cache instance
function getCache() {
    static $cache = null;
    if ($cache === null) {
        $cache = new SimpleCache();
    }
    return $cache;
}
