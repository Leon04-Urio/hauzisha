<?php

class Agent {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    
    public function createAgent($data) {
        // Ensure user is logged in
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admin can create properties.');
        }

        try {
            // Basic validation
            if (
                empty($data['email']) ||
                empty($data['firstname']) ||
                empty($data['lastname'])
            ) {
                throw new Exception('Email, first name, and last name are required.');
            }
    
            // Normalize email
            $email = strtolower(trim($data['email']));
    
            // Check if email already exists
            $stmt = $this->conn->prepare("SELECT id FROM agents WHERE email = :email");
            $stmt->execute([':email' => $email]);
    
            if ($stmt->rowCount() > 0) {
                throw new Exception('Email already exists.');
            }
    
            // Insert agent
            $stmt = $this->conn->prepare("
                INSERT INTO agents (email, firstname, lastname, phone, whatsapp_no, image, about)
                VALUES (:email, :firstname, :lastname, :phone, :whatsapp_no, :image, :about)
            ");
    
            $stmt->execute([
                ':email' => $email,
                ':firstname' => trim($data['firstname']),
                ':lastname' => trim($data['lastname']),
                ':phone' => $data['phone'] ?? null,
                ':whatsapp_no' => $data['whatsapp_no'] ?? null,
                ':image' => $data['image'] ?? null,
                ':about' => $data['about'] ?? null
            ]);
    
            return ['success' => true, 'message' => 'User registered successfully.'];
    
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function getAllAgents() {
        try {
            $stmt = $this->conn->query("
                SELECT *
                FROM agents
            ");
            $agents = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
            // Build base URL (http/https + host)
            $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host   = $_SERVER['HTTP_HOST'];
            $basePath = '/loft-studio'; // adjust if your app isn't in /loft-studio
    
            foreach ($agents as &$a) {
                if (!empty($a['image'])) {
                    // Remove leading slashes
                    $path = ltrim($a['image'], '/');  
    
                    // Split into directory + filename
                    $dir  = trim(str_replace('\\', '/', dirname($path)), '.');
                    $file = basename($path);
    
                    // Encode just the filename to handle spaces & parentheses
                    $encodedFile = rawurlencode($file);
    
                    $a['image'] = "{$scheme}://{$host}{$basePath}" .
                                  ($dir ? "/{$dir}" : "") .
                                  "/{$encodedFile}";
                }
            }
    
            return $agents;
        } catch (Exception $e) {
            throw new Exception('Error fetching agents: ' . $e->getMessage());
        }
    }       

    public function getAgent($id) {
        // Fetch agent details
        $stmt = $this->conn->prepare("
            SELECT * FROM agents 
            WHERE id = :id AND is_deleted = 0
        ");
        $stmt->execute([':id' => $id]);
        $agent = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if (!$agent) {
            throw new Exception('Agent not found.');
        }
    
        // Count total reviews and calculate average rating from all agent's properties
        $reviewStmt = $this->conn->prepare("
            SELECT 
                COUNT(r.id) AS total_reviews,
                AVG(r.rating) AS avg_rating
            FROM reviews r
            JOIN properties p ON r.property_id = p.id
            WHERE p.agent_id = :agent_id AND r.is_deleted = 0 AND r.rating IS NOT NULL
        ");
        $reviewStmt->execute([':agent_id' => $id]);
        $reviewData = $reviewStmt->fetch(PDO::FETCH_ASSOC);
    
        $agent['total_reviews'] = $reviewData ? (int)$reviewData['total_reviews'] : 0;
        $agent['average_rating'] = $reviewData && $reviewData['avg_rating'] ? round((float)$reviewData['avg_rating'], 1) : 0.0;
    
        // Calculate human-readable duration since created_at
        if (!empty($agent['created_at'])) {
            $createdAt = new DateTime($agent['created_at']);
            $now = new DateTime();
            $interval = $createdAt->diff($now);
    
            if ($interval->y >= 1) {
                // If 1 year or more
                $years = $interval->y;
                $months = $interval->m;
                if ($months > 0) {
                    $agent['time_on_loft'] = "{$years} year" . ($years > 1 ? "s" : "") . " {$months} month" . ($months > 1 ? "s" : "");
                } else {
                    $agent['time_on_loft'] = "{$years} year" . ($years > 1 ? "s" : "");
                }
            } elseif ($interval->m >= 1) {
                // If at least 1 month
                $agent['time_on_loft'] = "{$interval->m} month" . ($interval->m > 1 ? "s" : "");
            } else {
                // Less than a month → show days
                $agent['time_on_loft'] = "{$interval->d} day" . ($interval->d > 1 ? "s" : "");
            }
        } else {
            $agent['time_on_loft'] = "Unknown";
        }
    
        return ['success' => true, 'data' => $agent];
    }
       
    public function updateAgent($id, $data) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admin can update agents.');
        }
    
        $fields = [];
        $params = [':id' => $id];
    
        if (!empty($data['email'])) {
            $fields[] = "email = :email";
            $params[':email'] = strtolower(trim($data['email']));
        }
        if (!empty($data['firstname'])) {
            $fields[] = "firstname = :firstname";
            $params[':firstname'] = trim($data['firstname']);
        }
        if (!empty($data['lastname'])) {
            $fields[] = "lastname = :lastname";
            $params[':lastname'] = trim($data['lastname']);
        }
        if (!empty($data['phone'])) {
            $fields[] = "phone = :phone";
            $params[':phone'] = $data['phone'];
        }
        if (!empty($data['whatsapp_no'])) {
            $fields[] = "whatsapp_no = :whatsapp_no";
            $params[':whatsapp_no'] = $data['whatsapp_no'];
        }
        if (!empty($data['image'])) {
            $fields[] = "image = :image";
            $params[':image'] = $data['image'];
        }
        if (isset($data['about'])) {
            $fields[] = "about = :about";
            $params[':about'] = $data['about'];
        }
    
        if (empty($fields)) {
            throw new Exception('No fields to update.');
        }
    
        $setClause = implode(", ", $fields);
        $stmt = $this->conn->prepare("UPDATE agents SET $setClause WHERE id = :id");
        $stmt->execute($params);
    
        return ['success' => true, 'message' => 'Agent updated successfully.'];
    }
    
    public function deleteAgent($id) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admin can delete agents.');
        }
    
        $stmt = $this->conn->prepare("UPDATE agents SET is_deleted = 1 WHERE id = :id");
        $stmt->execute([':id' => $id]);
    
        return ['success' => true, 'message' => 'Agent soft deleted.'];
    }  
    
    public function getAgentKPIs() {
        try {
            // Total agents (all, regardless of deletion)
            $stmt = $this->conn->query("SELECT COUNT(*) AS total FROM agents");
            $total = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
            // Active agents (not deleted)
            $stmt = $this->conn->query("SELECT COUNT(*) AS active FROM agents WHERE is_deleted = 0");
            $active = (int)$stmt->fetch(PDO::FETCH_ASSOC)['active'];
    
            // Deleted agents
            $stmt = $this->conn->query("SELECT COUNT(*) AS deleted FROM agents WHERE is_deleted = 1");
            $deleted = (int)$stmt->fetch(PDO::FETCH_ASSOC)['deleted'];
    
            // New agents this month
            $stmt = $this->conn->query("
                SELECT COUNT(*) AS newThisMonth 
                FROM agents 
                WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
                  AND YEAR(created_at) = YEAR(CURRENT_DATE())
            ");
            $newThisMonth = (int)$stmt->fetch(PDO::FETCH_ASSOC)['newThisMonth'];
    
            return [
                'total' => $total,
                'active' => $active,
                'deleted' => $deleted,
                'newThisMonth' => $newThisMonth,
                'activePercent' => $total ? round(($active / $total) * 100, 1) : 0,
                'newPercent' => $total ? number_format(($newThisMonth / $total) * 100, 1) : '0.0',
            ];
        } catch (Exception $e) {
            throw new Exception("Error fetching Agent KPIs: " . $e->getMessage());
        }
    }    

}

?>

