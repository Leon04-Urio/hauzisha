<?php
$current_page = basename($_SERVER['REQUEST_URI'], ".php");
?>

<div class="py-3 top-wrap">
    <div class="container-xl ">
        <div class="row d-flex align-items-start">
            <div class="col-md topper d-flex mb-md-0 align-items-xl-center">
                <div class="icon d-flex justify-content-center align-items-center"><span class="fa fa-map"></span></div>
                <div class="text pl-3 pl-md-3">
                    <p class="con"><span>Free Call</span> <span>+1 234 456 78910</span></p>
                    <p class="con">Call Us Now 24/7 Customer Support</p>
                </div>
            </div>

            <div class="col-md topper d-flex mb-md-0 align-items-xl-center">
                <div class="icon d-flex justify-content-center align-items-center"><span
                        class="fa fa-paper-plane"></span></div>
                <div class="text pl-3 pl-md-3">
                    <p class="hr"><span>Our Location</span></p>
                    <p class="con">Suite 721 Kilimani Nairobi KE</p>
                </div>
            </div>

            <div class="col-md topper d-flex mb-md-0 align-items-xl-center">
                <div class="icon d-flex justify-content-center align-items-center"><span
                        class="fa fa-connectdevelop"></span></div>
                <div class="text pl-3 pl-md-3">
                    <p class="con"><span>Connect </span> <span>with us</span></p>
                    <p class="con">hellohauzisha@gmail.com</p>
                </div>
            </div>
        </div>
    </div>
</div>

<nav class="navbar navbar-expand-lg ftco-navbar-light w-100 px-4">
    <!-- <div class="d-flex justify-content-between align-items-center w-100 px-4"> -->
    <!-- Left: Logo -->
    <a class="navbar-brand align-items-center" href="index.php">
        <h5 style="color: white; font-size: 1.5rem;">
            <img src="images/bidbrick-logo.png" style="height: 50px; width: 50px; filter: invert(1) brightness(2);" />
            H A U Z I S H A
        </h5>
    </a>

    <!-- Right: Menu -->
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="fa fa-bars"></span> Menu
    </button>

    <div class="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
        <ul class="navbar-nav mb-0 mb-lg-0 text-center text-md-start">

            <li class="nav-item mr-0">
                <a class="nav-link <?php echo $current_page == 'index' ? 'active' : ''; ?> mr-0"
                    href="contact.php?subject=Subject:+Looking+to+list+my+property&message=Hello%2C+I+am+interested+in+listing+my+property+on+Loft#contact-container"
                    style="color: white;">
                    <!-- Become a Lister -->
                    List With Us
                </a>
            </li>

            <div class="menu-divider mt-3 ml-0 d-none d-lg-block"></div>

        </ul>

        <div class="menu-divider mr-4 ml-0 d-none d-lg-block"></div>

        <p class="mb-0 ms-lg-0 text-center text-md-start mt-lg-0">
            <a href="#" class="btn btn-primary rounded" data-bs-toggle="modal" data-bs-target="#authModal">SIGN IN /
                UP</a>
        </p>
    </div>
    <!-- </div> -->
</nav>

<!-- Mobile Bottom Nav -->
<nav class="mobile-bottom-nav d-lg-none">
    <a href="index.php" class="nav-item <?php echo $current_page == 'index' ? 'active' : ''; ?>">
        <i class="fa-solid fa-magnifying-glass mb-1"></i>
        <span>Explore</span>
    </a>
    <a href="favorites.php" data-bs-toggle="modal" data-bs-target="#authModal"
        class="nav-item <?php echo $current_page == 'favorites' ? 'active' : ''; ?>">
        <i class="fa-regular fa-heart"></i>
        <span>Favorites</span>
    </a>
    <a href="profile.php" data-bs-toggle="modal" data-bs-target="#authModal"
        class="nav-item <?php echo $current_page == 'profile' ? 'active' : ''; ?>">
        <i class="fa-regular fa-user mb-1"></i>
        <span>Profile</span>
    </a>
</nav>

