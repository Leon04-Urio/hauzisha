document.addEventListener('DOMContentLoaded', () => {

    // ---------- EMAIL VALIDATION ----------
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
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
  
    function validateEmailOrPhone(inputId, errorId) {
      const input = document.getElementById(inputId);
      const errorMessage = document.getElementById(errorId);
  
      if (!input || !errorMessage) return;
      
      const value = input.value.trim();
  
      if (value === '') {
        errorMessage.textContent = '';
      } else {
        // Check if it's email or phone
        const hasAtSymbol = value.includes('@');
        const hasLetters = /[a-zA-Z]/.test(value);
        const isLikelyEmail = hasAtSymbol || (hasLetters && !value.startsWith('+'));
        
        if (isLikelyEmail) {
          // Validate as email
          if (!isValidEmail(value)) {
            errorMessage.textContent = 'Invalid email format';
            errorMessage.style.color = 'red';
          } else {
            errorMessage.textContent = '';
          }
        } else {
          // It's a phone number - don't show validation errors
          // The login-register.js will handle phone validation
          errorMessage.textContent = '';
        }
      }
  
      checkLoginFields();
      checkRegisterFields();
    }
  
    // ---------- LOGIN FORM ----------
    function checkLoginFields() {
      const email = document.getElementById('loginEmail')?.value.trim();
      const password = document.getElementById('loginPassword')?.value.trim();
      const loginButton = document.getElementById('loginSubmit');
      
      if (!loginButton) return;
  
      // Accept both valid email and valid phone
      const isValid = email && (isValidEmail(email) || isValidPhone(email));
      loginButton.disabled = !(isValid && password);
    }
  
    // ---------- REGISTER FORM ----------
    function checkRegisterFields() {
      const firstName = document.getElementById('registerFn')?.value.trim();
      const lastName = document.getElementById('registerLn')?.value.trim();
      const email = document.getElementById('registerEmail')?.value.trim();
      const password = document.getElementById('registerPassword')?.value.trim();
      const registerButton = document.getElementById('registerSubmit');
      
      if (!registerButton) return;
  
      registerButton.disabled = !(firstName && lastName && email && password);
    }
  
    // ---------- EVENT LISTENERS ----------
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
  
    loginEmail?.addEventListener('input', () => validateEmailOrPhone('loginEmail', 'loginEmailError'));
    loginPassword?.addEventListener('input', checkLoginFields);
  
    const registerEmail = document.getElementById('registerEmail');
    const registerFn = document.getElementById('registerFn');
    const registerLn = document.getElementById('registerLn');
    const registerPassword = document.getElementById('registerPassword');
  
    registerEmail?.addEventListener('input', () => validateEmailOrPhone('registerEmail', 'registerEmailError'));
    registerFn?.addEventListener('input', checkRegisterFields);
    registerLn?.addEventListener('input', checkRegisterFields);
    registerPassword?.addEventListener('input', checkRegisterFields);
  
    // ---------- SOCIAL LOGIN ----------
    document.getElementById('googleLogin')?.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Redirecting to Google login...');
    });
  
    document.getElementById('appleLogin')?.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Redirecting to Apple login...');
    });
  
  });
