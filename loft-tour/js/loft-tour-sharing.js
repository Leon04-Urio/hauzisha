/**
 * LOFT³ Tour Sharing System
 * Handles URL generation, embed codes, and social sharing
 */

class LoftTourSharing {
    constructor(tourEngine) {
        this.engine = tourEngine;
        this.baseApiUrl = '/api/index.php';
        this.currentTourId = null;
        this.shareModal = null;
        this.embedModal = null;
        
        this.init();
    }
    
    init() {
        this.createShareModal();
        this.createEmbedModal();
        this.setupEventListeners();
        console.log('LOFT³ Tour Sharing initialized');
    }
    
    /**
     * Set current tour ID for sharing
     */
    setTourId(tourId) {
        this.currentTourId = tourId;
    }
    
    /**
     * Generate shareable URL with options
     */
    async generateShareUrl(options = {}) {
        if (!this.currentTourId) {
            throw new Error('No tour ID set for sharing');
        }
        
        try {
            const response = await fetch(`${this.baseApiUrl}/generate-share-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tour_id: this.currentTourId,
                    start_node: options.startNode || null,
                    autoplay: options.autoplay || false,
                    hide_ui: options.hideUI || false,
                    fullscreen: options.fullscreen || false
                })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to generate share URL');
            }
            
            return data;
        } catch (error) {
            console.error('Share URL generation failed:', error);
            throw error;
        }
    }
    
    /**
     * Generate embed code with options
     */
    async generateEmbedCode(options = {}) {
        if (!this.currentTourId) {
            throw new Error('No tour ID set for embedding');
        }
        
        try {
            const response = await fetch(`${this.baseApiUrl}/generate-embed-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tour_id: this.currentTourId,
                    width: options.width || '100%',
                    height: options.height || '600px',
                    allow_fullscreen: options.allowFullscreen !== false,
                    show_ui: options.showUI !== false,
                    autoplay: options.autoplay || false,
                    start_node: options.startNode || ''
                })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to generate embed code');
            }
            
