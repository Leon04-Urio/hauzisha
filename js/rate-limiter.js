/**
 * Client-Side Rate Limiter
 * Helps prevent excessive API calls from the frontend
 */

class ClientRateLimiter {
    constructor() {
        this.requests = new Map();
        this.limits = {
            default: { requests: 60, window: 60000 }, // 60 requests per minute
            search: { requests: 30, window: 60000 },  // 30 search requests per minute
            auth: { requests: 5, window: 300000 },    // 5 auth attempts per 5 minutes
            upload: { requests: 10, window: 300000 }  // 10 uploads per 5 minutes
        };
        
        // Clean up old entries every minute
        setInterval(() => this.cleanup(), 60000);
    }
    
    /**
     * Check if request is allowed
     */
    canMakeRequest(endpoint = 'default') {
        const limit = this.limits[endpoint] || this.limits.default;
        const now = Date.now();
        const key = endpoint;
        
        if (!this.requests.has(key)) {
            this.requests.set(key, []);
        }
        
        const requestTimes = this.requests.get(key);
        
        // Remove old requests outside the window
        const validRequests = requestTimes.filter(time => now - time < limit.window);
        this.requests.set(key, validRequests);
        
        // Check if we're within the limit
        if (validRequests.length >= limit.requests) {
            const oldestRequest = Math.min(...validRequests);
            const waitTime = limit.window - (now - oldestRequest);
            
            return {
                allowed: false,
                waitTime: Math.ceil(waitTime / 1000), // seconds
                remaining: 0,
                limit: limit.requests
            };
        }
        
        // Add current request
        validRequests.push(now);
        this.requests.set(key, validRequests);
        
        return {
            allowed: true,
            waitTime: 0,
            remaining: limit.requests - validRequests.length,
            limit: limit.requests
        };
    }
    
    /**
     * Clean up old entries
     */
    cleanup() {
        const now = Date.now();
        
        for (const [endpoint, requestTimes] of this.requests.entries()) {
            const limit = this.limits[endpoint] || this.limits.default;
            const validRequests = requestTimes.filter(time => now - time < limit.window);
            
            if (validRequests.length === 0) {
                this.requests.delete(endpoint);
            } else {
                this.requests.set(endpoint, validRequests);
            }
        }
    }
    
    /**
     * Get current status for an endpoint
     */
    getStatus(endpoint = 'default') {
        const limit = this.limits[endpoint] || this.limits.default;
        const now = Date.now();
        
        if (!this.requests.has(endpoint)) {
            return {
                remaining: limit.requests,
                limit: limit.requests,
                resetTime: now + limit.window
            };
        }
        
        const requestTimes = this.requests.get(endpoint);
        const validRequests = requestTimes.filter(time => now - time < limit.window);
        
        return {
            remaining: Math.max(0, limit.requests - validRequests.length),
            limit: limit.requests,
            resetTime: validRequests.length > 0 ? Math.min(...validRequests) + limit.window : now + limit.window
        };
    }
}

/**
 * Enhanced Fetch with Rate Limiting
 */
class RateLimitedFetch {
    constructor() {
        this.rateLimiter = new ClientRateLimiter();
        this.retryQueue = [];
        this.processing = false;
    }
    
    /**
     * Make a rate-limited fetch request
     */
    async fetch(url, options = {}, endpoint = 'default') {
        // Check client-side rate limit
        const canProceed = this.rateLimiter.canMakeRequest(endpoint);
        
        if (!canProceed.allowed) {
            console.warn(`Rate limit exceeded for ${endpoint}. Wait ${canProceed.waitTime} seconds.`);
            
            // Show user-friendly message
            this.showRateLimitMessage(canProceed.waitTime);
            
            // Queue the request for retry
            return this.queueRequest(url, options, endpoint, canProceed.waitTime * 1000);
        }
        
        try {
            const response = await fetch(url, options);
            
            // Check server-side rate limit response
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After') || 60;
                console.warn(`Server rate limit exceeded. Retry after ${retryAfter} seconds.`);
                
                this.showRateLimitMessage(parseInt(retryAfter));
                return this.queueRequest(url, options, endpoint, parseInt(retryAfter) * 1000);
            }
            
            // Add rate limit info to response headers for debugging
            if (response.headers.get('X-RateLimit-Remaining')) {
                console.log(`Rate limit remaining: ${response.headers.get('X-RateLimit-Remaining')}`);
            }
            
            return response;
            
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }
    
    /**
     * Queue request for retry after rate limit expires
     */
    async queueRequest(url, options, endpoint, delay) {
        return new Promise((resolve, reject) => {
            this.retryQueue.push({
                url,
                options,
                endpoint,
                resolve,
                reject,
                retryAt: Date.now() + delay
            });
            
            this.processQueue();
        });
    }
    
    /**
     * Process queued requests
     */
    async processQueue() {
        if (this.processing) return;
        this.processing = true;
        
        while (this.retryQueue.length > 0) {
            const now = Date.now();
            const readyRequests = this.retryQueue.filter(req => req.retryAt <= now);
            
            if (readyRequests.length === 0) {
                // Wait for the next request to be ready
                const nextRequest = this.retryQueue.reduce((earliest, req) => 
                    req.retryAt < earliest.retryAt ? req : earliest
                );
                
                const waitTime = nextRequest.retryAt - now;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            
            // Process ready requests
            for (const request of readyRequests) {
                try {
                    const response = await this.fetch(request.url, request.options, request.endpoint);
                    request.resolve(response);
                } catch (error) {
                    request.reject(error);
                }
                
                // Remove from queue
                const index = this.retryQueue.indexOf(request);
                if (index > -1) {
                    this.retryQueue.splice(index, 1);
                }
            }
        }
        
        this.processing = false;
    }
    
    /**
     * Show rate limit message to user
     */
    showRateLimitMessage(waitTime) {
        // Use existing toast system if available
        if (typeof showToast === 'function') {
            showToast(`Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`, 'warning');
        } else {
            console.warn(`Rate limit exceeded. Please wait ${waitTime} seconds.`);
        }
    }
    
    /**
     * Get rate limit status
     */
    getStatus(endpoint = 'default') {
        return this.rateLimiter.getStatus(endpoint);
    }
}

// Global instance
window.rateLimitedFetch = new RateLimitedFetch();

// Enhanced fetch function that respects rate limits
window.safeFetch = async (url, options = {}, endpoint = 'default') => {
    return window.rateLimitedFetch.fetch(url, options, endpoint);
};

// Utility function to check if we can make a request
window.canMakeRequest = (endpoint = 'default') => {
    return window.rateLimitedFetch.rateLimiter.canMakeRequest(endpoint);
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ClientRateLimiter, RateLimitedFetch };
}