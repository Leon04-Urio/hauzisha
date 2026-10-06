<?php
require_once 'config/database.php';
require_once 'classes/PropertyImage.php';

$db = Database::getInstance();
$propertyImage = new PropertyImage($db);

echo "=== MIGRATING OLD UPLOADS TO NEW PROPERTY IMAGES ===\n\n";

// STEP 0: Clear old images table and hero references (optional, if you want a clean start)
$db->query("DELETE FROM property_images");
$db->query("UPDATE properties SET hero_image = NULL");

echo "Cleared old property_images and hero_image paths\n\n";

// STEP 1: Fetch all properties
$stmt = $db->query("SELECT id, name FROM properties WHERE is_deleted = 0");
$properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($properties as $prop) {
    $propId = $prop['id'];
    $propName = $prop['name'];

    echo "Processing property: {$propName} (ID: {$propId})\n";

    // STEP 2: Find all old images for this property
    // Assuming old images are stored like: uploads/{propertyId}-imagename.jpg
    $pattern = __DIR__ . "/../uploads/{$propId}-*.*";
    $files = glob($pattern);

    if (empty($files)) {
        echo "  - No old images found for this property, skipping...\n\n";
        continue;
    }

    $migratedCount = 0;
    foreach ($files as $index => $filePath) {
        $isHero = ($index === 0) ? 1 : 0;

        // Detect category from filename if possible
        $filename = basename($filePath);
        $category = 'other';
        if (preg_match('/bedroom|bathroom|kitchen|livingroom|balcony|exterior/i', $filename, $matches)) {
            $category = strtolower($matches[0]);
        }

        try {
            $propertyImage->processAndSaveImage($filePath, $filename, $propId, $category, $isHero);
            $migratedCount++;
        } catch (Exception $e) {
            echo "  ! Failed to process {$filename}: " . $e->getMessage() . "\n";
            continue;
        }
    }

    echo "  ✓ Migrated {$migratedCount} images for {$propName}\n\n";
}

echo "=== MIGRATION COMPLETE ===\n";
?>
