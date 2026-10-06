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
  <title>Our Services - HAUZISHA</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link rel="icon" type="image/svg+xml" href="../images/logo.png">
  
  <link rel="preconnect" href="https://fonts.gstatic.com/">
  <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  
  <link rel="stylesheet" href="../css/font-awesome.min.css">
  <link rel="stylesheet" href="../css/ionicons.min.css">
  <link rel="stylesheet" href="../css/animate.css">
  <link rel="stylesheet" href="../css/flaticon.css">
  <link rel="stylesheet" href="../css/tiny-slider.css">
  <link rel="stylesheet" href="../css/glightbox.min.css">
  <link rel="stylesheet" href="../css/aos.css">
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/skeleton-loading.css">
  <link rel="stylesheet" href="../css/cookie-consent.css">

  <style>
    body {
      background: #000;
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
      height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(18,18,18,0.9)), url('../images/bg_4.jpg');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
    }

    /* .hero-content {
      text-align: center;
      color: #999999;
      max-width: 900px;
      padding: 0 2rem;
    } */

    .hero-title {
      /* font-size: 3rem; */
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #fff;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1rem;
      font-weight: 600;
      color: #999999;
      line-height: 1.6;
    }

    .section-container {
      /* max-width: 1200px; */
      margin: 0 auto;
      padding: 0 1rem;
    }

    .services-section {
      padding: 6rem 0;
      background: transparent;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 1rem;
      text-align: center;
    }

    .section-subtitle {
      font-size: 1rem;
      color: #999999;
      text-align: center;
      margin-bottom: 2rem;
      font-weight: 600;
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
      margin-bottom: 4rem;
    }

    .service-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 3rem 2.5rem;
      text-align: center;
      transition: all 0.4s ease;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.6s ease;
    }

    .service-card:hover::before {
      left: 100%;
    }

    .service-card:hover {
      transform: translateY(-10px);
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px rgba(255, 255, 255, 0.1);
    }

    .service-card.featured {
      border-color: rgba(255, 255, 255, 0.1);
      background: rgba(255, 215, 0, 0.08);
      position: relative;
    }

    .featured-badge {
      position: absolute;
      top: -1px;
      right: -1px;
      background: #ffd700;
      color: #000;
      padding: 0.5rem 1.5rem;
      border-radius: 0 20px 0 20px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .service-icon {
      width: 70px;
      height: 70px;
      background: #ffd700;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 2rem;
      font-size: 1.5rem;
      color: #000;
      transition: all 0.4s ease;
    }

    .service-card:hover .service-icon {
      transform: scale(1.1) rotate(5deg);
    }

    .service-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 1rem;
    }

    .service-description {
      color: #999999;
      line-height: 1.6;
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    .service-features {
      list-style: none;
      padding: 0;
      margin: 2rem 0;
      text-align: left;
      flex-grow: 1;
    }

    .service-features li {
      color: #999999;
      margin-bottom: 0.8rem;
      padding-left: 1.5rem;
      position: relative;
      font-size: 0.95rem;
    }

    .service-features li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #ffd700;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .service-price {
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 1rem;
      margin-top: auto;
    }

    .service-price .currency {
      font-size: 1rem;
      vertical-align: top;
    }

    .service-btn {
      background: transparent;
      color: #ddd;
      border: 0.5px solid gray;
      padding:0.5rem 1rem;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      width: 100%;
      max-width: 350px;
      text-transform: uppercase;
      margin-top: 1rem;
    }

    .service-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 25px rgba(255, 215, 0, 0.4);
      color: #000;
      background: #ffd700;
    }

    .process-section {
      background: #fff;
      border-top: 1px solid rgba(255, 255, 255, 0.4);
      border-bottom: 1px solid rgba(255, 255, 255, 0.4);
      padding: 2rem 0;
      margin: 4rem 0;
    }

    .process-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 0.5rem;
      margin-top: 3rem;
    }

    .process-step {
      text-align: center;
      padding: 1rem 0.5rem;
    }

    .step-number {
      width: 50px;
      height: 50px;
      background: #ffd700;
      color: #000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 auto 1.5rem;
    }

    .step-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: gray;
      margin-bottom: 1rem;
    }

    .step-description {
      color: #999999;
      line-height: 1.6;
      font-size: 1rem;
    }

    .contact-section {
      /* background: rgba(255, 255, 255, 0.03); */
      /* border-radius: 20px; */
      padding: 4rem 2rem;
      text-align: center;
      /* margin: 4rem 0; */
    }

    .contact-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 1rem;
    }

    .contact-text {
      color: #999999;
      margin-bottom: 3rem;
      font-size: 1rem;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .contact-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 15px;
      transition: all 0.3s ease;
    }

    .contact-item:hover {
      transform: translateY(-5px);
      background: rgba(255, 215, 0, 0.1);
    }

    .contact-icon {
      font-size: 2rem;
      color: #ffd700;
    }

    .contact-label {
      color: #fff;
      font-weight: 600;
    }

    .contact-value {
      color: #bbb;
      font-size: 0.95rem;
    }

    @media (max-width: 1200px) {
      .services-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
      }
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }
      
      .hero-subtitle {
        font-size: 1.1rem;
      }
      
      .services-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      
      .service-card {
        padding: 2rem 1.5rem;
      }
      
      .section-title {
        font-size: 2rem;
      }
      
      .process-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>

