<?php

class User {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }
    

    public function registerUser($data) {
        try {
            // Basic validation: email, firstname, lastname are required
            if (empty($data['email']) || empty($data['firstname']) || empty($data['lastname'])) {
                throw new Exception('Email, first name, and last name are required.');
            }
    
            // Normalize email
            $email = strtolower(trim($data['email']));
            $firstname = trim($data['firstname']);
            $lastname = trim($data['lastname']);
            $googleUid = isset($data['google_uid']) ? trim($data['google_uid']) : null;
    
            // Password is required for email/password registration
            if (empty($data['password'])) {
                throw new Exception('Password is required.');
            }
            
            $password = $data['password'];
    
            // Check if email already exists
            $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = :email");
            $stmt->execute([':email' => $email]);
    
            if ($stmt->rowCount() > 0) {
                throw new Exception('Email already exists.');
            }
    
            // Hash password securely
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
            // Insert user
            $stmt = $this->conn->prepare("
                INSERT INTO users (email, password, firstname, lastname, role, google_uid)
                VALUES (:email, :password, :firstname, :lastname, :role, :google_uid)
            ");
    
            $stmt->execute([
                ':email' => $email,
                ':password' => $hashedPassword,
                ':firstname' => $firstname,
                ':lastname' => $lastname,
                ':role' => 'user',
                ':google_uid' => $googleUid
            ]);
    
            return ['success' => true, 'message' => 'User registered successfully.'];
    
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }    

    public function loginUser($data) {
        if (!$this->conn) {
            throw new Exception('Database connection failed.');
        }
    
        if (empty($data['email']) || empty($data['password'])) {
            throw new Exception('Email and password are required.');
        }
    
        // Normalize email
        $email = strtolower(trim($data['email']));
    
        $stmt = $this->conn->prepare("
            SELECT id, email, firstname, lastname, image, password, role, created_at, is_suspended
            FROM users
            WHERE email = :email AND is_deleted = 0
            LIMIT 1
        ");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
    
        if ($stmt->rowCount() === 0) {
            throw new Exception('Email not found.');
        }
    
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user['is_suspended']) {
            throw new Exception('Account is suspended. Please contact support.');
        }
    
        if (!password_verify($data['password'], $user['password'])) {
            throw new Exception('Invalid password.');
        }
    
        return [
            'success' => true,
            'message' => 'Login successful.',
            'user_id' => $user['id'],
            'email' => $user['email'],
            'firstname' => $user['firstname'],
            'lastname' => $user['lastname'],
            'role' => $user['role'],
            'image' => $user['image'],
            'created_at' => $user['created_at']
        ];
    }

    public function loginOrRegisterGoogleUser($data) {
        if (empty($data['email']) && empty($data['google_uid']) && empty($data['uid'])) {
            throw new Exception('Email or UID is required.');
        }
    
        $email = isset($data['email']) ? strtolower(trim($data['email'])) : null;
        $googleUid = $data['google_uid'] ?? $data['uid'] ?? null;
        $firstname = $data['firstname'] ?? '';
        $lastname = $data['lastname'] ?? '';
    
        // Check if user exists by email or google_uid
        $stmt = $this->conn->prepare("
            SELECT id, email, firstname, lastname, image, role, created_at, is_suspended
            FROM users
            WHERE (email = :email OR google_uid = :google_uid) AND is_deleted = 0
            LIMIT 1
        ");
        $stmt->execute([
            ':email' => $email,
            ':google_uid' => $googleUid
        ]);
    
        if ($stmt->rowCount() > 0) {
            // User exists, check if suspended
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user['is_suspended']) {
                throw new Exception('Account is suspended. Please contact support.');
            }
            
            return [
                'success' => true,
                'message' => 'Login successful.',
                'user_id' => $user['id'],
                'email' => $user['email'],
                'firstname' => $user['firstname'],
                'lastname' => $user['lastname'],
                'role' => $user['role'],
                'image' => $user['image'],
                'created_at' => $user['created_at']
            ];
        } else {
            // User doesn't exist, create them
            $stmt = $this->conn->prepare("
                INSERT INTO users (email, firstname, lastname, role, google_uid, password)
                VALUES (:email, :firstname, :lastname, 'user', :google_uid, :password)
            ");
            $stmt->execute([
                ':email' => $email,
                ':firstname' => $firstname,
                ':lastname' => $lastname,
                ':google_uid' => $googleUid,
                ':password' => password_hash(bin2hex(random_bytes(8)), PASSWORD_DEFAULT)
            ]);
    
            $userId = $this->conn->lastInsertId();
    
            return [
                'success' => true,
                'message' => 'Account created and logged in successfully.',
                'user_id' => $userId,
                'email' => $email,
                'firstname' => $firstname,
                'lastname' => $lastname,
                'role' => 'user',
                'image' => null,
                'created_at' => date('Y-m-d H:i:s')
            ];
        }
    }        

    public function getAllUsers() {
        try {
            $stmt = $this->conn->query("
            SELECT *
            FROM users
          ");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception('Error fetching users: ' . $e->getMessage());
        }
    }

    public function getUserProfile($userId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT id, email, firstname, lastname, image, role, created_at 
                FROM users 
                WHERE id = :id AND is_deleted = 0
                LIMIT 1
            ");
            $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
            $stmt->execute();
    
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
            return $user ?: null;
    
        } catch (Exception $e) {
            throw new Exception('Error fetching user profile: ' . $e->getMessage());
        }
    }

    public function updateUser($data, $userId) {
        $setFields = [];
        $params = [];

        if (!empty($data['email'])) {
            $setFields[] = "email = :email";
            $params[':email'] = $data['email'];
        }
        if (!empty($data['firstname'])) {
            $setFields[] = "firstname = :firstname";
            $params[':firstname'] = $data['firstname'];
        }
        if (!empty($data['lastname'])) {
            $setFields[] = "lastname = :lastname";
            $params[':lastname'] = $data['lastname'];
        }
        if (!empty($data['image'])) {
            $setFields[] = "image = :image";
            $params[':image'] = $data['image'];
        }

        if (empty($setFields)) {
            throw new Exception('No fields provided for update.');
        }

        $params[':id'] = $userId;

        $setClause = implode(", ", $setFields);

        $stmt = $this->conn->prepare("UPDATE users SET $setClause WHERE id = :id");

        if ($stmt->execute($params)) {
            return ['success' => true, 'message' => 'User details updated successfully.'];
        } else {
            throw new Exception('Failed to update user details.');
        }
    }
    
    public function updatePassword($userId, $currentPassword, $newPassword) {
        try {
            // Fetch current hashed password
            $stmt = $this->conn->prepare("SELECT password FROM users WHERE id = :id");
            $stmt->execute([':id' => $userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
            if (!$user) {
                throw new Exception('User not found.');
            }
    
            if (!password_verify($currentPassword, $user['password'])) {
                throw new Exception('Current password incorrect.');
            }
    
            $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
    
            $stmt = $this->conn->prepare("UPDATE users SET password = :password WHERE id = :id");
            $stmt->execute([':password' => $newHash, ':id' => $userId]);
    
            return ['success' => true, 'message' => 'Password updated successfully.'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
    
    public function generatePasswordResetToken($email) {
        try {
            // Normalize & validate
            $email = trim(strtolower($email));
            if (empty($email)) {
                throw new Exception('Email required.');
            }
    
            // Check if user exists
            $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = :email");
            $stmt->execute([':email' => $email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
            if (!$user) {
                throw new Exception('Email not found.');
            }
    
            // Delete any existing tokens for this user (optional but best practice)
            $stmt = $this->conn->prepare("DELETE FROM password_reset_tokens WHERE user_id = :user_id");
            $stmt->execute([':user_id' => $user['id']]);
    
            // Loop to guarantee a unique token
            do {
                $token = bin2hex(random_bytes(32));
    
                // Check if token is already in use (shouldn’t happen but just in case)
                $stmt = $this->conn->prepare("SELECT COUNT(*) FROM password_reset_tokens WHERE token = :token");
                $stmt->execute([':token' => $token]);
                $count = $stmt->fetchColumn();
            } while ($count > 0);
    
            $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1 hour
    
            // Save token
            $stmt = $this->conn->prepare("
                INSERT INTO password_reset_tokens (user_id, token, expires_at)
                VALUES (:user_id, :token, :expires_at)
            ");
            $stmt->execute([
                ':user_id' => $user['id'],
                ':token' => $token,
                ':expires_at' => $expiresAt
            ]) or die(print_r($stmt->errorInfo(), true));
    
            return [
                'success' => true,
                'message' => 'Password reset link generated.',
                'token' => $token
            ];
    
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }    
    
    public function resetPassword($token, $newPassword) {
        try {
            if (empty($token) || empty($newPassword)) {
                throw new Exception('Token and new password required.');
            }
    
            // Look up token
            $stmt = $this->conn->prepare("
                SELECT user_id, expires_at 
                FROM password_reset_tokens 
                WHERE token = :token
            ");
            $stmt->execute([':token' => $token]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
            if (!$row) {
                throw new Exception('Invalid token.');
            }
    
            if (strtotime($row['expires_at']) < time()) {
                throw new Exception('Token expired.');
            }
    
            // Update password
            $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
            $stmt = $this->conn->prepare("UPDATE users SET password = :password WHERE id = :id");
            $stmt->execute([
                ':password' => $newHash,
                ':id' => $row['user_id']
            ]);
    
            // Remove used token
            $this->conn->prepare("DELETE FROM password_reset_tokens WHERE token = :token")
                ->execute([':token' => $token]);
    
            return ['success' => true, 'message' => 'Password reset successful.'];
    
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function softDeleteUser($userId) {
        // Double-check valid ID
        if (empty($userId)) {
            throw new Exception('User ID required.');
        }

        // Confirm user exists & is active
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE id = :id AND is_deleted = 0");
        $stmt->execute([':id' => $userId]);

        if ($stmt->rowCount() === 0) {
            throw new Exception('Account not found or already deleted.');
        }

        // Soft-delete user
        $stmt = $this->conn->prepare("UPDATE users SET is_deleted = 1 WHERE id = :id");
        $stmt->execute([':id' => $userId]);

        return ['success' => true, 'message' => 'Your account has been deleted.'];
    }

    public function suspendUser($data) {
        if (empty($data['user_id'])) {
            throw new Exception('User ID is required.');
        }
        if (empty($data['sus_reason'])) {
            throw new Exception('Suspension reason is required.');
        }

        // Verify that the user exists and is not already suspended.
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE id = :id AND is_deleted = 0 AND is_suspended = 0");
        $stmt->bindParam(':id', $data['user_id']);
        $stmt->execute();
        if ($stmt->rowCount() === 0) {
            throw new Exception('User not found or already suspended.');
        }

        // Update the users table: mark the user as suspended and store the sus_reason.
        $stmt = $this->conn->prepare("UPDATE users SET is_suspended = 1, sus_reason = :sus_reason WHERE id = :id");
        $stmt->bindParam(':id', $data['user_id']);
        $stmt->bindParam(':sus_reason', $data['sus_reason']);
        $stmt->execute();

        return ['success' => true, 'message' => 'User suspended successfully with the provided reason.'];
    }

    public function activateUser($userId) {
        $stmt = $this->conn->prepare("UPDATE users SET is_suspended = 0, sus_reason = NULL WHERE id = :id");
        if ($stmt->execute([':id' => $userId])) {
            return ['success' => true, 'message' => 'User activated successfully.'];
        }
        throw new Exception('Failed to activate user.');
    }
    
    public function getActiveUsersCount() {
        try {
            $stmt = $this->conn->query("SELECT COUNT(*) AS active_users FROM users WHERE is_deleted = 0");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row ? $row['active_users'] : 0;
        } catch (Exception $e) {
            throw new Exception('Error fetching active users: ' . $e->getMessage());
        }
    }

    public function getUserKPIs() {
        try {
            // Total users (all, regardless of deletion)
            $stmt = $this->conn->query("SELECT COUNT(*) AS total FROM users");
            $total = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
            // Active users (not deleted, maybe active = 1)
            $stmt = $this->conn->query("SELECT COUNT(*) AS active FROM users WHERE is_deleted = 0 AND is_suspended = 0");
            $active = (int)$stmt->fetch(PDO::FETCH_ASSOC)['active'];
    
            // Suspended users (not deleted, suspended = 1)
            $stmt = $this->conn->query("SELECT COUNT(*) AS suspended FROM users WHERE is_deleted = 0 AND is_suspended = 1");
            $suspended = (int)$stmt->fetch(PDO::FETCH_ASSOC)['suspended'];

            // Pending users (example: account_status = 'Pending')
            $stmt = $this->conn->query("SELECT COUNT(*) AS admins FROM users WHERE role = 'Admin' AND is_deleted = 0");
            $admins = (int)$stmt->fetch(PDO::FETCH_ASSOC)['admins'];
    
            // New users this month
            $stmt = $this->conn->query("
                SELECT COUNT(*) AS newThisMonth 
                FROM users 
                WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
                  AND YEAR(created_at) = YEAR(CURRENT_DATE())
                  AND is_deleted = 0
            ");
            $newThisMonth = (int)$stmt->fetch(PDO::FETCH_ASSOC)['newThisMonth'];
    
            return [
                'total' => $total,
                'active' => $active,
                'suspended' => $suspended,
                'admins' => $admins,
                'newThisMonth' => $newThisMonth,
                'activePercent' => $total ? round(($active / $total) * 100, 1) : 0,
                'newPercent' => $total ? number_format(($newThisMonth / $total) * 100, 1) : '0.0',
            ];
        } catch (Exception $e) {
            throw new Exception("Error fetching User KPIs: " . $e->getMessage());
        }
    }

    public function changePassword($userId, $currentPassword, $newPassword) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to change password.');
        }
        
        if (empty($currentPassword) || empty($newPassword)) {
            throw new Exception('All fields are required.');
        }
        
        if (strlen($newPassword) < 8) {
            throw new Exception('New password must be at least 8 characters.');
        }
        
        // Get current password hash
        $stmt = $this->conn->prepare("SELECT password FROM users WHERE id = ? AND is_deleted = 0");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            throw new Exception('User not found.');
        }
        
        // Verify current password
        if (!password_verify($currentPassword, $user['password'])) {
            throw new Exception('Current password is incorrect.');
        }
        
        // Hash new password
        $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        
        // Update password
        $stmt = $this->conn->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$newPasswordHash, $userId]);
        
        return ['success' => true, 'message' => 'Password updated successfully.'];
    }

    public function updateUserProfile($userId, $data, $files = []) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to update profile.');
        }
        
        // Validate and sanitize inputs
        $firstname = trim($data['firstname'] ?? '');
        $lastname = trim($data['lastname'] ?? '');
        $email = trim($data['email'] ?? '');
        
        // Validation
        if (empty($firstname) || empty($lastname) || empty($email)) {
            throw new Exception('All fields are required.');
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format.');
        }
        
        // Check if email is already taken by another user
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = ? AND id != ? AND is_deleted = 0");
        $stmt->execute([$email, $userId]);
        if ($stmt->fetch()) {
            throw new Exception('Email is already taken.');
        }
        
        // Handle profile picture upload
        $imagePath = null;
        if (isset($files['profile_picture']) && $files['profile_picture']['error'] === UPLOAD_ERR_OK) {
            $file = $files['profile_picture'];
            
            // Debug logging
            error_log("Profile image upload attempt - File: " . $file['name'] . ", Size: " . $file['size'] . ", Type: " . $file['type']);
            
            // Validate file type
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
            
            error_log("Detected MIME type: " . $mimeType);
            
            if (!in_array($mimeType, $allowedTypes)) {
                throw new Exception('Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.');
            }
            
            // Validate file size (5MB max)
            if ($file['size'] > 5 * 1024 * 1024) {
                throw new Exception('File size exceeds 5MB limit.');
            }
            
            // Create uploads directory if it doesn't exist
            $uploadDir = __DIR__ . '/../../uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
                error_log("Created uploads directory: " . $uploadDir);
            }
            
            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'profile_' . time() . '_' . uniqid() . '.' . $extension;
            $uploadPath = $uploadDir . $filename;
            
            error_log("Attempting to move file to: " . $uploadPath);
            
            // Move uploaded file
            if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
                $imagePath = '/hauzisha/uploads/' . $filename;
                error_log("File uploaded successfully to: " . $imagePath);
                
                // Delete old profile picture if exists
                $stmt = $this->conn->prepare("SELECT image FROM users WHERE id = ?");
                $stmt->execute([$userId]);
                $oldImage = $stmt->fetchColumn();
                
                if ($oldImage && file_exists(__DIR__ . '/../../' . str_replace('/hauzisha/', '', $oldImage))) {
                    $oldPath = __DIR__ . '/../../' . str_replace('/hauzisha/', '', $oldImage);
                    if (@unlink($oldPath)) {
                        error_log("Deleted old profile image: " . $oldPath);
                    }
                }
            } else {
                error_log("Failed to move uploaded file from " . $file['tmp_name'] . " to " . $uploadPath);
                throw new Exception('Failed to upload image.');
            }
        } else if (isset($files['profile_picture'])) {
            error_log("Profile picture upload error: " . $files['profile_picture']['error']);
        }
        
        // Update user profile
        if ($imagePath) {
            $stmt = $this->conn->prepare("
                UPDATE users 
                SET firstname = ?, lastname = ?, email = ?, image = ?, updated_at = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([$firstname, $lastname, $email, $imagePath, $userId]);
        } else {
            $stmt = $this->conn->prepare("
                UPDATE users 
                SET firstname = ?, lastname = ?, email = ?, updated_at = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([$firstname, $lastname, $email, $userId]);
        }
        
        return ['success' => true, 'message' => 'Profile updated successfully.'];
    }

    public function getUserLanguage($userId) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in.');
        }
        
        // Ensure table exists
        $this->conn->exec("CREATE TABLE IF NOT EXISTS user_preferences (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            twofa_enabled TINYINT(1) DEFAULT 0,
            language VARCHAR(10) DEFAULT 'en',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user (user_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");
        
        $stmt = $this->conn->prepare("SELECT language FROM user_preferences WHERE user_id = ?");
        $stmt->execute([$userId]);
        $prefs = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $language = $prefs ? $prefs['language'] : 'en';
        
        return ['success' => true, 'language' => $language];
    }

    public function updateUserLanguage($userId, $language) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in.');
        }
        
        // Validate language code
        $validLanguages = ['en', 'sw', 'fr', 'es', 'ar', 'zh', 'de', 'pt'];
        if (!in_array($language, $validLanguages)) {
            throw new Exception('Invalid language code.');
        }
        
        // Ensure table exists
        $this->conn->exec("CREATE TABLE IF NOT EXISTS user_preferences (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            twofa_enabled TINYINT(1) DEFAULT 0,
            language VARCHAR(10) DEFAULT 'en',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user (user_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");
        
        // Update or insert preference
        $stmt = $this->conn->prepare("
            INSERT INTO user_preferences (user_id, language) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE language = ?
        ");
        $stmt->execute([$userId, $language, $language]);
        
        return ['success' => true, 'message' => 'Language updated successfully.'];
    }

    public function checkSession() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        $logged_in = isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
        
        return [
            'logged_in' => $logged_in,
            'user_id' => $logged_in ? $_SESSION['user_id'] : null
        ];
    }

    public function get2FAStatus($userId) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in.');
        }
        
        // Ensure table exists
        $this->conn->exec("CREATE TABLE IF NOT EXISTS user_preferences (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            twofa_enabled TINYINT(1) DEFAULT 0,
            language VARCHAR(10) DEFAULT 'en',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user (user_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");
        
        // Get or create user preferences
        $stmt = $this->conn->prepare("SELECT twofa_enabled FROM user_preferences WHERE user_id = ?");
        $stmt->execute([$userId]);
        $prefs = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$prefs) {
            // Create default preferences
            $stmt = $this->conn->prepare("INSERT INTO user_preferences (user_id) VALUES (?)");
            $stmt->execute([$userId]);
            $twofaEnabled = false;
        } else {
            $twofaEnabled = (bool)$prefs['twofa_enabled'];
        }
        
        return [
            'success' => true,
            'twofa_enabled' => $twofaEnabled
        ];
    }

    public function toggle2FA($userId, $enabled) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in.');
        }
        
        $enabled = $enabled ? 1 : 0;
        
        // Ensure table exists
        $this->conn->exec("CREATE TABLE IF NOT EXISTS user_preferences (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            twofa_enabled TINYINT(1) DEFAULT 0,
            language VARCHAR(10) DEFAULT 'en',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user (user_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");
        
        // Update or insert preference
        $stmt = $this->conn->prepare("
            INSERT INTO user_preferences (user_id, twofa_enabled) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE twofa_enabled = ?
        ");
        $stmt->execute([$userId, $enabled, $enabled]);
        
        return [
            'success' => true,
            'message' => $enabled ? '2FA enabled' : '2FA disabled'
        ];
    }

    public function getReferralLink($userId) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in.');
        }
        
        // Create referrals table if it doesn't exist
        $this->conn->exec("CREATE TABLE IF NOT EXISTS referrals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            referrer_id INT NOT NULL,
            referral_code VARCHAR(50) UNIQUE NOT NULL,
            referred_email VARCHAR(255),
            referred_user_id INT DEFAULT NULL,
            status ENUM('sent', 'joined') DEFAULT 'sent',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE SET NULL
        )");
        
        // Get or create referral code for user
        $stmt = $this->conn->prepare("SELECT referral_code FROM referrals WHERE referrer_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $referralCode = $result['referral_code'];
        } else {
            // Generate unique referral code
            $referralCode = 'LOFT' . strtoupper(substr(md5($userId . time()), 0, 8));
            
            // Insert a base referral record
            $stmt = $this->conn->prepare("INSERT INTO referrals (referrer_id, referral_code) VALUES (?, ?)");
            $stmt->execute([$userId, $referralCode]);
        }
        
        // Generate referral link
        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'];
        $referralLink = $baseUrl . "/hauzisha/index.php?ref=" . $referralCode;
        
        // Get stats
        $stmt = $this->conn->prepare("
            SELECT 
                COUNT(*) as total_invites,
                SUM(CASE WHEN status = 'joined' THEN 1 ELSE 0 END) as total_joined
            FROM referrals 
            WHERE referrer_id = ?
        ");
        $stmt->execute([$userId]);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'referral_link' => $referralLink,
            'referral_code' => $referralCode,
            'stats' => [
                'total_invites' => (int)$stats['total_invites'],
                'total_joined' => (int)$stats['total_joined']
            ]
        ];
    }

    public function sendReferralEmail($userId, $email, $name = '') {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in.');
        }
        
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Valid email is required.');
        }
        
        // Get user info
        $stmt = $this->conn->prepare("SELECT firstname, lastname, email FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            throw new Exception('User not found.');
        }
        
        // Get or create referral code
        $stmt = $this->conn->prepare("SELECT referral_code FROM referrals WHERE referrer_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $referralCode = $result['referral_code'];
        } else {
            $referralCode = 'LOFT' . strtoupper(substr(md5($userId . time()), 0, 8));
        }
        
        // Create referrals table if it doesn't exist
        $this->conn->exec("CREATE TABLE IF NOT EXISTS referrals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            referrer_id INT NOT NULL,
            referral_code VARCHAR(50) NOT NULL,
            referred_email VARCHAR(255),
            referred_user_id INT DEFAULT NULL,
            status ENUM('sent', 'joined') DEFAULT 'sent',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE SET NULL
        )");
        
        // Record the referral
        $stmt = $this->conn->prepare("
            INSERT INTO referrals (referrer_id, referral_code, referred_email, status) 
            VALUES (?, ?, ?, 'sent')
        ");
        $stmt->execute([$userId, $referralCode, $email]);
        
        // Generate referral link
        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'];
        $referralLink = $baseUrl . "/hauzisha/index.php?ref=" . $referralCode;
        
        // Send email (simplified - in production use a proper email service)
        $to = $email;
        $subject = "{$user['firstname']} {$user['lastname']} invited you to join LOFT STUDIO";
        $friendName = !empty($name) ? $name : 'there';
        
        $message = "Hi {$friendName},\n\n";
        $message .= "{$user['firstname']} {$user['lastname']} has invited you to join LOFT STUDIO!\n\n";
        $message .= "LOFT STUDIO is an amazing platform for discovering and booking properties.\n\n";
        $message .= "Join using this link: {$referralLink}\n\n";
        $message .= "Best regards,\nThe LOFT STUDIO Team";
        
        $headers = "From: noreply@hauzisha.com\r\n";
        $headers .= "Reply-To: {$user['email']}\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();
        
        // Attempt to send email
        $emailSent = @mail($to, $subject, $message, $headers);
        
        return [
            'success' => true,
            'message' => 'Invitation sent successfully.',
            'email_sent' => $emailSent
        ];
    }

    public function submitSupportTicket($userId, $subject, $category, $message) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in.');
        }
        
        if (empty($subject) || empty($category) || empty($message)) {
            throw new Exception('All fields are required.');
        }
        
        // Create support_tickets table if it doesn't exist
        $this->conn->exec("CREATE TABLE IF NOT EXISTS support_tickets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            subject VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");
        
        // Insert support ticket
        $stmt = $this->conn->prepare("
            INSERT INTO support_tickets (user_id, subject, category, message) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $subject, $category, $message]);
        
        return [
            'success' => true,
            'message' => 'Support ticket submitted successfully.',
            'ticket_id' => $this->conn->lastInsertId()
        ];
    }

    /**
     * Get user by phone number
     */
    public function getUserByPhone($phone) {
        try {
            $stmt = $this->conn->prepare("
                SELECT id, email, phone, firstname, lastname, image, role, created_at, is_suspended
                FROM users 
                WHERE phone = :phone AND is_deleted = 0
                LIMIT 1
            ");
            $stmt->execute([':phone' => $phone]);
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && $user['is_suspended']) {
                throw new Exception('Account is suspended. Please contact support.');
            }
            
            return $user ?: null;
            
        } catch (Exception $e) {
            error_log("Error fetching user by phone: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get user by email address
     */
    public function getUserByEmail($email) {
        try {
            $email = strtolower(trim($email));
            
            $stmt = $this->conn->prepare("
                SELECT id, email, phone, firstname, lastname, image, role, created_at, is_suspended
                FROM users 
                WHERE email = :email AND is_deleted = 0
                LIMIT 1
            ");
            $stmt->execute([':email' => $email]);
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && $user['is_suspended']) {
                throw new Exception('Account is suspended. Please contact support.');
            }
            
            return $user ?: null;
            
        } catch (Exception $e) {
            error_log("Error fetching user by email: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Register user with phone authentication
     */
    public function registerUserWithPhone($data) {
        try {
            // Validate required fields
            if (empty($data['phone']) || empty($data['firstname']) || empty($data['lastname'])) {
                throw new Exception('Phone number, first name, and last name are required.');
            }

            $phone = trim($data['phone']);
            $firstname = trim($data['firstname']);
            $lastname = trim($data['lastname']);
            $email = isset($data['email']) ? trim($data['email']) : null;
            $authMethod = $data['auth_method'] ?? 'phone';

            // Validate phone number format
            if (!$this->validatePhoneNumber($phone)) {
                throw new Exception('Invalid phone number format.');
            }

            // Check if phone already exists
            $stmt = $this->conn->prepare("SELECT id FROM users WHERE phone = :phone AND is_deleted = 0");
            $stmt->execute([':phone' => $phone]);

            if ($stmt->rowCount() > 0) {
                throw new Exception('Phone number already registered.');
            }

            // Check if email already exists (if provided)
            if ($email) {
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    throw new Exception('Invalid email format.');
                }
                
                $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = :email AND is_deleted = 0");
                $stmt->execute([':email' => $email]);

                if ($stmt->rowCount() > 0) {
                    throw new Exception('Email already registered.');
                }
            }

            // Generate a random password for phone-only users
            $randomPassword = bin2hex(random_bytes(16));
            $hashedPassword = password_hash($randomPassword, PASSWORD_DEFAULT);

            // Insert user
            $stmt = $this->conn->prepare("
                INSERT INTO users (phone, email, password, firstname, lastname, role, auth_method)
                VALUES (:phone, :email, :password, :firstname, :lastname, :role, :auth_method)
            ");

            $stmt->execute([
                ':phone' => $phone,
                ':email' => $email,
                ':password' => $hashedPassword,
                ':firstname' => $firstname,
                ':lastname' => $lastname,
                ':role' => 'user',
                ':auth_method' => $authMethod
            ]);

            $userId = $this->conn->lastInsertId();

            return [
                'success' => true,
                'message' => 'User registered successfully.',
                'user_id' => $userId
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Register user with email authentication
     */
    public function registerUserWithEmail($data) {
        try {
            // Validate required fields
            if (empty($data['email']) || empty($data['firstname']) || empty($data['lastname'])) {
                throw new Exception('Email, first name, and last name are required.');
            }

            $email = strtolower(trim($data['email']));
            $firstname = trim($data['firstname']);
            $lastname = trim($data['lastname']);
            $phone = isset($data['phone']) ? trim($data['phone']) : null;
            $authMethod = $data['auth_method'] ?? 'email';

            // Validate email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new Exception('Invalid email format.');
            }

            // Check if email already exists
            $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = :email AND is_deleted = 0");
            $stmt->execute([':email' => $email]);

            if ($stmt->rowCount() > 0) {
                throw new Exception('Email already registered.');
            }

            // Check if phone already exists (if provided)
            if ($phone) {
                if (!$this->validatePhoneNumber($phone)) {
                    throw new Exception('Invalid phone number format.');
                }
                
                $stmt = $this->conn->prepare("SELECT id FROM users WHERE phone = :phone AND is_deleted = 0");
                $stmt->execute([':phone' => $phone]);

                if ($stmt->rowCount() > 0) {
                    throw new Exception('Phone number already registered.');
                }
            }

            // Generate a random password for email-only users
            $randomPassword = bin2hex(random_bytes(16));
            $hashedPassword = password_hash($randomPassword, PASSWORD_DEFAULT);

            // Insert user
            $stmt = $this->conn->prepare("
                INSERT INTO users (email, phone, password, firstname, lastname, role, auth_method)
                VALUES (:email, :phone, :password, :firstname, :lastname, :role, :auth_method)
            ");

            $stmt->execute([
                ':email' => $email,
                ':phone' => $phone,
                ':password' => $hashedPassword,
                ':firstname' => $firstname,
                ':lastname' => $lastname,
                ':role' => 'user',
                ':auth_method' => $authMethod
            ]);

            $userId = $this->conn->lastInsertId();

            return [
                'success' => true,
                'message' => 'User registered successfully.',
                'user_id' => $userId
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Validate phone number format
     */
    public function validatePhoneNumber($phone) {
        // Remove all non-numeric characters for validation
        $cleanPhone = preg_replace('/[^0-9+]/', '', $phone);
        
        // Basic international format validation
        if (!preg_match('/^\+[1-9]\d{1,14}$/', $cleanPhone)) {
            return false;
        }
        
        // Specific validation for Kenyan numbers
        if (preg_match('/^\+254[7][0-9]{8}$/', $cleanPhone)) {
            return true;
        }
        
        // Allow other international numbers (basic validation)
        return strlen($cleanPhone) >= 10 && strlen($cleanPhone) <= 15;
    }

    /**
     * Format phone number to international format
     */
    public function formatPhoneNumber($phone) {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Handle Kenyan numbers
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
            // Already formatted
            return $phone;
        }
        
        // For other formats, assume it's already international
        if (substr($phone, 0, 1) !== '+') {
            return '+' . $phone;
        }
        
        return $phone;
    }

    /**
     * Create unified session for all authentication methods
     */
    public function createUnifiedSession($user, $authMethod = 'email') {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['auth_method'] = $authMethod;
        $_SESSION['phone'] = $user['phone'] ?? null;
        $_SESSION['email'] = $user['email'] ?? null;
        $_SESSION['role'] = $user['role'];
        $_SESSION['firstname'] = $user['firstname'] ?? '';
        $_SESSION['lastname'] = $user['lastname'] ?? '';
        $_SESSION['login_time'] = time();

        // Set appropriate session timeout based on auth method
        $timeout = $authMethod === 'phone' ? 86400 : 604800; // 1 day vs 1 week
        $_SESSION['expires_at'] = time() + $timeout;

        return true;
    }

    /**
     * Check if session is valid and not expired
     */
    public function isSessionValid() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user_id']) || !isset($_SESSION['expires_at'])) {
            return false;
        }

        // Check if session has expired
        if (time() > $_SESSION['expires_at']) {
            $this->destroySession();
            return false;
        }

        return true;
    }

    /**
     * Destroy user session
     */
    public function destroySession() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        // Clear all session variables
        $_SESSION = array();

        // Delete the session cookie
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }

        // Destroy the session
        session_destroy();

        return true;
    }

    /**
     * Update user authentication method
     */
    public function updateAuthMethod($userId, $authMethod) {
        try {
            $validMethods = ['firebase_google', 'firebase_email', 'phone'];
            
            if (!in_array($authMethod, $validMethods)) {
                throw new Exception('Invalid authentication method.');
            }

            $stmt = $this->conn->prepare("
                UPDATE users 
                SET auth_method = :auth_method 
                WHERE id = :id AND is_deleted = 0
            ");

            $stmt->execute([
                ':auth_method' => $authMethod,
                ':id' => $userId
            ]);

            return [
                'success' => true,
                'message' => 'Authentication method updated successfully.'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Add phone number to existing user account
     */
    public function addPhoneToUser($userId, $phone) {
        try {
            $formattedPhone = $this->formatPhoneNumber($phone);
            
            if (!$this->validatePhoneNumber($formattedPhone)) {
                throw new Exception('Invalid phone number format.');
            }

            // Check if phone already exists
            $stmt = $this->conn->prepare("
                SELECT id FROM users 
                WHERE phone = :phone AND id != :user_id AND is_deleted = 0
            ");
            $stmt->execute([
                ':phone' => $formattedPhone,
                ':user_id' => $userId
            ]);

            if ($stmt->rowCount() > 0) {
                throw new Exception('Phone number already registered to another account.');
            }

            // Update user with phone number
            $stmt = $this->conn->prepare("
                UPDATE users 
                SET phone = :phone 
                WHERE id = :id AND is_deleted = 0
            ");

            $stmt->execute([
                ':phone' => $formattedPhone,
                ':id' => $userId
            ]);

            return [
                'success' => true,
                'message' => 'Phone number added successfully.',
                'phone' => $formattedPhone
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Get user's authentication methods
     */
    public function getUserAuthMethods($userId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT auth_method, email, phone, google_uid
                FROM users 
                WHERE id = :id AND is_deleted = 0
                LIMIT 1
            ");
            $stmt->execute([':id' => $userId]);
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                throw new Exception('User not found.');
            }

            $methods = [];
            
            if (!empty($user['email']) && !empty($user['google_uid'])) {
                $methods[] = 'firebase_google';
            }
            
            if (!empty($user['email']) && empty($user['google_uid'])) {
                $methods[] = 'firebase_email';
            }
            
            if (!empty($user['phone'])) {
                $methods[] = 'phone';
            }

            return [
                'success' => true,
                'auth_methods' => $methods,
                'primary_method' => $user['auth_method'] ?? 'firebase_email'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
}
?>


