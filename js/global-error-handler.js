/**
 * Global Error Handler
 * Catches all JavaScript errors and displays user-friendly messages
 */

(function() {
    'use strict';
    
    // Global error handler
    window.addEventListener('error', function(event) {
        console.error('Global Error:', event.error);
        
        // Show user-friendly message
        if (typeof showToast === 'function') {
            showToast('An unexpected error occurred. Please refresh the page.', 'error');
        }
        
        // Prevent default error handling
        return false;
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled Promise Rejection:', event.reason);
        
        if (typeof showToast === 'function') {
            showToast('An error occurred while processing your request.', 'error');
        }
        
        event.preventDefault();
    });
    
    // Enhanced fetch wrapper with loading states and error handling
    window.safeFetchWithLoading = async function(url, options = {}) {
        const loadingId = 'loading-' + Date.now();
        
        try {
            // Show loading indicator
            showLoadingIndicator(loadingId);
            
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Hide loading indicator
            hideLoadingIndicator(loadingId);
            
            // Handle API errors
            if (data.success === false) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
            
        } catch (error) {
            hideLoadingIndicator(loadingId);
            console.error('Fetch Error:', error);
            
            if (typeof showToast === 'function') {
                showToast(error.message || 'Network error occurred', 'error');
            }
            
            throw error;
        }
    };
    
    // Show loading indicator
    function showLoadingIndicator(id) {
        // Check if a global loading container exists
        let loader = document.getElementById('global-loader');
        
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className = 'global-loading-indicator';
            loader.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(loader);
        }
        
        loader.dataset.activeRequests = (parseInt(loader.dataset.activeRequests) || 0) + 1;
        loader.style.display = 'flex';
    }
    
    // Hide loading indicator
    function hideLoadingIndicator(id) {
        const loader = document.getElementById('global-loader');
        
        if (loader) {
            const activeRequests = (parseInt(loader.dataset.activeRequests) || 1) - 1;
            loader.dataset.activeRequests = Math.max(0, activeRequests);
            
            if (activeRequests <= 0) {
                loader.style.display = 'none';
            }
        }
    }
    
    // Add loading indicator styles
    if (!document.getElementById('global-error-handler-styles')) {
        const style = document.createElement('style');
        style.id = 'global-error-handler-styles';
        style.textContent = `
            .global-loading-indicator {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 99999;
            }
            
            .global-loading-indicator .spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top-color: #ffd700;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('✅ Global error handler initialized');
})();
