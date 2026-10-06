// Update property rating display after new review
async function updatePropertyRating(propertyId) {
    try {
        const response = await fetch(`/hauzisha/api/index.php/property/${propertyId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            const newRating = parseFloat(data.data.rating) || 0;
            
            // Update all rating displays on the page
            const ratingElements = document.querySelectorAll('.rating-icon-pview .stars');
            ratingElements.forEach(el => {
                el.innerHTML = renderStarsForRating(newRating);
                el.title = `${newRating.toFixed(1)} / 5`;
            });
            
            // Update hero rating
            const heroRating = document.querySelector('.hero-icons .rating-icon-pview');
            if (heroRating) {
                heroRating.innerHTML = renderStarsForRating(newRating);
            }
        }
    } catch (error) {
        console.error('Error updating property rating:', error);
    }
}

// Render stars for a rating value
function renderStarsForRating(rating) {
    rating = parseFloat(rating) || 0;
    const fullStars = Math.floor(rating);
    const halfStar = (rating - fullStars) >= 0.5 ? 1 : 0;
    const emptyStars = 5 - (fullStars + halfStar);
    
    let output = '';
    
    // Gold full stars
    for (let i = 0; i < fullStars; i++) {
        output += '<i class="fas fa-star"></i>&nbsp;';
    }
    
    // Gold half star
    if (halfStar) {
        output += '<i class="fas fa-star-half-alt"></i>&nbsp;';
    }
    
    // Grey empty stars
    for (let i = 0; i < emptyStars; i++) {
        output += '<i class="fas fa-star" style="color:gray;"></i>&nbsp;';
    }
    
    return output;
}

// Export function
window.updatePropertyRating = updatePropertyRating;
