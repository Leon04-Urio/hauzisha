// Property Reviews Handler
let allReviews = [];
let displayedReviews = 4;
const REVIEWS_PER_LOAD = 2;
let currentPropertyId = null;
let userLikedReviews = [];

// Load reviews for a property
async function loadPropertyReviews(propertyId) {
    currentPropertyId = propertyId;

    try {
        const response = await fetch(`/hauzisha/api/index.php/get-property-reviews?property_id=${propertyId}`);
        const data = await response.json();

        if (data.success) {
            allReviews = data.reviews || [];

            // Load user's liked reviews if logged in
            const isLoggedIn = document.body.dataset.loggedIn === 'true';
            if (isLoggedIn) {
                await loadUserLikedReviews(propertyId);
            }

            renderReviews();
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Load user's liked reviews
async function loadUserLikedReviews(propertyId) {
    try {
        const response = await fetch(`/hauzisha/api/index.php/get-user-liked-reviews?property_id=${propertyId}`);
        const data = await response.json();
        userLikedReviews = data.liked_reviews || [];
    } catch (error) {
        console.error('Error loading liked reviews:', error);
        userLikedReviews = [];
    }
}

// Render reviews with pagination
function renderReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    const reviewsToShow = allReviews.slice(0, displayedReviews);
    const hasMore = allReviews.length > displayedReviews;
    const canShowLess = displayedReviews > 4;

    if (allReviews.length === 0) {
        container.innerHTML = `
            <div class="property-description">
                <h3 class="mb-2" style="font-size: 18px;">0 Reviews</h3>
                <p style="color:#666; font-size: 0.9rem; font-style: italic;">
                    Be the first to review this property!
                </p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="property-description">
            <div class="details-reviews">
                <div class="details-reviews-child">
                    <i class="fas fa-star" style="margin-top: 1.25rem;"></i>
                    <h3>(${allReviews.length} review${allReviews.length !== 1 ? 's' : ''})</h3>
                </div>
            </div>
            
            <div id="reviews-list">
                ${reviewsToShow.map(r => renderSingleReview(r)).join('')}
            </div>
            
            <div class="text-end" style="display: flex; gap: 1rem; justify-content: flex-start;">
                ${hasMore ? `
                    <button id="loadMoreReviews" class="btn btn-link p-0 m-0" style="color: #ffd700; text-decoration: none; font-size: 0.65rem; font-weight: 400;">
                        See More
                    </button>
                ` : ''}
                ${canShowLess ? `
                    <button id="showLessReviews" class="btn btn-link" style="color: #ffd700; text-decoration: none; font-size: 0.65rem; font-weight: 400;">
                        See Less
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    // Attach load more handler
    if (hasMore) {
        document.getElementById('loadMoreReviews')?.addEventListener('click', loadMoreReviews);
    }

    // Attach show less handler
    if (canShowLess) {
        document.getElementById('showLessReviews')?.addEventListener('click', showLessReviews);
    }

    // Attach like button handlers
    attachLikeHandlers();

    // Attach reply button handlers
    attachReplyHandlers();
}

// Attach like button handlers
function attachLikeHandlers() {
    const isLoggedIn = document.body.dataset.loggedIn === 'true';

    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!isLoggedIn) {
                // Show login modal
                const authModal = document.getElementById('authModal');
                if (authModal) {
                    const modal = new bootstrap.Modal(authModal);
                    modal.show();
                } else {
                    showToast('Please log in to like reviews', 'error');
                }
                return;
            }

            // Get the button element (in case click was on child element)
            const buttonElement = e.currentTarget;
            const reviewId = parseInt(buttonElement.dataset.reviewId);

            if (!reviewId || isNaN(reviewId)) {
                console.error('Invalid review ID:', buttonElement.dataset.reviewId);
                return;
            }

            await toggleLikeReview(reviewId, buttonElement);
        });
    });
}

