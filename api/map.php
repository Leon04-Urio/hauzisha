<?php
// Your secret Google Maps API Key (NEVER expose in frontend)
$config = parse_ini_file(__DIR__ . '/config/app.ini');
$apiKey = $config['google_maps_api_key'] ?? '';

// Get location parameter from frontend
$location = isset($_GET['location']) ? urlencode($_GET['location']) : "";

// Build the Google Maps embed URL
$mapUrl = "https://www.google.com/maps/embed/v1/place?key={$apiKey}&q={$location}";

// Return it as JSON
header('Content-Type: application/json');
echo json_encode(["url" => $mapUrl]);
?>