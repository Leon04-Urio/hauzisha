/**
 * LOFT³ Tour Embed Library
 * JavaScript library for embedding tours in external websites
 */

(function(window, document) {
    'use strict';
    
    // Prevent multiple initialization
    if (window.LoftTourEmbed) {
        return;
    }
    
    class LoftTourEmbed {
        constructor() {
            this.baseUrl = this.detectBaseUrl();
            this.embeds = new Map();
            this.embedCounter = 0;
        }
        
        /**
         * Detect base URL from script tag
         */
        detectBaseUrl() {
            const scripts = document.getElementsByTagName('script');
            for (let script of scripts) {
                if (script.src && script.src.includes('loft-tour-embed.js')) {
                    return script.src.replace('/js/loft-tour-embed.js', '');
                }
            }
            
            // Fallback - try to detect from current domain
            return window.location.protocol + '//' + window.location.host + '/loft-tour';
        }
        
        /**
         * Create a new tour embed
         */
        create(options = {}) {
            // Validate required options
            if (!options.container) {
                throw new Error('Container element or selector is required');
            }
            
            if (!options.tourId) {
                throw new Error('Tour ID is required');
            }
            
            // Get container element
            const container = typeof options.container === 'string' 
                ? document.querySelector(options.container)
                : options.container;
                
            if (!container) {
                throw new Error('Container element not found');
            }
            
            // Generate unique embed ID
            const embedId = 'loft-embed-' + (++this.embedCounter);
            
            // Default options
            const config = {
                tourId: options.tourId,
                width: options.width || '100%',
                height: options.height || '600px',
                showUI: options.showUI !== false,
                autoplay: options.autoplay || false,
                allowFullscreen: options.allowFullscreen !== false,
                startNode: options.startNode || null,
                responsive: options.responsive !== false,
                loading: options.loading || 'lazy',
                onLoad: options.onLoad || null,
                onError: options.onError || null,
                onNodeChange: options.onNodeChange || null
            };
            
            // Create embed instance
            const embed = new TourEmbedInstance(embedId, container, config, this.baseUrl);
            this.embeds.set(embedId, embed);
            
            // Initialize the embed
            embed.init();
            
            return embed;
        }
        
        /**
         * Get embed instance by ID
         */
        get(embedId) {
            return this.embeds.get(embedId);
        }
        
        /**
         * Remove embed instance
         */
        remove(embedId) {
            const embed = this.embeds.get(embedId);
            if (embed) {
                embed.destroy();
                this.embeds.delete(embedId);
            }
        }
        
        /**
         * Remove all embeds
         */
        removeAll() {
            for (let [embedId, embed] of this.embeds) {
                embed.destroy();
            }
            this.embeds.clear();
        }
    }
    
    class TourEmbedInstance {
        constructor(id, container, config, baseUrl) {
            this.id = id;
            this.container = container;
            this.config = config;
            this.baseUrl = baseUrl;
            this.iframe = null;
            this.isLoaded = false;
            this.isDestroyed = false;
        }
        
        init() {
            if (this.isDestroyed) return;
            
            // Create iframe
            this.createIframe();
            
            // Setup responsive behavior if enabled
            if (this.config.responsive) {
                this.setupResponsive();
            }
            
            // Setup intersection observer for lazy loading
            if (this.config.loading === 'lazy') {
                this.setupLazyLoading();
            } else {
                this.loadTour();
            }
        }
        
        createIframe() {
            // Create wrapper for responsive behavior
            const wrapper = document.createElement('div');
            wrapper.className = 'loft-tour-embed-wrapper';
            wrapper.style.cssText = `
                position: relative;
                width: ${this.config.width};
                height: ${this.config.height};
                overflow: hidden;
                background: #000;
                border-radius: 8px;
            `;
            
            // Create iframe
            this.iframe = document.createElement('iframe');
            this.iframe.id = this.id + '-iframe';
            this.iframe.style.cssText = `
                width: 100%;
                height: 100%;
                border: none;
                display: block;
            `;
            
            // Set iframe attributes
            this.iframe.setAttribute('frameborder', '0');
            this.iframe.setAttribute('scrolling', 'no');
            this.iframe.setAttribute('title', 'LOFT³ Virtual Tour');
            
            if (this.config.allowFullscreen) {
                this.iframe.setAttribute('allowfullscreen', '');
                this.iframe.setAttribute('webkitallowfullscreen', '');
                this.iframe.setAttribute('mozallowfullscreen', '');
            }
            
            // Add loading placeholder
            const placeholder = this.createLoadingPlaceholder();
            wrapper.appendChild(placeholder);
            wrapper.appendChild(this.iframe);
            
            // Replace container content
            this.container.innerHTML = '';
            this.container.appendChild(wrapper);
            
            // Setup iframe event listeners
            this.setupIframeListeners();
        }
        
        createLoadingPlaceholder() {
            const placeholder = document.createElement('div');
            placeholder.className = 'loft-tour-loading-placeholder';
            placeholder.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                z-index: 1;
                transition: opacity 0.3s ease;
            `;
            
            placeholder.innerHTML = `
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-top: 3px solid #d4af37;
                    border-radius: 50%;
                    animation: loft-spin 1s linear infinite;
                    margin-bottom: 16px;
                "></div>
                <p style="
                    margin: 0;
                    font-size: 16px;
                    font-weight: 500;
                    opacity: 0.9;
                ">Loading Virtual Tour...</p>
                <style>
                    @keyframes loft-spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            
            return placeholder;
        }
        
        setupResponsive() {
            if (!this.config.responsive) return;
            
            const wrapper = this.container.querySelector('.loft-tour-embed-wrapper');
            
            // Convert to responsive aspect ratio container
            wrapper.style.cssText = `
                position: relative;
                width: 100%;
                height: 0;
                padding-bottom: 56.25%; /* 16:9 aspect ratio */
                overflow: hidden;
                background: #000;
                border-radius: 8px;
            `;
            
            this.iframe.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
                display: block;
            `;
        }
        
        setupLazyLoading() {
            if (!('IntersectionObserver' in window)) {
                // Fallback for browsers without IntersectionObserver
                this.loadTour();
                return;
            }
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.isLoaded) {
                        this.loadTour();
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });
            
            observer.observe(this.container);
        }
        
        loadTour() {
            if (this.isLoaded || this.isDestroyed) return;
            
            // Build embed URL
            const embedUrl = this.buildEmbedUrl();
            
            // Set iframe source
            this.iframe.src = embedUrl;
            this.isLoaded = true;
        }
        
        buildEmbedUrl() {
            const params = new URLSearchParams();
            params.set('tour', this.config.tourId);
            
            if (!this.config.showUI) {
                params.set('ui', '0');
            }
            
            if (this.config.autoplay) {
                params.set('autoplay', '1');
            }
            
            if (this.config.startNode) {
                params.set('start', this.config.startNode);
            }
            
            return `${this.baseUrl}/embed.html?${params.toString()}`;
        }
        
        setupIframeListeners() {
            // Listen for iframe load events
            this.iframe.addEventListener('load', () => {
                this.onIframeLoad();
            });
            
            this.iframe.addEventListener('error', () => {
                this.onIframeError();
            });
            
            // Listen for messages from iframe
            window.addEventListener('message', (event) => {
                this.handleIframeMessage(event);
            });
        }
        
        onIframeLoad() {
            // Hide loading placeholder
            const placeholder = this.container.querySelector('.loft-tour-loading-placeholder');
            if (placeholder) {
                placeholder.style.opacity = '0';
                setTimeout(() => {
                    if (placeholder.parentNode) {
                        placeholder.parentNode.removeChild(placeholder);
                    }
                }, 300);
            }
            
            // Call onLoad callback
            if (this.config.onLoad) {
                this.config.onLoad(this);
            }
        }
        
        onIframeError() {
            // Show error state
            this.showError('Failed to load virtual tour');
            
            // Call onError callback
            if (this.config.onError) {
                this.config.onError(this, 'Failed to load iframe');
            }
        }
        
        handleIframeMessage(event) {
            // Verify origin for security
            if (!event.origin.includes(new URL(this.baseUrl).hostname)) {
                return;
            }
            
            if (event.data && event.data.embedId === this.id) {
                const { type, data } = event.data;
                
                switch (type) {
                    case 'nodeChange':
                        if (this.config.onNodeChange) {
                            this.config.onNodeChange(data);
                        }
                        break;
                    case 'tourComplete':
                        if (this.config.onComplete) {
                            this.config.onComplete(data);
                        }
                        break;
                    case 'error':
                        this.onIframeError();
                        break;
                }
            }
        }
        
        showError(message) {
            const wrapper = this.container.querySelector('.loft-tour-embed-wrapper');
            if (!wrapper) return;
            
            wrapper.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                    color: white;
                    text-align: center;
                    padding: 40px 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">
                    <div style="
                        font-size: 48px;
                        color: #ef4444;
                        margin-bottom: 16px;
                    ">⚠️</div>
                    <h3 style="
                        margin: 0 0 12px 0;
                        font-size: 20px;
                        font-weight: 600;
                    ">Tour Unavailable</h3>
                    <p style="
                        margin: 0;
                        color: #d1d5db;
                        font-size: 14px;
                        line-height: 1.5;
                    ">${message}</p>
                </div>
            `;
        }
        
        // Public API methods
        
        /**
         * Navigate to next node
         */
        nextNode() {
            this.sendMessage({ action: 'nextNode' });
        }
        
        /**
         * Navigate to previous node
         */
        previousNode() {
            this.sendMessage({ action: 'previousNode' });
        }
        
        /**
         * Navigate to specific node
         */
        goToNode(nodeId) {
            this.sendMessage({ action: 'goToNode', data: { nodeId } });
        }
        
        /**
         * Enter fullscreen mode
         */
        enterFullscreen() {
            if (this.iframe && this.iframe.requestFullscreen) {
                this.iframe.requestFullscreen();
            }
        }
        
        /**
         * Send message to iframe
         */
        sendMessage(message) {
            if (this.iframe && this.iframe.contentWindow) {
                this.iframe.contentWindow.postMessage({
                    type: 'loft-tour-control',
                    ...message
                }, '*');
            }
        }
        
        /**
         * Destroy the embed
         */
        destroy() {
            if (this.isDestroyed) return;
            
            this.isDestroyed = true;
            
            // Remove iframe
            if (this.iframe) {
                this.iframe.src = 'about:blank';
                if (this.iframe.parentNode) {
                    this.iframe.parentNode.removeChild(this.iframe);
                }
            }
            
            // Clear container
            this.container.innerHTML = '';
            
            // Remove event listeners
            window.removeEventListener('message', this.handleIframeMessage);
        }
    }
    
    // Create global instance
    window.LoftTourEmbed = new LoftTourEmbed();
    
    // Auto-initialize embeds with data attributes
    document.addEventListener('DOMContentLoaded', () => {
        const autoEmbeds = document.querySelectorAll('[data-loft-tour]');
        
        autoEmbeds.forEach(element => {
            const tourId = element.getAttribute('data-loft-tour');
            const width = element.getAttribute('data-width') || '100%';
            const height = element.getAttribute('data-height') || '600px';
            const showUI = element.getAttribute('data-show-ui') !== 'false';
            const autoplay = element.getAttribute('data-autoplay') === 'true';
            const allowFullscreen = element.getAttribute('data-allow-fullscreen') !== 'false';
            const startNode = element.getAttribute('data-start-node') || null;
            const responsive = element.getAttribute('data-responsive') !== 'false';
            const loading = element.getAttribute('data-loading') || 'lazy';
            
            if (tourId) {
                window.LoftTourEmbed.create({
                    container: element,
                    tourId: tourId,
                    width: width,
                    height: height,
                    showUI: showUI,
                    autoplay: autoplay,
                    allowFullscreen: allowFullscreen,
                    startNode: startNode,
                    responsive: responsive,
                    loading: loading
                });
            }
        });
    });
    
})(window, document);