// Attach reply button handlers
function attachReplyHandlers() {
    const isLoggedIn = document.body.dataset.loggedIn === 'true';

    // Reply button click
    document.querySelectorAll('.reply-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const reviewId = button.dataset.reviewId;
            const replyForm = document.getElementById(`reply-form-${reviewId}`);
            if (replyForm) {
                replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
                if (replyForm.style.display === 'block') {
                    replyForm.querySelector('.reply-input')?.focus();
                }
            }
        });
    });

    // Cancel reply button
    document.querySelectorAll('.cancel-reply-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const reviewId = button.dataset.reviewId;
            const replyForm = document.getElementById(`reply-form-${reviewId}`);
            if (replyForm) {
                replyForm.style.display = 'none';
                replyForm.querySelector('.reply-input').value = '';
            }
        });
    });

    // Submit reply button
    document.querySelectorAll('.submit-reply-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const reviewId = button.dataset.reviewId;
            const replyForm = document.getElementById(`reply-form-${reviewId}`);
            const replyInput = replyForm?.querySelector('.reply-input');
            const replyText = replyInput?.value.trim();

            if (!replyText) {
                showToast('Please write a reply', 'error');
                return;
            }

            await submitReply(reviewId, replyText);
        });
    });

    // Allow Enter key to submit reply
    document.querySelectorAll('.reply-input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const reviewId = input.closest('.reply-form').id.replace('reply-form-', '');
                const submitBtn = document.querySelector(`.submit-reply-btn[data-review-id="${reviewId}"]`);
                submitBtn?.click();
            }
        });
    });
}

// Submit a reply to a review
async function submitReply(reviewId, replyText) {
    try {
        const response = await fetch('/hauzisha/api/index.php/submit-reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                review_id: reviewId,
                reply: replyText
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Reply posted successfully!', 'success');

            // Reload reviews to show the new reply
            if (currentPropertyId) {
                await loadPropertyReviews(currentPropertyId);
            }
        } else {
            showToast(data.error || 'Failed to post reply', 'error');
        }
    } catch (error) {
        console.error('Error submitting reply:', error);
        showToast('An error occurred while posting your reply', 'error');
    }
}

