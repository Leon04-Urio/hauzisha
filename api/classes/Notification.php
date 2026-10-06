<?php

require_once __DIR__ . '/../../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Notification {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }
    

    public function createNotification($data) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    
        // Only admins can broadcast
        if (empty($data['user_id']) && (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin')) {
            throw new Exception('Only admin can create broadcast notifications.');
        }
    
        if (empty($data['message'])) {
            throw new Exception('Notification message is required.');
        }
    
        if (empty($data['user_id'])) {
            // Broadcast → insert one notification per active user
            $users = $this->conn->query("SELECT id, email FROM users WHERE is_deleted = 0")->fetchAll(PDO::FETCH_ASSOC);
            foreach ($users as $user) {
                $stmt = $this->conn->prepare("
                    INSERT INTO notifications (user_id, message, type, is_read)
                    VALUES (:user_id, :message, :type, 0)
                ");
                $stmt->execute([
                    ':user_id' => $user['id'],
                    ':message' => $data['message'],
                    ':type'    => $data['type'] ?? 'system'
                ]);
    
                // send email
                $this->sendNotificationEmail($user['id'], $data['message']);
            }
        } else {
            // Single user
            $stmt = $this->conn->prepare("
                INSERT INTO notifications (user_id, message, type, is_read)
                VALUES (:user_id, :message, :type, 0)
            ");
            $stmt->execute([
                ':user_id' => $data['user_id'],
                ':message' => $data['message'],
                ':type'    => $data['type'] ?? 'system'
            ]);
    
            $this->sendNotificationEmail($data['user_id'], $data['message']);
        }
    
        return ['success' => true, 'message' => 'Notification created successfully.'];
    }    

    private function sendNotificationEmail($userId, $message) {
        // first get user email from users table
        $stmt = $this->conn->prepare("SELECT email FROM users WHERE id = :id LIMIT 1");
        $stmt->bindParam(":id", $userId);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || empty($user['email'])) return false;

        $mail = new PHPMailer(true);
        try {
            //Server settings
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com'; // or your SMTP
            $mail->SMTPAuth   = true;
            $mail->Username   = 'your_email@gmail.com';
            $mail->Password   = 'your_app_password'; // Gmail app password, not raw pw
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            //Recipients
            $mail->setFrom('your_email@gmail.com', 'Your App Name');
            $mail->addAddress($user['email']);

            //Content
            $mail->isHTML(true);
            $mail->Subject = 'New Notification';
            $mail->Body    = nl2br($message);

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Email error: {$mail->ErrorInfo}");
            return false;
        }
    }

    public function getUserNotifications() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to view notifications.');
        }

        $userId = $_SESSION['user_id'];

        $stmt = $this->conn->prepare("
            SELECT *
            FROM notifications
            WHERE user_id = :user_id
            ORDER BY created_at DESC
        ");
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();

        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'success' => true,
            'message' => 'Notifications retrieved successfully.',
            'data' => $notifications
        ];
    }

    public function markAsRead($notificationId) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in.');
        }

        $stmt = $this->conn->prepare("
            UPDATE notifications
            SET is_read = 1
            WHERE id = :id AND user_id = :user_id
        ");
        $stmt->execute([
            ':id' => $notificationId,
            ':user_id' => $_SESSION['user_id']
        ]);

        if ($stmt->rowCount() === 0) {
            throw new Exception('Notification not found or not accessible.');
        }

        return ['success' => true, 'message' => 'Notification marked as read.'];
    }

    public function getUnreadCount() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            return 0;
        }

        $stmt = $this->conn->prepare("
            SELECT COUNT(*) as count 
            FROM notifications 
            WHERE user_id = :user_id AND is_read = 0
        ");
        $stmt->execute([':user_id' => $_SESSION['user_id']]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return (int)$result['count'];
    }

    public function deleteNotification($notificationId) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admins can delete notifications.');
        }

        $stmt = $this->conn->prepare("DELETE FROM notifications WHERE id = :id");
        $stmt->execute([':id' => $notificationId]);

        return ['success' => true, 'message' => 'Notification deleted successfully.'];
    }
}
