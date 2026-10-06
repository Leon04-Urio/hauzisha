document.addEventListener('DOMContentLoaded', () => {
    let properties = [];
    let filteredProperties = [];
    let currentFilter = "All";
    const propertiesPerPage = 8;
    let currentPage = 1;

    // ---------- MAIN PROPERTIES GRID ----------
    async function fetchProperties() {
        const container = document.getElementById('explore-landing');

        // Show skeleton loading immediately
        if (container && typeof loadingManager !== 'undefined') {
            loadingManager.showPropertyCardsSkeleton(container, 6);
        }

        try {
            // Wait for config to be available
            if (!window.APP_CONFIG) {
                console.log('Waiting for APP_CONFIG...');
                await new Promise(resolve => {
                    const checkConfig = () => {
                        if (window.APP_CONFIG) {
                            console.log('APP_CONFIG loaded:', window.APP_CONFIG);
                            resolve();
                        } else {
                            setTimeout(checkConfig, 50);
                        }
                    };
                    checkConfig();
                });
            }

            // Use rate-limited fetch if available
            const fetchFunction = window.safeFetch || fetch;

            // Use caching system if available
            if (typeof window.fetchPropertiesWithCache === 'function') {
                const result = await window.fetchPropertiesWithCache(
                    `${window.APP_CONFIG.API_URL}/properties`
                );
                properties = result.data;

                if (result.fromCache) {
                    console.log('Using cached properties for instant display');
                }
            } else {
                // Use rate-limited fetch for API calls
                console.log('Fetching from:', `${window.APP_CONFIG.API_URL}/properties`);
                const response = await fetchFunction(
                    `${window.APP_CONFIG.API_URL}/properties`,
                    {},
                    'search' // Use search endpoint rate limit
                );
                const data = await response.json();
                console.log('Fetched data:', data);
                properties = Array.isArray(data.data) ? data.data : [];
            }

            // Apply smart distribution to ensure fair visibility
            if (typeof window.smartShuffleProperties === 'function') {
                properties = window.smartShuffleProperties(properties);
            }

            filteredProperties = [...properties];

            // Clear skeleton and render actual content
            if (container) {
                container.classList.remove('loading-skeleton');
                container.classList.add('content-loaded');
            }

            renderProperties();
        } catch (error) {
            console.error("Failed to fetch properties:", error);

            // Show error state
            if (container && typeof loadingManager !== 'undefined') {
                loadingManager.showContent(container, `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; text-align: center;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff7b00; margin-bottom: 1rem;"></i>
                        <h3 style="color: #fff; margin-bottom: 0.5rem;">Unable to Load Properties</h3>
                        <p style="color: #999; margin-bottom: 1.5rem;">Please check your connection and try again.</p>
                        <button onclick="window.location.reload()" style="background: #ff7b00; color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">
                            Retry
                        </button>
                    </div>
                `);
            }
        }
    }

    function renderProperties() {
        const container = document.getElementById('explore-landing');
        if (!container) return;
        container.innerHTML = '';

        // if no properties match the filter
        if (filteredProperties.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-state-container';
            emptyMsg.style.cssText = `
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 4rem 2rem;
                text-align: center;
            `;
            emptyMsg.innerHTML = `
                <div style="max-width: 400px;">
                    <i class="fa fa-home" style="font-size: 4rem; color: #444; margin-bottom: 1.5rem;"></i>
                    <h5 style="color: #fff; font-weight: 600; margin-bottom: 0.5rem;">
                        No ${currentFilter === 'All' ? 'Properties' : currentFilter + 's'} Found
                    </h5>
                    <p style="color: #888; font-size: 0.95rem; line-height: 1.6;">
                        ${currentFilter === 'All'
                    ? 'There are no properties available at the moment. Please check back later.'
                    : `We don't have any ${currentFilter.toLowerCase()}s available right now. Try browsing other property types.`}
                    </p>
                </div>
            `;
            container.appendChild(emptyMsg);
            renderPagination(); // clears pagination
            return;
        }

        const indexOfLastProperty = currentPage * propertiesPerPage;
        const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
        const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);

        currentProperties.forEach(property => {
            const card = document.createElement('a');
            // card.href = `/hauzisha/property-details.php?id=${property.id}`;
            card.className = 'col property-card';
            card.style.textDecoration = 'none';
            card.style.color = 'inherit';

            // Check if property is new (uploaded within last 7 days)
            const isNew = (() => {
                if (!property.created_at) return false;
                const createdDate = new Date(property.created_at);
                const now = new Date();
                const daysDiff = (now - createdDate) / (1000 * 60 * 60 * 24);
                return daysDiff <= 7;
            })();

            // ✅ Progressive loading: thumbnail first, then high-quality
            let thumbnailUrl = '/hauzisha/images/gallery-2.jpg'; // fallback
            let highQualityUrl = '/hauzisha/images/gallery-2.jpg'; // fallback

            if (property.hero_image && property.hero_image.includes('/uploads/properties/')) {
                // New system: path already includes full /hauzisha/api/... prefix
                thumbnailUrl = property.hero_image;
                highQualityUrl = property.hero_image.replace('-thumb.jpg', '-md.jpg');
            } else if (property.gallery) {
                // Fallback: use old gallery system
                let gallery = property.gallery;
                if (typeof gallery === "string") {
                    try {
                        gallery = JSON.parse(gallery);
                    } catch (e) {
                        console.error('Failed to parse gallery for property', property.id, e);
                        gallery = [];
                    }
                }
                if (Array.isArray(gallery) && gallery.length > 0) {
                    thumbnailUrl = `${window.APP_CONFIG.BASE_URL}${gallery[0].replace(/\\/g, '')}`;
                    highQualityUrl = thumbnailUrl; // No upgrade available for old system
                }
            }

            card.innerHTML = `
            <div class="card" style="position: relative;">
                ${isNew ? '<span class="new-label">NEW</span>' : ''}
                <a href="/hauzisha/property-details.php?id=${property.id}">
                    <img src="${thumbnailUrl}" 
                         class="card-img-top property-card-img" 
                         data-hq-src="${highQualityUrl}"
                         alt="${property.name}"
                         loading="lazy"
                         style="background-color: #1a1a1a; transition: opacity 0.6s ease-in-out;">
                </a>                
                <div class="card-body">
                <h5 class="card-title">${property.name}</h5>
                <p class="card-text">${property.address}</p>
                <p class="card-text">${property.location}</p>
                <div class="d-flex justify-content-between">
                    <p id="price">KES ${formatPrice(property.price)}${property.status === 'For Rent' ? '<span class="price-suffix">/mo</span>' : ''}</p>
                    <span class="favorite-icon mr-2" data-property-id="${property.id}">
                        <i class="far fa-heart" id="heart-${property.id}"></i>
                    </span>

                </div>
                </div>
            </div>
            `;

            container.appendChild(card);
        });

        // Favorite icons are now handled by favorites-handler.js
        // No need for separate click handlers here

        renderPagination();

        // Update favorite icons after rendering
        if (typeof updateFavoriteIcons === 'function') {
            setTimeout(() => updateFavoriteIcons(), 100);
        }
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        pagination.innerHTML = '';

        if (totalPages <= 1) return; // No pagination needed

        // Prev button
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = `<i class="fa fa-angle-left" aria-hidden="true" style="border: 1px solid #ffd700; padding: 0.65rem 1rem; cursor: pointer; border-radius: 50px;"></i>`;
        prevBtn.disabled = currentPage === 1;
        prevBtn.style.background = "transparent";
        prevBtn.style.border = "none";
        prevBtn.style.color = "#ffd700";
        prevBtn.style.opacity = currentPage === 1 ? "0.5" : "1";
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderProperties();
            }
        };
        pagination.appendChild(prevBtn);

        // Smart pagination with ellipsis
        const maxVisible = 7; // Maximum page buttons to show
        let pages = [];

        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            // Smart ellipsis logic
            if (currentPage <= 4) {
                // Near start: 1 2 3 4 5 ... 20
                pages = [1, 2, 3, 4, 5, '...', totalPages];
            } else if (currentPage >= totalPages - 3) {
                // Near end: 1 ... 16 17 18 19 20
                pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                // Middle: 1 ... 8 9 10 ... 20
                pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
            }
        }

        // Render page buttons
        pages.forEach(page => {
            if (page === '...') {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.cssText = 'margin: 0 0.3rem; padding: 0.4rem 0.5rem; color: #999;';
                pagination.appendChild(ellipsis);
            } else {
                const pageBtn = document.createElement('button');
                pageBtn.textContent = page;
                pageBtn.className = `page-number ${currentPage === page ? 'active' : ''}`;
                Object.assign(pageBtn.style, {
                    margin: '0 0.3rem',
                    padding: '0.4rem 1rem',
                    border: '1px solid #ffd700',
                    borderRadius: '60%',
                    background: currentPage === page ? '#ffd700' : 'transparent',
                    color: currentPage === page ? '#000' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                });
                pageBtn.onmouseover = () => {
                    if (currentPage !== page) {
                        pageBtn.style.background = 'rgba(255, 215, 0, 0.2)';
                    }
                };
                pageBtn.onmouseout = () => {
                    if (currentPage !== page) {
                        pageBtn.style.background = 'transparent';
                    }
                };
                pageBtn.onclick = () => {
                    currentPage = page;
                    renderProperties();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                };
                pagination.appendChild(pageBtn);
            }
        });

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = `<i class="fa fa-angle-right" aria-hidden="true" style="border: 1px solid #ffd700; padding: 0.65rem 1rem; cursor: pointer; border-radius: 50px;"></i>`;
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.style.background = "transparent";
        nextBtn.style.border = "none";
        nextBtn.style.color = "#ffd700";
        nextBtn.style.opacity = currentPage === totalPages ? "0.5" : "1";
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderProperties();
            }
        };
        pagination.appendChild(nextBtn);
    }

    // ---------- FEATURED SCROLLER ----------
    const featuredScroll = document.getElementById('featured-scroll');
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');
    const loadingSpinner = document.getElementById('featured-loading');

    async function fetchFeatured() {
        if (!featuredScroll) return;

        // Show skeleton loading instead of spinner
        if (typeof loadingManager !== 'undefined') {
            loadingManager.showFeaturedSkeleton(featuredScroll, 6);
        }

        try {
            // Wait for config to be available
            if (!window.APP_CONFIG) {
                console.log('Waiting for APP_CONFIG in fetchFeatured...');
                await new Promise(resolve => {
                    const checkConfig = () => {
                        if (window.APP_CONFIG) {
                            resolve();
                        } else {
                            setTimeout(checkConfig, 50);
                        }
                    };
                    checkConfig();
                });
            }

            // Use caching system if available
            if (typeof window.fetchPropertiesWithCache === 'function') {
                const result = await window.fetchPropertiesWithCache(
                    `${window.APP_CONFIG.API_URL}/properties`
                );
                let featuredProperties = result.data || [];

                // Apply smart featured selection for better variety
                if (typeof window.selectSmartFeatured === 'function') {
                    featuredProperties = window.selectSmartFeatured(featuredProperties, 12);
                }

                renderFeatured(featuredProperties);
            } else {
                // Fallback to direct fetch
                const response = await fetch(`${window.APP_CONFIG.API_URL}/properties`);
                const data = await response.json();
                let featuredProperties = data.data || [];

                // Apply smart featured selection
                if (typeof window.selectSmartFeatured === 'function') {
                    featuredProperties = window.selectSmartFeatured(featuredProperties, 12);
                }

                renderFeatured(featuredProperties);
            }
        } catch (error) {
            console.error('Failed to fetch featured:', error);

            // Show error state for featured section
            if (featuredScroll && typeof loadingManager !== 'undefined') {
                loadingManager.showContent(featuredScroll, `
                    <div style="display: flex; align-items: center; justify-content: center; padding: 2rem; color: #999;">
                        <div style="text-align: center;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ff7b00; margin-bottom: 0.5rem;"></i>
                            <p style="margin: 0; font-size: 0.9rem;">Unable to load featured properties</p>
                        </div>
                    </div>
                `);
            }
        }
    }

    function renderFeatured(properties) {
        if (!featuredScroll) return;
        featuredScroll.innerHTML = '';

        properties.forEach(property => {
            const link = document.createElement('a');
            link.href = `/hauzisha/property-details.php?id=${property.id}`;
            link.style.textDecoration = 'none';
            link.style.color = 'inherit';

            const card = document.createElement('div');
            card.className = 'featured-card';

            // ✅ Progressive loading: thumbnail first, then high-quality
            let thumbnailUrl = '/hauzisha/images/gallery-1.jpg'; // fallback
            let highQualityUrl = '/hauzisha/images/gallery-1.jpg'; // fallback

            if (property.hero_image && property.hero_image.includes('/uploads/properties/')) {
                // New system: path already includes full /hauzisha/api/... prefix
                thumbnailUrl = property.hero_image;
                highQualityUrl = property.hero_image.replace('-thumb.jpg', '-md.jpg');
            } else if (property.gallery) {
                // Fallback: use old gallery system
                let gallery = property.gallery;
                if (typeof gallery === "string") {
                    try {
                        gallery = JSON.parse(gallery);
                    } catch (e) {
                        gallery = [];
                    }
                }
                if (Array.isArray(gallery) && gallery.length > 0) {
                    thumbnailUrl = `${window.APP_CONFIG.BASE_URL}${gallery[0].replace(/\\/g, '')}`;
                    highQualityUrl = thumbnailUrl; // No upgrade available
                }
            }

            // Show thumbnail immediately
            card.style.backgroundImage = `url('${thumbnailUrl}')`;
            card.style.backgroundColor = '#1a1a1a';
            card.style.transition = 'background-image 0.6s ease-in-out';

            // Load high-quality in background and upgrade when ready
            if (thumbnailUrl !== highQualityUrl) {
                const hqImg = new Image();
                hqImg.onload = () => {
                    card.style.backgroundImage = `url('${highQualityUrl}')`;
                };
                hqImg.src = highQualityUrl;
            }

            // card.style.backgroundSize = 'cover';
            // card.style.backgroundPosition = 'center';
            // card.style.backgroundRepeat = 'no-repeat';

            // add gradient overlay effect for better text visibility
            card.style.position = 'relative';
            card.style.overflow = 'hidden';

            card.innerHTML = `
            <div class="card-gradient"></div>
            <span class="rating-icon">
                <i class="fas fa-star"></i> &nbsp;
                <p>${property.rating || '4.5'}</p>
            </span>
            <div class="featured-overlay">
                <h3 class="featured-title">${property.name}</h3>
                <p class="featured-address">${property.address}</p>
                <p class="featured-location">${property.location}</p>
                <div class="d-flex justify-content-between">
                <p class="featured-price">KES ${formatPrice(property.price)}${property.status === 'For Rent' ? '<span class="price-suffix">/mo</span>' : ''}</p>
                <span class="favorite-icon" data-property-id="${property.id}">
                    <i class="far fa-heart" id="featured-heart-${property.id}"></i>
                </span>
                </div>
            </div>
            `;
            link.appendChild(card);
            featuredScroll.appendChild(link);
        });

        // Update favorite icons for featured properties
        if (typeof updateFavoriteIcons === 'function') {
            setTimeout(() => updateFavoriteIcons(), 100);
        }
    }

    // ---------- FILTER BUTTONS ----------
    const filterButtons = document.querySelectorAll('.filters button');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.getAttribute('data-type');

            // Optional: highlight active button
            filterButtons.forEach(b => b.style.color = 'lightgray');
            btn.style.color = '#ffd700';

            if (currentFilter === "All") {
                filteredProperties = [...properties];
            } else {
                filteredProperties = properties.filter(p =>
                    (p.type || '').trim().toLowerCase() === currentFilter.toLowerCase()
                );
            }

            currentPage = 1;
            renderProperties();
        });
    });


    // Scroll buttons
    scrollLeftBtn?.addEventListener('click', () => {
        featuredScroll.scrollBy({ left: -300, behavior: 'smooth' });
    });

    scrollRightBtn?.addEventListener('click', () => {
        featuredScroll.scrollBy({ left: 300, behavior: 'smooth' });
    });

    // ---------- PROGRESSIVE IMAGE LOADING ----------
    function initProgressiveImageLoading() {
        const cardImages = document.querySelectorAll('.property-card-img');

        cardImages.forEach(img => {
            const hqSrc = img.dataset.hqSrc;

            // Skip if no high-quality version or already upgraded
            if (!hqSrc || img.src === hqSrc || img.dataset.upgraded === 'true') {
                return;
            }

            // Preload high-quality image in background
            const hqImg = new Image();
            hqImg.onload = () => {
                // Smoothly transition to high-quality
                img.style.opacity = '0.4';
                setTimeout(() => {
                    img.src = hqSrc;
                    img.dataset.upgraded = 'true';
                    img.style.opacity = '1';
                }, 300);
            };
            hqImg.src = hqSrc;
        });
    }

    // Call progressive loading after rendering properties
    const originalRenderProperties = renderProperties;
    renderProperties = function () {
        originalRenderProperties();
        setTimeout(initProgressiveImageLoading, 100);
    };

    // ---------- INIT ----------
    fetchProperties();
    fetchFeatured();

    // Add refresh properties functionality
    const refreshBtn = document.getElementById('refreshPropertiesBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('🔄 User requested property refresh');

            // Refresh the distribution system
            if (typeof window.smartDistribution !== 'undefined') {
                window.smartDistribution.refreshDistribution();
            }

            // Re-fetch and re-render properties
            fetchProperties();
            fetchFeatured();

            // Visual feedback
            refreshBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Refreshing...';
            setTimeout(() => {
                refreshBtn.innerHTML = '<i class="fa fa-refresh"></i>';
            }, 1500);
        });
    }


    // ---------- SEARCH BAR + FILTER MODAL LOGIC ----------
    const searchBtn = document.querySelector('.search-button');
    const filterApplyBtn = document.querySelector('.apply-btn');
    const filterBtn = document.querySelector('#filterBtn');

    // --- Robust helpers to find inputs by their label text (works regardless of exact ordering) ---
    function findSearchInputByLabel(text) {
        const items = Array.from(document.querySelectorAll('.search-bar .search-item'));
        for (const it of items) {
            const lbl = it.querySelector('label')?.textContent?.trim();
            if (lbl && lbl.toLowerCase() === text.toLowerCase()) return it.querySelector('input, select, textarea');
        }
        return null;
    }

    // Main search bar inputs (robust)
    const locationInput = findSearchInputByLabel('Location') || document.querySelector('.search-item input[placeholder="Where?"]');
    const maxPriceInput = findSearchInputByLabel('Max Price') || document.querySelector('.search-item input[placeholder="Add Max Price"]');
    const bedroomsInput = findSearchInputByLabel('Bedrooms') || (() => {
        // fallback: pick the first numeric input in search-bar that is not max price
        const nums = Array.from(document.querySelectorAll('.search-bar input[type="number"]'));
        return nums.length > 0 ? nums[0] : null;
    })();
    const typeInput = findSearchInputByLabel('Type') || document.querySelector('.search-item input[placeholder="Add Type"]');

    // Modal inputs (robust)
    const modalLocation = document.getElementById('locationInput'); // you had id for this
    const modalNumberInputs = Array.from(document.querySelectorAll('.modal-body1 input[type="number"]'));
    const modalPriceMin = modalNumberInputs[0] || null;
    const modalPriceMax = modalNumberInputs[1] || null;
    const modalSelects = Array.from(document.querySelectorAll('.modal-body1 select'));
    const modalType = modalSelects[0] || null;
    const modalBedrooms = modalSelects[1] || null;
    const amenityButtons = Array.from(document.querySelectorAll('.modal-body1 .btn.btn-sm')); // more robust selector

    // --- Utility to compute active filter count and update the filter button ---
    function updateFilterCount(filters = {}) {
        let count = 0;
        if (filters.location) count++;
        if (filters.minPrice || filters.maxPrice) count++;
        if (filters.type) count++;
        if (filters.bedrooms) count++;
        if (filters.amenities && filters.amenities.length > 0) count++;

        if (filterBtn) {
            if (count > 0) {
                filterBtn.innerHTML = `<i class="fa-solid fa-sliders"></i>`;
                filterBtn.style.color = 'inherit'; // gold if active
            } else {
                filterBtn.innerHTML = `<i class="fa-solid fa-sliders"></i>`;
                filterBtn.style.color = 'inherit'; // reset to default
            }
        }
    }

    // --- Core applyFilters (improved)
    function applyFilters(filters) {
        // Normalize numeric filters
        const minPrice = filters.minPrice ? Number(filters.minPrice) : null;
        const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null;
        const bedroomsReq = filters.bedrooms ? Number(filters.bedrooms) : null;
        const locationReq = filters.location ? String(filters.location).toLowerCase() : null;
        const typeReq = filters.type ? String(filters.type).toLowerCase() : null;
        const amenitiesReq = Array.isArray(filters.amenities) ? filters.amenities.map(a => a.toLowerCase()) : [];

        console.log('Applying filters:', { minPrice, maxPrice, bedroomsReq, locationReq, typeReq, amenitiesReq });

        filteredProperties = properties.filter(p => {
            // ensure price is numeric
            const price = Number(p.price || 0);

            // Location - partial match on either property.location or property.address or property.title
            if (locationReq) {
                const inLocation = (p.location || '').toLowerCase().includes(locationReq)
                    || (p.address || '').toLowerCase().includes(locationReq)
                    || (p.name || '').toLowerCase().includes(locationReq);
                if (!inLocation) return false;
            }

            // Price range: property with single price should be shown if price is within [min, max]
            if (minPrice != null && !Number.isNaN(minPrice)) {
                if (price < minPrice) return false;
            }
            if (maxPrice != null && !Number.isNaN(maxPrice)) {
                if (price > maxPrice) return false;
            }

            // Bedrooms (property field is 'beds')
            if (bedroomsReq != null && !Number.isNaN(bedroomsReq)) {
                const propBeds = Number(p.beds || p.bedrooms || 0);
                if (propBeds < bedroomsReq) return false;
            }

            // Type exact-ish match (case-insensitive), allow substrings
            if (typeReq) {
                const propType = (p.type || '').toLowerCase();
                if (propType !== typeReq && !propType.includes(typeReq)) return false;
            }

            // Amenities: property.amenities should include all requested
            if (amenitiesReq.length > 0) {
                const propAmenities = (p.amenities || []).map(a => String(a).toLowerCase());
                for (const am of amenitiesReq) {
                    if (!propAmenities.includes(am)) return false;
                }
            }

            // If all checks passed
            return true;
        });

        currentFilter = "Filtered";
        currentPage = 1;
        renderProperties();

        // Update filter count UI (for UX continuity we reconstruct the filters object normalized)
        updateFilterCount(filters);
    }

    // --- Wire the top search button (works with partial inputs; top bar uses maxPrice as a max only) ---
    function runTopBarSearch() {
        const filters = {
            location: locationInput?.value?.trim() || '',
            minPrice: '',
            maxPrice: maxPriceInput?.value?.trim() || '',
            bedrooms: bedroomsInput?.value?.trim() || '',
            type: typeInput?.value?.trim() || '',
            amenities: []
        };
        applyFilters(filters);
        updateFilterCount(filters);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            runTopBarSearch();
            // Only scroll when user explicitly clicks search
            const resultsSection = document.querySelector('.main-box');
            if (resultsSection) {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // Fire on Enter key only, not on every keystroke
    [locationInput, maxPriceInput, bedroomsInput, typeInput].forEach(input => {
        if (input) {
            input.addEventListener('keydown', e => { if (e.key === 'Enter') searchBtn?.click(); });
        }
    });

    // --- Wire the modal Apply button and sync back to top bar ---
    if (filterApplyBtn) {
        filterApplyBtn.addEventListener('click', () => {
            // Get selected amenities (buttons that have "active" class)
            const selectedAmenities = Array.from(document.querySelectorAll('.modal-body1 .btn.btn-sm'))
                .filter(btn => btn.classList.contains('active'))
                .map(btn => btn.textContent.trim());

            // Read selects (robust)
            const typeVal = modalType ? modalType.value : '';
            const bedroomsVal = modalBedrooms ? modalBedrooms.value : '';

            const filters = {
                location: modalLocation?.value?.trim() || '',
                minPrice: modalPriceMin?.value?.trim() || '',
                maxPrice: modalPriceMax?.value?.trim() || '',
                type: (typeVal && typeVal !== 'Any') ? typeVal.trim() : '',
                bedrooms: (bedroomsVal && bedroomsVal !== 'Any') ? bedroomsVal.replace('+', '').trim() : '',
                amenities: selectedAmenities
            };

            // Sync modal values back to main search bar for continuity
            if (locationInput) locationInput.value = filters.location || '';
            if (maxPriceInput) maxPriceInput.value = filters.maxPrice || '';
            if (bedroomsInput) bedroomsInput.value = filters.bedrooms || '';
            if (typeInput) typeInput.value = filters.type || '';

            applyFilters(filters);

            // Close modal
            const filterModalInstance = bootstrap.Modal.getInstance(document.getElementById('filterModal'));
            if (filterModalInstance) filterModalInstance.hide();
        });
    }

    // --- Amenity button toggles (robust: allow btn-outline-secondary or btn classes) ---
    amenityButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            btn.classList.toggle('btn-secondary');
            btn.classList.toggle('btn-outline-secondary');
        });
    });

})


// Global function for filter integration
window.loadPropertiesWithFilters = async function (filters) {
    console.log('Loading properties with filters:', filters);

    const container = document.getElementById('explore-landing');

    // Show loading
    if (container && typeof loadingManager !== 'undefined') {
        loadingManager.showPropertyCardsSkeleton(container, 6);
    }

    try {
        // Wait for config to be available
        if (!window.APP_CONFIG) {
            console.log('Waiting for APP_CONFIG in loadPropertiesWithFilters...');
            await new Promise(resolve => {
                const checkConfig = () => {
                    if (window.APP_CONFIG) {
                        resolve();
                    } else {
                        setTimeout(checkConfig, 50);
                    }
                };
                checkConfig();
            });
        }

        // Build API URL with filters
        let apiUrl = `${window.APP_CONFIG.API_URL}/properties`;
        const params = new URLSearchParams();

        if (filters.status) params.append('status', filters.status);
        if (filters.location) params.append('location', filters.location);
        if (filters.type) params.append('type', filters.type);
        if (filters.minPrice) params.append('min_price', filters.minPrice);
        if (filters.maxPrice) params.append('max_price', filters.maxPrice);
        if (filters.beds) {
            // Handle "5+" case
            const beds = filters.beds === '5' ? '5' : filters.beds;
            params.append('beds', beds);
        }
        if (filters.baths) {
            // Handle "4+" case
            const baths = filters.baths === '4' ? '4' : filters.baths;
            params.append('baths', baths);
        }
        if (filters.minSize) params.append('min_size', filters.minSize);
        if (filters.maxSize) params.append('max_size', filters.maxSize);
        if (filters.verification) params.append('verification_status', filters.verification);
        if (filters.featured) params.append('featured', '1');
        if (filters.rating) params.append('min_rating', filters.rating);

        const queryString = params.toString();
        if (queryString) {
            apiUrl += '?' + queryString;
        }

        // Fetch filtered properties
        const response = await fetch(apiUrl);
        const data = await response.json();
        let filteredProps = Array.isArray(data.data) ? data.data : [];

        // Apply client-side filtering for facilities
        if (filters.facilities && filters.facilities.length > 0) {
            filteredProps = filteredProps.filter(property => {
                const propertyFacilities = Array.isArray(property.facilities)
                    ? property.facilities
                    : (typeof property.facilities === 'string' ? JSON.parse(property.facilities) : []);

                // Check if property has all required facilities
                return filters.facilities.every(facility =>
                    propertyFacilities.some(pf => pf.toLowerCase() === facility.toLowerCase())
                );
            });
        }

        // Update global properties array
        properties = filteredProps;
        filteredProperties = [...properties];

        // Clear loading and render
        if (container) {
            container.classList.remove('loading-skeleton');
            container.classList.add('content-loaded');
        }

        renderProperties();

        // Show result count
        const resultCount = filteredProps.length;
        showToast(`Found ${resultCount} propert${resultCount === 1 ? 'y' : 'ies'}`, 'success');

    } catch (error) {
        console.error('Failed to load filtered properties:', error);
        showToast('Failed to apply filters', 'error');
    }
};
