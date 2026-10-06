/**
 * Cookie Consent Management System
 * GDPR Compliant with granular cookie controls
 */

class CookieConsent {
    constructor() {
        this.cookieName = 'loft_cookie_consent';
        this.cookieExpiry = 365; // days
        this.categories = {
            essential: { required: true, accepted: true },
            analytics: { required: false, accepted: false },
            marketing: { required: false, accepted: false },
            functional: { required: false, accepted: false }
        };
        
        this.init();
    }

    init() {
        // Check if consent already given
        const consent = this.getConsent();
        if (!consent) {
            this.showBanner();
        } else {
            this.applyConsent(consent);
        }
        
        // Add event listeners
        this.bindEvents();
    }

    showBanner() {
        // Remove existing banner if any
        const existing = document.getElementById('cookie-consent-banner');
        if (existing) existing.remove();

        // Create banner HTML
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = this.getBannerHTML();
        
        // Add to page
        document.body.appendChild(banner);
        
        // Animate in
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }

    getBannerHTML() {
        return `
            <div class="cookie-banner-overlay">
                <div class="cookie-banner-content">
                    <div class="cookie-banner-header">
                        <div class="cookie-icon">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h3>Privacy & Cookies</h3>
                    </div>
                    
                    <div class="cookie-banner-body">
                        <p>We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. By continuing to browse, you agree to our use of cookies.</p>
                        
                        <div class="cookie-categories" id="cookie-categories">
                            <div class="cookie-category">
                                <div class="category-info">
                                    <h4>Essential Cookies</h4>
                                    <p>Required for basic site functionality and security.</p>
                                </div>
                                <label class="cookie-switch">
                                    <input type="checkbox" checked disabled>
                                    <span class="slider essential"></span>
                                </label>
                            </div>
                            
                            <div class="cookie-category">
                                <div class="category-info">
                                    <h4>Analytics Cookies</h4>
                                    <p>Help us understand how visitors interact with our website.</p>
                                </div>
                                <label class="cookie-switch">
                                    <input type="checkbox" id="analytics-toggle">
                                    <span class="slider"></span>
                                </label>
                            </div>
                            
                            <div class="cookie-category">
                                <div class="category-info">
                                    <h4>Functional Cookies</h4>
                                    <p>Remember your preferences and personalize your experience.</p>
                                </div>
                                <label class="cookie-switch">
                                    <input type="checkbox" id="functional-toggle">
                                    <span class="slider"></span>
                                </label>
                            </div>
                            
                            <div class="cookie-category">
                                <div class="category-info">
                                    <h4>Marketing Cookies</h4>
                                    <p>Used to deliver relevant advertisements and track performance.</p>
                                </div>
                                <label class="cookie-switch">
                                    <input type="checkbox" id="marketing-toggle">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="cookie-banner-actions">
                        <button class="btn-cookie btn-customize" onclick="cookieConsent.toggleCustomize()">
                            Customize
                        </button>
                        <button class="btn-cookie btn-reject" onclick="cookieConsent.rejectAll()">
                            Reject All
                        </button>
                        <button class="btn-cookie btn-accept" onclick="cookieConsent.acceptAll()">
                            Accept All
                        </button>
                        <button class="btn-cookie btn-save" onclick="cookieConsent.savePreferences()" style="display: none;">
                            Save Preferences
                        </button>
                    </div>
                    
                    <div class="cookie-banner-footer">
                        <a href="privacy-policy.php" target="_blank">Privacy Policy</a>
                        <span>•</span>
                        <a href="t&c.php" target="_blank">Terms & Conditions</a>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Global cookie consent object
        window.cookieConsent = this;
        
        // Listen for settings button (if you want to add one later)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cookie-settings-btn')) {
                this.showBanner();
            }
        });
    }

    toggleCustomize() {
        const categories = document.getElementById('cookie-categories');
        const customizeBtn = document.querySelector('.btn-customize');
        const saveBtn = document.querySelector('.btn-save');
        const acceptBtn = document.querySelector('.btn-accept');
        
        if (categories.style.display === 'none' || !categories.style.display) {
            categories.style.display = 'block';
            customizeBtn.textContent = 'Hide Options';
            saveBtn.style.display = 'inline-flex';
            acceptBtn.textContent = 'Accept Selected';
        } else {
            categories.style.display = 'none';
            customizeBtn.textContent = 'Customize';
            saveBtn.style.display = 'none';
            acceptBtn.textContent = 'Accept All';
        }
    }

    acceptAll() {
        const consent = {
            essential: true,
            analytics: true,
            functional: true,
            marketing: true,
            timestamp: Date.now()
        };
        
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideBanner();
    }

    rejectAll() {
        const consent = {
            essential: true,
            analytics: false,
            functional: false,
            marketing: false,
            timestamp: Date.now()
        };
        
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideBanner();
    }

    savePreferences() {
        const consent = {
            essential: true,
            analytics: document.getElementById('analytics-toggle').checked,
            functional: document.getElementById('functional-toggle').checked,
            marketing: document.getElementById('marketing-toggle').checked,
            timestamp: Date.now()
        };
        
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideBanner();
    }

    saveConsent(consent) {
        const consentString = JSON.stringify(consent);
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (this.cookieExpiry * 24 * 60 * 60 * 1000));
        
        document.cookie = `${this.cookieName}=${consentString}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    }

    getConsent() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === this.cookieName) {
                try {
                    return JSON.parse(decodeURIComponent(value));
                } catch (e) {
                    return null;
                }
            }
        }
        return null;
    }

    applyConsent(consent) {
        // Apply analytics cookies
        if (consent.analytics) {
            this.loadAnalytics();
        }
        
        // Apply functional cookies
        if (consent.functional) {
            this.loadFunctional();
        }
        
        // Apply marketing cookies
        if (consent.marketing) {
            this.loadMarketing();
        }
        
        // Dispatch custom event for other scripts
        document.dispatchEvent(new CustomEvent('cookieConsentUpdated', { 
            detail: consent 
        }));
    }

    loadAnalytics() {
        // Add Google Analytics or other analytics here
        console.log('Analytics cookies enabled');
        
        // Example: Load Google Analytics
        // gtag('config', 'GA_MEASUREMENT_ID');
    }

    loadFunctional() {
        // Add functional cookies here
        console.log('Functional cookies enabled');
    }

    loadMarketing() {
        // Add marketing cookies here
        console.log('Marketing cookies enabled');
    }

    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.add('hide');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

    // Public method to revoke consent (for settings page)
    revokeConsent() {
        document.cookie = `${this.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        location.reload();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CookieConsent();
});