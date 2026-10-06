<?php ?>

<!DOCTYPE html>
<html lang="en">

<head>
  <title>Hauzisha - AR Showroom</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link rel="icon" type="image/svg+xml" href="images/logo.png">
  <link rel="preconnect" href="https://fonts.gstatic.com/">
  <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap"
    rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    integrity="sha512-..." crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link rel="stylesheet" href="css/font-awesome.min.css">
  <link rel="stylesheet" href="css/ionicons.min.css">
  <link rel="stylesheet" href="css/animate.css">
  <link rel="stylesheet" href="css/flaticon.css">
  <link rel="stylesheet" href="css/tiny-slider.css">
  <link rel="stylesheet" href="css/glightbox.min.css">
  <link rel="stylesheet" href="css/aos.css">
  <link rel="stylesheet" href="css/style.css">

  <!-- <script type="module" src="https://unpkg.com/@google/model-viewer"></script> -->
  <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
  <link rel="stylesheet" href="css/modal-backdrop.css">
</head>

<body style="background: linear-gradient(to top, #000, #121212);">

  <?php include 'navbar.php'; ?>

  <section class="hero-wrap hero-wrap-2" style="background-image: url('images/bg_4.jpg');">
    <div class="overlay"></div>
    <div class="container">
      <div class="row no-gutters slider-text align-items-center justify-content-center">
        <div class="col-md-9 pt-5 text-center">
          <p class="breadcrumbs"><span class="mr-2"><a href="index.php">Home <i
                  class="fa fa-chevron-right"></i></a></span> <span>AR Showroom <i
                class="fa fa-chevron-right"></i></span></p>
          <h1 class="mb-0 bread">AR Showroom</h1>
        </div>
      </div>
    </div>
  </section>

  <section class="ar-section">
    <div class="showroom">
      <h3 style="color: white; font-weight: bold; margin-top: 4rem;">Showroom</h3>
      <p>Select a furniture model from the catalogue to get started.</p>
    </div>
    <div class="container-xl ar-studio-container">
      <div class="mv-wrapper">
        <model-viewer id="ar-viewer" src="models/chair.glb" ios-src="models/chair.usdz" ar
          ar-modes="scene-viewer webxr quick-look" ar-placement="floor" camera-controls camera-target="auto" autoplay
          environment-image="neutral" shadow-intensity="1" ar-camera-controls scale="5 5 5" position="0 -2 0">
        </model-viewer>
      </div>
      <!-- QR Code Container (only shows on desktop) -->
      <div id="qrContainer" style="text-align:center; margin-top:15px; display:none;">
        <canvas id="qrCode" title="Scan the QR code on mobile to view the model"></canvas>
        <div style="font-size:12px; margin-top:4px;">Scan on mobile to view</div>
      </div>
    </div>

    <div class="furniture-meta">
      <div class="furniture-info">
        <h5 style="color: white; font-weight: bold;">Overview</h5>
        <p>Discover the perfect blend of comfort and style with our Modern Luxe Sofa. Crafted with premium materials and
          a timeless design, this sofa instantly elevates any living space. Its plush cushions, sturdy frame, and
          elegant silhouette make it the ideal centerpiece for cozy nights in or stylish entertaining. Upholstered in
          soft, durable fabric with a choice of colors to match your décor, the Modern Luxe Sofa offers generous seating
          without compromising on sleek design. Relax, unwind, and make a statement — all in one piece.</p>
        <div class="ar-fav-icon">
          <span style="gap: 1rem;" class="ar-favorite-icon">
            <p><i class="mini far fa-heart"></i><strong style="color: #fff; font-size: small;">114</strong></p>
            <i class="mini fas fa-share-alt"></i>
          </span>
        </div>
      </div>

      <div class="furniture-info">
        <h5 style="color: white; font-weight: bold;">Details</h5>
        <p>Name: <strong>Modern Sofa</strong></p>
        <p>Size: <strong>210cm x 100cm x 80cm</strong></p>
        <p>Material: <strong>Leather</strong></p>
        <p>Seater: <strong>3</strong></p>
        <p>Units: <strong>1</strong></p>
        <p>Store: <strong>House Of Leather</strong></p>
        <div class="piece-price">
          <p>Price: <strong>KSH 299000</strong></p>
          <button class="btn btn-primary px-4 py-2">Buy Now</button>
        </div>
      </div>
    </div>
    <div style="padding: 0.5rem;">
      <div class="filters">
        <button class="category-btn active" data-category="sofas">Sofas</button>
        <button class="category-btn" data-category="beds">Beds</button>
        <button class="category-btn" data-category="tables">Tables</button>
        <button class="category-btn" data-category="carpets">Carpets</button>
        <button>Lighting</button>
        <button>Cushions</button>
        <button>Flooring</button>
        <button>Dining Sets</button>
        <button>Chairs</button>
        <button>Decor</button>
      </div>
      <!-- Furniture Grid -->
      <div class="furniture-container">
        <i class="fa fa-angle-left furn-scroll-btn-reco left" id="furniture-scroll-left"></i>
        <div class="furniture-grid" id="furniture-list"></div>
        <i class="fa fa-angle-right furn-scroll-btn-reco right" id="furniture-scroll-right"></i>
      </div>
    </div>
  </section>

  <?php include 'footer.php'; ?>

  <script src="js/bootstrap.bundle.min.js"></script>
  <script src="js/tiny-slider.js"></script>
  <script src="js/glightbox.min.js"></script>
  <script src="js/aos.js"></script>
  <script src="js/google-map.js"></script>
  <script src="js/main.js"></script>
  <script src="js/login-register.js"></script>
  <script src="js/index.js"></script>
  <script src="js/showroom.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>

  <script src="js/toast.js"></script>
</body>

</html>