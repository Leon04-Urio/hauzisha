<?php

class PropertyImage
{
    private $conn;
    private $uploadDir = __DIR__ . '/../../uploads/properties/';

    // Image size configurations
    private $sizes = [
        'thumb' => 400,
        'md' => 1024,
        'full' => 1920
    ];

    // Valid categories
    private $validCategories = [
        'livingroom',
        'kitchen',
        'balcony',
        'bedroom1',
        'bedroom2',
        'bathroom',
        'exterior',
        'other'
    ];

    public function __construct($db)
    {
        $this->conn = $db;

        // Create upload directory if it doesn't exist
        if (!file_exists($this->uploadDir)) {
            if (!mkdir($this->uploadDir, 0755, true)) {
                throw new Exception('Failed to create upload directory: ' . $this->uploadDir);
            }
        }

        // Check if directory is writable
        if (!is_writable($this->uploadDir)) {
            throw new Exception('Upload directory is not writable: ' . $this->uploadDir);
        }
    }

    /**
     * Upload and process multiple images
     */
    public function uploadImages($propertyId, $files, $categories = [], $heroIndex = null)
    {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to upload images.');
        }

        // Validate property exists
        $stmt = $this->conn->prepare("SELECT id FROM properties WHERE id = ? AND is_deleted = 0");
        $stmt->execute([$propertyId]);
        if ($stmt->rowCount() === 0) {
            throw new Exception('Property not found.');
        }

        $uploadedImages = [];
        $errors = [];

        foreach ($files['tmp_name'] as $index => $tmpName) {
            if ($files['error'][$index] !== UPLOAD_ERR_OK) {
                $errors[] = "File {$files['name'][$index]} upload failed";
                continue;
            }

            try {
                $category = isset($categories[$index]) && in_array($categories[$index], $this->validCategories)
                    ? $categories[$index]
                    : 'other';

                $isHero = ($heroIndex !== null && $heroIndex == $index) ? 1 : 0;

                $result = $this->processAndSaveImage(
                    $tmpName,
                    $files['name'][$index],
                    $propertyId,
                    $category,
                    $isHero
                );

                $uploadedImages[] = $result;

            } catch (Exception $e) {
                $errors[] = "File {$files['name'][$index]}: " . $e->getMessage();
            }
        }

