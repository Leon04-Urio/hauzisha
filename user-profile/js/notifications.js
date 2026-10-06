// Notifications page JavaScript
async function loadNotifications() {
    const container = document.getElementById('notifications-container');
    
    try {
        const response = await fetch('/hauzisha/api/index.php/get-notifications');
        const data = await response.json();
        
        if (data.success && data.notifications && data.notifications.length > 0) {
            renderNotifications(data.notifications);
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        showEmptyState();
    }
}

function renderNotifications(notifications) {
    const container = document.getElementById('notifications-container');
    container.innerHTML = '';
    
    notifications.forEach(notification => {
        const notifCard = document.createElement('div');
        notifCard.className = `notification-card ${notification.is_read ? '' : 'unread'}`;
        notifCard.style.cssText = `
            background: ${notification.is_read ? '#1a1a1a' : '#222'};
            border-left: 4px solid ${notification.is_read ? '#444' : '#ffd700'};
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
        `;
        
        const iconMap = {
            'system': 'fa-info-circle',
            'booking': 'fa-calendar-check',
            'payment': 'fa-credit-card',
            'property': 'fa-home',
            'other': 'fa-bell'
        };
        
        const icon = iconMap[notification.type] || 'fa-bell';
        const date = new Date(notification.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        notifCard.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="notification-icon" style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: ${notification.is_read ? '#333' : '#ffd700'};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 1rem;
                    flex-shrink: 0;
                ">
                    <i class="fa ${icon}" style="color: ${notification.is_read ? '#999' : '#000'};"></i>
                </div>
                <div class="notification-content" style="flex: 1;">
                    <p class="mb-1" style="color: ${notification.is_read ? '#ccc' : '#fff'}; font-weight: ${notification.is_read ? '400' : '600'};">
                        ${notification.message}
                    </p>
                    <small style="color: #888;">${date}</small>
                </div>
            </div>
        `;
        
        notifCard.addEventListener('click', () => openNotification(notification));
        notifCard.addEventListener('mouseenter', () => {
            notifCard.style.background = '#252525';
        });
        notifCard.addEventListener('mouseleave', () => {
            notifCard.style.background = notification.is_read ? '#1a1a1a' : '#222';
        });
        
        container.appendChild(notifCard);
    });
}

function showEmptyState() {
    const container = document.getElementById('notifications-container');
    container.innerHTML = `
        <div class="empty-state text-center py-5">
            <i class="fa fa-bell-slash"></i>
            <p>No notifications yet</p>
        </div>
    `;
}

async function openNotification(notification) {
    // Mark as read
    if (!notification.is_read) {
        try {
            await fetch('/hauzisha/api/index.php/mark-notification-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notification_id: notification.id })
            });
            
            // Reload notifications to update UI
            loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }
    
    // Show modal with notification details
    const modalBody = document.getElementById('notificationModalBody');
    modalBody.textContent = notification.message;
    
    const modal = new bootstrap.Modal(document.getElementById('notificationModal'));
    modal.show();
}

// Load notifications on page load
document.addEventListener('DOMContentLoaded', loadNotifications);
