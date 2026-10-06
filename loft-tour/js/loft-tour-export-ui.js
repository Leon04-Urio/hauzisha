/**
 * LOFT³ Tour Export UI
 * User interface for creating offline packages and export options
 */

class LoftTourExportUI {
    constructor(tourEngine) {
        this.engine = tourEngine;
        this.packager = null;
        this.modal = null;
        this.isExporting = false;
        
        this.init();
    }
    
    init() {
        this.createExportModal();
        this.setupEventListeners();
        this.initializePackager();
    }
    
    async initializePackager() {
        try {
            if (typeof LoftTourOfflinePackager !== 'undefined') {
                this.packager = new LoftTourOfflinePackager();
                console.log('Offline packager initialized');
            } else {
                console.warn('LoftTourOfflinePackager not available');
            }
        } catch (error) {
            console.error('Failed to initialize offline packager:', error);
        }
    }
    
    createExportModal() {
        const modalHTML = `
            <div class="loft-export-modal" id="loft-export-modal">
                <div class="export-modal-overlay" onclick="loftTourExportUI.closeModal()"></div>
                <div class="export-modal-content">
                    <div class="export-modal-header">
                        <h2>
                            <i class="fas fa-download"></i>
                            Export Tour
                        </h2>
                        <button class="export-close-btn" onclick="loftTourExportUI.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="export-modal-body">
                        <div class="export-options">
                            <div class="export-section">
                                <h3>Package Type</h3>
                                <div class="export-option-group">
                                    <label class="export-option">
                                        <input type="radio" name="packageType" value="both" checked>
                                        <div class="option-content">
                                            <div class="option-icon">
                                                <i class="fas fa-box"></i>
                                            </div>
                                            <div class="option-details">
                                                <h4>Complete Package</h4>
                                                <p>Standalone + embeddable versions</p>
                                            </div>
                                        </div>
                                    </label>
                                    
                                    <label class="export-option">
                                        <input type="radio" name="packageType" value="standalone">
                                        <div class="option-content">
                                            <div class="option-icon">
                                                <i class="fas fa-desktop"></i>
                                            </div>
                                            <div class="option-details">
                                                <h4>Standalone Only</h4>
                                                <p>Full-featured tour for direct viewing</p>
                                            </div>
                                        </div>
                                    </label>
                                    
                                    <label class="export-option">
                                        <input type="radio" name="packageType" value="embed">
                                        <div class="option-content">
                                            <div class="option-icon">
                                                <i class="fas fa-code"></i>
                                            </div>
                                            <div class="option-details">
                                                <h4>Embed Only</h4>
                                                <p>Lightweight version for websites</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="export-section">
                                <h3>Bundle Size</h3>
                                <div class="export-option-group">
                                    <label class="export-option">
                                        <input type="radio" name="bundleSize" value="standard" checked>
                                        <div class="option-content">
                                            <div class="option-icon">
                                                <i class="fas fa-balance-scale"></i>
                                            </div>
                                            <div class="option-details">
                                                <h4>Standard</h4>
                                                <p>Full features, optimized size</p>
                                            </div>
                                        </div>
                                    </label>
                                    
                                    <label class="export-option">
                                        <input type="radio" name="bundleSize" value="minimal">
                                        <div class="option-content">
                                            <div class="option-icon">
                                                <i class="fas fa-compress-alt"></i>
                                            </div>
                                            <div class="option-details">
                                                <h4>Minimal</h4>
                                                <p>Essential features only</p>
                                            </div>
                                        </div>
                                    </label>
                                    
                                    <label class="export-option">
                                        <input type="radio" name="bundleSize" value="premium">
                                        <div class="option-content">
                                            <div class="option-icon">
                                                <i class="fas fa-star"></i>
                                            </div>
                                            <div class="option-details">
                                                <h4>Premium</h4>
                                                <p>All features + analytics</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="export-section">
                                <h3>Additional Options</h3>
                                <div class="export-checkboxes">
                                    <label class="export-checkbox">
                                        <input type="checkbox" id="includeAnalytics">
                                        <span class="checkbox-custom"></span>
                                        <span class="checkbox-label">Include Analytics Tracking</span>
                                    </label>
                                    
                                    <label class="export-checkbox">
                                        <input type="checkbox" id="optimizeImages" checked>
                                        <span class="checkbox-custom"></span>
                                        <span class="checkbox-label">Optimize Images for Size</span>
                                    </label>
                                    
                                    <label class="export-checkbox">
                                        <input type="checkbox" id="includeReadme" checked>
                                        <span class="checkbox-custom"></span>
                                        <span class="checkbox-label">Include README Instructions</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="export-section">
                                <h3>File Name</h3>
                                <div class="export-filename">
                                    <input type="text" id="exportFilename" placeholder="tour-name-offline" class="filename-input">
                                    <span class="filename-extension">.html</span>
                                </div>
                                <p class="filename-help">Leave empty to use tour name</p>
                            </div>
                        </div>
                        
                        <div class="export-preview" id="export-preview" style="display: none;">
                            <h3>Package Preview</h3>
                            <div class="preview-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Estimated Size:</span>
                                    <span class="stat-value" id="estimated-size">Calculating...</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Files Included:</span>
                                    <span class="stat-value" id="files-count">-</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Panoramas:</span>
                                    <span class="stat-value" id="panorama-count">-</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Layers:</span>
                                    <span class="stat-value" id="layer-count">-</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="export-modal-footer">
                        <button class="btn btn-secondary" onclick="loftTourExportUI.closeModal()">
                            Cancel
                        </button>
                        <button class="btn btn-primary" id="export-btn" onclick="loftTourExportUI.startExport()">
                            <i class="fas fa-download"></i>
                            Create Package
                        </button>
                    </div>
                    
                    <div class="export-progress" id="export-progress" style="display: none;">
                        <div class="progress-header">
                            <h3>Creating Offline Package</h3>
                            <p id="progress-status">Preparing export...</p>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill"></div>
                        </div>
                        <div class="progress-details" id="progress-details">
                            <small>This may take a few moments...</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
        
        this.modal = document.getElementById('loft-export-modal');
    }
    
    setupEventListeners() {
        // Listen for export requests
        document.addEventListener('loft-tour:export-request', (e) => {
            this.showModal(e.detail);
        });
        
        // Listen for option changes
        document.addEventListener('change', (e) => {
            if (e.target.closest('#loft-export-modal')) {
                this.updatePreview();
            }
        });
        
        // Add export button to tour interface
        this.addExportButton();
    }
    
    addExportButton() {
        // Add export button to viewer actions
        const viewerActions = document.querySelector('.viewer-actions');
        if (viewerActions) {
            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn-icon';
            exportBtn.title = 'Export Tour';
            exportBtn.innerHTML = '<i class="fas fa-download"></i>';
            exportBtn.onclick = () => this.showModal();
            
            viewerActions.appendChild(exportBtn);
        }
        
        // Add export option to editor toolbar
        const editorToolbar = document.querySelector('.toolbar-right');
        if (editorToolbar) {
            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn btn-secondary';
            exportBtn.innerHTML = '<i class="fas fa-download"></i> Export';
            exportBtn.onclick = () => this.showModal();
            
            editorToolbar.appendChild(exportBtn);
        }
    }
    
    showModal(options = {}) {
        if (!this.modal) return;
        
        // Reset form
        this.resetForm();
        
        // Apply any provided options
        if (options.packageType) {
            const radio = this.modal.querySelector(`input[name="packageType"][value="${options.packageType}"]`);
            if (radio) radio.checked = true;
        }
        
        if (options.bundleSize) {
            const radio = this.modal.querySelector(`input[name="bundleSize"][value="${options.bundleSize}"]`);
            if (radio) radio.checked = true;
        }
        
        // Set default filename
        if (this.engine && this.engine.tourData) {
            const tourName = this.engine.tourData.tour_name || 'virtual-tour';
            const sanitizedName = tourName.toLowerCase().replace(/[^a-z0-9]/g, '-');
            document.getElementById('exportFilename').value = sanitizedName;
        }
        
        // Show modal
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Update preview
        setTimeout(() => this.updatePreview(), 100);
    }
    
    closeModal() {
        if (!this.modal) return;
        
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Hide progress if showing
        this.hideProgress();
    }
    
    resetForm() {
        // Reset radio buttons to defaults
        const packageTypeRadio = this.modal.querySelector('input[name="packageType"][value="both"]');
        if (packageTypeRadio) packageTypeRadio.checked = true;
        
        const bundleSizeRadio = this.modal.querySelector('input[name="bundleSize"][value="standard"]');
        if (bundleSizeRadio) bundleSizeRadio.checked = true;
        
        // Reset checkboxes
        document.getElementById('includeAnalytics').checked = false;
        document.getElementById('optimizeImages').checked = true;
        document.getElementById('includeReadme').checked = true;
        
        // Clear filename
        document.getElementById('exportFilename').value = '';
    }
    
    updatePreview() {
        if (!this.engine || !this.engine.tourData) return;
        
        const tourData = this.engine.tourData;
        const options = this.getExportOptions();
        
        // Calculate stats
        const panoramaCount = tourData.nodes ? tourData.nodes.length : 0;
        let layerCount = 0;
        
        if (tourData.nodes) {
            tourData.nodes.forEach(node => {
                if (node.layers) {
                    layerCount += node.layers.length;
                }
            });
        }
        
        // Estimate file count
        let fileCount = 0;
        if (options.packageType === 'both') {
            fileCount = 2; // standalone + embed
        } else {
            fileCount = 1;
        }
        
        if (options.includeReadme) {
            fileCount += 1;
        }
        
        // Estimate size (rough calculation)
        let estimatedSize = 0;
        estimatedSize += panoramaCount * 2; // ~2MB per panorama
        estimatedSize += layerCount * 0.5; // ~500KB per layer
        estimatedSize += 1; // Base code size
        
        if (options.bundleSize === 'minimal') {
            estimatedSize *= 0.7; // 30% smaller
        } else if (options.bundleSize === 'premium') {
            estimatedSize *= 1.3; // 30% larger
        }
        
        // Update preview
        document.getElementById('estimated-size').textContent = this.formatFileSize(estimatedSize * 1024 * 1024);
        document.getElementById('files-count').textContent = fileCount;
        document.getElementById('panorama-count').textContent = panoramaCount;
        document.getElementById('layer-count').textContent = layerCount;
        
        // Show preview
        document.getElementById('export-preview').style.display = 'block';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    getExportOptions() {
        const packageType = this.modal.querySelector('input[name="packageType"]:checked')?.value || 'both';
        const bundleSize = this.modal.querySelector('input[name="bundleSize"]:checked')?.value || 'standard';
        
        return {
            packageType: packageType,
            bundleSize: bundleSize,
            includeAnalytics: document.getElementById('includeAnalytics').checked,
            optimizeImages: document.getElementById('optimizeImages').checked,
            includeReadme: document.getElementById('includeReadme').checked,
            filename: document.getElementById('exportFilename').value.trim(),
            
            // Map package type to specific options
            includeStandalone: packageType === 'both' || packageType === 'standalone',
            includeEmbed: packageType === 'both' || packageType === 'embed'
        };
    }
    
    async startExport() {
        if (this.isExporting) return;
        
        try {
            this.isExporting = true;
            
            // Validate tour data
            if (!this.engine || !this.engine.tourData) {
                throw new Error('No tour data available for export');
            }
            
            // Validate packager
            if (!this.packager) {
                throw new Error('Offline packager not available');
            }
            
            // Get export options
            const options = this.getExportOptions();
            
            // Show progress
            this.showProgress();
            
            // Update progress
            this.updateProgress(10, 'Preparing tour data...');
            
            // Start export
            const result = await this.packager.createPackage({
                tourData: this.engine.tourData,
                ...options
            });
            
            this.updateProgress(100, 'Export complete!');
            
            // Show success message
            setTimeout(() => {
                this.showSuccess(result);
            }, 1000);
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showError(error.message);
        } finally {
            this.isExporting = false;
        }
    }
    
    showProgress() {
        document.getElementById('export-progress').style.display = 'block';
        document.querySelector('.export-options').style.display = 'none';
        document.querySelector('.export-modal-footer').style.display = 'none';
    }
    
    hideProgress() {
        document.getElementById('export-progress').style.display = 'none';
        document.querySelector('.export-options').style.display = 'block';
        document.querySelector('.export-modal-footer').style.display = 'flex';
    }
    
    updateProgress(percent, status) {
        document.getElementById('progress-fill').style.width = percent + '%';
        document.getElementById('progress-status').textContent = status;
        
        if (percent < 100) {
            document.getElementById('progress-details').innerHTML = '<small>This may take a few moments...</small>';
        }
    }
    
    showSuccess(result) {
        const successHTML = `
            <div class="export-success">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Export Successful!</h3>
                <p>Your offline tour package has been created and downloaded.</p>
                <div class="success-stats">
                    <div class="stat">
                        <strong>${Object.keys(result.packages).length}</strong>
                        <span>Files Created</span>
                    </div>
                    <div class="stat">
                        <strong>${this.formatFileSize(result.bundle.totalSize)}</strong>
                        <span>Total Size</span>
                    </div>
                </div>
                <div class="success-actions">
                    <button class="btn btn-primary" onclick="loftTourExportUI.closeModal()">
                        <i class="fas fa-check"></i>
                        Done
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('export-progress').innerHTML = successHTML;
    }
    
    showError(message) {
        const errorHTML = `
            <div class="export-error">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Export Failed</h3>
                <p>${message}</p>
                <div class="error-actions">
                    <button class="btn btn-secondary" onclick="loftTourExportUI.hideProgress()">
                        <i class="fas fa-arrow-left"></i>
                        Back
                    </button>
                    <button class="btn btn-primary" onclick="loftTourExportUI.startExport()">
                        <i class="fas fa-redo"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('export-progress').innerHTML = errorHTML;
    }
    
    // Public API methods
    exportTour(options = {}) {
        this.showModal(options);
    }
    
    exportCurrentTour(options = {}) {
        if (this.engine && this.engine.tourData) {
            this.showModal(options);
        } else {
            console.error('No active tour to export');
        }
    }
}

// Global reference for onclick handlers
window.loftTourExportUI = null;

// Auto-initialize if tour engine is available
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for tour engine to be available
        const initExportUI = () => {
            if (window.loftTourEngine) {
                window.loftTourExportUI = new LoftTourExportUI(window.loftTourEngine);
                console.log('Export UI initialized');
            } else {
                setTimeout(initExportUI, 1000);
            }
        };
        
        initExportUI();
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoftTourExportUI;
}