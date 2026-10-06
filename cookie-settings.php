<?php
if (session_status() == PHP_SESSION_NONE) {
  session_start();
}

if (isset($_SESSION['user_id'])) {
  $loggedIn = true;
  $userId = $_SESSION['user_id'];
} else {
  $loggedIn = false;
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <title>Cookie Settings - Hauzisha</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link rel="icon" type="image/svg+xml" href="images/logo.png">

  <link rel="preconnect" href="https://fonts.gstatic.com/">
  <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap"
    rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

  <link rel="stylesheet" href="css/font-awesome.min.css">
  <link rel="stylesheet" href="css/ionicons.min.css">
  <link rel="stylesheet" href="css/animate.css">
  <link rel="stylesheet" href="css/flaticon.css">
  <link rel="stylesheet" href="css/tiny-slider.css">
  <link rel="stylesheet" href="css/glightbox.min.css">
  <link rel="stylesheet" href="css/aos.css">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/cookie-consent.css">

  <style>
    body {
      background: #000;
      overflow-x: hidden;
    }

    .hero-section {
      position: relative;
      height: 40vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(18, 18, 18, 0.9)), url('images/bg_4.jpg');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
    }

    .settings-section {
      padding: 6rem 0;
      background: transparent;
    }

    .section-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .settings-card {
      background: #fff;
      border: 2px solid #e9ecef;
      border-radius: 20px;
      padding: 3rem;
      margin-bottom: 2rem;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    .section-title {
      font-size: 2rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 1rem;
      text-align: center;
    }

    .section-subtitle {
      font-size: 1rem;
      color: #666;
      text-align: center;
      margin-bottom: 3rem;
      font-weight: 600;
    }

    .cookie-setting-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem 0;
      border-bottom: 1px solid #e9ecef;
    }

    .cookie-setting-item:last-child {
      border-bottom: none;
    }

    .setting-info h4 {
      color: #333;
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .setting-info p {
      color: #666;
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0;
    }

    .current-consent {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 15px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .consent-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .consent-status:last-child {
      margin-bottom: 0;
    }

    .status-label {
      color: #333;
      font-weight: 600;
    }

    .status-value {
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-enabled {
      background: #28a745;
      color: #fff;
    }

    .status-disabled {
      background: #dc3545;
      color: #fff;
    }

    .action-buttons {
      text-align: center;
      margin-top: 2rem;
    }

    .btn-action {
      background: #28a745;
      color: #fff;
      border: 2px solid #28a745;
      padding: 0.75rem 2rem;
      border-radius: 25px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      margin: 0 0.5rem;
      text-transform: uppercase;
    }

    .btn-action:hover {
      background: #34ce57;
      border-color: #34ce57;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
      color: #fff;
    }

    .btn-secondary {
      background: #fff;
      color: #6c757d;
      border: 2px solid #dee2e6;
    }

    .btn-secondary:hover {
      border-color: #adb5bd;
      background: #f8f9fa;
      color: #495057;
    }

    @media (max-width: 768px) {
      .settings-card {
        padding: 2rem 1.5rem;
      }

      .cookie-setting-item {
        flex-direction: column;
        gap: 1rem;
      }

      .consent-status {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  </style>
</head>

<body data-logged-in="<?= isset($_SESSION['user_id']) ? 'true' : 'false' ?>">

  <?php include 'navbar.php'; ?>

  <!-- Hero Section -->
  <section class="hero-section hero-wrap hero-wrap-2" style="background-image: url('images/bg_4.jpg');">
    <div class="overlay"></div>
    <div class="container">
      <div class="row no-gutters slider-text align-items-center justify-content-center">
        <div class="col-md-9 pt-5 text-center hero-content" data-aos="fade-up" data-aos-duration="1000">
          <p class="breadcrumbs"><span class="mr-2"><a href="index.php">Home <i
                  class="fa fa-chevron-right"></i></a></span> <span>Cookie Settings <i
                class="fa fa-chevron-right"></i></span></p>
          <h1 class="mb-0 bread">Cookie Settings</h1>
        </div>
      </div>
    </div>
  </section>

  <!-- Settings Section -->
  <section class="settings-section">
    <div class="section-container">
      <h2 class="section-title" data-aos="fade-up">Manage Your Cookie Preferences</h2>
      <p class="section-subtitle" data-aos="fade-up" data-aos-delay="200">
        Control how we use cookies to enhance your experience
      </p>

      <div class="settings-card" data-aos="fade-up" data-aos-delay="300">
        <h3 style="color: #333; margin-bottom: 1.5rem;">Current Cookie Settings</h3>

        <div class="current-consent" id="current-consent">
          <div class="consent-status">
            <span class="status-label">Essential Cookies</span>
            <span class="status-value status-enabled">Always Enabled</span>
          </div>
          <div class="consent-status">
            <span class="status-label">Analytics Cookies</span>
            <span class="status-value" id="analytics-status">Loading...</span>
          </div>
          <div class="consent-status">
            <span class="status-label">Functional Cookies</span>
            <span class="status-value" id="functional-status">Loading...</span>
          </div>
          <div class="consent-status">
            <span class="status-label">Marketing Cookies</span>
            <span class="status-value" id="marketing-status">Loading...</span>
          </div>
        </div>

        <div class="cookie-setting-item">
          <div class="setting-info">
            <h4>Essential Cookies</h4>
            <p>These cookies are necessary for the website to function and cannot be switched off. They are usually only
              set in response to actions made by you which amount to a request for services, such as setting your
              privacy preferences, logging in or filling in forms.</p>
          </div>
          <label class="cookie-switch">
            <input type="checkbox" checked disabled>
            <span class="slider essential"></span>
          </label>
        </div>

        <div class="cookie-setting-item">
          <div class="setting-info">
            <h4>Analytics Cookies</h4>
            <p>These cookies allow us to count visits and traffic sources so we can measure and improve the performance
              of our site. They help us to know which pages are the most and least popular and see how visitors move
              around the site.</p>
          </div>
          <label class="cookie-switch">
            <input type="checkbox" id="analytics-toggle-settings">
            <span class="slider"></span>
          </label>
        </div>

        <div class="cookie-setting-item">
          <div class="setting-info">
            <h4>Functional Cookies</h4>
            <p>These cookies enable the website to provide enhanced functionality and personalisation. They may be set
              by us or by third party providers whose services we have added to our pages.</p>
          </div>
          <label class="cookie-switch">
            <input type="checkbox" id="functional-toggle-settings">
            <span class="slider"></span>
          </label>
        </div>

        <div class="cookie-setting-item">
          <div class="setting-info">
            <h4>Marketing Cookies</h4>
            <p>These cookies may be set through our site by our advertising partners. They may be used by those
              companies to build a profile of your interests and show you relevant adverts on other sites.</p>
          </div>
          <label class="cookie-switch">
            <input type="checkbox" id="marketing-toggle-settings">
            <span class="slider"></span>
          </label>
        </div>

        <div class="action-buttons">
          <button class="btn-action" onclick="saveSettings()">Save Preferences</button>
          <button class="btn-action btn-secondary" onclick="resetToDefaults()">Reset to Defaults</button>
          <button class="btn-action btn-secondary" onclick="revokeAll()">Revoke All Consent</button>
        </div>
      </div>
    </div>
  </section>

  <?php include 'footer.php'; ?>

  <!-- Scripts -->
  <script src="js/cookie-consent.js"></script>
  <script src="js/bootstrap.bundle.min.js"></script>
  <script src="js/tiny-slider.js"></script>
  <script src="js/glightbox.min.js"></script>
  <script src="js/aos.js"></script>
  <script src="js/main.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

  <script>
    // Initialize AOS
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });

    // Cookie settings management
    let currentConsent = null;

    // Load current settings when page loads
    document.addEventListener('DOMContentLoaded', () => {
      loadCurrentSettings();
    });

    function loadCurrentSettings() {
      // Get current consent from cookie
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'loft_cookie_consent') {
          try {
            currentConsent = JSON.parse(decodeURIComponent(value));
            break;
          } catch (e) {
            currentConsent = null;
          }
        }
      }

      if (currentConsent) {
        // Update status indicators
        updateStatusIndicator('analytics-status', currentConsent.analytics);
        updateStatusIndicator('functional-status', currentConsent.functional);
        updateStatusIndicator('marketing-status', currentConsent.marketing);

        // Update toggle switches
        document.getElementById('analytics-toggle-settings').checked = currentConsent.analytics;
        document.getElementById('functional-toggle-settings').checked = currentConsent.functional;
        document.getElementById('marketing-toggle-settings').checked = currentConsent.marketing;
      } else {
        // No consent found - show defaults
        updateStatusIndicator('analytics-status', false);
        updateStatusIndicator('functional-status', false);
        updateStatusIndicator('marketing-status', false);
      }
    }

    function updateStatusIndicator(elementId, enabled) {
      const element = document.getElementById(elementId);
      if (enabled) {
        element.textContent = 'Enabled';
        element.className = 'status-value status-enabled';
      } else {
        element.textContent = 'Disabled';
        element.className = 'status-value status-disabled';
      }
    }

    function saveSettings() {
      const consent = {
        essential: true,
        analytics: document.getElementById('analytics-toggle-settings').checked,
        functional: document.getElementById('functional-toggle-settings').checked,
        marketing: document.getElementById('marketing-toggle-settings').checked,
        timestamp: Date.now()
      };

      // Save to cookie
      const consentString = JSON.stringify(consent);
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + (365 * 24 * 60 * 60 * 1000));

      document.cookie = `loft_cookie_consent=${consentString}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

      // Update display
      loadCurrentSettings();

      // Show success message
      showToast('Cookie preferences saved successfully!', 'success');
    }

    function resetToDefaults() {
      document.getElementById('analytics-toggle-settings').checked = false;
      document.getElementById('functional-toggle-settings').checked = false;
      document.getElementById('marketing-toggle-settings').checked = false;

      saveSettings();
    }

    function revokeAll() {
      if (confirm('Are you sure you want to revoke all cookie consent? This will reset all your preferences and you may need to accept cookies again.')) {
        // Delete the consent cookie
        document.cookie = 'loft_cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // Reload page to show banner again
        location.reload();
      }
    }
  </script>

</body>

</html>