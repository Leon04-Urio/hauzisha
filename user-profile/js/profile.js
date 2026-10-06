// Profile page JavaScript logic
let currentUserData = null;

// Fetch and display user profile data
async function loadUserProfile() {
    try {
        const response = await fetch('/hauzisha/api/index.php/get-user-profile');
        const data = await response.json();
        
        if (data.success && data.user) {
            currentUserData = data.user;
            updateProfileDisplay(data.user);
        } else {
            console.error('Failed to load user profile:', data.error);
            showProfileError();
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        showProfileError();
    }
}

// Update profile display with user data
function updateProfileDisplay(user) {
    // Update profile name
    document.getElementById('profileName').textContent = 
        `${user.firstname} ${user.lastname}`;
    
    // Update profile email (header)
    document.getElementById('profileEmail').textContent = user.email;
    
    // Update profile email (details section)
    document.getElementById('profileEmailDetail').textContent = user.email;
    
    // Update account type/role
    document.getElementById('profileRole').textContent = user.role;
    
    // Format and update member since date
    const memberSince = new Date(user.created_at);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('profileMemberSince').textContent = 
        memberSince.toLocaleDateString('en-US', options);
    
    // Update profile image if available
    if (user.image && user.image.trim() !== '') {
        // Ensure the path is correct
        const imagePath = user.image.startsWith('/hauzisha/') ? user.image : '/loft-studio' + user.image;
        document.getElementById('profileImage').src = imagePath;
    } else {
        document.getElementById('profileImage').src = '../images/male_cv.jpg';
    }
}

// Show error state
function showProfileError() {
    document.getElementById('profileName').textContent = 'Error loading profile';
    document.getElementById('profileEmail').textContent = '';
    document.getElementById('profileEmailDetail').textContent = 'Unable to load';
    document.getElementById('profileRole').textContent = 'Unable to load';
    document.getElementById('profileMemberSince').textContent = 'Unable to load';
}

// Populate edit modal with current user data
function populateEditModal() {
    if (currentUserData) {
        document.getElementById('editFirstname').value = currentUserData.firstname;
        document.getElementById('editLastname').value = currentUserData.lastname;
        document.getElementById('editEmail').value = currentUserData.email;
    }
}

// Validate form inputs
function validateForm() {
    const form = document.getElementById('editProfileForm');
    const firstname = document.getElementById('editFirstname').value.trim();
    const lastname = document.getElementById('editLastname').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const fileInput = document.getElementById('editProfilePicture');
    
    let isValid = true;
    
    // Validate firstname
    if (!firstname) {
        document.getElementById('editFirstname').classList.add('is-invalid');
        isValid = false;
    } else {
        document.getElementById('editFirstname').classList.remove('is-invalid');
    }
    
    // Validate lastname
    if (!lastname) {
        document.getElementById('editLastname').classList.add('is-invalid');
        isValid = false;
    } else {
        document.getElementById('editLastname').classList.remove('is-invalid');
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        document.getElementById('editEmail').classList.add('is-invalid');
        isValid = false;
    } else {
        document.getElementById('editEmail').classList.remove('is-invalid');
    }
    
    // Validate file if selected
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        console.log('File validation - Name:', file.name, 'Type:', file.type, 'Size:', file.size);
        
        if (!allowedTypes.includes(file.type)) {
            fileInput.classList.add('is-invalid');
            showMessage('Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.', 'danger');
            console.log('File type validation failed:', file.type);
            isValid = false;
        } else if (file.size > maxSize) {
            fileInput.classList.add('is-invalid');
            showMessage('File size exceeds 5MB limit.', 'danger');
            console.log('File size validation failed:', file.size);
            isValid = false;
        } else {
            fileInput.classList.remove('is-invalid');
            console.log('File validation passed');
        }
    } else {
        console.log('No file selected');
    }
    
    return isValid;
}

// Show message in modal
function showMessage(message, type) {
    const messageDiv = document.getElementById('updateMessage');
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type}`;
    messageDiv.classList.remove('d-none');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageDiv.classList.add('d-none');
    }, 5000);
}

// Handle profile update
async function updateProfile() {
    if (!validateForm()) {
        return;
    }
    
    const saveBtn = document.getElementById('saveProfileBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    try {
        const formData = new FormData(document.getElementById('editProfileForm'));
        
        // Debug: Log form data
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        
        const response = await fetch('/hauzisha/api/index.php/update-user-profile', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        console.log('Server response:', data);
        
        if (data.success) {
            showMessage('Profile updated successfully!', 'success');
            
            // Reload profile data
            await loadUserProfile();
            
            // Close modal after 1.5 seconds
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
                modal.hide();
                
                // Reset form and message
                document.getElementById('editProfileForm').reset();
                document.getElementById('updateMessage').classList.add('d-none');
            }, 1500);
        } else {
            showMessage(data.error || 'Failed to update profile', 'danger');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('An error occurred while updating profile', 'danger');
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load profile on page load
    loadUserProfile();
    
    // Populate modal when it's shown
    const editModal = document.getElementById('editProfileModal');
    editModal.addEventListener('show.bs.modal', populateEditModal);
    
    // Handle save button click
    document.getElementById('saveProfileBtn').addEventListener('click', updateProfile);
    
    // Clear validation on input
    ['editFirstname', 'editLastname', 'editEmail', 'editProfilePicture'].forEach(id => {
        const element = document.getElementById(id);
        element.addEventListener('input', () => {
            element.classList.remove('is-invalid');
        });
    });
});
