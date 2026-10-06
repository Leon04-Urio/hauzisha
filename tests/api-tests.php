<?php
/**
 * Basic API Tests
 * Simple test suite for critical functionality
 */

class APITester {
    private $baseURL = 'http://localhost/hauzisha/api/index.php';
    private $passed = 0;
    private $failed = 0;
    private $verbose = false;
    
    public function run() {
        echo "🧪 Running API Tests...\n\n";
        
        $this->testPropertyListing();
        $this->testPropertyDetails();
        $this->testFavoritesEndpoint();
        $this->testBookingEndpoint();
        
        echo "\n" . str_repeat('=', 50) . "\n";
        echo "✅ Passed: {$this->passed}\n";
        echo "❌ Failed: {$this->failed}\n";
        echo str_repeat('=', 50) . "\n";
        
        return $this->failed === 0;
    }
    
    private function testPropertyListing() {
        echo "📋 Testing Property Listing...\n";
        
        $response = $this->makeRequest('/properties');
        
        // Check if response is valid
        $this->assert(
            !empty($response),
            'Property listing returns response'
        );
        
        // Check for success field or data field
        $hasSuccess = isset($response['success']) && $response['success'] === true;
        $hasData = isset($response['data']) && is_array($response['data']);
        
        $this->assert(
            $hasSuccess || $hasData,
            'Property listing returns success or data'
        );
        
        if (!empty($response['data'])) {
            $property = $response['data'][0];
            $this->assert(
                isset($property['id']) && isset($property['name']),
                'Property has required fields'
            );
        }
        
        echo "\n";
    }
    
    private function testPropertyDetails() {
        echo "🏠 Testing Property Details...\n";
        
        // First get a property ID
        $listResponse = $this->makeRequest('/properties');
        
        if (!empty($listResponse['data'])) {
            $propertyId = $listResponse['data'][0]['id'];
            $response = $this->makeRequest("/property/$propertyId");
            
            $this->assert(
                isset($response['success']),
                'Property details endpoint responds'
            );
            
            if ($response['success']) {
                $this->assert(
                    isset($response['property']),
                    'Property details returns property data'
                );
            }
        }
        
        echo "\n";
    }
    
    private function testFavoritesEndpoint() {
        echo "❤️ Testing Favorites Endpoint...\n";
        
        $response = $this->makeRequest('/get-favorite-ids');
        
        $this->assert(
            isset($response['success']),
            'Favorites endpoint responds'
        );
        
        echo "\n";
    }
    
    private function testBookingEndpoint() {
        echo "📅 Testing Booking Endpoint...\n";
        
        // Test that endpoint exists (will fail auth, but that's expected)
        $response = $this->makeRequest('/my-bookings');
        
        $this->assert(
            isset($response['success']) || isset($response['message']),
            'Booking endpoint responds'
        );
        
        echo "\n";
    }
    
    private function makeRequest($endpoint, $method = 'GET', $data = null) {
        $url = $this->baseURL . $endpoint;
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            }
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return json_decode($response, true) ?: [];
    }
    
    private function assert($condition, $message) {
        if ($condition) {
            echo "  ✅ $message\n";
            $this->passed++;
        } else {
            echo "  ❌ $message\n";
            $this->failed++;
        }
    }
}

// Run tests if executed directly
if (php_sapi_name() === 'cli') {
    $tester = new APITester();
    $success = $tester->run();
    exit($success ? 0 : 1);
}