            return data;
        } catch (error) {
            console.error('Embed code generation failed:', error);
            throw error;
        }
    }
    
    /**
     * Show share modal
     */
    async showShareModal() {
        try {
            this.showLoadingInModal(this.shareModal, 'Generating share options...');
            
            const shareData = await this.generateShareUrl();
            this.populateShareModal(shareData);
            this.shareModal.style.display = 'flex';
            
        } catch (error) {
            this.showErrorInModal(this.shareModal, 'Failed to generate share options: ' + error.message);
        }
    }
    
    /**
     * Show embed modal
     */
    async showEmbedModal() {
        try {
            this.showLoadingInModal(this.embedModal, 'Generating embed code...');
            
            const embedData = await this.generateEmbedCode();
            this.populateEmbedModal(embedData);
            this.embedModal.style.display = 'flex';
            
        } catch (error) {
            this.showErrorInModal(this.embedModal, 'Failed to generate embed code: ' + error.message);
        }
    }
    
    /**
     * Create share modal
     */
    createShareModal() {
        this.shareModal = document.createElement('div');
        this.shareModal.className = 'loft-modal share-modal';
        this.shareModal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.style.display='none'"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-share-alt"></i> Share Tour</h3>
                    <button class="modal-close" onclick="this.closest('.loft-modal').style.display='none'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="loading-content">
                        <div class="spinner"></div>
                        <p>Loading...</p>
                    </div>
                    <div class="share-content" style="display: none;">
                        <div class="share-section">
                            <h4>Share Link</h4>
                            <div class="url-input-group">
                                <input type="text" id="share-url" readonly>
                                <button class="btn-copy" onclick="loftTourSharing.copyToClipboard('share-url')">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                            <div class="url-options">
                                <label>
                                    <input type="checkbox" id="share-short-url"> Use short URL
                                </label>
                            </div>
                        </div>
                        
                        <div class="share-section">
                            <h4>QR Code</h4>
                            <div class="qr-code-container">
                                <img id="qr-code" alt="QR Code">
                                <div class="qr-actions">
                                    <button class="btn-download" onclick="loftTourSharing.downloadQRCode()">
                                        <i class="fas fa-download"></i> Download
                                    </button>
                                    <button class="btn-download" onclick="loftTourSharing.downloadQRCode('print')">
                                        <i class="fas fa-print"></i> Print Quality
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="share-section">
                            <h4>Social Media</h4>
                            <div class="social-buttons">
                                <button class="social-btn facebook" onclick="loftTourSharing.shareOnFacebook()">
                                    <i class="fab fa-facebook-f"></i> Facebook
                                </button>
                                <button class="social-btn twitter" onclick="loftTourSharing.shareOnTwitter()">
                                    <i class="fab fa-twitter"></i> Twitter
                                </button>
                                <button class="social-btn linkedin" onclick="loftTourSharing.shareOnLinkedIn()">
                                    <i class="fab fa-linkedin-in"></i> LinkedIn
                                </button>
                                <button class="social-btn whatsapp" onclick="loftTourSharing.shareOnWhatsApp()">
                                    <i class="fab fa-whatsapp"></i> WhatsApp
                                </button>
                                <button class="social-btn telegram" onclick="loftTourSharing.shareOnTelegram()">
                                    <i class="fab fa-telegram"></i> Telegram
                                </button>
                                <button class="social-btn pinterest" onclick="loftTourSharing.shareOnPinterest()">
                                    <i class="fab fa-pinterest"></i> Pinterest
                                </button>
                            </div>
                        </div>
                        
                        <div class="share-section">
                            <h4>Native Share</h4>
                            <button class="btn-native-share" onclick="loftTourSharing.nativeShare()">
                                <i class="fas fa-share"></i> Share via Device
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.shareModal);
    }
    
    /**
     * Create embed modal
     */
    createEmbedModal() {
        this.embedModal = document.createElement('div');
        this.embedModal.className = 'loft-modal embed-modal';
        this.embedModal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.style.display='none'"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-code"></i> Embed Tour</h3>
                    <button class="modal-close" onclick="this.closest('.loft-modal').style.display='none'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="loading-content">
                        <div class="spinner"></div>
                        <p>Loading...</p>
                    </div>
                    <div class="embed-content" style="display: none;">
                        <div class="embed-options">
                            <div class="option-group">
                                <label>Width:</label>
                                <input type="text" id="embed-width" value="100%" onchange="loftTourSharing.updateEmbedCode()">
                            </div>
                            <div class="option-group">
                                <label>Height:</label>
                                <input type="text" id="embed-height" value="600px" onchange="loftTourSharing.updateEmbedCode()">
                            </div>
                            <div class="option-group">
                                <label>
                                    <input type="checkbox" id="embed-fullscreen" checked onchange="loftTourSharing.updateEmbedCode()">
                                    Allow fullscreen
                                </label>
                            </div>
                            <div class="option-group">
                                <label>
                                    <input type="checkbox" id="embed-ui" checked onchange="loftTourSharing.updateEmbedCode()">
                                    Show UI controls
                                </label>
                            </div>
                            <div class="option-group">
                                <label>
                                    <input type="checkbox" id="embed-autoplay" onchange="loftTourSharing.updateEmbedCode()">
                                    Autoplay tour
                                </label>
                            </div>
                        </div>
                        
                        <div class="embed-tabs">
                            <button class="tab-btn active" onclick="loftTourSharing.switchEmbedTab('iframe')">
                                <i class="fas fa-window-maximize"></i> iFrame
                            </button>
                            <button class="tab-btn" onclick="loftTourSharing.switchEmbedTab('responsive')">
                                <i class="fas fa-mobile-alt"></i> Responsive
                            </button>
                            <button class="tab-btn" onclick="loftTourSharing.switchEmbedTab('javascript')">
                                <i class="fas fa-code"></i> JavaScript
                            </button>
                        </div>
                        
                        <div class="embed-code-container">
                            <div class="code-header">
                                <span class="code-type">iFrame Code</span>
                                <button class="btn-copy" onclick="loftTourSharing.copyEmbedCode()">
                                    <i class="fas fa-copy"></i> Copy
                                </button>
                            </div>
                            <textarea id="embed-code" readonly></textarea>
                        </div>
                        
                        <div class="embed-preview">
                            <h4>Preview</h4>
                            <div class="preview-container" id="embed-preview">
                                <!-- Preview will be inserted here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.embedModal);
    }
    
    /**
     * Populate share modal with data
     */
    populateShareModal(shareData) {
        const shareContent = this.shareModal.querySelector('.share-content');
        const loadingContent = this.shareModal.querySelector('.loading-content');
        
        // Update URL input
        const urlInput = this.shareModal.querySelector('#share-url');
        urlInput.value = shareData.share_url;
        
        // Update QR code with enhanced options
        const qrCode = this.shareModal.querySelector('#qr-code');
        if (shareData.qr_code_url && typeof shareData.qr_code_url === 'object') {
            qrCode.src = shareData.qr_code_url.primary;
            qrCode.dataset.downloadUrl = shareData.qr_code_url.download_url;
            qrCode.dataset.printUrl = shareData.qr_code_url.sizes.print;
        } else {
            qrCode.src = shareData.qr_code_url;
        }
        
        // Store data for sharing functions
        this.currentShareData = shareData;
        
        // Show content, hide loading
        loadingContent.style.display = 'none';
        shareContent.style.display = 'block';
        
        // Setup short URL toggle
        const shortUrlCheckbox = this.shareModal.querySelector('#share-short-url');
        shortUrlCheckbox.addEventListener('change', () => {
            urlInput.value = shortUrlCheckbox.checked ? shareData.short_url : shareData.share_url;
        });
    }
    
    /**
     * Populate embed modal with data
     */
    populateEmbedModal(embedData) {
        const embedContent = this.embedModal.querySelector('.embed-content');
        const loadingContent = this.embedModal.querySelector('.loading-content');
        
        // Store embed data
        this.currentEmbedData = embedData;
        
        // Update embed code textarea
        const embedCodeTextarea = this.embedModal.querySelector('#embed-code');
        embedCodeTextarea.value = embedData.iframe_code;
        
        // Show content, hide loading
        loadingContent.style.display = 'none';
        embedContent.style.display = 'block';
        
        // Update preview
        this.updateEmbedPreview();
    }
    
    /**
     * Switch embed tab
     */
    switchEmbedTab(type) {
        // Update tab buttons
        const tabs = this.embedModal.querySelectorAll('.tab-btn');
        tabs.forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');
        
        // Update code content
        const codeTextarea = this.embedModal.querySelector('#embed-code');
        const codeHeader = this.embedModal.querySelector('.code-type');
        
        switch (type) {
            case 'iframe':
                codeTextarea.value = this.currentEmbedData.iframe_code;
                codeHeader.textContent = 'iFrame Code';
                break;
            case 'responsive':
                codeTextarea.value = this.currentEmbedData.responsive_code;
                codeHeader.textContent = 'Responsive Code';
                break;
            case 'javascript':
                codeTextarea.value = this.currentEmbedData.javascript_code;
                codeHeader.textContent = 'JavaScript Code';
                break;
        }
    }
    
    /**
     * Update embed code when options change
     */
    async updateEmbedCode() {
        const options = {
            width: this.embedModal.querySelector('#embed-width').value,
            height: this.embedModal.querySelector('#embed-height').value,
            allowFullscreen: this.embedModal.querySelector('#embed-fullscreen').checked,
            showUI: this.embedModal.querySelector('#embed-ui').checked,
            autoplay: this.embedModal.querySelector('#embed-autoplay').checked
        };
        
        try {
            const embedData = await this.generateEmbedCode(options);
            this.currentEmbedData = embedData;
            
            // Update current tab
            const activeTab = this.embedModal.querySelector('.tab-btn.active');
            const tabType = activeTab.textContent.toLowerCase().includes('iframe') ? 'iframe' :
                           activeTab.textContent.toLowerCase().includes('responsive') ? 'responsive' : 'javascript';
            
            this.switchEmbedTab(tabType);
            this.updateEmbedPreview();
            
        } catch (error) {
            console.error('Failed to update embed code:', error);
        }
    }
    
    /**
     * Update embed preview
     */
    updateEmbedPreview() {
        const previewContainer = this.embedModal.querySelector('#embed-preview');
        const previewHtml = `
            <div style="transform: scale(0.3); transform-origin: top left; width: 333%; height: 333%; overflow: hidden;">
                ${this.currentEmbedData.iframe_code}
            </div>
        `;
        previewContainer.innerHTML = previewHtml;
    }
    
    /**
     * Copy text to clipboard
     */
    async copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        const text = element.value || element.textContent;
        
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Copied to clipboard!', 'success');
        } catch (error) {
            // Fallback for older browsers
            element.select();
            document.execCommand('copy');
            this.showNotification('Copied to clipboard!', 'success');
        }
    }
    
    /**
     * Copy embed code
     */
    async copyEmbedCode() {
        const embedCode = this.embedModal.querySelector('#embed-code').value;
        
        try {
            await navigator.clipboard.writeText(embedCode);
            this.showNotification('Embed code copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy embed code:', error);
            this.showNotification('Failed to copy embed code', 'error');
        }
    }
    
    /**
     * Download QR code with options
     */
    downloadQRCode(quality = 'standard') {
        const qrCode = this.shareModal.querySelector('#qr-code');
        let downloadUrl = qrCode.src;
        
        // Use higher quality for print
        if (quality === 'print' && qrCode.dataset.printUrl) {
            downloadUrl = qrCode.dataset.printUrl;
        } else if (qrCode.dataset.downloadUrl) {
            downloadUrl = qrCode.dataset.downloadUrl;
        }
        
        const link = document.createElement('a');
        link.download = `tour-${this.currentTourId}-qr-code${quality === 'print' ? '-print' : ''}.png`;
        link.href = downloadUrl;
        link.click();
        
        this.showNotification(`QR code ${quality === 'print' ? '(print quality) ' : ''}downloaded!`, 'success');
    }
    
    /**
     * Native device sharing
     */
    async nativeShare() {
        if (!navigator.share) {
            this.showNotification('Native sharing not supported on this device', 'warning');
            return;
        }
        
        try {
            await navigator.share({
                title: this.currentShareData.tour_name,
                text: `Check out this amazing virtual tour: ${this.currentShareData.property_name}`,
                url: this.currentShareData.share_url
            });
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Native sharing failed:', error);
                this.showNotification('Sharing failed', 'error');
            }
        }
    }
    
    /**
     * Share on Facebook
     */
    shareOnFacebook() {
        const url = encodeURIComponent(this.currentShareData.share_url);
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        this.openShareWindow(shareUrl, 'Facebook');
    }
    
    /**
     * Share on Twitter
     */
    shareOnTwitter() {
        const url = encodeURIComponent(this.currentShareData.share_url);
        const text = encodeURIComponent(`Check out this amazing virtual tour: ${this.currentShareData.tour_name}`);
        const shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        this.openShareWindow(shareUrl, 'Twitter');
    }
    
    /**
     * Share on LinkedIn
     */
    shareOnLinkedIn() {
        const url = encodeURIComponent(this.currentShareData.share_url);
        const title = encodeURIComponent(this.currentShareData.tour_name);
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`;
        this.openShareWindow(shareUrl, 'LinkedIn');
    }
    
    /**
     * Share on WhatsApp
     */
    shareOnWhatsApp() {
        if (this.currentShareData.social_preview && this.currentShareData.social_preview.sharing_urls) {
            window.open(this.currentShareData.social_preview.sharing_urls.whatsapp, 'share-whatsapp', 'width=600,height=400');
        } else {
            const text = encodeURIComponent(`Check out this amazing virtual tour: ${this.currentShareData.tour_name} ${this.currentShareData.share_url}`);
            const shareUrl = `https://wa.me/?text=${text}`;
            this.openShareWindow(shareUrl, 'WhatsApp');
        }
    }
    
    /**
     * Share on Telegram
     */
    shareOnTelegram() {
        if (this.currentShareData.social_preview && this.currentShareData.social_preview.sharing_urls) {
            window.open(this.currentShareData.social_preview.sharing_urls.telegram, 'share-telegram', 'width=600,height=400');
        } else {
            const url = encodeURIComponent(this.currentShareData.share_url);
            const text = encodeURIComponent(`Check out this amazing virtual tour: ${this.currentShareData.tour_name}`);
            const shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
            this.openShareWindow(shareUrl, 'Telegram');
        }
    }
    
    /**
     * Share on Pinterest
     */
    shareOnPinterest() {
        if (this.currentShareData.social_preview && this.currentShareData.social_preview.sharing_urls) {
            window.open(this.currentShareData.social_preview.sharing_urls.pinterest, 'share-pinterest', 'width=600,height=400');
        } else {
            const url = encodeURIComponent(this.currentShareData.share_url);
            const description = encodeURIComponent(`${this.currentShareData.tour_name} - Virtual Tour`);
            const media = this.currentShareData.social_preview ? encodeURIComponent(this.currentShareData.social_preview.image) : '';
            const shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`;
            this.openShareWindow(shareUrl, 'Pinterest');
        }
    }
    
    /**
     * Open share window
     */
    openShareWindow(url, platform) {
        const width = 600;
        const height = 400;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        window.open(
            url,
            `share-${platform.toLowerCase()}`,
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );
    }
    
    /**
     * Show loading in modal
     */
    showLoadingInModal(modal, message) {
        const loadingContent = modal.querySelector('.loading-content');
        const shareContent = modal.querySelector('.share-content, .embed-content');
        
        loadingContent.querySelector('p').textContent = message;
        loadingContent.style.display = 'block';
        if (shareContent) shareContent.style.display = 'none';
    }
    
    /**
     * Show error in modal
     */
    showErrorInModal(modal, message) {
        const loadingContent = modal.querySelector('.loading-content');
        loadingContent.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button class="btn-retry" onclick="this.closest('.loft-modal').style.display='none'">
                    Close
                </button>
            </div>
        `;
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `loft-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : type === 'warning' ? 'fa-exclamation' : 'fa-info'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.parentElement.style.display = 'none';
            }
        });
        
        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.loft-modal[style*="flex"]');
                if (openModal) {
                    openModal.style.display = 'none';
                }
            }
        });
    }
}

// Global instance for easy access
let loftTourSharing = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Will be initialized when tour engine is ready
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoftTourSharing;
}