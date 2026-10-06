document.addEventListener('DOMContentLoaded', () => {

  let properties = [];
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const container = document.getElementById("property-details");
  let property = null;
  let isBookingOpen = false;
  // let lightboxOpen = false;
  let lightboxImage = "";
  const facilityIcons = {
    wifi: '<i class="fas fa-wifi"></i>',
    parking: '<i class="fas fa-parking"></i>',
    pool: '<i class="fas fa-swimmer"></i>',
    gym: '<i class="fas fa-dumbbell"></i>',
    air_conditioning: '<i class="fas fa-fan"></i>',
    pets: '<i class="fas fa-paw"></i>',
    security: '<i class="fas fa-shield-alt"></i>',
    garden: '<i class="fas fa-seedling"></i>',
    furnished: '<i class="fas fa-couch"></i>',
    key_card_access: '<i class="fas fa-credit-card"></i>',
    // elevator:'<i class="fas fa-eject"></i>',
    elevator: '<i class="fas fa-sort-circle-up"></i>',
    electricity: '<i class="fas fa-bolt"></i>',
    water: '<i class="fas fa-tint"></i>',
    cctv: '<i class="fas fa-cctv"></i>',
    school_nearby: '<i class="fas fa-school"></i>',
    supermarket: '<i class="fas fa-shopping-cart"></i>',
    main_road: '<i class="fas fa-road"></i>',
    heater: '<i class="far fa-temperature-up"></i>',
    laundry: '<i class="far fa-washer"></i>'
  };

  // Dynamic gallery base path - will be set when config is available
  function getGalleryBasePath() {
    // property.gallery paths are like /uploads/properties/xxx.jpg
    // they need the full base including /api
    return window.APP_CONFIG ? window.APP_CONFIG.API_URL.replace('/index.php', '') : 'http://localhost/hauzisha/api';
  }

  // Fetch a single property
  async function fetchProperty(id) {
    // Show skeleton loading immediately
    loadingManager.showPropertyDetailsSkeleton(container);

    try {
      const fetchFunction = window.safeFetch || fetch;
      const res = await fetchFunction(`/hauzisha/api/index.php/property/${id}`, {}, 'default');
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const result = await res.json();
      property = result.data;
      console.log("Fetched single property:", property);

      // Make property available globally for other scripts
      window.property = property;

      // Dispatch event to notify other scripts that property is loaded
      document.dispatchEvent(new CustomEvent('propertyLoaded', { detail: property }));

      // Render content with smooth transition
      renderProperty();

      // Initialize new WebP gallery system
      if (typeof initPropertyGallery === 'function') {
        await initPropertyGallery(id);
      }
    } catch (err) {
      console.error("Error fetching property:", err);
      loadingManager.showContent(container, `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; text-align: center;">
          <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff7b00; margin-bottom: 1rem;"></i>
          <h3 style="color: #fff; margin-bottom: 0.5rem;">Unable to Load Property</h3>
          <p style="color: #999; margin-bottom: 1.5rem;">Please check your connection and try again.</p>
          <button onclick="window.location.reload()" style="background: #ff7b00; color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">
            Retry
          </button>
        </div>
      `);
    }
  }

  // Fetch all properties and load smart recommendations
  async function fetchAllProperties(currentId) {

    try {
      const fetchFunction = window.safeFetch || fetch;
      const res = await fetchFunction(`${window.APP_CONFIG.API_URL}/properties`, {}, 'search');
      const result = await res.json();
      const allProperties = result.data || [];
      console.log("Fetched all properties:", allProperties);

      // Use smart recommendations instead of basic ones
      if (typeof loadSmartRecommendations === 'function') {
        loadSmartRecommendations(allProperties, currentId, property);
      } else {
        loadRecommendedProperties(allProperties, currentId);
      }
    } catch (err) {
      console.error("Error fetching all properties:", err);
    }
  }

  function showAllPhotos() {
    if (!property || !property.gallery || property.gallery.length === 0) return;

    const overlay = document.getElementById("photo-tour-overlay");
    const content = document.getElementById("photo-tour-content");

    // Inject gallery images
    content.innerHTML = `
      <div class="photo-tour-section">
        <div class="photo-tour-grid">
          ${property.gallery.map(img => `<img src="${getGalleryBasePath() + img}" alt="Gallery Image" class="photo-tour-img">`).join("")}
        </div>
      </div>
    `;

    overlay.classList.add("active");

    // Attach click listeners to open in lightbox
    content.querySelectorAll(".photo-tour-img").forEach(imgEl => {
      imgEl.addEventListener("click", (e) => {
        e.stopPropagation(); // so the overlay doesn’t close
        openLightbox(imgEl.src);
      });
    });
  }

  // Make it globally callable if needed:
  window.showAllPhotos = showAllPhotos;


  // Render the property by ID
  function renderProperty() {
    if (!property) return;

    // parse agent if string
    if (typeof property.agent === "string") {
      try { property.agent = JSON.parse(property.agent); }
      catch (e) { property.agent = {}; }
    }

    let reviews = [];
    if (property.reviews) {
      if (typeof property.reviews === "string") {
        try {
          reviews = JSON.parse(property.reviews).filter(r => r && r.text && r.text.trim() !== "");
        } catch (e) {
          reviews = [];
        }
      } else if (Array.isArray(property.reviews)) {
        reviews = property.reviews.filter(r => r && r.review && r.review.trim() !== "");
      }
    }



    document.querySelector(".pview-sidebar").innerHTML =
      `<div class="sidebar-placeholder"></div>`;

    // parse reviews safely before rendering
    // const reviews = property.reviews 
    // ? JSON.parse(property.reviews).filter(r => r && r.text && r.text.trim() !== "")
    // : [];

    // Determine hero image URLs (thumbnail and high-quality)
    let heroThumbnailUrl = 'images/gallery-2.jpg'; // fallback
    let heroHighQualityUrl = 'images/gallery-2.jpg'; // fallback

    if (property.hero_image && property.hero_image.includes('/uploads/properties/')) {
      // Use new hero_image from property_images table (progressive loading)
      // Path already includes full /hauzisha/api/... prefix from API
      heroThumbnailUrl = property.hero_image;
      heroHighQualityUrl = property.hero_image.replace('-thumb.jpg', '-md.jpg');
    } else if (property.main_image) {
      // main_image from new system already has full path
      heroThumbnailUrl = property.main_image.startsWith('http') ? property.main_image : (property.main_image.startsWith('/hauzisha') ? property.main_image : getGalleryBasePath() + property.main_image);
      heroHighQualityUrl = heroThumbnailUrl;
    } else if (property.gallery && Array.isArray(property.gallery) && property.gallery.length > 0) {
      // Fallback to first gallery image (old system, needs base path)
      heroThumbnailUrl = getGalleryBasePath() + property.gallery[0];
      heroHighQualityUrl = heroThumbnailUrl;
    }

    container.innerHTML = `
      <div class="property-details-container">
        <div class="property-hero" style="position: relative; height: 65vh; overflow: hidden;">
          <!-- Panorama preview image (dimmed) -->
          <img 
            src="${(() => { try { const imgs = JSON.parse(property.tour_link); return Array.isArray(imgs) ? imgs[0] : property.tour_link; } catch (e) { return property.tour_link || ''; } })()}"
            style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; filter: brightness(0.45) blur(2px); transform: scale(1.05);"
            alt="Virtual Tour Preview">
          
          <!-- Dark overlay gradient -->
          <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%); z-index: 1;"></div>

          <!-- Play button centered -->
          <div id="tour-overlay-btn" data-tour-images="${encodeURIComponent(property.tour_link || '[]')}"
               style="position: absolute; inset: 0; z-index: 100; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0;">
            <button style="width: 68px; height: 68px; border-radius: 50%; background: rgba(255,255,255,0.92); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 24px rgba(0,0,0,0.4); margin-bottom: 14px; pointer-events: none;">
              <svg viewBox="0 0 24 24" style="width: 26px; height: 26px; fill: #222; margin-left: 4px;"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <span style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 12px; font-weight: 300; letter-spacing: 2px; color: rgba(255,255,255,0.8); text-transform: uppercase;">Explore Space</span>
          </div>

          <!-- Powered by -->
          <div style="position: absolute; bottom: 16px; right: 16px; z-index: 101; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; color: rgba(255,255,255,0.45); letter-spacing: 1px; pointer-events: none;">Powered by Hauzisha</div>

          <!-- Hero overlay controls -->
          <div class="hero-icons2" style="pointer-events: none; z-index: 200;">
            <i class="fa fa-angle-left back-btn" onclick="window.location.href='/hauzisha/index.php'" style="cursor: pointer; z-index: 4000; position: relative; pointer-events: auto;"></i>
            <span style="color: #fff; font-size: 1.05rem; font-weight: 700; letter-spacing: 0.3px; text-shadow: 0 2px 6px rgba(0,0,0,0.7); pointer-events: none;">${property.name}</span>
            <div class="like-share" style="pointer-events: auto;">
              <span class="fav-btn" data-property-id="${property.id}" style="z-index: 4000; position: relative;"><i class="far fa-heart" id="property-heart-${property.id}"></i></span>
              <span class="fav-btn share-btn" style="z-index: 4000; position: relative;">
                <i class="fa-solid fa-arrow-up-from-bracket"></i>
              </span>
            </div>
          </div>
        </div>
  
        <div class="property-info container-xl">
          <div class="property-meta">
            <div class="prop-mini-info mt-3">
              <button class="px-2" style="font-weight: bolder; color: black;">
                ${property.type ? property.type.charAt(0).toUpperCase() + property.type.slice(1) : ''}
              </button>
              <span class="rating-icon-pview">
                <i class="fas fa-star" style="margin-top: 0.5rem;"></i>&nbsp;<p>(0 reviews)</p>
              </span>
            </div>
            <div class="amenities">
              <p><i class="fas fa-bed"></i><span>${property.beds} Beds</span></p>
              <p><i class="fas fa-bath"></i><span>${property.baths} Baths</span></p>
              <p><i class="fas fa-expand"></i><span>${property.size} sqft</span></p>
            </div>
          </div>
          <hr class="mb-3"/>
          <div class="property-agent">
            <h3>Agent</h3>
            <div class="property-agent-child">
              <a href="agency-properties.php?agent_id=${property.agent?.id}" class="text-decoration-none text-reset">
                <div class="agent-info" style="cursor: pointer;">
                  <img src="${property.agent?.image ? getGalleryBasePath() + property.agent.image : 'images/male_cv.jpg'}" class="agent-img" onerror="this.src='images/male_cv.jpg'">
                  <div class="agent-info-child">
                    <p class="name" style="display: flex; align-items: center; gap: 6px;">
                      ${(property.agent?.firstname || "") + " " + (property.agent?.lastname || "")}
                      ${property.agent?.is_verified ? '<img src="images/ver.png" alt="Verified" style="width: 16px; height: 16px;" title="This agent is EARB-registered (EARB No: ' + (property.agent?.earb_no || '') + ')">' : ''}
                    </p>
                    <p class="email">${property.agent?.email || "agent@example.com"}</p>
                  </div>
                </div>
              </a>
              <div class="agent-icons">
                <i class="fa-brands fa-whatsapp" onclick="handleWhatsAppClick(event)" style="cursor: pointer; font-size: 1.3rem;"></i>
                <i class="fas fa-phone" onclick="handlePhoneClick(event)" style="cursor: pointer; font-size: 1.3rem;"></i>
              </div>
            </div>
          </div>
          <div class="property-description">
            <h3>Overview</h3>
            <p class="property-desc" id="propertyDesc">${property.description}</p>
            <button id="readMoreBtn" class="btn btn-link m-0 p-0" style="color: #ffd700; font-size: 0.67rem;">Read more</button>
          </div>
          <div class="property-description property-facilities">
            <h3 class="property-facilities">Facilities</h3>
            <div class="facilities-container">
            ${property.facilities
        .filter(f => f && f.trim() !== "")
        .map(f => {
          const key = f.toLowerCase().replace(/\s+/g, "_");
          const icon = facilityIcons[key] || '<i class="fas fa-check"></i>'; // fallback
          return `<div class="facility-icon" title="${f}">${icon}<span class="facility-name">${f}</span></div>`;
        })
        .join('')}
            </div>
          </div>
  
          <div class="property-description">
            <h3>
              Gallery
              <i class="fa fa-angle-right ml-2 mt-2" style="font-size: 0.95rem;"></i>
            </h3>
            <!-- New WebP Gallery System -->
            <div id="propertyGalleryContainer">
              <!-- Skeleton will be injected by loading manager -->
            </div>
          </div>
  
  
          <div id="lightbox-holder"></div>
  
          <div id="photo-tour-overlay" class="photo-tour-overlay">
            <div class="photo-tour-sheet">
              <div class="photo-tour-header">
                <span class="photo-tour-drag"></span>
                <h5>Photo Gallery</h5>
                <span class="photo-tour-close">&times;</span>
              </div>
              <div class="photo-tour-content" id="photo-tour-content">
                <!-- All gallery images will be injected here -->
              </div>
            </div>
          </div>
  
          <div class="property-description">
              <h3>Location</h3>
              <div class="location-info">
                  <i class="fas fa-map-marker-alt location-pin"></i>
                  <div><p>${property.address}</p><p>${property.location}</p></div>
              </div>
              <div class="property-map" id="property-map"></div>
          </div>
  
          <!-- Reviews Section -->
          <div id="reviews-container">
            <!-- Reviews will be loaded dynamically -->
          </div>
  
          <!-- Comment Form -->
              <div class="comment-form-wrap pb-4 property-description">
              <h3 class="my-3" style=" font-weight: bold;">Leave a review</h3>
                <form id="reviewForm" action="javascript:void(0);" method="POST" class="p-lg-0 comment-form" style="background-color: transparent;">
                  <div class="row">
                    <div class="col-12">
                      <div class="ig-comment-box" style="display: flex; align-items: center; gap: 10px; border-top: 1px solid #222; padding: 10px 0;">
                        <!-- Profile -->
                        <img src="images/male_cv.jpg" alt="Profile" 
                            style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    
                        <!-- Comment input -->
                        <input type="text" id="reviewText" name="review" 
                              placeholder="Add a comment..." 
                              style="flex: 1; background: #121212; border: 1px solid #333; border-radius: 25px; padding: 8px 14px; color: #ccc; font-size: 0.9rem; outline: none;">
                    
                        <!-- Send arrow -->
                        <button id="postReviewBtn" 
                                style="background: none; border: none; color: #0095f6; font-size: 1.2rem; cursor: pointer;">
                          <i class="fas fa-arrow-up"></i>
                        </button>
                      </div>
  
                      <!-- Star rating (hidden by default, appears when typing) -->
                      <div id="starRating" style="display: none; margin-top: 5px; margin-left: 50px;">
                        <i class="far fa-star" data-value="1"></i>
                        <i class="far fa-star" data-value="2"></i>
                        <i class="far fa-star" data-value="3"></i>
                        <i class="far fa-star" data-value="4"></i>
                        <i class="far fa-star" data-value="5"></i>
                      </div>
                  
                      <div id="loginPrompt" style="display: none; color: red; font-size: 0.8rem; margin-top: 5px;">
                        Please log in to leave a comment.
                      </div>
                    </div>
                  </div>
                </form>
              </div>
          
  
            <div class="verified-container">
              <div class="verified-stamp">
                <img src="images/verified-removebg.png" alt="Verified Stamp">
              </div>
              <h6 class="verified-text" style="color: #ddd;">Authenticity Guaranteed</h6>
              <p class="verified-subtext">This listing has been scanned & verified by Hauzisha</p>
            </div>
          </div>
        </div>
        
        <!-- Floating booking bar moved OUTSIDE property-info to prevent sliding interference -->
        <div class="floating-booking-bar">
          <div class="price-info"><span>Price</span>
            <h4 style="color: white; white-space: nowrap;">KES ${formatPrice(property.price)}${property.status === 'For Rent' ? '<span style="font-size: 0.9em; margin-left: 4px; color: white;">/mo</span>' : ''}</h4>
          </div>
          <button class="book-viewing-btn" onclick="openBooking()" style="color: black;">
            BOOK A VIEWING
          </button>
        </div>
        <div id="booking-holder"></div>
      

      <div class="property-recommendations">
        <h6 class="property-facilities" style="color: white; font-weight: bold; margin-top: 2rem;">
          You May Also Like
        </h6>
        <p style="font-size: 0.95rem;">Explore similar properties in our collection.</p>
        <div class="furniture-container" style="width: 100vw; background: linear-gradient(to top, #000, #282828);">
          <span id="furniture-scroll-left" class="furn-scroll-btn-reco left">
            <i class="fa fa-angle-left"></i>
          </span>
          <div class="furniture-grid" id="furniture-list" style="background: transparent;"></div>
          <span id="furniture-scroll-right" class="furn-scroll-btn-reco right">
            <i class="fa fa-angle-right"></i>
          </span>
        </div>
      </div>
    `;

    // Wire up tour overlay click handler
    // Wire up tour overlay click handler
    const tourOverlay = document.getElementById('tour-overlay-btn');
    if (tourOverlay) {
      tourOverlay.addEventListener('click', function () {
        let images = [];
        try { images = JSON.parse(decodeURIComponent(this.dataset.tourImages || '[]')); } catch (e) { }
        const first = images[0] || '';
        let url = '/hauzisha/loft-tour/viewer.html?returnUrl=' + encodeURIComponent(window.location.href);
        if (first) url += '&image=' + encodeURIComponent(first);
        if (images.length > 1) url += '&images=' + encodeURIComponent(JSON.stringify(images));
        url += '&name=' + encodeURIComponent(property.name || '');
        window.location.href = url;
      });
    }
    // Review form initialization is now handled by property-reviews.js

    // Description read more/less functionality
    const desc = document.getElementById("propertyDesc");
    const btn = document.getElementById("readMoreBtn");

    const fullText = desc.textContent.trim();
    const maxLength = 250; // adjust to taste

    if (fullText.length <= maxLength) {
      btn.style.display = "none"; // no need for toggle
      return;
    }

    const shortText = fullText.substring(0, maxLength) + "...";
    let expanded = false;
    desc.textContent = shortText;

    btn.addEventListener("click", () => {
      expanded = !expanded;
      desc.textContent = expanded ? fullText : shortText;
      btn.textContent = expanded ? "Read less" : "Read more";
    });

    // Facility label on hover/click
    document.querySelectorAll(".facility-icon").forEach(icon => {
      const labelText = icon.getAttribute("title");

      // Create tooltip element
      const label = document.createElement("span");
      label.className = "facility-label";
      label.textContent = labelText;
      icon.appendChild(label);

      // Show on hover
      icon.addEventListener("mouseenter", () => icon.classList.add("show-label"));
      icon.addEventListener("mouseleave", () => icon.classList.remove("show-label"));

      // Toggle on click (for mobile)
      icon.addEventListener("click", () => icon.classList.toggle("show-label"));
    });


    // Update meta tags for social sharing
    function updateMetaTags(property) {
      const baseUrl = window.location.origin + window.location.pathname;
      const propertyUrl = `${baseUrl}?id=${property.id}`;
      const propertyImage = property.images && property.images.length > 0
        ? `${window.location.origin}/hauzisha${property.images[0]}`
        : `${window.location.origin}/hauzisha/images/logo.png`;

      const title = `${property.name} - LOFT STUDIO`;
      const description = property.description
        ? property.description.substring(0, 160) + (property.description.length > 160 ? '...' : '')
        : `${property.beds} bed, ${property.baths} bath property in ${property.location}`;

      // Update Open Graph tags
      document.querySelector('meta[property="og:title"]').setAttribute('content', title);
      document.querySelector('meta[property="og:description"]').setAttribute('content', description);
      document.querySelector('meta[property="og:url"]').setAttribute('content', propertyUrl);
      document.querySelector('meta[property="og:image"]').setAttribute('content', propertyImage);

      // Update Twitter Card tags
      document.querySelector('meta[name="twitter:title"]').setAttribute('content', title);
      document.querySelector('meta[name="twitter:description"]').setAttribute('content', description);
      document.querySelector('meta[name="twitter:image"]').setAttribute('content', propertyImage);

      // Update page title
      document.title = title;
    }

    // ✅ Define global click handlers for contact icons
    window.handleWhatsAppClick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('=== WhatsApp Click Debug ===');
      console.log('Full property object:', property);
      console.log('Agent data:', property.agent);
      console.log('Agent type:', typeof property.agent);

      if (property && property.agent) {
        // Check all possible field variations
        console.log('Checking fields:');
        console.log('- property.agent.whatsapp:', property.agent.whatsapp);
        console.log('- property.agent.whatsapp_no:', property.agent.whatsapp_no);
        console.log('- property.agent.phone:', property.agent.phone);

        // Try all possible field names (whatsapp is the primary field from API)
        const whatsappNumber = property.agent.whatsapp || property.agent.whatsapp_no || property.agent.phone || '';
        console.log('Final WhatsApp number:', whatsappNumber);

        if (whatsappNumber && whatsappNumber.trim() !== '') {
          const message = encodeURIComponent(`Hi ${property.agent.firstname || 'Agent'}, I'm interested in ${property.name}.`);
          const cleanedNumber = whatsappNumber.replace(/^0/, '254').replace(/\s+/g, '');
          console.log('Opening WhatsApp with number:', cleanedNumber);
          window.open(`https://wa.me/${cleanedNumber}?text=${message}`, '_blank');
        } else {
          console.error('No valid WhatsApp number found');
          showToast('WhatsApp number not available for this agent', 'error');
        }
      } else {
        console.error('Property or agent data missing');
      }
    };

    window.handlePhoneClick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('=== Phone Click Debug ===');
      console.log('Full property object:', property);
      console.log('Agent data:', property.agent);
      console.log('Agent type:', typeof property.agent);

      if (property && property.agent) {
        console.log('Phone field value:', property.agent.phone);

        const phoneNumber = property.agent.phone || '';
        console.log('Final phone number:', phoneNumber);

        if (phoneNumber && phoneNumber.trim() !== '') {
          const agentName = `${property.agent.firstname || ''} ${property.agent.lastname || ''}`.trim() || 'the agent';

          // Clean phone number for tel: protocol (remove spaces, dashes, etc.)
          const cleanedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

          // Check if we're on a mobile device or if the browser supports tel: links
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          const supportsTel = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

          if (isMobile || supportsTel) {
            // On mobile devices, directly initiate the call (like Google does)
            console.log('Mobile device detected, initiating call directly');
            window.location.href = `tel:${cleanedPhone}`;
          } else {
            // On desktop, show confirmation dialog
            const confirmed = confirm(`Call ${agentName} at ${phoneNumber}?`);
            if (confirmed) {
              window.location.href = `tel:${cleanedPhone}`;
            }
          }
        } else {
          console.error('No valid phone number found');
          showToast('Phone number not available for this agent', 'error');
        }
      } else {
        console.error('Property or agent data missing');
      }
    };


    // ✅ dynamically inject review count in the small rating span
    const reviewCountEl = document.querySelector('.prop-mini-info .rating-icon-pview p');
    if (reviewCountEl) {
      reviewCountEl.textContent = `(${reviews.length} review${reviews.length !== 1 ? 's' : ''})`;
    }

    function renderStars(rating) {
      rating = parseFloat(rating) || 0; // convert string to number, default to 0
      const fullStars = Math.floor(rating);
      const halfStar = (rating - fullStars) >= 0.5 ? 1 : 0;
      const emptyStars = 5 - (fullStars + halfStar);
      let output = `<span class="stars" title="${rating.toFixed(1)} / 5">`;

      // Gold full stars
      for (let i = 0; i < fullStars; i++) {
        output += '<i class="fas fa-star"></i>&nbsp;';
      }

      // Gold half star
      if (halfStar) {
        output += '<i class="fas fa-star-half-alt"></i>&nbsp;';
      }

      // Grey empty stars
      for (let i = 0; i < emptyStars; i++) {
        output += '<i class="fas fa-star" style="color:gray;"></i>&nbsp;';
      }

      output += `</span>`;
      return output;
    }




    // Share property button
    const shareBtn = document.querySelector(".share-btn");
    const shareBubble = document.getElementById("share-bubble");
    const shareClose = shareBubble.querySelector(".share-close");

    shareBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      shareBubble.classList.add("active");

      const url = window.location.href;
      const encodedUrl = encodeURIComponent(url);
      const text = `Check out this property: ${property.name}`;
      const encodedText = encodeURIComponent(text);

      // WhatsApp - works on mobile and desktop
      shareBubble.querySelector(".share-whatsapp").href = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;

      // Facebook
      shareBubble.querySelector(".share-facebook").href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

      // Twitter (X)
      shareBubble.querySelector(".share-twitter").href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;

      // Email - set href and add click handler
      const emailLink = shareBubble.querySelector(".share-email");
      const mailtoUrl = `mailto:?subject=${encodedText}&body=${encodedText}%0A%0A${encodedUrl}`;
      emailLink.href = mailtoUrl;

      // Remove old handler and add new one
      emailLink.replaceWith(emailLink.cloneNode(true));
      const newEmailLink = shareBubble.querySelector(".share-email");
      newEmailLink.href = mailtoUrl;
      newEmailLink.addEventListener("click", (e) => {
        // Let the default mailto: behavior work
        window.location.href = mailtoUrl;
      });
    });

    shareClose.addEventListener("click", () => {
      shareBubble.classList.remove("active");
    });

    // Copy link functionality
    const copyLinkBtn = document.getElementById("copyLinkBtn");
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = window.location.href;

        let copySuccess = false;

        try {
          // Try modern clipboard API first
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
            copySuccess = true;
          } else {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            copySuccess = successful;
          }
        } catch (err) {
          console.error('Failed to copy:', err);
          copySuccess = false;
        }

        // Show feedback based on success
        const icon = copyLinkBtn.querySelector("i");

        if (copySuccess) {
          // Change icon to checkmark if icon exists
          if (icon) {
            const originalClass = icon.className;
            icon.className = "fas fa-check";
            copyLinkBtn.style.background = "#4CAF50";

            setTimeout(() => {
              icon.className = originalClass;
              copyLinkBtn.style.background = '';
            }, 2000);
          }

          // Always show success toast
          showToast('Link copied to clipboard!', 'success');
        } else {
          // Show error toast
          showToast('Failed to copy link', 'error');
        }
      });
    }

    // Close share bubble when clicking outside
    document.addEventListener("click", (e) => {
      if (shareBubble.classList.contains("active") &&
        !shareBubble.contains(e.target) &&
        !e.target.closest(".share-btn")) {
        shareBubble.classList.remove("active");
      }
    });

    // ✅ Attach events after rendering
    document.querySelectorAll(".gallery-main, .gallery-thumb img").forEach(img => {
      img.addEventListener("click", () => openLightbox(img.src));
    });

    const showAllBtn = document.querySelector(".show-all-btn");
    if (showAllBtn) {
      showAllBtn.addEventListener("click", showAllPhotos);
    }

    document.querySelector(".photo-tour-close").addEventListener("click", () => {
      document.getElementById("photo-tour-overlay").classList.remove("active");
      document.body.style.overflow = '';

      // Also call propertyGallery closeModal if it exists
      if (window.propertyGallery && typeof window.propertyGallery.closeModal === 'function') {
        window.propertyGallery.closeModal();
      }
    });

    document.getElementById("photo-tour-overlay").addEventListener("click", (e) => {
      if (e.target.id === "photo-tour-overlay") {
        e.currentTarget.classList.remove("active");
        document.body.style.overflow = '';

        // Also call propertyGallery closeModal if it exists
        if (window.propertyGallery && typeof window.propertyGallery.closeModal === 'function') {
          window.propertyGallery.closeModal();
        }
      }
    });

    // In renderProperty(), after setting innerHTML:
    document.querySelectorAll(".gallery-item img").forEach(img => {
      img.addEventListener("click", () => openLightbox(img.src));
    });

    document.querySelector(".book-viewing-btn")
      ?.addEventListener("click", () => openBooking());

    document.querySelectorAll(".gallery-main, .gallery-thumb img, .thumb-img").forEach(img => {
      img.addEventListener("click", () => openLightbox(img.src));
    });


    // Load map via backend proxy
    const mapHolder = document.getElementById("property-map");
    if (mapHolder && property.location) {
      const fetchFunction = window.safeFetch || fetch;
      fetchFunction(`api/map.php?location=${encodeURIComponent(property.address)}`, {}, 'default')
        .then(res => res.json())
        .then(data => {
          const iframe = document.createElement("iframe");
          iframe.src = data.url;
          iframe.style.width = "100%";
          iframe.style.height = "400px";
          iframe.style.border = "0";
          iframe.loading = "lazy";
          iframe.allowFullscreen = true;
          mapHolder.appendChild(iframe);
        })
        .catch(err => {
          console.error("Map error:", err);
          mapHolder.innerHTML = "<p>Could not load map.</p>";
        });
    }

    function bindFurnitureScrollButtons() {
      const left = document.getElementById("furniture-scroll-left");
      const right = document.getElementById("furniture-scroll-right");
      const list = document.getElementById("furniture-list");
      if (!left || !right || !list) return;

      // overwrite any previous handlers so we don't double-bind
      left.onclick = () => list.scrollBy({ left: -300, behavior: "smooth" });
      right.onclick = () => list.scrollBy({ left: 300, behavior: "smooth" });
    }

    bindFurnitureScrollButtons();

    // Download floor plan handler
    const downloadFloorplanBtn = document.getElementById('downloadFloorplanBtn');
    if (downloadFloorplanBtn && property.floorplan) {
      downloadFloorplanBtn.addEventListener('click', () => {
        const floorplanUrl = getGalleryBasePath() + property.floorplan;
        const link = document.createElement('a');
        link.href = floorplanUrl;
        link.download = `${property.name}-floorplan.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Downloading floor plan...', 'success');
      });
    }

    // Load and initialize reviews
    if (typeof loadPropertyReviews === 'function') {
      loadPropertyReviews(property.id);
    }
    if (typeof initializeReviewForm === 'function') {
      setTimeout(() => initializeReviewForm(property.id), 100);
    }

    // Update favorite icon for this property
    if (typeof updateFavoriteIcons === 'function') {
      setTimeout(() => updateFavoriteIcons(), 200);
    }

    // loadAllFurniture();
    // loadAllProperties();
  }


  // Lightbox
  let lightboxOpen = false;
  let lightboxIndex = 0; // Track current image index

  function openLightbox(imgSrc) {
    if (!property || !property.gallery || property.gallery.length === 0) return;

    lightboxOpen = true;
    lightboxIndex = property.gallery.findIndex(img => getGalleryBasePath() + img === imgSrc);
    if (lightboxIndex === -1) lightboxIndex = 0;

    renderLightbox();
  }

  function renderLightbox() {
    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";

    overlay.innerHTML = `
      <span class="lightbox-close">&times;</span>
      <img class="lightbox-image" src="${getGalleryBasePath() + property.gallery[lightboxIndex]}">
      <span class="lightbox-prev">&#10094;</span>
      <span class="lightbox-next">&#10095;</span>
    `;

    // Remove previous lightbox if any
    const holder = document.getElementById("lightbox-holder");
    holder.innerHTML = "";
    holder.appendChild(overlay);

    // Close button
    overlay.querySelector(".lightbox-close").addEventListener("click", closeLightbox);

    // Prev/Next buttons
    overlay.querySelector(".lightbox-prev").addEventListener("click", (e) => {
      e.stopPropagation();
      showPrevImage();
    });
    overlay.querySelector(".lightbox-next").addEventListener("click", (e) => {
      e.stopPropagation();
      showNextImage();
    });

    // Close if clicking outside image
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeLightbox();
    });
  }

  function showPrevImage() {
    if (!property.gallery || property.gallery.length === 0) return;
    lightboxIndex = (lightboxIndex - 1 + property.gallery.length) % property.gallery.length;
    updateLightboxImage();
  }

  function showNextImage() {
    if (!property.gallery || property.gallery.length === 0) return;
    lightboxIndex = (lightboxIndex + 1) % property.gallery.length;
    updateLightboxImage();
  }

  function updateLightboxImage() {
    const imgEl = document.querySelector(".lightbox-image");
    if (imgEl) {
      imgEl.src = getGalleryBasePath() + property.gallery[lightboxIndex];
    }
  }

  function closeLightbox() {
    lightboxOpen = false;
    lightboxIndex = 0;
    document.getElementById("lightbox-holder").innerHTML = "";
  }

  // Booking modal
  async function openBooking() {
    // Check if user is logged in
    const isLoggedIn = document.body.dataset.loggedIn === 'true';

    if (!isLoggedIn) {
      // Show login modal instead
      const authModal = document.getElementById('authModal');
      if (authModal) {
        const modal = new bootstrap.Modal(authModal);
        modal.show();
      } else {
        showToast('Please log in to book a viewing', 'warning');
        setTimeout(() => {
          window.location.href = '/hauzisha/index.php';
        }, 1500);
      }
      return;
    }

    if (isBookingOpen) return;
    isBookingOpen = true;

    // Slide the booking bar away
    const bookingBar = document.querySelector('.floating-booking-bar');
    if (bookingBar) bookingBar.classList.add('slide-away');

    // Fetch user details
    let userName = '';
    let userEmail = '';
    let userPhone = '';

    try {
      const fetchFunction = window.safeFetch || fetch;
      const response = await fetchFunction('/hauzisha/api/index.php/get-user-profile', {}, 'default');
      const data = await response.json();
      if (data.success && data.user) {
        userName = `${data.user.firstname || ''} ${data.user.lastname || ''}`.trim();
        userEmail = data.user.email || '';
        userPhone = data.user.phone || '';
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }

    const modal = document.createElement("div");
    modal.className = "booking-modal-overlay";

    // Clicking outside the modal closes it
    modal.addEventListener("click", closeBooking);

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];

    modal.innerHTML = `
      <div class="booking-modal" onclick="event.stopPropagation()">
        <button class="close-modal" style="color: black; font-size: 1.3rem;">&times;</button>
        
        <h3 class="modal-title font-weight-bold" id="authModalLabel"><img src="./images/logo.png" style="height: 50px; width: 50px; "/> <strong style="color: #000; font-size: 1.5rem;">B O O K &nbsp; A &nbsp; V I E W I N G</strong><br/></h3>
        <hr style="border: 1px solid lightgrey;"/>
        <p style="margin-top: 6px; font-size: 0.85rem;">Schedule a viewing for <strong font-style: italic;>${property.name}</strong></p>
        
        <input class="modal-input" id="booking-name" type="text" placeholder="Name" value="${userName}" required>
        <input class="modal-input" id="booking-email" type="email" placeholder="Email" value="${userEmail}" required>
        <input class="modal-input" id="booking-phone" type="tel" placeholder="Phone Number" value="${userPhone}" required>
        <input type="date" id="booking-date" class="booking-date-picker modal-input" min="${today}" required>
        <input type="time" id="booking-time" class="modal-input" placeholder="Preferred time" required>
        <textarea class="modal-input" id="booking-message" placeholder="Additional message (optional)" rows="3"></textarea>
        <button class="confirm-booking" id="confirm-booking-btn" style="color: white; font-weight: 900;">Confirm Booking</button>
      </div>
    `;
    document.getElementById("booking-holder").appendChild(modal);

    // Stop clicks inside modal from closing
    modal.querySelector(".booking-modal").addEventListener("click", (e) => e.stopPropagation());

    // Close button
    modal.querySelector(".close-modal").addEventListener("click", closeBooking);

    // Confirm booking button
    modal.querySelector("#confirm-booking-btn").addEventListener("click", submitBooking);
  }

  async function submitBooking() {
    const name = document.getElementById('booking-name').value.trim();
    const email = document.getElementById('booking-email').value.trim();
    const phone = document.getElementById('booking-phone').value.trim();
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;
    const message = document.getElementById('booking-message').value.trim();

    // Validation
    if (!name || !email || !phone || !date || !time) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const btn = document.getElementById('confirm-booking-btn');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    try {
      const fetchFunction = window.safeFetch || fetch;
      const response = await fetchFunction('/hauzisha/api/index.php/create-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          property_id: property.id,
          property_name: property.name,
          booking_date: date,
          booking_time: time,
          name: name,
          email: email,
          phone: phone,
          message: message
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast('Booking request submitted successfully!', 'success');
        closeBooking();
      } else {
        throw new Error(data.message || 'Failed to submit booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      showToast(error.message || 'Failed to submit booking', 'error');
      btn.disabled = false;
      btn.textContent = 'Confirm Booking';
    }
  }

  function closeBooking() {
    isBookingOpen = false;
    const overlay = document.querySelector(".booking-modal-overlay");
    if (overlay) overlay.remove();
    // Bring the booking bar back
    const bookingBar = document.querySelector('.floating-booking-bar');
    if (bookingBar) bookingBar.classList.remove('slide-away');
  }

  // function closeBooking() {
  //   isBookingOpen = false;
  //   document.querySelector(".booking-modal-overlay")?.remove();
  // }

  // Furniture
  const furnitureData = {
    sofas: [
      { name: "Modern Sofa", img: "images/sofa1.jpeg", model: "models/sofa1.glb", iosModel: "models/sofa1.usdz" },
      { name: "Classic Sofa", img: "images/sofa2.jpeg", model: "models/sofa2.glb", iosModel: "models/sofa2.usdz" }
    ],
    beds: [
      { name: "King Bed", img: "images/bed1.jpg", model: "models/bed1.glb", iosModel: "models/bed1.usdz" },
      { name: "Double Bed", img: "images/bed2.jpeg", model: "models/bed2.glb", iosModel: "models/bed2.usdz" }
    ],
    tables: [
      { name: "Dining Table", img: "images/table1.jpg", model: "models/table1.glb", iosModel: "models/table1.usdz" },
      { name: "Coffee Table", img: "images/table2.jpg", model: "models/table2.glb", iosModel: "models/table2.usdz" }
    ],
    carpets: [
      { name: "Red Carpet", img: "images/carpet1.jpg", model: "models/carpet1.glb", iosModel: "models/carpet1.usdz" },
      { name: "Pattern Carpet", img: "images/carpet2.jpg", model: "models/carpet2.glb", iosModel: "models/carpet2.usdz" }
    ]
  };

  // function loadAllFurniture() {
  //   const furnitureList = document.getElementById("furniture-list");
  //   furnitureList.innerHTML = "";

  //   const allItems = Object.values(furnitureData).flat();

  //   allItems.forEach((item) => {
  //     const div = document.createElement("div");
  //     div.classList.add("furniture-item");

  //     const img = document.createElement("img");
  //     img.src = item.img;
  //     img.alt = item.name;
  //     img.dataset.model = item.model;
  //     img.dataset.iosModel = item.iosModel;

  //     const tag = document.createElement("span");
  //     tag.classList.add("showroom-tag");
  //     tag.textContent = "From Showroom";

  //     const overlay = document.createElement("div");
  //     overlay.classList.add("overlay-btn");

  //     const button = document.createElement("button");
  //     button.classList.add("view-btn");
  //     button.textContent = "PREVIEW IN SHOWROOM";
  //     overlay.appendChild(button);

  //     const p = document.createElement("p");
  //     p.textContent = item.name;

  //     div.appendChild(tag);
  //     div.appendChild(img);
  //     div.appendChild(overlay);
  //     div.appendChild(p);

  //     furnitureList.appendChild(div);
  //   });
  // }


  // Smart recommendations based on location, price, and property features
  function loadRecommendedProperties(allProperties, currentId) {
    const listContainer = document.getElementById("furniture-list");
    if (!listContainer) return;

    // Get current property for comparison
    const currentProperty = property;
    if (!currentProperty) return;

    // Filter out current property
    const otherProperties = allProperties.filter(p => Number(p.id) !== Number(currentId));

    // Smart recommendation algorithm
    const scoredProperties = otherProperties.map(prop => {
      let score = 0;
      let reasons = [];

      // Location similarity (highest priority)
      if (prop.location && currentProperty.location) {
        const currentLoc = currentProperty.location.toLowerCase();
        const propLoc = prop.location.toLowerCase();

        if (propLoc === currentLoc) {
          score += 50;
          reasons.push('Same area');
        } else if (propLoc.includes(currentLoc) || currentLoc.includes(propLoc)) {
          score += 30;
          reasons.push('Nearby area');
        }
      }

      // Price range similarity (30% tolerance)
      if (prop.price && currentProperty.price) {
        const currentPrice = parseFloat(currentProperty.price);
        const propPrice = parseFloat(prop.price);
        const priceDiff = Math.abs(currentPrice - propPrice) / currentPrice;

        if (priceDiff <= 0.15) { // Within 15%
          score += 25;
          reasons.push('Similar price');
        } else if (priceDiff <= 0.30) { // Within 30%
          score += 15;
          reasons.push('Comparable price');
        }
      }

      // Property type similarity
      if (prop.type && currentProperty.type && prop.type === currentProperty.type) {
        score += 20;
        reasons.push('Same property type');
      }

      // Bedroom count similarity
      if (prop.beds && currentProperty.beds) {
        const bedDiff = Math.abs(parseInt(prop.beds) - parseInt(currentProperty.beds));
        if (bedDiff === 0) {
          score += 15;
          reasons.push('Same bedrooms');
        } else if (bedDiff === 1) {
          score += 10;
          reasons.push('Similar size');
        }
      }

      // Bathroom count similarity
      if (prop.baths && currentProperty.baths) {
        const bathDiff = Math.abs(parseInt(prop.baths) - parseInt(currentProperty.baths));
        if (bathDiff === 0) {
          score += 10;
        } else if (bathDiff === 1) {
          score += 5;
        }
      }

      // Size similarity (if available)
      if (prop.size && currentProperty.size) {
        const currentSize = parseFloat(currentProperty.size);
        const propSize = parseFloat(prop.size);
        const sizeDiff = Math.abs(currentSize - propSize) / currentSize;

        if (sizeDiff <= 0.20) { // Within 20%
          score += 10;
          reasons.push('Similar size');
        }
      }

      // Boost score for verified properties
      if (prop.verification_status === 'verified') {
        score += 5;
        reasons.push('Verified');
      }

      // Boost score for properties with good ratings
      if (prop.rating && parseFloat(prop.rating) >= 4.0) {
        score += 5;
        reasons.push('Highly rated');
      }

      return {
        ...prop,
        score: score,
        reasons: reasons
      };
    });

    // Sort by score (highest first) and take top 8
    const recommended = scoredProperties
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    listContainer.innerHTML = "";

    if (recommended.length === 0) {
      listContainer.innerHTML = `<p style="color:#ccc; text-align:center;">No recommendations available.</p>`;
      return;
    }

    recommended.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("furniture-item");

      const img = document.createElement("img");
      img.src = item.hero_image ? item.hero_image : (item.main_image ? item.main_image : "images/gallery-1.jpg");
      img.alt = item.name;

      const tag = document.createElement("span");
      tag.classList.add("showroom-tag");
      tag.textContent = "Recommended";

      const overlay = document.createElement("div");
      overlay.classList.add("overlay-btn");

      const button = document.createElement("button");
      button.classList.add("view-btn");
      button.textContent = "VIEW DETAILS";
      button.addEventListener("click", () => {
        window.location.href = `property-details.php?id=${item.id}`;
      });
      overlay.appendChild(button);

      const p = document.createElement("p");
      p.textContent = item.name;

      div.appendChild(tag);
      div.appendChild(img);
      div.appendChild(overlay);
      div.appendChild(p);

      listContainer.appendChild(div);
    });

    // attach scroll buttons
    const left = document.getElementById("furniture-scroll-left");
    const right = document.getElementById("furniture-scroll-right");
    if (left && right && listContainer) {
      left.onclick = () => listContainer.scrollBy({ left: -300, behavior: "smooth" });
      right.onclick = () => listContainer.scrollBy({ left: 300, behavior: "smooth" });
    }
  }

  // Record property view
  async function recordPropertyView(propertyId) {
    console.log('Attempting to record view for property ID:', propertyId);

    try {
      const fetchFunction = window.safeFetch || fetch;
      const response = await fetchFunction(`/hauzisha/api/index.php/record-property-view/${propertyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      const result = await response.json();
      console.log('API response:', result);

      if (result.success) {
        console.log('✅ Property view recorded successfully for property', propertyId);
      } else {
        console.warn('❌ Failed to record property view:', result.message);
      }
    } catch (error) {
      console.error('❌ Error recording property view:', error);
    }
  }

  // Use async wrapper to fetch both
  async function initPropertyPage() {
    console.log('Initializing property page with ID:', id);

    if (!id) {
      container.innerHTML = "<p>No property ID specified in URL.</p>";
      return;
    }

    await fetchProperty(id);
    await fetchAllProperties(id);   // pass current property ID

    // Record property view after successful load
    if (property) {
      console.log('Property loaded successfully, recording view...');
      await recordPropertyView(id);

      // Mark property as viewed for distribution system
      if (typeof window.markPropertyViewed === 'function') {
        window.markPropertyViewed(id);
      }
    } else {
      console.warn('Property not loaded, skipping view recording');
    }
  }

  initPropertyPage();

});
// Smo
// Property details functionality restored to original state
// No sliding effects - clean and simple
