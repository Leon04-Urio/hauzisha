# Rate Limiting Implementation Guide

## Overview
This comprehensive rate limiting system protects your Loft Studio API from abuse and ensures fair usage across all users. It includes both server-side and client-side rate limiting with intelligent retry mechanisms.

## Features

### Server-Side Protection
- **Multi-tier rate limits** for different endpoint types
- **IP-based tracking** with User-Agent fingerprinting
- **Redis support** with file-based fallback
- **Automatic cleanup** of expired entries
- **Violation logging** for security monitoring
- **Whitelist support** for trusted IPs

### Client-Side Intelligence
- **Proactive rate limiting** to prevent server rejections
- **Automatic retry queuing** for rate-limited requests
- **User-friendly notifications** via toast system
- **Endpoint-specific limits** matching server configuration

## Rate Limit Configuration

### Default Limits
| Endpoint Type | Requests | Time Window | Description |
|---------------|----------|-------------|-------------|
| **Default** | 100 | 1 hour | General API endpoints |
| **Auth** | 10 | 15 minutes | Login, register, password reset |
| **Search** | 200 | 1 hour | Search and filter operations |
| **Upload** | 20 | 1 hour | File upload operations |
| **Strict** | 30 | 1 hour | Admin and sensitive operations |
| **Public** | 300 | 1 hour | Public property listings |

### Endpoint Mappings
```php
'/auth/login' => 'auth'
'/search' => 'search'
'/properties' => 'public'
'/upload' => 'upload'
'/admin' => 'strict'
```

## Implementation

### 1. Server-Side Setup

The rate limiter is automatically integrated into your API. Key files:

- `api/middleware/RateLimiter.php` - Main rate limiting class
- `api/config/rate_limits.php` - Configuration settings
- `api/index.php` - Integration point (already updated)

### 2. Client-Side Integration

Include the rate limiter script in your pages:

```html
<script src="js/rate-limiter.js"></script>
```

### 3. Using Rate-Limited Fetch

Replace regular `fetch()` calls with `safeFetch()`:

```javascript
// Old way
const response = await fetch('/api/properties');

// New way (rate-limited)
const response = await safeFetch('/api/properties', {}, 'search');
```

### 4. Endpoint Types

Specify the appropriate endpoint type for optimal rate limiting:

```javascript
// Authentication requests
await safeFetch('/api/auth/login', { method: 'POST', body: data }, 'auth');

// Search requests
await safeFetch('/api/search', {}, 'search');

// Upload requests
await safeFetch('/api/upload', { method: 'POST', body: formData }, 'upload');

// Admin requests
await safeFetch('/api/admin/users', {}, 'strict');

// Default requests
await safeFetch('/api/properties', {}, 'default');
```

## Monitoring and Administration

### Admin Interface
Access the rate limiting monitor at:
```
/control-room/rate-limit-monitor.php
```

Features:
- Real-time statistics
- Violation logs
- Manual cleanup
- Configuration overview

### Automatic Cleanup
Set up a cron job for automatic maintenance:

```bash
# Run cleanup every 5 minutes
*/5 * * * * php /path/to/your/api/helpers/rate_limit_cleanup.php
```

### Log Files
- **Violations**: `api/cache/rate_limit_violations.log`
- **Cleanup**: `api/cache/cleanup.log`
- **Cache**: `api/cache/rate_limits/` directory

## Response Headers

The system adds standard rate limiting headers to all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
Retry-After: 3600 (only when rate limited)
```

## Error Handling

### Server Response (429 Too Many Requests)
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "limit": 100,
  "remaining": 0,
  "reset_time": 1640995200,
  "retry_after": 3600
}
```

### Client-Side Handling
The client automatically:
1. Detects rate limit responses
2. Shows user-friendly notifications
3. Queues requests for automatic retry
4. Respects server retry-after headers

## Security Features

### IP Whitelisting
Add trusted IPs to bypass rate limiting:

```php
// In api/config/rate_limits.php
'whitelist' => [
    '127.0.0.1',
    '::1',
    '192.168.1.100', // Your admin IP
]
```

### Violation Tracking
- Logs all rate limit violations
- Tracks repeat offenders
- Includes IP, User-Agent, and timestamp
- Automatic log rotation (30 days)

### Advanced Fingerprinting
Uses IP + User-Agent hash for better tracking while maintaining privacy.

## Performance Optimization

### Redis Support
For high-traffic sites, enable Redis:

```php
// Automatic detection - install Redis extension
// Configuration in api/config/rate_limits.php
'redis' => [
    'host' => '127.0.0.1',
    'port' => 6379,
    'timeout' => 2.5,
]
```

### File-Based Fallback
Automatically falls back to file-based caching if Redis is unavailable.

## Customization

### Adjusting Limits
Edit `api/config/rate_limits.php`:

```php
'limits' => [
    'custom_endpoint' => [
        'requests' => 50,
        'window' => 1800, // 30 minutes
        'description' => 'Custom endpoint'
    ]
]
```

### Adding New Endpoints
Map new endpoints in the configuration:

```php
'endpoint_mappings' => [
    '/api/custom' => 'custom_endpoint'
]
```

## Testing

### Check Rate Limit Status
```javascript
// Get current status for an endpoint
const status = window.rateLimitedFetch.getStatus('search');
console.log(`Remaining: ${status.remaining}/${status.limit}`);
```

### Manual Testing
Use the browser console to test rate limiting:

```javascript
// Make multiple rapid requests to test limits
for (let i = 0; i < 15; i++) {
    safeFetch('/api/auth/login', { method: 'POST' }, 'auth');
}
```

## Troubleshooting

### Common Issues

1. **Rate limits too strict**: Adjust limits in configuration
2. **False positives**: Add IPs to whitelist
3. **Cache buildup**: Ensure cleanup cron job is running
4. **Redis connection**: Check Redis service status

### Debug Mode
Enable detailed logging by checking violation logs and cleanup logs.

### Performance Issues
- Monitor cache directory size
- Check Redis memory usage
- Review violation patterns

## Best Practices

1. **Use appropriate endpoint types** for different request categories
2. **Implement client-side caching** to reduce API calls
3. **Show loading states** during rate limit delays
4. **Monitor violation logs** regularly
5. **Adjust limits** based on actual usage patterns
6. **Set up monitoring alerts** for excessive violations

## Integration Checklist

- [ ] Rate limiter script included in main pages
- [ ] API calls updated to use `safeFetch()`
- [ ] Endpoint types specified correctly
- [ ] Cron job set up for cleanup
- [ ] Admin monitoring interface accessible
- [ ] Violation logs being generated
- [ ] Rate limit headers visible in responses
- [ ] Client-side notifications working
- [ ] Retry mechanism functioning
- [ ] Performance acceptable under load

## Support

For issues or questions:
1. Check violation logs for patterns
2. Review rate limit monitor dashboard
3. Test with different endpoint types
4. Verify configuration settings
5. Check server error logs

The rate limiting system is designed to be transparent to legitimate users while effectively blocking abuse attempts.