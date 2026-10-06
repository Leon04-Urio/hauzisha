// Security page JavaScript logic

// Load 2FA status on page load
async function load2FAStatus() {
    try {
        const response = await fetch('/hauzisha/api/index.php/get-2fa-status');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('twoFactorToggle').checked = data.twofa_enabled;
        }
    } catch (error) {
        console.error('Error loading 2FA status:', error);
    }
}

// Show message
function showMessage(elementId, message, type) {
    const messageDiv = document.getElementById(elementId);
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type}`;
    messageDiv.classList.remove('d-none');
    
    setTimeout(() => {
        messageDiv.classList.add('d-none');
    }, 5000);
}

// Handle password change
document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (newPassword.length < 8) {
        showMessage('passwordMessage', 'New password must be at least 8 characters', 'danger');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showMessage('passwordMessage', 'Passwords do not match', 'danger');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('current_password', currentPassword);
        formData.append('new_password', newPassword);
        
        const response = await fetch('/hauzisha/api/index.php/change-password', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('passwordMessage', 'Password updated successfully!', 'success');
            document.getElementById('changePasswordForm').reset();
        } else {
            showMessage('passwordMessage', data.error || 'Failed to update password', 'danger');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showMessage('passwordMessage', 'An error occurred', 'danger');
    }
});

// Handle 2FA toggle
document.getElementById('twoFactorToggle').addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    
    try {
        const formData = new FormData();
        formData.append('enabled', enabled ? '1' : '0');
        
        const response = await fetch('/hauzisha/api/index.php/toggle-2fa', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('twoFactorMessage', 
                enabled ? '2FA enabled successfully!' : '2FA disabled successfully!', 
                'success');
        } else {
            showMessage('twoFactorMessage', data.error || 'Failed to update 2FA', 'danger');
            e.target.checked = !enabled; // Revert toggle
        }
    } catch (error) {
        console.error('Error toggling 2FA:', error);
        showMessage('twoFactorMessage', 'An error occurred', 'danger');
        e.target.checked = !enabled; // Revert toggle
    }
});

// Load 2FA status on page load
document.addEventListener('DOMContentLoaded', load2FAStatus);