<body data-logged-in="<?= isset($_SESSION['user_id']) ? 'true' : 'false' ?>">

<?php include '../navbar.php'; ?>

<!-- Hero Section -->
<section class="hero-section hero-wrap hero-wrap-2" style="background-image: url('../images/bg_4.jpg');">
    <!-- Mobile Back Button -->
    <i class="fa fa-angle-left back-btn" onclick="window.history.back()" style="cursor: pointer; z-index: 4000; position: absolute;"></i>
    
    <div class="overlay"></div>
    <div class="container">
      <div class="row no-gutters slider-text align-items-center justify-content-center">
        <div class="col-md-9 pt-5 text-center hero-content" data-aos="fade-up" data-aos-duration="1000">
          <p class="breadcrumbs"><span class="mr-2"><a href="index.php">Home <i class="fa fa-chevron-right"></i></a></span> <span>Services <i class="fa fa-chevron-right"></i></span></p>
          <h1 class="mb-0 bread">Our Services</h1>
        </div>
      </div>
    </div>
  </section>


<!-- <section class="hero-section">
  <div class="hero-content" data-aos="fade-up" data-aos-duration="1000">
    <h1 class="hero-title">Our Services</h1>
    <p class="hero-subtitle">
      Professional real estate marketing solutions designed to showcase your properties 
      with cutting-edge technology and premium presentation.
    </p>
  </div>
</section> -->

<!-- Services Section -->
<section class="services-section">
  <div class="section-container">
    <h2 class="section-title" data-aos="fade-up">Choose Your Package</h2>
    <p class="section-subtitle" data-aos="fade-up" data-aos-delay="200">
      From basic listings to immersive 3D experiences <br />
      Professional real estate marketing solutions designed to showcase your properties 
      with cutting-edge technology and premium presentation.
    </p>
    
    <div class="services-grid">
      <!-- Basic Listing -->
      <div class="service-card" data-aos="fade-up" data-aos-delay="300">
        <div class="service-icon">
          <i class="fas fa-home"></i>
        </div>
        <h3 class="service-title">Basic Listing</h3>
        <p class="service-description">
          Get your property online with essential features for maximum visibility and professional presentation.
        </p>
        <ul class="service-features">
          <li>Property listing for 60 days</li>
          <li>High-quality photo upload</li>
          <li>Search engine optimization</li>
          <li>Mobile-responsive display</li>
          <li>Contact form integration</li>
          <li>Basic analytics dashboard</li>
        </ul>
        <div class="service-price">
          <span class="currency">KES</span> 2,500
        </div>
        <a href="payment.php?package=listing" class="service-btn">Pay Now</a>
      </div>

      <!-- Professional Package -->
      <div class="service-card" data-aos="fade-up" data-aos-delay="400">
        <div class="service-icon">
          <i class="fas fa-camera"></i>
        </div>
        <h3 class="service-title">Professional Package</h3>
        <p class="service-description">
          Professional photography and enhanced marketing features to make your property stand out from the competition.
        </p>
        <ul class="service-features">
          <li>Professional photography session</li>
          <li>Property verification badge</li>
          <li>Enhanced listing visibility</li>
          <li>Professional image editing</li>
          <li>Social media ready images</li>
          <li>Priority customer support</li>
        </ul>
        <div class="service-price">
          <span class="currency">KES</span> 8,500
        </div>
        <a href="payment.php?package=basic" class="service-btn">Pay Now</a>
      </div>

      <!-- Premium 3D Package -->
      <div class="service-card featured" data-aos="fade-up" data-aos-delay="500">
        <div class="featured-badge">Most Popular</div>
        <div class="service-icon">
          <i class="fas fa-cube"></i>
        </div>
        <h3 class="service-title">Premium 3D Experience</h3>
        <p class="service-description">
          Complete immersive experience with 3D virtual tours, professional media, and premium marketing features.
        </p>
        <ul class="service-features">
          <li>Matterport 3D virtual tour</li>
          <li>Professional photography</li>
          <li>Interactive floor plans</li>
          <li>Virtual reality compatibility</li>
          <li>Property verification badge</li>
          <li>Featured placement boost</li>
          <li>Advanced analytics</li>
          <li>Dedicated account manager</li>
        </ul>
        <div class="service-price">
          <span class="currency">KES</span> 25,000
        </div>
        <a href="payment.php?package=premium" class="service-btn">Pay Now</a>
      </div>

      <!-- Enterprise Solution -->
      <div class="service-card" data-aos="fade-up" data-aos-delay="600">
        <div class="service-icon">
          <i class="fas fa-building"></i>
        </div>
        <h3 class="service-title">Enterprise Solution</h3>
        <p class="service-description">
          Comprehensive solution for agencies and developers with bulk listings, custom branding, and advanced features.
        </p>
        <ul class="service-features">
          <li>Unlimited property listings</li>
          <li>Custom branding options</li>
          <li>API access and integration</li>
          <li>Bulk upload capabilities</li>
          <li>Advanced reporting suite</li>
          <li>White-label solutions</li>
          <li>Priority technical support</li>
          <li>Custom feature development</li>
        </ul>
        <div class="service-price">
          <span style="font-size: 1.2rem;">Custom Pricing</span>
        </div>
        <a href="../contact.php" class="service-btn">Contact Us</a>
      </div>
    </div>
  </div>
