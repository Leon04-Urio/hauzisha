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
  <title>About Us - Hauzisha</title>
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
  <link rel="stylesheet" href="css/skeleton-loading.css">

  <style>
    body {
      background: linear-gradient(to bottom, #000, #121212);
      overflow-x: hidden;
    }

    /* Hide mobile bottom nav on this page */
    @media (max-width: 991.98px) {
      .mobile-bottom-nav {
        display: none !important;
      }
    }

    /* Mobile back button */
    .back-btn {
      font-size: 1.5rem;
      cursor: pointer;
      color: #fff;
      display: none;
      position: absolute;
      top: 1.5rem;
      left: 1.5rem;
      z-index: 4000;
    }

    @media (max-width: 768px) {
      .back-btn {
        display: block;
      }
    }

    .hero-section {
      position: relative;
      height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(18, 18, 18, 0.9)), url('images/work-1.jpg');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
    }

    .hero-content {
      text-align: center;
      color: #fff;
      max-width: 800px;
      padding: 0 2rem;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, #fff, #ffd700);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.3rem;
      font-weight: 300;
      color: #ddd;
      line-height: 1.6;
    }

    .section-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .story-section {
      padding: 6rem 0;
      background: transparent;
    }

    .story-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 3rem;
      margin-bottom: 3rem;
      transition: all 0.4s ease;
    }

    .story-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(255, 215, 0, 0.1);
      border-color: rgba(255, 215, 0, 0.3);
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .section-subtitle {
      font-size: 1.1rem;
      color: #ffd700;
      text-align: center;
      margin-bottom: 3rem;
      font-weight: 600;
    }

    .story-text {
      font-size: 1.1rem;
      line-height: 1.8;
      color: #ddd;
      margin-bottom: 2rem;
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 4rem;
    }

    .value-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      padding: 2.5rem 2rem;
      text-align: center;
      transition: all 0.4s ease;
    }

    .value-card:hover {
      transform: translateY(-5px);
      background: rgba(255, 215, 0, 0.05);
      border-color: rgba(255, 215, 0, 0.3);
    }

    .value-icon {
      font-size: 3rem;
      color: #ffd700;
      margin-bottom: 1.5rem;
    }

    .value-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 1rem;
    }

    .value-text {
      color: #bbb;
      line-height: 1.6;
    }

    .stats-section {
      background: rgba(255, 215, 0, 0.05);
      border-top: 1px solid rgba(255, 215, 0, 0.2);
      border-bottom: 1px solid rgba(255, 215, 0, 0.2);
      padding: 4rem 0;
      margin: 4rem 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      text-align: center;
    }

    .stat-number {
      font-size: 3rem;
      font-weight: 700;
      color: #ffd700;
      display: block;
    }

    .stat-label {
      font-size: 1.1rem;
      color: #ddd;
      margin-top: 0.5rem;
    }

    .team-section {
      padding: 6rem 0;
    }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }

    .team-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      padding: 2rem;
      text-align: center;
      transition: all 0.4s ease;
    }

    .team-card:hover {
      transform: translateY(-5px);
      border-color: rgba(255, 215, 0, 0.3);
    }

    .team-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2.5rem;
      color: #000;
      font-weight: 700;
    }

    .team-name {
      font-size: 1.3rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 0.5rem;
    }

    .team-role {
      color: #ffd700;
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .team-bio {
      color: #bbb;
      line-height: 1.6;
      font-size: 0.95rem;
    }

    .cta-section {
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 237, 78, 0.05));
      border-radius: 20px;
      padding: 4rem 2rem;
      text-align: center;
      margin: 4rem 0;
    }

    .cta-title {
      font-size: 2.2rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 1rem;
    }

    .cta-text {
      font-size: 1.1rem;
      color: #ddd;
      margin-bottom: 2rem;
    }

    .cta-button {
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
      border: none;
      padding: 1rem 2.5rem;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s ease;
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(255, 215, 0, 0.3);
      color: #000;
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }

      .hero-subtitle {
        font-size: 1.1rem;
      }

      .story-card {
        padding: 2rem;
      }

      .section-title {
        font-size: 2rem;
      }
    }
  </style>
  <link rel="stylesheet" href="css/modal-backdrop.css">
</head>

