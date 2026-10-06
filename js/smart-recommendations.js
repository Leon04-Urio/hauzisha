// Smart Property Recommendations System
// This enhances the property details page with intelligent recommendations

// Smart recommendations based on location, price, and property features
function loadSmartRecommendations(allProperties, currentId, currentProperty) {
  const listContainer = document.getElementById("furniture-list");
  if (!listContainer || !currentProperty) return;

  // Wait for config to be available
  function getGalleryBasePath() {
    return window.APP_CONFIG ? window.APP_CONFIG.BASE_URL : "http://localhost/hauzisha";
  }

  // Filter out current property
  const otherProperties = allProperties.filter(p => Number(p.id) !== Number(currentId));

  if (otherProperties.length === 0) {
    listContainer.innerHTML = `<p style="color:#ccc; text-align:center;">No recommendations available.</p>`;
    return;
  }

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
        // Check if it's cheaper
        if (propPrice < currentPrice) {
          reasons.push('Cheaper');
        } else {
          reasons.push('Similar price');
        }
      } else if (priceDiff <= 0.30) { // Within 30%
        score += 15;
        // Check if it's cheaper
        if (propPrice < currentPrice) {
          reasons.push('Cheaper');
        } else {
          reasons.push('Comparable price');
        }
      } else if (priceDiff <= 0.50 && propPrice < currentPrice) { // Up to 50% cheaper
        score += 10;
        reasons.push('Great deal');
      }
    }

    // Property type similarity
    if (prop.type && currentProperty.type && prop.type === currentProperty.type) {
      score += 20;
      // Capitalize first letter of property type
      const propertyType = prop.type.charAt(0).toUpperCase() + prop.type.slice(1);
      reasons.push(propertyType);
    }

    // Bedroom count similarity
    if (prop.beds && currentProperty.beds) {
      const bedDiff = Math.abs(parseInt(prop.beds) - parseInt(currentProperty.beds));
      if (bedDiff === 0) {
        score += 15;
        reasons.push(`${prop.beds} bedroom${prop.beds > 1 ? 's' : ''}`);
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

  // Debug: Log recommendation scores
  console.log('Smart Recommendations for', currentProperty.name);
  recommended.forEach((prop, index) => {
    console.log(`${index + 1}. ${prop.name} (Score: ${prop.score}) - Reasons: ${prop.reasons.join(', ')}`);
  });

  listContainer.innerHTML = "";

  recommended.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("furniture-item");

    const img = document.createElement("img");
    // hero_image already contains full path from API
    const imageUrl = item.hero_image ? item.hero_image :
      (item.main_image ? item.main_image : "images/gallery-1.jpg");
    img.src = imageUrl;
    img.alt = item.name;

    const tag = document.createElement("span");
    tag.classList.add("showroom-tag");

    // Prioritize tags in order of similarity (what users expect from recommendations)
    const tagPriority = [
      'Same area',
      'Nearby area',
      'Great deal',
      'Cheaper',
      'Similar price',
      'Comparable price',
      'Apartment',
      'Villa',
      'Studio',
      'House',
      'Penthouse',
      'Townhouse',
      'Similar size',
      'Highly rated',
      'Verified'
    ];

    // Find the highest priority tag
    let displayTag = 'Recommended';

    // Check for bedroom tags first (most specific similarity)
    const bedroomTag = item.reasons.find(r => r.includes('bedroom'));
    if (bedroomTag) {
      displayTag = bedroomTag;
    } else {
      // Then check priority list
      for (const priorityTag of tagPriority) {
        if (item.reasons.includes(priorityTag)) {
          displayTag = priorityTag;
          break;
        }
      }

      // Fallback to first reason if no priority match
      if (displayTag === 'Recommended' && item.reasons.length > 0) {
        displayTag = item.reasons[0];
      }
    }

    tag.textContent = displayTag;

    const overlay = document.createElement("div");
    overlay.classList.add("overlay-btn");

    const button = document.createElement("button");
    button.classList.add("view-btn");
    button.textContent = "VIEW DETAILS";
    button.addEventListener("click", () => {
      window.location.href = `property-details.php?id=${item.id}`;
    });
    overlay.appendChild(button);

    // Property info
    const infoDiv = document.createElement("div");
    infoDiv.style.cssText = "padding: 8px; background: rgba(0,0,0,0.8); border-radius: 0 0 8px 8px;";

    const nameP = document.createElement("p");
    nameP.textContent = item.name;
    nameP.style.cssText = "margin: 0 0 4px 0; font-size: 0.9rem; font-weight: bold; color: white;";

    const priceP = document.createElement("p");
    priceP.innerHTML = `KES ${formatPrice(item.price)}${item.status === 'For Rent' ? '<span style="font-size: 0.9em; margin-left: 4px;">/mo</span>' : ''}`;
    priceP.style.cssText = "margin: 0 0 4px 0; font-size: 0.8rem; color: #ffd700;";

    const detailsP = document.createElement("p");
    detailsP.textContent = `${item.beds || 0} beds • ${item.baths || 0} baths`;
    detailsP.style.cssText = "margin: 0; font-size: 0.75rem; color: #ccc;";

    infoDiv.appendChild(nameP);
    infoDiv.appendChild(priceP);
    infoDiv.appendChild(detailsP);

    div.appendChild(tag);
    div.appendChild(img);
    div.appendChild(overlay);
    div.appendChild(infoDiv);

    listContainer.appendChild(div);
  });

  // Update section title based on recommendations
  const titleElement = document.querySelector('.property-recommendations h3');
  if (titleElement && recommended.length > 0) {
    const topReason = recommended[0].reasons[0];
    if (topReason === 'Same area') {
      titleElement.textContent = `More Properties in ${currentProperty.location}`;
    } else if (topReason === 'Similar price') {
      titleElement.textContent = 'Properties in Your Price Range';
    } else {
      titleElement.textContent = 'You May Also Like';
    }
  }

  // Attach scroll buttons
  const left = document.getElementById("furniture-scroll-left");
  const right = document.getElementById("furniture-scroll-right");
  if (left && right && listContainer) {
    left.onclick = () => listContainer.scrollBy({ left: -300, behavior: "smooth" });
    right.onclick = () => listContainer.scrollBy({ left: 300, behavior: "smooth" });
  }
}

// Make function globally available
window.loadSmartRecommendations = loadSmartRecommendations;