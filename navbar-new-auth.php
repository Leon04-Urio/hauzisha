<?php
$current_page = basename($_SERVER['PHP_SELF'], '.php');
?>

<nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <div class="container">
        <a class="navbar-brand" href="index.php">
            <img src="images/logo.png" alt="Loft Studio" style="height: 40px;">
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
                <li class="nav-item">
                    <a class="nav-link <?php echo $current_page == 'index' ? 'active' : ''; ?>"
                        href="index.php">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?php echo $current_page == 'about' ? 'active' : ''; ?>"
                        href="about.php">About</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?php echo $current_page == 'contact' ? 'active' : ''; ?>"
                        href="contact.php">Contact</a>
                </li>
            </ul>

            <div class="d-flex">
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#authModal">
                    Sign In / Up
                </button>
            </div>
        </div>
    </div>
</nav>

<!-- Modern Authentication Modal (Uber-style) -->
<div class="modal fade" id="authModal" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content py-3 px-2">
            <div class="modal-header border-0">
                <h5 class="modal-title font-weight-bold" id="authModalLabel">
                    <img src="images/logo.png" style="height: 40px; width: 40px;" />
                    <strong style="color: #000;">LOFT STUDIO</strong>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
                <!-- Step 1: Contact Input -->
                <div id="contact-input-step">
                    <h6 class="mb-3">What's your phone number or email?</h6>

                    <div class="mb-4">
                        <input type="text" class="form-control form-control-lg" id="contactInput"
                            placeholder="Enter phone number or email" autocomplete="username">
                        <small class="form-text text-muted mt-2">We'll send you a verification code</small>
                        <small id="contactInputError" class="text-danger d-block"></small>
                    </div>

                    <button type="button" class="btn btn-dark btn-lg w-100 mb-4" id="continueBtn">
                        Continue
                    </button>

                    <!-- Divider -->
                    <div class="d-flex align-items-center my-4">
                        <hr class="flex-grow-1">
                        <span class="px-3 text-muted small">or</span>
                        <hr class="flex-grow-1">
                    </div>

                    <!-- Google Sign In -->
                    <button type="button" class="btn btn-outline-dark btn-lg w-100" id="googleAuthBtn">
                        <i class="fab fa-google me-2"></i>
                        Continue with Google
                    </button>
                </div>

                <!-- Step 2: Verification Code -->
                <div id="verification-step" style="display: none;">
                    <div class="text-center mb-4">
                        <h6>Enter the code we sent you</h6>
                        <p class="text-muted small">We sent a verification code to <strong id="sentToContact"></strong>
                        </p>
                    </div>

                    <div class="mb-4">
                        <input type="text" class="form-control form-control-lg text-center" id="verificationCode"
                            placeholder="000000" maxlength="6"
                            style="font-size: 2rem; letter-spacing: 1rem; color: #222;">
                        <small id="verificationError" class="text-danger d-block mt-2"></small>
                    </div>

                    <!-- Resend Timer -->
                    <div class="text-center mb-4">
                        <small class="text-muted">
                            <span id="resendTimer">Resend code in <span id="countdown">60</span>s</span>
                            <button type="button" class="btn btn-link btn-sm p-0 text-decoration-underline"
                                id="resendCodeBtn" style="display: none;">
                                Resend code
                            </button>
                        </small>
                    </div>

                    <button type="button" class="btn btn-dark btn-lg w-100 mb-3" id="verifyCodeBtn">
                        Verify
                    </button>

                    <button type="button" class="btn btn-outline-secondary w-100" id="backToContactBtn">
                        Back
                    </button>
                </div>

                <!-- Step 3: Complete Profile (for new users) -->
                <div id="complete-profile-step" style="display: none;">
                    <div class="text-center mb-4">
                        <h6>Complete your profile</h6>
                        <p class="text-muted small">Just a few details to get you started</p>
                    </div>

                    <div class="mb-3">
                        <input type="text" class="form-control" id="profileFirstName" placeholder="First name"
                            autocomplete="given-name">
                    </div>

                    <div class="mb-3">
                        <input type="text" class="form-control" id="profileLastName" placeholder="Last name"
                            autocomplete="family-name">
                    </div>

                    <!-- Terms & Conditions -->
                    <div class="form-check mb-4">
                        <input class="form-check-input" type="checkbox" id="profileTermsCheck">
                        <label class="form-check-label small" for="profileTermsCheck">
                            I agree to the <a href="t&c.php" class="text-decoration-none">Terms & Conditions</a>
                            and <a href="privacy-policy.php" class="text-decoration-none">Privacy Policy</a>
                        </label>
                    </div>

                    <button type="button" class="btn btn-dark btn-lg w-100" id="completeProfileBtn" disabled>
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Mobile Bottom Navigation -->
<nav class="mobile-nav d-lg-none">
    <a href="index.php" class="nav-item <?php echo $current_page == 'index' ? 'active' : ''; ?>">
        <i class="fa-solid fa-house"></i>
        <span>Home</span>
    </a>
    <a href="#" class="nav-item <?php echo $current_page == 'explore' ? 'active' : ''; ?>">
        <i class="fa-solid fa-magnifying-glass"></i>
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

