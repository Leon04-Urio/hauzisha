<?php
/**
 * Image System Diagnostic Script
 * Run this to check the status of your image system
 */

require_once 'config/database.php';

$db = Database::getInstance();

echo "=== IMAGE SYSTEM DIAGNOSTIC ===\n\n";

// 1. Check if property_images table exists
echo "1. Checking property_images table...\n";
try {
    $stmt = $db->query("SELECT COUNT(*) as count FROM property_images");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "   ✓ Table exists with {$result['count']} records\n\n";
} catch (Exception $e) {
    echo "   ✗ Table doesn't exist or error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// 2. Check uploads/properties directory
echo "2. Checking uploads/properties directory...\n";
if (!file_exists('uploads/properties/')) {
    echo "   ✗ Directory doesn't exist\n";
    echo "   Creating directory...\n";
    if (mkdir('uploads/properties/', 0755, true)) {
        echo "   ✓ Directory created successfully\n\n";
    } else {
        echo "   ✗ Failed to create directory\n\n";
    }
} else {
    echo "   ✓ Directory exists\n";
    $files = glob('uploads/properties/*.jpg');
    echo "   Found " . count($files) . " JPEG files\n\n";
}

// 3. Check sample property images
echo "3. Checking sample property images...\n";
$stmt = $db->query("SELECT pi.*, p.name as property_name 
                    FROM property_images pi 
                    JOIN properties p ON pi.property_id = p.id 
                    LIMIT 5");
$images = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($images as $img) {
    echo "   Property: {$img['property_name']} (ID: {$img['property_id']})\n";
    echo "   File base: {$img['file_base']}\n";
    echo "   Category: {$img['category']}, Hero: " . ($img['is_hero'] ? 'Yes' : 'No') . "\n";
    
    // Check if files exist
    $thumbPath = "uploads/properties/{$img['file_base']}-thumb.jpg";
    $mdPath = "uploads/properties/{$img['file_base']}-md.jpg";
    $fullPath = "uploads/properties/{$img['file_base']}-full.jpg";
    
    echo "   Thumb: " . (file_exists($thumbPath) ? "✓ EXISTS" : "✗ MISSING") . "\n";
    echo "   Medium: " . (file_exists($mdPath) ? "✓ EXISTS" : "✗ MISSING") . "\n";
    echo "   Full: " . (file_exists($fullPath) ? "✓ EXISTS" : "✗ MISSING") . "\n";
    echo "\n";
}

// 4. Check properties with hero_image
echo "4. Checking properties with hero_image...\n";
$stmt = $db->query("SELECT id, name, hero_image FROM properties WHERE hero_image IS NOT NULL LIMIT 5");
$properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($properties as $prop) {
    echo "   Property: {$prop['name']} (ID: {$prop['id']})\n";
    echo "   Hero image path: {$prop['hero_image']}\n";
    
    $heroPath = ltrim($prop['hero_image'], '/');
    echo "   File exists: " . (file_exists($heroPath) ? "✓ YES" : "✗ NO") . "\n";
    echo "\n";
}

// 5. Check old gallery images
echo "5. Checking old gallery system...\n";
$stmt = $db->query("SELECT id, name, gallery FROM properties WHERE gallery IS NOT NULL AND gallery != '[]' LIMIT 3");
$properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($properties as $prop) {
    echo "   Property: {$prop['name']} (ID: {$prop['id']})\n";
    $gallery = json_decode($prop['gallery'], true);
    if (is_array($gallery) && count($gallery) > 0) {
        echo "   Gallery has " . count($gallery) . " images\n";
        $firstImage = ltrim($gallery[0], '/\\');
        echo "   First image: {$firstImage}\n";
        echo "   File exists: " . (file_exists($firstImage) ? "✓ YES" : "✗ NO") . "\n";
    } else {
        echo "   Gallery is empty or invalid\n";
    }
    echo "\n";
}

echo "\n=== RECOMMENDATIONS ===\n\n";

// Check if migration needs to be re-run
$stmt = $db->query("SELECT COUNT(*) as count FROM property_images");
$imageCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

$files = glob('uploads/properties/*.jpg');
$fileCount = count($files);

if ($imageCount > 0 && $fileCount == 0) {
    echo "⚠️  Database has {$imageCount} image records but no physical files found!\n";
    echo "   The migration created database entries but didn't copy the files.\n";
    echo "   \n";
    echo "   SOLUTION: The system will fall back to using the old gallery images.\n";
    echo "   Your images should still display from the /uploads/ folder.\n";
    echo "   \n";
    echo "   To fix properly:\n";
    echo "   1. Re-run migration: php api/migrate-galleries.php\n";
    echo "   2. Or upload new images through the admin panel\n";
} elseif ($imageCount > 0 && $fileCount > 0) {
    echo "✓ System looks good! {$imageCount} database records and {$fileCount} files found.\n";
} else {
    echo "ℹ️  No images in new system yet. Using old gallery system as fallback.\n";
}

echo "\n";
?>
