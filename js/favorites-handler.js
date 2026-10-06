// Favorites handler - works across all pages
// Simplified version that works with Font Awesome 6 SVG icons

// Check if user is logged in
async function isUserLoggedIn() {
    if (document.body.dataset.loggedIn === 'true') {
        return true;
    }
    
    try {
        const response = await fetch('/hauzisha/api/index.php/check-session');
        const data = await response.json();
        return data.logged_in === true;
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
}

// Toggle favorite for a property
async function toggleFavorite(propertyId, event) {
    console.log('toggleFavorite called for property:', propertyId);
    
    const loggedIn = await isUserLoggedIn();
    if (!loggedIn) {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            const modal = new bootstrap.Modal(authModal);
            modal.show();
        } else {
            showToast('Please log in to add favorites', 'warning');
            window.location.href = '/hauzisha/index.php';
        }
        return;
    }
    
    try {
        const response = await fetch('/hauzisha/api/index.php/toggle-favorite-property', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ property_id: propertyId })
        });
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Toggle response:', data);
        
        if (data.success) {
            // Update ALL icons for this property
            updateAllHeartIcons(propertyId, data.is_favorite);
            
            // Show toast
            showToast(data.is_favorite ? 'Added to favorites' : 'Removed from favorites', 'success');
            
            // Trigger animation if favorited
            if (data.is_favorite && event) {
                createInlineHeartAnimation(event);
            }
        } else {
            showToast(data.message || 'Failed to update favorite', 'error');
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showToast('An error occurred', 'error');
    }
}

// Update all heart icons for a specific property
function updateAllHeartIcons(propertyId, isFavorite) {
    console.log(`Updating all icons for property ${propertyId} to ${isFavorite ? 'favorited' : 'unfavorited'}`);
    
    // Find all elements with this property ID
    const elements = document.querySelectorAll(`[data-property-id="${propertyId}"]`);
    console.log(`Found ${elements.length} elements`);
    
    elements.forEach(element => {
        // Find the icon - it's an <i> tag somewhere in or as this element
        let icon = element.tagName === 'I' ? element : element.querySelector('i');
        
        if (icon) {
            console.log('Updating icon:', icon, 'Current classes:', icon.className);
            
            // Update the icon classes and style
            if (isFavorite) {
                icon.className = 'fas fa-heart';
                // Check if we're on property details page (white heart) or index page (gold heart)
                if (window.location.pathname.includes('property-details.php')) {
                    icon.style.color = '#fff'; // White heart for property details
                } else {
                    icon.style.color = '#ffd700'; // Gold heart for index page
                }
            } else {
                icon.className = 'far fa-heart';
                icon.style.color = ''; // Reset to default color
            }
            
            console.log('Icon updated with classes:', icon.className, 'and color:', icon.style.color);
        }
    });
}

// Update favorite icons on page load
async function updateFavoriteIcons() {
    const loggedIn = await isUserLoggedIn();
    if (!loggedIn) {
        console.log('User not logged in');
        return;
    }
    
    try {
        const response = await fetch('/hauzisha/api/index.php/get-favorite-ids');
        const data = await response.json();
        
        console.log('Favorite IDs:', data.favorite_ids);
        
        if (data.success && data.favorite_ids) {
            const favoriteIds = data.favorite_ids.map(id => id.toString());
            
            // Update all property icons on the page
            document.querySelectorAll('[data-property-id]').forEach(element => {
                const propertyId = element.dataset.propertyId || element.getAttribute('data-property-id');
                
                if (propertyId && favoriteIds.includes(propertyId.toString())) {
                    let icon = element.tagName === 'I' ? element : element.querySelector('i');
                    
                    if (icon) {
                        // Update icon classes and color based on page
                        icon.className = 'fas fa-heart';
                        if (window.location.pathname.includes('property-details.php')) {
                            icon.style.color = '#fff'; // White heart for property details
                        } else {
                            icon.style.color = '#ffd700'; // Gold heart for index page
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error updating favorite icons:', error);
    }
}

// Toast notification
function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Heart animation
function createInlineHeartAnimation(event) {
    if (!event) return;
    
    const x = event.clientX || (event.touches?.[0]?.clientX) || 0;
    const y = event.clientY || (event.touches?.[0]?.clientY) || 0;
    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const heart = document.createElement('i');
            heart.className = 'fas fa-heart';
            heart.style.cssText = `
                position: fixed;
                left: ${x + (Math.random() - 0.5) * 20}px;
                top: ${y + (Math.random() - 0.5) * 20}px;
                color: #ffd700;
                font-size: ${1.5 + Math.random() * 0.5}rem;
                pointer-events: none;
                z-index: 9999;
                animation: floatUpInline 0.8s ease-out forwards;
            `;
            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), 800);
        }, i * 100);
    }
}

// Add CSS animations
if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
        @keyframes floatUpInline {
            0% { transform: translateY(0) scale(0.5); opacity: 1; }
            50% { transform: translateY(-40px) scale(1); opacity: 0.8; }
            100% { transform: translateY(-80px) scale(0.8); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Update favorite icons immediately
    updateFavoriteIcons();
    
    // Also update after a short delay to catch any dynamically loaded content
    setTimeout(() => updateFavoriteIcons(), 500);
    
    // Single click handler for all favorite icons
    document.addEventListener('click', (e) => {
        const favoriteElement = e.target.closest('[data-property-id]');
        
        // Check if this is a favorite icon element
        if (favoriteElement && (
            favoriteElement.classList.contains('favorite-icon') ||
            favoriteElement.classList.contains('fav-btn') ||
            e.target.closest('.favorite-icon, .fav-btn')
        )) {
            e.preventDefault();
            e.stopPropagation();
            
            const propertyId = favoriteElement.dataset.propertyId || favoriteElement.getAttribute('data-property-id');
            if (propertyId) {
                toggleFavorite(propertyId, e);
            }
        }
    });
});

// Export functions
window.toggleFavorite = toggleFavorite;
window.updateFavoriteIcons = updateFavoriteIcons;
window.updateAllHeartIcons = updateAllHeartIcons;
