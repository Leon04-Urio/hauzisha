<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Your Google Maps API Key (server-side, no referer restrictions needed)
$config = parse_ini_file(__DIR__ . '/config/app.ini');
$apiKey = $config['google_maps_api_key'] ?? '';

try {
    $input = $_GET['input'] ?? '';
    
    if (empty($input)) {
        echo json_encode([
            'success' => false,
            'message' => 'Input parameter required'
        ]);
        exit;
    }
    
    // Build Google Places Autocomplete API URL
    $url = "https://maps.googleapis.com/maps/api/place/autocomplete/json?" . http_build_query([
        'input' => $input,
        'key' => $apiKey,
        'components' => 'country:ke', // Restrict to Kenya
        'types' => '(regions)', // Focus on geographic regions
        'language' => 'en' // English results
    ]);
    
    // Make request to Google Places API
    $context = stream_context_create([
        'http' => [
            'timeout' => 5,
            'user_agent' => 'LOFT STUDIO Real Estate Platform'
        ]
    ]);
    
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        throw new Exception('Failed to fetch from Google Places API');
    }
    
    $data = json_decode($response, true);
    
    if (!$data) {
        throw new Exception('Invalid response from Google Places API');
    }
    
    // Check for API errors
    if (isset($data['status']) && $data['status'] !== 'OK' && $data['status'] !== 'ZERO_RESULTS') {
        throw new Exception('Google Places API error: ' . ($data['error_message'] ?? $data['status']));
    }
    
    // Format the response for our frontend
    $suggestions = [];
    if (isset($data['predictions']) && is_array($data['predictions'])) {
        foreach ($data['predictions'] as $prediction) {
            $suggestions[] = [
                'description' => $prediction['description'],
                'place_id' => $prediction['place_id'],
                'main_text' => $prediction['structured_formatting']['main_text'] ?? $prediction['description'],
                'secondary_text' => $prediction['structured_formatting']['secondary_text'] ?? ''
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $suggestions,
        'count' => count($suggestions)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'fallback' => true // Signal to use fallback
    ]);
}
?>