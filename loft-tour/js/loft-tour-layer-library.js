/**
 * LOFT³ Layer Library - Reusable Layer Management
 * Provides functionality to save, organize, and reuse layers across properties
 */

class LayerLibrary {
    constructor() {
        this.library = new Map();
        this.categories = new Map();
        this.tags = new Set();
        
        // Default categories
        this.defaultCategories = [
            { id: 'furniture', name: 'Furniture', icon: 'fas fa-couch' },
            { id: 'vehicles', name: 'Vehicles', icon: 'fas fa-car' },
            { id: 'decorations', name: 'Decorations', icon: 'fas fa-palette' },
            { id: 'lighting', name: 'Lighting', icon: 'fas fa-lightbulb' },
            { id: 'plants', name: 'Plants', icon: 'fas fa-leaf' },
            { id: 'people', name: 'People', icon: 'fas fa-user' },
            { id: 'signs', name: 'Signs & Text', icon: 'fas fa-sign' },
            { id: 'effects', name: 'Effects', icon: 'fas fa-magic' },
            { id: 'custom', name: 'Custom', icon: 'fas fa-star' }
        ];
        
        this.init();
    }
    
    /**
     * Initialize the layer library
     */
    init() {
        this.loadLibrary();
        this.initializeCategories();
        
        console.log('Layer Library initialized');
    }
    
    /**
     * Initialize default categories
     */
    initializeCategories() {
        this.defaultCategories.forEach(category => {
            if (!this.categories.has(category.id)) {
                this.categories.set(category.id, {
                    ...category,
                    layers: [],
                    createdAt: new Date().toISOString()
                });
            }
        });
    }
    
