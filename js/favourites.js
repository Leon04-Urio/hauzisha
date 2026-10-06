// Render function (works for both properties & furniture)
function renderFavourites(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'featured-card';
      card.style.backgroundImage = `url(${item.image})`;
      card.innerHTML = `
        <div class="featured-overlay">
          <p class="favorite-title">${item.title}</p>
          <span class="favorite-icon"><i class="fas fa-heart"></i></span>
        </div>
      `;
      container.appendChild(card);
    });
  }
  
  // Scroll setup
  function setupScroll(leftBtnId, rightBtnId, containerId) {
    const container = document.getElementById(containerId);
    const leftBtn = document.getElementById(leftBtnId);
    const rightBtn = document.getElementById(rightBtnId);
  
    if (leftBtn) {
      leftBtn.addEventListener('click', () => {
        container.scrollBy({ left: -300, behavior: 'smooth' });
      });
    }
  
    if (rightBtn) {
      rightBtn.addEventListener('click', () => {
        container.scrollBy({ left: 300, behavior: 'smooth' });
      });
    }
  }
  
  // Fetch properties from backend and render both sections
  async function fetchAndRenderProperties() {
    try {
      const response = await fetch("http://localhost/hauzisha/api/index.php/get-favorite-properties");
      const data = await response.json();
  
      // Render fetched properties for both sections
      renderFavourites("favourite-properties", data);
      renderFavourites("favourite-furniture", data); // use same data
    } catch (err) {
      console.error("Failed to fetch properties:", err);
      const dummyProperties = [
        { title: "Modern Loft in LA", price: 25000000, image: "../images/bg_4.jpg" },
        { title: "Luxury Apartment NYC", price: 45000000, image: "../images/bg_4.jpg" },
        { title: "Cozy Beach House", price: 12000000, image: "../images/bg_4.jpg" },
      ];
  
      renderFavourites("favourite-properties", dummyProperties);
      renderFavourites("favourite-furniture", dummyProperties); // fallback
    }
  }
  
  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderProperties();
  
    // Setup scroll buttons
    setupScroll("prop-scroll-left", "prop-scroll-right", "favourite-properties");
    setupScroll("furn-scroll-left", "furn-scroll-right", "favourite-furniture");
  });
  