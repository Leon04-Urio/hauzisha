/**
 * Property Image Upload Manager
 * Handles multi-file upload with WebP conversion and categorization
 */

// Image categories
const IMAGE_CATEGORIES = [
    { value: 'other', label: 'Other' },
    { value: 'livingroom', label: 'Living Room' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'balcony', label: 'Balcony' },
    { value: 'bedroom1', label: 'Bedroom 1' },
    { value: 'bedroom2', label: 'Bedroom 2' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'exterior', label: 'Exterior' }
];

// Open upload modal for a property
function openImageUploadModal(propertyId) {
    // Support both direct property ID and global context
    const actualPropertyId = propertyId || window.currentPropertyIdForImages;
    
    if (actualPropertyId) {
        document.getElementById('uploadPropertyId').value = actualPropertyId;
    } else {
        // For add mode, we'll create property first
        document.getElementById('uploadPropertyId').value = '';
    }
    
    document.getElementById('imagePreviewContainer').innerHTML = '';
    document.getElementById('imageUploadForm').reset();
    
    const modal = new bootstrap.Modal(document.getElementById('imageUploadModal'));
    modal.show();
}

// Handle file selection
document.getElementById('imageFiles')?.addEventListener('change', function(e) {
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = '';
    
    if (e.target.files.length === 0) return;
    
    Array.from(e.target.files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            previewItem.style.cssText = 'display: inline-block; margin: 10px; text-align: center; border: 1px solid #ddd; padding: 10px; border-radius: 5px;';
            
            previewItem.innerHTML = `
                <img src="${e.target.result}" style="max-width: 150px; max-height: 150px; display: block; margin-bottom: 10px;">
                <select name="categories[]" class="form-control form-control-sm mb-2" style="font-size: 0.85rem;">
                    ${IMAGE_CATEGORIES.map(cat => `<option value="${cat.value}">${cat.label}</option>`).join('')}
                </select>
                <label style="font-size: 0.85rem; cursor: pointer;">
                    <input type="radio" name="hero_index" value="${index}">
                    Set as Hero
                </label>
            `;
            
            container.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    });
});

// Handle form submission
document.getElementById('imageUploadForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';
    
    const formData = new FormData(this);
    const propertyId = formData.get('property_id');
    
    console.log('Form submission:');
    console.log('Property ID from form:', propertyId);
    console.log('Current mode:', window.currentImageMode);
    console.log('Global property ID:', window.currentPropertyIdForImages);
    
    // If no property ID, show detailed error
    if (!propertyId) {
        const uploadIdField = document.getElementById('uploadPropertyId');
        console.error('No property ID!');
        console.error('Field value:', uploadIdField ? uploadIdField.value : 'field not found');
        console.error('Field element:', uploadIdField);
        
        alert('Error: Property ID is missing. Please close the modal and try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }
    
    try {
        const response = await fetch('/hauzisha/api/index.php/upload-property-images', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Success! ${result.uploaded.length} images uploaded.`);
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('imageUploadModal'));
            modal.hide();
            
            // Dispatch custom event for parent page to handle
            window.dispatchEvent(new CustomEvent('imagesUploaded', {
                detail: {
                    propertyId: propertyId,
                    images: result.uploaded
                }
            }));
            
            // If on properties page, don't reload - let the event handler update the preview
            if (window.currentImageMode) {
                // Properties page will handle the update
            } else {
                // Other pages can reload
                location.reload();
            }
        } else {
            alert('Upload failed: ' + (result.error || 'Unknown error'));
            if (result.errors && result.errors.length > 0) {
                console.error('Upload errors:', result.errors);
            }
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Upload error: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Load and display property images
async function loadPropertyImages(propertyId, containerId) {
    try {
        const response = await fetch(`/hauzisha/api/index.php/get-property-images?property_id=${propertyId}`);
        const result = await response.json();
        
        if (result.success) {
            displayPropertyImages(result.images, containerId);
        }
    } catch (error) {
        console.error('Error loading images:', error);
    }
}

// Display property images
function displayPropertyImages(images, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    // Display hero image
    if (images.hero) {
        const heroSection = document.createElement('div');
        heroSection.className = 'hero-image-section mb-4';
        heroSection.innerHTML = `
            <h6>Hero Image</h6>
            <div class="image-item" style="position: relative; display: inline-block;">
                <img src="${images.hero.urls.md}" style="max-width: 200px; border: 3px solid #ffd700;">
                <span class="badge badge-warning" style="position: absolute; top: 5px; left: 5px;">HERO</span>
                <button class="btn btn-sm btn-danger" onclick="deletePropertyImage(${images.hero.id})" 
                        style="position: absolute; top: 5px; right: 5px;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(heroSection);
    }
    
    // Display images by category
    Object.keys(images.categories).forEach(category => {
        const categoryImages = images.categories[category];
        if (categoryImages.length === 0) return;
        
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section mb-4';
        categorySection.innerHTML = `
            <h6>${category.charAt(0).toUpperCase() + category.slice(1)}</h6>
            <div class="images-grid" style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${categoryImages.map(img => `
                    <div class="image-item" style="position: relative;">
                        <img src="${img.urls.thumb}" style="max-width: 150px; cursor: pointer;" 
                             onclick="viewFullImage('${img.urls.full}')">
                        ${!img.is_hero ? `
                            <button class="btn btn-sm btn-primary" onclick="setHeroImage(${img.id})" 
                                    style="position: absolute; top: 5px; left: 5px; font-size: 0.7rem;">
                                Set Hero
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-danger" onclick="deletePropertyImage(${img.id})" 
                                style="position: absolute; top: 5px; right: 5px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(categorySection);
    });
}

// Set hero image
async function setHeroImage(imageId) {
    if (!confirm('Set this image as the hero image?')) return;
    
    try {
        const response = await fetch('/hauzisha/api/index.php/set-hero-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_id: imageId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Hero image updated!');
            location.reload();
        } else {
            alert('Failed to set hero image: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error setting hero image');
    }
}

// Delete property image
async function deletePropertyImage(imageId, propertyId) {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    
    try {
        const response = await fetch(`/hauzisha/api/index.php/property-images/${imageId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Image deleted!');
            // Reload images if we have a property ID, otherwise reload page
            if (propertyId && typeof loadPropertyImages === 'function') {
                loadPropertyImages(propertyId);
            } else {
                location.reload();
            }
        } else {
            alert('Failed to delete image: ' + (result.error || result.message));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting image');
    }
}

// View full image
function viewFullImage(url) {
    window.open(url, '_blank');
}

// Export functions
window.openImageUploadModal = openImageUploadModal;
window.loadPropertyImages = loadPropertyImages;
window.setHeroImage = setHeroImage;
window.deletePropertyImage = deletePropertyImage;
window.viewFullImage = viewFullImage;

console.log('Property image upload manager loaded');