</section>

<!-- Process Section -->
<section class="process-section">
  <div class="section-container">
    <h4 class="section-title text-dark" data-aos="fade-up" style="font-size: 1.4rem;">How It Works</h4>
    <p class="section-subtitle" data-aos="fade-up" data-aos-delay="200">
      Simple, streamlined process from booking to delivery
    </p>
    
    <div class="process-grid">
      <div class="process-step" data-aos="fade-up" data-aos-delay="300">
        <div class="step-number">1</div>
        <h3 class="step-title">Choose Package</h3>
        <p class="step-description">
          Select the service package that best fits your property marketing needs and budget.
        </p>
      </div>
      
      <div class="process-step" data-aos="fade-up" data-aos-delay="400">
        <div class="step-number">2</div>
        <h3 class="step-title">Schedule Session</h3>
        <p class="step-description">
          Book a convenient time for our professional team to visit and capture your property.
        </p>
      </div>
      
      <div class="process-step" data-aos="fade-up" data-aos-delay="500">
        <div class="step-number">3</div>
        <h3 class="step-title">Professional Capture</h3>
        <p class="step-description">
          Our certified photographers and 3D specialists create stunning visual content for your property.
        </p>
      </div>
      
      <div class="process-step" data-aos="fade-up" data-aos-delay="600">
        <div class="step-number">4</div>
        <h3 class="step-title">Go Live</h3>
        <p class="step-description">
          Your enhanced property listing goes live with professional media and premium features activated.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Contact Section -->
<section class="services-section">
  <div class="">
    <div class="contact-section" data-aos="fade-up">
      <h2 class="contact-title">Ready to Get Started?</h2>
      <p class="contact-text">
        Contact our team to discuss your property marketing needs and find the perfect solution for your goals.
      </p>
      
      <!-- <div class="contact-grid">
        <div class="contact-item">
          <div class="contact-icon">
            <i class="fas fa-phone"></i>
          </div>
          <div class="contact-label">Call Us</div>
          <div class="contact-value">+254 791 488 881</div>
        </div>
        
        <div class="contact-item">
          <div class="contact-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <div class="contact-label">Email Us</div>
          <div class="contact-value">hello@loftstudio.co.ke</div>
        </div>
        
        <div class="contact-item">
          <div class="contact-icon">
            <i class="fab fa-whatsapp"></i>
          </div>
          <div class="contact-label">WhatsApp</div>
          <div class="contact-value">Quick Support</div>
        </div>
        
        <div class="contact-item">
          <div class="contact-icon">
            <i class="fas fa-calendar"></i>
          </div>
          <div class="contact-label">Book Online</div>
          <div class="contact-value">Schedule Consultation</div>
        </div>
      </div> -->

      <div class="text-center mt-5">
        <a href="../contact.php#contact-container" class="btn btn-primary px-4 py-3" style="font-weight:bold; border-radius: 3px;">Book Us Now <span class="ion ion-ios-arrow-round-forward"></span></a>
      </div>
    </div>
  </div>
</section>

<?php include '../footer.php'; ?>

<!-- Scripts -->
<script src="../js/cookie-consent.js"></script>
<script src="../js/bootstrap.bundle.min.js"></script>
<script src="../js/tiny-slider.js"></script>
<script src="../js/glightbox.min.js"></script>
<script src="../js/aos.js"></script>
<script src="../js/main.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<script>
  // Initialize AOS (Animate On Scroll)
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100
  });

  // Add parallax effect to hero section
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-section');
    if (hero) {
      hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
  });

  // Add smooth hover animations for service cards
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });
</script>

</body>
</html>