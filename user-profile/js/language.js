// Language page JavaScript logic

const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'sw', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪' },
    { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
    { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' }
];

let currentLanguage = 'en';

// Load user's current language
async function loadCurrentLanguage() {
    try {
        const response = await fetch('/hauzisha/api/index.php/get-user-language');
        const data = await response.json();
        
        if (data.success && data.language) {
            currentLanguage = data.language;
        }
        
        renderLanguages();
    } catch (error) {
        console.error('Error loading language:', error);
        renderLanguages();
    }
}

// Render language options
function renderLanguages() {
    const languageList = document.getElementById('languageList');
    
    languageList.innerHTML = languages.map(lang => `
        <div class="language-option ${lang.code === currentLanguage ? 'active' : ''}" 
             data-lang="${lang.code}">
            <div class="language-info">
                <span class="language-flag">${lang.flag}</span>
                <div>
                    <div class="language-name">${lang.name}</div>
                    <div class="language-native">${lang.native}</div>
                </div>
            </div>
            <i class="fa fa-check-circle check-icon"></i>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', () => selectLanguage(option.dataset.lang));
    });
}

// Select language
async function selectLanguage(langCode) {
    if (langCode === currentLanguage) return;
    
    try {
        const formData = new FormData();
        formData.append('language', langCode);
        
        const response = await fetch('/hauzisha/api/index.php/update-user-language', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentLanguage = langCode;
            renderLanguages();
            showMessage('Language updated successfully!', 'success');
        } else {
            showMessage(data.error || 'Failed to update language', 'danger');
        }
    } catch (error) {
        console.error('Error updating language:', error);
        showMessage('An error occurred', 'danger');
    }
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.getElementById('languageMessage');
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type}`;
    messageDiv.classList.remove('d-none');
    
    setTimeout(() => {
        messageDiv.classList.add('d-none');
    }, 3000);
}

// Load on page load
document.addEventListener('DOMContentLoaded', loadCurrentLanguage);
