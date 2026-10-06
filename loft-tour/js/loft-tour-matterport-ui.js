/**
 * LOFT³ Matterport-Style UI Component
 * Minimal, modern interface with auto-hiding elements
 */

class MatterportUI {
    constructor(viewer, config = {}) {
        this.viewer = viewer;
        this.config = {
            autoHideDelay: 3000,
            fadeTransition: 300,
            showRoomLabels: true,
            showDistanceOverlay: true,
            showProgressIndicator: true,
            enableKeyboardShortcuts: true,
            ...config
        };
        
        this.isUIVisible = true;
        this.hideTimeout = null;
        this.currentNode = null;
        this.tourData = null;
        
        this.init();
    }
    
    init() {
        this.createMatterportUI();
        this.setupEventHandlers();
        this.setupAutoHide();
        console.log('Matterport-style UI initialized');
    }
    
    /**
     * Create the Matterport-style UI elements
     */
    createMatterportUI() {
        const container = this.viewer.container;
        
        // Remove existing UI elements
        this.removeExistingUI();
        
        // Create main UI container
        const uiContainer = document.createElement('div');
        uiContainer.className = 'matterport-ui';
        uiContainer.innerHTML = `
            <!-- Top Bar with Room Info -->
            <div class="matterport-top-bar">
                <div class="room-info">
                    <div class="room-label" id="matterport-room-label">Loading...</div>
                    <div class="room-subtitle" id="matterport-room-subtitle">Preparing tour</div>
                    <div class="floor-label" id="matterport-floor-label"></div>
                </div>
                <div class="tour-actions">
                    <button class="ui-btn" id="matterport-share-btn" title="Share Tour">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="ui-btn" id="matterport-fullscreen-btn" title="Fullscreen">
                        <i class="fas fa-expand"></i>
                    </button>
                    <button class="ui-btn" id="matterport-close-btn" title="Exit Tour">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <!-- Distance Overlay -->
            <div class="distance-overlay" id="matterport-distance">
                <div class="distance-content">
                    <div class="distance-icon">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="distance-info">
                        <div class="distance-text">From entrance</div>
                        <div class="distance-value" id="distance-value">0m</div>
                    </div>
                </div>
            </div>
            
            <!-- Progress Indicator -->
            <div class="progress-indicator" id="matterport-progress">
                <div class="progress-track">
                    <div class="progress-fill" id="progress-fill"></div>
                </div>
                <div class="progress-text">
                    <span id="progress-current">1</span> of <span id="progress-total">1</span>
                </div>
            </div>
            
            <!-- Navigation Controls -->
            <div class="matterport-navigation">
                <button class="nav-control nav-prev" id="matterport-prev" title="Previous Room">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="nav-dots" id="matterport-dots"></div>
                <button class="nav-control nav-next" id="matterport-next" title="Next Room">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            
            <!-- Room Labels Overlay -->
            <div class="room-labels-overlay" id="room-labels-overlay"></div>
            
            <!-- UI Toggle -->
            <div class="ui-toggle-container">
                <button class="ui-toggle" id="matterport-ui-toggle" title="Toggle UI">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
            
            <!-- Loading Overlay -->
            <div class="matterport-loading" id="matterport-loading">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Loading room...</div>
                </div>
            </div>
        `;
        
        container.appendChild(uiContainer);
        
        // Store UI element references
        this.ui = {
            container: uiContainer,
            topBar: uiContainer.querySelector('.matterport-top-bar'),
            roomLabel: document.getElementById('matterport-room-label'),
            roomSubtitle: document.getElementById('matterport-room-subtitle'),
            floorLabel: document.getElementById('matterport-floor-label'),
            distanceOverlay: document.getElementById('matterport-distance'),
            distanceValue: document.getElementById('distance-value'),
            progressIndicator: document.getElementById('matterport-progress'),
            progressFill: document.getElementById('progress-fill'),
            progressCurrent: document.getElementById('progress-current'),
            progressTotal: document.getElementById('progress-total'),
            navigation: uiContainer.querySelector('.matterport-navigation'),
            prevBtn: document.getElementById('matterport-prev'),
            nextBtn: document.getElementById('matterport-next'),
            dots: document.getElementById('matterport-dots'),
            roomLabelsOverlay: document.getElementById('room-labels-overlay'),
            uiToggle: document.getElementById('matterport-ui-toggle'),
            shareBtn: document.getElementById('matterport-share-btn'),
            fullscreenBtn: document.getElementById('matterport-fullscreen-btn'),
            closeBtn: document.getElementById('matterport-close-btn'),
            loading: document.getElementById('matterport-loading')
        };
    }
    