        return [
            'success' => count($uploadedImages) > 0,
            'uploaded' => $uploadedImages,
            'errors' => $errors,
            'message' => count($uploadedImages) . ' images uploaded successfully'
        ];
    }

    /**
     * Process single image: convert to WebP and create multiple sizes
     */
    /**
     * Process and save image as JPEG (for migration without WebP)
     */
    /**
     * Migrate existing gallery images (JPEG) with proper categories & hero
     */
    public function migrateGalleryImagesJPEG($propertyId)
    {
        // Fetch property gallery
        $stmt = $this->conn->prepare("SELECT gallery FROM properties WHERE id = ?");
        $stmt->execute([$propertyId]);
        $property = $stmt->fetch(PDO::FETCH_ASSOC);

        // <-- ADD THESE LINES HERE
        if (!$property || empty($property['gallery'])) {
            return ['success' => false, 'message' => 'No gallery images to migrate'];
        }

        $gallery = json_decode($property['gallery'], true);
        if (!is_array($gallery) || empty($gallery)) {
            return ['success' => false, 'message' => 'Gallery is empty or invalid'];
        }
        // <-- END OF ADDED LINES

        $migrated = 0;
        foreach ($gallery as $index => $imagePath) {
            $isHero = ($index === 0) ? 1 : 0;

            // Try to detect category from filename (optional: numbers fallback to 'other')
            $category = 'other';
            if (preg_match('/bedroom|bathroom|kitchen|livingroom|balcony|exterior/i', $imagePath, $matches)) {
                $category = strtolower($matches[0]);
            }

            $sourcePath = '../' . ltrim($imagePath, '/');
            if (!file_exists($sourcePath))
                continue;

            try {
                $this->processAndSaveImage($sourcePath, basename($imagePath), $propertyId, $category, $isHero);
                $migrated++;
            } catch (Exception $e) {
                continue;
            }
        }

        return [
            'success' => true,
            'migrated' => $migrated,
            'message' => "{$migrated} images migrated successfully"
        ];
    }





    private function processAndSaveImage($tmpPath, $originalName, $propertyId, $category, $isHero)
    {
        // Generate unique base filename
        $fileBase = uniqid() . '_' . time();

        // Load original image
        $imageInfo = getimagesize($tmpPath);
        if ($imageInfo === false) {
            throw new Exception('Invalid image file');
        }

        $mimeType = $imageInfo['mime'];
        $sourceImage = $this->createImageFromFile($tmpPath, $mimeType);

        if ($sourceImage === false) {
            throw new Exception('Failed to process image');
        }

        $originalWidth = imagesx($sourceImage);
        $originalHeight = imagesy($sourceImage);

        // Generate images in different sizes
        $generatedFiles = [];
        $lastError = '';

        foreach ($this->sizes as $sizeName => $maxWidth) {
            $filename = "{$fileBase}-{$sizeName}.jpg";
            $filepath = $this->uploadDir . $filename;

            $newWidth = min($originalWidth, $maxWidth);
            $resized = $this->resizeImage($sourceImage, $originalWidth, $originalHeight, $newWidth);

            if (!$resized) {
                $lastError = "Failed to resize image to {$sizeName}";
                continue;
            }

            $saveResult = @imagejpeg($resized, $filepath, 85);

            if ($saveResult) {
                $generatedFiles[$sizeName] = $filename;
            } else {
                $lastError = "Failed to save {$sizeName} image to {$filepath}. Check directory permissions.";
            }

            imagedestroy($resized);
        }

        imagedestroy($sourceImage);

        if (empty($generatedFiles)) {
            throw new Exception('Failed to generate image files. Last error: ' . $lastError . '. Directory: ' . $this->uploadDir . ', Writable: ' . (is_writable($this->uploadDir) ? 'yes' : 'no'));
        }

        // Get next order index for this property and category
        $stmt = $this->conn->prepare(
            "SELECT COALESCE(MAX(order_index), -1) + 1 as next_order 
         FROM property_images 
         WHERE property_id = ? AND category = ?"
        );
        $stmt->execute([$propertyId, $category]);
        $orderIndex = $stmt->fetch(PDO::FETCH_ASSOC)['next_order'];

        // If this is marked as hero, unset other hero images for this property
        if ($isHero) {
            $stmt = $this->conn->prepare("UPDATE property_images SET is_hero = 0 WHERE property_id = ?");
            $stmt->execute([$propertyId]);

            // Update properties table hero_image
            $heroFile = $generatedFiles['md'] ?? reset($generatedFiles);
            $heroPath = "/uploads/properties/{$heroFile}";
            $stmt = $this->conn->prepare("UPDATE properties SET hero_image = ? WHERE id = ?");
            $stmt->execute([$heroPath, $propertyId]);
        }

        // Insert into database
        $stmt = $this->conn->prepare(
            "INSERT INTO property_images (property_id, file_base, category, is_hero, order_index) 
         VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([$propertyId, $fileBase, $category, $isHero, $orderIndex]);

        $imageId = $this->conn->lastInsertId();

        return [
            'id' => $imageId,
            'file_base' => $fileBase,
            'category' => $category,
            'is_hero' => $isHero,
            'files' => $generatedFiles
        ];
    }


    /**
     * Create image resource from file
     */
    private function createImageFromFile($filepath, $mimeType)
    {
        switch ($mimeType) {
            case 'image/jpeg':
                return imagecreatefromjpeg($filepath);
            case 'image/png':
                return imagecreatefrompng($filepath);
            case 'image/gif':
                return imagecreatefromgif($filepath);
            case 'image/webp':
                return imagecreatefromwebp($filepath);
            default:
                return false;
        }
    }

    /**
     * Resize image maintaining aspect ratio
     */
    private function resizeImage($sourceImage, $originalWidth, $originalHeight, $maxWidth)
    {
        $ratio = $originalWidth / $originalHeight;
        $newWidth = $maxWidth;
        $newHeight = round($maxWidth / $ratio);

        $resized = imagecreatetruecolor($newWidth, $newHeight);

        // Preserve transparency for PNG/WebP
        imagealphablending($resized, false);
        imagesavealpha($resized, true);

        imagecopyresampled(
            $resized,
            $sourceImage,
            0,
            0,
            0,
            0,
            $newWidth,
            $newHeight,
            $originalWidth,
            $originalHeight
        );

        return $resized;
    }

    /**
     * Get all images for a property
     */
    public function getPropertyImages($propertyId, $groupByCategory = true)
    {
        $stmt = $this->conn->prepare(
            "SELECT id, file_base, category, is_hero, order_index, created_at 
             FROM property_images 
             WHERE property_id = ? 
             ORDER BY is_hero DESC, category, order_index"
        );
        $stmt->execute([$propertyId]);
        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Add full URLs for each size (JPEG)
        foreach ($images as &$image) {
            $image['urls'] = [
                'thumb' => "/hauzisha/uploads/properties/{$image['file_base']}-thumb.jpg",
                'md' => "/hauzisha/uploads/properties/{$image['file_base']}-md.jpg",
                'full' => "/hauzisha/uploads/properties/{$image['file_base']}-full.jpg"
            ];
            // Add thumbnail_url for backward compatibility
            $image['thumbnail_url'] = $image['urls']['thumb'];
        }

        if (!$groupByCategory) {
            return $images;
        }

        // Group by category
        $grouped = [
            'hero' => null,
            'categories' => []
        ];

        foreach ($images as $image) {
            if ($image['is_hero']) {
                $grouped['hero'] = $image;
            }

            if (!isset($grouped['categories'][$image['category']])) {
                $grouped['categories'][$image['category']] = [];
            }
            $grouped['categories'][$image['category']][] = $image;
        }

        return $grouped;
    }


    /**
     * Delete an image
     */
    public function deleteImage($imageId)
    {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to delete images.');
        }

        // Get image info
        $stmt = $this->conn->prepare("SELECT file_base, is_hero, property_id FROM property_images WHERE id = ?");
        $stmt->execute([$imageId]);
        $image = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$image) {
            throw new Exception('Image not found.');
        }

        // Delete physical files (try both .jpg and .webp)
        foreach ($this->sizes as $sizeName => $width) {
            // Try .jpg first (current system)
            $filepath = $this->uploadDir . "{$image['file_base']}-{$sizeName}.jpg";
            if (file_exists($filepath)) {
                unlink($filepath);
            }

            // Also try .webp (legacy)
            $filepath = $this->uploadDir . "{$image['file_base']}-{$sizeName}.webp";
            if (file_exists($filepath)) {
                unlink($filepath);
            }
        }

        // Delete from database
        $stmt = $this->conn->prepare("DELETE FROM property_images WHERE id = ?");
        $stmt->execute([$imageId]);

        // If this was hero image, clear hero_image in properties table
        if ($image['is_hero']) {
            $stmt = $this->conn->prepare("UPDATE properties SET hero_image = NULL WHERE id = ?");
            $stmt->execute([$image['property_id']]);
        }

        return [
            'success' => true,
            'message' => 'Image deleted successfully'
        ];
    }

    /**
     * Set image as hero
     */
    public function setHeroImage($imageId)
    {
        $stmt = $this->conn->prepare("SELECT property_id, file_base FROM property_images WHERE id = ?");
        $stmt->execute([$imageId]);
        $image = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$image) {
            throw new Exception('Image not found.');
        }

        // Unset other hero images
        $stmt = $this->conn->prepare("UPDATE property_images SET is_hero = 0 WHERE property_id = ?");
        $stmt->execute([$image['property_id']]);

        // Set this as hero
        $stmt = $this->conn->prepare("UPDATE property_images SET is_hero = 1 WHERE id = ?");
        $stmt->execute([$imageId]);

        // Update properties table
        $heroPath = isset($generatedFiles['md']) ? "/uploads/properties/{$generatedFiles['md']}" : "/uploads/properties/{$generatedFiles['thumb']}";
        $stmt = $this->conn->prepare("UPDATE properties SET hero_image = ? WHERE id = ?");
        $stmt->execute([$heroPath, $image['property_id']]);

        return [
            'success' => true,
            'message' => 'Hero image updated'
        ];
    }

    /**
     * Migrate existing gallery images to new system
     */
    public function migrateGalleryImages($propertyId)
    {
        $stmt = $this->conn->prepare("SELECT gallery FROM properties WHERE id = ?");
        $stmt->execute([$propertyId]);
        $property = $stmt->fetch(PDO::FETCH_ASSOC);

        // <-- ADD THESE LINES HERE
        if (!$property || empty($property['gallery'])) {
            return ['success' => false, 'message' => 'No gallery images to migrate'];
        }

        $gallery = json_decode($property['gallery'], true);
        if (!is_array($gallery) || empty($gallery)) {
            return ['success' => false, 'message' => 'Gallery is empty or invalid'];
        }
        // <-- END OF ADDED LINES

        $migrated = 0;
        foreach ($gallery as $index => $imagePath) {
            $isHero = ($index === 0) ? 1 : 0;
            $sourcePath = '../' . ltrim($imagePath, '/');
            if (file_exists($sourcePath)) {
                try {
                    $this->processAndSaveImage($sourcePath, basename($imagePath), $propertyId, 'other', $isHero);
                    $migrated++;
                } catch (Exception $e) {
                    continue;
                }
            }
        }

        return [
            'success' => true,
            'migrated' => $migrated,
            'message' => "{$migrated} images migrated successfully"
        ];
    }

}

?>