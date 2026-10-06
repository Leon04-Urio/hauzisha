// Simple Smart Search with Google Places
class SmartSearch {
    constructor() {
        this.locationInput = null;
        this.typeInput = null;
        this.modalLocationInput = null;
        this.googleAutocomplete = null;
        this.modalGoogleAutocomplete = null;
        
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSearch());
        } else {
            this.setupSearch();
        }
        
        // Check if Google Places is ready
        if (window.googlePlacesReady) {
            setTimeout(() => this.initGooglePlaces(), 100);
        }
    }
    
    setupSearch() {
        // Find inputs
        this.locationInput = document.querySelector('.search-item input[placeholder="Where?"]');
        this.modalLocationInput = document.getElementById('locationInput');
        this.typeInput = document.querySelector('.search-item input[placeholder="Add Type"]');
        this.modalTypeSelect = document.querySelector('.modal-body1 select');
        
        // Setup type dropdown (custom)
        if (this.typeInput) {
            this.setupTypeDropdown(this.typeInput);
        }
        
        if (this.modalTypeSelect) {
            this.loadPropertyTypes();
        }
        
        // Google Places will be initialized when API loads
        if (window.google && window.google.maps && window.google.maps.places) {
            this.initGooglePlaces();
        }
    }
    
    initGooglePlaces() {
        console.log('Initializing Google Places...');
        
        if (this.locationInput && !this.googleAutocomplete) {
            this.setupGooglePlaces(this.locationInput, 'main');
        }
        
        if (this.modalLocationInput && !this.modalGoogleAutocomplete) {
            this.setupGooglePlaces(this.modalLocationInput, 'modal');
        }
    }
    
    setupGooglePlaces(input, type) {
        if (!window.google?.maps?.places) {
            console.warn('Google Places not available');
            return;
        }
        
        try {
            const options = {
                types: ['(regions)'],
                componentRestrictions: { country: 'ke' },
                fields: ['formatted_address', 'name', 'place_id']
            };
            
            const autocomplete = new google.maps.places.Autocomplete(input, options);
            
            if (type === 'main') {
                this.googleAutocomplete = autocomplete;
            } else {
                this.modalGoogleAutocomplete = autocomplete;
            }
            
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.formatted_address || place.name) {
                    input.value = place.formatted_address || place.name;
                    if (type === 'main') {
                        setTimeout(() => this.triggerSearch(), 100);
                    }
                }
            });
            
            console.log(`Google Places setup complete for ${type}`);
            
        } catch (error) {
            console.error('Google Places error:', error);
        }
    }
    
    setupTypeDropdown(input) {
        const container = input.parentElement;
        container.style.position = 'relative';
        
        const dropdown = document.createElement('div');
        dropdown.className = 'type-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 0 0 8px 8px;
            max-height: 250px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        container.appendChild(dropdown);
        
        input.style.cursor = 'pointer';
        input.addEventListener('click', () => {
            if (dropdown.style.display === 'none') {
                this.loadPropertyTypesForDropdown(dropdown, input);
            } else {
                dropdown.style.display = 'none';
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }
    
    async loadPropertyTypesForDropdown(dropdown, input) {
        try {
            const response = await fetch('api/search-suggestions.php?type=property-types');
            const data = await response.json();
            
            if (data.success) {
                this.displayTypeDropdown(data.data, dropdown, input);
            }
        } catch (error) {
            console.error('Error loading property types:', error);
        }
    }
    
    displayTypeDropdown(types, dropdown, input) {
        dropdown.innerHTML = '';
        
        // Add "Any" option
        const anyItem = document.createElement('div');
        anyItem.textContent = 'Any Type';
        anyItem.style.cssText = `
            padding: 12px 16px;
            cursor: pointer;
            border-bottom: 1px solid #f0f0f0;
            font-weight: 500;
        `;
        
        anyItem.addEventListener('click', () => {
            input.value = '';
            input.placeholder = 'Any Type';
            dropdown.style.display = 'none';
            this.triggerSearch();
        });
        
        anyItem.addEventListener('mouseenter', () => {
            anyItem.style.backgroundColor = '#f8f9fa';
        });
        
        anyItem.addEventListener('mouseleave', () => {
            anyItem.style.backgroundColor = '';
        });
        
        dropdown.appendChild(anyItem);
        
        // Add property types
        types.forEach(type => {
            const item = document.createElement('div');
            item.innerHTML = `
                <span>${type.label.split(' (')[0]}</span>
                <span style="color: #666; font-size: 0.9em;">(${type.count})</span>
            `;
            item.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f8f9fa';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = '';
            });
            
            item.addEventListener('click', () => {
                input.value = type.value;
                input.placeholder = 'Add Type';
                dropdown.style.display = 'none';
                this.triggerSearch();
            });
            
            dropdown.appendChild(item);
        });
        
        dropdown.style.display = 'block';
    }
    
    async loadPropertyTypes() {
        try {
            const response = await fetch('api/search-suggestions.php?type=property-types');
            const data = await response.json();
            
            if (data.success && this.modalTypeSelect) {
                this.modalTypeSelect.innerHTML = '<option value="">Any</option>';
                
                data.data.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.value;
                    option.textContent = type.label;
                    this.modalTypeSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading property types for modal:', error);
        }
    }
    
    triggerSearch() {
        const searchBtn = document.querySelector('.search-button');
        if (searchBtn) {
            searchBtn.click();
        }
    }
}

// Initialize
const smartSearch = new SmartSearch();
window.smartSearch = smartSearch;