// Toggle like on a review
async function toggleLikeReview(reviewId, buttonElement) {
    try {
        const response = await fetch('/hauzisha/api/index.php/like-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                review_id: reviewId
            })
        });

        // Check if response is ok
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', response.status, errorText);
            throw new Error(`Server returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Like response:', data); // Debug log

        if (data.success) {
            // Update the UI
            const heartIcon = buttonElement.querySelector('i');
            const likeCount = buttonElement.querySelector('.like-count');

            // Check if elements exist
            if (!heartIcon || !likeCount) {
                console.error('Could not find heart icon or like count elements');
                console.log('Button element:', buttonElement);
                console.log('Heart icon:', heartIcon);
                console.log('Like count:', likeCount);

                // Reload reviews to show updated state
                if (currentPropertyId) {
                    await loadPropertyReviews(currentPropertyId);
                }
                return;
            }

            if (data.liked) {
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
                heartIcon.style.color = '#ffd700';
                userLikedReviews.push(reviewId);
            } else {
                heartIcon.classList.remove('fas');
                heartIcon.classList.add('far');
                heartIcon.style.color = '';
                userLikedReviews = userLikedReviews.filter(id => id !== reviewId);
            }

            likeCount.textContent = data.likes;

            // Update the review in allReviews array
            const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
            if (reviewIndex !== -1) {
                allReviews[reviewIndex].likes = data.likes;
            }

            // Show success message
            showToast(data.message || (data.liked ? 'Review liked' : 'Review unliked'), 'success');
        } else {
            const errorMsg = data.error || data.message || 'Failed to like review';
            console.error('Like failed:', errorMsg);
            showToast(errorMsg, 'error');
        }
    } catch (error) {
        console.error('Error liking review:', error);
        showToast(error.message || 'An error occurred', 'error');
    }
}

// Render a single review
function renderSingleReview(review) {
    // User images are stored as /hauzisha/uploads/filename.jpg
    // If no image or path looks like a property image, use default
    let imagePath = 'images/male_cv.jpg';
    if (review.image && review.image.includes('/uploads/') && !review.image.includes('/uploads/properties/')) {
        imagePath = review.image.startsWith('/hauzisha/') ? review.image : '/hauzisha' + review.image;
    }

    const fullName = `${review.firstname || ''} ${review.lastname || ''}`.trim() || 'Anonymous';
    const reviewDate = review.created_at ? new Date(review.created_at).toDateString() : '';
    const isLoggedIn = document.body.dataset.loggedIn === 'true';
    const isLiked = userLikedReviews.includes(review.id);
    const heartClass = isLiked ? 'fas' : 'far';
    const heartColor = isLiked ? '#ffd700' : '';

    // Get replies for this review
    const replies = review.replies || [];

    return `
        <div class="property-review mb-3" data-review-id="${review.id}">
            <div class="property-review-child">
                <div class="agent-info">
                    <img src="${imagePath}" class="agent-img" style="width: 40px; height: 40px;" onerror="this.src='images/male_cv.jpg'">
                    <div class="reviewer">
                        <p class="name">${fullName}</p>
                    </div>
                </div>
            </div>
            ${review.review ? `
                <div class="property-comment"><p>${review.review}</p></div>
            ` : ''}
            ${review.rating ? `
                <div class="review-stars-display" style="margin-bottom: 12px;">
                    ${renderReviewStars(review.rating)}
                </div>
            ` : ''}
            <div class="comment-meta mb-2" style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <p class="like-button" data-review-id="${review.id}" style="cursor: ${isLoggedIn ? 'pointer' : 'default'}; margin: 0;">
                        <i class="${heartClass} fa-heart" style="color: ${heartColor};"></i>
                        ${(review.likes && review.likes > 0) ? `<span class="like-count">${review.likes}</span>` : ''}
                    </p>
                    ${isLoggedIn ? `
                        <button class="reply-button" data-review-id="${review.id}" style="background: none; border: none; font-weight: 600; color: #ffd700; cursor: pointer; font-size: 0.82rem; padding: 0; margin: 0; display: flex; align-items: center; gap: 0.3rem;">
                            <i class="fa fa-reply mb-1" aria-hidden="true"></i> Reply
                        </button>
                    ` : ''}
                </div>
                <p style="margin: 0; color: #999999; font-size: 0.75rem;">${reviewDate}</p>
            </div>
            
            <!-- Reply form (hidden by default) -->
            <div class="reply-form" id="reply-form-${review.id}" style="display: none; margin-top: 0.5rem; margin-left: 3rem;">
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <input type="text" class="reply-input" placeholder="Write a reply..." style="flex: 1; background: #222; border: 1px solid #444; border-radius: 20px; padding: 6px 12px; color: #ccc; font-size: 0.8rem;">
                    <button class="submit-reply-btn" data-review-id="${review.id}" style="background: none; border: none; color: #0095f6; font-size: 1.2rem; cursor: pointer;">
                        <i class="fas fa-arrow-up"></i>
                    </button>

                    
                </div>
            </div>
            
            <!-- Replies -->
            ${replies.length > 0 ? `
                <div class="review-replies" style="margin-left: 50px; margin-top: 1rem; border-left: 2px solid #333; padding-left: 1rem;">
                    ${replies.map(reply => renderReply(reply)).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// Render a reply
function renderReply(reply) {
    let imagePath = 'images/male_cv.jpg';
    if (reply.image && reply.image.includes('/uploads/') && !reply.image.includes('/uploads/properties/')) {
        imagePath = reply.image.startsWith('/hauzisha/') ? reply.image : '/hauzisha' + reply.image;
    }

    const fullName = `${reply.firstname || ''} ${reply.lastname || ''}`.trim() || 'Anonymous';
    const replyDate = reply.created_at ? new Date(reply.created_at).toDateString() : '';

    return `
        <div class="review-reply mb-2" style="font-size: 0.9rem;">
            <div style="display: flex; gap: 0.5rem; align-items: start;">
                <img src="${imagePath}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;" onerror="this.src='images/male_cv.jpg'">
                <div style="flex: 1;">
                    <p style="margin: 0; font-weight: bold; color: #ffd700; font-size: 0.85rem;">${fullName}</p>
                    <p style="margin: 0.25rem 0; color: #ccc;">${reply.reply}</p>
                    <p style="margin: 0; font-size: 0.75rem; color: #666;">${replyDate}</p>
                </div>
            </div>
        </div>
    `;
}

// Render star rating for reviews (matches header style)
function renderReviewStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="review-star" style="color: ${i <= rating ? '#ff7b00' : '#444'};">★</span>`;
    }
    return stars;
}

