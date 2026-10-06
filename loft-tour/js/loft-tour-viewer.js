/**
 * LOFT³ Tour Viewer - Main Application Interface
 * Integrates the hybrid rendering engine with UI controls
 */

class LoftTourViewer {
    constructor(containerId, config = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element '${containerId}' not found`);
        }
        
        // Detect mobile device
        this.isMobile = this.detectMobile();
        
        this.config = {
            autoStart: false,
            showUI: true,
            enableTransitions: true,
            mobileOptimized: this.isMobile,
            useMatterportUI: true, // Enable Matterport-style UI
            ...config
        };
        
        // Core engine
        this.engine = null;
        
        // UI components
        this.matterportUI = null;
        
        // Legacy UI elements (for fallback)
        this.ui = {
            nodeLabel: null,
            distance: null,
            progressDots: null,
            prevBtn: null,
            nextBtn: null,
            controls: null
        };
        
        // State
        this.tourData = null;
        this.isFullscreen = false;
        this.uiVisible = true;
        
        this.init();
    }
    
    /**
     * Initialize the viewer
     */
    init() {
        try {
            // Initialize the hybrid rendering engine
            this.engine = new LoftTourEngine(this.container, {
                controls: {
                    mouseViewMode: 'drag',
                    scrollZoom: false
                }
            });
            
            // Setup UI
            if (this.config.useMatterportUI && window.MatterportUI) {
                this.setupMatterportUI();
            } else {
                this.setupLegacyUI();
            }
            
            // Setup event handlers
            this.setupEventHandlers();
            
            console.log('LOFT³ Tour Viewer initialized');
            
        } catch (error) {
            console.error('Failed to initialize viewer:', error);
            this.showError('Failed to initialize 360° viewer. Please check browser compatibility.');
        }
    }
    
    /**
     * Setup Matterport-style UI
     */
    setupMatterportUI() {
        this.matterportUI = new MatterportUI(this, {
            autoHideDelay: this.isMobile ? 4000 : 3000,
            showRoomLabels: true,
            showDistanceOverlay: true,
            showProgressIndicator: true,
            enableKeyboardShortcuts: true
        });
        
        console.log('Matterport UI initialized');
    }
    
    /**
     * Setup legacy UI elements (fallback)
     */
    setupLegacyUI() {
        // Find UI elements
        this.ui.nodeLabel = document.getElementById('viewer-node-label');
        this.ui.distance = document.getElementById('viewer-distance');
        this.ui.progressDots = document.getElementById('progress-dots');
        this.ui.prevBtn = document.getElementById('prev-btn');
        this.ui.nextBtn = document.getElementById('next-btn');
        this.ui.controls = document.querySelector('.viewer-controls');
        
        // Setup auto-hide UI
        if (this.config.showUI) {
            this.setupAutoHideUI();
        }
    }
    
    /**
     * Setup auto-hide UI functionality with mobile optimizations
     */
    setupAutoHideUI() {
        let hideTimeout;
        let isUIVisible = true;
        
        const showUI = () => {
            if (!isUIVisible) {
                isUIVisible = true;
                document.body.classList.remove('viewer-ui-hidden');
            }
            
            if (this.ui.controls) {
                this.ui.controls.style.opacity = '1';
                this.ui.controls.style.transform = 'translateX(-50%) translateY(0)';
            }
            
            const header = document.querySelector('.viewer-header');
            if (header) {
                header.style.opacity = '1';
                header.style.transform = 'translateY(0)';
            }
            
            clearTimeout(hideTimeout);
            
            // Longer timeout on mobile for better usability
            const timeout = this.isMobile ? 4000 : 3000;
            hideTimeout = setTimeout(hideUI, timeout);
        };
        
        const hideUI = () => {
            if (isUIVisible) {
                isUIVisible = false;
                document.body.classList.add('viewer-ui-hidden');
            }
            
            if (this.ui.controls && this.uiVisible) {
                this.ui.controls.style.opacity = '0';
                this.ui.controls.style.transform = 'translateX(-50%) translateY(20px)';
            }
            
            const header = document.querySelector('.viewer-header');
            if (header && this.uiVisible) {
                header.style.opacity = '0';
                header.style.transform = 'translateY(-20px)';
            }
        };
        
        // Show UI on various interactions
        this.container.addEventListener('mousemove', showUI);
        this.container.addEventListener('touchstart', showUI);
        this.container.addEventListener('click', showUI);
        
        // Mobile-specific: show UI on device orientation change
        if (this.isMobile) {
            window.addEventListener('orientationchange', () => {
                setTimeout(showUI, 100);
            });
        }
        
        // Initial show
        showUI();
        
        // Store references for external access
        this.showUI = showUI;
        this.hideUI = hideUI;
    }
    
    /**
     * Detect if device is mobile
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ||
               window.innerWidth <= 768;
    }
    
    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Engine events
        if (this.engine) {
            this.engine.onNodeChange = (node, index) => {
                this.updateUI(node, index);
            };
        }
        
        // Navigation buttons
        if (this.ui.prevBtn) {
            this.ui.prevBtn.addEventListener('click', () => this.previousNode());
        }
        
        if (this.ui.nextBtn) {
            this.ui.nextBtn.addEventListener('click', () => this.nextNode());
        }
        
        // Keyboard navigation with enhanced fullscreen support
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'ArrowLeft':
                    this.previousNode();
                    event.preventDefault();
                    break;
                case 'ArrowRight':
                case 'Space':
                    this.nextNode();
                    event.preventDefault();
                    break;
                case 'Escape':
                    if (this.isFullscreen) {
                        this.exitFullscreen();
                    }
                    event.preventDefault();
                    break;
                case 'KeyF':
                    // Toggle fullscreen with F key
                    this.toggleFullscreen();
                    event.preventDefault();
                    break;
                case 'F11':
                    // Prevent default F11 behavior and use our fullscreen
                    event.preventDefault();
                    this.toggleFullscreen();
                    break;
            }
        });
        
        // Enhanced fullscreen events with better browser compatibility
        const fullscreenEvents = [
            'fullscreenchange',
            'webkitfullscreenchange',
            'mozfullscreenchange',
            'MSFullscreenChange'
        ];
        
        fullscreenEvents.forEach(eventName => {
            document.addEventListener(eventName, () => {
                // Check fullscreen state with cross-browser compatibility
                this.isFullscreen = !!(
                    document.fullscreenElement ||
                    document.webkitFullscreenElement ||
                    document.mozFullScreenElement ||
                    document.msFullscreenElement
                );
                
                this.updateFullscreenButton();
                this.handleFullscreenChange();
            });
        });
        
        // Handle orientation change in fullscreen
        window.addEventListener('orientationchange', () => {
            if (this.isFullscreen) {
                setTimeout(() => {
                    this.handleFullscreenResize();
                }, 100);
            }
        });
        
        // Handle window resize in fullscreen
        window.addEventListener('resize', () => {
            if (this.isFullscreen) {
                this.handleFullscreenResize();
            }
        });
    }
    
    /**
     * Load and start tour
     */
    async loadTour(tourData) {
        try {
            this.tourData = tourData;
            
            if (!this.engine) {
                throw new Error('Engine not initialized');
            }
            
            // Load tour in engine
            await this.engine.loadTour(tourData);
            
            // Update UI
            if (this.matterportUI) {
                this.matterportUI.loadTour(tourData);
            } else {
                this.createProgressDots();
                this.updateUI(tourData.nodes[0], 0);
            }
            
            console.log('Tour loaded in viewer');
            
        } catch (error) {
            console.error('Failed to load tour:', error);
            this.showError('Failed to load tour data.');
        }
    }
    
    /**
     * Navigate to next node
     */
    async nextNode() {
        if (this.engine) {
            await this.engine.nextNode();
        }
    }
    
    /**
     * Navigate to previous node
     */
    async previousNode() {
        if (this.engine) {
            await this.engine.previousNode();
        }
    }
    
    /**
     * Navigate to specific node by index
     */
    async goToNode(index) {
        if (!this.tourData || !this.engine) return;
        
        if (index >= 0 && index < this.tourData.nodes.length) {
            const node = this.tourData.nodes[index];
            await this.engine.transitionTo(node, index);
        }
    }
    
    /**
     * Update UI elements
     */
    updateUI(node, index) {
        // Update Matterport UI if available
        if (this.matterportUI) {
            this.matterportUI.updateRoomInfo(node, index);
            return;
        }
        
        // Fallback to legacy UI
        // Update node label
        if (this.ui.nodeLabel && node) {
            this.ui.nodeLabel.textContent = node.label || node.id || `Node ${index + 1}`;
        }
        
        // Update distance indicator
        if (this.ui.distance && this.tourData) {
            const distance = this.calculateDistance(index);
            this.ui.distance.textContent = distance;
        }
        
        // Update navigation buttons
        this.updateNavigationButtons(index);
        
        // Update progress dots
        this.updateProgressDots(index);
    }
    
    /**
     * Calculate distance from entrance
     */
    calculateDistance(nodeIndex) {
        if (!this.tourData) return '';
        
        const totalNodes = this.tourData.nodes.length;
        const progress = ((nodeIndex + 1) / totalNodes * 100).toFixed(0);
        
        return `${nodeIndex + 1} of ${totalNodes} (${progress}%)`;
    }
    
    /**
     * Update navigation button states
     */
    updateNavigationButtons(index) {
        if (!this.tourData) return;
        
        const isFirst = index === 0;
        const isLast = index === this.tourData.nodes.length - 1;
        
        if (this.ui.prevBtn) {
            this.ui.prevBtn.disabled = isFirst;
            this.ui.prevBtn.style.opacity = isFirst ? '0.5' : '1';
        }
        
        if (this.ui.nextBtn) {
            this.ui.nextBtn.disabled = isLast;
            this.ui.nextBtn.style.opacity = isLast ? '0.5' : '1';
        }
    }
    
    /**
     * Create progress dots
     */
    createProgressDots() {
        if (!this.ui.progressDots || !this.tourData) return;
        
        this.ui.progressDots.innerHTML = '';
        
        this.tourData.nodes.forEach((node, index) => {
            const dot = document.createElement('button');
            dot.className = 'progress-dot';
            dot.title = node.label || `Node ${index + 1}`;
            dot.addEventListener('click', () => this.goToNode(index));
            
            this.ui.progressDots.appendChild(dot);
        });
    }
    
    /**
     * Update progress dots
     */
    updateProgressDots(activeIndex) {
        if (!this.ui.progressDots) return;
        
        const dots = this.ui.progressDots.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }
    
    /**
     * Toggle fullscreen mode with enhanced features
     */
    async toggleFullscreen() {
        try {
            const container = this.container;
            
            if (!this.isFullscreen) {
                // Show entering animation
                container.classList.add('fullscreen-entering');
                
                // Request fullscreen with different methods for browser compatibility
                if (container.requestFullscreen) {
                    await container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    await container.webkitRequestFullscreen();
                } else if (container.mozRequestFullScreen) {
                    await container.mozRequestFullScreen();
                } else if (container.msRequestFullscreen) {
                    await container.msRequestFullscreen();
                }
                
                // Show fullscreen notification
                this.showFullscreenNotification('Press ESC to exit fullscreen', 'expand');
                
                // Remove animation class after transition
                setTimeout(() => {
                    container.classList.remove('fullscreen-entering');
                }, 300);
                
            } else {
                // Show exiting animation
                container.classList.add('fullscreen-exiting');
                
                // Exit fullscreen with different methods for browser compatibility
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    await document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    await document.msExitFullscreen();
                }
                
                // Show exit notification
                this.showFullscreenNotification('Exited fullscreen mode', 'compress');
                
                // Remove animation class after transition
                setTimeout(() => {
                    container.classList.remove('fullscreen-exiting');
                }, 300);
            }
            
            // Trigger resize event for proper canvas adjustment
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                if (this.engine && this.engine.handleResize) {
                    this.engine.handleResize();
                }
            }, 100);
            
        } catch (error) {
            console.error('Fullscreen toggle failed:', error);
            this.showFullscreenNotification('Fullscreen not supported', 'exclamation-triangle');
        }
    }
    
    /**
     * Exit fullscreen mode
     */
    async exitFullscreen() {
        if (this.isFullscreen) {
            try {
                await document.exitFullscreen();
            } catch (error) {
                console.error('Exit fullscreen failed:', error);
            }
        }
    }
    
    /**
     * Update fullscreen button with enhanced states
     */
    updateFullscreenButton() {
        const fullscreenBtn = document.querySelector('[onclick="toggleFullscreen()"]');
        if (fullscreenBtn) {
            const icon = fullscreenBtn.querySelector('i');
            if (icon) {
                // Update icon based on fullscreen state
                if (this.isFullscreen) {
                    icon.className = 'fas fa-compress';
                    fullscreenBtn.classList.add('fullscreen-active');
                    fullscreenBtn.title = 'Exit fullscreen (ESC)';
                } else {
                    icon.className = 'fas fa-expand';
                    fullscreenBtn.classList.remove('fullscreen-active');
                    fullscreenBtn.title = 'Enter fullscreen (F)';
                }
            }
            
            // Add enhanced button class if not present
            if (!fullscreenBtn.classList.contains('fullscreen-btn')) {
                fullscreenBtn.classList.add('fullscreen-btn');
            }
        }
    }
    
    /**
     * Show fullscreen notification
     */
    showFullscreenNotification(message, iconType = 'info-circle') {
        // Remove existing notification
        const existingNotification = document.querySelector('.fullscreen-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fullscreen-notification';
        notification.innerHTML = `
            <i class="fas fa-${iconType}"></i>
            ${message}
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * Handle fullscreen state changes
     */
    handleFullscreenChange() {
        // Update UI for fullscreen mode
        if (this.isFullscreen) {
            document.body.classList.add('fullscreen-mode');
            
            // Adjust UI elements for fullscreen
            if (this.matterportUI) {
                this.matterportUI.handleFullscreenEnter();
            }
            
            // Auto-hide UI more aggressively in fullscreen
            if (this.showUI && this.hideUI) {
                this.hideUI();
                setTimeout(() => {
                    if (this.isFullscreen) {
                        this.showUI();
                    }
                }, 1000);
            }
            
        } else {
            document.body.classList.remove('fullscreen-mode');
            
            // Restore normal UI
            if (this.matterportUI) {
                this.matterportUI.handleFullscreenExit();
            }
            
            // Show UI when exiting fullscreen
            if (this.showUI) {
                this.showUI();
            }
        }
        
        // Trigger engine resize if available
        if (this.engine && this.engine.handleResize) {
            setTimeout(() => {
                this.engine.handleResize();
            }, 100);
        }
    }
    
    /**
     * Handle fullscreen resize events
     */
    handleFullscreenResize() {
        if (this.engine && this.engine.handleResize) {
            this.engine.handleResize();
        }
        
        // Update canvas dimensions
        const canvas = document.getElementById('viewer-canvas');
        if (canvas && this.isFullscreen) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        // Update Matterport UI if available
        if (this.matterportUI && this.matterportUI.handleResize) {
            this.matterportUI.handleResize();
        }
    }
    
    /**
     * Toggle UI visibility
     */
    toggleUI() {
        if (this.matterportUI) {
            this.matterportUI.toggleUI();
            return;
        }
        
        // Fallback to legacy UI
        this.uiVisible = !this.uiVisible;
        
        const uiElements = document.querySelectorAll('.viewer-header, .viewer-controls');
        uiElements.forEach(element => {
            element.style.display = this.uiVisible ? 'flex' : 'none';
        });
        
        console.log('UI', this.uiVisible ? 'shown' : 'hidden');
    }
    
    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'viewer-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()">Reload Page</button>
            </div>
        `;
        
        this.container.appendChild(errorDiv);
    }
    
    /**
     * Get viewer statistics
     */
    getStats() {
        return {
            tourLoaded: !!this.tourData,
            nodeCount: this.tourData?.nodes?.length || 0,
            currentNode: this.engine?.currentNodeIndex || 0,
            isFullscreen: this.isFullscreen,
            uiVisible: this.uiVisible,
            engineStats: this.engine?.logPerformanceStats ? this.engine.getStats() : null
        };
    }
    
    /**
     * Cleanup and destroy viewer
     */
    destroy() {
        if (this.matterportUI) {
            this.matterportUI.destroy();
        }
        
        if (this.engine) {
            this.engine.destroy();
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
        
        console.log('LOFT³ Tour Viewer destroyed');
    }
}

// Global functions for HTML onclick handlers
window.toggleFullscreen = function() {
    if (window.loftViewer) {
        window.loftViewer.toggleFullscreen();
    }
};

window.toggleUI = function() {
    if (window.loftViewer) {
        window.loftViewer.toggleUI();
    }
};

window.nextNode = function() {
    if (window.loftViewer) {
        window.loftViewer.nextNode();
    }
};

window.previousNode = function() {
    if (window.loftViewer) {
        window.loftViewer.previousNode();
    }
};

window.exitViewer = function() {
    // Implementation depends on your app structure
    console.log('Exit viewer requested');
};

window.shareTour = function() {
    // Use the sharing system if available
    if (window.loftTourSharing) {
        window.loftTourSharing.showShareModal();
    } else {
        // Fallback implementation
        console.log('Share tour requested - sharing system not available');
        
        if (navigator.share) {
            navigator.share({
                title: 'Virtual Tour',
                text: 'Check out this amazing virtual tour!',
                url: window.location.href
            });
        } else {
            // Copy URL to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('Tour link copied to clipboard!');
            }).catch(() => {
                prompt('Copy this link to share:', window.location.href);
            });
        }
    }
};

// Export for use in other modules
window.LoftTourViewer = LoftTourViewer;