// Invite Friends JavaScript logic

let referralLink = '';

// Load referral link and stats
async function loadReferralData() {
    try {
        const response = await fetch('/hauzisha/api/index.php/get-referral-link');
        const data = await response.json();
        
        if (data.success) {
            referralLink = data.referral_link;
            document.getElementById('referralLink').textContent = referralLink;
            
            // Update stats
            document.getElementById('totalInvites').textContent = data.stats.total_invites || 0;
            document.getElementById('totalJoined').textContent = data.stats.total_joined || 0;
        } else {
            document.getElementById('referralLink').textContent = 'Error loading link';
        }
    } catch (error) {
        console.error('Error loading referral data:', error);
        document.getElementById('referralLink').textContent = 'Error loading link';
    }
}

// Copy referral link
document.getElementById('copyBtn').addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(referralLink);
        
        const btn = document.getElementById('copyBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa fa-check"></i> Copied!';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        alert('Failed to copy link');
    }
});

// Share via Email
document.getElementById('shareEmail').addEventListener('click', () => {
    const subject = encodeURIComponent('Join me on LOFT STUDIO!');
    const body = encodeURIComponent(`Hi!\n\nI've been using LOFT STUDIO to find amazing properties and I think you'd love it too!\n\nJoin using my referral link:\n${referralLink}\n\nBest regards`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
});

// Share via WhatsApp
document.getElementById('shareWhatsApp').addEventListener('click', () => {
    const text = encodeURIComponent(`Join me on LOFT STUDIO! Check out amazing properties here: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
});

// Share via Twitter
document.getElementById('shareTwitter').addEventListener('click', () => {
    const text = encodeURIComponent(`Just discovered LOFT STUDIO - an amazing platform for finding properties! Join me: ${referralLink}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
});

// Send email invitation
document.getElementById('emailInviteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('friendEmail').value.trim();
    const name = document.getElementById('friendName').value.trim();
    
    if (!email) {
        showMessage('Email is required', 'danger');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('name', name);
        
        const response = await fetch('/hauzisha/api/index.php/send-referral-email', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Invitation sent successfully!', 'success');
            document.getElementById('emailInviteForm').reset();
            
            // Reload stats
            loadReferralData();
        } else {
            showMessage(data.error || 'Failed to send invitation', 'danger');
        }
    } catch (error) {
        console.error('Error sending invitation:', error);
        showMessage('An error occurred while sending invitation', 'danger');
    }
});

// Show message
function showMessage(message, type) {
    const messageDiv = document.getElementById('inviteMessage');
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type}`;
    messageDiv.classList.remove('d-none');
    
    setTimeout(() => {
        messageDiv.classList.add('d-none');
    }, 5000);
}

// Load data on page load
document.addEventListener('DOMContentLoaded', loadReferralData);