<body data-logged-in="<?= isset($_SESSION['user_id']) ? 'true' : 'false' ?>">

  <?php include 'navbar.php'; ?>

  <!-- Hero Section -->
  <section class="hero-section">
    <!-- Mobile Back Button -->
    <i class="fa fa-angle-left back-btn" onclick="window.history.back()"
      style="cursor: pointer; z-index: 4000; position: absolute;"></i>

    <div class="hero-content" data-aos="fade-up" data-aos-duration="1000">
      <h1 class="hero-title">About Hauzisha</h1>
      <p class="hero-subtitle">
        Revolutionizing real estate through cutting-edge technology, immersive experiences,
        and a passion for connecting people with their perfect spaces.
      </p>
    </div>
  </section>

  <!-- Our Story Section -->
  <section class="story-section">
    <div class="section-container">
      <div class="story-card" data-aos="fade-up" data-aos-duration="800">
        <h2 class="section-title">Our Story</h2>
        <p class="section-subtitle">Where Innovation Meets Real Estate</p>

        <p class="story-text">
          HAUZISHA was born from a simple yet powerful vision: to transform how people discover,
          experience, and connect with properties. In a world where technology shapes every aspect
          of our lives, we recognized that real estate was ready for a revolutionary change.
        </p>

        <p class="story-text">
          Founded by a team of tech enthusiasts and real estate professionals, we combine deep
          industry knowledge with cutting-edge innovation. Our platform doesn't just list properties—it
          creates immersive experiences that help people envision their future homes before they
          even step through the door.
        </p>

        <p class="story-text">
          From virtual tours that transport you across continents to AR furniture placement that
          helps you design your dream space, HAUZISHA is more than a platform—it's your
          gateway to the future of real estate.
        </p>
      </div>
    </div>
  </section>

  <!-- Values Section -->
  <section class="story-section">
    <div class="section-container">
      <h2 class="section-title" data-aos="fade-up">Our Values</h2>
      <p class="section-subtitle" data-aos="fade-up" data-aos-delay="200">
        The principles that guide everything we do
      </p>

      <div class="values-grid">
        <div class="value-card" data-aos="fade-up" data-aos-delay="300">
          <div class="value-icon">
            <i class="fas fa-lightbulb"></i>
          </div>
          <h3 class="value-title">Innovation First</h3>
          <p class="value-text">
            We constantly push boundaries, embracing new technologies to create
            experiences that were once impossible.
          </p>
        </div>

        <div class="value-card" data-aos="fade-up" data-aos-delay="400">
          <div class="value-icon">
            <i class="fas fa-users"></i>
          </div>
          <h3 class="value-title">People-Centered</h3>
          <p class="value-text">
            Every feature we build starts with understanding real human needs
            and creating genuine value for our community.
          </p>
        </div>

        <div class="value-card" data-aos="fade-up" data-aos-delay="500">
          <div class="value-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <h3 class="value-title">Trust & Transparency</h3>
          <p class="value-text">
            We verify every agent, authenticate every listing, and maintain
            the highest standards of integrity in all our interactions.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="stats-section">
    <div class="section-container">
      <div class="stats-grid">
        <div data-aos="fade-up" data-aos-delay="100">
          <span class="stat-number">10K+</span>
          <div class="stat-label">Properties Listed</div>
        </div>
        <div data-aos="fade-up" data-aos-delay="200">
          <span class="stat-number">500+</span>
          <div class="stat-label">Verified Agents</div>
        </div>
        <div data-aos="fade-up" data-aos-delay="300">
          <span class="stat-number">50K+</span>
          <div class="stat-label">Happy Users</div>
        </div>
        <div data-aos="fade-up" data-aos-delay="400">
          <span class="stat-number">99%</span>
          <div class="stat-label">Satisfaction Rate</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Team Section -->
  <section class="team-section">
    <div class="section-container">
      <h2 class="section-title" data-aos="fade-up">Meet Our Team</h2>
      <p class="section-subtitle" data-aos="fade-up" data-aos-delay="200">
        The passionate minds behind Hauzisha
      </p>

      <div class="team-grid">
        <div class="team-card" data-aos="fade-up" data-aos-delay="300">
          <div class="team-avatar">LS</div>
          <h3 class="team-name">Hauzisha Team</h3>
          <div class="team-role">Founders & Innovators</div>
          <p class="team-bio">
            A diverse group of technologists, designers, and real estate experts
            united by a shared vision of transforming how people find and experience properties.
          </p>
        </div>

        <div class="team-card" data-aos="fade-up" data-aos-delay="400">
          <div class="team-avatar">
            <i class="fas fa-code"></i>
          </div>
          <h3 class="team-name">Engineering Team</h3>
          <div class="team-role">Technology & Development</div>
          <p class="team-bio">
            Our world-class engineers build the cutting-edge platform that powers
            immersive property experiences and seamless user interactions.
          </p>
        </div>

        <div class="team-card" data-aos="fade-up" data-aos-delay="500">
          <div class="team-avatar">
            <i class="fas fa-home"></i>
          </div>
          <h3 class="team-name">Real Estate Experts</h3>
          <div class="team-role">Industry & Operations</div>
          <p class="team-bio">
            Seasoned professionals who understand the real estate market inside and out,
            ensuring our platform serves real industry needs.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Call to Action -->
  <section class="story-section">
    <div class="section-container">
      <div class="cta-section" data-aos="fade-up">
        <h2 class="cta-title">Ready to Experience the Future?</h2>
        <p class="cta-text">
          Join thousands of users who have already discovered their perfect properties through Hauzisha.
        </p>
        <a href="index.php" class="cta-button">
          Explore Properties <i class="fas fa-arrow-right ml-2"></i>
        </a>
      </div>
    </div>
  </section>

  <?php include 'footer.php'; ?>

  <!-- Scripts -->
  <script src="js/bootstrap.bundle.min.js"></script>
  <script src="js/tiny-slider.js"></script>
  <script src="js/glightbox.min.js"></script>
  <script src="js/aos.js"></script>
  <script src="js/main.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

  <script>
    // Initialize AOS (Animate On Scroll)
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });

    // Add smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Add parallax effect to hero section
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.hero-section');
      if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    });
  </script>

  <script src="js/toast.js"></script>
</body>

</html>