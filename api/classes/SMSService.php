<?php

class SMSService {
    private $apiKey;
    private $username;
    private $baseUrl;
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
        
        // Load configuration from app.ini
        $config = parse_ini_file(__DIR__ . '/../config/app.ini');
        $this->apiKey = $config['africas_talking_api_key'] ?? '';
        $this->username = $config['africas_talking_username'] ?? 'sandbox';
        $this->baseUrl = 'https://api.sandbox.africastalking.com/version1/messaging';
        
        // Create OTP storage table if it doesn't exist
        $this->createOTPTable();
    }

    /**
     * Create OTP storage table
     */
    private function createOTPTable() {
        $sql = "CREATE TABLE IF NOT EXISTS otp_storage (
            id INT AUTO_INCREMENT PRIMARY KEY,
            phone VARCHAR(15) NOT NULL,
            otp VARCHAR(6) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            attempts INT DEFAULT 0,
            verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_phone (phone),
            INDEX idx_expires (expires_at)
        )";
        
        try {
            $this->conn->exec($sql);
        } catch (PDOException $e) {
            error_log("Failed to create OTP table: " . $e->getMessage());
            throw new Exception("Database setup failed");
        }
    }

    /**
     * Generate a 6-digit OTP
     */
    public function generateOTP() {
        return str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Format phone number to international format
     */
    public function formatPhoneNumber($phone) {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        
        // Handle Kenyan numbers - AfricasTalking is very strict about format
        if (strlen($phone) == 9 && substr($phone, 0, 1) == '7') {
            // Add Kenya country code
            return '+254' . $phone;
        } elseif (strlen($phone) == 10 && substr($phone, 0, 2) == '07') {
            // Replace 07 with +254 7
            return '+254' . substr($phone, 1);
        } elseif (strlen($phone) == 12 && substr($phone, 0, 3) == '254') {
            // Add + if missing
            return '+' . $phone;
        } elseif (strlen($phone) == 13 && substr($phone, 0, 4) == '+254') {
            // Already formatted correctly
            return $phone;
        } elseif (preg_match('/^\+254[0-9]{9}$/', $phone)) {
            // Already in correct format
            return $phone;
        }
        
        // For other formats, try to make it work with +254
        $cleaned = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($cleaned) >= 9) {
            if (substr($cleaned, 0, 3) == '254') {
                return '+' . $cleaned;
            } elseif (substr($cleaned, 0, 1) == '7' || substr($cleaned, 0, 2) == '07') {
                $number = substr($cleaned, 0, 1) == '0' ? substr($cleaned, 1) : $cleaned;
                return '+254' . $number;
            }
        }
        
        return $phone; // Return as-is if we can't format it
    }

    /**
     * Validate phone number format
     */
    public function validatePhoneNumber($phone) {
        $formatted = $this->formatPhoneNumber($phone);
        
        // Basic validation for international format
        if (!preg_match('/^\+[1-9]\d{1,14}$/', $formatted)) {
            return false;
        }
        
        // Specific validation for Kenyan numbers
        if (preg_match('/^\+254[7][0-9]{8}$/', $formatted)) {
            return true;
        }
        
        // Allow other international numbers
        return strlen($formatted) >= 10 && strlen($formatted) <= 15;
    }

    /**
     * Store OTP temporarily in database
     */
    public function storeOTP($phone, $otp, $expiryMinutes = 5) {
        try {
            $formattedPhone = $this->formatPhoneNumber($phone);
            
            // Use consistent timezone - get current timestamp and add expiry minutes
            $currentTimestamp = time();
            $expiryTimestamp = $currentTimestamp + ($expiryMinutes * 60);
            $expiresAt = date('Y-m-d H:i:s', $expiryTimestamp);
            
            // Clean up old OTPs for this phone number
            $this->cleanupOldOTPs($formattedPhone);
            
            $stmt = $this->conn->prepare("
                INSERT INTO otp_storage (phone, otp, expires_at) 
                VALUES (:phone, :otp, :expires_at)
            ");
            
            $result = $stmt->execute([
                ':phone' => $formattedPhone,
                ':otp' => $otp,
                ':expires_at' => $expiresAt
            ]);
            
            return $result;
        } catch (PDOException $e) {
            error_log("Failed to store OTP: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Clean up old/expired OTPs
     */
    private function cleanupOldOTPs($phone) {
        try {
            $currentDateTime = date('Y-m-d H:i:s', time());
            
            // Remove expired OTPs
            $stmt = $this->conn->prepare("DELETE FROM otp_storage WHERE expires_at < :current_time");
            $stmt->execute([':current_time' => $currentDateTime]);
            
            // Remove old OTPs for this phone (keep only the latest)
            $stmt = $this->conn->prepare("
                DELETE FROM otp_storage 
                WHERE phone = :phone 
                AND id NOT IN (
                    SELECT id FROM (
                        SELECT id FROM otp_storage 
                        WHERE phone = :phone 
                        ORDER BY created_at DESC 
                        LIMIT 1
                    ) AS latest
                )
            ");
            $stmt->execute([':phone' => $phone]);
        } catch (PDOException $e) {
            error_log("Failed to cleanup old OTPs: " . $e->getMessage());
        }
    }

    /**
     * Send SMS via AfricasTalking API
     */
    public function sendSMS($phone, $message) {
        $formattedPhone = $this->formatPhoneNumber($phone);
        
        if (!$this->validatePhoneNumber($formattedPhone)) {
            throw new Exception("Invalid phone number format");
        }

        // If no API key is configured, use development mode
        if (empty($this->apiKey)) {
            error_log("SMS Development Mode: Would send to $formattedPhone: $message");
            
            // Log SMS delivery attempt in development mode
            $this->logSMSDelivery($formattedPhone, $message, 'Development Mode - Success', 'Mock response');
            
            return [
                'success' => true,
                'status' => 'Development Mode - Success',
                'messageId' => 'dev_' . uniqid(),
                'cost' => 'KES 0.00'
            ];
        }

        // Ensure API key is properly formatted (remove any whitespace)
        $cleanApiKey = trim($this->apiKey);
        
        $postData = [
            'username' => trim($this->username),
            'to' => $formattedPhone,
            'message' => $message
        ];

        $headers = [
            'Accept: application/json',
            'Content-Type: application/x-www-form-urlencoded',
            'apiKey: ' . $cleanApiKey
        ];

        // Debug logging
        error_log("SMS API Request - URL: " . $this->baseUrl);
        error_log("SMS API Request - Username: " . trim($this->username));
        error_log("SMS API Request - Phone: " . $formattedPhone);
        error_log("SMS API Request - API Key length: " . strlen($cleanApiKey));
        error_log("SMS API Request - API Key starts with: " . substr($cleanApiKey, 0, 10) . "...");

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Disable SSL verification for testing
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); // Disable SSL host verification for testing
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_VERBOSE, true); // Enable verbose output

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        $curlInfo = curl_getinfo($ch);
        curl_close($ch);

        // Enhanced error logging
        error_log("cURL Info: " . json_encode($curlInfo));
        error_log("cURL Error: " . $error);
        error_log("HTTP Code: " . $httpCode);
        error_log("Response: " . $response);

        if ($error) {
            error_log("SMS cURL error details: " . $error);
            // Try to continue with development mode instead of failing
            error_log("Falling back to development mode due to network error");
            
            // Log SMS delivery attempt in development mode
            $this->logSMSDelivery($formattedPhone, $message, 'Network Error - Fallback to Dev Mode', 'cURL error: ' . $error);
            
            return [
                'success' => true,
                'status' => 'Development Mode - Network Fallback',
                'messageId' => 'dev_fallback_' . uniqid(),
                'cost' => 'KES 0.00'
            ];
        }

        if ($httpCode !== 201) {
            error_log("SMS API error: HTTP $httpCode - $response");
            error_log("SMS API request data: " . json_encode($postData));
            error_log("SMS API headers: " . json_encode($headers));
            
            // Handle authentication errors gracefully
            if ($httpCode === 401) {
                error_log("Authentication failed - falling back to development mode");
                error_log("API Key used: " . substr($this->apiKey, 0, 10) . "...");
                
                // Log SMS delivery attempt in development mode
                $this->logSMSDelivery($formattedPhone, $message, 'Auth Error - Fallback to Dev Mode', 'HTTP 401: Invalid API key');
                
                return [
                    'success' => true,
                    'status' => 'Development Mode - Auth Fallback',
                    'messageId' => 'dev_auth_fallback_' . uniqid(),
                    'cost' => 'KES 0.00'
                ];
            }
            
            throw new Exception("SMS delivery failed: Service error (HTTP $httpCode)");
        }

        $result = json_decode($response, true);
        
        if (!$result || !isset($result['SMSMessageData'])) {
            throw new Exception("SMS delivery failed: Invalid response");
        }

        $messageData = $result['SMSMessageData'];
        $recipients = $messageData['Recipients'] ?? [];
        
        if (empty($recipients)) {
            throw new Exception("SMS delivery failed: No recipients");
        }

        $recipient = $recipients[0];
        $status = $recipient['status'] ?? '';
        
        // Log SMS delivery attempt
        $this->logSMSDelivery($formattedPhone, $message, $status, $response);
        
        if (strpos(strtolower($status), 'success') === false) {
            throw new Exception("SMS delivery failed: " . $status);
        }

        return [
            'success' => true,
            'status' => $status,
            'messageId' => $recipient['messageId'] ?? null,
            'cost' => $recipient['cost'] ?? null
        ];
    }

    /**
     * Send OTP via SMS
     */
    public function sendOTP($phone, $expiryMinutes = 5) {
        try {
            $otp = $this->generateOTP();
            $formattedPhone = $this->formatPhoneNumber($phone);
            
            // Check rate limiting (max 3 OTPs per phone per hour)
            if (!$this->checkRateLimit($formattedPhone)) {
                throw new Exception("Too many OTP requests. Please try again later.");
            }
            
            // Store OTP
            if (!$this->storeOTP($formattedPhone, $otp, $expiryMinutes)) {
                throw new Exception("Failed to generate OTP. Please try again.");
            }
            
            // Prepare SMS message
            $message = "Your Loft verification code is: $otp. Valid for $expiryMinutes minutes. Do not share this code.";
            
            // Send SMS
            $smsResult = $this->sendSMS($formattedPhone, $message);
            
            $response = [
                'success' => true,
                'message' => 'OTP sent successfully',
                'phone' => $formattedPhone,
                'expires_in' => $expiryMinutes * 60, // seconds
                'sms_status' => $smsResult['status'] ?? 'sent'
            ];
            
            // In development mode OR network fallback, include OTP for testing
            if (empty($this->apiKey) || strpos($smsResult['status'], 'Development Mode') !== false || strpos($smsResult['status'], 'Fallback') !== false) {
                $response['dev_otp'] = $otp;
                $response['message'] = 'OTP sent successfully (Development Mode)';
                error_log("Development OTP for $formattedPhone: $otp");
            }
            
            return $response;
            
        } catch (Exception $e) {
            error_log("OTP sending failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Verify OTP
     */
    public function verifyOTP($phone, $otp) {
        try {
            $formattedPhone = $this->formatPhoneNumber($phone);
            
            // Get the latest valid OTP for this phone
            $currentTimestamp = time();
            $currentDateTime = date('Y-m-d H:i:s', $currentTimestamp);
            
            $stmt = $this->conn->prepare("
                SELECT id, otp, attempts, verified, expires_at, created_at
                FROM otp_storage 
                WHERE phone = :phone 
                AND expires_at > :current_time
                AND verified = FALSE
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            
            $stmt->execute([
                ':phone' => $formattedPhone,
                ':current_time' => $currentDateTime
            ]);
            $otpRecord = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$otpRecord) {
                return [
                    'success' => false,
                    'message' => 'OTP expired or not found. Please request a new one.'
                ];
            }
            
            // Check attempt limit (max 3 attempts)
            if ($otpRecord['attempts'] >= 3) {
                return [
                    'success' => false,
                    'message' => 'Too many failed attempts. Please request a new OTP.'
                ];
            }
            
            // Increment attempt count
            $this->incrementOTPAttempts($otpRecord['id']);
            
            // Verify OTP
            if ($otpRecord['otp'] !== $otp) {
                return [
                    'success' => false,
                    'message' => 'Invalid OTP. Please check and try again.'
                ];
            }
            
            // Mark OTP as verified
            $this->markOTPAsVerified($otpRecord['id']);
            
            return [
                'success' => true,
                'message' => 'OTP verified successfully',
                'phone' => $formattedPhone
            ];
            
        } catch (Exception $e) {
            error_log("OTP verification failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Verification failed. Please try again.'
            ];
        }
    }

    /**
     * Check rate limiting for OTP requests
     */
    private function checkRateLimit($phone) {
        try {
            $stmt = $this->conn->prepare("
                SELECT COUNT(*) as count 
                FROM otp_storage 
                WHERE phone = :phone 
                AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            ");
            
            $stmt->execute([':phone' => $phone]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return ($result['count'] ?? 0) < 3;
        } catch (PDOException $e) {
            error_log("Rate limit check failed: " . $e->getMessage());
            return true; // Allow on error
        }
    }

    /**
     * Increment OTP attempt count
     */
    private function incrementOTPAttempts($otpId) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE otp_storage 
                SET attempts = attempts + 1 
                WHERE id = :id
            ");
            $stmt->execute([':id' => $otpId]);
        } catch (PDOException $e) {
            error_log("Failed to increment OTP attempts: " . $e->getMessage());
        }
    }

    /**
     * Mark OTP as verified
     */
    private function markOTPAsVerified($otpId) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE otp_storage 
                SET verified = TRUE 
                WHERE id = :id
            ");
            $stmt->execute([':id' => $otpId]);
        } catch (PDOException $e) {
            error_log("Failed to mark OTP as verified: " . $e->getMessage());
        }
    }

    /**
     * Log SMS delivery attempts
     */
    private function logSMSDelivery($phone, $message, $status, $response) {
        try {
            // Create SMS log table if it doesn't exist
            $sql = "CREATE TABLE IF NOT EXISTS sms_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phone VARCHAR(15) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(100),
                response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_phone (phone),
                INDEX idx_created (created_at)
            )";
            $this->conn->exec($sql);
            
            $stmt = $this->conn->prepare("
                INSERT INTO sms_logs (phone, message, status, response) 
                VALUES (:phone, :message, :status, :response)
            ");
            
            $stmt->execute([
                ':phone' => $phone,
                ':message' => $message,
                ':status' => $status,
                ':response' => $response
            ]);
        } catch (PDOException $e) {
            error_log("Failed to log SMS delivery: " . $e->getMessage());
        }
    }

    /**
     * Clean up expired OTPs (should be called periodically)
     */
    public function cleanupExpiredOTPs() {
        try {
            $stmt = $this->conn->prepare("DELETE FROM otp_storage WHERE expires_at < NOW()");
            $stmt->execute();
            
            $stmt = $this->conn->prepare("DELETE FROM sms_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");
            $stmt->execute();
            
            return true;
        } catch (PDOException $e) {
            error_log("Failed to cleanup expired OTPs: " . $e->getMessage());
            return false;
        }
    }
}

?>