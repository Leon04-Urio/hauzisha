<?php

class Activity {
    private $conn;
    private $userId;

    public function __construct($db) {
        $this->conn = $db;

        // Automatically detect user if session exists
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->userId = $_SESSION['user_id'] ?? null;
    }

    /**
     * Logs an activity. If no user is logged in, logs as anonymous.
     * @param string $action Description of action
     * @param int|null $referenceId Optional reference ID (property, model, booking)
     * @param string|null $referenceType Optional reference type
     */
    
    public function logActivity($action, $referenceId = null, $referenceType = null) {
        if (empty($action)) {
            throw new Exception("Action cannot be empty");
        }

        $query = "INSERT INTO activities (user_id, action, reference_id, reference_type) 
                  VALUES (:user_id, :action, :reference_id, :reference_type)";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([
            ':user_id' => $this->userId,
            ':action' => $action,
            ':reference_id' => $referenceId,
            ':reference_type' => $referenceType
        ]);
    }

    /**
     * Retrieves recent activities
     */
    public function getRecent($limit = 10) {
        $limit = (int)$limit; // ensure it's an integer
    
        $sql = "SELECT ra.*, u.firstname, u.lastname 
                FROM activities ra
                LEFT JOIN users u ON ra.user_id = u.id
                ORDER BY ra.created_at DESC
                LIMIT $limit"; // inject directly
    
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        $activities = [];
        foreach ($rows as $row) {
            $username = $row['firstname'] && $row['lastname'] ? "{$row['firstname']} {$row['lastname']}" : "Someone";
            $desc = $row['action'];
    
            switch ($row['reference_type']) {
                case 'booking':
                    $stmt2 = $this->conn->prepare("SELECT id, status FROM bookings WHERE id = ?");
                    $stmt2->execute([$row['reference_id']]);
                    $booking = $stmt2->fetch(PDO::FETCH_ASSOC);
                    if ($booking) $desc .= " for booking #{$booking['id']} ({$booking['status']})";
                    break;
    
                case 'property':
                    $stmt2 = $this->conn->prepare("SELECT id, title FROM properties WHERE id = ?");
                    $stmt2->execute([$row['reference_id']]);
                    $property = $stmt2->fetch(PDO::FETCH_ASSOC);
                    if ($property) $desc .= " – {$property['title']} (ID {$property['id']})";
                    break;
    
                case 'model':
                    $stmt2 = $this->conn->prepare("SELECT id, name FROM models WHERE id = ?");
                    $stmt2->execute([$row['reference_id']]);
                    $model = $stmt2->fetch(PDO::FETCH_ASSOC);
                    if ($model) $desc .= " – {$model['name']} (ID {$model['id']})";
                    break;
            }
    
            $activities[] = [
                'user' => $username,
                'description' => $desc,
                'created_at' => $row['created_at']
            ];
        }
    
        return $activities;
    }
    
}
