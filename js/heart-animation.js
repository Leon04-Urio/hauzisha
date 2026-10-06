/**
 * Instagram-style Floating Heart Animation
 * Creates floating hearts when user adds a property to favorites
 */

console.log('Heart animation script loaded');

// Create floating hearts animation
function createFloatingHearts(clickX, clickY, count = 3) {
    const variants = ['variant-1', 'variant-2', 'variant-3'];
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const heart = document.createElement('i');
            heart.className = 'fas fa-heart floating-heart';
            
            // Add random variant for natural look
            const variant = variants[Math.floor(Math.random() * variants.length)];
            heart.classList.add(variant);
            
            // Position at click location with slight random offset
            const offsetX = (Math.random() - 0.5) * 20; // -10 to 10px
            const offsetY = (Math.random() - 0.5) * 20;
            
            heart.style.left = `${clickX + offsetX}px`;
            heart.style.top = `${clickY + offsetY}px`;
            
            // Random size variation
            const scale = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
            heart.style.fontSize = `${2 * scale}rem`;
            
            document.body.appendChild(heart);
            
            // Remove after animation completes
            setTimeout(() => {
                heart.remove();
            }, 800);
        }, i * 100); // Stagger the hearts
    }
}

// Add pulse effect to the clicked heart icon
function pulseHeartIcon(iconElement) {
    if (!iconElement) return;
    
    iconElement.classList.add('heart-pulse');
    setTimeout(() => {
        iconElement.classList.remove('heart-pulse');
    }, 300);
}

// Get click position relative to viewport
function getClickPosition(event) {
    let x, y;
    
    if (event.type.includes('touch')) {
        // Touch event
        const touch = event.touches[0] || event.changedTouches[0];
        x = touch.clientX;
        y = touch.clientY;
    } else {
        // Mouse event
        x = event.clientX;
        y = event.clientY;
    }
    
    return { x, y };
}

// Main function to trigger heart animation
function triggerHeartAnimation(event, iconElement) {
    const { x, y } = getClickPosition(event);
    
    // Create floating hearts
    createFloatingHearts(x, y, 3);
    
    // Pulse the main icon
    pulseHeartIcon(iconElement);
}

// Export for use in other scripts
window.triggerHeartAnimation = triggerHeartAnimation;
window.createFloatingHearts = createFloatingHearts;
window.pulseHeartIcon = pulseHeartIcon;