    /**
     * Remove existing UI elements
     */
    removeExistingUI() {
        const existingUI = this.viewer.container.querySelector('.matterport-ui');
        if (existingUI) {
            existingUI.remove();
        }
    }
    
    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Navigation
        this.ui.prevBtn.addEventListener('click', () => this.previousRoom());
        this.ui.nextBtn.addEventListener('click', () => this.nextRoom());
        
        // UI controls
        this.ui.uiToggle.addEventListener('click', () => this.toggleUI());
        this.ui.shareBtn.addEventListener('click', () => this.shareTour());
        this.ui.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.ui.closeBtn.addEventListener('click', () => this.exitTour());
        
        // Keyboard shortcuts
        if (this.config.enableKeyboardShortcuts) {
            document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        }
        
        // Enhanced touch/mouse interactions for auto-hide
        const container = this.viewer.container;
        
        // Show UI on various interactions
        container.addEventListener('mousemove', () => this.showUI());
        container.addEventListener('touchstart', () => this.showUI());
        container.addEventListener('click', () => this.showUI());
        container.addEventListener('wheel', () => this.showUI());
        
        // Show UI on room label interactions
        container.addEventListener('mouseenter', (e) => {
            if (e.target.closest('.room-label-marker')) {
                this.showUI();
            }
        });
        
