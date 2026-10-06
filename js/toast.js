// Function to create toast notifications
function showToast(message, type = "success", duration = 3000) {
    let container = document.getElementById("toastContainer");
    
    // Create container if it doesn't exist
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 350px;';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement("div");
    toast.classList.add("toast-notification", type);
    
    // Determine border color based on type
    let borderColor = '#ffd700'; // default/info
    if (type === 'success') borderColor = '#28a745';
    if (type === 'error' || type === 'danger') borderColor = '#dc3545';
    if (type === 'warning') borderColor = '#ffc107';
    
    toast.style.cssText = `
        background: white;
        color: #333;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-left: 4px solid ${borderColor};
        font-size: 0.95rem;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s ease;
    `;
    toast.textContent = message;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);

    // Remove after duration
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Make it globally available
window.showToast = showToast;