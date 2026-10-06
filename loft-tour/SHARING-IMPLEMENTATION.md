# LOFT³ Tour Sharing & Embedding Implementation

## Overview

This implementation provides comprehensive sharing and embedding functionality for LOFT³ virtual tours, including:

- **Shareable URL generation** with customizable parameters
- **Embed code generation** for websites (iframe, responsive, JavaScript)
- **QR code generation** for easy mobile sharing
- **Social media integration** (Facebook, Twitter, LinkedIn, WhatsApp)
- **Offline deployment packages** for standalone distribution

## Features Implemented

### ✅ Backend API Endpoints

1. **Generate Shareable URL** (`POST /api/index.php/generate-share-url`)
   - Creates shareable URLs with optional parameters
   - Supports start node, autoplay, UI hiding, fullscreen mode
   - Generates short URLs and QR codes
   - Returns social media preview metadata

2. **Generate Embed Code** (`POST /api/index.php/generate-embed-code`)
   - Creates iframe, responsive, and JavaScript embed codes
   - Customizable dimensions and options
   - Preview image generation
   - Security-conscious iframe implementation

3. **Generate Offline Package** (`POST /api/index.php/generate-offline-package`)
   - Creates downloadable ZIP packages
   - Includes all tour assets and standalone HTML
   - Self-contained for offline deployment

### ✅ Frontend Components

1. **LoftTourSharing Class** (`js/loft-tour-sharing.js`)
   - Modal-based sharing interface
   - Social media integration
   - QR code display and download
   - Clipboard functionality
   - Native device sharing support

2. **Sharing Modals** (`css/loft-tour-sharing.css`)
   - Professional, responsive modal designs
   - Share modal with URL options and social buttons
   - Embed modal with live preview and code tabs
   - Mobile-optimized layouts

3. **Embed Library** (`js/loft-tour-embed.js`)
   - External JavaScript library for websites
   - Auto-initialization from data attributes
   - Lazy loading and intersection observer
   - Responsive embed containers
   - Message-based communication with tours

### ✅ Viewer Pages

1. **Standalone Viewer** (`viewer.html`)
   - Dedicated page for shared tour links
   - SEO-optimized with meta tags
   - URL parameter parsing
   - Social media preview support
   - Analytics tracking

2. **Embed Viewer** (`embed.html`)
   - Optimized for iframe embedding
   - Minimal UI options
   - Security headers
   - Fullscreen support
   - Branding watermark

## API Usage Examples

### Generate Shareable URL

```javascript
const response = await fetch('/api/index.php/generate-share-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        tour_id: 1,
        start_node: 'living-room',
        autoplay: true,
        hide_ui: false,
        fullscreen: false
    })
});

const data = await response.json();
// Returns: share_url, short_url, qr_code_url, social_preview
```

### Generate Embed Code

```javascript
const response = await fetch('/api/index.php/generate-embed-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        tour_id: 1,
        width: '800px',
        height: '600px',
        allow_fullscreen: true,
        show_ui: true,
        autoplay: false
    })
});

const data = await response.json();
// Returns: iframe_code, responsive_code, javascript_code
```

## Frontend Integration

### Using the Sharing System

```javascript
// Initialize sharing system
const sharing = new LoftTourSharing(tourEngine);
sharing.setTourId(tourId);

// Show share modal
sharing.showShareModal();

// Show embed modal
sharing.showEmbedModal();
```

### Using the Embed Library

```html
<!-- Method 1: JavaScript API -->
<div id="tour-container"></div>
<script src="/loft-tour/js/loft-tour-embed.js"></script>
<script>
LoftTourEmbed.create({
    container: '#tour-container',
    tourId: 1,
    width: '100%',
    height: '600px',
    showUI: true,
    autoplay: false,
    allowFullscreen: true
});
</script>

<!-- Method 2: Data attributes (auto-initialization) -->
<div data-loft-tour="1" 
     data-width="100%" 
     data-height="600px" 
     data-show-ui="true" 
     data-autoplay="false">
</div>
<script src="/loft-tour/js/loft-tour-embed.js"></script>
```

