// Notification Badge Counter
async function updateNotificationBadge() {
    try {
        const response = await fetch('/hauzisha/api/index.php/get-unread-count');
        const data = await response.json();
        
        if (data.success && data.count > 0) {
            showNotificationBadge(data.count);
        } else {
            hideNotificationBadge();
        }
    } catch (error) {
        console.error('Error fetching notification count:', error);
    }
}

function showNotificationBadge(count) {
    // Find all notification icons
    const notificationIcons = document.querySelectorAll('a[href*="notifications"] i.fa-bell, a[href*="notifications.php"] i.fa-bell');
    
    notificationIcons.forEach(icon => {
        // Remove existing badge if any
        const existingBadge = icon.parentElement.querySelector('.notification-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Create badge
        const badge = document.createElement('span');
        badge.className = 'notification-badge';
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ff4757;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 10px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #000;
        `;
        
        // Make parent position relative
        icon.parentElement.style.position = 'relative';
        icon.parentElement.appendChild(badge);
    });
}

function hideNotificationBadge() {
    const badges = document.querySelectorAll('.notification-badge');
    badges.forEach(badge => badge.remove());
}

// Update badge on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = document.body.dataset.loggedIn === 'true';
    if (isLoggedIn) {
        updateNotificationBadge();
        
        // Update every 30 seconds
        setInterval(updateNotificationBadge, 30000);
    }
});

// Export for use in other scripts
window.updateNotificationBadge = updateNotificationBadge;
