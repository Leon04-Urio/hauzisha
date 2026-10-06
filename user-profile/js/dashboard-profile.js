// Dashboard profile loader
async function loadDashboardProfile() {
    try {
        const response = await fetch('/hauzisha/api/index.php/get-user-profile');
        const data = await response.json();
        
        if (data.success && data.user) {
            const user = data.user;
            
            // Update all profile images on the page
            const profileImages = document.querySelectorAll('.user-profile img, #profileDropdown img');
            profileImages.forEach(img => {
                if (user.image && user.image.trim() !== '') {
                    const imagePath = user.image.startsWith('/hauzisha/') ? user.image : '/loft-studio' + user.image;
                    img.src = imagePath;
                } else {
                    img.src = '../images/male_cv.jpg';
                }
            });
            
            // Update profile name
            const profileNames = document.querySelectorAll('.user-profile h6, #profileDropdown h6');
            profileNames.forEach(name => {
                name.textContent = `${user.firstname} ${user.lastname}`;
            });
            
            // Update email if element exists
            const profileEmails = document.querySelectorAll('#profileDropdown p');
            profileEmails.forEach(email => {
                email.textContent = user.email;
            });
        }
    } catch (error) {
        console.error('Error loading dashboard profile:', error);
    }
}

// Load on page load
document.addEventListener('DOMContentLoaded', loadDashboardProfile);
