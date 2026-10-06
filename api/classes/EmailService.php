<?php

class EmailService {
    private $conn;
    private $smtpHost;
    private $smtpPort;
    private $smtpUsername;
    private $smtpPassword;
    private $fromEmail;
    private $fromName;

    public function __construct($db) {
        $this->conn = $db;
        
        // Load configuration from app.ini
        $config = parse_ini_file(__DIR__ . '/../config/app.ini');
        $this->smtpHost = $config['smtp_host'] ?? 'localhost';
        $this->smtpPort = $config['smtp_port'] ?? 587;
        $this->smtpUsername = $config['smtp_username'] ?? '';
        $this->smtpPassword = $config['smtp_password'] ?? '';
        $this->fromEmail = $config['from_email'] ?? 'noreply@hauzisha.com';
        $this->fromName = $config['from_name'] ?? 'Loft Studio';
        
        // Create OTP storage table if it doesn't exist
        $this->createOTPTable();
    }

    /**
     * Create OTP storage table for emails
     */
    private function createOTPTable() {
        $sql = "CREATE TABLE IF NOT EXISTS email_otp_storage (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            otp VARCHAR(6) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            attempts INT DEFAULT 0,
            verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_expires (expires_at)
        )";
        
        try {
            $this->conn->exec($sql);
        } catch (PDOException $e) {
            error_log("Failed to create email OTP table: " . $e->getMessage());
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
     * Validate email format
     */
    public function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Store OTP temporarily in database
     */
    public function storeOTP($email, $otp, $expiryMinutes = 5) {
        try {
            $email = strtolower(trim($email));
            $expiresAt = date('Y-m-d H:i:s', time() + ($expiryMinutes * 60));
            
            // Clean up old OTPs for this email
            $this->cleanupOldOTPs($email);
            
            $stmt = $this->conn->prepare("
                INSERT INTO email_otp_storage (email, otp, expires_at) 
                VALUES (:email, :otp, :expires_at)
            ");
            
            $stmt->execute([
                ':email' => $email,
                ':otp' => $otp,
                ':expires_at' => $expiresAt
            ]);
            
            return true;
        } catch (PDOException $e) {
            error_log("Failed to store email OTP: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Clean up old/expired OTPs
     */
    private function cleanupOldOTPs($email) {
        try {
            // Remove expired OTPs
            $stmt = $this->conn->prepare("DELETE FROM email_otp_storage WHERE expires_at < NOW()");
            $stmt->execute();
            
            // Remove old OTPs for this email (keep only the latest)
            $stmt = $this->conn->prepare("
                DELETE FROM email_otp_storage 
                WHERE email = :email 
                AND id NOT IN (
                    SELECT id FROM (
                        SELECT id FROM email_otp_storage 
                        WHERE email = :email 
                        ORDER BY created_at DESC 
                        LIMIT 1
                    ) AS latest
                )
            ");
            $stmt->execute([':email' => $email]);
        } catch (PDOException $e) {
            error_log("Failed to cleanup old email OTPs: " . $e->getMessage());
        }
    }

    /**
     * Send email via SMTP or PHP mail
     */
    public function sendEmail($to, $subject, $message) {
        $email = strtolower(trim($to));
        
        if (!$this->validateEmail($email)) {
            throw new Exception("Invalid email address format");
        }

        // If no SMTP configuration, use development mode
        if (empty($this->smtpUsername) || empty($this->smtpPassword)) {
            error_log("Email Development Mode: Would send to $email: $subject - $message");
            
            // Log email delivery attempt in development mode
            $this->logEmailDelivery($email, $subject, $message, 'Development Mode - Success', 'Mock response');
            
            return [
                'success' => true,
                'status' => 'Development Mode - Success',
                'messageId' => 'dev_email_' . uniqid()
            ];
        }

        // Production email sending using SMTP
        try {
            // Use PHPMailer-like approach with sockets
            $success = $this->sendViaSMTP($email, $subject, $message);
            
            if ($success) {
                $this->logEmailDelivery($email, $subject, $message, 'Success', 'SMTP success');
                return [
                    'success' => true,
                    'status' => 'Success',
                    'messageId' => 'smtp_' . uniqid()
                ];
            } else {
                throw new Exception("SMTP delivery failed");
            }
        } catch (Exception $e) {
            // Fallback to PHP mail() if SMTP fails
            $headers = [
                'From: ' . $this->fromName . ' <' . $this->fromEmail . '>',
                'Reply-To: ' . $this->fromEmail,
                'Content-Type: text/html; charset=UTF-8',
                'MIME-Version: 1.0'
            ];
            
            $success = mail($email, $subject, $message, implode("\r\n", $headers));
            
            if ($success) {
                $this->logEmailDelivery($email, $subject, $message, 'Success', 'PHP mail() fallback success');
                return [
                    'success' => true,
                    'status' => 'Success (Fallback)',
                    'messageId' => 'php_mail_' . uniqid()
                ];
            } else {
                $this->logEmailDelivery($email, $subject, $message, 'Failed', 'Both SMTP and PHP mail() failed');
                throw new Exception("Email delivery failed: " . $e->getMessage());
            }
        }
    }

    /**
     * Send OTP via Email
     */
    public function sendOTP($email, $expiryMinutes = 5) {
        try {
            $otp = $this->generateOTP();
            $email = strtolower(trim($email));
            
            // Check rate limiting (max 3 OTPs per email per hour)
            if (!$this->checkRateLimit($email)) {
                throw new Exception("Too many OTP requests. Please try again later.");
            }
            
            // Store OTP
            if (!$this->storeOTP($email, $otp, $expiryMinutes)) {
                throw new Exception("Failed to generate OTP. Please try again.");
            }
            
            // Prepare email content
            $subject = "Your Loft Verification Code";
            $message = "
                <html>
                <head>
                    <title>Loft Verification Code</title>
                </head>
                <body>
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #333;'>Your Loft Verification Code</h2>
                        <p>Your verification code is:</p>
                        <div style='background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;'>
                            $otp
                        </div>
                        <p>This code will expire in $expiryMinutes minutes.</p>
                        <p><strong>Do not share this code with anyone.</strong></p>
                        <hr style='margin: 30px 0;'>
                        <p style='color: #666; font-size: 12px;'>
                            If you didn't request this code, please ignore this email.
                        </p>
                    </div>
                </body>
                </html>
            ";
            
            // Send email
            $emailResult = $this->sendEmail($email, $subject, $message);
            
            $response = [
                'success' => true,
                'message' => 'OTP sent successfully',
                'email' => $email,
                'expires_in' => $expiryMinutes * 60, // seconds
                'email_status' => $emailResult['status'] ?? 'sent'
            ];
            
            // In development mode (no SMTP config), include OTP for testing
            if (empty($this->smtpUsername) || empty($this->smtpPassword)) {
                $response['dev_otp'] = $otp;
                $response['message'] = 'OTP sent successfully (Development Mode)';
                error_log("Development Email OTP for $email: $otp");
            }
            
            return $response;
            
        } catch (Exception $e) {
            error_log("Email OTP sending failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Verify OTP
     */
    public function verifyOTP($email, $otp) {
        try {
            $email = strtolower(trim($email));
            
            // Get the latest valid OTP for this email - use consistent timezone approach
            $currentTimestamp = time();
            $currentDateTime = date('Y-m-d H:i:s', $currentTimestamp);
            
            $stmt = $this->conn->prepare("
                SELECT id, otp, attempts, verified, expires_at, created_at
                FROM email_otp_storage 
                WHERE email = :email 
                AND expires_at > :current_time
                AND verified = FALSE
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            
            $stmt->execute([
                ':email' => $email,
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
                'email' => $email
            ];
            
        } catch (Exception $e) {
            error_log("Email OTP verification failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Verification failed. Please try again.'
            ];
        }
    }

    /**
     * Check rate limiting for OTP requests
     */
    private function checkRateLimit($email) {
        try {
            $stmt = $this->conn->prepare("
                SELECT COUNT(*) as count 
                FROM email_otp_storage 
                WHERE email = :email 
                AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            ");
            
            $stmt->execute([':email' => $email]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return ($result['count'] ?? 0) < 3;
        } catch (PDOException $e) {
            error_log("Email rate limit check failed: " . $e->getMessage());
            return true; // Allow on error
        }
    }

    /**
     * Increment OTP attempt count
     */
    private function incrementOTPAttempts($otpId) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE email_otp_storage 
                SET attempts = attempts + 1 
                WHERE id = :id
            ");
            $stmt->execute([':id' => $otpId]);
        } catch (PDOException $e) {
            error_log("Failed to increment email OTP attempts: " . $e->getMessage());
        }
    }

    /**
     * Mark OTP as verified
     */
    private function markOTPAsVerified($otpId) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE email_otp_storage 
                SET verified = TRUE 
                WHERE id = :id
            ");
            $stmt->execute([':id' => $otpId]);
        } catch (PDOException $e) {
            error_log("Failed to mark email OTP as verified: " . $e->getMessage());
        }
    }

    /**
     * Log email delivery attempts
     */
    private function logEmailDelivery($email, $subject, $message, $status, $response) {
        try {
            // Create email log table if it doesn't exist
            $sql = "CREATE TABLE IF NOT EXISTS email_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255),
                message TEXT NOT NULL,
                status VARCHAR(100),
                response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_created (created_at)
            )";
            $this->conn->exec($sql);
            
            $stmt = $this->conn->prepare("
                INSERT INTO email_logs (email, subject, message, status, response) 
                VALUES (:email, :subject, :message, :status, :response)
            ");
            
            $stmt->execute([
                ':email' => $email,
                ':subject' => $subject,
                ':message' => $message,
                ':status' => $status,
                ':response' => $response
            ]);
        } catch (PDOException $e) {
            error_log("Failed to log email delivery: " . $e->getMessage());
        }
    }

    /**
     * Send email via SMTP using sockets
     */
    private function sendViaSMTP($to, $subject, $message) {
        $socket = fsockopen($this->smtpHost, $this->smtpPort, $errno, $errstr, 30);
        
        if (!$socket) {
            throw new Exception("Could not connect to SMTP server: $errstr ($errno)");
        }
        
        // Read initial response
        $response = $this->readSMTPResponse($socket);
        if (!$this->isSuccessResponse($response, '220')) {
            fclose($socket);
            throw new Exception("SMTP server not ready: $response");
        }
        
        // EHLO
        fwrite($socket, "EHLO " . $this->smtpHost . "\r\n");
        $response = $this->readSMTPResponse($socket);
        if (!$this->isSuccessResponse($response, '250')) {
            fclose($socket);
            throw new Exception("EHLO failed: $response");
        }
        
        // STARTTLS
        fwrite($socket, "STARTTLS\r\n");
        $response = $this->readSMTPResponse($socket);
        if (!$this->isSuccessResponse($response, '220')) {
            fclose($socket);
            throw new Exception("STARTTLS failed: $response");
        }
        
        // Enable crypto
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fclose($socket);
            throw new Exception("Failed to enable TLS encryption");
        }
        
        // EHLO again after TLS
        fwrite($socket, "EHLO " . $this->smtpHost . "\r\n");
        $response = $this->readSMTPResponse($socket);
        if (!$this->isSuccessResponse($response, '250')) {
            fclose($socket);
            throw new Exception("EHLO after TLS failed: $response");
        }
        
        // AUTH LOGIN
        fwrite($socket, "AUTH LOGIN\r\n");
        $response = $this->readSMTPResponse($socket);
        if (!$this->isSuccessResponse($response, '334')) {
            fclose($socket);
            throw new Exception("AUTH LOGIN failed: $response");
        }
        
        // Send username
        fwrite($socket, base64_encode($this->smtpUsername) . "\r\n");
        $response = $this->readSMTPResponse($socket);
        if (!$this->isSuccessResponse($response, '334')) {
            fclose($socket);
            throw new Exception("Username authentication failed: $response");
        }
        
        // Send password
        fwrite($socket, base64_encode($this->smtpPassword) . "\r\n");
        $response = $this->readSMTPResponse($socket);
        if (!$this->isSuccessResponse($response, '235')) {
            fclose($socket);
            throw new Exception("Password authentication failed: $response");
        }
        
        // MAIL FROM
        fwrite($socket, "MAIL FROM: <" . $this->fromEmail . ">\r\n");
        $response = $this->readSMTPResponse($socket);
        if (!$this->isSuccessResponse($response, '250')) {
            fclose($socket);
            throw new Exception("MAIL FROM failed: $response");
        }
        
        // RCPT TO
        fwrite($socket, "RCPT TO: <$to>\r\n");
        $response = $this->readSMTPResponse($socket);
        if (!$this->isSuccessResponse($response, '250')) {
            fclose($socket);
            throw new Exception("RCPT TO failed: $response");
        }
        
        // DATA
        fwrite($socket, "DATA\r\n");
        $response = $this->readSMTPResponse($socket);
        if (!$this->isSuccessResponse($response, '354')) {
            fclose($socket);
            throw new Exception("DATA command failed: $response");
        }
        
        // Email headers and body
        $headers = "From: " . $this->fromName . " <" . $this->fromEmail . ">\r\n";
        $headers .= "To: <$to>\r\n";
        $headers .= "Subject: $subject\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "\r\n";
        
        fwrite($socket, $headers . $message . "\r\n.\r\n");
        $response = $this->readSMTPResponse($socket);
        if (!$this->isSuccessResponse($response, '250')) {
            fclose($socket);
            throw new Exception("Message sending failed: $response");
        }
        
        // QUIT
        fwrite($socket, "QUIT\r\n");
        fclose($socket);
        
        return true;
    }
    
    /**
     * Read SMTP response (handles multi-line responses)
     */
    private function readSMTPResponse($socket) {
        $response = '';
        do {
            $line = fgets($socket, 512);
            $response .= $line;
            // Check if this is the last line (no dash after code)
            if (preg_match('/^\d{3} /', $line)) {
                break;
            }
        } while ($line !== false);
        
        return trim($response);
    }
    
    /**
     * Check if SMTP response indicates success
     */
    private function isSuccessResponse($response, $expectedCode) {
        return strpos($response, $expectedCode) === 0;
    }

    /**
     * Clean up expired OTPs (should be called periodically)
     */
    public function cleanupExpiredOTPs() {
        try {
            $stmt = $this->conn->prepare("DELETE FROM email_otp_storage WHERE expires_at < NOW()");
            $stmt->execute();
            
            $stmt = $this->conn->prepare("DELETE FROM email_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");
            $stmt->execute();
            
            return true;
        } catch (PDOException $e) {
            error_log("Failed to cleanup expired email OTPs: " . $e->getMessage());
            return false;
        }
    }
}

?>
