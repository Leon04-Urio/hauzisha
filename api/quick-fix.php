<?php
/**
 * Quick Fix - Clear bad hero_image paths and set valid gallery
 */

require_once 'config/database.php';

$db = Database::getInstance();

echo "=== QUICK FIX FOR IMAGES ===\n\n";

// Step 1: Clear all hero_image paths (they point to non-existent files)
echo "Step 1: Clearing bad hero_image paths...\n";
$stmt = $db->query("UPDATE properties SET hero_image = NULL WHERE hero_image LIKE '/uploads/properties/%'");
$cleared = $stmt->rowCount();
echo "  Cleared $cleared hero_image entries\n\n";

// Step 2: Find a valid image file to use as placeholder
$uploadFiles = glob('../uploads/*.{jpg,jpeg,png}', GLOB_BRACE);

if (count($uploadFiles) > 0) {
    $placeholderFile = str_replace('../', '/', $uploadFiles[0]);
    echo "Step 2: Using placeholder image: $placeholderFile\n\n";
    
    // Step 3: Update properties with empty or invalid galleries
    echo "Step 3: Fixing properties with empty galleries...\n";
    $stmt = $db->query("SELECT id, name, gallery FROM properties WHERE is_deleted = 0");
    $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $fixed = 0;
    foreach ($properties as $prop) {
        $gallery = json_decode($prop['gallery'], true);
        
        // If gallery is empty or invalid, set placeholder
        if (!is_array($gallery) || empty($gallery)) {
            $placeholderGallery = json_encode([$placeholderFile]);
            $updateStmt = $db->prepare("UPDATE properties SET gallery = ? WHERE id = ?");
            $updateStmt->execute([$placeholderGallery, $prop['id']]);
            echo "  Fixed property {$prop['id']}: {$prop['name']}\n";
            $fixed++;
        }
    }
    
    echo "\n  Fixed $fixed properties\n";
} else {
    echo "  ERROR: No image files found in uploads/\n";
}

echo "\n=== DONE ===\n";
echo "Refresh your website - images should now show!\n";
?>
