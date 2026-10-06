document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("main");
  const favouritesEndpoint = "/hauzisha/api/index.php/get-favorite-properties"; // Adjust path if needed

  fetchFavourites();

  async function fetchFavourites() {
    try {
      const res = await fetch(favouritesEndpoint);
      const data = await res.json();

      if (!data || !data.favorites || !data.favorites.length) {
        container.innerHTML += `
          <div class="no-notifications text-center p-5 empty-state">
          <i class="fas fa-images fa-4x mb-3" style="color: #444;"></i>
            <p class="mb-0">You have no favourites yet.</p>
          </div>`;
        return;
      }

      renderFavourites(data.favorites);
    } catch (err) {
      console.error("Error loading favourites:", err);
      container.innerHTML += `<p class="text-center text-danger">Failed to load favourites.</p>`;
    }
  }

  function renderFavourites(favourites) {
    // Group by property type
    const grouped = {};
    favourites.forEach((item) => {
      const type = item.type || "Other";
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(item);
    });

    // Render each group
    Object.keys(grouped).forEach((type) => {
      const section = document.createElement("div");
      section.classList.add("section");
      section.innerHTML = `
        <h6 class="section-title text-white fw-bold">
          ${type.charAt(0).toUpperCase() + type.slice(1)}
          <i class="fa fa-angle-right" style="font-size: 0.8rem;" aria-hidden="true"></i>
        </h6>
        <div class="featured-container position-relative">
          <i class="fa fa-angle-left scroll-btn left" id="scroll-left-${type}"></i>
          <div class="featured-scroll" id="scroll-${type}"></div>
          <i class="fa fa-angle-right scroll-btn right" id="scroll-right-${type}"></i>
        </div>
      `;
      container.appendChild(section);

      const scrollBox = section.querySelector(`#scroll-${CSS.escape(type)}`);
      grouped[type].forEach((p) => {
        const div = document.createElement("div");

        // Use hero_image if available, otherwise fallback to gallery
        let imageUrl = "../images/gallery-1.jpg"; // fallback
        if (p.hero_image && p.hero_image.includes('/uploads/properties/')) {
          imageUrl = `/hauzisha/api${p.hero_image.replace('-thumb.jpg', '-md.jpg')}`;
        } else if (p.gallery) {
          const gallery = typeof p.gallery === 'string' ? JSON.parse(p.gallery) : p.gallery;
          if (gallery.length > 0) {
            imageUrl = `/hauzisha/api${gallery[0].replace(/\\/g, '').replace(/ /g, '%20')}`;
          }
        }

        div.classList.add("favorite-card");
        div.style.backgroundImage = `url(${imageUrl})`;
        div.innerHTML = `
        <div>
          <p class="favorite-title text-white text-center">${p.name.charAt(0).toUpperCase() + p.name.slice(1)}</p>
          <i class="fas fa-heart favorite-icon" data-property-id="${p.id}" style="cursor: pointer;"></i>
        </div>
        `;

        // Click on card to view property
        div.addEventListener("click", (e) => {
          // Don't navigate if clicking the heart icon
          if (!e.target.classList.contains('fa-heart')) {
            window.location.href = `/hauzisha/property-details.php?id=${p.id}`;
          }
        });

        // Click on heart to remove from favorites
        const heartIcon = div.querySelector('.fa-heart');
        heartIcon.addEventListener("click", async (e) => {
          e.stopPropagation();
          await removeFavorite(p.id, div);
        });

        scrollBox.appendChild(div);
      });

      // Always hide scroll buttons
      const leftBtn = section.querySelector(`#scroll-left-${CSS.escape(type)}`);
      const rightBtn = section.querySelector(`#scroll-right-${CSS.escape(type)}`);

      leftBtn.style.display = "none";
      rightBtn.style.display = "none";
    });
  }

  async function removeFavorite(propertyId, cardElement) {
    try {
      const response = await fetch('/hauzisha/api/index.php/toggle-favorite-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId })
      });

      const data = await response.json();

      if (data.success && !data.is_favorite) {
        // Animate removal
        cardElement.style.transition = 'all 0.3s ease';
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'scale(0.8)';

        setTimeout(() => {
          cardElement.remove();

          // Check if section is now empty
          const section = cardElement.closest('.section');
          const scrollBox = section.querySelector('.featured-scroll');
          if (scrollBox && scrollBox.children.length === 0) {
            section.remove();
          }

          // Check if all favorites are gone
          const allSections = document.querySelectorAll('.section');
          if (allSections.length === 0) {
            const main = document.querySelector('main');
            main.innerHTML += `
              <div class="no-notifications text-center p-5 empty-state">
                <i class="fas fa-images fa-4x mb-3" style="color: #444;"></i>
                <p class="mb-0">You have no favourites yet.</p>
              </div>`;
          }
        }, 300);

        if (typeof showToast === 'function') {
          showToast('Removed from favorites', 'success');
        }
      } else {
        if (typeof showToast === 'function') {
          showToast('Failed to remove from favorites', 'error');
        }
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      if (typeof showToast === 'function') {
        showToast('An error occurred', 'error');
      }
    }
  }
});