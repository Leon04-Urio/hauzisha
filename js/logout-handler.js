// Enhanced logout handler with session management
// Prevents users from accessing protected pages after logout

// Function to handle logout
async function handleLogout(event) {
    if (event) {
        event.preventDefault();
    }
    
    if (!confirm("Are you sure you want to logout?")) {
        return;
    }
    
    try {
        // Clear any local storage first
        localStorage.clear();
        sessionStorage.clear();
        
        // Call logout API
        const response = await fetch('/hauzisha/api/logout.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Mark that user has logged out
            sessionStorage.setItem('userLoggedOut', 'true');
            
            // Clear browser history to prevent back button
            window.history.pushState(null, null, '/hauzisha/index.php');
            
            // Force redirect and prevent caching
            window.location.replace('/hauzisha/index.php');
        } else {
            showToast('Logout failed: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Force logout even if API fails
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace('/hauzisha/index.php');
    }
}

// Attach logout handler to all logout links
document.addEventListener('DOMContentLoaded', () => {
    const logoutLinks = document.querySelectorAll('#logoutLink, .logout-link, [href*="logout"]');
    
    logoutLinks.forEach(link => {
        link.addEventListener('click', handleLogout);
    });
    
    // Handle back button prevention on main page after logout
    if (window.location.pathname === '/hauzisha/' || 
        window.location.pathname === '/hauzisha/index.php' ||
        window.location.pathname.endsWith('index.php')) {
        
        // Check if user just logged out and set up back button prevention
        const userLoggedOut = sessionStorage.getItem('userLoggedOut');
        
        if (userLoggedOut === 'true') {
            // Clear browser history and prevent back navigation
            window.history.pushState(null, null, window.location.href);
            
            // Prevent back button for a period after logout
            const preventBackButton = function(event) {
                window.history.pushState(null, null, window.location.href);
            };
            
            window.addEventListener('popstate', preventBackButton);
            
            // Remove prevention after 30 seconds (user can navigate normally after that)
            setTimeout(() => {
                window.removeEventListener('popstate', preventBackButton);
                sessionStorage.removeItem('userLoggedOut');
            }, 30000);
        } else {
            // Clear logout state if no recent logout
            sessionStorage.removeItem('userLoggedOut');
        }
    }
    
    // Only run security checks on protected pages
    const isProtectedPage = window.location.pathname.includes('user-profile') || 
                           window.location.pathname.includes('control-room') ||
                           window.location.pathname.includes('dashboard');
    
    if (isProtectedPage) {
        // Check if user has logged out and is trying to access protected page
        checkLogoutState();
        
        // Track when page was loaded
        sessionStorage.setItem('pageLoadTime', Date.now().toString());
        
        // Immediate session check for back button access after logout
        checkSession();
        
        // Regular session check after a delay to avoid interfering with login
        setTimeout(() => {
            checkSession();
        }, 5000); // Wait 5 seconds before regular session check
        
        // Check session periodically but not too frequently
        setInterval(() => {
            checkSession();
        }, 60000); // Check every minute after initial check
        
        // Also check session when user tries to navigate back
        window.addEventListener('focus', () => {
            setTimeout(checkSession, 1000); // Small delay on focus
        });
        
        // Prevent browser caching
        window.onpageshow = function(event) {
            if (event.persisted) {
                window.location.reload();
            }
        };
    }
});

// Check if user has logged out and prevent access to protected pages
function checkLogoutState() {
    const userLoggedOut = sessionStorage.getItem('userLoggedOut');
    const isProtectedPage = window.location.pathname.includes('user-profile') || 
                           window.location.pathname.includes('control-room') ||
                           window.location.pathname.includes('dashboard');
    
    if (userLoggedOut === 'true' && isProtectedPage) {
        // User has logged out but is trying to access protected page
        sessionStorage.removeItem('userLoggedOut');
        window.location.replace('/hauzisha/index.php');
    }
}

// Check if session is still valid
async function checkSession() {
    // Don't check session too frequently to avoid interfering with login
    const lastCheck = sessionStorage.getItem('lastSessionCheck');
    const now = Date.now();
    
    if (lastCheck && (now - parseInt(lastCheck)) < 30000) {
        // Don't check more than once every 30 seconds
        return true;
    }
    
    sessionStorage.setItem('lastSessionCheck', now.toString());
    
    try {
        const response = await fetch('/hauzisha/api/index.php/check-session', {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        const data = await response.json();
        
        if (!data.logged_in) {
            // Only redirect if we're on a protected page AND we've been on the page for a while
            const isProtectedPage = window.location.pathname.includes('user-profile') || 
                                   window.location.pathname.includes('control-room') ||
                                   window.location.pathname.includes('dashboard');
            
            const pageLoadTime = sessionStorage.getItem('pageLoadTime');
            const timeSinceLoad = now - (pageLoadTime ? parseInt(pageLoadTime) : now);
            
            if (isProtectedPage && timeSinceLoad > 5000) {
                // Only redirect if page has been loaded for more than 5 seconds
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace('/hauzisha/index.php');
            }
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Session check error:', error);
        // Don't redirect on session check errors to avoid disrupting user experience
        return false;
    }
}

// Prevent back button navigation after logout
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        window.location.reload();
    }
});

// Export for use in other scripts
window.handleLogout = handleLogout;
