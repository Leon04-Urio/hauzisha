<?php
require_once 'config/database.php';
require_once 'classes/PropertyImage.php';

$db = Database::getInstance();
$propertyImage = new PropertyImage($db);

$stmt = $db->query("SELECT id FROM properties WHERE gallery IS NOT NULL AND gallery != ''");
$properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

$totalMigrated = 0;

foreach ($properties as $prop) {
    $result = $propertyImage->migrateGalleryImagesJPEG($prop['id']);
    echo "Property ID {$prop['id']}: {$result['message']}\n";
    $totalMigrated += $result['migrated'] ?? 0;
}

echo "\nMigration complete. Total images migrated: $totalMigrated\n";
?>
