<?php
/**
 * Rate Limiting Configuration
 * Centralized configuration for all rate limiting rules
 */

return [
    // Default rate limits (requests per time window in seconds)
    'limits' => [
        'default' => [
            'requests' => 100,
            'window' => 3600, // 1 hour
            'description' => 'General API endpoints'
        ],
        
        'auth' => [
            'requests' => 10,
            'window' => 900, // 15 minutes
            'description' => 'Authentication endpoints (login, register, password reset)'
        ],
        
        'search' => [
            'requests' => 200,
            'window' => 3600, // 1 hour
            'description' => 'Search and filter endpoints'
        ],
        
        'upload' => [
            'requests' => 20,
            'window' => 3600, // 1 hour
            'description' => 'File upload endpoints'
        ],
        
        'strict' => [
            'requests' => 30,
            'window' => 3600, // 1 hour
            'description' => 'Admin and sensitive operations'
        ],
        
        'public' => [
            'requests' => 300,
            'window' => 3600, // 1 hour
            'description' => 'Public endpoints (property listings, etc.)'
        ]
    ],
    
    // IP whitelist (bypass rate limiting)
    'whitelist' => [
        '127.0.0.1',
        '::1',
        // Add your server/admin IPs here
    ],
    
    // Endpoint mappings
    'endpoint_mappings' => [
        // Authentication endpoints
        '/auth/login' => 'auth',
        '/auth/register' => 'auth',
        '/auth/forgot-password' => 'auth',
        '/auth/reset-password' => 'auth',
        '/auth/verify-email' => 'auth',
        
        // Search endpoints
        '/search' => 'search',
        '/properties/search' => 'search',
        '/agents/search' => 'search',
        '/suggestions' => 'search',
        
        // Upload endpoints
        '/upload' => 'upload',
        '/images/upload' => 'upload',
        '/files/upload' => 'upload',
        
        // Admin endpoints
        '/admin' => 'strict',
        '/control-room' => 'strict',
        '/delete' => 'strict',
        '/bulk-delete' => 'strict',
        
        // Public endpoints (higher limits)
        '/properties' => 'public',
        '/agents' => 'public',
        '/reviews' => 'public',
    ],
    
    // Rate limiting behavior
    'behavior' => [
        'log_violations' => true,
        'block_duration' => 3600, // Block for 1 hour after repeated violations
        'violation_threshold' => 5, // Number of violations before blocking
        'cleanup_interval' => 300, // Clean up cache every 5 minutes
    ],
    
    // Redis configuration (if available)
    'redis' => [
        'host' => '127.0.0.1',
        'port' => 6379,
        'timeout' => 2.5,
        'prefix' => 'loft_rate_limit:',
    ],
    
    // Response headers
    'headers' => [
        'limit' => 'X-RateLimit-Limit',
        'remaining' => 'X-RateLimit-Remaining',
        'reset' => 'X-RateLimit-Reset',
        'retry_after' => 'Retry-After',
    ]
];