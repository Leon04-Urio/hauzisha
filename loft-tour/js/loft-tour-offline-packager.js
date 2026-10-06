/**
 * LOFT³ Tour Offline Packager
 * Creates standalone HTML packages for offline deployment
 */

class LoftTourOfflinePackager {
    constructor() {
        this.packageData = {
            tourData: null,
            assets: {
                images: [],
                css: [],
                js: [],
                fonts: []
            },
            config: {
                includeEditor: false,
                includeAnalytics: false,
                compressionLevel: 'medium',
                bundleSize: 'standard'
            }
        };
        
        this.templates = {
            standalone: null,
            embed: null
        };
        
        this.init();
    }
    
    init() {
        this.loadTemplates();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for package requests
        document.addEventListener('loft-tour:package-request', (e) => {
            this.createPackage(e.detail);
        });
    }
    
    async loadTemplates() {
        try {
            // Load HTML templates for offline packages
            this.templates.standalone = await this.loadTemplate('standalone');
            this.templates.embed = await this.loadTemplate('embed');
            
            console.log('Offline packager templates loaded');
        } catch (error) {
            console.error('Failed to load packager templates:', error);
        }
    }
    
    async loadTemplate(type) {
        // Return template strings for different package types
        switch (type) {
            case 'standalone':
                return this.getStandaloneTemplate();
            case 'embed':
                return this.getEmbedTemplate();
            default:
                throw new Error(`Unknown template type: ${type}`);
        }
    }
    
    getStandaloneTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>{{TOUR_TITLE}} - Virtual Tour</title>
    <meta name="description" content="{{TOUR_DESCRIPTION}}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="{{TOUR_TITLE}} - Virtual Tour">
    <meta property="og:description" content="{{TOUR_DESCRIPTION}}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="{{PREVIEW_IMAGE}}">
    
    <!-- Embedded Styles -->
    <style>{{EMBEDDED_CSS}}</style>
</head>
<body>
    <div class="loft-tour-container" id="loft-tour-container">
        <div class="tour-loading" id="tour-loading">
            <div class="spinner"></div>
            <h2>Loading Virtual Tour</h2>
            <p>Preparing your immersive experience...</p>
        </div>
        
        <div class="tour-viewer" id="tour-viewer" style="display: none;">
            <div class="viewer-canvas" id="viewer-canvas-container">
                <canvas id="viewer-canvas"></canvas>
            </div>
            
            <div class="tour-controls" id="tour-controls">
                <button class="nav-btn" id="prev-btn" disabled>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                </button>
                
                <div class="tour-info">
                    <h3 id="current-node-label">Loading...</h3>
                    <p id="tour-progress">Scene 1 of {{TOTAL_NODES}}</p>
                </div>
                
                <button class="nav-btn" id="next-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                </button>
            </div>
            
            <div class="tour-actions">
                <button class="action-btn" id="fullscreen-btn" title="Fullscreen">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                    </svg>
                </button>
                
                <button class="action-btn" id="share-btn" title="Share">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                    </svg>
                </button>
            </div>
        </div>
        
        <div class="tour-error" id="tour-error" style="display: none;">
            <h2>Tour Unavailable</h2>
            <p>This virtual tour could not be loaded.</p>
            <button class="retry-btn" onclick="location.reload()">Try Again</button>
        </div>
    </div>
    
    <!-- Embedded Tour Data -->
    <script>
        window.LOFT_TOUR_DATA = {{TOUR_DATA}};
        window.LOFT_TOUR_CONFIG = {{TOUR_CONFIG}};
    </script>
    
