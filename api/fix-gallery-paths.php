<?php
require_once 'config/database.php';

$db = Database::getInstance();
$uploadDir = __DIR__ . '/../uploads/properties/';

// Make sure the uploads/properties directory exists
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

// Step 1: Find all images in uploads/
$allFiles = glob(__DIR__ . '/../uploads/*.{jpg,jpeg,png,gif}', GLOB_BRACE);
if (empty($allFiles)) {
    echo "ERROR: No image files found in uploads/ folder!\n";
    exit(1);
}

echo "Found " . count($allFiles) . " images in uploads/\n";

// Step 2: Fetch all properties
$stmt = $db->query("SELECT id, name FROM properties WHERE is_deleted = 0");
$properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Step 3: Loop through each property and assign images
foreach ($properties as $index => $prop) {
    $propId = $prop['id'];
    $propName = $prop['name'];

    echo "Processing property: {$propName} (ID: {$propId})\n";

    $newGallery = [];
    
    // Pick first N images for this property, or just assign one as placeholder
    $file = $allFiles[$index % count($allFiles)]; // simple round-robin if less images than properties

    $ext = pathinfo($file, PATHINFO_EXTENSION);
    $newFileName = uniqid() . '.' . $ext;
    $newPath = $uploadDir . $newFileName;

    if (!copy($file, $newPath)) {
        echo "  ! Failed to copy {$file}\n";
        continue;
    }

    $newGallery[] = '/uploads/properties/' . $newFileName;

    // Update gallery and hero_image
    $stmt = $db->prepare("UPDATE properties SET gallery = ?, hero_image = ? WHERE id = ?");
    $stmt->execute([json_encode($newGallery), $newGallery[0], $propId]);

    echo "  ✓ Assigned image {$newFileName} to {$propName}\n";
}

echo "\n✅ All properties fixed with proper images.\n";
