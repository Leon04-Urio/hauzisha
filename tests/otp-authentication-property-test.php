<?php
/**
 * Property-Based Test for OTP Authentication
 * Feature: real-estate-platform, Property 7: Hybrid Authentication and Security
 * Validates: Requirements 7.1, 7.4, 7.5
 */

require_once __DIR__ . '/../api/config/database.php';
require_once __DIR__ . '/../api/classes/User.php';
require_once __DIR__ . '/../api/classes/SMSService.php';

class OTPAuthenticationPropertyTest {
    private $conn;
    private $userModel;
    private $smsService;
    private $passed = 0;
    private $failed = 0;
    private $iterations = 50; // Reduced for DB operations
    
    public function __construct() {
        $this->conn = Database::getInstance();
        $this->userModel = new User($this->conn);
        $this->smsService = new SMSService($this->conn);
    }
    
    public function run() {
        echo "🧪 Running OTP Authentication Property-Based Tests...\n";
        echo "Feature: real-estate-platform, Property 7: Hybrid Authentication and Security\n";
        echo "Validates: Requirements 7.1, 7.4, 7.5\n";
        echo "Iterations: {$this->iterations}\n\n";
        
        $this->testUserPhoneValidationProperty();
        $this->testPhoneUserRegistrationProperty();
        $this->testAuthMethodConsistencyProperty();
        $this->testSessionManagementProperty();
        $this->testPhoneFormattingConsistencyProperty();
        
        echo "\n" . str_repeat('=', 60) . "\n";
        echo "✅ Passed: {$this->passed}\n";
        echo "❌ Failed: {$this->failed}\n";
        echo str_repeat('=', 60) . "\n";
        
        return $this->failed === 0;
    }
    
    /**
     * Property: Phone validation should be consistent across User and SMS classes
     * For any phone number, both classes should return the same validation result
     */
    private function testUserPhoneValidationProperty() {
        echo "📱 Testing Phone Validation Consistency Property...\n";
        
        for ($i = 0; $i < $this->iterations; $i++) {
            $phone = $this->generateRandomPhoneNumber();
            
            // Property: Both classes should validate consistently
            $userValidation = $this->userModel->validatePhoneNumber($phone);
            $smsValidation = $this->smsService->validatePhoneNumber($phone);
            
            $this->assert(
                $userValidation === $smsValidation,
                "Phone validation consistent between User and SMS classes: $phone"
            );
        }
        echo "\n";
    }
    
    /**
     * Property: Phone user registration should create valid user records
     * For any valid registration data, the created user should have consistent properties
     */
    private function testPhoneUserRegistrationProperty() {
        echo "👤 Testing Phone User Registration Property...\n";
        
        for ($i = 0; $i < min(10, $this->iterations); $i++) { // Limit DB operations
            $phone = $this->generateValidKenyanPhone();
            $userData = $this->generateValidUserData($phone);
            
            // Clean up any existing user with this phone
            $this->cleanupUserByPhone($phone);
            
            // Property: Registration should succeed for valid data
            $result = $this->userModel->registerUserWithPhone($userData);
            
            $this->assert(
                $result['success'] === true,
                "Phone user registration succeeds for valid data"
            );
            
            if ($result['success']) {
                // Property: Created user should be retrievable by phone
                $retrievedUser = $this->userModel->getUserByPhone($phone);
                
                $this->assert(
                    $retrievedUser !== null,
                    "Registered user can be retrieved by phone"
                );
                
                if ($retrievedUser) {
                    // Property: Retrieved user should have correct data
                    $this->assert(
                        $retrievedUser['phone'] === $phone,
                        "Retrieved user has correct phone number"
                    );
                    
                    $this->assert(
                        $retrievedUser['firstname'] === $userData['firstname'],
                        "Retrieved user has correct first name"
                    );
                    
                    $this->assert(
                        $retrievedUser['auth_method'] === 'phone',
                        "Retrieved user has correct auth method"
                    );
                }
                
                // Clean up
                $this->cleanupUserByPhone($phone);
            }
        }
        echo "\n";
    }
    
    /**
     * Property: Authentication method updates should be consistent
     * For any user, updating auth method should be reflected in subsequent queries
     */
    private function testAuthMethodConsistencyProperty() {
        echo "🔐 Testing Auth Method Consistency Property...\n";
        
        // Create a test user
        $phone = '+254712345999';
        $userData = $this->generateValidUserData($phone);
        $this->cleanupUserByPhone($phone);
        
        $result = $this->userModel->registerUserWithPhone($userData);
        
        if ($result['success']) {
            $user = $this->userModel->getUserByPhone($phone);
            $userId = $user['id'];
            
            $authMethods = ['firebase_google', 'firebase_email', 'phone'];
            
            foreach ($authMethods as $method) {
                // Property: Auth method update should succeed
                $updateResult = $this->userModel->updateAuthMethod($userId, $method);
                
                $this->assert(
                    $updateResult['success'] === true,
                    "Auth method update succeeds for: $method"
                );
                
                // Property: Updated method should be reflected in user data
                $updatedUser = $this->userModel->getUserByPhone($phone);
                
                $this->assert(
                    $updatedUser['auth_method'] === $method,
                    "Auth method correctly updated to: $method"
                );
            }
            
            // Clean up
            $this->cleanupUserByPhone($phone);
        }
        echo "\n";
    }
    
