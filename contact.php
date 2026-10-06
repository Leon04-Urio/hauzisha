<?php ?>

<!DOCTYPE html>
<html lang="en">

<head>
  <title>Hauzisha - Contact Us</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link rel="icon" type="image/svg+xml" href="images/logo.png">
  <link rel="preconnect" href="https://fonts.gstatic.com/">
  <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
    integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
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
  </style>
  <link rel="stylesheet" href="css/modal-backdrop.css">
</head>

<body>

  <?php include 'navbar.php'; ?>

  <section class="hero-wrap hero-wrap-2" style="background-image: url('images/bg_4.jpg');">
    <!-- Mobile Back Button -->
    <i class="fa fa-angle-left back-btn" onclick="window.history.back()"
      style="cursor: pointer; z-index: 4000; position: absolute;"></i>

    <div class="overlay"></div>
    <div class="container">
      <div class="row no-gutters slider-text align-items-center justify-content-center">
        <div class="col-md-9 pt-5 text-center">
          <p class="breadcrumbs"><span class="mr-2"><a href="index.php">Home <i
                  class="fa fa-chevron-right"></i></a></span> <span>Contact <i class="fa fa-chevron-right"></i></span>
          </p>
          <h1 class="mb-0 bread">Contact Us</h1>
        </div>
      </div>
    </div>
  </section>

  <section class="ftco-section bg-light" id="contact-container">
    <div class="container">
      <div class="row no-gutters justify-content-center">
        <div class="col-md-12">
          <div class="wrapper">
            <div class="row g-0">
              <div class="col-lg-6">
                <div class="contact-wrap w-100 p-md-5 p-4">
                  <h3>Contact us</h3>
                  <p class="mb-4">We're open for any suggestion or just to have a chat</p>
                  <div class="row mb-4">
                    <div class="col-md-4">
                      <div class="dbox w-100 d-flex align-items-start">
                        <div class="text">
                          <p><span>Address:</span>Suite 721 Kilimani Nairobi KE</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="dbox w-100 d-flex align-items-start">
                        <div class="text">
                          <p><span>Email:</span> <a href="mailto:hello@bidbrick.com"
                              style="color: #999999;">hellohauzisha@gmail.com</a></p>
                        </div>

                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="dbox w-100 d-flex align-items-start">
                        <div class="text">
                          <p><span>Phone:</span> <a href="tel://1234567920" style="color: #999999;"> +1 234 456
                              78910</a></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="form-message"></div>
                  <form id="contactForm" name="contactForm" class="contactForm" method="POST" action="send-email.php">
                    <div class="row">
                      <div class="col-md-12">
                        <div class="form-group">
                          <input type="text" class="form-control" name="name" id="name" placeholder="Name">
                        </div>
                      </div>
                      <div class="col-md-12 mt-3">
                        <div class="form-group">
                          <input type="email" class="form-control" name="email" id="email" placeholder="Email">
                        </div>
                      </div>
                      <div class="col-md-12 mt-3">
                        <div class="form-group">
                          <input type="text" class="form-control subject-input" style="font-weight: bold;"
                            name="subject" id="subject" placeholder="Subject"
                            value="<?php echo isset($_GET['subject']) ? htmlspecialchars($_GET['subject']) : ''; ?>">
                        </div>
                      </div>
                      <div class="col-md-12 mt-3">
                        <div class="form-group">
                          <textarea name="message" class="form-control" id="message" cols="30" rows="4"
                            placeholder="Create a message here"><?php echo isset($_GET['message']) ? htmlspecialchars($_GET['message']) : ''; ?></textarea>
                        </div>
                      </div>
                      <div class="col-md-12">
                        <div class="form-group mt-3">
                          <input type="submit" id="submitEmail" value="Send Message" class="btn btn-primary">
                          <div class="submitting"></div>
                        </div>
                      </div>
                    </div>
                  </form>
                  <div class="w-100 social-media mt-5">
                    <h3>Follow us here</h3>
                    <p>
                    <ul class="ftco-footer-social-2 list-unstyled mt-2">
                      <!-- <li><a href="#" style="color: #06122a;"><span class="fa fa-twitter"></span></a></li> -->
                      <li><a href="#" target="_blank" rel="noopener noreferrer" style="color: #06122a;"><span
                            class="fa fa-facebook"></span></a></li>
                      <li><a href="https://www.instagram.com/helloloft?igsh=MThnbGtwbG1yenBidg%3D%3D&utm_source=qr"
                          target="_blank" rel="noopener noreferrer" style="color: #06122a;"><span
                            class="fa fa-instagram"></span></a></li>
                      <li><a href="#" target="_blank" rel="noopener noreferrer" style="color: #06122a;"><span
                            class="fa fa-linkedin"></span></a></li>
                    </ul>
                    </p>
                  </div>

                </div>
              </div>
              <div class="col-lg-6 d-flex align-items-stretch">
                <div id="map" class="map-container bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <?php include 'footer.php'; ?>

  <script src="js/cookie-consent.js"></script>
  <script src="js/bootstrap.bundle.min.js"></script>
  <script src="js/tiny-slider.js"></script>
  <script src="js/glightbox.min.js"></script>
  <script src="js/aos.js"></script>
  <script src="js/main.js"></script>
  <script src="js/login-register.js"></script>
  <script src="js/index.js"></script>
  <script src="js/contact.js"></script>
  <script src="js/contact-refresh.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="js/toast.js"></script>
</body>

</html>
