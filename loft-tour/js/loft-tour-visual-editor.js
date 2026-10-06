/**
 * LOFT³ Visual Layer Editor - Drag & Drop Layer Positioning
 * Provides visual interface for positioning and editing parallax layers
 */

class VisualLayerEditor {
    constructor(editorContainer, tourEngine) {
        this.container = editorContainer;
        this.engine = tourEngine;
        this.canvas = null;
        this.ctx = null;
        
        // Editor state
        this.currentNode = null;
        this.layers = [];
        this.selectedLayer = null;
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeHandle = null;
        
        // Visual settings
        this.previewScale = 1.0;
        this.canvasWidth = 800;
        this.canvasHeight = 400;
        this.handleSize = 8;
        this.gridSize = 20;
        this.showGrid = true;
        this.showGuides = true;
        
        // Layer library for reuse
        this.layerLibrary = new Map();
        
        // Interaction state
        this.mousePos = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };
        
        this.init();
    }
    
    /**
     * Initialize the visual editor
     */
    init() {
        this.createEditorInterface();
        this.setupEventHandlers();
        this.loadLayerLibrary();
        
        console.log('Visual Layer Editor initialized');
    }
    
    /**
     * Create the visual editor interface
     */
    createEditorInterface() {
        // Create main editor container
        const editorHtml = `
            <div class="visual-layer-editor">
                <div class="editor-canvas-container">
                    <canvas id="layer-editor-canvas" class="layer-editor-canvas"></canvas>
                    <div class="editor-overlay">
                        <div class="editor-tools">
                            <button class="tool-btn" id="select-tool" data-tool="select" title="Select Tool">
                                <i class="fas fa-mouse-pointer"></i>
                            </button>
                            <button class="tool-btn" id="move-tool" data-tool="move" title="Move Tool">
                                <i class="fas fa-arrows-alt"></i>
                            </button>
                            <button class="tool-btn" id="resize-tool" data-tool="resize" title="Resize Tool">
                                <i class="fas fa-expand-arrows-alt"></i>
                            </button>
                            <div class="tool-separator"></div>
                            <button class="tool-btn" id="grid-toggle" title="Toggle Grid">
                                <i class="fas fa-th"></i>
                            </button>
                            <button class="tool-btn" id="guides-toggle" title="Toggle Guides">
                                <i class="fas fa-ruler"></i>
                            </button>
                        </div>
                        
                        <div class="editor-info">
                            <div class="coordinates" id="mouse-coordinates">0, 0</div>
                            <div class="zoom-controls">
                                <button class="zoom-btn" onclick="visualEditor.zoomOut()">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="zoom-level" id="zoom-level">100%</span>
                                <button class="zoom-btn" onclick="visualEditor.zoomIn()">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="layer-properties-panel">
                    <div class="panel-header">
                        <h4>Layer Properties</h4>
                        <button class="btn-icon" onclick="visualEditor.addLayerFromLibrary()">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <div class="layer-properties" id="layer-properties">
                        <div class="no-selection">
                            <p>Select a layer to edit properties</p>
                        </div>
                    </div>
                    
                    <div class="layer-list" id="visual-layer-list">
                        <div class="layer-list-header">
                            <span>Layers</span>
                            <button class="btn-sm" onclick="visualEditor.showLayerLibrary()">
                                <i class="fas fa-book"></i> Library
                            </button>
                        </div>
                        <div class="layer-items" id="layer-items">
                            <div class="empty-layers">
                                <p>No layers added</p>
                                <button class="btn btn-outline btn-sm" onclick="visualEditor.addLayerFromLibrary()">
                                    <i class="fas fa-plus"></i> Add Layer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert into container
        this.container.innerHTML = editorHtml;
        
        // Get canvas reference
        this.canvas = document.getElementById('layer-editor-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        
        // Set initial tool
        this.currentTool = 'select';
        this.updateToolSelection();
    }
    
    /**
     * Setup event handlers for interaction
     */
    setupEventHandlers() {
        // Canvas mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                if (tool) {
                    this.setTool(tool);
                } else {
                    // Handle toggle buttons
                    const id = e.currentTarget.id;
                    if (id === 'grid-toggle') {
                        this.toggleGrid();
                    } else if (id === 'guides-toggle') {
                        this.toggleGuides();
                    }
                }
            });
        });
        
        // Window resize
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    
    /**
     * Handle mouse down events
     */
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.previewScale;
        const y = (e.clientY - rect.top) / this.previewScale;
        
        this.mousePos = { x, y };
        this.lastMousePos = { x, y };
        
        // Check for layer selection or resize handle
        const hitResult = this.hitTest(x, y);
        
        if (hitResult.type === 'layer') {
            this.selectLayer(hitResult.layer);
            
            if (this.currentTool === 'move' || this.currentTool === 'select') {
                this.isDragging = true;
                this.dragOffset = {
                    x: x - hitResult.layer.position.x,
                    y: y - hitResult.layer.position.y
                };
            }
        } else if (hitResult.type === 'handle') {
            this.isResizing = true;
            this.resizeHandle = hitResult.handle;
            this.selectLayer(hitResult.layer);
        } else {
            // Clicked on empty space
            this.selectLayer(null);
        }
        
        this.redraw();
    }
    
    /**
     * Handle mouse move events
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.previewScale;
        const y = (e.clientY - rect.top) / this.previewScale;
        
        this.mousePos = { x, y };
        
        // Update coordinates display
        const coordsEl = document.getElementById('mouse-coordinates');
        if (coordsEl) {
            const normalizedX = (x / this.canvasWidth).toFixed(3);
            const normalizedY = (y / this.canvasHeight).toFixed(3);
            coordsEl.textContent = `${normalizedX}, ${normalizedY}`;
        }
        
        // Handle dragging
        if (this.isDragging && this.selectedLayer) {
            const newX = x - this.dragOffset.x;
            const newY = y - this.dragOffset.y;
            
            // Constrain to canvas bounds
            this.selectedLayer.position.x = Math.max(0, Math.min(this.canvasWidth, newX));
            this.selectedLayer.position.y = Math.max(0, Math.min(this.canvasHeight, newY));
            
            this.updateLayerProperties();
            this.redraw();
        }
        
        // Handle resizing
        if (this.isResizing && this.selectedLayer && this.resizeHandle) {
            this.resizeLayer(this.selectedLayer, this.resizeHandle, x, y);
            this.updateLayerProperties();
            this.redraw();
        }
        
        // Update cursor based on hover
        this.updateCursor(x, y);
        
        this.lastMousePos = { x, y };
    }
    
    /**
     * Handle mouse up events
     */
    handleMouseUp(e) {
        if (this.isDragging || this.isResizing) {
            // Save changes to layer data
            if (this.selectedLayer) {
                this.saveLayerChanges(this.selectedLayer);
            }
        }
        
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
        this.canvas.style.cursor = 'default';
    }
    
    /**
     * Handle mouse wheel for zooming
     */
    handleWheel(e) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.max(0.25, Math.min(3.0, this.previewScale + delta));
        
        if (newScale !== this.previewScale) {
            this.previewScale = newScale;
            this.updateZoomDisplay();
            this.redraw();
        }
    }
    
    /**
     * Handle context menu for layer options
     */
    handleContextMenu(e) {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.previewScale;
        const y = (e.clientY - rect.top) / this.previewScale;
        
        const hitResult = this.hitTest(x, y);
        
        if (hitResult.type === 'layer') {
            this.showLayerContextMenu(hitResult.layer, e.clientX, e.clientY);
        }
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyDown(e) {
        if (!this.selectedLayer) return;
        
        switch (e.key) {
            case 'Delete':
            case 'Backspace':
                this.deleteLayer(this.selectedLayer);
                break;
            case 'Escape':
                this.selectLayer(null);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedLayer.position.y -= e.shiftKey ? 10 : 1;
                this.updateLayerProperties();
                this.redraw();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.selectedLayer.position.y += e.shiftKey ? 10 : 1;
                this.updateLayerProperties();
                this.redraw();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.selectedLayer.position.x -= e.shiftKey ? 10 : 1;
                this.updateLayerProperties();
                this.redraw();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.selectedLayer.position.x += e.shiftKey ? 10 : 1;
                this.updateLayerProperties();
                this.redraw();
                break;
        }
    }
    
    /**
     * Hit test to find what's under the mouse
     */
    hitTest(x, y) {
        // Check resize handles first (if layer is selected)
        if (this.selectedLayer) {
            const handle = this.getResizeHandle(this.selectedLayer, x, y);
            if (handle) {
                return { type: 'handle', handle, layer: this.selectedLayer };
            }
        }
        
        // Check layers (reverse order for top-to-bottom)
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            if (this.isPointInLayer(layer, x, y)) {
                return { type: 'layer', layer };
            }
        }
        
        return { type: 'empty' };
    }
    
    /**
     * Check if point is inside layer bounds
     */
    isPointInLayer(layer, x, y) {
        const bounds = this.getLayerBounds(layer);
        return x >= bounds.left && x <= bounds.right && 
               y >= bounds.top && y <= bounds.bottom;
    }
    
    /**
     * Get layer bounds for hit testing
     */
    getLayerBounds(layer) {
        const halfWidth = (layer.width * layer.scale) / 2;
        const halfHeight = (layer.height * layer.scale) / 2;
        
        return {
            left: layer.position.x - halfWidth,
            right: layer.position.x + halfWidth,
            top: layer.position.y - halfHeight,
            bottom: layer.position.y + halfHeight
        };
    }
    
    /**
     * Get resize handle at position
     */
    getResizeHandle(layer, x, y) {
        const bounds = this.getLayerBounds(layer);
        const handleSize = this.handleSize;
        
        // Check each corner handle
        const handles = [
            { name: 'nw', x: bounds.left, y: bounds.top },
            { name: 'ne', x: bounds.right, y: bounds.top },
            { name: 'sw', x: bounds.left, y: bounds.bottom },
            { name: 'se', x: bounds.right, y: bounds.bottom }
        ];
        
        for (const handle of handles) {
            if (Math.abs(x - handle.x) <= handleSize && 
                Math.abs(y - handle.y) <= handleSize) {
                return handle.name;
            }
        }
        
        return null;
    }
    
    /**
     * Resize layer based on handle and mouse position
     */
    resizeLayer(layer, handle, mouseX, mouseY) {
        const bounds = this.getLayerBounds(layer);
        const centerX = layer.position.x;
        const centerY = layer.position.y;
        
        let newScale = layer.scale;
        
        switch (handle) {
            case 'se':
                // Bottom-right handle - scale based on distance from center
                const distX = Math.abs(mouseX - centerX);
                const distY = Math.abs(mouseY - centerY);
                const maxDist = Math.max(distX, distY);
                newScale = (maxDist * 2) / Math.max(layer.width, layer.height);
                break;
            case 'nw':
                // Top-left handle
                const distX2 = Math.abs(mouseX - centerX);
                const distY2 = Math.abs(mouseY - centerY);
                const maxDist2 = Math.max(distX2, distY2);
                newScale = (maxDist2 * 2) / Math.max(layer.width, layer.height);
                break;
            // Add other handles as needed
        }
        
        // Constrain scale
        layer.scale = Math.max(0.1, Math.min(5.0, newScale));
    }
    
    /**
     * Update cursor based on hover state
     */
    updateCursor(x, y) {
        const hitResult = this.hitTest(x, y);
        
        if (hitResult.type === 'handle') {
            // Set resize cursor based on handle
            const cursors = {
                'nw': 'nw-resize',
                'ne': 'ne-resize',
                'sw': 'sw-resize',
                'se': 'se-resize'
            };
            this.canvas.style.cursor = cursors[hitResult.handle] || 'default';
        } else if (hitResult.type === 'layer') {
            this.canvas.style.cursor = this.currentTool === 'move' ? 'move' : 'pointer';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }
    
    /**
     * Select a layer
     */
    selectLayer(layer) {
        this.selectedLayer = layer;
        this.updateLayerList();
        this.updateLayerProperties();
        this.redraw();
    }
    
    /**
     * Load node for editing
     */
    loadNode(nodeData) {
        this.currentNode = nodeData;
        this.layers = [];
        
        // Convert node layers to editor format
        if (nodeData.layers) {
            nodeData.layers.forEach((layerData, index) => {
                this.addLayerFromData(layerData, index);
            });
        }
        
        this.selectLayer(null);
        this.updateLayerList();
        this.redraw();
        
        console.log('Visual editor loaded node:', nodeData.id);
    }
    
    /**
     * Add layer from layer data
     */
    addLayerFromData(layerData, index) {
        const layer = {
            id: layerData.id || `layer_${index}`,
            name: layerData.name || layerData.image,
            image: layerData.image,
            imageUrl: layerData.imageUrl,
            position: {
                x: (layerData.position?.x || 0.5) * this.canvasWidth,
                y: (layerData.position?.y || 0.5) * this.canvasHeight
            },
            scale: layerData.scale || 1.0,
            opacity: layerData.opacity || 1.0,
            parallaxFactor: layerData.parallaxFactor || 0.5,
            rotation: layerData.rotation || 0,
            width: 100, // Will be updated when image loads
            height: 100,
            imageElement: null,
            visible: true
        };
        
        // Load image
        this.loadLayerImage(layer);
        
        this.layers.push(layer);
        return layer;
    }
    
    /**
     * Load image for layer
     */
    loadLayerImage(layer) {
        const img = new Image();
        img.onload = () => {
            layer.imageElement = img;
            layer.width = img.width;
            layer.height = img.height;
            this.redraw();
        };
        img.onerror = () => {
            console.error('Failed to load layer image:', layer.image);
        };
        img.src = layer.imageUrl || layer.image;
    }
    
    /**
     * Redraw the canvas
     */
    redraw() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context
        this.ctx.save();
        
        // Apply zoom
        this.ctx.scale(this.previewScale, this.previewScale);
        
        // Draw background
        this.drawBackground();
        
        // Draw grid
        if (this.showGrid) {
            this.drawGrid();
        }
        
        // Draw layers
        this.layers.forEach(layer => {
            if (layer.visible) {
                this.drawLayer(layer);
            }
        });
        
        // Draw selection and handles
        if (this.selectedLayer) {
            this.drawSelection(this.selectedLayer);
            this.drawResizeHandles(this.selectedLayer);
        }
        
        // Draw guides
        if (this.showGuides && this.selectedLayer) {
            this.drawGuides(this.selectedLayer);
        }
        
        // Restore context
        this.ctx.restore();
    }
    
    /**
     * Draw background
     */
    drawBackground() {
        // Draw panorama background if available
        if (this.currentNode && this.currentNode.imageUrl) {
            // Load and draw the actual panorama image
            if (!this.backgroundImage || this.backgroundImage.src !== this.currentNode.imageUrl) {
                this.backgroundImage = new Image();
                this.backgroundImage.onload = () => {
                    this.redraw(); // Redraw when image loads
                };
                this.backgroundImage.src = this.currentNode.imageUrl;
            }
            
            // Draw the panorama image if loaded
            if (this.backgroundImage && this.backgroundImage.complete) {
                // Calculate aspect ratio to fit the canvas
                const imgAspect = this.backgroundImage.width / this.backgroundImage.height;
                const canvasAspect = this.canvasWidth / this.canvasHeight;
                
                let drawWidth, drawHeight, drawX, drawY;
                
                if (imgAspect > canvasAspect) {
                    // Image is wider than canvas
                    drawHeight = this.canvasHeight;
                    drawWidth = drawHeight * imgAspect;
                    drawX = (this.canvasWidth - drawWidth) / 2;
                    drawY = 0;
                } else {
                    // Image is taller than canvas
                    drawWidth = this.canvasWidth;
                    drawHeight = drawWidth / imgAspect;
                    drawX = 0;
                    drawY = (this.canvasHeight - drawHeight) / 2;
                }
                
                this.ctx.drawImage(this.backgroundImage, drawX, drawY, drawWidth, drawHeight);
                
                // Add subtle overlay for better layer visibility
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            } else {
                // Show loading placeholder while image loads
                this.ctx.fillStyle = '#f8f9fa';
                this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                
                // Loading text
                this.ctx.fillStyle = '#6c757d';
                this.ctx.font = '16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('Loading panorama...', this.canvasWidth / 2, this.canvasHeight / 2);
            }
            
            // Draw center crosshair for reference
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvasWidth / 2, 0);
            this.ctx.lineTo(this.canvasWidth / 2, this.canvasHeight);
            this.ctx.moveTo(0, this.canvasHeight / 2);
            this.ctx.lineTo(this.canvasWidth, this.canvasHeight / 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        } else {
            // No panorama available
            this.ctx.fillStyle = '#e9ecef';
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            
            // Placeholder text
            this.ctx.fillStyle = '#6c757d';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('Select a node to view panorama', this.canvasWidth / 2, this.canvasHeight / 2);
        }
    }
    
    /**
     * Draw grid
     */
    drawGrid() {
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let x = 0; x <= this.canvasWidth; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvasHeight);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.canvasHeight; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvasWidth, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw a layer
     */
    drawLayer(layer) {
        if (!layer.imageElement) return;
        
        this.ctx.save();
        
        // Set opacity
        this.ctx.globalAlpha = layer.opacity;
        
        // Calculate draw size
        const drawWidth = layer.width * layer.scale;
        const drawHeight = layer.height * layer.scale;
        
        // Draw image centered at position
        this.ctx.drawImage(
            layer.imageElement,
            layer.position.x - drawWidth / 2,
            layer.position.y - drawHeight / 2,
            drawWidth,
            drawHeight
        );
        
        this.ctx.restore();
    }
    
    /**
     * Draw selection outline
     */
    drawSelection(layer) {
        const bounds = this.getLayerBounds(layer);
        
        this.ctx.strokeStyle = '#007bff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([]);
        
        this.ctx.strokeRect(
            bounds.left,
            bounds.top,
            bounds.right - bounds.left,
            bounds.bottom - bounds.top
        );
    }
    
    /**
     * Draw resize handles
     */
    drawResizeHandles(layer) {
        const bounds = this.getLayerBounds(layer);
        const handleSize = this.handleSize;
        
        const handles = [
            { x: bounds.left, y: bounds.top },
            { x: bounds.right, y: bounds.top },
            { x: bounds.left, y: bounds.bottom },
            { x: bounds.right, y: bounds.bottom }
        ];
        
        this.ctx.fillStyle = '#007bff';
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        
        handles.forEach(handle => {
            this.ctx.fillRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
            this.ctx.strokeRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
        });
    }
    
    /**
     * Draw alignment guides
     */
    drawGuides(layer) {
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([3, 3]);
        
        // Center guides
        this.ctx.beginPath();
        this.ctx.moveTo(layer.position.x, 0);
        this.ctx.lineTo(layer.position.x, this.canvasHeight);
        this.ctx.moveTo(0, layer.position.y);
        this.ctx.lineTo(this.canvasWidth, layer.position.y);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }
    
    /**
     * Update layer properties panel
     */
    updateLayerProperties() {
        const panel = document.getElementById('layer-properties');
        
        if (!this.selectedLayer) {
            panel.innerHTML = `
                <div class="no-selection">
                    <p>Select a layer to edit properties</p>
                </div>
            `;
            return;
        }
        
        const layer = this.selectedLayer;
        const normalizedX = (layer.position.x / this.canvasWidth).toFixed(3);
        const normalizedY = (layer.position.y / this.canvasHeight).toFixed(3);
        
        panel.innerHTML = `
            <div class="property-group">
                <label>Name</label>
                <input type="text" id="layer-name" value="${layer.name}" 
                       onchange="visualEditor.updateLayerProperty('name', this.value)">
            </div>
            
            <div class="property-group">
                <label>Position</label>
                <div class="position-inputs">
                    <input type="number" id="layer-x" value="${normalizedX}" 
                           step="0.001" min="0" max="1"
                           onchange="visualEditor.updateLayerPosition('x', this.value)">
                    <input type="number" id="layer-y" value="${normalizedY}" 
                           step="0.001" min="0" max="1"
                           onchange="visualEditor.updateLayerPosition('y', this.value)">
                </div>
            </div>
            
            <div class="property-group">
                <label>Scale: <span id="scale-value">${layer.scale.toFixed(2)}</span></label>
                <input type="range" id="layer-scale" value="${layer.scale}" 
                       min="0.1" max="3" step="0.1"
                       oninput="visualEditor.updateLayerProperty('scale', parseFloat(this.value))">
            </div>
            
            <div class="property-group">
                <label>Opacity: <span id="opacity-value">${Math.round(layer.opacity * 100)}%</span></label>
                <input type="range" id="layer-opacity" value="${layer.opacity}" 
                       min="0" max="1" step="0.01"
                       oninput="visualEditor.updateLayerProperty('opacity', parseFloat(this.value))">
            </div>
            
            <div class="property-group">
                <label>Parallax Factor: <span id="parallax-value">${layer.parallaxFactor.toFixed(2)}</span></label>
                <input type="range" id="layer-parallax" value="${layer.parallaxFactor}" 
                       min="0" max="1" step="0.01"
                       oninput="visualEditor.updateLayerProperty('parallaxFactor', parseFloat(this.value))">
            </div>
            
            <div class="property-group">
                <label>Rotation: <span id="rotation-value">${layer.rotation}°</span></label>
                <input type="range" id="layer-rotation" value="${layer.rotation}" 
                       min="-180" max="180" step="1"
                       oninput="visualEditor.updateLayerProperty('rotation', parseFloat(this.value))">
            </div>
            
            <div class="property-actions">
                <button class="btn btn-outline btn-sm" onclick="visualEditor.duplicateLayer()">
                    <i class="fas fa-copy"></i> Duplicate
                </button>
                <button class="btn btn-outline btn-sm" onclick="visualEditor.saveToLibrary()">
                    <i class="fas fa-bookmark"></i> Save to Library
                </button>
                <button class="btn btn-danger btn-sm" onclick="visualEditor.deleteSelectedLayer()">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
    }
    
    /**
     * Update layer list
     */
    updateLayerList() {
        const container = document.getElementById('layer-items');
        
        if (this.layers.length === 0) {
            container.innerHTML = `
                <div class="empty-layers">
                    <p>No layers added</p>
                    <button class="btn btn-outline btn-sm" onclick="visualEditor.addLayerFromLibrary()">
                        <i class="fas fa-plus"></i> Add Layer
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.layers.map((layer, index) => `
            <div class="layer-item ${layer === this.selectedLayer ? 'selected' : ''}" 
                 onclick="visualEditor.selectLayerByIndex(${index})">
                <div class="layer-thumbnail">
                    ${layer.imageElement ? 
                        `<img src="${layer.imageElement.src}" alt="${layer.name}">` : 
                        '<div class="loading-thumbnail"></div>'
                    }
                </div>
                <div class="layer-info">
                    <div class="layer-name">${layer.name}</div>
                    <div class="layer-details">
                        Scale: ${layer.scale.toFixed(1)}x | 
                        Parallax: ${layer.parallaxFactor.toFixed(2)}
                    </div>
                </div>
                <div class="layer-actions">
                    <button class="btn-icon" onclick="event.stopPropagation(); visualEditor.toggleLayerVisibility(${index})" 
                            title="${layer.visible ? 'Hide' : 'Show'}">
                        <i class="fas fa-${layer.visible ? 'eye' : 'eye-slash'}"></i>
                    </button>
                    <button class="btn-icon" onclick="event.stopPropagation(); visualEditor.deleteLayerByIndex(${index})" 
                            title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Update layer property
     */
    updateLayerProperty(property, value) {
        if (!this.selectedLayer) return;
        
        this.selectedLayer[property] = value;
        
        // Update display values
        const displays = {
            'scale': 'scale-value',
            'opacity': 'opacity-value',
            'parallaxFactor': 'parallax-value',
            'rotation': 'rotation-value'
        };
        
        if (displays[property]) {
            const el = document.getElementById(displays[property]);
            if (el) {
                if (property === 'opacity') {
                    el.textContent = Math.round(value * 100) + '%';
                } else if (property === 'rotation') {
                    el.textContent = value + '°';
                } else {
                    el.textContent = value.toFixed(2);
                }
            }
        }
        
        this.saveLayerChanges(this.selectedLayer);
        this.updateLayerList();
        this.redraw();
    }
    
    /**
     * Update layer position from input
     */
    updateLayerPosition(axis, value) {
        if (!this.selectedLayer) return;
        
        const normalizedValue = parseFloat(value);
        
        if (axis === 'x') {
            this.selectedLayer.position.x = normalizedValue * this.canvasWidth;
        } else if (axis === 'y') {
            this.selectedLayer.position.y = normalizedValue * this.canvasHeight;
        }
        
        this.saveLayerChanges(this.selectedLayer);
        this.redraw();
    }
    
    /**
     * Save layer changes back to node data
     */
    saveLayerChanges(layer) {
        if (!this.currentNode || !this.currentNode.layers) return;
        
        // Find corresponding layer in node data
        const nodeLayer = this.currentNode.layers.find(l => l.id === layer.id || l.image === layer.image);
        
        if (nodeLayer) {
            // Update node layer data
            nodeLayer.position = {
                x: layer.position.x / this.canvasWidth,
                y: layer.position.y / this.canvasHeight
            };
            nodeLayer.scale = layer.scale;
            nodeLayer.opacity = layer.opacity;
            nodeLayer.parallaxFactor = layer.parallaxFactor;
            nodeLayer.rotation = layer.rotation;
            nodeLayer.name = layer.name;
        }
        
        console.log('Layer changes saved:', layer.id);
    }
    
    /**
     * Select layer by index
     */
    selectLayerByIndex(index) {
        if (index >= 0 && index < this.layers.length) {
            this.selectLayer(this.layers[index]);
        }
    }
    
    /**
     * Toggle layer visibility
     */
    toggleLayerVisibility(index) {
        if (index >= 0 && index < this.layers.length) {
            this.layers[index].visible = !this.layers[index].visible;
            this.updateLayerList();
            this.redraw();
        }
    }
    
    /**
     * Delete layer by index
     */
    deleteLayerByIndex(index) {
        if (index >= 0 && index < this.layers.length) {
            const layer = this.layers[index];
            this.deleteLayer(layer);
        }
    }
    
    /**
     * Delete selected layer
     */
    deleteSelectedLayer() {
        if (this.selectedLayer) {
            this.deleteLayer(this.selectedLayer);
        }
    }
    
    /**
     * Delete a layer
     */
    deleteLayer(layer) {
        const index = this.layers.indexOf(layer);
        if (index !== -1) {
            // Remove from layers array
            this.layers.splice(index, 1);
            
            // Remove from node data
            if (this.currentNode && this.currentNode.layers) {
                const nodeLayerIndex = this.currentNode.layers.findIndex(l => 
                    l.id === layer.id || l.image === layer.image
                );
                if (nodeLayerIndex !== -1) {
                    this.currentNode.layers.splice(nodeLayerIndex, 1);
                }
            }
            
            // Clear selection if this was selected
            if (this.selectedLayer === layer) {
                this.selectLayer(null);
            }
            
            this.updateLayerList();
            this.redraw();
            
            console.log('Layer deleted:', layer.id);
        }
    }
    
    /**
     * Duplicate selected layer
     */
    duplicateLayer() {
        if (!this.selectedLayer) return;
        
        const original = this.selectedLayer;
        const duplicate = {
            ...original,
            id: `${original.id}_copy`,
            name: `${original.name} Copy`,
            position: {
                x: original.position.x + 20,
                y: original.position.y + 20
            }
        };
        
        this.layers.push(duplicate);
        
        // Add to node data
        if (this.currentNode) {
            if (!this.currentNode.layers) {
                this.currentNode.layers = [];
            }
            
            this.currentNode.layers.push({
                id: duplicate.id,
                name: duplicate.name,
                image: duplicate.image,
                position: {
                    x: duplicate.position.x / this.canvasWidth,
                    y: duplicate.position.y / this.canvasHeight
                },
                scale: duplicate.scale,
                opacity: duplicate.opacity,
                parallaxFactor: duplicate.parallaxFactor,
                rotation: duplicate.rotation
            });
        }
        
        this.selectLayer(duplicate);
        this.updateLayerList();
        this.redraw();
    }
    
    /**
     * Save layer to library for reuse
     */
    saveToLibrary() {
        if (!this.selectedLayer) return;
        
        const layer = this.selectedLayer;
        
        // Convert image to base64 for storage
        if (layer.imageElement) {
            const canvas = document.createElement('canvas');
            canvas.width = layer.imageElement.width;
            canvas.height = layer.imageElement.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(layer.imageElement, 0, 0);
            
            const imageData = canvas.toDataURL('image/png');
            
            const libraryLayerData = {
                name: layer.name,
                description: `Layer saved from ${this.currentNode?.label || 'unknown node'}`,
                image: layer.image,
                imageUrl: layer.imageUrl,
                imageData: imageData,
                width: layer.width,
                height: layer.height,
                scale: layer.scale,
                opacity: layer.opacity,
                parallaxFactor: layer.parallaxFactor,
                rotation: layer.rotation,
                thumbnail: imageData
            };
            
            if (window.layerLibrary) {
                const layerId = window.layerLibrary.saveLayer(libraryLayerData, 'custom', []);
                console.log('Layer saved to library with ID:', layerId);
                
                // Show success message
                this.showNotification('Layer saved to library!', 'success');
            } else {
                console.error('Layer library not available');
                this.showNotification('Layer library not available', 'error');
            }
        } else {
            console.error('Layer image not loaded');
            this.showNotification('Layer image not ready', 'error');
        }
    }
    
    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `editor-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to editor container
        this.container.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
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
     * Show layer library modal
     */
    showLayerLibrary() {
        if (window.layerLibraryUI) {
            window.layerLibraryUI.show((layerData) => {
                // Add layer from library to current node
                this.addLayerFromLibraryData(layerData);
            });
        } else {
            console.error('Layer library not available');
        }
    }
    
    /**
     * Add layer from library data
     */
    addLayerFromLibraryData(libraryLayerData) {
        const layer = {
            id: libraryLayerData.id,
            name: libraryLayerData.name,
            image: libraryLayerData.image,
            imageUrl: libraryLayerData.imageUrl || libraryLayerData.imageData,
            position: {
                x: this.canvasWidth / 2,
                y: this.canvasHeight / 2
            },
            scale: libraryLayerData.scale,
            opacity: libraryLayerData.opacity,
            parallaxFactor: libraryLayerData.parallaxFactor,
            rotation: libraryLayerData.rotation,
            width: libraryLayerData.width || 100,
            height: libraryLayerData.height || 100,
            imageElement: null,
            visible: true,
            libraryId: libraryLayerData.libraryId
        };
        
        this.loadLayerImage(layer);
        this.layers.push(layer);
        
        // Add to node data
        if (this.currentNode) {
            if (!this.currentNode.layers) {
                this.currentNode.layers = [];
            }
            
            this.currentNode.layers.push({
                id: layer.id,
                name: layer.name,
                image: layer.image,
                imageUrl: layer.imageUrl,
                position: {
                    x: layer.position.x / this.canvasWidth,
                    y: layer.position.y / this.canvasHeight
                },
                scale: layer.scale,
                opacity: layer.opacity,
                parallaxFactor: layer.parallaxFactor,
                rotation: layer.rotation,
                libraryId: layer.libraryId
            });
        }
        
        this.selectLayer(layer);
        this.updateLayerList();
        this.redraw();
        
        console.log('Layer added from library:', layer.name);
    }
    
    /**
     * Add layer from library
     */
    addLayerFromLibrary() {
        // For now, just show file picker
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.addLayerFromFile(file);
            }
        };
        input.click();
    }
    
    /**
     * Add layer from file
     */
    addLayerFromFile(file) {
        const layer = {
            id: `layer_${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ""),
            image: file.name,
            imageUrl: URL.createObjectURL(file),
            position: {
                x: this.canvasWidth / 2,
                y: this.canvasHeight / 2
            },
            scale: 1.0,
            opacity: 1.0,
            parallaxFactor: 0.5,
            rotation: 0,
            width: 100,
            height: 100,
            imageElement: null,
            visible: true
        };
        
        this.loadLayerImage(layer);
        this.layers.push(layer);
        
        // Add to node data
        if (this.currentNode) {
            if (!this.currentNode.layers) {
                this.currentNode.layers = [];
            }
            
            this.currentNode.layers.push({
                id: layer.id,
                name: layer.name,
                image: layer.image,
                imageUrl: layer.imageUrl,
                position: {
                    x: layer.position.x / this.canvasWidth,
                    y: layer.position.y / this.canvasHeight
                },
                scale: layer.scale,
                opacity: layer.opacity,
                parallaxFactor: layer.parallaxFactor,
                rotation: layer.rotation
            });
        }
        
        this.selectLayer(layer);
        this.updateLayerList();
        this.redraw();
    }
    
    /**
     * Set current tool
     */
    setTool(tool) {
        this.currentTool = tool;
        this.updateToolSelection();
    }
    
    /**
     * Update tool selection UI
     */
    updateToolSelection() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tool="${this.currentTool}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
    
    /**
     * Toggle grid display
     */
    toggleGrid() {
        this.showGrid = !this.showGrid;
        document.getElementById('grid-toggle').classList.toggle('active', this.showGrid);
        this.redraw();
    }
    
    /**
     * Toggle guides display
     */
    toggleGuides() {
        this.showGuides = !this.showGuides;
        document.getElementById('guides-toggle').classList.toggle('active', this.showGuides);
        this.redraw();
    }
    
    /**
     * Zoom in
     */
    zoomIn() {
        this.previewScale = Math.min(3.0, this.previewScale + 0.25);
        this.updateZoomDisplay();
        this.redraw();
    }
    
    /**
     * Zoom out
     */
    zoomOut() {
        this.previewScale = Math.max(0.25, this.previewScale - 0.25);
        this.updateZoomDisplay();
        this.redraw();
    }
    
    /**
     * Update zoom display
     */
    updateZoomDisplay() {
        const zoomEl = document.getElementById('zoom-level');
        if (zoomEl) {
            zoomEl.textContent = Math.round(this.previewScale * 100) + '%';
        }
    }
    
    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Update canvas dimensions for drawing
        this.canvasWidth = Math.min(800, rect.width - 40);
        this.canvasHeight = this.canvasWidth / 2; // 2:1 aspect ratio for panoramas
        
        this.redraw();
    }
    
    /**
     * Load layer library from storage
     */
    loadLayerLibrary() {
        try {
            const stored = localStorage.getItem('loft-layer-library');
            if (stored) {
                const data = JSON.parse(stored);
                this.layerLibrary = new Map(Object.entries(data));
            }
        } catch (error) {
            console.error('Failed to load layer library:', error);
        }
    }
    
    /**
     * Save layer library to storage
     */
    saveLayerLibrary() {
        try {
            const data = Object.fromEntries(this.layerLibrary);
            localStorage.setItem('loft-layer-library', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save layer library:', error);
        }
    }
    
    /**
     * Show layer context menu
     */
    showLayerContextMenu(layer, x, y) {
        // Create context menu
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.position = 'fixed';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        menu.innerHTML = `
            <div class="context-menu-item" onclick="visualEditor.selectLayer(visualEditor.layers.find(l => l.id === '${layer.id}'))">
                <i class="fas fa-mouse-pointer"></i> Select
            </div>
            <div class="context-menu-item" onclick="visualEditor.duplicateLayer()">
                <i class="fas fa-copy"></i> Duplicate
            </div>
            <div class="context-menu-item" onclick="visualEditor.saveToLibrary()">
                <i class="fas fa-bookmark"></i> Save to Library
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item danger" onclick="visualEditor.deleteLayer(visualEditor.layers.find(l => l.id === '${layer.id}'))">
                <i class="fas fa-trash"></i> Delete
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Remove menu on click outside
        const removeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', removeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', removeMenu);
        }, 100);
    }
    
    /**
     * Export layer data for current node
     */
    exportLayerData() {
        return this.layers.map(layer => ({
            id: layer.id,
            name: layer.name,
            image: layer.image,
            position: {
                x: layer.position.x / this.canvasWidth,
                y: layer.position.y / this.canvasHeight
            },
            scale: layer.scale,
            opacity: layer.opacity,
            parallaxFactor: layer.parallaxFactor,
            rotation: layer.rotation
        }));
    }
}

// Export for global use
window.VisualLayerEditor = VisualLayerEditor;