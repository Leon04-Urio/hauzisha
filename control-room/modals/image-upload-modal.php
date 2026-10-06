<!-- Property Image Upload Modal -->
<div class="modal fade" id="imageUploadModal" tabindex="-1" aria-labelledby="imageUploadModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="imageUploadModalLabel">
                    <i class="fas fa-images"></i> Upload Property Images
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="imageUploadForm" enctype="multipart/form-data">
                    <input type="hidden" name="property_id" id="uploadPropertyId">
                    
                    <!-- File Input -->
                    <div class="mb-3">
                        <label for="imageFiles" class="form-label">
                            <i class="fas fa-upload"></i> Select Images
                        </label>
                        <input type="file" 
                               name="images[]" 
                               multiple 
                               accept="image/jpeg,image/jpg,image/png,image/webp" 
                               class="form-control" 
                               id="imageFiles"
                               required>
                        <small class="form-text text-muted">
                            Select multiple images. Supported formats: JPG, PNG, WebP. 
                            Images will be automatically converted to WebP format.
                        </small>
                    </div>
                    
                    <!-- Image Preview Container -->
                    <div id="imagePreviewContainer" class="mb-3" style="max-height: 400px; overflow-y: auto;">
                        <!-- Previews will be inserted here -->
                    </div>
                    
                    <!-- Info Box -->
                    <div class="alert alert-info" style="font-size: 0.9rem;">
                        <strong><i class="fas fa-info-circle"></i> How it works:</strong>
                        <ul class="mb-0 mt-2" style="font-size: 0.85rem;">
                            <li>Select category for each image (Living Room, Kitchen, etc.)</li>
                            <li>Choose one image as "Hero" (main display image)</li>
                            <li>Images are automatically converted to WebP format</li>
                            <li>3 sizes generated: Thumbnail (400px), Medium (1024px), Full (1920px)</li>
                        </ul>
                    </div>
                    
                    <!-- Submit Button -->
                    <button type="submit" class="btn btn-primary w-100">
                        <i class="fas fa-cloud-upload-alt"></i> Upload Images
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Image Management Modal (View/Edit existing images) -->
<div class="modal fade" id="imageManageModal" tabindex="-1" aria-labelledby="imageManageModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="imageManageModalLabel">
                    <i class="fas fa-images"></i> Manage Property Images
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div id="propertyImagesContainer">
                    <!-- Images will be loaded here -->
                    <div class="text-center">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.image-preview-item {
    display: inline-block;
    margin: 10px;
    text-align: center;
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 5px;
    background: #f9f9f9;
}

.image-preview-item img {
    max-width: 150px;
    max-height: 150px;
    display: block;
    margin-bottom: 10px;
    border-radius: 3px;
}

.image-preview-item select {
    margin-bottom: 8px;
}

.image-preview-item label {
    font-size: 0.85rem;
    cursor: pointer;
    margin: 0;
}

.image-item {
    position: relative;
    display: inline-block;
}

.image-item img {
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.image-item .btn {
    font-size: 0.75rem;
    padding: 2px 6px;
}

.hero-image-section img {
    border: 3px solid #ffd700 !important;
}

.category-section {
    border-top: 1px solid #eee;
    padding-top: 15px;
}

.category-section h6 {
    color: #333;
    font-weight: 600;
    margin-bottom: 10px;
}

.images-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}
</style>