    /**
     * Save a layer to the library
     */
    saveLayer(layerData, categoryId = 'custom', tags = []) {
        const libraryItem = {
            id: `lib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: layerData.name || 'Unnamed Layer',
            description: layerData.description || '',
            category: categoryId,
            tags: Array.isArray(tags) ? tags : [],
            
            // Layer properties
            image: layerData.image,
            imageUrl: layerData.imageUrl,
            imageData: layerData.imageData, // Base64 data for storage
            width: layerData.width || 100,
            height: layerData.height || 100,
            
            // Default properties
            defaultScale: layerData.scale || 1.0,
            defaultOpacity: layerData.opacity || 1.0,
            defaultParallaxFactor: layerData.parallaxFactor || 0.5,
            defaultRotation: layerData.rotation || 0,
            
            // Metadata
            createdAt: new Date().toISOString(),
            usageCount: 0,
            lastUsed: null,
            
            // Preview thumbnail
            thumbnail: layerData.thumbnail || layerData.imageUrl
        };
        
        // Add to library
        this.library.set(libraryItem.id, libraryItem);
        
        // Add to category
        const category = this.categories.get(categoryId);
        if (category) {
            category.layers.push(libraryItem.id);
        }
        
        // Add tags
        tags.forEach(tag => this.tags.add(tag.toLowerCase()));
        
        // Save to storage
        this.saveLibrary();
        
        console.log('Layer saved to library:', libraryItem.name);
        return libraryItem.id;
    }
    
    /**
     * Get layer from library
     */
    getLayer(layerId) {
        return this.library.get(layerId);
    }
    
    /**
     * Get all layers in a category
     */
    getLayersByCategory(categoryId) {
        const category = this.categories.get(categoryId);
        if (!category) return [];
        
        return category.layers.map(layerId => this.library.get(layerId)).filter(Boolean);
    }
    
    /**
     * Search layers by name, tags, or description
     */
    searchLayers(query) {
        const searchTerm = query.toLowerCase();
        const results = [];
        
        this.library.forEach(layer => {
            const matchesName = layer.name.toLowerCase().includes(searchTerm);
            const matchesDescription = layer.description.toLowerCase().includes(searchTerm);
            const matchesTags = layer.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            
            if (matchesName || matchesDescription || matchesTags) {
                results.push(layer);
            }
        });
        
        return results.sort((a, b) => b.usageCount - a.usageCount);
    }
    
    /**
     * Get popular layers (most used)
     */
    getPopularLayers(limit = 10) {
        return Array.from(this.library.values())
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, limit);
    }
    
    /**
     * Get recent layers
     */
    getRecentLayers(limit = 10) {
        return Array.from(this.library.values())
            .filter(layer => layer.lastUsed)
            .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
            .slice(0, limit);
    }
    
    /**
     * Use a layer (increment usage count)
     */
    useLayer(layerId) {
        const layer = this.library.get(layerId);
        if (layer) {
            layer.usageCount++;
            layer.lastUsed = new Date().toISOString();
            this.saveLibrary();
            
            return {
                id: `layer_${Date.now()}`,
                name: layer.name,
                image: layer.image,
                imageUrl: layer.imageUrl,
                imageData: layer.imageData,
                width: layer.width,
                height: layer.height,
                scale: layer.defaultScale,
                opacity: layer.defaultOpacity,
                parallaxFactor: layer.defaultParallaxFactor,
                rotation: layer.defaultRotation,
                libraryId: layerId
            };
        }
        
        return null;
    }
    
    /**
     * Delete layer from library
     */
    deleteLayer(layerId) {
        const layer = this.library.get(layerId);
        if (!layer) return false;
        
        // Remove from library
        this.library.delete(layerId);
        
        // Remove from category
        const category = this.categories.get(layer.category);
        if (category) {
            const index = category.layers.indexOf(layerId);
            if (index !== -1) {
                category.layers.splice(index, 1);
            }
        }
        
        this.saveLibrary();
        console.log('Layer deleted from library:', layer.name);
        return true;
    }
    
    /**
     * Update layer in library
     */
    updateLayer(layerId, updates) {
        const layer = this.library.get(layerId);
        if (!layer) return false;
        
        // Update properties
        Object.assign(layer, updates);
        layer.updatedAt = new Date().toISOString();
        
        this.saveLibrary();
        console.log('Layer updated in library:', layer.name);
        return true;
    }
    
    /**
     * Create new category
     */
    createCategory(name, icon = 'fas fa-folder') {
        const categoryId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        if (this.categories.has(categoryId)) {
            return null; // Category already exists
        }
        
        const category = {
            id: categoryId,
            name: name,
            icon: icon,
            layers: [],
            createdAt: new Date().toISOString()
        };
        
        this.categories.set(categoryId, category);
        this.saveLibrary();
        
        console.log('Category created:', name);
        return categoryId;
    }
    
    /**
     * Get all categories
     */
    getCategories() {
        return Array.from(this.categories.values());
    }
    
    /**
     * Get all tags
     */
    getTags() {
        return Array.from(this.tags);
    }
    
    /**
     * Export library data
     */
    exportLibrary() {
        return {
            library: Object.fromEntries(this.library),
            categories: Object.fromEntries(this.categories),
            tags: Array.from(this.tags),
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }
    
    /**
     * Import library data
     */
    importLibrary(data) {
        try {
            if (data.library) {
                this.library = new Map(Object.entries(data.library));
            }
            
            if (data.categories) {
                this.categories = new Map(Object.entries(data.categories));
            }
            
            if (data.tags) {
                this.tags = new Set(data.tags);
            }
            
            this.saveLibrary();
            console.log('Library imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import library:', error);
            return false;
        }
    }
    
    /**
     * Load library from storage
     */
    loadLibrary() {
        try {
            const stored = localStorage.getItem('loft-layer-library');
            if (stored) {
                const data = JSON.parse(stored);
                
                if (data.library) {
                    this.library = new Map(Object.entries(data.library));
                }
                
                if (data.categories) {
                    this.categories = new Map(Object.entries(data.categories));
                }
                
                if (data.tags) {
                    this.tags = new Set(data.tags);
                }
                
                console.log('Layer library loaded from storage');
            }
        } catch (error) {
            console.error('Failed to load layer library:', error);
        }
    }
    
    /**
     * Save library to storage
     */
    saveLibrary() {
        try {
            const data = {
                library: Object.fromEntries(this.library),
                categories: Object.fromEntries(this.categories),
                tags: Array.from(this.tags),
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('loft-layer-library', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save layer library:', error);
        }
    }
    
    /**
     * Get library statistics
     */
    getStats() {
        const totalLayers = this.library.size;
        const totalCategories = this.categories.size;
        const totalTags = this.tags.size;
        
        const categoryStats = {};
        this.categories.forEach((category, id) => {
            categoryStats[id] = {
                name: category.name,
                count: category.layers.length
            };
        });
        
        const mostUsedLayer = Array.from(this.library.values())
            .reduce((max, layer) => layer.usageCount > (max?.usageCount || 0) ? layer : max, null);
        
        return {
            totalLayers,
            totalCategories,
            totalTags,
            categoryStats,
            mostUsedLayer: mostUsedLayer ? {
                name: mostUsedLayer.name,
                usageCount: mostUsedLayer.usageCount
            } : null
        };
    }
}

/**
 * Layer Library UI Manager
 * Handles the user interface for the layer library
 */
class LayerLibraryUI {
    constructor(layerLibrary) {
        this.library = layerLibrary;
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.selectedLayers = new Set();
        
        this.modal = null;
        this.isVisible = false;
    }
    
    /**
     * Show the layer library modal
     */
    show(onLayerSelect = null) {
        this.onLayerSelect = onLayerSelect;
        this.createModal();
        this.renderContent();
        this.isVisible = true;
    }
    
    /**
     * Hide the layer library modal
     */
    hide() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
        this.isVisible = false;
    }
    
    /**
     * Create the modal structure
     */
    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'layer-library-modal';
        this.modal.innerHTML = `
            <div class="modal-backdrop" onclick="layerLibraryUI.hide()"></div>
            <div class="modal-content layer-library-content">
                <div class="modal-header">
                    <h3><i class="fas fa-book"></i> Layer Library</h3>
                    <div class="header-actions">
                        <button class="btn-icon" onclick="layerLibraryUI.showImportExport()" title="Import/Export">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                        <button class="btn-icon" onclick="layerLibraryUI.hide()" title="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="modal-body">
                    <div class="library-sidebar">
                        <div class="search-box">
                            <input type="text" id="library-search" placeholder="Search layers..." 
                                   oninput="layerLibraryUI.handleSearch(this.value)">
                            <i class="fas fa-search"></i>
                        </div>
                        
                        <div class="category-list" id="category-list">
                            <!-- Categories will be rendered here -->
                        </div>
                        
                        <div class="library-stats" id="library-stats">
                            <!-- Stats will be rendered here -->
                        </div>
                    </div>
                    
                    <div class="library-main">
                        <div class="library-toolbar">
                            <div class="toolbar-left">
                                <span class="current-category" id="current-category">All Layers</span>
                                <span class="layer-count" id="layer-count">0 layers</span>
                            </div>
                            <div class="toolbar-right">
                                <button class="btn btn-outline btn-sm" onclick="layerLibraryUI.showUploadDialog()">
                                    <i class="fas fa-plus"></i> Add Layer
                                </button>
                            </div>
                        </div>
                        
                        <div class="layer-grid" id="layer-grid">
                            <!-- Layers will be rendered here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
    }
    
    /**
     * Render the modal content
     */
    renderContent() {
        this.renderCategories();
        this.renderLayers();
        this.renderStats();
    }
    
    /**
     * Render category list
     */
    renderCategories() {
        const container = document.getElementById('category-list');
        const categories = this.library.getCategories();
        
        const allCount = this.library.library.size;
        
        let html = `
            <div class="category-item ${this.currentCategory === 'all' ? 'active' : ''}" 
                 onclick="layerLibraryUI.selectCategory('all')">
                <i class="fas fa-th"></i>
                <span>All Layers</span>
                <span class="count">${allCount}</span>
            </div>
            
            <div class="category-item ${this.currentCategory === 'recent' ? 'active' : ''}" 
                 onclick="layerLibraryUI.selectCategory('recent')">
                <i class="fas fa-clock"></i>
                <span>Recent</span>
                <span class="count">${this.library.getRecentLayers().length}</span>
            </div>
            
            <div class="category-item ${this.currentCategory === 'popular' ? 'active' : ''}" 
                 onclick="layerLibraryUI.selectCategory('popular')">
                <i class="fas fa-star"></i>
                <span>Popular</span>
                <span class="count">${this.library.getPopularLayers().length}</span>
            </div>
            
            <div class="category-separator"></div>
        `;
        
        categories.forEach(category => {
            const isActive = this.currentCategory === category.id;
            html += `
                <div class="category-item ${isActive ? 'active' : ''}" 
                     onclick="layerLibraryUI.selectCategory('${category.id}')">
                    <i class="${category.icon}"></i>
                    <span>${category.name}</span>
                    <span class="count">${category.layers.length}</span>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    /**
     * Render layer grid
     */
    renderLayers() {
        const container = document.getElementById('layer-grid');
        let layers = [];
        
        if (this.searchQuery) {
            layers = this.library.searchLayers(this.searchQuery);
        } else if (this.currentCategory === 'all') {
            layers = Array.from(this.library.library.values());
        } else if (this.currentCategory === 'recent') {
            layers = this.library.getRecentLayers();
        } else if (this.currentCategory === 'popular') {
            layers = this.library.getPopularLayers();
        } else {
            layers = this.library.getLayersByCategory(this.currentCategory);
        }
        
        // Update layer count
        const countEl = document.getElementById('layer-count');
        if (countEl) {
            countEl.textContent = `${layers.length} layer${layers.length !== 1 ? 's' : ''}`;
        }
        
        if (layers.length === 0) {
            container.innerHTML = `
                <div class="empty-library">
                    <i class="fas fa-layer-group"></i>
                    <h4>No layers found</h4>
                    <p>Add some layers to your library to get started</p>
                    <button class="btn btn-primary" onclick="layerLibraryUI.showUploadDialog()">
                        <i class="fas fa-plus"></i> Add Layer
                    </button>
                </div>
            `;
            return;
        }
        
        const html = layers.map(layer => `
            <div class="layer-card" onclick="layerLibraryUI.selectLayer('${layer.id}')">
                <div class="layer-thumbnail">
                    <img src="${layer.thumbnail}" alt="${layer.name}" loading="lazy">
                    <div class="layer-overlay">
                        <button class="btn-icon" onclick="event.stopPropagation(); layerLibraryUI.useLayer('${layer.id}')" 
                                title="Use Layer">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn-icon" onclick="event.stopPropagation(); layerLibraryUI.editLayer('${layer.id}')" 
                                title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon danger" onclick="event.stopPropagation(); layerLibraryUI.deleteLayer('${layer.id}')" 
                                title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="layer-info">
                    <div class="layer-name">${layer.name}</div>
                    <div class="layer-meta">
                        <span class="usage-count">
                            <i class="fas fa-chart-bar"></i> ${layer.usageCount}
                        </span>
                        ${layer.tags.length > 0 ? `
                            <span class="tag-count">
                                <i class="fas fa-tags"></i> ${layer.tags.length}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }
    
    /**
     * Render library statistics
     */
    renderStats() {
        const container = document.getElementById('library-stats');
        const stats = this.library.getStats();
        
        container.innerHTML = `
            <div class="stats-header">Library Stats</div>
            <div class="stat-item">
                <span class="stat-label">Total Layers:</span>
                <span class="stat-value">${stats.totalLayers}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Categories:</span>
                <span class="stat-value">${stats.totalCategories}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Tags:</span>
                <span class="stat-value">${stats.totalTags}</span>
            </div>
            ${stats.mostUsedLayer ? `
                <div class="stat-item">
                    <span class="stat-label">Most Used:</span>
                    <span class="stat-value">${stats.mostUsedLayer.name}</span>
                </div>
            ` : ''}
        `;
    }
    
    /**
     * Select a category
     */
    selectCategory(categoryId) {
        this.currentCategory = categoryId;
        this.searchQuery = '';
        
        // Clear search
        const searchInput = document.getElementById('library-search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Update category name
        const categoryNameEl = document.getElementById('current-category');
        if (categoryNameEl) {
            if (categoryId === 'all') {
                categoryNameEl.textContent = 'All Layers';
            } else if (categoryId === 'recent') {
                categoryNameEl.textContent = 'Recent Layers';
            } else if (categoryId === 'popular') {
                categoryNameEl.textContent = 'Popular Layers';
            } else {
                const category = this.library.categories.get(categoryId);
                categoryNameEl.textContent = category ? category.name : 'Unknown Category';
            }
        }
        
        this.renderCategories();
        this.renderLayers();
    }
    
    /**
     * Handle search input
     */
    handleSearch(query) {
        this.searchQuery = query.trim();
        this.renderLayers();
    }
    
    /**
     * Use a layer (add to current node)
     */
    useLayer(layerId) {
        const layerData = this.library.useLayer(layerId);
        
        if (layerData && this.onLayerSelect) {
            this.onLayerSelect(layerData);
            this.hide();
        }
    }
    
    /**
     * Select a layer for detailed view
     */
    selectLayer(layerId) {
        // For now, just use the layer
        this.useLayer(layerId);
    }
    
    /**
     * Edit a layer
     */
    editLayer(layerId) {
        // Implementation for layer editing
        console.log('Edit layer:', layerId);
    }
    
    /**
     * Delete a layer
     */
    deleteLayer(layerId) {
        if (confirm('Are you sure you want to delete this layer from the library?')) {
            this.library.deleteLayer(layerId);
            this.renderContent();
        }
    }
    
    /**
     * Show upload dialog
     */
    showUploadDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png';
        input.multiple = true;
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => this.uploadLayer(file));
        };
        input.click();
    }
    
    /**
     * Upload a layer to the library
     */
    async uploadLayer(file) {
        try {
            // Convert file to base64 for storage
            const imageData = await this.fileToBase64(file);
            
            const layerData = {
                name: file.name.replace(/\.[^/.]+$/, ""),
                image: file.name,
                imageUrl: URL.createObjectURL(file),
                imageData: imageData,
                scale: 1.0,
                opacity: 1.0,
                parallaxFactor: 0.5,
                rotation: 0
            };
            
            // Get image dimensions
            const dimensions = await this.getImageDimensions(file);
            if (dimensions) {
                layerData.width = dimensions.width;
                layerData.height = dimensions.height;
            }
            
            // Save to library
            this.library.saveLayer(layerData, 'custom', []);
            this.renderContent();
            
            console.log('Layer uploaded to library:', layerData.name);
        } catch (error) {
            console.error('Failed to upload layer:', error);
        }
    }
    
    /**
     * Convert file to base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
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
            img.onerror = () => resolve(null);
            img.src = URL.createObjectURL(file);
        });
    }
    
    /**
     * Show import/export dialog
     */
    showImportExport() {
        // Implementation for import/export functionality
        console.log('Show import/export dialog');
    }
}

// Global instances
window.layerLibrary = new LayerLibrary();
window.layerLibraryUI = new LayerLibraryUI(window.layerLibrary);

// Export for use in other modules
window.LayerLibrary = LayerLibrary;
window.LayerLibraryUI = LayerLibraryUI;