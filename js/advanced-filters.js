// Advanced Property Filters System
// Handles comprehensive filtering with all property attributes

class PropertyFilters {
    constructor() {
        this.filters = {
            status: null,
            location: '',
            type: '',
            minPrice: null,
            maxPrice: null,
            beds: null,
            baths: null,
            minSize: null,
            maxSize: null,
            facilities: [],
            verified_agent: null,
            featured: false,
            rating: null
        };
        
        this.init();
    }
    
    init() {
        this.setupToggleButtons();
        this.setupMultiSelectButtons();
        this.setupPricePresets();
        this.setupSizePresets();
        this.setupApplyButton();
        this.loadSavedFilters();
    }
    
    setupToggleButtons() {
        // Handle single-select toggle buttons (status, beds, baths, rating, verification)
        document.querySelectorAll('.filter-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = btn.dataset.filter;
                const value = btn.dataset.value;
                
                // Remove active class from siblings
                const siblings = document.querySelectorAll(`[data-filter="${filterType}"]`);
                siblings.forEach(sib => sib.classList.remove('active', 'btn-dark'));
                siblings.forEach(sib => sib.classList.add('btn-outline-dark'));
                
                // Toggle current button
                if (this.filters[filterType] === value) {
                    // Deselect if clicking same button
                    this.filters[filterType] = null;
                    btn.classList.remove('active', 'btn-dark');
                    btn.classList.add('btn-outline-dark');
                } else {
                    // Select new value
                    this.filters[filterType] = value;
                    btn.classList.add('active', 'btn-dark');
                    btn.classList.remove('btn-outline-dark');
                }
            });
        });
    }
    
    setupMultiSelectButtons() {
        // Handle multi-select buttons (facilities)
        document.querySelectorAll('.filter-multi-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = btn.dataset.filter;
                const value = btn.dataset.value;
                
                btn.classList.toggle('active');
                btn.classList.toggle('btn-dark');
                btn.classList.toggle('btn-outline-dark');
                
                if (btn.classList.contains('active')) {
                    // Add to array
                    if (!this.filters[filterType].includes(value)) {
                        this.filters[filterType].push(value);
                    }
                } else {
                    // Remove from array
                    this.filters[filterType] = this.filters[filterType].filter(v => v !== value);
                }
            });
        });
    }
    
    setupPricePresets() {
        document.querySelectorAll('.price-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const min = btn.dataset.min;
                const max = btn.dataset.max;
                
                document.getElementById('minPriceInput').value = min;
                document.getElementById('maxPriceInput').value = max;
                
                // Remove active from all presets
                document.querySelectorAll('.price-preset').forEach(b => {
                    b.classList.remove('active', 'btn-secondary');
                    b.classList.add('btn-outline-secondary');
                });
                
                // Add active to clicked preset
                btn.classList.add('active', 'btn-secondary');
                btn.classList.remove('btn-outline-secondary');
            });
        });
    }
    
    setupSizePresets() {
        document.querySelectorAll('.size-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const min = btn.dataset.min;
                const max = btn.dataset.max;
                
                document.getElementById('minSizeInput').value = min;
                document.getElementById('maxSizeInput').value = max;
                
                // Remove active from all presets
                document.querySelectorAll('.size-preset').forEach(b => {
                    b.classList.remove('active', 'btn-secondary');
                    b.classList.add('btn-outline-secondary');
                });
                
                // Add active to clicked preset
                btn.classList.add('active', 'btn-secondary');
                btn.classList.remove('btn-outline-secondary');
            });
        });
    }
    
    setupApplyButton() {
        document.getElementById('applyFiltersBtn').addEventListener('click', () => {
            this.collectFilters();
            this.applyFilters();
            this.saveFilters();
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('filterModal'));
            if (modal) modal.hide();
            
            showToast('Filters applied successfully', 'success');
        });
    }
    
    collectFilters() {
        // Collect all filter values
        this.filters.location = document.getElementById('locationInput').value.trim();
        this.filters.type = document.getElementById('propertyTypeSelect').value;
        this.filters.minPrice = document.getElementById('minPriceInput').value ? parseInt(document.getElementById('minPriceInput').value) : null;
        this.filters.maxPrice = document.getElementById('maxPriceInput').value ? parseInt(document.getElementById('maxPriceInput').value) : null;
        this.filters.minSize = document.getElementById('minSizeInput').value ? parseInt(document.getElementById('minSizeInput').value) : null;
        this.filters.maxSize = document.getElementById('maxSizeInput').value ? parseInt(document.getElementById('maxSizeInput').value) : null;
        this.filters.featured = document.getElementById('featuredOnlyCheck').checked;
    }
    
    applyFilters() {
        // Trigger property reload with filters
        if (typeof window.loadPropertiesWithFilters === 'function') {
            window.loadPropertiesWithFilters(this.filters);
        } else {
            console.warn('loadPropertiesWithFilters function not found');
        }
        
        // Update active filter count badge
        this.updateFilterBadge();
    }
    
    clearAllFilters() {
        // Reset all filter values
        this.filters = {
            status: null,
            location: '',
            type: '',
            minPrice: null,
            maxPrice: null,
            beds: null,
            baths: null,
            minSize: null,
            maxSize: null,
            facilities: [],
            verified_agent: null,
            featured: false,
            rating: null
        };
        
        // Clear UI
        document.getElementById('locationInput').value = '';
        document.getElementById('propertyTypeSelect').value = '';
        document.getElementById('minPriceInput').value = '';
        document.getElementById('maxPriceInput').value = '';
        document.getElementById('minSizeInput').value = '';
        document.getElementById('maxSizeInput').value = '';
        document.getElementById('featuredOnlyCheck').checked = false;
        
        // Remove all active classes
        document.querySelectorAll('.filter-toggle-btn, .filter-multi-btn').forEach(btn => {
            btn.classList.remove('active', 'btn-dark', 'btn-secondary');
            btn.classList.add('btn-outline-dark');
        });
        
        document.querySelectorAll('.price-preset, .size-preset').forEach(btn => {
            btn.classList.remove('active', 'btn-secondary');
            btn.classList.add('btn-outline-secondary');
        });
        
        // Apply cleared filters
        this.applyFilters();
        localStorage.removeItem('propertyFilters');
    }
    
    saveFilters() {
        localStorage.setItem('propertyFilters', JSON.stringify(this.filters));
    }
    
    loadSavedFilters() {
        const saved = localStorage.getItem('propertyFilters');
        if (saved) {
            try {
                this.filters = JSON.parse(saved);
                this.restoreUIFromFilters();
            } catch (e) {
                console.error('Failed to load saved filters:', e);
            }
        }
    }
    
    restoreUIFromFilters() {
        // Restore UI state from saved filters
        if (this.filters.location) {
            document.getElementById('locationInput').value = this.filters.location;
        }
        if (this.filters.type) {
            document.getElementById('propertyTypeSelect').value = this.filters.type;
        }
        if (this.filters.minPrice) {
            document.getElementById('minPriceInput').value = this.filters.minPrice;
        }
        if (this.filters.maxPrice) {
            document.getElementById('maxPriceInput').value = this.filters.maxPrice;
        }
        if (this.filters.minSize) {
            document.getElementById('minSizeInput').value = this.filters.minSize;
        }
        if (this.filters.maxSize) {
            document.getElementById('maxSizeInput').value = this.filters.maxSize;
        }
        if (this.filters.featured) {
            document.getElementById('featuredOnlyCheck').checked = true;
        }
        
        // Restore toggle buttons
        ['status', 'beds', 'baths', 'rating', 'verified_agent'].forEach(filterType => {
            if (this.filters[filterType]) {
                const btn = document.querySelector(`[data-filter="${filterType}"][data-value="${this.filters[filterType]}"]`);
                if (btn) {
                    btn.classList.add('active', 'btn-dark');
                    btn.classList.remove('btn-outline-dark');
                }
            }
        });
        
        // Restore facilities
        if (this.filters.facilities && this.filters.facilities.length > 0) {
            this.filters.facilities.forEach(facility => {
                const btn = document.querySelector(`[data-filter="facilities"][data-value="${facility}"]`);
                if (btn) {
                    btn.classList.add('active', 'btn-dark');
                    btn.classList.remove('btn-outline-dark');
                }
            });
        }
    }
    
    updateFilterBadge() {
        const activeCount = this.getActiveFilterCount();
        const filterBtn = document.getElementById('filterBtn');
        
        // Remove existing badge
        const existingBadge = filterBtn.querySelector('.filter-badge');
        if (existingBadge) existingBadge.remove();
        
        // Add new badge if filters are active
        if (activeCount > 0) {
            const badge = document.createElement('span');
            badge.className = 'filter-badge';
            badge.textContent = activeCount;
            badge.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: #fff;
                color: #000;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.7rem;
                font-weight: bold;
            `;
            filterBtn.style.position = 'relative';
            filterBtn.appendChild(badge);
        }
    }
    
    getActiveFilterCount() {
        let count = 0;
        if (this.filters.status) count++;
        if (this.filters.location) count++;
        if (this.filters.type) count++;
        if (this.filters.minPrice || this.filters.maxPrice) count++;
        if (this.filters.beds) count++;
        if (this.filters.baths) count++;
        if (this.filters.minSize || this.filters.maxSize) count++;
        if (this.filters.facilities.length > 0) count++;
        if (this.filters.verification) count++;
        if (this.filters.featured) count++;
        if (this.filters.rating) count++;
        return count;
    }
    
    getFilters() {
        return this.filters;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.propertyFilters = new PropertyFilters();
});
