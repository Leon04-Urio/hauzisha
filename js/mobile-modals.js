// Mobile Slide-Up Modals Handler
// Automatically converts all Bootstrap modals to slide-up on mobile

document.addEventListener('DOMContentLoaded', () => {
    // Add mobile-slide-up class to all modals
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        // Add the mobile-slide-up class
        modal.classList.add('mobile-slide-up');
        
        // Ensure close buttons work
        const closeButtons = modal.querySelectorAll('[data-bs-dismiss="modal"], .btn-close, .close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            });
        });
        
        // Close on backdrop click (mobile)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        });
    });
    
    // Handle dynamically created modals
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.classList && node.classList.contains('modal')) {
                    node.classList.add('mobile-slide-up');
                    
                    // Add close button handlers
                    const closeButtons = node.querySelectorAll('[data-bs-dismiss="modal"], .btn-close, .close');
                    closeButtons.forEach(btn => {
                        btn.addEventListener('click', () => {
                            const modalInstance = bootstrap.Modal.getInstance(node);
                            if (modalInstance) {
                                modalInstance.hide();
                            }
                        });
                    });
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
