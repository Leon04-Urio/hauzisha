import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function () {

  // -------- FIREBASE CONFIG --------
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

  // -------- ELEMENTS --------
  // Login elements
  const loginForm = document.getElementById("login-form");
  const loginEmailInput = document.getElementById("loginEmail");
  const loginSubmitBtn = document.getElementById("loginSubmit");
  const loginOTPStep = document.getElementById("login-otp-step");
  const loginOTPInput = document.getElementById("loginOTP");
  const verifyLoginOTPBtn = document.getElementById("verifyLoginOTPBtn");
  const resendLoginOTPBtn = document.getElementById("resendLoginOTPBtn");
  const backToLoginContactBtn = document.getElementById("backToLoginContactBtn");
  const loginSentToContact = document.getElementById("loginSentToContact");

  // Register elements
  const registerForm = document.getElementById("register-form");
  const registerEmailInput = document.getElementById("registerEmail");
  const registerSubmitBtn = document.getElementById("registerSubmit");
  const termsCheck = document.getElementById("termsCheck");
  const registerOTPStep = document.getElementById("register-otp-step");
  const registerOTPInput = document.getElementById("registerOTP");
  const verifyRegOTPBtn = document.getElementById("verifyRegOTPBtn");
  const resendRegOTPBtn = document.getElementById("resendRegOTPBtn");
  const backToRegContactBtn = document.getElementById("backToRegContactBtn");
  const regSentToContact = document.getElementById("regSentToContact");
  const registerCompleteStep = document.getElementById("register-complete-step");
  const phoneRegFn = document.getElementById("phoneRegFn");
  const phoneRegLn = document.getElementById("phoneRegLn");
  const phoneRegEmailOpt = document.getElementById("phoneRegEmailOpt");
  const phoneRegTermsCheck = document.getElementById("phoneRegTermsCheck");
  const completePhoneRegistrationBtn = document.getElementById("completePhoneRegistrationBtn");

  // Google buttons
  const googleLoginBtn = document.getElementById("googleLogin");
  const googleRegisterBtn = document.getElementById("googleRegister");

  // Global variables
  let currentLoginContact = '';
  let currentRegisterContact = '';
  let loginContactType = ''; // 'phone' or 'email'
  let registerContactType = ''; // 'phone' or 'email'
  let loginCountdownInterval;
  let registerCountdownInterval;

  // -------- UTILITY FUNCTIONS --------
  function isEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  function isPhone(str) {
    // Use the new validation function
    return isValidPhone(str) || isValidPhone(formatPhone(str));
  }

  function formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');

    // Handle Kenyan numbers in various formats
    if (cleaned.length === 9 && cleaned.startsWith('7')) {
      return '+254' + cleaned;
    } else if (cleaned.length === 10 && cleaned.startsWith('07')) {
      return '+254' + cleaned.substring(1);
    } else if (cleaned.length === 12 && cleaned.startsWith('254')) {
      return '+' + cleaned;
    } else if (cleaned.length === 13 && cleaned.startsWith('254')) {
      return '+' + cleaned;
    } else if (phone.startsWith('+254')) {
      return phone.replace(/\D/g, '').replace(/^/, '+');
    }

    // Handle other international formats
    if (cleaned.startsWith('254')) {
      return '+' + cleaned;
    }

    // If it already has + and looks like international, keep it
    if (phone.startsWith('+') && cleaned.length >= 10) {
      return '+' + cleaned;
    }

    // Default: assume it's a Kenyan number without country code
    if (cleaned.length >= 9 && cleaned.length <= 10) {
      if (cleaned.startsWith('0')) {
        return '+254' + cleaned.substring(1);
      } else if (cleaned.startsWith('7')) {
        return '+254' + cleaned;
      }
    }

    return phone; // Return as-is if we can't determine format
  }

  function isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');

    // Kenyan numbers: +254 followed by 9 digits starting with 7
    if (phone.startsWith('+254')) {
      const number = cleaned.substring(3);
      return number.length === 9 && number.startsWith('7');
    }

    // Other international numbers: + followed by 7-15 digits
    if (phone.startsWith('+')) {
      return cleaned.length >= 8 && cleaned.length <= 16;
    }

    // Local Kenyan formats
    if (cleaned.length === 9 && cleaned.startsWith('7')) return true;
    if (cleaned.length === 10 && cleaned.startsWith('07')) return true;
    if (cleaned.length === 12 && cleaned.startsWith('254')) return true;

    return false;
  }

  function addSmartPhoneFormatting(inputElement, errorElementId) {
    if (!inputElement) return;

    let lastValue = '';

    inputElement.addEventListener('input', function (e) {
      const currentValue = this.value;
      const cursorPosition = this.selectionStart;

      // Don't format if user is deleting
      if (currentValue.length < lastValue.length) {
        lastValue = currentValue;
        return;
      }

      // Check if it looks like an email (contains @ or common email characters)
      const looksLikeEmail = currentValue.includes('@') ||
        currentValue.includes('.') ||
        /[a-zA-Z]/.test(currentValue);

      // Auto-format only if it looks like a phone number (starts with digits or +)
      if (currentValue && !looksLikeEmail && !isEmail(currentValue) && /^[\d+]/.test(currentValue)) {
        const formatted = formatPhone(currentValue);
        if (formatted !== currentValue) {
          this.value = formatted;
          // Try to maintain cursor position
          const newPosition = cursorPosition + (formatted.length - currentValue.length);
          this.setSelectionRange(newPosition, newPosition);
        }

        // Set mobile keyboard type
        this.setAttribute('inputmode', 'tel');

        // Trigger button state update
        if (this.id === 'loginEmail') {
          toggleLoginButton();
        } else if (this.id === 'registerEmail') {
          toggleRegisterButton();
        }
      } else if (currentValue && (isEmail(currentValue) || looksLikeEmail)) {
        // Set email keyboard type
        this.setAttribute('inputmode', 'email');

        // Trigger button state update
        if (this.id === 'loginEmail') {
          toggleLoginButton();
        } else if (this.id === 'registerEmail') {
          toggleRegisterButton();
        }
      } else {
        this.setAttribute('inputmode', 'text');

        // Trigger button state update
        if (this.id === 'loginEmail') {
          toggleLoginButton();
        } else if (this.id === 'registerEmail') {
          toggleRegisterButton();
        }
      }

      lastValue = this.value;
    });

    inputElement.addEventListener('paste', function (e) {
      setTimeout(() => {
        const pastedValue = this.value;
        if (pastedValue && !isEmail(pastedValue)) {
          const formatted = formatPhone(pastedValue);
          this.value = formatted;
        }
      }, 10);
    });

    inputElement.addEventListener('focus', function () {
      if (!this.value) {
        this.placeholder = 'e.g., 0712345678 or email@example.com';
      }

      // Set input mode for mobile keyboards
      if (!isEmail(this.value)) {
        this.setAttribute('inputmode', 'tel');
      } else {
        this.setAttribute('inputmode', 'email');
      }
    });

    inputElement.addEventListener('blur', function () {
      this.placeholder = 'Phone number or email';
    });
  }

  function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = message;
  }

  function clearError(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = '';
  }

  function startCountdown(countdownId, timerId, resendBtnId, callback) {
    let timeLeft = 60;
    const countdownEl = document.getElementById(countdownId);
    const timerEl = document.getElementById(timerId);
    const resendBtn = document.getElementById(resendBtnId);

    if (!countdownEl || !timerEl || !resendBtn) return;

    timerEl.style.display = 'inline';
    resendBtn.style.display = 'none';

    const interval = setInterval(() => {
      timeLeft--;
      countdownEl.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(interval);
        timerEl.style.display = 'none';
        resendBtn.style.display = 'inline-block';
        if (callback) callback();
      }
    }, 1000);

    return interval;
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
        // Try to get the error message from the response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If we can't parse JSON, use the status text
          errorMessage = `HTTP error! status: ${response.status} - ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Backend error:', error);
      return { success: false, message: error.message || 'Connection error. Please try again.' };
    }
  }

  // -------- LOGIN FUNCTIONALITY --------
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const contact = loginEmailInput.value.trim();
      clearError('loginEmailError');

      if (!contact) {
        showError('loginEmailError', 'Please enter your phone number or email');
        return;
      }

      // Handle Remember Me
      const rememberMeCheckbox = document.getElementById('rememberMe');
      if (rememberMeCheckbox && rememberMeCheckbox.checked) {
        localStorage.setItem('rememberedContact', contact);
        console.log('✅ Saved contact to Remember Me:', contact);
      } else {
        localStorage.removeItem('rememberedContact');
        console.log('❌ Removed Remember Me');
      }

      if (isEmail(contact)) {
        loginContactType = 'email';
        currentLoginContact = contact;

        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = 'Sending...';

        try {
          // For now, we'll use the phone OTP endpoint for emails too
          // You can create a separate email OTP endpoint later
          const response = await sendToBackend('auth/request-otp', { phone: contact });

          if (response.success) {
            // Log OTP to console in development mode
            if (response.dev_otp) {
              console.log('🔐 Development OTP for', contact, ':', response.dev_otp);
              showToast('Development Mode: OTP is ' + response.dev_otp, 'info', 5000);
            }

            loginSentToContact.textContent = contact;
            loginForm.style.display = 'none';
            loginOTPStep.style.display = 'block';
            document.getElementById('social-login-section').style.display = 'none';
            document.getElementById('signup-link-section').style.display = 'none';

            loginCountdownInterval = startCountdown('loginCountdown', 'loginOtpTimer', 'resendLoginOTPBtn');
            loginOTPInput.focus();
          } else {
            showError('loginEmailError', response.message || 'Failed to send verification code');
          }
        } catch (error) {
          showError('loginEmailError', 'Failed to send verification code. Please try again.');
        } finally {
          loginSubmitBtn.disabled = false;
          loginSubmitBtn.textContent = 'Continue';
        }

      } else if (isPhone(contact)) {
        loginContactType = 'phone';
        currentLoginContact = formatPhone(contact);

        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = 'Sending...';

        try {
          const response = await sendToBackend('auth/request-otp', { phone: currentLoginContact });

          if (response.success) {
            // Log OTP to console in development mode
            if (response.dev_otp) {
              console.log('🔐 Development OTP for', currentLoginContact, ':', response.dev_otp);
              showToast('Development Mode: OTP is ' + response.dev_otp, 'info', 5000);
            }

            loginSentToContact.textContent = currentLoginContact;
            loginForm.style.display = 'none';
            loginOTPStep.style.display = 'block';
            document.getElementById('social-login-section').style.display = 'none';
            document.getElementById('signup-link-section').style.display = 'none';

            loginCountdownInterval = startCountdown('loginCountdown', 'loginOtpTimer', 'resendLoginOTPBtn');
            loginOTPInput.focus();
          } else {
            showError('loginEmailError', response.message || 'Failed to send verification code');
          }
        } catch (error) {
          showError('loginEmailError', 'Failed to send verification code. Please try again.');
        } finally {
          loginSubmitBtn.disabled = false;
          loginSubmitBtn.textContent = 'Continue';
        }

      } else {
        showError('loginEmailError', 'Please enter a valid phone number or email address');
      }
    });
  }

  // Login OTP verification
  if (verifyLoginOTPBtn) {
    verifyLoginOTPBtn.addEventListener('click', async function () {
      const otp = loginOTPInput.value.trim();
      clearError('loginOTPError');

      if (!otp || otp.length !== 6) {
        showError('loginOTPError', 'Please enter the 6-digit verification code');
        return;
      }

      verifyLoginOTPBtn.disabled = true;
      verifyLoginOTPBtn.textContent = 'Verifying...';

      try {
        // Send the contact info based on what type it is
        const data = loginContactType === 'email'
          ? { email: currentLoginContact, otp: otp }
          : { phone: currentLoginContact, otp: otp };

        const response = await sendToBackend('auth/verify-otp', data);

        if (response.success) {
          if (response.action === 'login') {
            // Redirect based on role
            if (response.role === 'admin') {
              window.location.href = '/hauzisha/control-room/dashboard.php';
            } else {
              window.location.href = '/hauzisha/index.php';
            }
          } else if (response.action === 'register') {
            // New user - switch to register tab and show complete profile
            showToast('Account not found. Please use the Register tab to create a new account.', 'warning');
            document.getElementById('register-tab').click();
          }
        } else {
          showError('loginOTPError', response.message || 'Invalid verification code');
        }
      } catch (error) {
        showError('loginOTPError', 'Verification failed. Please try again.');
      } finally {
        verifyLoginOTPBtn.disabled = false;
        verifyLoginOTPBtn.textContent = 'Verify OTP';
      }
    });
  }

  // Login back button
  if (backToLoginContactBtn) {
    backToLoginContactBtn.addEventListener('click', function () {
      clearInterval(loginCountdownInterval);
      loginForm.style.display = 'block';
      loginOTPStep.style.display = 'none';
      document.getElementById('social-login-section').style.display = 'block';
      document.getElementById('signup-link-section').style.display = 'block';
      loginOTPInput.value = '';
      clearError('loginOTPError');
    });
  }

  // Login resend OTP
  if (resendLoginOTPBtn) {
    resendLoginOTPBtn.addEventListener('click', function () {
      loginSubmitBtn.click();
    });
  }

  // -------- REGISTER FUNCTIONALITY --------
  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const contact = registerEmailInput.value.trim();
      clearError('registerEmailError');

      if (!contact) {
        showError('registerEmailError', 'Please enter your phone number or email');
        return;
      }

      if (!termsCheck.checked) {
        showError('registerEmailError', 'Please accept the Terms & Conditions');
        return;
      }

      if (isEmail(contact)) {
        registerContactType = 'email';
        currentRegisterContact = contact;

        registerSubmitBtn.disabled = true;
        registerSubmitBtn.textContent = 'Sending...';

        try {
          const response = await sendToBackend('auth/request-otp', { phone: contact });

          if (response.success) {
            // Log OTP to console in development mode
            if (response.dev_otp) {
              console.log('🔐 Development OTP for', contact, ':', response.dev_otp);
              showToast('Development Mode: OTP is ' + response.dev_otp, 'info', 5000);
            }

            regSentToContact.textContent = contact;
            registerForm.style.display = 'none';
            registerOTPStep.style.display = 'block';
            document.getElementById('social-register-separator').style.display = 'none';
            document.getElementById('social-register-buttons').style.display = 'none';
            document.getElementById('login-link-section').style.display = 'none';

            registerCountdownInterval = startCountdown('regCountdown', 'regOtpTimer', 'resendRegOTPBtn');
            registerOTPInput.focus();
          } else {
            showError('registerEmailError', response.message || 'Failed to send verification code');
          }
        } catch (error) {
          showError('registerEmailError', 'Failed to send verification code. Please try again.');
        } finally {
          registerSubmitBtn.disabled = false;
          registerSubmitBtn.textContent = 'Send OTP';
        }

      } else if (isPhone(contact)) {
        registerContactType = 'phone';
        currentRegisterContact = formatPhone(contact);

        registerSubmitBtn.disabled = true;
        registerSubmitBtn.textContent = 'Sending...';

        try {
          const response = await sendToBackend('auth/request-otp', { phone: currentRegisterContact });

          if (response.success) {
            // Log OTP to console in development mode
            if (response.dev_otp) {
              console.log('🔐 Development OTP for', currentRegisterContact, ':', response.dev_otp);
              showToast('Development Mode: OTP is ' + response.dev_otp, 'info', 5000);
            }

            regSentToContact.textContent = currentRegisterContact;
            registerForm.style.display = 'none';
            registerOTPStep.style.display = 'block';
            document.getElementById('social-register-separator').style.display = 'none';
            document.getElementById('social-register-buttons').style.display = 'none';
            document.getElementById('login-link-section').style.display = 'none';

            registerCountdownInterval = startCountdown('regCountdown', 'regOtpTimer', 'resendRegOTPBtn');
            registerOTPInput.focus();
          } else {
            showError('registerEmailError', response.message || 'Failed to send verification code');
          }
        } catch (error) {
          showError('registerEmailError', 'Failed to send verification code. Please try again.');
        } finally {
          registerSubmitBtn.disabled = false;
          registerSubmitBtn.textContent = 'Send OTP';
        }

      } else {
        showError('registerEmailError', 'Please enter a valid phone number or email address');
      }
    });
  }

  // Register OTP verification
  if (verifyRegOTPBtn) {
    verifyRegOTPBtn.addEventListener('click', async function () {
      const otp = registerOTPInput.value.trim();
      clearError('registerOTPError');

      if (!otp || otp.length !== 6) {
        showError('registerOTPError', 'Please enter the 6-digit verification code');
        return;
      }

      verifyRegOTPBtn.disabled = true;
      verifyRegOTPBtn.textContent = 'Verifying...';

      try {
        // Send the contact info based on what type it is
        const data = registerContactType === 'email'
          ? { email: currentRegisterContact, otp: otp }
          : { phone: currentRegisterContact, otp: otp };

        const response = await sendToBackend('auth/verify-otp', data);

        if (response.success) {
          if (response.action === 'login') {
            // User already exists
            showToast('Account already exists. Please use the Login tab instead.', 'warning');
            document.getElementById('login-tab').click();
          } else if (response.action === 'register') {
            // New user - show complete registration
            registerOTPStep.style.display = 'none';
            registerCompleteStep.style.display = 'block';
            phoneRegFn.focus();
          }
        } else {
          showError('registerOTPError', response.message || 'Invalid verification code');
        }
      } catch (error) {
        showError('registerOTPError', 'Verification failed. Please try again.');
      } finally {
        verifyRegOTPBtn.disabled = false;
        verifyRegOTPBtn.textContent = 'Verify OTP';
      }
    });
  }

  // Register back button
  if (backToRegContactBtn) {
    backToRegContactBtn.addEventListener('click', function () {
      clearInterval(registerCountdownInterval);
      registerForm.style.display = 'block';
      registerOTPStep.style.display = 'none';
      document.getElementById('social-register-separator').style.display = 'flex';
      document.getElementById('social-register-buttons').style.display = 'flex';
      document.getElementById('login-link-section').style.display = 'block';
      registerOTPInput.value = '';
      clearError('registerOTPError');
    });
  }

  // Register resend OTP
  if (resendRegOTPBtn) {
    resendRegOTPBtn.addEventListener('click', function () {
      registerSubmitBtn.click();
    });
  }

  // Complete registration
  if (completePhoneRegistrationBtn) {
    completePhoneRegistrationBtn.addEventListener('click', async function () {
      const firstName = phoneRegFn.value.trim();
      const lastName = phoneRegLn.value.trim();
      const email = phoneRegEmailOpt.value.trim();

      if (!firstName || !lastName) {
        showToast('Please enter your first and last name', 'error');
        return;
      }

      if (!phoneRegTermsCheck.checked) {
        showToast('Please accept the terms and conditions', 'error');
        return;
      }

      completePhoneRegistrationBtn.disabled = true;
      completePhoneRegistrationBtn.textContent = 'Creating Account...';

      try {
        const data = {
          firstname: firstName,
          lastname: lastName,
          email: email || null
        };

        const response = await sendToBackend('auth/complete-otp-registration', data);

        if (response.success) {
          showToast('Registration completed successfully!', 'success');
          window.location.href = '/hauzisha/user-profile/dashboard.php';
        } else {
          showToast('Registration failed: ' + response.message, 'error');
        }
      } catch (error) {
        showToast('Registration failed. Please try again.', 'error');
      } finally {
        completePhoneRegistrationBtn.disabled = false;
        completePhoneRegistrationBtn.textContent = 'Complete Registration';
      }
    });
  }

  // -------- GOOGLE AUTHENTICATION --------
  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const firstname = user.displayName?.split(" ")[0] || "";
      const lastname = user.displayName?.split(" ")[1] || "";

      const backendResponse = await sendToBackend("google-auth", {
        email: user.email,
        firstname,
        lastname,
        google_uid: user.uid
      });

      if (!backendResponse.success) {
        showToast('Google authentication failed: ' + backendResponse.message, 'error');
        return;
      }

      const role = backendResponse.role;

      if (role === 'admin') {
        window.location.href = "/hauzisha/control-room/dashboard.php";
      } else {
        window.location.href = "/hauzisha/index.php";
      }

    } catch (err) {
      console.error(err);
      showToast('Google login failed: ' + err.message, 'error');
    }
  };

  if (googleLoginBtn) googleLoginBtn.addEventListener("click", handleGoogleAuth);
  if (googleRegisterBtn) googleRegisterBtn.addEventListener("click", handleGoogleAuth);

  // -------- FORM VALIDATION --------
  // Enable/disable login submit button
  function toggleLoginButton() {
    if (loginSubmitBtn) {
      const contact = loginEmailInput.value.trim();
      loginSubmitBtn.disabled = !(contact && (isEmail(contact) || isPhone(contact)));
    }
  }

  // Enable/disable register submit button
  function toggleRegisterButton() {
    if (registerSubmitBtn) {
      const contact = registerEmailInput.value.trim();
      registerSubmitBtn.disabled = !(
        contact &&
        (isEmail(contact) || isPhone(contact)) &&
        termsCheck.checked
      );
    }
  }

  if (loginEmailInput) loginEmailInput.addEventListener("input", toggleLoginButton);
  if (registerEmailInput) registerEmailInput.addEventListener("input", toggleRegisterButton);
  if (termsCheck) termsCheck.addEventListener("change", toggleRegisterButton);

  // Enable/disable complete registration button
  function toggleCompleteRegistrationButton() {
    if (completePhoneRegistrationBtn) {
      completePhoneRegistrationBtn.disabled = !(
        phoneRegFn.value.trim() &&
        phoneRegLn.value.trim() &&
        phoneRegTermsCheck.checked
      );
    }
  }

  if (phoneRegFn) phoneRegFn.addEventListener("input", toggleCompleteRegistrationButton);
  if (phoneRegLn) phoneRegLn.addEventListener("input", toggleCompleteRegistrationButton);
  if (phoneRegTermsCheck) phoneRegTermsCheck.addEventListener("change", toggleCompleteRegistrationButton);

  // -------- OTP INPUT FORMATTING --------
  function formatOTPInput(input) {
    if (!input) return;

    input.addEventListener('input', function (e) {
      // Only allow numbers
      this.value = this.value.replace(/[^0-9]/g, '');

      // Limit to 6 digits
      if (this.value.length > 6) {
        this.value = this.value.slice(0, 6);
      }

      // Auto-submit when 6 digits entered
      if (this.value.length === 6) {
        setTimeout(() => {
          if (this.id === 'loginOTP' && verifyLoginOTPBtn) {
            verifyLoginOTPBtn.click();
          } else if (this.id === 'registerOTP' && verifyRegOTPBtn) {
            verifyRegOTPBtn.click();
          }
        }, 100);
      }
    });

    input.addEventListener('keydown', function (e) {
      // Allow backspace, delete, tab, escape, enter
      if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
        return;
      }
      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
      }
    });
  }

  // Apply OTP formatting to OTP inputs
  formatOTPInput(loginOTPInput);
  formatOTPInput(registerOTPInput);

  // Apply smart phone formatting to contact inputs
  addSmartPhoneFormatting(loginEmailInput, 'loginEmailError');
  addSmartPhoneFormatting(registerEmailInput, 'registerEmailError');

  // Initialize button states
  toggleLoginButton();
  toggleRegisterButton();
  toggleCompleteRegistrationButton();

  // --------- TAB SWITCH ---------
  const signupLink = document.querySelector('#login .signup-link');
  const loginLink = document.querySelector('#register .login-link');

  if (signupLink) {
    signupLink.addEventListener('click', () => {
      document.getElementById('register-tab').click();
    });
  }

  if (loginLink) {
    loginLink.addEventListener('click', () => {
      document.getElementById('login-tab').click();
    });
  }

  // --------- MOBILE MODAL HANDLING ---------
  const authModalEl = document.getElementById('authModal');
  let isAnimating = false;

  if (authModalEl) {
    authModalEl.addEventListener('show.bs.modal', () => {
      if (window.innerWidth <= 768) {
        const dialog = authModalEl.querySelector('.modal-dialog');
        dialog.classList.remove('modal-dialog-centered');
        authModalEl.classList.add('bottom-sheet');

        // force reflow for transition
        dialog.offsetHeight;
        dialog.style.transform = 'translateY(0)';
      }
    });

    authModalEl.addEventListener('hide.bs.modal', (e) => {
      if (window.innerWidth <= 768 && !isAnimating) {
        e.preventDefault(); // stop immediate hide
        isAnimating = true;

        const dialog = authModalEl.querySelector('.modal-dialog');
        dialog.style.transform = 'translateY(100%)';

        // wait for animation
        setTimeout(() => {
          // remove backdrop and close properly
          bootstrap.Modal.getInstance(authModalEl)?.hide();
          dialog.style.transform = '';
          isAnimating = false;
        }, 200);
      }
    });
  }

  // ========== ENHANCED FEATURES ==========

  // Smart Input Detection with Kenya Flag
  function setupSmartInput(inputElement, countryCodeElement, inputTypeElement) {
    if (!inputElement) return;

    let checkTimeout;

    inputElement.addEventListener('input', function () {
      const value = this.value.trim();

      if (!value) {
        // Reset
        if (countryCodeElement) countryCodeElement.style.display = 'none';
        this.classList.remove('phone-mode');
        if (inputTypeElement) inputTypeElement.textContent = '';
        return;
      }

      // Detect type - check if it contains @ or looks like email
      const hasAtSymbol = value.includes('@');
      const hasLetters = /[a-zA-Z]/.test(value);
      const isLikelyEmail = hasAtSymbol || (hasLetters && !value.startsWith('+'));

      if (isLikelyEmail) {
        // Email detected
        if (countryCodeElement) countryCodeElement.style.display = 'none';
        this.classList.remove('phone-mode');
        if (inputTypeElement) {
          inputTypeElement.textContent = 'Email detected';
          inputTypeElement.style.color = '#28a745';
        }

        // Check uniqueness for register tab only if it's a valid email
        if (this.id === 'registerEmail' && isEmail(value)) {
          clearTimeout(checkTimeout);
          checkTimeout = setTimeout(() => checkContactUniqueness(value, 'email'), 500);
        }
      } else {
        // Phone detected (only numbers or starts with +)
        if (countryCodeElement) countryCodeElement.style.display = 'flex';
        this.classList.add('phone-mode');
        if (inputTypeElement) {
          inputTypeElement.textContent = 'Phone detected';
          inputTypeElement.style.color = '#007bff';
        }

        // Check uniqueness for register tab
        if (this.id === 'registerEmail') {
          clearTimeout(checkTimeout);
          const formatted = formatPhone(value);
          if (isValidPhone(formatted)) {
            checkTimeout = setTimeout(() => checkContactUniqueness(formatted, 'phone'), 500);
          }
        }
      }
    });
  }

  // Check if contact (email/phone) is already registered
  async function checkContactUniqueness(contact, type) {
    try {
      const data = type === 'email' ? { email: contact } : { phone: contact };
      const response = await sendToBackend('auth/check-contact', data);

      if (response.success) {
        const inputTypeElement = document.getElementById('registerInputType');
        if (inputTypeElement) {
          if (response.exists) {
            inputTypeElement.textContent = '⚠️ This ' + type + ' is already registered';
            inputTypeElement.style.color = '#dc3545';
          } else {
            inputTypeElement.textContent = '✓ ' + (type === 'email' ? 'Email' : 'Phone') + ' available';
            inputTypeElement.style.color = '#28a745';
          }
        }
      }
    } catch (error) {
      console.error('Error checking contact uniqueness:', error);
    }
  }

  // Setup smart inputs
  const registerCountryCode = document.getElementById('registerCountryCode');
  const registerInputType = document.getElementById('registerInputType');
  if (registerEmailInput) {
    setupSmartInput(registerEmailInput, registerCountryCode, registerInputType);
  }

  const loginCountryCode = document.getElementById('loginCountryCode');
  const loginInputType = document.getElementById('loginInputType');
  if (loginEmailInput) {
    setupSmartInput(loginEmailInput, loginCountryCode, loginInputType);
  }

  // OTP Circle Inputs with Auto-Advance
  function setupOTPCircles(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.log('OTP container not found:', containerSelector);
      return;
    }

    const inputs = container.querySelectorAll('.otp-input');
    if (inputs.length === 0) {
      console.log('No OTP inputs found in:', containerSelector);
      return;
    }

    console.log('Setting up OTP circles for:', containerSelector, 'Found', inputs.length, 'inputs');

    inputs.forEach((input, index) => {
      // Handle input
      input.addEventListener('input', function (e) {
        const value = this.value;

        // Only allow numbers
        this.value = value.replace(/[^0-9]/g, '');

        // Add filled class
        if (this.value) {
          this.classList.add('filled');
        } else {
          this.classList.remove('filled');
        }

        // Auto-advance to next input
        if (this.value && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }

        // Auto-submit when all filled
        if (index === inputs.length - 1 && this.value) {
          const allFilled = Array.from(inputs).every(inp => inp.value);
          if (allFilled) {
            const otp = Array.from(inputs).map(inp => inp.value).join('');
            console.log('All OTP digits filled:', otp);

            // Trigger verification based on which step we're in
            if (containerSelector.includes('register')) {
              // Set the OTP value and trigger verification
              if (verifyRegOTPBtn) {
                // Store in the hidden input for compatibility
                if (registerOTPInput) registerOTPInput.value = otp;

                setTimeout(() => {
                  console.log('Auto-submitting register OTP');
                  verifyRegOTPBtn.click();
                }, 300);
              }
            } else if (containerSelector.includes('login')) {
              if (verifyLoginOTPBtn) {
                if (loginOTPInput) loginOTPInput.value = otp;

                setTimeout(() => {
                  console.log('Auto-submitting login OTP');
                  verifyLoginOTPBtn.click();
                }, 300);
              }
            }
          }
        }
      });

      // Handle backspace
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !this.value && index > 0) {
          inputs[index - 1].focus();
          inputs[index - 1].value = '';
          inputs[index - 1].classList.remove('filled');
        }
      });

      // Handle paste
      input.addEventListener('paste', function (e) {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');

        // Distribute pasted digits across inputs
        for (let i = 0; i < Math.min(pastedData.length, inputs.length); i++) {
          inputs[i].value = pastedData[i];
          inputs[i].classList.add('filled');
        }

        // Focus last filled input
        const lastIndex = Math.min(pastedData.length - 1, inputs.length - 1);
        inputs[lastIndex].focus();

        // Auto-submit if all filled
        if (pastedData.length >= inputs.length) {
          const otp = pastedData.substring(0, 6);
          setTimeout(() => {
            if (containerSelector.includes('register') && verifyRegOTPBtn) {
              if (registerOTPInput) registerOTPInput.value = otp;
              verifyRegOTPBtn.click();
            } else if (containerSelector.includes('login') && verifyLoginOTPBtn) {
              if (loginOTPInput) loginOTPInput.value = otp;
              verifyLoginOTPBtn.click();
            }
          }, 300);
        }
      });
    });

    // Focus first input when container becomes visible
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.style.display !== 'none' && inputs[0]) {
          inputs[0].focus();
        }
      });
    });

    observer.observe(container, { attributes: true, attributeFilter: ['style'] });
  }

  // Setup OTP circles for register
  setupOTPCircles('#register-otp-step .otp-input-container');

  // Setup OTP circles for login
  setupOTPCircles('#login-otp-step .otp-input-container');

  // Remember Me Functionality
  const rememberMeCheckbox = document.getElementById('rememberMe');

  // Check for remembered credentials on page load
  const rememberedContact = localStorage.getItem('rememberedContact');
  if (rememberedContact && loginEmailInput) {
    loginEmailInput.value = rememberedContact;
    if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
    toggleLoginButton();
    console.log('✅ Loaded remembered contact:', rememberedContact);
  }

  // Clear remembered credentials on logout
  window.addEventListener('storage', (e) => {
    if (e.key === 'userLoggedOut' && e.newValue === 'true') {
      localStorage.removeItem('rememberedContact');
      if (rememberMeCheckbox) rememberMeCheckbox.checked = false;
      if (loginEmailInput) loginEmailInput.value = '';
    }
  });

  console.log('✅ Enhanced authentication features loaded');

});
