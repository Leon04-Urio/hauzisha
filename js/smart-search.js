class SmartSearch {
    constructor() {
        this.locationInput = null;
        this.typeInput = null;
        this.modalLocationInput = null;
        this.locationSuggestions = [];
        this.propertyTypes = [];
        this.debounceTimer = null;
        this.googleAutocomplete = null;
        this.modalGoogleAutocomplete = null;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSearch());
        } else {
            this.setupSearch();
        }
        
        // Check if Google Places is already ready
        if (window.googlePlacesReady) {
            setTimeout(() => this.initGooglePlaces(), 100);
        }
    }
    
    setupSearch() {
        // Find location inputs (both main search and modal)
        this.locationInput = document.querySelector('.search-item input[placeholder="Where?"]');
        this.modalLocationInput = document.getElementById('locationInput');
        
        // Find type inputs
        this.typeInput = document.querySelector('.search-item input[placeholder="Add Type"]');
        this.modalTypeSelect = document.querySelector('.modal-body1 select');
        
        // Setup type dropdown (keep our custom solution)
        if (this.typeInput) {
            this.setupTypeDropdown(this.typeInput);
        }
        
        if (this.modalTypeSelect) {
            this.loadPropertyTypes();
        }
        
        // Google Places will be initialized when the API loads
        if (window.google && window.google.maps && window.google.maps.places) {
            this.initGooglePlaces();
        }
    }
    
    initGooglePlaces() {
        console.log('Initializing Google Places Autocomplete...');
        
        // Initialize for main search bar
        if (this.locationInput && !this.googleAutocomplete) {
            this.setupGooglePlacesAutocomplete(this.locationInput, 'main');
        }
        
        // Initialize for modal
        if (this.modalLocationInput && !this.modalGoogleAutocomplete) {
            this.setupGooglePlacesAutocomplete(this.modalLocationInput, 'modal');
        }
        
        // Set up fallback timer in case Google Places fails
        setTimeout(() => {
            if (!this.googleAutocomplete || !this.modalGoogleAutocomplete) {
                console.warn('Google Places API failed to load, falling back to custom autocomplete');
                this.setupFallbackAutocomplete();
            }
        }, 5000);
    }
    
    setupFallbackAutocomplete() {
        // Fallback to our custom location autocomplete if Google fails
        if (this.locationInput && !this.googleAutocomplete) {
            console.log('Setting up fallback autocomplete for main search');
            this.setupCustomLocationAutocomplete(this.locationInput);
        }
        
        if (this.modalLocationInput && !this.modalGoogleAutocomplete) {
            console.log('Setting up fallback autocomplete for modal');
            this.setupCustomLocationAutocomplete(this.modalLocationInput);
        }
    }
    
    setupCustomLocationAutocomplete(input) {
        // Simplified version of our original custom autocomplete
        const container = input.parentElement;
        container.style.position = 'relative';
        
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'location-suggestions';
        suggestionsDiv.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        container.appendChild(suggestionsDiv);
        
        // Add input event listener
        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                if (query.length >= 1) {
                    this.fetchLocationSuggestions(query, suggestionsDiv, input);
                } else {
                    suggestionsDiv.style.display = 'none';
                }
            }, 300);
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                suggestionsDiv.style.display = 'none';
            }
        });
    }
    
    async fetchLocationSuggestions(query, suggestionsDiv, input) {
        try {
            suggestionsDiv.innerHTML = '<div class="suggestions-loading">Searching locations</div>';
            suggestionsDiv.style.display = 'block';
            
            const response = await fetch(`api/search-suggestions.php?type=locations&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.success && data.data.length > 0) {
                this.displayLocationSuggestions(data.data, suggestionsDiv, input);
            } else {
                suggestionsDiv.innerHTML = '<div class="suggestions-loading" style="color: #999;">No locations found</div>';
                setTimeout(() => {
                    suggestionsDiv.style.display = 'none';
                }, 2000);
            }
        } catch (error) {
            console.error('Error fetching location suggestions:', error);
            suggestionsDiv.innerHTML = '<div class="suggestions-loading" style="color: #e74c3c;">Error loading suggestions</div>';
            setTimeout(() => {
                suggestionsDiv.style.display = 'none';
            }, 2000);
        }
    }
    
    displayLocationSuggestions(locations, suggestionsDiv, input) {
        suggestionsDiv.innerHTML = '';
        
        locations.forEach(location => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = location;
            item.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                transition: background-color 0.2s;
            `;
            
            item.addEventListener('click', () => {
                input.value = location;
                suggestionsDiv.style.display = 'none';
                
                // Trigger search if this is the main search bar
                if (input.closest('.search-bar')) {
                    this.triggerSearch();
                }
            });
            
            suggestionsDiv.appendChild(item);
        });
        
        suggestionsDiv.style.display = 'block';
    }
    
    setupGooglePlacesAutocomplete(input, type) {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            console.warn('Google Places API not loaded yet');
            return;
        }
        
        try {
            // Configure autocomplete options
            const options = {
                types: ['(regions)'], // Focus on geographic regions
                componentRestrictions: { country: 'ke' }, // Restrict to Kenya
                fields: ['formatted_address', 'geometry', 'name', 'place_id']
            };
            
            // Create autocomplete instance
            const autocomplete = new google.maps.places.Autocomplete(input, options);
            
            // Store reference
            if (type === 'main') {
                this.googleAutocomplete = autocomplete;
            } else {
                this.modalGoogleAutocomplete = autocomplete;
            }
            
            // Handle place selection
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                
                if (!place.geometry) {
                    console.log('No geometry found for place:', place.name);
                    return;
                }
                
                // Update input value with formatted address
                input.value = place.formatted_address || place.name;
                
                // Trigger search if this is the main search bar
                if (type === 'main') {
                    setTimeout(() => this.triggerSearch(), 100);
                }
                
                console.log('Selected place:', {
                    name: place.name,
                    formatted_address: place.formatted_address,
                    place_id: place.place_id
                });
            });
            
            console.log(`Google Places Autocomplete initialized for ${type} input`);
            
        } catch (error) {
            console.error('Error setting up Google Places:', error);
            // Fall back to custom autocomplete
            this.setupCustomLocationAutocomplete(input);
        }
    }
    
    styleGoogleAutocomplete() {
        // Add custom CSS for Google Places dropdown
        const style = document.createElement('style');
        style.id = 'google-places-custom-style';
        style.textContent = `
            .pac-container {
                background: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                font-family: 'Nunito Sans', sans-serif;
                z-index: 1000;
                margin-top: 2px;
            }
            
            .pac-item {
                padding: 14px 18px;
                border-bottom: 1px solid #f5f5f5;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.95rem;
            }
            
            .pac-item:hover {
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                color: #000;
            }
            
            .pac-item:last-child {
                border-bottom: none;
                border-radius: 0 0 12px 12px;
            }
            
            .pac-item:first-child {
                border-radius: 12px 12px 0 0;
            }
            
            .pac-item-query {
                font-weight: 600;
                color: #333;
            }
            
            .pac-matched {
                font-weight: 700;
                color: #ffd700;
            }
            
            .pac-item:hover .pac-matched {
                color: #000;
            }
            
            .pac-icon {
                margin-right: 12px;
            }
            
            /* Mobile responsive */
            @media (max-width: 768px) {
                .pac-container {
                    border-radius: 8px;
                }
                
                .pac-item {
                    padding: 12px 16px;
                    font-size: 0.9rem;
                }
            }
        `;
        
        if (!document.querySelector('#google-places-custom-style')) {
            document.head.appendChild(style);
        }
    }
    
    
    setupTypeDropdown(input) {
        // Convert input to dropdown-like behavior
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
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 250px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        container.appendChild(dropdown);
        
        // Make input readonly and add click handler
        input.style.cursor = 'pointer';
        input.addEventListener('click', () => {
            if (dropdown.style.display === 'none') {
                this.loadPropertyTypesForDropdown(dropdown, input);
            } else {
                dropdown.style.display = 'none';
            }
        });
        
        // Hide dropdown when clicking outside
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
        anyItem.className = 'type-item';
        anyItem.innerHTML = `
            <span style="font-weight: 500;">Any Type</span>
            <span class="count">All</span>
        `;
        anyItem.style.cssText = `
            padding: 14px 18px;
            cursor: pointer;
            border-bottom: 1px solid #f5f5f5;
            transition: all 0.2s ease;
            font-weight: 500;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        anyItem.addEventListener('mouseenter', () => {
            anyItem.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
            anyItem.style.color = '#000';
            anyItem.style.transform = 'translateX(2px)';
        });
        
        anyItem.addEventListener('mouseleave', () => {
            anyItem.style.background = '';
            anyItem.style.color = '';
            anyItem.style.transform = '';
        });
        
        anyItem.addEventListener('click', () => {
            input.value = '';
            input.placeholder = 'Any Type';
            dropdown.style.display = 'none';
            this.triggerSearch();
        });
        
        dropdown.appendChild(anyItem);
        
        // Add property types
        types.forEach(type => {
            const item = document.createElement('div');
            item.className = 'type-item';
            item.innerHTML = `
                <span style="font-weight: 500;">${type.label.split(' (')[0]}</span>
                <span class="count">${type.count}</span>
            `;
            item.style.cssText = `
                padding: 14px 18px;
                cursor: pointer;
                border-bottom: 1px solid #f5f5f5;
                transition: all 0.2s ease;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            item.addEventListener('mouseenter', () => {
                item.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
                item.style.color = '#000';
                item.style.transform = 'translateX(2px)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.background = '';
                item.style.color = '';
                item.style.transform = '';
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
                // Clear existing options except "Any"
                this.modalTypeSelect.innerHTML = '<option value="">Any</option>';
                
                // Add property types to modal select
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
        // Get current search values
        const locationValue = this.locationInput?.value?.trim() || '';
        const maxPriceValue = document.querySelector('.search-item input[placeholder="Add Max Price"]')?.value?.trim() || '';
        const bedroomsValue = document.querySelector('.search-item input[type="number"]')?.value?.trim() || '';
        const typeValue = this.typeInput?.value?.trim() || '';
        
        // Create filters object matching the existing structure
        const filters = {
            location: locationValue,
            minPrice: '',
            maxPrice: maxPriceValue,
            bedrooms: bedroomsValue,
            type: typeValue,
            amenities: []
        };
        
        // Use the existing applyFilters function from explore.js
        if (window.exploreModule && typeof window.exploreModule.applyFilters === 'function') {
            window.exploreModule.applyFilters(filters);
        } else {
            // Try to find the applyFilters function in the global scope
            const scripts = document.querySelectorAll('script');
            let applyFiltersFound = false;
            
            // Check if we can access the function through the DOM
            const searchBtn = document.querySelector('.search-button');
            if (searchBtn) {
                // Trigger the existing search button click to use the same logic
                searchBtn.click();
                applyFiltersFound = true;
            }
            
            if (!applyFiltersFound) {
                console.log('Search triggered with filters:', filters);
                // Fallback: dispatch a custom event that explore.js can listen to
                document.dispatchEvent(new CustomEvent('smartSearchTriggered', { 
                    detail: filters 
                }));
            }
        }
    }
}

// Initialize smart search when DOM is ready
const smartSearch = new SmartSearch();

// Make it globally available
window.smartSearch = smartSearch;