// Load more reviews
function loadMoreReviews() {
    displayedReviews += REVIEWS_PER_LOAD;
    renderReviews();
}

// Show less reviews
function showLessReviews() {
    displayedReviews = 4;
    renderReviews();
    // Scroll to reviews section
    document.getElementById('reviews-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Submit review
async function submitReview(propertyId, reviewText, rating) {
    // Check if logged in
    const isLoggedIn = document.body.dataset.loggedIn === 'true';

    if (!isLoggedIn) {
        // Show login modal
        const authModal = document.getElementById('authModal');
        if (authModal) {
            const modal = new bootstrap.Modal(authModal);
            modal.show();
        } else {
            showToast('Please log in to submit a review', 'warning');
        }
        return false;
    }

    // Validate input
    if (!reviewText && !rating) {
        showToast('Please provide a review, rating, or both', 'error');
        return false;
    }

    try {
        const response = await fetch('/hauzisha/api/index.php/submit-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                property_id: propertyId,
                review: reviewText,
                rating: rating
            })
        });

        const data = await response.json();

        if (data.success) {
            // Add new review to the beginning of the array
            allReviews.unshift(data.review);
            renderReviews();

            // Update review count in the header
            if (data.total_reviews) {
                updateReviewCount(data.total_reviews);
            }

            // Clear form
            document.getElementById('reviewText').value = '';
            document.getElementById('starRating').style.display = 'none';

            // Reset stars
            const starContainer = document.getElementById('starRating');
            if (starContainer) {
                starContainer.querySelectorAll('.star').forEach(s => {
                    s.classList.remove('active', 'hover');
                });
            }

            // Show success message
            showToast('Review submitted successfully!', 'success');

            // Reload property rating if rating was provided
            if (rating) {
                updatePropertyRating(propertyId);
            }

            return true;
        } else {
            showToast(data.error || 'Failed to submit review', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        showToast('An error occurred while submitting your review', 'error');
        return false;
    }
}

// Toast notification - uses the global showToast from toast.js if available
// Fallback implementation if toast.js is not loaded
if (typeof window.showToast !== 'function') {
    window.showToast = function (message, type = 'success', duration = 3000) {
        // Add CSS animations if not already added
        if (!document.getElementById('toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(400px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8';
        toast.style.cssText = `
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
            min-width: 250px;
        `;
        toast.textContent = message;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };
}

// Load user profile picture for review form
async function loadUserProfilePicture() {
    const isLoggedIn = document.body.dataset.loggedIn === 'true';
    if (!isLoggedIn) return;

    try {
        const response = await fetch('/hauzisha/api/index.php/get-user-profile');
        const data = await response.json();

        if (data.success && data.user) {
            const profileImg = document.querySelector('.ig-comment-box img');
            if (profileImg && data.user.image) {
                const imagePath = data.user.image.startsWith('/hauzisha/') ?
                    data.user.image : '/hauzisha' + data.user.image;
                profileImg.src = imagePath;
            }
        }
    } catch (error) {
        console.error('Error loading user profile picture:', error);
    }
}

// Initialize review form
function initializeReviewForm(propertyId) {
    console.log('Initializing review form for property:', propertyId);

    const reviewInput = document.getElementById('reviewText');
    const starContainer = document.getElementById('starRating');
    const postBtn = document.getElementById('postReviewBtn');

    if (!reviewInput || !starContainer || !postBtn) {
        console.error('Missing form elements');
        return;
    }

    // Load user profile picture
    loadUserProfilePicture();

    let selectedRating = 0;

    // Create simple star rating HTML (no Font Awesome)
    function createStarRating() {
        starContainer.innerHTML = `
            <div class="simple-star-rating">
                <span class="star" data-rating="1">★</span>
                <span class="star" data-rating="2">★</span>
                <span class="star" data-rating="3">★</span>
                <span class="star" data-rating="4">★</span>
                <span class="star" data-rating="5">★</span>
            </div>
        `;

        // Add CSS for stars if not already added
        if (!document.getElementById('simple-star-css')) {
            const style = document.createElement('style');
            style.id = 'simple-star-css';
            style.textContent = `
                .simple-star-rating {
                    display: flex;
                    gap: 2px;
                }
                .star {
                    font-size: 1.2rem;
                    color: #555;
                    cursor: pointer;
                    transition: color 0.2s ease, transform 0.2s ease;
                    user-select: none;
                }
                .star:hover {
                    transform: scale(1.1);
                }
                .star.active {
                    color: #ff7b00;
                }
                .star.hover {
                    color: #ff7b00;
                }
                .review-stars-display {
                    display: flex;
                    gap: 2px;
                    align-items: center;
                }
                .review-star {
                    font-size: 0.9rem;
                    line-height: 1;
                }
            `;
            document.head.appendChild(style);
        }

        attachStarListeners();
    }

    // Show/hide stars when typing
    reviewInput.addEventListener('input', () => {
        const shouldShow = reviewInput.value.trim().length > 0;
        starContainer.style.display = shouldShow ? 'block' : 'none';

        if (shouldShow && !starContainer.querySelector('.simple-star-rating')) {
            createStarRating();
        }

        if (!reviewInput.value.trim()) {
            selectedRating = 0;
            updateStarDisplay();
        }
    });

    // Function to attach star listeners
    function attachStarListeners() {
        const stars = starContainer.querySelectorAll('.star');

        stars.forEach((star, index) => {
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.dataset.rating);
                highlightStars(rating);
            });

            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.rating);
                updateStarDisplay();
                console.log('Selected rating:', selectedRating);
            });

            star.addEventListener('mouseleave', () => {
                updateStarDisplay();
            });
        });
    }

    // Highlight stars on hover
    function highlightStars(rating) {
        const stars = starContainer.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.classList.remove('hover');
            if (index < rating) {
                star.classList.add('hover');
            }
        });
    }

    // Update star display based on selected rating
    function updateStarDisplay() {
        const stars = starContainer.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.classList.remove('active', 'hover');
            if (index < selectedRating) {
                star.classList.add('active');
            }
        });
    }

    // Submit review
    postBtn.addEventListener('click', async () => {
        const reviewText = reviewInput.value.trim();
        const rating = selectedRating > 0 ? selectedRating : null;

        console.log('Submitting review:', { reviewText, rating });

        if (!reviewText && !rating) {
            showToast('Please write a review or select a rating', 'error');
            return;
        }

        const success = await submitReview(propertyId, reviewText, rating);
        if (success) {
            // Reset form
            selectedRating = 0;
            updateStarDisplay();
        }
    });

    // Also allow Enter key to submit
    reviewInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            postBtn.click();
        }
    });
}

// Update review count in the page header
function updateReviewCount(count) {
    // Update in the reviews section header
    const reviewsHeader = document.querySelector('.details-reviews h3');
    if (reviewsHeader) {
        reviewsHeader.textContent = `(${count} review${count !== 1 ? 's' : ''})`;
    }

    // Update in any other places that show review count
    document.querySelectorAll('[data-review-count]').forEach(el => {
        el.textContent = count;
        el.setAttribute('data-review-count', count);
    });
}

// Export functions
window.loadPropertyReviews = loadPropertyReviews;
window.initializeReviewForm = initializeReviewForm;
window.updateReviewCount = updateReviewCount;