    /**
     * Property: Session management should handle all auth methods consistently
     * For any auth method, session creation should work consistently
     */
    private function testSessionManagementProperty() {
        echo "🔒 Testing Session Management Property...\n";
        
        // Create test users with different auth methods
        $testUsers = [
            ['phone' => '+254712346001', 'auth_method' => 'phone'],
            ['phone' => '+254712346002', 'auth_method' => 'firebase_email'],
            ['phone' => '+254712346003', 'auth_method' => 'firebase_google']
        ];
        
        foreach ($testUsers as $testUser) {
            $userData = $this->generateValidUserData($testUser['phone']);
            $userData['auth_method'] = $testUser['auth_method'];
            
            $this->cleanupUserByPhone($testUser['phone']);
            
            $result = $this->userModel->registerUserWithPhone($userData);
            
            if ($result['success']) {
                $user = $this->userModel->getUserByPhone($testUser['phone']);
                
                // Property: Session creation should work for all auth methods
                $sessionResult = $this->userModel->createUnifiedSession($user, $testUser['auth_method']);
                
                $this->assert(
                    $sessionResult === true,
                    "Session creation succeeds for auth method: {$testUser['auth_method']}"
                );
                
                // Property: Session validation should work
                $isValid = $this->userModel->isSessionValid();
                
                $this->assert(
                    $isValid === true,
                    "Session validation works for auth method: {$testUser['auth_method']}"
                );
                
                // Clean up session and user
                $this->userModel->destroySession();
                $this->cleanupUserByPhone($testUser['phone']);
            }
        }
        echo "\n";
    }
    
    /**
     * Property: Phone formatting should be consistent between User and SMS classes
     * For any phone number, both classes should format it the same way
     */
    private function testPhoneFormattingConsistencyProperty() {
        echo "🔄 Testing Phone Formatting Consistency Property...\n";
        
        for ($i = 0; $i < $this->iterations; $i++) {
            $phone = $this->generateRandomPhoneNumber();
            
            // Property: Both classes should format consistently
            $userFormatted = $this->userModel->formatPhoneNumber($phone);
            $smsFormatted = $this->smsService->formatPhoneNumber($phone);
            
            $this->assert(
                $userFormatted === $smsFormatted,
                "Phone formatting consistent between User and SMS classes: $phone"
            );
        }
        echo "\n";
    }
    
    /**
     * Generate random phone number for testing
     */
    private function generateRandomPhoneNumber() {
        $formats = [
            // Valid Kenyan formats
            '+254' . '7' . str_pad(rand(10000000, 99999999), 8, '0', STR_PAD_LEFT),
            '0' . '7' . str_pad(rand(10000000, 99999999), 8, '0', STR_PAD_LEFT),
            '7' . str_pad(rand(10000000, 99999999), 8, '0', STR_PAD_LEFT),
            // Invalid formats
            '123456',
            '+1234567890123456',
            'abc123',
            '',
        ];
        
        return $formats[array_rand($formats)];
    }
    
    /**
     * Generate valid Kenyan phone number
     */
    private function generateValidKenyanPhone() {
        return '+254' . '7' . str_pad(rand(10000000, 99999999), 8, '0', STR_PAD_LEFT);
    }
    
    /**
     * Generate valid user data for testing
     */
    private function generateValidUserData($phone) {
        $firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Mary'];
        $lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
        
        return [
            'phone' => $phone,
            'firstname' => $firstNames[array_rand($firstNames)],
            'lastname' => $lastNames[array_rand($lastNames)],
            'email' => null, // Optional for phone registration
            'auth_method' => 'phone'
        ];
    }
    
    /**
     * Clean up user by phone number
     */
    private function cleanupUserByPhone($phone) {
        try {
            $stmt = $this->conn->prepare("DELETE FROM users WHERE phone = ?");
            $stmt->execute([$phone]);
        } catch (Exception $e) {
            // Ignore cleanup errors
        }
    }
    
    /**
     * Assert helper
     */
    private function assert($condition, $message) {
        if ($condition) {
            $this->passed++;
            if (rand(1, 10) === 1) { // Show some passing tests
                echo "  ✅ $message\n";
            }
        } else {
            echo "  ❌ $message\n";
            $this->failed++;
        }
    }
}

// Run tests if executed directly
if (php_sapi_name() === 'cli') {
    $tester = new OTPAuthenticationPropertyTest();
    $success = $tester->run();
    exit($success ? 0 : 1);
}
?>