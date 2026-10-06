/**
 * LOFT³ Tour Editor - Visual Tour Creation Interface
 * Handles upload, metadata processing, and visual editing
 */

class LoftTourEditor {
    constructor() {
        this.uploadedPanoramas = [];
        this.uploadedLayers = [];
        this.tourMetadata = null;
        this.currentTour = null;
        
        // UI state
        this.currentSection = 'upload';
        this.selectedNode = null;
        
        this.init();
    }
    
    /**
     * Initialize the editor
     */
    init() {
        this.setupUploadHandlers();
        this.setupUI();
        
        console.log('LOFT³ Tour Editor initialized');
    }
    
    /**
     * Setup file upload handlers
     */
    setupUploadHandlers() {
        // Panorama upload
        this.setupDropZone('pano-drop-zone', 'pano-input', (files) => {
            this.handlePanoramaUpload(files);
        });
        
        // Metadata upload
        this.setupDropZone('meta-drop-zone', 'meta-input', (files) => {
            this.handleMetadataUpload(files[0]);
        });
        
        // Layer upload
        this.setupDropZone('layer-drop-zone', 'layer-input', (files) => {
            this.handleLayerUpload(files);
        });
    }
    
    /**
     * Setup drag & drop zone with enhanced visual feedback
     */
    setupDropZone(dropZoneId, inputId, callback) {
        const dropZone = document.getElementById(dropZoneId);
        const input = document.getElementById(inputId);
        
        if (!dropZone || !input) return;
        
        // Click to upload
        dropZone.addEventListener('click', () => {
            if (!dropZone.classList.contains('processing')) {
                input.click();
            }
        });
        
        // File input change
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelection(dropZone, Array.from(e.target.files), callback);
            }
        });
        
        // Enhanced drag & drop with visual feedback
        let dragCounter = 0;
        
        dropZone.addEventListener('dragenter', (e) => {
            e.preventDefault();
            dragCounter++;
            dropZone.classList.add('drag-over');
            
            // Add visual feedback based on file types
            const files = Array.from(e.dataTransfer.files || []);
            this.updateDropZoneVisualFeedback(dropZone, files, dropZoneId);
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dragCounter--;
            
            if (dragCounter === 0) {
                dropZone.classList.remove('drag-over', 'drag-valid', 'drag-invalid');
            }
        });
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dragCounter = 0;
            dropZone.classList.remove('drag-over', 'drag-valid', 'drag-invalid');
            
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                this.handleFileSelection(dropZone, files, callback);
            }
        });
    }
    
    /**
     * Handle file selection with validation feedback
     */
    async handleFileSelection(dropZone, files, callback) {
        // Show processing state
        dropZone.classList.add('processing');
        
        try {
            await callback(files);
            
            // Show success state briefly
            dropZone.classList.remove('processing');
            dropZone.classList.add('success');
            
            setTimeout(() => {
                dropZone.classList.remove('success');
            }, 2000);
            
        } catch (error) {
            console.error('File processing error:', error);
            
            // Show error state
            dropZone.classList.remove('processing');
            dropZone.classList.add('error');
            
            setTimeout(() => {
                dropZone.classList.remove('error');
            }, 3000);
            
            this.showUploadError('Failed to process files: ' + error.message);
        }
    }
    
    /**
     * Update drop zone visual feedback based on file types
     */
    updateDropZoneVisualFeedback(dropZone, files, dropZoneId) {
        if (files.length === 0) return;
        
        let isValid = false;
        
        if (dropZoneId === 'pano-drop-zone') {
            isValid = files.every(file => 
                file.type.startsWith('image/') && 
                (file.type.includes('jpeg') || file.type.includes('jpg') || file.type.includes('png'))
            );
        } else if (dropZoneId === 'meta-drop-zone') {
            isValid = files.length === 1 && 
                (files[0].name.endsWith('.json') || files[0].name.endsWith('.csv'));
        } else if (dropZoneId === 'layer-drop-zone') {
            isValid = files.every(file => file.type === 'image/png');
        }
        
        if (isValid) {
            dropZone.classList.add('drag-valid');
            dropZone.classList.remove('drag-invalid');
        } else {
            dropZone.classList.add('drag-invalid');
            dropZone.classList.remove('drag-valid');
        }
    }
    
    /**
     * Handle panorama file upload with enhanced real-time progress tracking
     */
    async handlePanoramaUpload(files) {
        const validFiles = files.filter(file => 
            file.type.startsWith('image/') && 
            (file.type.includes('jpeg') || file.type.includes('jpg') || file.type.includes('png'))
        );
        
        if (validFiles.length === 0) {
            this.showUploadError('Please select valid image files (JPG, PNG)');
            return;
        }
        
        const previewContainer = document.getElementById('pano-preview');
        
        // Show enhanced upload progress with detailed steps
        this.showEnhancedUploadProgress('Processing panoramas...', validFiles.length);
        
        let processedCount = 0;
        let skippedCount = 0;
        
        for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            const fileIndex = i + 1;
            
            try {
                // Step 1: File validation
                this.updateDetailedProgress(fileIndex, validFiles.length, 'validation', `Validating ${file.name}...`);
                await this.simulateProcessingDelay(200); // Simulate validation time
                
                // Start timing for this file
                this.fileProcessingStartTime = Date.now();
                
                const isValid = await this.validatePanoramaImage(file);
                if (!isValid) {
                    this.showUploadWarning(`Skipping ${file.name}: Invalid panorama dimensions (should be 2:1 aspect ratio)`);
                    skippedCount++;
                    continue;
                }
                
                // Step 2: Image compression
                this.updateDetailedProgress(fileIndex, validFiles.length, 'compression', `Compressing ${file.name}...`);
                const processedFile = await this.compressImageIfNeeded(file);
                
                // Step 3: Thumbnail generation with real-time feedback
                this.updateDetailedProgress(fileIndex, validFiles.length, 'thumbnail', `Generating thumbnail for ${file.name}...`);
                const thumbnail = await this.generateThumbnailWithProgress(processedFile, (progress) => {
                    this.updateThumbnailProgress(progress);
                });
                
                // Step 4: Preview creation
                this.updateDetailedProgress(fileIndex, validFiles.length, 'preview', `Creating preview for ${file.name}...`);
                await this.simulateProcessingDelay(100);
                
                // Add to uploaded list with enhanced metadata
                this.uploadedPanoramas.push({
                    file: processedFile,
                    originalFile: file,
                    thumbnail: thumbnail,
                    name: file.name,
                    size: file.size,
                    originalSize: file.size,
                    compressedSize: processedFile.size,
                    type: file.type,
                    uploadedAt: new Date().toISOString(),
                    processingTime: Date.now() - this.fileProcessingStartTime,
                    compressionRatio: file.size > 0 ? (processedFile.size / file.size) : 1,
                    thumbnailSize: thumbnail ? thumbnail.length : 0
                });
                
                // Create preview with enhanced thumbnail display
                await this.createEnhancedImagePreview(processedFile, thumbnail, previewContainer);
                processedCount++;
                
                // Update overall progress
                this.updateOverallProgress(fileIndex, validFiles.length, processedCount, skippedCount);
                
            } catch (error) {
                console.error('Error processing file:', file.name, error);
                this.showUploadWarning(`Failed to process ${file.name}: ${error.message}`);
                skippedCount++;
            }
        }
        
        this.hideEnhancedUploadProgress();
        this.updateGenerateButton();
        
        // Show detailed completion summary
        const summary = `Successfully processed ${processedCount} panoramas`;
        const details = skippedCount > 0 ? ` (${skippedCount} skipped)` : '';
        this.showUploadSuccess(summary + details);
        
        console.log('Panoramas upload complete:', {
            processed: processedCount,
            skipped: skippedCount,
            total: validFiles.length
        });
    }
    
    /**
     * Validate panorama image dimensions (should be 2:1 aspect ratio)
     */
    validatePanoramaImage(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const aspectRatio = img.width / img.height;
                const isValid = Math.abs(aspectRatio - 2.0) < 0.1; // Allow some tolerance
                
                // Log dimensions for debugging
                console.log(`Image ${file.name}: ${img.width}x${img.height}, aspect ratio: ${aspectRatio.toFixed(2)}, valid: ${isValid}`);
                
                resolve(isValid);
                URL.revokeObjectURL(img.src);
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${file.name}`);
                resolve(false);
            };
            img.src = URL.createObjectURL(file);
        });
    }
    
    /**
     * Compress image if it's too large (>3MB) with enhanced mobile optimization
     */
    async compressImageIfNeeded(file) {
        const maxSize = 3 * 1024 * 1024; // 3MB
        
        if (file.size <= maxSize) {
            return file;
        }
        
        console.log(`Compressing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        // Use mobile optimization if available for better compression
        if (window.MobileOptimization) {
            const mobileOpt = new MobileOptimization();
            try {
                const compressedFile = await mobileOpt.compressImage(file, {
                    targetSize: 2.5 * 1024 * 1024 // Target 2.5MB for safety margin
                });
                
                if (compressedFile.size <= maxSize) {
                    return compressedFile;
                }
                
                // If still too large, fall back to aggressive compression
                console.warn('Mobile optimization still too large, using aggressive compression');
            } catch (error) {
                console.warn('Mobile optimization failed, using fallback compression:', error);
            }
        }
        
        // Fallback compression with iterative quality reduction
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate compression ratio to target ~2.5MB
                const targetSize = 2.5 * 1024 * 1024;
                const compressionRatio = Math.sqrt(targetSize / file.size);
                
                canvas.width = img.width * compressionRatio;
                canvas.height = img.height * compressionRatio;
                
                // Draw compressed image with high quality settings
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Try different quality levels to meet size requirement
                this.compressCanvasToTarget(canvas, file, maxSize, 0.85)
                    .then(resolve)
                    .catch(() => {
                        console.error(`Failed to compress ${file.name} to target size`);
                        resolve(file); // Return original if all compression attempts fail
                    });
                
                URL.revokeObjectURL(img.src);
            };
            
            img.onerror = () => {
                console.error(`Failed to compress ${file.name}`);
                resolve(file); // Return original if compression fails
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
    
    /**
     * Compress canvas to target size with iterative quality adjustment
     */
    async compressCanvasToTarget(canvas, originalFile, maxSize, initialQuality) {
        return new Promise((resolve, reject) => {
            let quality = initialQuality;
            let attempts = 0;
            const maxAttempts = 6;
            
            const tryCompress = () => {
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Compression failed'));
                        return;
                    }
                    
                    attempts++;
                    
                    // Check if size is acceptable
                    if (blob.size <= maxSize || attempts >= maxAttempts) {
                        const compressedFile = new File([blob], originalFile.name, {
                            type: originalFile.type,
                            lastModified: originalFile.lastModified
                        });
                        
                        const compressionRatio = ((originalFile.size - blob.size) / originalFile.size * 100).toFixed(1);
                        console.log(`Compressed ${originalFile.name} (attempt ${attempts}): ${(originalFile.size / 1024 / 1024).toFixed(2)}MB → ${(blob.size / 1024 / 1024).toFixed(2)}MB (${compressionRatio}% reduction)`);
                        
                        resolve(compressedFile);
                        return;
                    }
                    
                    // Reduce quality and try again
                    quality *= 0.75;
                    console.log(`File still too large (${(blob.size / 1024 / 1024).toFixed(2)}MB), reducing quality to ${(quality * 100).toFixed(0)}%`);
                    
                    setTimeout(tryCompress, 10); // Small delay to prevent blocking
                    
                }, originalFile.type, quality);
            };
            
            tryCompress();
        });
    }
    
    /**
     * Generate thumbnail with progress callback for real-time feedback
     */
    generateThumbnailWithProgress(file, progressCallback, maxWidth = 150, maxHeight = 100) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Report progress: image loaded
                if (progressCallback) progressCallback(25);
                
                // Calculate thumbnail dimensions maintaining aspect ratio
                const aspectRatio = img.width / img.height;
                let thumbWidth = maxWidth;
                let thumbHeight = maxHeight;
                
                if (aspectRatio > maxWidth / maxHeight) {
                    thumbHeight = maxWidth / aspectRatio;
                } else {
                    thumbWidth = maxHeight * aspectRatio;
                }
                
                canvas.width = thumbWidth;
                canvas.height = thumbHeight;
                
                // Report progress: canvas prepared
                if (progressCallback) progressCallback(50);
                
                // Draw thumbnail with smooth scaling
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Report progress: drawing
                if (progressCallback) progressCallback(75);
                
                ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
                
                // Convert to data URL with optimization
                const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                
                // Report progress: complete
                if (progressCallback) progressCallback(100);
                
                resolve(thumbnailDataUrl);
                URL.revokeObjectURL(img.src);
            };
            
            img.onerror = () => {
                console.error(`Failed to generate thumbnail for ${file.name}`);
                if (progressCallback) progressCallback(100);
                resolve(null);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
    
    /**
     * Enhanced thumbnail generation with multiple sizes
     */
    async generateMultipleThumbnails(file) {
        const thumbnails = {};
        
        // Generate different sizes for different use cases
        const sizes = [
            { name: 'small', width: 80, height: 40 },
            { name: 'medium', width: 150, height: 75 },
            { name: 'large', width: 300, height: 150 }
        ];
        
        for (const size of sizes) {
            thumbnails[size.name] = await this.generateThumbnailWithProgress(
                file, 
                null, // No progress callback for batch generation
                size.width, 
                size.height
            );
        }
        
        return thumbnails;
    }
    
    /**
     * Show enhanced upload progress with detailed step tracking
     */
    showEnhancedUploadProgress(message, totalFiles) {
        const overlay = document.getElementById('loading-overlay');
        const text = document.getElementById('loading-text');
        
        if (overlay) {
            overlay.classList.add('active');
        }
        
        if (text) {
            text.textContent = message;
        }
        
        // Create enhanced progress container
        let progressContainer = document.getElementById('enhanced-progress-container');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.id = 'enhanced-progress-container';
            progressContainer.className = 'enhanced-progress-container';
            progressContainer.innerHTML = `
                <div class="overall-progress">
                    <div class="progress-header">
                        <span class="progress-title">Overall Progress</span>
                        <span class="progress-counter">0 / ${totalFiles}</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" id="overall-progress-fill"></div>
                        <div class="progress-percentage" id="overall-percentage">0%</div>
                    </div>
                </div>
                
                <div class="current-file-progress">
                    <div class="file-info">
                        <span class="file-name" id="current-file-name">Preparing...</span>
                        <span class="file-step" id="current-file-step">Initializing</span>
                    </div>
                    <div class="step-progress">
                        <div class="step-indicator">
                            <div class="step" data-step="validation">
                                <div class="step-icon"><i class="fas fa-check-circle"></i></div>
                                <span>Validate</span>
                            </div>
                            <div class="step" data-step="compression">
                                <div class="step-icon"><i class="fas fa-compress"></i></div>
                                <span>Compress</span>
                            </div>
                            <div class="step" data-step="thumbnail">
                                <div class="step-icon"><i class="fas fa-image"></i></div>
                                <span>Thumbnail</span>
                            </div>
                            <div class="step" data-step="preview">
                                <div class="step-icon"><i class="fas fa-eye"></i></div>
                                <span>Preview</span>
                            </div>
                        </div>
                        <div class="thumbnail-progress" id="thumbnail-progress" style="display: none;">
                            <div class="mini-progress-bar">
                                <div class="mini-progress-fill" id="thumbnail-progress-fill"></div>
                            </div>
                            <span class="mini-progress-text" id="thumbnail-progress-text">0%</span>
                        </div>
                    </div>
                </div>
                
                <div class="processing-stats">
                    <div class="stat">
                        <span class="stat-label">Processed:</span>
                        <span class="stat-value" id="processed-count">0</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Skipped:</span>
                        <span class="stat-value" id="skipped-count">0</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Remaining:</span>
                        <span class="stat-value" id="remaining-count">${totalFiles}</span>
                    </div>
                </div>
            `;
            
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.appendChild(progressContainer);
            }
        }
        
        this.totalUploadFiles = totalFiles;
        this.currentUploadFile = 0;
        this.fileProcessingStartTime = Date.now();
    }
    
    /**
     * Update detailed progress for current file processing step
     */
    updateDetailedProgress(currentFile, totalFiles, step, message) {
        // Update current file info
        const fileNameElement = document.getElementById('current-file-name');
        const fileStepElement = document.getElementById('current-file-step');
        
        if (fileNameElement) {
            fileNameElement.textContent = `File ${currentFile} of ${totalFiles}`;
        }
        
        if (fileStepElement) {
            fileStepElement.textContent = message;
        }
        
        // Update step indicators
        const steps = document.querySelectorAll('.step');
        steps.forEach(stepEl => {
            const stepName = stepEl.getAttribute('data-step');
            if (stepName === step) {
                stepEl.classList.add('active');
                stepEl.classList.remove('completed');
            } else if (this.isStepBefore(stepName, step)) {
                stepEl.classList.add('completed');
                stepEl.classList.remove('active');
            } else {
                stepEl.classList.remove('active', 'completed');
            }
        });
        
        // Show/hide thumbnail progress
        const thumbnailProgress = document.getElementById('thumbnail-progress');
        if (thumbnailProgress) {
            thumbnailProgress.style.display = step === 'thumbnail' ? 'block' : 'none';
        }
    }
    
    /**
     * Update thumbnail generation progress
     */
    updateThumbnailProgress(progress) {
        const progressFill = document.getElementById('thumbnail-progress-fill');
        const progressText = document.getElementById('thumbnail-progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${progress}%`;
        }
    }
    
    /**
     * Update overall progress statistics
     */
    updateOverallProgress(currentFile, totalFiles, processedCount, skippedCount) {
        const overallFill = document.getElementById('overall-progress-fill');
        const overallPercentage = document.getElementById('overall-percentage');
        const progressCounter = document.querySelector('.progress-counter');
        
        const processedCountEl = document.getElementById('processed-count');
        const skippedCountEl = document.getElementById('skipped-count');
        const remainingCountEl = document.getElementById('remaining-count');
        
        const percentage = Math.round((currentFile / totalFiles) * 100);
        const remaining = totalFiles - currentFile;
        
        if (overallFill) {
            overallFill.style.width = `${percentage}%`;
        }
        
        if (overallPercentage) {
            overallPercentage.textContent = `${percentage}%`;
        }
        
        if (progressCounter) {
            progressCounter.textContent = `${currentFile} / ${totalFiles}`;
        }
        
        if (processedCountEl) {
            processedCountEl.textContent = processedCount;
        }
        
        if (skippedCountEl) {
            skippedCountEl.textContent = skippedCount;
        }
        
        if (remainingCountEl) {
            remainingCountEl.textContent = remaining;
        }
    }
    
    /**
     * Hide enhanced upload progress
     */
    hideEnhancedUploadProgress() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        // Remove enhanced progress container
        const progressContainer = document.getElementById('enhanced-progress-container');
        if (progressContainer) {
            progressContainer.remove();
        }
    }
    
    /**
     * Check if step comes before another step in the process
     */
    isStepBefore(step1, step2) {
        const stepOrder = ['validation', 'compression', 'thumbnail', 'preview'];
        return stepOrder.indexOf(step1) < stepOrder.indexOf(step2);
    }
    
    /**
     * Simulate processing delay for better UX feedback
     */
    simulateProcessingDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Update upload progress
     */
    updateUploadProgress(currentFile, totalFiles, message) {
        const text = document.getElementById('loading-text');
        const progressFill = document.querySelector('.progress-bar-fill');
        const progressText = document.querySelector('.progress-text');
        
        const percentage = Math.round((currentFile / totalFiles) * 100);
        
        if (text) {
            text.textContent = message;
        }
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${percentage}%`;
        }
    }
    
    /**
     * Hide upload progress
     */
    hideUploadProgress() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        // Remove progress bar
        const progressBar = document.getElementById('upload-progress-bar');
        if (progressBar) {
            progressBar.remove();
        }
    }
    
    /**
     * Show upload success message
     */
    showUploadSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    /**
     * Show upload error message
     */
    showUploadError(message) {
        this.showNotification(message, 'error');
    }
    
    /**
     * Show upload warning message
     */
    showUploadWarning(message) {
        this.showNotification(message, 'warning');
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add to page
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    /**
     * Get notification icon based on type
     */
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
    
    /**
     * Handle metadata file upload with enhanced validation and progress
     */
    async handleMetadataUpload(file) {
        if (!file) return;
        
        try {
            this.showEnhancedUploadProgress('Processing metadata...', 1);
            
            // Step 1: File validation
            this.updateDetailedProgress(1, 1, 'validation', `Validating ${file.name}...`);
            await this.simulateProcessingDelay(300);
            
            // Step 2: File parsing (skip compression for metadata)
            this.updateDetailedProgress(1, 1, 'compression', `Parsing ${file.name}...`);
            
            // Use the metadata parser for validation
            const parser = new LoftTourMetadataParser();
            const result = await parser.parseFile(file);
            
            // Step 3: Data processing (skip thumbnail for metadata)
            this.updateDetailedProgress(1, 1, 'thumbnail', `Processing tour structure...`);
            await this.simulateProcessingDelay(200);
            
            this.tourMetadata = result.data;
            
            // Step 4: Preview generation
            this.updateDetailedProgress(1, 1, 'preview', `Creating metadata preview...`);
            await this.simulateProcessingDelay(100);
            
            // Show warnings if any
            if (result.warnings && result.warnings.length > 0) {
                result.warnings.forEach(warning => {
                    this.showUploadWarning(warning);
                });
            }
            
            this.displayEnhancedMetadataPreview(result.data);
            this.updateGenerateButton();
            
            // Update progress stats
            this.updateOverallProgress(1, 1, 1, 0);
            
            this.hideEnhancedUploadProgress();
            this.showUploadSuccess(`Metadata loaded successfully: ${result.data.nodes.length} nodes found`);
            
            console.log('Metadata loaded:', result.data);
            
        } catch (error) {
            console.error('Failed to parse metadata:', error);
            this.hideEnhancedUploadProgress();
            this.showUploadError('Failed to parse metadata file: ' + error.message);
        }
    }
    
    /**
     * Display enhanced metadata preview with detailed information
     */
    displayEnhancedMetadataPreview(metadata) {
        const previewContainer = document.getElementById('meta-preview');
        
        if (metadata.nodes) {
            const nodeCount = metadata.nodes.length;
            const hasLayers = metadata.nodes.some(node => node.layers && node.layers.length > 0);
            const totalLayers = metadata.nodes.reduce((sum, node) => sum + (node.layers ? node.layers.length : 0), 0);
            
            previewContainer.innerHTML = `
                <div class="meta-summary enhanced-meta-summary">
                    <div class="meta-header">
                        <i class="fas fa-check-circle success-icon"></i>
                        <div class="meta-stats">
                            <div class="stat-item">
                                <span class="stat-number">${nodeCount}</span>
                                <span class="stat-label">Nodes</span>
                            </div>
                            ${hasLayers ? `
                                <div class="stat-item">
                                    <span class="stat-number">${totalLayers}</span>
                                    <span class="stat-label">Layers</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="tour-structure">
                        <h4>Tour Structure</h4>
                        <div class="node-flow">
                            ${this.generateNodeFlowVisualization(metadata.nodes)}
                        </div>
                    </div>
                    
                    <div class="node-details">
                        <h4>Node Details</h4>
                        <div class="node-list enhanced-node-list">
                            ${metadata.nodes.map((node, index) => `
                                <div class="node-item enhanced-node-item">
                                    <div class="node-header">
                                        <span class="node-index">${index + 1}</span>
                                        <strong class="node-id">${node.id}</strong>
                                        <span class="node-label">${node.label || 'No label'}</span>
                                    </div>
                                    <div class="node-meta">
                                        <div class="meta-item">
                                            <i class="fas fa-image"></i>
                                            <span>${node.image}</span>
                                        </div>
                                        ${node.next ? `
                                            <div class="meta-item">
                                                <i class="fas fa-arrow-right"></i>
                                                <span>Next: ${node.next}</span>
                                            </div>
                                        ` : ''}
                                        ${node.layers && node.layers.length > 0 ? `
                                            <div class="meta-item">
                                                <i class="fas fa-layer-group"></i>
                                                <span>${node.layers.length} layer${node.layers.length > 1 ? 's' : ''}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * Generate visual representation of node flow
     */
    generateNodeFlowVisualization(nodes) {
        // Create a simple flow visualization
        const nodeMap = new Map();
        nodes.forEach(node => {
            nodeMap.set(node.id, node);
        });
        
        // Find the starting node (not referenced by any next field)
        const referencedNodes = new Set();
        nodes.forEach(node => {
            if (node.next) {
                referencedNodes.add(node.next);
            }
        });
        
        const startNode = nodes.find(node => !referencedNodes.has(node.id));
        
        if (!startNode) {
            return '<div class="flow-error">No clear starting node found</div>';
        }
        
        // Build the flow
        const flow = [];
        let current = startNode;
        const visited = new Set();
        
        while (current && !visited.has(current.id)) {
            visited.add(current.id);
            flow.push(current);
            current = current.next ? nodeMap.get(current.next) : null;
        }
        
        return flow.map((node, index) => `
            <div class="flow-node">
                <div class="flow-node-content">
                    <span class="flow-node-id">${node.id}</span>
                    <span class="flow-node-label">${node.label || ''}</span>
                </div>
                ${index < flow.length - 1 ? '<i class="fas fa-arrow-right flow-arrow"></i>' : ''}
            </div>
        `).join('');
    }
    
    /**
     * Parse CSV metadata to JSON format
     */
    parseCSVMetadata(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const nodes = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const node = {};
            
            headers.forEach((header, index) => {
                const value = values[index] || '';
                
                switch (header.toLowerCase()) {
                    case 'node_id':
                    case 'id':
                        node.id = value;
                        break;
                    case 'label':
                    case 'name':
                        node.label = value;
                        break;
                    case 'image':
                    case 'filename':
                        node.image = value;
                        break;
                    case 'next_node':
                    case 'next':
                        node.next = value || null;
                        break;
                    case 'rotation_h':
                    case 'h_limit':
                        if (!node.rotationLimits) node.rotationLimits = {};
                        node.rotationLimits.h = parseInt(value) || 30;
                        break;
                    case 'rotation_v':
                    case 'v_limit':
                        if (!node.rotationLimits) node.rotationLimits = {};
                        node.rotationLimits.v = parseInt(value) || 10;
                        break;
                }
            });
            
            if (node.id && node.image) {
                nodes.push(node);
            }
        }
        
        return { nodes };
    }
    
    /**
     * Handle layer file upload with enhanced progress tracking
     */
    async handleLayerUpload(files) {
        const validFiles = files.filter(file => 
            file.type === 'image/png'
        );
        
        if (validFiles.length === 0) {
            this.showUploadError('Please select PNG files for layers');
            return;
        }
        
        const previewContainer = document.getElementById('layer-preview');
        
        this.showEnhancedUploadProgress('Processing layers...', validFiles.length);
        
        let processedCount = 0;
        
        for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            const fileIndex = i + 1;
            
            try {
                // Step 1: File validation
                this.updateDetailedProgress(fileIndex, validFiles.length, 'validation', `Validating ${file.name}...`);
                await this.simulateProcessingDelay(100);
                
                // Step 2: Skip compression for PNG layers (preserve transparency)
                this.updateDetailedProgress(fileIndex, validFiles.length, 'compression', `Optimizing ${file.name}...`);
                await this.simulateProcessingDelay(200);
                
                // Step 3: Generate thumbnail for layer
                this.updateDetailedProgress(fileIndex, validFiles.length, 'thumbnail', `Generating thumbnail for ${file.name}...`);
                const thumbnail = await this.generateThumbnailWithProgress(file, (progress) => {
                    this.updateThumbnailProgress(progress);
                });
                
                // Step 4: Create preview
                this.updateDetailedProgress(fileIndex, validFiles.length, 'preview', `Creating preview for ${file.name}...`);
                await this.simulateProcessingDelay(100);
                
                // Add to uploaded list with enhanced metadata
                this.uploadedLayers.push({
                    file: file,
                    thumbnail: thumbnail,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    uploadedAt: new Date().toISOString(),
                    processingTime: Date.now() - this.fileProcessingStartTime
                });
                
                // Create enhanced preview
                await this.createEnhancedImagePreview(file, thumbnail, previewContainer);
                processedCount++;
                
                // Update overall progress
                this.updateOverallProgress(fileIndex, validFiles.length, processedCount, 0);
                
            } catch (error) {
                console.error('Error processing layer:', file.name, error);
                this.showUploadWarning(`Failed to process ${file.name}: ${error.message}`);
            }
        }
        
        this.hideEnhancedUploadProgress();
        this.showUploadSuccess(`Successfully processed ${processedCount} layers`);
        
        console.log('Layers upload complete:', {
            processed: processedCount,
            total: validFiles.length
        });
    }
    
    /**
     * Create enhanced image preview element with detailed thumbnail and metadata
     */
    async createEnhancedImagePreview(file, thumbnail, container) {
        const preview = document.createElement('div');
        preview.className = 'file-preview enhanced-preview';
        
        // Create thumbnail container with loading state
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.className = 'thumbnail-container';
        
        const img = document.createElement('img');
        img.className = 'preview-thumbnail';
        img.alt = file.name;
        
        // Add loading state
        thumbnailContainer.classList.add('loading');
        
        if (thumbnail) {
            img.onload = () => {
                thumbnailContainer.classList.remove('loading');
                thumbnailContainer.classList.add('loaded');
            };
            img.src = thumbnail;
        } else {
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                thumbnailContainer.classList.remove('loading');
                thumbnailContainer.classList.add('loaded');
            };
        }
        
        thumbnailContainer.appendChild(img);
        
        // Create file info with enhanced metadata
        const info = document.createElement('div');
        info.className = 'file-info enhanced-info';
        
        const name = document.createElement('div');
        name.className = 'file-name';
        name.textContent = file.name;
        
        const metadata = document.createElement('div');
        metadata.className = 'file-metadata';
        
        // Get image dimensions for display
        const dimensions = await this.getImageDimensions(file);
        const aspectRatio = dimensions ? (dimensions.width / dimensions.height).toFixed(2) : 'Unknown';
        
        metadata.innerHTML = `
            <div class="metadata-row">
                <span class="metadata-label">Size:</span>
                <span class="metadata-value">${this.formatFileSize(file.size)}</span>
            </div>
            <div class="metadata-row">
                <span class="metadata-label">Dimensions:</span>
                <span class="metadata-value">${dimensions ? `${dimensions.width}×${dimensions.height}` : 'Unknown'}</span>
            </div>
            <div class="metadata-row">
                <span class="metadata-label">Aspect Ratio:</span>
                <span class="metadata-value ${Math.abs(aspectRatio - 2.0) < 0.1 ? 'valid' : 'invalid'}">${aspectRatio}:1</span>
            </div>
            <div class="metadata-row">
                <span class="metadata-label">Type:</span>
                <span class="metadata-value">${file.type}</span>
            </div>
        `;
        
        info.appendChild(name);
        info.appendChild(metadata);
        
        // Create action buttons
        const actions = document.createElement('div');
        actions.className = 'file-actions';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'file-remove';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.title = 'Remove file';
        removeBtn.onclick = () => {
            this.removeFile(file, preview);
        };
        
        const viewBtn = document.createElement('button');
        viewBtn.className = 'file-view';
        viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
        viewBtn.title = 'View full image';
        viewBtn.onclick = () => {
            this.showImageModal(file, thumbnail);
        };
        
        actions.appendChild(viewBtn);
        actions.appendChild(removeBtn);
        
        // Add processing indicator
        const processingIndicator = document.createElement('div');
        processingIndicator.className = 'processing-indicator';
        processingIndicator.innerHTML = '<i class="fas fa-check-circle"></i> Processed';
        
        preview.appendChild(thumbnailContainer);
        preview.appendChild(info);
        preview.appendChild(actions);
        preview.appendChild(processingIndicator);
        
        // Add with animation
        preview.style.opacity = '0';
        preview.style.transform = 'translateY(20px)';
        container.appendChild(preview);
        
        // Animate in
        requestAnimationFrame(() => {
            preview.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            preview.style.opacity = '1';
            preview.style.transform = 'translateY(0)';
        });
    }
    
    /**
     * Get image dimensions
     */
    getImageDimensions(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
                URL.revokeObjectURL(img.src);
            };
            img.onerror = () => {
                resolve(null);
            };
            img.src = URL.createObjectURL(file);
        });
    }
    
    /**
     * Show image in modal for full view
     */
    showImageModal(file, thumbnail) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('image-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'image-modal';
            modal.className = 'image-modal';
            modal.innerHTML = `
                <div class="modal-backdrop" onclick="this.parentElement.style.display='none'"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modal-image-title">Image Preview</h3>
                        <button class="modal-close" onclick="this.closest('.image-modal').style.display='none'">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <img id="modal-image" src="" alt="Preview">
                        <div class="modal-loading">
                            <div class="spinner"></div>
                            <p>Loading full image...</p>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        const modalImage = document.getElementById('modal-image');
        const modalTitle = document.getElementById('modal-image-title');
        const modalLoading = modal.querySelector('.modal-loading');
        
        modalTitle.textContent = file.name;
        modalLoading.style.display = 'flex';
        modalImage.style.display = 'none';
        
        // Show modal
        modal.style.display = 'flex';
        
        // Load full image
        modalImage.onload = () => {
            modalLoading.style.display = 'none';
            modalImage.style.display = 'block';
        };
        
        modalImage.src = URL.createObjectURL(file);
    }
    
    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Remove uploaded file
     */
    removeFile(file, previewElement) {
        // Remove from arrays (handle both old and new data structures)
        this.uploadedPanoramas = this.uploadedPanoramas.filter(item => {
            const fileToCheck = item.file || item;
            return fileToCheck !== file;
        });
        
        this.uploadedLayers = this.uploadedLayers.filter(item => {
            const fileToCheck = item.file || item;
            return fileToCheck !== file;
        });
        
        // Remove preview
        previewElement.remove();
        
        this.updateGenerateButton();
        this.showUploadSuccess('File removed successfully');
    }
    
    /**
     * Display metadata preview
     */
    displayMetadataPreview(metadata) {
        const previewContainer = document.getElementById('meta-preview');
        
        if (metadata.nodes) {
            previewContainer.innerHTML = `
                <div class="meta-summary">
                    <i class="fas fa-check-circle"></i>
                    <span>${metadata.nodes.length} nodes found</span>
                </div>
                <div class="node-list">
                    ${metadata.nodes.map(node => `
                        <div class="node-item">
                            <strong>${node.id}</strong>: ${node.label || 'No label'}
                            <br><small>Image: ${node.image}</small>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
    
    /**
     * Update generate button state
     */
    updateGenerateButton() {
        const generateBtn = document.getElementById('generate-btn');
        const hasFiles = this.uploadedPanoramas.length > 0;
        const hasMetadata = this.tourMetadata !== null;
        
        if (generateBtn) {
            generateBtn.disabled = !(hasFiles && hasMetadata);
        }
    }
    
    /**
     * Setup UI event handlers
     */
    setupUI() {
        // Generate button
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateTour());
        }
    }
    
    /**
     * Generate tour from uploaded files
     */
    async generateTour() {
        if (!this.tourMetadata || this.uploadedPanoramas.length === 0) {
            alert('Please upload both panoramas and metadata');
            return;
        }
        
        try {
            this.showLoading('Generating tour...');
            
            // Process uploaded files
            const processedTour = await this.processTourData();
            
            // Switch to editor view
            this.switchToEditor(processedTour);
            
            this.hideLoading();
            
        } catch (error) {
            console.error('Failed to generate tour:', error);
            alert('Failed to generate tour: ' + error.message);
            this.hideLoading();
        }
    }
    
    /**
     * Process tour data and create URLs for images
     */
    async processTourData() {
        const tourData = { ...this.tourMetadata };
        
        // Create object URLs for panoramas
        const imageMap = new Map();
        const availableImages = [];
        
        this.uploadedPanoramas.forEach(item => {
            const file = item.file || item; // Handle both old and new data structures
            const name = item.name || file.name;
            const url = item.dataUrl || URL.createObjectURL(file);
            imageMap.set(name, url);
            availableImages.push({ name, url, file });
        });
        
        console.log('Available images:', availableImages.map(img => img.name));
        console.log('Metadata nodes:', tourData.nodes.map(node => `${node.id} -> ${node.image}`));
        
        // Create object URLs for layers
        const layerMap = new Map();
        this.uploadedLayers.forEach(item => {
            const file = item.file || item; // Handle both old and new data structures
            const name = item.name || file.name;
            layerMap.set(name, URL.createObjectURL(file));
        });
        
        // Smart image matching for nodes
        tourData.nodes.forEach((node, index) => {
            let matchedImage = null;
            
            // Strategy 1: Exact filename match
            if (imageMap.has(node.image)) {
                matchedImage = imageMap.get(node.image);
                console.log(`✓ Exact match for ${node.id}: ${node.image}`);
            }
            // Strategy 2: Match by node ID in filename
            else {
                const nodeId = node.id.toLowerCase();
                const matchingImg = availableImages.find(img => 
                    img.name.toLowerCase().includes(nodeId)
                );
                if (matchingImg) {
                    matchedImage = matchingImg.url;
                    console.log(`✓ ID match for ${node.id}: ${matchingImg.name}`);
                }
            }
            // Strategy 3: Match by index (first image to first node, etc.)
            if (!matchedImage && availableImages[index]) {
                matchedImage = availableImages[index].url;
                console.log(`✓ Index match for ${node.id}: ${availableImages[index].name} (position ${index})`);
            }
            // Strategy 4: Use first available image as fallback
            if (!matchedImage && availableImages.length > 0) {
                matchedImage = availableImages[0].url;
                console.log(`⚠ Fallback match for ${node.id}: ${availableImages[0].name}`);
            }
            
            if (matchedImage) {
                node.imageUrl = matchedImage;
                console.log(`Set imageUrl for ${node.id}:`, matchedImage.substring(0, 50) + '...');
            } else {
                console.error(`✗ No image found for node ${node.id}`);
            }
            
            // Update layer URLs if present
            if (node.layers) {
                node.layers.forEach(layer => {
                    if (layerMap.has(layer.image)) {
                        layer.imageUrl = layerMap.get(layer.image);
                    }
                });
            }
        });
        
        console.log('Processed tour data:', tourData);
        return tourData;
    }
    
    /**
     * Switch to editor view
     */
    switchToEditor(tourData) {
        this.currentTour = tourData;
        this.currentSection = 'editor';
        
        // Hide upload section
        document.getElementById('upload-section').classList.remove('active');
        
        // Show editor section
        document.getElementById('editor-section').classList.add('active');
        
        // Populate editor with tour data
        this.populateEditor(tourData);
    }
    
    /**
     * Populate editor with tour data
     */
    populateEditor(tourData) {
        const nodesList = document.getElementById('nodes-list');
        
        if (nodesList) {
            nodesList.innerHTML = '';
            
            tourData.nodes.forEach((node, index) => {
                const nodeElement = this.createNodeListItem(node, index);
                nodesList.appendChild(nodeElement);
            });
        }
    }
    
    /**
     * Create node list item for editor
     */
    createNodeListItem(node, index) {
        const item = document.createElement('div');
        item.className = 'node-item';
        item.innerHTML = `
            <div class="node-thumbnail">
                <img src="${node.imageUrl}" alt="${node.label}">
            </div>
            <div class="node-info">
                <h4>${node.label || node.id}</h4>
                <p>Node ${index + 1}</p>
            </div>
        `;
        
        item.addEventListener('click', () => {
            this.selectNode(node, index);
        });
        
        return item;
    }
    
    /**
     * Select node for editing
     */
    selectNode(node, index) {
        this.selectedNode = { node, index };
        
        // Update UI to show selected node
        document.querySelectorAll('.node-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        event.currentTarget.classList.add('selected');
        
        // Update editor panels
        this.updateEditorPanels(node);
        
        console.log('Node selected:', node.id);
    }
    
    /**
     * Update editor panels with node data
     */
    updateEditorPanels(node) {
        // Update node settings
        const labelInput = document.getElementById('node-label');
        if (labelInput) {
            labelInput.value = node.label || '';
        }
        
        // Update current node title
        const titleElement = document.getElementById('current-node-title');
        if (titleElement) {
            titleElement.textContent = node.label || node.id;
        }
        
        // Initialize or update visual layer editor
        this.initializeVisualEditor(node);
    }
    
    /**
     * Initialize visual layer editor for the selected node
     */
    initializeVisualEditor(node) {
        const previewContainer = document.getElementById('pano-editor-preview');
        
        if (!this.visualEditor) {
            // Create visual editor instance
            this.visualEditor = new VisualLayerEditor(previewContainer, null);
            window.visualEditor = this.visualEditor; // Make globally accessible
        }
        
        // Load node data into visual editor
        this.visualEditor.loadNode(node);
        
        console.log('Visual editor initialized for node:', node.id);
    }
    
    /**
     * Show loading overlay
     */
    showLoading(message) {
        const overlay = document.getElementById('loading-overlay');
        const text = document.getElementById('loading-text');
        
        if (overlay) {
            overlay.style.display = 'flex';
        }
        
        if (text) {
            text.textContent = message;
        }
    }
    
    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}

// Global functions for HTML onclick handlers
window.showMetaTemplate = function() {
    const modal = document.getElementById('meta-template-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
};

window.downloadTemplate = function() {
    const template = {
        nodes: [
            {
                id: "entrance",
                image: "entrance.jpg",
                label: "Main Entrance",
                next: "living_room",
                rotationLimits: { h: 30, v: 10 },
                layers: [
                    {
                        image: "welcome_sign.png",
                        position: { x: 0.5, y: 0.3 },
                        scale: 1.0,
                        parallaxFactor: 0.5
                    }
                ]
            },
            {
                id: "living_room",
                image: "living_room.jpg",
                label: "Living Room",
                next: null,
                rotationLimits: { h: 45, v: 15 }
            }
        ]
    };
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loft-tour-template.json';
    a.click();
    
    URL.revokeObjectURL(url);
};

window.backToUpload = function() {
    document.getElementById('editor-section').classList.remove('active');
    document.getElementById('upload-section').classList.add('active');
};

window.previewTour = function() {
    if (window.loftEditor && window.loftEditor.currentTour) {
        // Switch to viewer with current tour
        document.getElementById('editor-section').classList.remove('active');
        document.getElementById('viewer-section').classList.add('active');
        
        // Initialize viewer if not already done
        if (!window.loftViewer) {
            window.loftViewer = new LoftTourViewer('viewer-canvas-container');
        }
        
        window.loftViewer.loadTour(window.loftEditor.currentTour);
    }
};

window.saveTour = function() {
    console.log('Save tour functionality not implemented yet');
    alert('Save functionality will be implemented in the next phase');
};

// Initialize editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.loftEditor = new LoftTourEditor();
});

// Export for use in other modules
window.LoftTourEditor = LoftTourEditor;