<script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
    import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

    document.addEventListener('DOMContentLoaded', function () {
        // Firebase Config
        const firebaseConfig = {
            apiKey: "AIzaSyCxX1f1igsz4ztHbUGy9l94kUTK4CfCQaM",
            authDomain: "loft-78ac3.firebaseapp.com",
            projectId: "loft-78ac3",
            storageBucket: "loft-78ac3.firebasestorage.app",
            messagingSenderId: "1084327481513",
            appId: "1:1084327481513:web:addb39cf8bf575c34219b8",
            measurementId: "G-41CFK08VNR"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const googleProvider = new GoogleAuthProvider();

        // Elements
        const contactInput = document.getElementById('contactInput');
        const continueBtn = document.getElementById('continueBtn');
        const verificationCode = document.getElementById('verificationCode');
        const verifyCodeBtn = document.getElementById('verifyCodeBtn');
        const resendCodeBtn = document.getElementById('resendCodeBtn');
        const backToContactBtn = document.getElementById('backToContactBtn');
        const googleAuthBtn = document.getElementById('googleAuthBtn');
        const completeProfileBtn = document.getElementById('completeProfileBtn');
        const profileFirstName = document.getElementById('profileFirstName');
        const profileLastName = document.getElementById('profileLastName');
        const profileTermsCheck = document.getElementById('profileTermsCheck');

        let currentContact = '';
        let contactType = ''; // 'phone' or 'email'
        let countdownInterval;

        // Utility Functions
        function isEmail(str) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
        }

        function isPhone(str) {
            const cleaned = str.replace(/\D/g, '');
            return cleaned.length >= 9 && cleaned.length <= 15;
        }

        function formatPhone(phone) {
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length === 9 && cleaned.startsWith('7')) {
                return '+254' + cleaned;
            } else if (cleaned.length === 10 && cleaned.startsWith('07')) {
                return '+254' + cleaned.substring(1);
            } else if (cleaned.length === 12 && cleaned.startsWith('254')) {
                return '+' + cleaned;
            } else if (cleaned.startsWith('+254')) {
                return cleaned;
            }
            return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
        }

        function showStep(stepId) {
            document.querySelectorAll('[id$="-step"]').forEach(step => {
                step.style.display = 'none';
            });
            document.getElementById(stepId).style.display = 'block';
        }

        function showError(elementId, message) {
            document.getElementById(elementId).textContent = message;
        }

        function clearError(elementId) {
            document.getElementById(elementId).textContent = '';
        }

        function startCountdown() {
            let timeLeft = 60;
            const countdownEl = document.getElementById('countdown');
            const timerEl = document.getElementById('resendTimer');
            const resendBtn = document.getElementById('resendCodeBtn');

            countdownInterval = setInterval(() => {
                timeLeft--;
                countdownEl.textContent = timeLeft;

                if (timeLeft <= 0) {
                    clearInterval(countdownInterval);
                    timerEl.style.display = 'none';
                    resendBtn.style.display = 'inline-block';
                }
            }, 1000);
        }

        async function sendToBackend(endpoint, data) {
            try {
                const response = await fetch(`/hauzisha/api/index.php/${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Backend error:', error);
                return { success: false, message: 'Connection error. Please try again.' };
            }
        }

        // Event Handlers
        continueBtn.addEventListener('click', async function () {
            const contact = contactInput.value.trim();
            clearError('contactInputError');

            if (!contact) {
                showError('contactInputError', 'Please enter your phone number or email');
                return;
            }

            if (isEmail(contact)) {
                contactType = 'email';
                currentContact = contact;

                // For email, we'll send a magic link or OTP
                continueBtn.disabled = true;
                continueBtn.textContent = 'Sending...';

                try {
                    const response = await sendToBackend('auth/request-email-otp', { email: contact });

                    if (response.success) {
                        document.getElementById('sentToContact').textContent = contact;
                        showStep('verification-step');
                        startCountdown();
                        verificationCode.focus();
                    } else {
                        showError('contactInputError', response.message || 'Failed to send verification code');
                    }
                } catch (error) {
                    showError('contactInputError', 'Failed to send verification code. Please try again.');
                } finally {
                    continueBtn.disabled = false;
                    continueBtn.textContent = 'Continue';
                }

            } else if (isPhone(contact)) {
                contactType = 'phone';
                currentContact = formatPhone(contact);

                continueBtn.disabled = true;
                continueBtn.textContent = 'Sending...';

                try {
                    const response = await sendToBackend('auth/request-otp', { phone: currentContact });

                    if (response.success) {
                        document.getElementById('sentToContact').textContent = currentContact;
                        showStep('verification-step');
                        startCountdown();
                        verificationCode.focus();
                    } else {
                        showError('contactInputError', response.message || 'Failed to send verification code');
                    }
                } catch (error) {
                    showError('contactInputError', 'Failed to send verification code. Please try again.');
                } finally {
                    continueBtn.disabled = false;
                    continueBtn.textContent = 'Continue';
                }

            } else {
                showError('contactInputError', 'Please enter a valid phone number or email address');
            }
        });

        verifyCodeBtn.addEventListener('click', async function () {
            const code = verificationCode.value.trim();
            clearError('verificationError');

            if (!code || code.length !== 6) {
                showError('verificationError', 'Please enter the 6-digit verification code');
                return;
            }

            verifyCodeBtn.disabled = true;
            verifyCodeBtn.textContent = 'Verifying...';

            try {
                const endpoint = contactType === 'email' ? 'auth/verify-email-otp' : 'auth/verify-otp';
                const data = contactType === 'email'
                    ? { email: currentContact, otp: code }
                    : { phone: currentContact, otp: code };

                const response = await sendToBackend(endpoint, data);

                if (response.success) {
                    if (response.action === 'login') {
                        // Existing user - redirect
                        window.location.href = response.role === 'admin'
                            ? '/hauzisha/control-room/dashboard.php'
                            : '/hauzisha/index.php';
                    } else if (response.action === 'register') {
                        // New user - complete profile
                        showStep('complete-profile-step');
                        profileFirstName.focus();
                    }
                } else {
                    showError('verificationError', response.message || 'Invalid verification code');
                }
            } catch (error) {
                showError('verificationError', 'Verification failed. Please try again.');
            } finally {
                verifyCodeBtn.disabled = false;
                verifyCodeBtn.textContent = 'Verify';
            }
        });

        completeProfileBtn.addEventListener('click', async function () {
            const firstName = profileFirstName.value.trim();
            const lastName = profileLastName.value.trim();

            if (!firstName || !lastName) {
                showToast('Please enter your first and last name', 'error');
                return;
            }

            if (!profileTermsCheck.checked) {
                showToast('Please accept the terms and conditions', 'error');
                return;
            }

            completeProfileBtn.disabled = true;
            completeProfileBtn.textContent = 'Creating Account...';

            try {
                const data = {
                    firstname: firstName,
                    lastname: lastName
                };

                if (contactType === 'email') {
                    data.email = currentContact;
                }

                const response = await sendToBackend('auth/complete-phone-registration', data);

                if (response.success) {
                    window.location.href = '/hauzisha/user-profile/dashboard.php';
                } else {
                    showToast('Registration failed: ' + response.message, 'error');
                }
            } catch (error) {
                showToast('Registration failed. Please try again.', 'error');
            } finally {
                completeProfileBtn.disabled = false;
                completeProfileBtn.textContent = 'Get Started';
            }
        });

        // Google Authentication
        googleAuthBtn.addEventListener('click', async function () {
            try {
                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;

                const response = await sendToBackend('google-auth', {
                    email: user.email,
                    firstname: user.displayName?.split(' ')[0] || '',
                    lastname: user.displayName?.split(' ')[1] || '',
                    google_uid: user.uid
                });

                if (response.success) {
                    window.location.href = response.role === 'admin'
                        ? '/hauzisha/control-room/dashboard.php'
                        : '/hauzisha/user-profile/dashboard.php';
                } else {
                    showToast('Google authentication failed: ' + response.message, 'error');
                }
            } catch (error) {
                console.error('Google auth error:', error);
                showToast('Google authentication failed. Please try again.', 'error');
            }
        });

        // Other event handlers
        backToContactBtn.addEventListener('click', function () {
            clearInterval(countdownInterval);
            showStep('contact-input-step');
            contactInput.focus();
        });

        resendCodeBtn.addEventListener('click', function () {
            continueBtn.click();
        });

        // Enable/disable complete profile button
        [profileFirstName, profileLastName, profileTermsCheck].forEach(el => {
            el.addEventListener('input', function () {
                completeProfileBtn.disabled = !(
                    profileFirstName.value.trim() &&
                    profileLastName.value.trim() &&
                    profileTermsCheck.checked
                );
            });
        });

        // Format verification code input
        verificationCode.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6);
        });

        // Auto-submit when 6 digits entered
        verificationCode.addEventListener('input', function () {
            if (this.value.length === 6) {
                setTimeout(() => verifyCodeBtn.click(), 100);
            }
        });
    });
</script>