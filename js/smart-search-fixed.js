// Smart Search with Server-Side Google Places Proxy
class SmartSearch {
    constructor() {
        this.locationInput = null;
        this.typeInput = null;
        this.modalLocationInput = null;
        this.debounceTimer = null;

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSearch());
        } else {
            this.setupSearch();
        }
    }

    setupSearch() {
        // Find inputs
        this.locationInput = document.querySelector('.search-item input[placeholder="Where?"]');
        this.modalLocationInput = document.getElementById('locationInput');
        this.typeInput = document.querySelector('.search-item input[placeholder="Add Type"]');
        this.modalTypeSelect = document.querySelector('.modal-body1 select');

        // Setup location autocomplete (using server proxy)
        if (this.locationInput) {
            this.setupLocationAutocomplete(this.locationInput);
        }

        if (this.modalLocationInput) {
            this.setupLocationAutocomplete(this.modalLocationInput);
        }

        // Setup type dropdown (custom)
        if (this.typeInput) {
            this.setupTypeDropdown(this.typeInput);
        }

        if (this.modalTypeSelect) {
            this.loadPropertyTypes();
        }
    }

    setupLocationAutocomplete(input) {
        const container = input.parentElement;
        container.style.position = 'relative';

        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'location-suggestions';
        suggestionsDiv.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0px;
            right: 0px;
            max-height: 300px;
            overflow-y: auto;
            z-index: 9999;
            display: none;
        `;

        container.appendChild(suggestionsDiv);

        // Add input event listener with debouncing
        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();

            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                if (query.length >= 2) {
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

        // Handle keyboard navigation
        input.addEventListener('keydown', (e) => {
            const suggestions = suggestionsDiv.querySelectorAll('.suggestion-item');
            const active = suggestionsDiv.querySelector('.suggestion-item.active');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (active) {
                    active.classList.remove('active');
                    const next = active.nextElementSibling || suggestions[0];
                    next.classList.add('active');
                } else if (suggestions.length > 0) {
                    suggestions[0].classList.add('active');
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (active) {
                    active.classList.remove('active');
                    const prev = active.previousElementSibling || suggestions[suggestions.length - 1];
                    prev.classList.add('active');
                } else if (suggestions.length > 0) {
                    suggestions[suggestions.length - 1].classList.add('active');
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (active) {
                    const description = active.dataset.description;
                    input.value = description;
                    suggestionsDiv.style.display = 'none';
                    this.triggerSearch();
                }
            } else if (e.key === 'Escape') {
                suggestionsDiv.style.display = 'none';
            }
        });
    }

    async fetchLocationSuggestions(query, suggestionsDiv, input) {
        try {
            // Show loading state
            suggestionsDiv.innerHTML = '<div class="suggestions-loading">Searching...</div>';
            suggestionsDiv.style.display = 'block';

            const response = await fetch(`api/places-proxy.php?input=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                this.displayLocationSuggestions(data.data, suggestionsDiv, input);
            } else if (data.fallback) {
                // Fallback to our custom database search
                console.log('Using fallback search');
                this.fetchCustomLocationSuggestions(query, suggestionsDiv, input);
            } else {
                suggestionsDiv.innerHTML = '<div class="suggestions-loading" style="color: #999;">No locations found</div>';
                setTimeout(() => {
                    suggestionsDiv.style.display = 'none';
                }, 2000);
            }
        } catch (error) {
            console.error('Error fetching location suggestions:', error);
            // Fallback to custom search
            this.fetchCustomLocationSuggestions(query, suggestionsDiv, input);
        }
    }

    async fetchCustomLocationSuggestions(query, suggestionsDiv, input) {
        try {
            const response = await fetch(`api/search-suggestions.php?type=locations&q=${encodeURIComponent(query)}`);
            const data = await response.json();

            // Also search property names
            let nameSuggestions = [];
            try {
                const nameRes = await fetch(`api/search-suggestions.php?type=names&q=${encodeURIComponent(query)}`);
                const nameData = await nameRes.json();
                if (nameData.success && nameData.data.length > 0) {
                    nameSuggestions = nameData.data.map(n => ({
                        description: n,
                        main_text: n,
                        secondary_text: 'Property name'
                    }));
                }
            } catch (e) { }

            if ((data.success && data.data.length > 0) || nameSuggestions.length > 0) {
                const locationSuggestions = data.success ? data.data.map(location => ({
                    description: location,
                    main_text: location,
                    secondary_text: 'Location'
                })) : [];
                this.displayLocationSuggestions([...locationSuggestions, ...nameSuggestions], suggestionsDiv, input);
            } else {
                suggestionsDiv.innerHTML = '<div class="suggestions-loading" style="color: #999; padding: 12px 16px;">No results found</div>';
                suggestionsDiv.style.display = 'block';
                setTimeout(() => { suggestionsDiv.style.display = 'none'; }, 2000);
            }
        } catch (error) {
            console.error('Fallback search error:', error);
            suggestionsDiv.innerHTML = '<div class="suggestions-loading" style="color: #e74c3c; padding: 12px 16px;">Search unavailable</div>';
            suggestionsDiv.style.display = 'block';
            setTimeout(() => { suggestionsDiv.style.display = 'none'; }, 2000);
        }
    }

    displayLocationSuggestions(suggestions, suggestionsDiv, input) {
        suggestionsDiv.innerHTML = '';

        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.dataset.description = suggestion.description;

            item.innerHTML = `
                <div class="suggestion-content">
                    <div class="suggestion-main">${suggestion.main_text}</div>
                    ${suggestion.secondary_text ? `<div class="suggestion-secondary">${suggestion.secondary_text}</div>` : ''}
                </div>
            `;

            item.addEventListener('mouseenter', () => {
                suggestionsDiv.querySelectorAll('.suggestion-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });

            item.addEventListener('click', () => {
                input.value = suggestion.description;
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
            max-height: 250px;
            overflow-y: auto;
            z-index: 9999;
            display: none;
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

        input.addEventListener('focus', () => {
            this.loadPropertyTypesForDropdown(dropdown, input);
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
        anyItem.innerHTML = `
            <span style="font-weight: 500;">Any Type</span>
            <span style="background: #f0f0f0; color: #666; padding: 2px 8px; border-radius: 12px; font-size: 0.8em;">All</span>
        `;
        anyItem.style.cssText = `
            padding: 14px 18px;
            cursor: pointer;
            border-bottom: 1px solid #f5f5f5;
            font-weight: 500;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        anyItem.addEventListener('click', () => {
            input.value = '';
            input.placeholder = 'Any Type';
            dropdown.style.display = 'none';
            this.triggerSearch();
        });

        anyItem.addEventListener('mouseenter', () => {
            anyItem.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
            anyItem.style.color = '#000';
        });

        anyItem.addEventListener('mouseleave', () => {
            anyItem.style.background = '';
            anyItem.style.color = '';
        });

        dropdown.appendChild(anyItem);

        // Add property types
        types.forEach(type => {
            const item = document.createElement('div');
            item.innerHTML = `
                <span style="font-weight: 500;">${type.label.split(' (')[0]}</span>
                <span style="background: #f0f0f0; color: #666; padding: 2px 8px; border-radius: 12px; font-size: 0.8em;">${type.count}</span>
            `;
            item.style.cssText = `
                padding: 14px 18px;
                cursor: pointer;
                border-bottom: 1px solid #f5f5f5;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;

            item.addEventListener('mouseenter', () => {
                item.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
                item.style.color = '#000';
            });

            item.addEventListener('mouseleave', () => {
                item.style.background = '';
                item.style.color = '';
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