<?php ?>

<!DOCTYPE html>
<html lang="en">

<head>
	<title>Hauzisha - Home</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<link rel="icon" type="image/svg+xml" href="images/logo.png">
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
	<link rel="preconnect" href="https://fonts.gstatic.com/">
	<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap"
		rel="stylesheet">
	<link rel="stylesheet" href="assets/css/font-awesome.min.css">
	<link rel="stylesheet" href="assets/css/ionicons.min.css">
	<link rel="stylesheet" href="css/animate.css">
	<link rel="stylesheet" href="css/flaticon.css">
	<link rel="stylesheet" href="css/tiny-slider.css">
	<link rel="stylesheet" href="css/glightbox.min.css">
	<link rel="stylesheet" href="css/aos.css">
	<link rel="stylesheet" href="css/style.css">

	<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
	<link rel="stylesheet" href="css/modal-backdrop.css">
</head>

<body data-logged-in="<?php echo isset($_SESSION['user_id']) ? 'true' : 'false'; ?>">

	<?php include 'navbar.php'; ?>

	<section class="slider-hero">
		<div class="overlay"></div>
		<div class="hero-slider">
			<div class="item">
				<div class="work">
					<div class="img d-flex align-items-center js-fullheight" style="background-image: url(images/bg_3.jpg);">
						<div class="container-xl">
							<div class="row justify-content-center">
								<div class="col-md-10 col-xl-6">
									<div class="text text-center" data-aos="fade-up" data-aos-duration="1000">
										<h2>Make Life Better</h2>
										<p class="mb-5">Bring any space to life with stunning virtual staging, immersive 3D walk-throughs,
											and interactive AR showrooms — all designed to captivate buyers and help them visualize their
											future home with ease.</p>
										<p><a href="about.php" class="btn btn-primary px-5 py-3">Learn More <span
													class="ion ion-ios-arrow-round-forward"></span></a></p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="item">
				<div class="work">
					<div class="img d-flex align-items-center justify-content-center js-fullheight"
						style="background-image: url(images/bg_1.jpg);">
						<div class="container-xl">
							<div class="row justify-content-center">
								<div class="col-md-10 col-xl-6">
									<div class="text text-center" data-aos="fade-up" data-aos-duration="1000">
										<h2>Find Your Perfect Home</h2>
										<p class="mb-5">We revolutionize how properties are showcased and sold by helping real estate
											agents, property owners, and developers present empty spaces in the most compelling, modern way
											possible.</p>
										<p><a href="about.php" class="btn btn-primary px-5 py-3">Learn More <span
													class="ion ion-ios-arrow-round-forward"></span></a></p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="item">
				<div class="work">
					<div class="img d-flex align-items-center justify-content-center js-fullheight"
						style="background-image: url(images/bg_4.jpg);">
						<div class="container-xl">
							<div class="row justify-content-center">
								<div class="col-md-10 col-xl-6">
									<div class="text text-center" data-aos="fade-up" data-aos-duration="1000">
										<h2>Secure Property Here</h2>
										<p class="mb-5">Stand out in a crowded market, sell properties faster, and give your clients the
											power to explore every detail from the comfort of their couch — turning empty rooms into
											unforgettable experiences that close deals.</p>
										<p><a href="about.php" class="btn btn-primary px-5 py-3">Learn More <span
													class="ion ion-ios-arrow-round-forward"></span></a></p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="ftco-section ftco-about-section" id='about-section'>
		<div class="container-xl">
			<div class="row g-xl-5">
				<div class="col-md-4 d-flex align-items-stretch" data-aos="fade-up" data-aos-delay="100"
					data-aos-duration="1000">
					<div class="" style="width:100%;">
						<model-viewer src="assets/meta_quest_pro_headset_on_head.glb" alt="3D Model" auto-rotate camera-controls
							camera-orbit="-120deg auto auto" min-camera-orbit="auto 60deg auto" max-camera-orbit="auto 100deg auto"
							style="width: 100%; height: 400px; margin-right: 10px; ">
						</model-viewer>
					</div>
				</div>
				<div class="col-md-8 heading-section" data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
					<span class="subheading">About Us</span>
					<h2 class="mb-0">HAUZISHA</h2>
					<p>Welcome to <strong>HAUZISHA</strong> — your immersive real estate playground.</p>

					<span class="subheading">Our Story</span>
					<p>Born out of a passion for connection and a deep appreciation for the places that shape our lives, Loft
						Studio was created to redefine the real estate experience. Our journey started with the belief that everyone
						deserves a space where they can feel at home, no matter where they are in the world. From the cozy corners
						of city apartments to the open fields of country estates, we believe that the right home is not just a
						place, but an extension of the heart.</p>

					<span class="subheading">Our Vision</span>
					<p>We envision a future where finding your dream home is as effortless as browsing your favorite app. Our goal
						is to offer more than listings — we offer possibilities. By blending technology with a deep understanding of
						the human connection to space, Hauzisha ensures that every property isn’t just a transaction but an
						experience. Every home has a story, and we’re here to help you find yours.</p>
				</div>
	</section>

	<section class="mb-5" id="services"
		style="padding: 5.5rem 0rem; background: linear-gradient(to bottom, #000, #121212);">
		<div class="text-center mb-4">
			<span class="bold" style="color: #ffd700; font-size: 1rem; font-weight: 900;">OUR SERVICES</span>
			<p>We provide the perfect service for</p>
		</div>
		<div class="d-flex justify-content-center gap-3 flex-wrap">
			<div class="service-card text-light p-5 d-flex flex-column" style="background-color: #121212; border: none;">
				<h4 style="color: #fff;">Virtual Tours & Staging</h4>
				<p style="color: grey;">Immersive Matterport 3D property scans, stunning virtual staging for both static photos
					and empty Matterport Tours, to help buyers see the full potential — all listed for free on Loft</p>
				<a href="about.php#property-service" class="mt-auto"
					style="color: #ffd700; font-size: 1rem; text-decoration: underline;">Tell Me More...</a>
			</div>
			<div class="service-card p-5 d-flex flex-column" style="background-color: #282828; border: none;">
				<h4 style="color: #fff;">Complimentary Listing</h4>
				<p>Sell or rent faster with complimentary free exposure on our website for all tours done by Loft, on-demand
					agent support for physical showings, and easy AR tools for buyers to style their future home instantly.</p>
				<a href="about.php#ar-service" class="mt-auto"
					style="color: #ffd700; font-size: 1rem; text-decoration: underline;">Tell Me More...</a>
			</div>
			<div class="service-card text-light p-5 d-flex flex-column" style="background-color: #121212; border: none;">
				<h4 style="color: #fff;">AR Furniture Showroom</h4>
				<p style="color: grey;">Browse real furniture & appliances from trusted stores, then place them live in your own
					space through your phone — no downloads, no hassle, just tap and style.</p>
				<a href="about.php#property-service" class="mt-auto"
					style="color: #ffd700; font-size: 1rem; text-decoration: underline;">Tell Me More...</a>
			</div>
		</div>
	</section>

	<!-- <section class="ftco-section bg-light">
		<div class="container-xl">
			<div class="row justify-content-center">
				<div class="col-md-8 heading-section text-center mb-5" data-aos="fade-up" data-aos-duration="1000">
					<span class="subheading">Our Properties</span>
					<h2 class="mb-4">Featured Properties</h2>
				</div>
			</div>
			<div class="row">
				<div class="col-md-4" data-aos="fade-up" data-aos-delay="100" data-aos-duration="1000">
					<div class="property-wrap">
						<a href="property-details-1.php" class="img img-property" style="background-image: url(images/work-1.jpg);">
							<p class="price"><span class="orig-price">$300,000</span></p>
						</a>
						<div class="text">
							<div class="list-team d-flex align-items-center mb-4">
								<div class="d-flex align-items-center">
									<div class="img" style="background-image: url(images/person_1.jpg);"></div>
									<h3 class="ml-2">John Dorf</h3>
								</div>
								<span class="text-right">2 weeks ago</span>
							</div>
							<h3><a href="property-details-1">Sunny Loft Property</a></h3>
							<span class="location"><i class="ion-ios-pin"></i> New York <span class="sale">Sale</span></span>
							<ul class="property_list mt-3 mb-0">
								<li><span class="flaticon-bed"></span>3</li>
								<li><span class="flaticon-bathtub"></span>2</li>
								<li><span class="flaticon-blueprint"></span>1,878 sqft</li>
							</ul>
						</div>
					</div>
				</div>
				<div class="col-md-4" data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
					<div class="property-wrap">
						<a href="property-details-2.php" class="img img-property" style="background-image: url(images/work-2.jpg);">
							<p class="price"><span class="old-price">800,000</span><span class="orig-price">$3,050<small> / mo</small></span></p>
						</a>
						<div class="text">
							<div class="list-team d-flex align-items-center mb-4">
								<div class="d-flex align-items-center">
									<div class="img" style="background-image: url(images/person_1.jpg);"></div>
									<h3 class="ml-2">John Dorf</h3>
								</div>
								<span class="text-right">2 weeks ago</span>
							</div>
							<h3><a href="property-details-2">Sunny Loft Property</a></h3>
							<span class="location"><i class="ion-ios-pin"></i> New York <span class="rent">Rent</span></span>
							<ul class="property_list mt-3 mb-0">
								<li><span class="flaticon-bed"></span>3</li>
								<li><span class="flaticon-bathtub"></span>2</li>
								<li><span class="flaticon-blueprint"></span>1,878 sqft</li>
							</ul>
						</div>
					</div>
				</div>
				<div class="col-md-4" data-aos="fade-up" data-aos-delay="300" data-aos-duration="1000">
					<div class="property-wrap">
						<a href="property-details-3.php" class="img img-property" style="background-image: url(images/work-3.jpg);">
							<p class="price"><span class="orig-price">$300</span></p>
						</a>
						<div class="text">
							<div class="list-team d-flex align-items-center mb-4">
								<div class="d-flex align-items-center">
									<div class="img" style="background-image: url(images/person_1.jpg);"></div>
									<h3 class="ml-2">John Dorf</h3>
								</div>
								<span class="text-right">2 weeks ago</span>
							</div>
							<h3><a href="property-details-3">Sunny Loft Property</a></h3>
							<span class="location"><i class="ion-ios-pin"></i> New York <span class="sale">Sale</span></span>
							<ul class="property_list mt-3 mb-0">
								<li><span class="flaticon-bed"></span>3</li>
								<li><span class="flaticon-bathtub"></span>2</li>
								<li><span class="flaticon-blueprint"></span>1,878 sqft</li>
							</ul>
						</div>
					</div>
				</div>
				<div id="loginPrompt" style="color: grey; margin-bottom: 15px; font-size: 0.9em; font-style: italic; text-align: center;">
						*** Log in to view a full list of our properties ***
				</div>
			</div>
		</div>
	</section> -->

	<!-- <section class="ftco-intro ftco-no-pt ftco-no-pb img" style="background-image: url(images/bg_4.jpg);">
		<div class="overlay"></div>
		<div class="container-xl py-5">
			<div class="row justify-content-center">
				<div class="col-lg-10 col-xl-8">
					<div class="row">
						<div class="col-md-8 d-flex align-items-center">
							<div>
								<h1 class="mb-0">Find Best Place For Living</h1>
								<p>Find Best Place For Living</p>
							</div>
						</div>
						<div class="col-md-4 d-flex text-white align-items-center" style="color: #fff;">
							<p class="mb-0 text-white"><a href="contact.php" class="btn btn-black text-white py-3 px-4" style="color: #fff;">Get in touch</a></p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section> -->

	<section class="ftco-section testimony-section bg-light">
		<div class="container-xl">
			<div class="row justify-content-center pb-4">
				<div class="col-md-7 text-center heading-section" data-aos="fade-up" data-aos-duration="1000">
					<span class="subheading">Testimonials</span>
					<h2 class="">Clients We Help</h2>
				</div>
			</div>
			<div class="row">
				<div class="col-md-12" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
					<div class="carousel-testimony">
						<div class="item">
							<div class="testimony-wrap">
								<div class="icon d-flex align-items-center justify-content-center"><span class="fa fa-quote-left"></div>
								<div class="text">
									<p class="mb-4 msg">"Moving into our new home felt like stepping into a new chapter of our lives.
										Thanks to this platform, we found the one meant for us."</p>
									<div class="d-flex align-items-center">
										<div class="user-img" style="background-image: url(images/person_1.jpg)"></div>
										<div class="pl-3 tx">
											<p class="name">Alice Monroe</p>
											<span class="position">Interior Designer</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="item">
							<div class="testimony-wrap">
								<div class="icon d-flex align-items-center justify-content-center"><span class="fa fa-quote-left"></div>
								<div class="text">
									<p class="mb-4 msg">"Professional, trustworthy, and dedicated. I never imagined finding a property
										that truly felt like home until now."</p>
									<div class="d-flex align-items-center">
										<div class="user-img" style="background-image: url(images/person_2.jpg)"></div>
										<div class="pl-3 tx">
											<p class="name">George Williams</p>
											<span class="position">Architect</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="item">
							<div class="testimony-wrap">
								<div class="icon d-flex align-items-center justify-content-center"><span class="fa fa-quote-left"></div>
								<div class="text">
									<p class="mb-4 msg">"The perfect home, with a seamless experience from start to finish – couldn’t ask
										for more. Incredibly happy with the property we found."</p>
									<div class="d-flex align-items-center">
										<div class="user-img" style="background-image: url(images/person_3.jpg)"></div>
										<div class="pl-3 tx">
											<p class="name">Sarah Green</p>
											<span class="position">Real Estate Investor</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="item">
							<div class="testimony-wrap">
								<div class="icon d-flex align-items-center justify-content-center"><span class="fa fa-quote-left"></div>
								<div class="text">
									<p class="mb-4 msg">"Incredibly happy with the property we found. The place we bought felt like it was
										made for us from the very first visit."</p>
									<div class="d-flex align-items-center">
										<div class="user-img" style="background-image: url(images/person_1.jpg)"></div>
										<div class="pl-3 tx">
											<p class="name">Mark Thompson</p>
											<span class="position">Business Owner</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="item">
							<div class="testimony-wrap">
								<div class="icon d-flex align-items-center justify-content-center"><span class="fa fa-quote-left"></div>
								<div class="text">
									<p class="mb-4 msg">"I couldn’t have asked for a better experience when finding my dream home. I never
										knew buying a property could be this easy."</p>
									<div class="d-flex align-items-center">
										<div class="user-img" style="background-image: url(images/person_2.jpg)"></div>
										<div class="pl-3 tx">
											<p class="name">Emma Brooks</p>
											<span class="position">Creative Director</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Toast container -->
	<div id="toastContainer" style="position: fixed; top: 20px; right: 20px; z-index: 9999;"></div>

	<?php include 'footer.php'; ?>

	<script src="js/bootstrap.bundle.min.js"></script>
	<script src="js/tiny-slider.js"></script>
	<script src="js/glightbox.min.js"></script>
	<script src="js/aos.js"></script>
	<script src="js/google-map.js"></script>
	<script src="js/main.js"></script>
	<script src="js/login-register.js"></script>
	<script src="js/toast.js"></script>
	<script src="js/logout-handler.js" defer></script>
	<script src="js/favorites-handler.js" defer></script>
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
	<script src="js/index.js"></script>
</body>
</html>