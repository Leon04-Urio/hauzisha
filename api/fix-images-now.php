<?php
/**
 * ONE-STEP FIX - Run this to fix all image issues
 */

require_once 'config/database.php';

$db = Database::getInstance();

echo "=== FIXING ALL IMAGE ISSUES ===\n\n";

// Step 1: Clear bad hero_image paths
echo "Step 1: Clearing bad hero_image paths...\n";
$stmt = $db->query("UPDATE properties SET hero_image = NULL WHERE hero_image LIKE '/uploads/properties/%'");
echo "  ✓ Cleared " . $stmt->rowCount() . " bad paths\n\n";

// Step 2: Get a valid image file
$uploadFiles = glob('../uploads/*.{jpg,jpeg,png,gif}', GLOB_BRACE);
echo "Step 2: Found " . count($uploadFiles) . " files in uploads/\n\n";

if (count($uploadFiles) == 0) {
    echo "ERROR: No image files found in uploads/ folder!\n";
    echo "Please upload some images first.\n";
    exit(1);
}

// Use first file as placeholder
$placeholderFile = str_replace('../', '/', $uploadFiles[0]);
echo "Step 3: Using placeholder: $placeholderFile\n\n";

// Step 4: Fix all properties
echo "Step 4: Fixing properties...\n";
$stmt = $db->query("SELECT id, name, gallery FROM properties WHERE is_deleted = 0");
$properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

$fixed = 0;
foreach ($properties as $prop) {
    $gallery = json_decode($prop['gallery'], true);
    
    // Check if gallery is empty or has invalid paths
    $needsFix = false;
    if (!is_array($gallery) || empty($gallery)) {
        $needsFix = true;
    } else {
        // Check if first image exists
        $firstImage = str_replace('\\', '', $gallery[0]);
        if (!file_exists('..' . $firstImage)) {
            $needsFix = true;
        }
    }
    
    if ($needsFix) {
        // Set placeholder gallery
        $newGallery = json_encode([$placeholderFile]);
        $updateStmt = $db->prepare("UPDATE properties SET gallery = ? WHERE id = ?");
        $updateStmt->execute([$newGallery, $prop['id']]);
        echo "  ✓ Fixed: {$prop['name']}\n";
        $fixed++;
    } else {
        echo "  - OK: {$prop['name']}\n";
    }
}

echo "\n=== SUMMARY ===\n";
echo "Fixed: $fixed properties\n";
echo "Total: " . count($properties) . " properties\n";
echo "\n✅ DONE! Refresh your website now.\n";
?>
