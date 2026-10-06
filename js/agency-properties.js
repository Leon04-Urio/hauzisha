document.addEventListener('DOMContentLoaded', () => {
    let properties = [];
    let filteredProperties = [];
    let currentFilter = "All";
    const propertiesPerPage = 8;
    let currentPage = 1;

    // read agent_id once from URL
    const urlParams = new URLSearchParams(window.location.search);
    const agentId = urlParams.get('agent_id'); // string or null
    console.log("Agent id from URL:", agentId);

    // ---------- MAIN PROPERTIES GRID ----------
    async function fetchAgentProperties(agentId) {
        if (!agentId) {
            // show friendly message on page instead of fetching everything
            const container = document.getElementById('explore-landing');
            if (container) {
                container.innerHTML = `
                <div style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; text-align: center;">
                    <div style="max-width: 400px;">
                        <i class="fa fa-exclamation-circle" style="font-size: 4rem; color: #444; margin-bottom: 1.5rem;"></i>
                        <h5 style="color: #fff; font-weight: 600; margin-bottom: 0.5rem;">Agent Not Found</h5>
                        <p style="color: #888; font-size: 0.95rem; line-height: 1.6;">
                            The agent ID is missing from the URL. Please check the link and try again.
                        </p>
                    </div>
                </div>
              `;
            }
            console.warn("fetchAgentProperties: missing agentId, aborting fetch.");
            return;
        }

        // Wait for config to be available
        if (!window.APP_CONFIG) {
            console.log('Waiting for APP_CONFIG in fetchAgentProperties...');
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

        const encodedId = encodeURIComponent(agentId);
        const url = `${window.APP_CONFIG.API_URL}/agent-properties?agent_id=${encodedId}`;
        console.log("Fetching agent properties from:", url);

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok: " + response.status);
                return response.json();
            })
            .then(async (data) => {
                console.log("Agent properties response:", data);
                const list = Array.isArray(data.data) ? data.data : [];
                console.log(`Agent ${agentId} properties count:`, list.length);

                await fetchAgentDetails(agentId, list.length);

                properties = list;

                // Apply smart distribution to ensure fair visibility
                if (typeof window.smartShuffleProperties === 'function') {
                    properties = window.smartShuffleProperties(properties);
                }

                filteredProperties = [...properties]; // initial
                currentPage = 1;
                renderProperties(); // render using the same renderer
            })
            .catch(err => {
                console.error("Error fetching agent properties:", err);
                const container = document.getElementById('explore-landing');
                if (container) container.innerHTML = `<p style="color:#c00;">Could not load agent properties.</p>`;
            });
    }

    async function fetchAgentDetails(agentId, propertyCount = 0) {
        // Wait for config to be available
        if (!window.APP_CONFIG) {
            console.log('Waiting for APP_CONFIG in fetchAgentDetails...');
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

        const url = `${window.APP_CONFIG.API_URL}/agent/${agentId}`;
        console.log(`Fetching agent details from: ${url}`);

        fetch(url)
            .then(res => res.json())
            .then(data => {
                console.log('Agent details response:', data);
                if (data.success && data.data) {
                    renderAgencyDetails(data.data, propertyCount);
                } else {
                    console.warn('No agent details found.');
                }
            })
            .catch(err => console.error('Error fetching agent details:', err));
    }

    function renderStars(rating) {
        rating = parseFloat(rating) || 0;
        const fullStars = Math.floor(rating);
        const halfStar = (rating - fullStars) >= 0.5 ? 1 : 0;
        const emptyStars = 5 - (fullStars + halfStar);
        let output = '';

        // Gold full stars
        for (let i = 0; i < fullStars; i++) {
            output += '<i class="fas fa-star" style="color: #ffd700; font-size: 0.9rem;"></i>';
        }

        // Gold half star
        if (halfStar) {
            output += '<i class="fas fa-star-half-alt" style="color: #ffd700; font-size: 0.9rem;"></i>';
        }

        // Grey empty stars
        for (let i = 0; i < emptyStars; i++) {
            output += '<i class="fas fa-star" style="color: #666; font-size: 0.9rem;"></i>';
        }

        return output;
    }

    function renderAgencyDetails(agentData, propertyCount = 0) {
        const container = document.getElementById('agency-details');
        if (!container) return;

        const image = agentData.image
            ? `${window.APP_CONFIG.BASE_URL}${agentData.image}`
            : 'images/male_cv.jpg';

        const name = `${agentData.firstname || ''} ${agentData.lastname || ''}`.trim() || 'Anonymous';
        const email = agentData.email || 'No email provided';
        const total_reviews = agentData.total_reviews || 0;
        const time_on_loft = agentData.time_on_loft || 'N/A';
        const phone = agentData.phone || 'N/A';
        const whatsapp = agentData.whatsapp_no || 'N/A';
        const isVerified = agentData.earb_no && agentData.earb_no !== null && agentData.earb_no !== '';

        container.innerHTML = `
        <div class="ap-details d-flex flex-column align-items-center text-center gap-2 mb-3">
            <div style="width: 75px; height: 75px; border-radius: 50%; overflow: hidden; border: 1px solid #555; background-color: #fff; display: flex; align-items: center; justify-content: center;">
                <img src="${image}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='images/male_cv.jpg'">
            </div>
      
          <div class="mb-1">
            <h3 class="text-white mb-0" style="font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 6px;">
              ${name}
              ${isVerified ? `<img src="images/ver.png" alt="Verified" style="width: 18px; height: 18px;" title="This agent is EARB-registered (EARB No: ${agentData.earb_no})">` : ''}
            </h3>
            <p class="mt-0" style="font-size: 0.87rem;">${email}</p>

          </div>
          <div class="d-flex justify-content-between text-center mb-3" style="max-width: 700px; gap: 2rem;">
            <div>
                <p style="margin: 0; font-weight: 900; color: #fff;">${propertyCount}</p>
                <p style="font-size: 0.8rem; color: #999999; font-weight: 700;">Properties</p>
            </div>
            <div>
                <p style="margin: 0; font-weight: 900; color: #fff;">
                  ${(agentData.average_rating || 0).toFixed(1)}
                </p>
                <p style="font-size: 0.8rem; color: #999999; font-weight: 700;">Rating</p>
            </div>
            <div>
                <p style="margin: 0; font-weight: 900; color: #fff;">${time_on_loft}</p>
                <p style="font-size: 0.8rem; color: #999999; font-weight: 700;">On Loft</p>
            </div>
          </div>
          <div class="container-sm">
            <h6 class="text-white" style="font-weight: bold; font-size: 0.9rem;">About the Agency</h6>
            <p style="font-size: 0.8rem; margin: 0 auto;">
              <i class="fa fa-quote-left text-white" aria-hidden="true"></i>&nbsp;
              ${agentData.about || 'No description available.'}
            </p>
          </div>
          <hr style="border-color: #333; width: 90%; margin: 1rem 0;">
        </div>
      `;
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
                         alt="Property"
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
                        <i class="far fa-heart"></i>
                    </span>

                </div>
                </div>
            </div>
            `;

            container.appendChild(card);
        });

        // Favorite icons are now handled by favorites-handler.js
        // No need for duplicate handlers here

        renderPagination();

        // Progressive image loading
        setTimeout(initProgressiveImageLoading, 100);
    }

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

    function renderPagination() {
        const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        pagination.innerHTML = '';

        if (totalPages <= 1) return; // No pagination needed

        // Prev button
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = `<i class="fa fa-angle-left" aria-hidden="true" style="border: 1px solid #ffd700; padding: 0.7rem 1rem; cursor: pointer; border-radius: 50px;"></i>`;
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
        nextBtn.innerHTML = `<i class="fa fa-angle-right" aria-hidden="true" style="border: 1px solid #ffd700; padding: 0.7rem 1rem; cursor: pointer; border-radius: 50px;"></i>`;
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

    // ---------- INIT ----------
    fetchAgentProperties(agentId);


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

            // Bedrooms (property.bedrooms might be string/number)
            if (bedroomsReq != null && !Number.isNaN(bedroomsReq)) {
                const propBeds = Number(p.bedrooms || 0);
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

        // Scroll to results only if there are results
        const resultsSection = document.querySelector('.main-box');
        if (resultsSection && filteredProperties.length > 0) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (resultsSection) {
            // If no results, still scroll a little so the user sees the "No results" message
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // --- Wire the top search button (works with partial inputs; top bar uses maxPrice as a max only) ---
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const filters = {
                location: locationInput?.value?.trim() || '',
                minPrice: '', // top search bar doesn't provide min, leave blank
                maxPrice: maxPriceInput?.value?.trim() || '',
                bedrooms: bedroomsInput?.value?.trim() || '',
                type: typeInput?.value?.trim() || '',
                amenities: []
            };
            applyFilters(filters);
            updateFilterCount(filters);
        });
    }

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