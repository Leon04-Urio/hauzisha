<?php
/**
 * Property-Based Test for SMS Service
 * Feature: real-estate-platform, Property 7: Hybrid Authentication and Security
 * Validates: Requirements 7.1, 7.4, 7.5
 */

require_once __DIR__ . '/../api/config/database.php';
require_once __DIR__ . '/../api/classes/SMSService.php';

class SMSServicePropertyTest {
    private $conn;
    private $smsService;
    private $passed = 0;
    private $failed = 0;
    private $iterations = 100;
    
    public function __construct() {
        $this->conn = Database::getInstance();
        $this->smsService = new SMSService($this->conn);
    }
    
    public function run() {
        echo "🧪 Running SMS Service Property-Based Tests...\n";
        echo "Feature: real-estate-platform, Property 7: Hybrid Authentication and Security\n";
        echo "Validates: Requirements 7.1, 7.4, 7.5\n";
        echo "Iterations: {$this->iterations}\n\n";
        
        $this->testPhoneNumberValidationProperty();
        $this->testPhoneNumberFormattingProperty();
        $this->testOTPGenerationProperty();
        $this->testOTPStorageProperty();
        $this->testRateLimitingProperty();
        
        echo "\n" . str_repeat('=', 60) . "\n";
        echo "✅ Passed: {$this->passed}\n";
        echo "❌ Failed: {$this->failed}\n";
        echo str_repeat('=', 60) . "\n";
        
        return $this->failed === 0;
    }
    
    /**
     * Property: Phone number validation should be consistent
     * For any phone number, validation should return the same result when called multiple times
     */
    private function testPhoneNumberValidationProperty() {
        echo "📱 Testing Phone Number Validation Consistency Property...\n";
        
        for ($i = 0; $i < $this->iterations; $i++) {
            $phone = $this->generateRandomPhoneNumber();
            
            // Property: Validation should be consistent
            $result1 = $this->smsService->validatePhoneNumber($phone);
            $result2 = $this->smsService->validatePhoneNumber($phone);
            
            $this->assert(
                $result1 === $result2,
                "Phone validation consistency for: $phone"
            );
            
            // Property: Valid formatted numbers should always validate
            if (preg_match('/^\+254[7][0-9]{8}$/', $phone)) {
                $this->assert(
                    $result1 === true,
                    "Valid Kenyan number should validate: $phone"
                );
            }
        }
        echo "\n";
    }
    
    /**
     * Property: Phone number formatting should be idempotent
     * For any phone number, format(format(phone)) should equal format(phone)
     */
    private function testPhoneNumberFormattingProperty() {
        echo "🔄 Testing Phone Number Formatting Idempotent Property...\n";
        
        for ($i = 0; $i < $this->iterations; $i++) {
            $phone = $this->generateRandomPhoneNumber();
            
            // Property: Formatting should be idempotent
            $formatted1 = $this->smsService->formatPhoneNumber($phone);
            $formatted2 = $this->smsService->formatPhoneNumber($formatted1);
            
            $this->assert(
                $formatted1 === $formatted2,
                "Phone formatting idempotent for: $phone -> $formatted1"
            );
            
            // Property: Formatted numbers should start with +
            $this->assert(
                strpos($formatted1, '+') === 0,
                "Formatted number starts with +: $formatted1"
            );
        }
        echo "\n";
    }
    
    /**
     * Property: OTP generation should produce valid 6-digit codes
     * For any OTP generation, the result should be exactly 6 digits
     */
    private function testOTPGenerationProperty() {
        echo "🔐 Testing OTP Generation Property...\n";
        
        for ($i = 0; $i < $this->iterations; $i++) {
            $otp = $this->smsService->generateOTP();
            
            // Property: OTP should be exactly 6 digits
            $this->assert(
                preg_match('/^[0-9]{6}$/', $otp),
                "OTP is 6 digits: $otp"
            );
            
            // Property: OTP should be numeric
            $this->assert(
                is_numeric($otp),
                "OTP is numeric: $otp"
            );
            
            // Property: OTP should be within valid range
            $otpInt = intval($otp);
            $this->assert(
                $otpInt >= 100000 && $otpInt <= 999999,
                "OTP in valid range: $otp"
            );
        }
        echo "\n";
    }
    
    /**
     * Property: OTP storage and retrieval should be consistent
     * For any valid phone and OTP, storing then retrieving should work consistently
     */
    private function testOTPStorageProperty() {
        echo "💾 Testing OTP Storage Consistency Property...\n";
        
        for ($i = 0; $i < min(20, $this->iterations); $i++) { // Limit DB operations
            $phone = $this->generateValidKenyanPhone();
            $otp = $this->smsService->generateOTP();
            
            // Store OTP
            $stored = $this->smsService->storeOTP($phone, $otp, 5);
            
            $this->assert(
                $stored === true,
                "OTP storage succeeds for valid phone: $phone"
            );
            
            // Verify OTP immediately (should work)
            $verification = $this->smsService->verifyOTP($phone, $otp);
            
            $this->assert(
                $verification['success'] === true,
                "OTP verification succeeds immediately after storage: $phone"
            );
            
            // Clean up
            $this->cleanupOTPForPhone($phone);
        }
        echo "\n";
    }
    
    /**
     * Property: Rate limiting should prevent excessive requests
     * For any phone number, excessive OTP requests should be blocked
     */
    private function testRateLimitingProperty() {
        echo "⏱️ Testing Rate Limiting Property...\n";
        
        $testPhone = '+254712345678';
        $this->cleanupOTPForPhone($testPhone);
        
        // Property: First few requests should succeed
        $successCount = 0;
        for ($i = 0; $i < 3; $i++) {
            $result = $this->smsService->sendOTP($testPhone);
            if ($result['success']) {
                $successCount++;
            }
        }
        
        $this->assert(
            $successCount > 0,
            "At least one OTP request should succeed initially"
        );
        
        // Property: Excessive requests should be blocked
        $result = $this->smsService->sendOTP($testPhone);
        $this->assert(
            $result['success'] === false,
            "Excessive OTP requests should be blocked"
        );
        
        // Clean up
        $this->cleanupOTPForPhone($testPhone);
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
            '+1234567890123456', // Too long
            'abc123',
            '',
            '+254612345678', // Wrong prefix
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
     * Clean up OTP records for a phone number
     */
    private function cleanupOTPForPhone($phone) {
        try {
            $stmt = $this->conn->prepare("DELETE FROM otp_storage WHERE phone = ?");
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
            if (rand(1, 20) === 1) { // Show some passing tests
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
    $tester = new SMSServicePropertyTest();
    $success = $tester->run();
    exit($success ? 0 : 1);
}
?>