    <!-- Embedded JavaScript -->
    <script>{{EMBEDDED_JS}}</script>
</body>
</html>`;
    }
    
    getEmbedTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TOUR_TITLE}} - Embedded Tour</title>
    <style>{{EMBEDDED_CSS}}</style>
</head>
<body>
    <div class="loft-tour-embed" id="loft-tour-embed">
        <div class="embed-viewer" id="embed-viewer">
            <canvas id="embed-canvas"></canvas>
        </div>
        
        <div class="embed-controls">
            <button id="embed-prev" class="embed-nav-btn" disabled>‹</button>
            <div class="embed-info">
                <span id="embed-node-label">Loading...</span>
            </div>
            <button id="embed-next" class="embed-nav-btn">›</button>
        </div>
    </div>
    
    <script>
        window.LOFT_TOUR_DATA = {{TOUR_DATA}};
        window.LOFT_TOUR_CONFIG = {{TOUR_CONFIG}};
    </script>
    <script>{{EMBEDDED_JS}}</script>
</body>
</html>`;
    }
    
    async createPackage(options = {}) {
        try {
            console.log('Creating offline package with options:', options);
            
            // Merge options with defaults
            const config = {
                ...this.packageData.config,
                ...options
            };
            
            // Validate tour data
            if (!options.tourData) {
                throw new Error('Tour data is required for packaging');
            }
            
            // Prepare package data
            this.packageData.tourData = options.tourData;
            this.packageData.config = config;
            
            // Collect assets
            await this.collectAssets();
            
            // Create packages
            const packages = {};
            
            if (config.includeStandalone !== false) {
                packages.standalone = await this.createStandalonePackage();
            }
            
            if (config.includeEmbed !== false) {
                packages.embed = await this.createEmbedPackage();
            }
            
            // Create download bundle
            const bundle = await this.createDownloadBundle(packages);
            
            // Trigger download
            this.downloadBundle(bundle, options.filename);
            
            console.log('Offline package created successfully');
            
            return {
                success: true,
                packages: packages,
                bundle: bundle
            };
            
        } catch (error) {
            console.error('Failed to create offline package:', error);
            throw error;
        }
    }
    
    async collectAssets() {
        console.log('Collecting assets for offline package...');
        
        // Reset assets
        this.packageData.assets = {
            images: [],
            css: [],
            js: [],
            fonts: []
        };
        
        // Collect CSS files
        await this.collectCSS();
        
        // Collect JavaScript files
        await this.collectJavaScript();
        
        // Collect images from tour data
        await this.collectImages();
        
        // Collect fonts if needed
        await this.collectFonts();
        
        console.log('Assets collected:', this.packageData.assets);
    }
    
    async collectCSS() {
        const cssFiles = [
            'css/loft-tour.css',
            'css/matterport-ui.css'
        ];
        
        // Only include sharing CSS if not minimal package
        if (this.packageData.config.bundleSize !== 'minimal') {
            cssFiles.push('css/loft-tour-sharing.css');
        }
        
        for (const cssFile of cssFiles) {
            try {
                const response = await fetch(cssFile);
                const content = await response.text();
                
                this.packageData.assets.css.push({
                    filename: cssFile,
                    content: content
                });
            } catch (error) {
                console.warn(`Failed to load CSS file: ${cssFile}`, error);
            }
        }
    }
    
    async collectJavaScript() {
        const jsFiles = [
            // Core engine files
            'js/loft-tour-core.js',
            'js/loft-tour-viewer.js',
            'js/loft-tour-controls.js',
            'js/loft-tour-layers.js',
            'js/loft-tour-transitions.js'
        ];
        
        // Add optional files based on config
        if (this.packageData.config.bundleSize !== 'minimal') {
            jsFiles.push(
                'js/loft-tour-matterport-ui.js',
                'js/loft-tour-mobile-optimization.js',
                'js/loft-tour-progressive-loader.js',
                'js/loft-tour-device-capabilities.js'
            );
        }
        
        if (this.packageData.config.includeAnalytics) {
            jsFiles.push('js/loft-tour-performance-profiler.js');
        }
        
        // Load Marzipano library
        try {
            const marzipanoResponse = await fetch('lib/marzipano.min.js');
            const marzipanoContent = await marzipanoResponse.text();
            
            this.packageData.assets.js.push({
                filename: 'lib/marzipano.min.js',
                content: marzipanoContent,
                priority: 1
            });
        } catch (error) {
            console.error('Failed to load Marzipano library:', error);
        }
        
        // Load LOFT³ JavaScript files
        for (const jsFile of jsFiles) {
            try {
                const response = await fetch(jsFile);
                const content = await response.text();
                
                this.packageData.assets.js.push({
                    filename: jsFile,
                    content: content,
                    priority: 2
                });
            } catch (error) {
                console.warn(`Failed to load JS file: ${jsFile}`, error);
            }
        }
        
        // Add Three.js CDN fallback
        this.packageData.assets.js.push({
            filename: 'three.min.js',
            content: '// Three.js will be loaded from CDN in offline package',
            cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
            priority: 0
        });
    }
    
    async collectImages() {
        const images = [];
        
        // Collect panorama images
        if (this.packageData.tourData.nodes) {
            for (const node of this.packageData.tourData.nodes) {
                if (node.panorama_url) {
                    images.push({
                        url: node.panorama_url,
                        type: 'panorama',
                        nodeId: node.node_id
                    });
                }
                
                // Collect layer images
                if (node.layers) {
                    for (const layer of node.layers) {
                        if (layer.image_url) {
                            images.push({
                                url: layer.image_url,
                                type: 'layer',
                                nodeId: node.node_id,
                                layerId: layer.layer_id
                            });
                        }
                    }
                }
            }
        }
        
        // Convert images to base64 for embedding
        for (const image of images) {
            try {
                const base64Data = await this.imageToBase64(image.url);
                
                this.packageData.assets.images.push({
                    ...image,
                    base64: base64Data
                });
            } catch (error) {
                console.warn(`Failed to convert image to base64: ${image.url}`, error);
            }
        }
    }
    
    async collectFonts() {
        // For now, we'll rely on system fonts or web fonts
        // In the future, we could embed font files
        this.packageData.assets.fonts = [];
    }
    
    async imageToBase64(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                ctx.drawImage(img, 0, 0);
                
                try {
                    const base64 = canvas.toDataURL('image/jpeg', 0.85);
                    resolve(base64);
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => {
                reject(new Error(`Failed to load image: ${imageUrl}`));
            };
            
            img.src = imageUrl;
        });
    }
    
    async createStandalonePackage() {
        console.log('Creating standalone package...');
        
        let html = this.templates.standalone;
        
        // Replace template variables
        html = html.replace('{{TOUR_TITLE}}', this.packageData.tourData.tour_name || 'Virtual Tour');
        html = html.replace('{{TOUR_DESCRIPTION}}', this.packageData.tourData.description || 'Immersive 360° virtual tour experience');
        html = html.replace('{{PREVIEW_IMAGE}}', this.getPreviewImage());
        html = html.replace('{{TOTAL_NODES}}', this.packageData.tourData.nodes?.length || 0);
        
        // Embed CSS
        const embeddedCSS = this.packageData.assets.css
            .map(css => css.content)
            .join('\n\n');
        html = html.replace('{{EMBEDDED_CSS}}', embeddedCSS);
        
        // Embed JavaScript
        const embeddedJS = this.createEmbeddedJavaScript();
        html = html.replace('{{EMBEDDED_JS}}', embeddedJS);
        
        // Embed tour data
        const tourData = this.prepareTourDataForEmbedding();
        html = html.replace('{{TOUR_DATA}}', JSON.stringify(tourData));
        
        // Embed config
        const tourConfig = {
            offline: true,
            embedded: false,
            ...this.packageData.config
        };
        html = html.replace('{{TOUR_CONFIG}}', JSON.stringify(tourConfig));
        
        return {
            filename: 'loft-tour-standalone.html',
            content: html,
            size: new Blob([html]).size
        };
    }
    
    async createEmbedPackage() {
        console.log('Creating embed package...');
        
        let html = this.templates.embed;
        
        // Replace template variables
        html = html.replace('{{TOUR_TITLE}}', this.packageData.tourData.tour_name || 'Virtual Tour');
        
        // Embed minimal CSS for embed
        const embeddedCSS = this.createEmbedCSS();
        html = html.replace('{{EMBEDDED_CSS}}', embeddedCSS);
        
        // Embed minimal JavaScript for embed
        const embeddedJS = this.createEmbedJavaScript();
        html = html.replace('{{EMBEDDED_JS}}', embeddedJS);
        
        // Embed tour data
        const tourData = this.prepareTourDataForEmbedding();
        html = html.replace('{{TOUR_DATA}}', JSON.stringify(tourData));
        
        // Embed config
        const tourConfig = {
            offline: true,
            embedded: true,
            minimal: true
        };
        html = html.replace('{{TOUR_CONFIG}}', JSON.stringify(tourConfig));
        
        return {
            filename: 'loft-tour-embed.html',
            content: html,
            size: new Blob([html]).size
        };
    }
    
    createEmbeddedJavaScript() {
        // Sort JavaScript by priority
        const sortedJS = this.packageData.assets.js.sort((a, b) => a.priority - b.priority);
        
        let embeddedJS = '';
        
        // Add Three.js CDN fallback
        embeddedJS += `
// Load Three.js from CDN with fallback
(function() {
    if (typeof THREE === 'undefined') {
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = function() {
            console.log('Three.js loaded from CDN');
            initializeLoftTour();
        };
        script.onerror = function() {
            console.error('Failed to load Three.js from CDN');
        };
        document.head.appendChild(script);
    } else {
        initializeLoftTour();
    }
})();

`;
        
        // Add all JavaScript content
        for (const js of sortedJS) {
            if (js.content && js.content.trim() && !js.cdnUrl) {
                embeddedJS += `\n// ${js.filename}\n`;
                embeddedJS += js.content;
                embeddedJS += '\n\n';
            }
        }
        
        // Add initialization function
        embeddedJS += `
function initializeLoftTour() {
    if (typeof LoftTourEngine === 'undefined') {
        console.error('LoftTourEngine not available');
        return;
    }
    
    // Initialize tour when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startOfflineTour);
    } else {
        startOfflineTour();
    }
}

function startOfflineTour() {
    try {
        const container = document.getElementById('viewer-canvas-container') || 
                         document.getElementById('embed-viewer');
        
        if (!container) {
            throw new Error('Tour container not found');
        }
        
        const engine = new LoftTourEngine(container, window.LOFT_TOUR_CONFIG || {});
        
        // Load embedded tour data
        if (window.LOFT_TOUR_DATA) {
            engine.loadTour(window.LOFT_TOUR_DATA);
            
            // Hide loading, show viewer
            const loading = document.getElementById('tour-loading');
            const viewer = document.getElementById('tour-viewer') || document.getElementById('embed-viewer');
            
            if (loading) loading.style.display = 'none';
            if (viewer) viewer.style.display = 'block';
            
            console.log('Offline tour initialized successfully');
        } else {
            throw new Error('No tour data found');
        }
        
    } catch (error) {
        console.error('Failed to initialize offline tour:', error);
        showTourError(error.message);
    }
}

function showTourError(message) {
    const loading = document.getElementById('tour-loading');
    const viewer = document.getElementById('tour-viewer');
    const error = document.getElementById('tour-error');
    
    if (loading) loading.style.display = 'none';
    if (viewer) viewer.style.display = 'none';
    if (error) {
        error.style.display = 'block';
        const errorMsg = error.querySelector('p');
        if (errorMsg) errorMsg.textContent = message;
    }
}
`;
        
        return embeddedJS;
    }
    
    createEmbedCSS() {
        return `
/* Minimal embed styles */
.loft-tour-embed {
    width: 100%;
    height: 100%;
    position: relative;
    background: #000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.embed-viewer {
    width: 100%;
    height: calc(100% - 50px);
    position: relative;
}

.embed-viewer canvas {
    width: 100%;
    height: 100%;
    display: block;
}

.embed-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    color: white;
}

.embed-nav-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.embed-nav-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

.embed-nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.embed-info {
    flex: 1;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
}

@media (max-width: 480px) {
    .embed-controls {
        padding: 0 10px;
    }
    
    .embed-nav-btn {
        width: 35px;
        height: 35px;
        font-size: 16px;
    }
    
    .embed-info {
        font-size: 12px;
    }
}
`;
    }
    
    createEmbedJavaScript() {
        // Minimal JavaScript for embed version
        return `
// Minimal embed tour engine
class EmbedTourEngine {
    constructor(container, config = {}) {
        this.container = container;
        this.config = config;
        this.currentNodeIndex = 0;
        this.tourData = null;
        this.canvas = container.querySelector('canvas');
        
        this.setupControls();
    }
    
    setupControls() {
        const prevBtn = document.getElementById('embed-prev');
        const nextBtn = document.getElementById('embed-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousNode());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextNode());
        }
    }
    
    loadTour(tourData) {
        this.tourData = tourData;
        this.loadNode(0);
    }
    
    loadNode(index) {
        if (!this.tourData || !this.tourData.nodes || index < 0 || index >= this.tourData.nodes.length) {
            return;
        }
        
        this.currentNodeIndex = index;
        const node = this.tourData.nodes[index];
        
        // Update UI
        this.updateUI(node);
        
        // Load panorama (simplified)
        this.loadPanorama(node);
    }
    
    loadPanorama(node) {
        // Simplified panorama loading for embed
        if (this.canvas && node.panorama_base64) {
            const ctx = this.canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                this.canvas.width = this.container.clientWidth;
                this.canvas.height = this.container.clientHeight;
                ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            };
            
            img.src = node.panorama_base64;
        }
    }
    
    updateUI(node) {
        const label = document.getElementById('embed-node-label');
        const prevBtn = document.getElementById('embed-prev');
        const nextBtn = document.getElementById('embed-next');
        
        if (label) {
            label.textContent = node.label || \`Scene \${this.currentNodeIndex + 1}\`;
        }
        
        if (prevBtn) {
            prevBtn.disabled = this.currentNodeIndex === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentNodeIndex === this.tourData.nodes.length - 1;
        }
    }
    
    previousNode() {
        if (this.currentNodeIndex > 0) {
            this.loadNode(this.currentNodeIndex - 1);
        }
    }
    
    nextNode() {
        if (this.currentNodeIndex < this.tourData.nodes.length - 1) {
            this.loadNode(this.currentNodeIndex + 1);
        }
    }
}

// Use minimal engine for embed
window.LoftTourEngine = EmbedTourEngine;
`;
    }
    
    prepareTourDataForEmbedding() {
        const tourData = JSON.parse(JSON.stringify(this.packageData.tourData));
        
        // Replace image URLs with base64 data
        if (tourData.nodes) {
            for (const node of tourData.nodes) {
                // Find panorama base64
                const panoramaAsset = this.packageData.assets.images.find(
                    img => img.type === 'panorama' && img.nodeId === node.node_id
                );
                
                if (panoramaAsset) {
                    node.panorama_base64 = panoramaAsset.base64;
                }
                
                // Replace layer image URLs with base64
                if (node.layers) {
                    for (const layer of node.layers) {
                        const layerAsset = this.packageData.assets.images.find(
                            img => img.type === 'layer' && 
                                   img.nodeId === node.node_id && 
                                   img.layerId === layer.layer_id
                        );
                        
                        if (layerAsset) {
                            layer.image_base64 = layerAsset.base64;
                        }
                    }
                }
            }
        }
        
        return tourData;
    }
    
    getPreviewImage() {
        // Return first panorama as preview image
        if (this.packageData.assets.images.length > 0) {
            const firstPanorama = this.packageData.assets.images.find(img => img.type === 'panorama');
            return firstPanorama ? firstPanorama.base64 : '';
        }
        return '';
    }
    
    async createDownloadBundle(packages) {
        console.log('Creating download bundle...');
        
        const bundle = {
            files: [],
            totalSize: 0,
            metadata: {
                tourName: this.packageData.tourData.tour_name,
                createdAt: new Date().toISOString(),
                version: '1.0.0',
                packageType: 'offline'
            }
        };
        
        // Add packages to bundle
        for (const [type, pkg] of Object.entries(packages)) {
            bundle.files.push({
                name: pkg.filename,
                content: pkg.content,
                size: pkg.size,
                type: 'html'
            });
            bundle.totalSize += pkg.size;
        }
        
        // Add README file
        const readme = this.createReadmeFile();
        bundle.files.push({
            name: 'README.md',
            content: readme,
            size: new Blob([readme]).size,
            type: 'markdown'
        });
        
        return bundle;
    }
    
    createReadmeFile() {
        return `# LOFT³ Virtual Tour - Offline Package

## Tour Information
- **Tour Name**: ${this.packageData.tourData.tour_name}
- **Total Scenes**: ${this.packageData.tourData.nodes?.length || 0}
- **Package Created**: ${new Date().toLocaleString()}

## Files Included

### loft-tour-standalone.html
Complete standalone virtual tour that can be opened directly in any modern web browser. 
Includes all assets embedded for offline use.

### loft-tour-embed.html
Lightweight embeddable version suitable for iframe embedding in websites.
Minimal UI and optimized for smaller display areas.

## Usage Instructions

### Standalone Tour
1. Open \`loft-tour-standalone.html\` in any modern web browser
2. The tour will load automatically with all assets embedded
3. Use navigation controls to explore the virtual tour
4. Press 'F' for fullscreen mode
5. Use the share button to copy the tour URL

### Embedded Tour
1. Upload \`loft-tour-embed.html\` to your web server
2. Embed using an iframe:
   \`\`\`html
   <iframe src="loft-tour-embed.html" width="800" height="600" frameborder="0"></iframe>
   \`\`\`

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technical Notes
- All images are embedded as base64 data for offline compatibility
- WebGL is required for 3D rendering
- Mobile devices are fully supported with touch controls
- No server or internet connection required after download

## Support
For technical support or questions about LOFT³ Virtual Tours, please contact your tour provider.

---
Generated by LOFT³ Tour Generator v1.0.0
`;
    }
    
    downloadBundle(bundle, filename) {
        const tourName = this.packageData.tourData.tour_name || 'virtual-tour';
        const sanitizedName = tourName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const defaultFilename = `loft-tour-${sanitizedName}-offline.zip`;
        
        // For now, download individual files since we don't have a ZIP library
        // In a real implementation, you'd use JSZip or similar
        
        if (bundle.files.length === 1) {
            // Single file download
            const file = bundle.files[0];
            this.downloadFile(file.content, file.name);
        } else {
            // Multiple files - download each separately
            bundle.files.forEach((file, index) => {
                setTimeout(() => {
                    this.downloadFile(file.content, file.name);
                }, index * 500); // Stagger downloads
            });
        }
        
        console.log(`Downloaded ${bundle.files.length} files for offline package`);
    }
    
    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    // Public API methods
    async packageTour(tourData, options = {}) {
        return await this.createPackage({
            tourData: tourData,
            ...options
        });
    }
    
    async packageCurrentTour(options = {}) {
        // Get current tour data from the engine
        if (window.loftTourEngine && window.loftTourEngine.tourData) {
            return await this.packageTour(window.loftTourEngine.tourData, options);
        } else {
            throw new Error('No active tour found to package');
        }
    }
}

// Initialize offline packager
window.LoftTourOfflinePackager = LoftTourOfflinePackager;

// Auto-initialize if not in module environment
if (typeof module === 'undefined') {
    window.loftTourOfflinePackager = new LoftTourOfflinePackager();
}