        // Mobile-specific: show UI on device orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.showUI(), 100);
        });
        
        // Show UI when window regains focus
        window.addEventListener('focus', () => this.showUI());
        
        // Fullscreen change
        document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());
        
        // Enhanced room label hover effects
        this.setupRoomLabelInteractions();
    }
    
    /**
     * Setup enhanced room label interactions
     */
    setupRoomLabelInteractions() {
        // Use event delegation for dynamic room labels
        this.ui.roomLabelsOverlay.addEventListener('mouseenter', (e) => {
            const marker = e.target.closest('.room-label-marker');
            if (marker) {
                marker.classList.add('label-highlight');
                this.showUI(); // Show UI when hovering over labels
            }
        });
        
        this.ui.roomLabelsOverlay.addEventListener('mouseleave', (e) => {
            const marker = e.target.closest('.room-label-marker');
            if (marker) {
                marker.classList.remove('label-highlight');
            }
        });
        
        // Touch interactions for mobile
        this.ui.roomLabelsOverlay.addEventListener('touchstart', (e) => {
            const marker = e.target.closest('.room-label-marker');
            if (marker) {
                this.showUI();
                // Prevent default to avoid triggering other touch events
                e.preventDefault();
            }
        });
    }
    
    /**
     * Setup auto-hide functionality
     */
    setupAutoHide() {
        this.showUI();
        
        // Enhanced auto-hide with room label management
        this.setupRoomLabelFading();
    }
    
    /**
     * Setup room label fading functionality
     */
    setupRoomLabelFading() {
        // Track room label visibility state
        this.roomLabelsVisible = true;
        
        // Enhanced room label fade timing
        this.roomLabelFadeDelay = 2000; // Show labels for 2 seconds after UI interaction
        this.roomLabelFadeTimeout = null;
        
        // Setup room label auto-fade
        this.scheduleRoomLabelFade();
    }
    
    /**
     * Show UI with fade-in animation
     */
    showUI() {
        if (!this.isUIVisible) {
            this.isUIVisible = true;
            this.ui.container.classList.remove('ui-hidden');
            this.ui.container.classList.add('ui-visible');
        }
        
        // Show room labels when UI is shown
        this.showRoomLabelsVisibility();
        
        // Clear existing timeout
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        
        // Set new timeout
        this.hideTimeout = setTimeout(() => {
            this.hideUI();
        }, this.config.autoHideDelay);
    }
    
    /**
     * Hide UI with fade-out animation
     */
    hideUI() {
        if (this.isUIVisible) {
            this.isUIVisible = false;
            this.ui.container.classList.remove('ui-visible');
            this.ui.container.classList.add('ui-hidden');
        }
        
        // Schedule room labels to fade after a delay
        this.scheduleRoomLabelFade();
    }
    
    /**
     * Show room labels with fade-in animation
     */
    showRoomLabelsVisibility() {
        if (!this.roomLabelsVisible) {
            this.roomLabelsVisible = true;
            if (this.ui.roomLabelsOverlay) {
                this.ui.roomLabelsOverlay.classList.remove('labels-hidden');
                this.ui.roomLabelsOverlay.classList.add('labels-visible');
            }
        }
        
        // Clear room label fade timeout
        if (this.roomLabelFadeTimeout) {
            clearTimeout(this.roomLabelFadeTimeout);
        }
    }
    
    /**
     * Hide room labels with fade-out animation
     */
    hideRoomLabels() {
        if (this.roomLabelsVisible) {
            this.roomLabelsVisible = false;
            if (this.ui.roomLabelsOverlay) {
                this.ui.roomLabelsOverlay.classList.remove('labels-visible');
                this.ui.roomLabelsOverlay.classList.add('labels-hidden');
            }
        }
    }
    
    /**
     * Schedule room labels to fade out
     */
    scheduleRoomLabelFade() {
        // Clear existing timeout
        if (this.roomLabelFadeTimeout) {
            clearTimeout(this.roomLabelFadeTimeout);
        }
        
        // Set timeout to fade room labels
        this.roomLabelFadeTimeout = setTimeout(() => {
            this.hideRoomLabels();
        }, this.roomLabelFadeDelay);
    }
    
    /**
     * Toggle UI visibility
     */
    toggleUI() {
        if (this.isUIVisible) {
            this.hideUI();
            // Clear timeout to prevent auto-show
            if (this.hideTimeout) {
                clearTimeout(this.hideTimeout);
            }
        } else {
            this.showUI();
        }
    }
    
    /**
     * Load tour data and update UI
     */
    loadTour(tourData) {
        this.tourData = tourData;
        this.createNavigationDots();
        this.updateProgress();
        this.hideLoading();
        
        if (tourData.nodes && tourData.nodes.length > 0) {
            this.updateRoomInfo(tourData.nodes[0], 0);
        }
    }
    
    /**
     * Update room information
     */
    updateRoomInfo(node, index) {
        this.currentNode = node;
        
        // Update room label with fade effect
        if (this.ui.roomLabel) {
            this.ui.roomLabel.style.opacity = '0';
            setTimeout(() => {
                this.ui.roomLabel.textContent = node.label || node.id || `Room ${index + 1}`;
                this.ui.roomLabel.style.opacity = '1';
            }, 150);
        }
        
        // Update subtitle with room type or description
        if (this.ui.roomSubtitle) {
            const subtitle = node.description || node.type || 'Virtual Tour';
            this.ui.roomSubtitle.style.opacity = '0';
            setTimeout(() => {
                this.ui.roomSubtitle.textContent = subtitle;
                this.ui.roomSubtitle.style.opacity = '1';
            }, 200);
        }
        
        // Update floor label if available
        if (this.ui.floorLabel) {
            const floorInfo = node.floor || this.getFloorFromIndex(index);
            if (floorInfo) {
                this.ui.floorLabel.style.opacity = '0';
                setTimeout(() => {
                    this.ui.floorLabel.textContent = floorInfo;
                    this.ui.floorLabel.style.opacity = '1';
                }, 250);
            } else {
                this.ui.floorLabel.textContent = '';
            }
        }
        
        // Update distance
        this.updateDistance(index);
        
        // Update progress
        this.updateProgress(index);
        
        // Update navigation
        this.updateNavigation(index);
        
        // Show room labels if enabled
        if (this.config.showRoomLabels) {
            this.showRoomLabels(node);
        }
        
        // Show UI briefly when room changes
        this.showUI();
    }
    
    /**
     * Get floor information from node index (fallback)
     */
    getFloorFromIndex(index) {
        if (!this.tourData || !this.tourData.nodes) return null;
        
        const totalNodes = this.tourData.nodes.length;
        
        // Simple floor detection based on node position
        if (totalNodes <= 3) return null; // Too few nodes to determine floors
        
        const floorSize = Math.ceil(totalNodes / 2); // Assume max 2 floors
        const floor = Math.floor(index / floorSize) + 1;
        
        return floor > 1 ? `Floor ${floor}` : 'Ground Floor';
    }
    
    /**
     * Update distance from entrance
     */
    updateDistance(index) {
        if (!this.ui.distanceValue || !this.tourData) return;
        
        // Calculate more accurate distance based on node metadata
        const distance = this.calculateDistanceFromEntrance(index);
        this.ui.distanceValue.textContent = distance;
        
        // Update distance icon based on distance
        this.updateDistanceIcon(index);
    }
    
    /**
     * Calculate accurate distance from entrance
     */
    calculateDistanceFromEntrance(index) {
        if (!this.tourData || !this.tourData.nodes) return '0m';
        
        const node = this.tourData.nodes[index];
        
        // Use node-specific distance if available
        if (node.distanceFromEntrance !== undefined) {
            return `${node.distanceFromEntrance}m`;
        }
        
        // Use cumulative distance calculation if nodes have distance data
        if (this.tourData.nodes.some(n => n.distance !== undefined)) {
            let totalDistance = 0;
            for (let i = 0; i <= index; i++) {
                const currentNode = this.tourData.nodes[i];
                if (currentNode.distance !== undefined) {
                    totalDistance += currentNode.distance;
                }
            }
            return `${Math.round(totalDistance)}m`;
        }
        
        // Enhanced approximation based on node type and position
        const nodeTypes = {
            'entrance': 0,
            'gate': 0,
            'lobby': 2,
            'hallway': 3,
            'corridor': 3,
            'living': 8,
            'kitchen': 12,
            'bedroom': 15,
            'bathroom': 18,
            'balcony': 25,
            'garden': 30,
            'garage': 35
        };
        
        // Try to determine distance based on node type
        if (node.type && nodeTypes[node.type.toLowerCase()]) {
            return `${nodeTypes[node.type.toLowerCase()]}m`;
        }
        
        // Try to determine distance based on label keywords
        if (node.label) {
            const label = node.label.toLowerCase();
            for (const [type, distance] of Object.entries(nodeTypes)) {
                if (label.includes(type)) {
                    return `${distance}m`;
                }
            }
        }
        
        // Fallback: progressive distance calculation
        const baseDistance = 5; // 5m per room
        const progressiveDistance = index * baseDistance + (index > 3 ? (index - 3) * 2 : 0);
        return `${progressiveDistance}m`;
    }
    
    /**
     * Update distance icon based on current position
     */
    updateDistanceIcon(index) {
        const distanceIcon = this.ui.distanceOverlay?.querySelector('.distance-icon');
        const distanceIconElement = distanceIcon?.querySelector('i');
        const distanceValue = this.ui.distanceValue;
        
        if (!distanceIcon || !distanceIconElement || !this.tourData) return;
        
        const totalNodes = this.tourData.nodes.length;
        const progress = index / (totalNodes - 1);
        
        // Remove existing state classes
        distanceIcon.classList.remove('entrance', 'middle', 'end');
        distanceValue?.classList.remove('near', 'medium', 'far');
        
        // Change icon and styling based on progress through tour
        if (progress === 0) {
            distanceIconElement.className = 'fas fa-door-open'; // Entrance
            distanceIcon.classList.add('entrance');
            distanceValue?.classList.add('near');
        } else if (progress < 0.3) {
            distanceIconElement.className = 'fas fa-map-marker-alt'; // Early tour
            distanceIcon.classList.add('entrance');
            distanceValue?.classList.add('near');
        } else if (progress < 0.7) {
            distanceIconElement.className = 'fas fa-home'; // Middle of tour
            distanceIcon.classList.add('middle');
            distanceValue?.classList.add('medium');
        } else if (progress < 0.9) {
            distanceIconElement.className = 'fas fa-map-marked-alt'; // Near end
            distanceIcon.classList.add('middle');
            distanceValue?.classList.add('far');
        } else {
            distanceIconElement.className = 'fas fa-flag-checkered'; // End of tour
            distanceIcon.classList.add('end');
            distanceValue?.classList.add('far');
        }
    }
    
    /**
     * Update progress indicator
     */
    updateProgress(index = 0) {
        if (!this.tourData) return;
        
        const total = this.tourData.nodes.length;
        const current = index + 1;
        const percentage = (current / total) * 100;
        
        // Update progress bar with smooth animation
        if (this.ui.progressFill) {
            this.ui.progressFill.style.width = `${percentage}%`;
            
            // Add visual feedback for progress milestones
            this.updateProgressMilestones(percentage);
        }
        
        // Update progress text with enhanced information
        if (this.ui.progressCurrent) {
            this.ui.progressCurrent.textContent = current;
        }
        if (this.ui.progressTotal) {
            this.ui.progressTotal.textContent = total;
        }
        
        // Update progress text with completion status
        const progressText = this.ui.progressIndicator?.querySelector('.progress-text');
        if (progressText) {
            if (percentage === 100) {
                progressText.innerHTML = '<span style="color: var(--success);">Tour Complete!</span>';
            } else if (percentage >= 75) {
                progressText.innerHTML = `<span id="progress-current">${current}</span> of <span id="progress-total">${total}</span> - Almost done!`;
            } else if (percentage >= 50) {
                progressText.innerHTML = `<span id="progress-current">${current}</span> of <span id="progress-total">${total}</span> - Halfway there`;
            } else {
                progressText.innerHTML = `<span id="progress-current">${current}</span> of <span id="progress-total">${total}</span>`;
            }
        }
        
        // Update estimated time remaining
        this.updateTimeEstimate(index);
    }
    
    /**
     * Update progress milestones visual feedback
     */
    updateProgressMilestones(percentage) {
        const progressFill = this.ui.progressFill;
        if (!progressFill) return;
        
        // Remove existing milestone classes
        progressFill.classList.remove('progress-quarter', 'progress-half', 'progress-three-quarter', 'progress-complete');
        
        // Add milestone classes for visual feedback
        if (percentage >= 100) {
            progressFill.classList.add('progress-complete');
            progressFill.style.background = 'linear-gradient(90deg, var(--success), #059669)';
        } else if (percentage >= 75) {
            progressFill.classList.add('progress-three-quarter');
            progressFill.style.background = 'linear-gradient(90deg, var(--primary), #f59e0b)';
        } else if (percentage >= 50) {
            progressFill.classList.add('progress-half');
            progressFill.style.background = 'linear-gradient(90deg, var(--primary), var(--primary-dark))';
        } else if (percentage >= 25) {
            progressFill.classList.add('progress-quarter');
            progressFill.style.background = 'linear-gradient(90deg, var(--primary), var(--primary-dark))';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, var(--primary), var(--primary-dark))';
        }
    }
    
    /**
     * Update estimated time remaining
     */
    updateTimeEstimate(index) {
        if (!this.tourData) return;
        
        const totalNodes = this.tourData.nodes.length;
        const remainingNodes = totalNodes - index - 1;
        
        // Estimate 30 seconds per room on average
        const estimatedSecondsPerRoom = 30;
        const remainingSeconds = remainingNodes * estimatedSecondsPerRoom;
        
        // Add time estimate to progress indicator if there's space
        const progressIndicator = this.ui.progressIndicator;
        if (progressIndicator && remainingNodes > 0) {
            let timeEstimate = progressIndicator.querySelector('.time-estimate');
            if (!timeEstimate) {
                timeEstimate = document.createElement('div');
                timeEstimate.className = 'time-estimate';
                timeEstimate.style.fontSize = '10px';
                timeEstimate.style.color = 'rgba(255, 255, 255, 0.6)';
                timeEstimate.style.marginTop = '4px';
                timeEstimate.style.textAlign = 'center';
                progressIndicator.appendChild(timeEstimate);
            }
            
            if (remainingSeconds < 60) {
                timeEstimate.textContent = `~${remainingSeconds}s remaining`;
            } else {
                const minutes = Math.ceil(remainingSeconds / 60);
                timeEstimate.textContent = `~${minutes}min remaining`;
            }
        } else if (remainingNodes === 0) {
            // Remove time estimate when tour is complete
            const timeEstimate = progressIndicator?.querySelector('.time-estimate');
            if (timeEstimate) {
                timeEstimate.remove();
            }
        }
    }
    
    /**
     * Update navigation controls
     */
    updateNavigation(index) {
        if (!this.tourData) return;
        
        const isFirst = index === 0;
        const isLast = index === this.tourData.nodes.length - 1;
        
        // Update button states
        this.ui.prevBtn.disabled = isFirst;
        this.ui.nextBtn.disabled = isLast;
        
        this.ui.prevBtn.classList.toggle('disabled', isFirst);
        this.ui.nextBtn.classList.toggle('disabled', isLast);
        
        // Update dots
        this.updateNavigationDots(index);
    }
    
    /**
     * Create navigation dots
     */
    createNavigationDots() {
        if (!this.tourData || !this.ui.dots) return;
        
        this.ui.dots.innerHTML = '';
        
        this.tourData.nodes.forEach((node, index) => {
            const dot = document.createElement('button');
            dot.className = 'nav-dot';
            dot.title = node.label || `Room ${index + 1}`;
            dot.addEventListener('click', () => this.goToRoom(index));
            
            this.ui.dots.appendChild(dot);
        });
    }
    
    /**
     * Update navigation dots
     */
    updateNavigationDots(activeIndex) {
        if (!this.ui.dots) return;
        
        const dots = this.ui.dots.querySelectorAll('.nav-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    }
    
    /**
     * Show room labels overlay
     */
    showRoomLabels(node) {
        // Prevent recursion
        if (this._showingRoomLabels) return;
        this._showingRoomLabels = true;
        
        if (!this.ui.roomLabelsOverlay) {
            this._showingRoomLabels = false;
            return;
        }
        
        // Clear existing labels
        this.ui.roomLabelsOverlay.innerHTML = '';
        
        // Add room labels if they exist in node data
        if (node && node.labels && Array.isArray(node.labels)) {
            node.labels.forEach((label, index) => {
                const labelElement = document.createElement('div');
                labelElement.className = 'room-label-marker';
                labelElement.style.left = `${label.x * 100}%`;
                labelElement.style.top = `${label.y * 100}%`;
                labelElement.style.animationDelay = `${index * 0.1}s`; // Stagger animations
                labelElement.innerHTML = `
                    <div class="label-dot"></div>
                    <div class="label-text">${label.text}</div>
                `;
                
                // Add click handler for label interaction
                labelElement.addEventListener('click', () => {
                    this.onLabelClick(label, index);
                });
                
                this.ui.roomLabelsOverlay.appendChild(labelElement);
            });
        }
        
        // Ensure labels are visible when shown
        this.showRoomLabelsVisibility();
        
        this._showingRoomLabels = false;
    }
    
    /**
     * Handle label click events
     */
    onLabelClick(label, index) {
        // Show UI when label is clicked
        this.showUI();
        
        // Optional: trigger label-specific actions
        if (label.action) {
            console.log('Label action:', label.action);
        }
        
        // Show notification about the label
        this.showNotification(`Viewing: ${label.text}`, 'info');
    }
    
    /**
     * Navigation methods
     */
    async previousRoom() {
        if (this.viewer.engine) {
            await this.viewer.engine.previousNode();
        }
    }
    
    async nextRoom() {
        if (this.viewer.engine) {
            await this.viewer.engine.nextNode();
        }
    }
    
    async goToRoom(index) {
        if (this.viewer.goToNode) {
            await this.viewer.goToNode(index);
        }
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(event) {
        switch (event.code) {
            case 'ArrowLeft':
                this.previousRoom();
                event.preventDefault();
                break;
            case 'ArrowRight':
            case 'Space':
                this.nextRoom();
                event.preventDefault();
                break;
            case 'KeyH':
                this.toggleUI();
                event.preventDefault();
                break;
            case 'KeyF':
                this.toggleFullscreen();
                event.preventDefault();
                break;
            case 'Escape':
                this.exitTour();
                event.preventDefault();
                break;
        }
    }
    
    /**
     * Utility methods
     */
    async toggleFullscreen() {
        if (this.viewer.toggleFullscreen) {
            await this.viewer.toggleFullscreen();
        }
    }
    
    updateFullscreenButton() {
        const icon = this.ui.fullscreenBtn.querySelector('i');
        if (icon) {
            const isFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );
            icon.className = isFullscreen ? 'fas fa-compress' : 'fas fa-expand';
            this.ui.fullscreenBtn.title = isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen (F)';
        }
    }
    
    /**
     * Handle fullscreen enter
     */
    handleFullscreenEnter() {
        // Add fullscreen class to UI container
        const uiContainer = document.querySelector('.matterport-ui');
        if (uiContainer) {
            uiContainer.classList.add('fullscreen-mode');
        }
        
        // Adjust auto-hide timing for fullscreen
        this.config.autoHideDelay = 4000; // Longer delay in fullscreen
        
        // Update UI positioning for fullscreen
        this.updateFullscreenLayout();
        
        console.log('Matterport UI: Entered fullscreen mode');
    }
    
    /**
     * Handle fullscreen exit
     */
    handleFullscreenExit() {
        // Remove fullscreen class from UI container
        const uiContainer = document.querySelector('.matterport-ui');
        if (uiContainer) {
            uiContainer.classList.remove('fullscreen-mode');
        }
        
        // Restore normal auto-hide timing
        this.config.autoHideDelay = 3000;
        
        // Restore normal UI layout
        this.updateNormalLayout();
        
        console.log('Matterport UI: Exited fullscreen mode');
    }
    
    /**
     * Update layout for fullscreen mode
     */
    updateFullscreenLayout() {
        const topBar = document.querySelector('.matterport-top-bar');
        const navigation = document.querySelector('.matterport-navigation');
        const distanceOverlay = document.querySelector('.distance-overlay');
        const progressIndicator = document.querySelector('.progress-indicator');
        
        if (topBar) {
            topBar.style.padding = '2rem 3rem';
            topBar.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.3), transparent)';
        }
        
        if (navigation) {
            navigation.style.bottom = '4rem';
            navigation.style.gap = '3rem';
        }
        
        if (distanceOverlay) {
            distanceOverlay.style.top = '6rem';
            distanceOverlay.style.left = '3rem';
        }
        
        if (progressIndicator) {
            progressIndicator.style.bottom = '8rem';
        }
    }
    
    /**
     * Update layout for normal mode
     */
    updateNormalLayout() {
        const topBar = document.querySelector('.matterport-top-bar');
        const navigation = document.querySelector('.matterport-navigation');
        const distanceOverlay = document.querySelector('.distance-overlay');
        const progressIndicator = document.querySelector('.progress-indicator');
        
        if (topBar) {
            topBar.style.padding = '';
            topBar.style.background = '';
        }
        
        if (navigation) {
            navigation.style.bottom = '';
            navigation.style.gap = '';
        }
        
        if (distanceOverlay) {
            distanceOverlay.style.top = '';
            distanceOverlay.style.left = '';
        }
        
        if (progressIndicator) {
            progressIndicator.style.bottom = '';
        }
    }
    
    /**
     * Handle resize events
     */
    handleResize() {
        // Update UI layout based on new dimensions
        const isFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
        
        if (isFullscreen) {
            this.updateFullscreenLayout();
        } else {
            this.updateNormalLayout();
        }
        
        // Update progress indicator width
        this.updateProgressIndicator();
    }
    
    shareTour() {
        // Use the sharing system if available
        if (window.loftTourSharing) {
            window.loftTourSharing.showShareModal();
        } else {
            // Fallback implementation
            const url = window.location.href;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Virtual Tour',
                    text: 'Check out this amazing virtual tour!',
                    url: url
                });
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(url).then(() => {
                    this.showNotification('Tour link copied to clipboard!');
                }).catch(() => {
                    // Final fallback: prompt user
                    prompt('Copy this link to share:', url);
                });
            }
        }
    }
    
    exitTour() {
        // Implementation depends on your app structure
        if (window.exitViewer) {
            window.exitViewer();
        } else {
            console.log('Exit tour requested');
        }
    }
    
    showLoading() {
        if (this.ui.loading) {
            this.ui.loading.classList.add('visible');
        }
    }
    
    hideLoading() {
        if (this.ui.loading) {
            this.ui.loading.classList.remove('visible');
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `matterport-notification ${type}`;
        notification.textContent = message;
        
        this.ui.container.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        
        if (this.roomLabelFadeTimeout) {
            clearTimeout(this.roomLabelFadeTimeout);
        }
        
        if (this.ui.container) {
            this.ui.container.remove();
        }
        
        console.log('Matterport UI destroyed');
    }
}

// Export for use in other modules
window.MatterportUI = MatterportUI;