<style>
    /* OTP Input Circles */
    .otp-input {
        width: 45px;
        height: 45px;
        border: 2px solid #ddd;
        border-radius: 50%;
        text-align: center;
        font-size: 1.5rem;
        font-weight: 600;
        transition: all 0.3s ease;
        outline: none;
    }

    .otp-input:focus {
        border-color: #ffd700;
        box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
        transform: scale(1.05);
    }

    .otp-input.filled {
        border-color: #ffd700;
        background: rgba(255, 215, 0, 0.05);
    }

    /* Smart input with country code */
    .phone-email-input.phone-mode {
        padding-left: 45px !important;
    }

    @media (max-width: 480px) {
        .otp-input {
            width: 40px;
            height: 40px;
            font-size: 1.3rem;
        }
    }
</style>

<div class="modal fade" id="authModal" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content py-2 px-1">
            <div class="modal-header">
                <h5 class="modal-title font-weight-bold" id="authModalLabel"><img src="images/logo.png"
                        style="height: 40px; width: 40px; " /> <strong style="color: #000; ">HAUZISHA</strong></h5>

                <button type="button" class="btn-close" style="font-size: 0.7rem;" data-bs-dismiss="modal"
                    aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <!-- Nav Tabs -->
                <ul class="nav nav-tabs" id="authTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="login-tab" data-bs-toggle="tab" data-bs-target="#login"
                            type="button" role="tab" aria-controls="login" aria-selected="true">Login</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="register-tab" data-bs-toggle="tab" data-bs-target="#register"
                            type="button" role="tab" aria-controls="register" aria-selected="false">Register</button>
                    </li>
                </ul>
                <!-- Tab Content -->
                <div class="tab-content" id="authTabsContent">

                    <!-- Login Tab -->
                    <div class="tab-pane fade show active" id="login" role="tabpanel" aria-labelledby="login-tab">

                        <!-- Step 1: Contact Input -->
                        <form class="mt-4" id="login-form" style="display: block;">
                            <!-- Email or Phone -->
                            <div class="mb-4">
                                <label for="loginEmail" class="form-label">Email or Phone number</label>
                                <div style="position: relative;">
                                    <div id="loginCountryCode"
                                        style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); display: none; align-items: center; gap: 6px; pointer-events: none; z-index: 2;">
                                        <span style="font-size: 1.2rem;">????</span>
                                    </div>
                                    <input type="text" class="form-control phone-email-input" id="loginEmail"
                                        placeholder="Enter your phone number or email" autocomplete="tel email"
                                        style="padding-left: 12px;">
                                </div>
                                <small id="loginEmailError" class="text-danger"></small>
                                <small id="loginInputType" class="text-muted" style="font-size: 0.75rem;"></small>
                            </div>

                            <!-- Remember Me & Forgot Password -->
                            <div class="d-flex justify-content-between align-items-center mt-1"
                                style="font-size: 0.9rem;">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="rememberMe">
                                    <label class="form-check-label" for="rememberMe">Remember Me</label>
                                </div>
                                <!-- <a href="forgot-password.php" class="tc-mail">Forgot Password?</a> -->
                            </div>

                            <!-- Login Button -->
                            <button type="submit" class="btn btn-primary w-100 mt-3" id="loginSubmit">Continue</button>
                        </form>

                        <!-- Step 2: OTP Verification -->
                        <div id="login-otp-step" style="display: none;">
                            <div class="mb-4">
                                <label for="loginOTP" class="form-label text-center d-block">Enter OTP</label>
                                <div class="otp-input-container"
                                    style="display: flex; gap: 8px; justify-content: center; margin: 1.5rem 0;">
                                    <input type="text" class="otp-input" maxlength="1" data-index="0"
                                        autocomplete="off">
                                    <input type="text" class="otp-input" maxlength="1" data-index="1"
                                        autocomplete="off">
                                    <input type="text" class="otp-input" maxlength="1" data-index="2"
                                        autocomplete="off">
                                    <input type="text" class="otp-input" maxlength="1" data-index="3"
                                        autocomplete="off">
                                    <input type="text" class="otp-input" maxlength="1" data-index="4"
                                        autocomplete="off">
                                    <input type="text" class="otp-input" maxlength="1" data-index="5"
                                        autocomplete="off">
                                </div>
                                <!-- Hidden input for compatibility -->
                                <input type="hidden" id="loginOTP">
                                <small class="form-text text-muted text-center d-block">Enter the 6-digit code sent to
                                    <span id="loginSentToContact"></span></small>
                                <small id="loginOTPError" class="text-danger text-center d-block"></small>
                            </div>

                            <!-- Timer and Resend -->
                            <div class="text-center mb-3">
                                <small class="text-muted">
                                    <span id="loginOtpTimer">Resend OTP in <span id="loginCountdown">60</span>s</span>
                                    <button type="button" class="btn btn-link btn-sm p-0" id="resendLoginOTPBtn"
                                        style="display: none;">Resend OTP</button>
                                </small>
                            </div>

                            <!-- Verify OTP Button (Hidden - auto-submits) -->
                            <button type="button" class="btn btn-primary w-100" id="verifyLoginOTPBtn"
                                style="display: none;">Verify OTP</button>

                            <!-- Back Button -->
                            <button type="button" class="btn btn-outline-secondary w-100 mt-2"
                                id="backToLoginContactBtn">Back</button>
                        </div>

                        <!-- Social Login Buttons -->
                        <div class="text-center mt-4" id="social-login-section">
                            <div class="d-flex align-items-center my-3">
                                <hr style="flex:1; border-top:1px solid #000; margin-right:10px;">
                                <p class="mb-0" style="font-size:0.9rem; white-space: nowrap;">Or login with</p>
                                <hr style="flex:1; border-top:1px solid #000; margin-left:10px;">
                            </div>

                            <div class="d-flex justify-content-center gap-2">
                                <button id="googleLogin" class="btn w-100 h-14" style="background: #000; color: #fff;">
                                    <i class="fa fa-google me-2" aria-hidden="true"></i> Google
                                </button>
                            </div>
                        </div>

                        <!-- Signup Link -->
                        <div class="mt-3 text-center" id="signup-link-section">
                            <p style="font-size: 0.9rem;">Don't have an account? <span class="tc-mail signup-link"
                                    style="color: #ffd700; cursor: pointer;">Signup</span></p>
                        </div>
                    </div>


                    <!-- Register Tab -->
                    <div class="tab-pane fade" id="register" role="tabpanel" aria-labelledby="register-tab">

                        <!-- Step 1: Contact Input -->
                        <form class="mt-3" id="register-form" style="display: block;">
                            <div class="mb-3">
                                <label for="registerEmail" class="form-label">Email or Phone number</label>
                                <div style="position: relative;">
                                    <div id="registerCountryCode"
                                        style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); display: none; align-items: center; gap: 6px; pointer-events: none; z-index: 2;">
                                        <span style="font-size: 1.2rem;">????</span>
                                    </div>
                                    <input type="text" class="form-control phone-email-input" id="registerEmail"
                                        name="email" placeholder="Enter email or phone number"
                                        aria-describedby="registerEmailError" autocomplete="tel email"
                                        style="padding-left: 12px;">
                                </div>
                                <small id="registerEmailError" class="text-danger"></small>
                                <small id="registerInputType" class="text-muted" style="font-size: 0.75rem;"></small>
                            </div>

                            <!-- Terms & Conditions -->
                            <div class="form-check mb-3" style="font-size: 0.9rem;">
                                <input class="form-check-input" type="checkbox" id="termsCheck">
                                <label class="form-check-label" for="termsCheck">
                                    I agree to the <a href="t&c.php" class="tc-mail">Terms & Conditions</a>
                                </label>
                            </div>

                            <button type="submit" class="btn btn-primary w-100 mb-3" id="registerSubmit" disabled>Send
                                OTP</button>
                        </form>

                        <!-- Step 2: OTP Verification -->
                        <div id="register-otp-step" style="display: none;">
                            <div class="mb-4">
                                <label for="registerOTP" class="form-label text-center d-block">Enter OTP</label>
                                <div class="otp-input-container"
                                    style="display: flex; gap: 8px; justify-content: center; margin: 1.5rem 0;">
                                    <input type="text" class="otp-input" maxlength="1" data-index="0"
                                        autocomplete="off">
                                    <input type="text" class="otp-input" maxlength="1" data-index="1"
                                        autocomplete="off">
                                    <input type="text" class="otp-input" maxlength="1" data-index="2"
                                        autocomplete="off">
                                    <input type="text" class="otp-input" maxlength="1" data-index="3"
                                        autocomplete="off">
                                    <input type="text" class="otp-input" maxlength="1" data-index="4"
                                        autocomplete="off">
                                    <input type="text" class="otp-input" maxlength="1" data-index="5"
                                        autocomplete="off">
                                </div>
                                <!-- Hidden input for compatibility -->
                                <input type="hidden" id="registerOTP">
                                <small class="form-text text-muted text-center d-block">Enter the 6-digit code sent to
                                    <span id="regSentToContact"></span></small>
                                <small id="registerOTPError" class="text-danger text-center d-block"></small>
                            </div>

                            <!-- Timer and Resend -->
                            <div class="text-center mb-3">
                                <small class="text-muted">
                                    <span id="regOtpTimer">Resend OTP in <span id="regCountdown">60</span>s</span>
                                    <button type="button" class="btn btn-link btn-sm p-0" id="resendRegOTPBtn"
                                        style="display: none;">Resend OTP</button>
                                </small>
                            </div>

                            <!-- Verify OTP Button (Hidden - auto-submits) -->
                            <button type="button" class="btn btn-primary w-100" id="verifyRegOTPBtn"
                                style="display: none;">Verify OTP</button>

                            <!-- Back Button -->
                            <button type="button" class="btn btn-outline-secondary w-100 mt-2"
                                id="backToRegContactBtn">Back</button>
                        </div>

                        <!-- Step 3: Complete Registration -->
                        <div id="register-complete-step" style="display: none;">
                            <div class="alert alert-success">
                                <strong>Verification Successful!</strong><br>
                                Please provide additional details to complete your registration.
                            </div>

                            <div class="mb-3">
                                <label for="phoneRegFn" class="form-label">First Name</label>
                                <input type="text" class="form-control" id="phoneRegFn"
                                    placeholder="Enter your first name">
                            </div>

                            <div class="mb-3">
                                <label for="phoneRegLn" class="form-label">Last Name</label>
                                <input type="text" class="form-control" id="phoneRegLn"
                                    placeholder="Enter your last name">
                            </div>

                            <div class="mb-3">
                                <label for="phoneRegEmailOpt" class="form-label">Email (Optional)</label>
                                <input type="email" class="form-control" id="phoneRegEmailOpt"
                                    placeholder="Enter your email (optional)">
                            </div>

                            <!-- Terms & Conditions -->
                            <div class="form-check mb-3" style="font-size: 0.9rem;">
                                <input class="form-check-input" type="checkbox" id="phoneRegTermsCheck">
                                <label class="form-check-label" for="phoneRegTermsCheck">
                                    I agree to the <a href="t&c.php" class="tc-mail">Terms & Conditions</a>
                                </label>
                            </div>

                            <button type="button" class="btn btn-primary w-100" id="completePhoneRegistrationBtn"
                                disabled>Complete Registration</button>
                        </div>

                        <!-- OR Separator -->
                        <div class="d-flex align-items-center my-3" id="social-register-separator">
                            <hr style="flex:1; border-top:1px solid #000; margin-right:10px;">
                            <p class="mb-0" style="font-size:0.9rem; white-space: nowrap;">Or register with</p>
                            <hr style="flex:1; border-top:1px solid #000; margin-left:10px;">
                        </div>

                        <!-- Social Login Buttons -->
                        <div class="d-flex justify-content-center gap-2 m-0 p-0" id="social-register-buttons">
                            <button class="btn w-100 h-14" id="googleRegister"><i class="fa fa-google me-2"
                                    style="background: #000; color: #fff;" aria-hidden="true"></i> Google</button>
                        </div>

                        <div class="mt-3 text-center" id="login-link-section">
                            <p style="font-size: 0.9rem;">Already have an account? <span class="tc-mail login-link"
                                    style="color: #ffd700; cursor:pointer;" data-bs-toggle="tab"
                                    data-bs-target="#login">Login</span></p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>