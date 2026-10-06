// Dynamic configuration - auto-detects base path
(function () {
    const scripts = document.getElementsByTagName('script');
    let basePath = '';

    for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src;
        if (src && src.includes('/js/config.js')) {
            basePath = src.split('/js/config.js')[0];
            break;
        }
    }

    // Fallback: derive from current page location
    if (!basePath) {
        const path = window.location.pathname;
        const parts = path.split('/').filter(Boolean);
        if (parts.length > 0) {
            basePath = window.location.origin + '/' + parts[0];
        } else {
            basePath = window.location.origin;
        }
    }

    window.APP_CONFIG = {
        BASE_URL: basePath,
        API_URL: basePath + '/api/index.php',
        UPLOADS_URL: basePath + '/uploads'
    };

    console.log('App configured with base URL:', basePath);
})();
