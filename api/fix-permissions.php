<?php
/**
 * Fix Upload Directory Permissions
 */

echo "=== FIXING PERMISSIONS ===\n\n";

$uploadDir = 'uploads/properties/';

// Check if directory exists
if (!file_exists($uploadDir)) {
    echo "Creating directory: $uploadDir\n";
    if (mkdir($uploadDir, 0755, true)) {
        echo "✓ Directory created\n";
    } else {
        echo "✗ Failed to create directory\n";
        exit(1);
    }
}

// Try to fix permissions
echo "Fixing permissions for: $uploadDir\n";
if (chmod($uploadDir, 0755)) {
    echo "✓ Permissions set to 755\n";
} else {
    echo "✗ Failed to set permissions\n";
    echo "\nPlease run manually:\n";
    echo "chmod 755 uploads/properties\n";
    exit(1);
}

// Verify it's writable now
if (is_writable($uploadDir)) {
    echo "✓ Directory is now writable\n";
    echo "\n✅ SUCCESS! Try uploading images now.\n";
} else {
    echo "✗ Directory still not writable\n";
    echo "\nPlease run manually:\n";
    echo "chmod 777 uploads/properties\n";
    exit(1);
}
?>