## URL Parameters

### Viewer URLs

- `tour` - Tour ID (required)
- `start` - Starting node ID
- `autoplay` - Auto-advance through tour (1/0)
- `ui` - Show UI controls (1/0, default: 1)
- `fullscreen` - Enter fullscreen mode (1/0)

Example: `/loft-tour/viewer.html?tour=1&start=kitchen&autoplay=1&ui=0`

### Embed URLs

Same parameters as viewer URLs, optimized for iframe embedding.

Example: `/loft-tour/embed.html?tour=1&ui=0&autoplay=1`

## Security Features

1. **Content Security Policy** headers in embed viewer
2. **Origin validation** for iframe messages
3. **Input sanitization** in API endpoints
4. **Admin-only** offline package generation
5. **Rate limiting** considerations for API endpoints

## Mobile Optimization

1. **Responsive modals** with mobile-specific layouts
2. **Touch-friendly** social sharing buttons
3. **Native sharing API** integration for mobile devices
4. **Optimized QR codes** for mobile scanning
5. **Viewport-aware** embed containers

## Social Media Integration

### Supported Platforms

- **Facebook** - Share with Open Graph metadata
- **Twitter** - Share with Twitter Card metadata
- **LinkedIn** - Professional sharing
- **WhatsApp** - Mobile-optimized sharing
- **Native sharing** - Device-specific share sheets

### Meta Tags Generated

```html
<!-- Open Graph -->
<meta property="og:title" content="Tour Name - Virtual Tour">
<meta property="og:description" content="Tour description">
<meta property="og:image" content="Preview image URL">
<meta property="og:url" content="Tour URL">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Tour Name - Virtual Tour">
<meta name="twitter:description" content="Tour description">
<meta name="twitter:image" content="Preview image URL">
```

## Testing

Use `test-sharing-functionality.html` to test all sharing features:

1. **Share Modal** - Test URL generation and social sharing
2. **Embed Modal** - Test embed code generation and preview
3. **API Endpoints** - Test backend functionality
4. **Embed Library** - Test JavaScript embedding
5. **QR Codes** - Test QR code generation

## File Structure

```
loft-tour/
├── viewer.html                     # Standalone viewer for shared links
├── embed.html                      # Embed viewer for iframes
├── test-sharing-functionality.html # Testing interface
├── js/
│   ├── loft-tour-sharing.js        # Main sharing system
│   └── loft-tour-embed.js          # External embed library
├── css/
│   └── loft-tour-sharing.css       # Sharing modal styles
└── SHARING-IMPLEMENTATION.md       # This documentation

api/classes/
└── LoftTour.php                    # Backend sharing methods added
```

## Browser Support

- **Modern browsers** with ES6+ support
- **Mobile browsers** with touch and native sharing
- **Iframe embedding** in all major browsers
- **Fallback support** for older browsers (clipboard, etc.)

## Performance Considerations

1. **Lazy loading** for embed iframes
2. **Intersection Observer** for performance
3. **Optimized modal rendering**
4. **Efficient QR code generation**
5. **Minimal JavaScript footprint**

## Future Enhancements

1. **Analytics integration** for shared tours
2. **Custom branding** options for embeds
3. **Advanced sharing controls** (expiry, password protection)
4. **Bulk sharing** for multiple tours
5. **Integration with CRM systems**

---

## Implementation Status: ✅ COMPLETE

All sharing and embedding functionality has been successfully implemented according to the task requirements:

- ✅ Shareable URL generation with parameters
- ✅ Embed code creation (iframe, responsive, JavaScript)
- ✅ QR code generation for mobile sharing
- ✅ Social media preview cards and sharing
- ✅ Offline deployment package creation
- ✅ Professional modal interfaces
- ✅ External JavaScript embed library
- ✅ Mobile-optimized responsive design
- ✅ Security and performance optimizations