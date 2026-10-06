<?php


class Store {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }
    

    public function createStore($data) {
        // Ensure user is logged in
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admin can create properties.');
        }

        try {   
            // Insert store
            $stmt = $this->conn->prepare("
                INSERT INTO stores (name, website, contact_email, contact_phone, logo_image)
                VALUES (:name, :website, :contact_email, :contact_phone, :logo_image)
            ");
    
            $stmt->execute([
                ':name' => $data['name'],
                ':website' => isset($data['website']) ? trim($data['website']) : null,
                ':contact_email' => $data['contact_email'],
                ':contact_phone' => isset($data['contact_phone']) ? trim($data['contact_phone']) : null,
                ':logo_image' => isset($data['logo_image']) ? trim($data['logo_image']) : null,
            ]);
    
            return ['success' => true, 'message' => 'Store created successfully.'];
    
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function getAllStores() {
        try {
            $stmt = $this->conn->query("
            SELECT *
            FROM stores
            WHERE is_deleted = 0
          ");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception('Error fetching stores: ' . $e->getMessage());
        }
    }  
    
    public function getDeletedStoresToo() {
        try {
            $stmt = $this->conn->query("
            SELECT *
            FROM stores
          ");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception('Error fetching stores: ' . $e->getMessage());
        }
    }

    public function getStore($id) {
        $stmt = $this->conn->prepare("SELECT * FROM stores WHERE id = :id AND is_deleted = 0");
        $stmt->execute([':id' => $id]);
        $store = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$store) {
            throw new Exception('Store not found.');
        }
        return ['success' => true, 'data' => $store];
    }

    public function updateStore($id, $data) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admin can update stores.');
        }
    
        $fields = [];
        $params = [':id' => $id];
    
        if (!empty($data['name'])) {
            $fields[] = "name = :name";
            $params[':name'] = strtolower(trim($data['name']));
        }
        if (!empty($data['website'])) {
            $fields[] = "website = :website";
            $params[':website'] = trim($data['website']);
        }
        if (!empty($data['contact_email'])) {
            $fields[] = "contact_email = :contact_email";
            $params[':contact_email'] = trim($data['contact_email']);
        }
        if (!empty($data['contact_phone'])) {
            $fields[] = "contact_phone = :contact_phone";
            $params[':contact_phone'] = $data['contact_phone'];
        }
        if (!empty($data['logo_image'])) {
            $fields[] = "logo_image = :logo_image";
            $params[':logo_image'] = $data['logo_image'];
        }
    
        if (empty($fields)) {
            throw new Exception('No fields to update.');
        }
    
        $setClause = implode(", ", $fields);
        $stmt = $this->conn->prepare("UPDATE stores SET $setClause WHERE id = :id");
        $stmt->execute($params);
    
        return ['success' => true, 'message' => 'Store updated successfully.'];
    }
    
    public function deleteStore($id) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admin can delete stores.');
        }
    
        $stmt = $this->conn->prepare("UPDATE stores SET is_deleted = 1 WHERE id = :id");
        $stmt->execute([':id' => $id]);
    
        return ['success' => true, 'message' => 'Store soft deleted.'];
    }

    public function getStoreKPIs() {
        try {
            // Total stores (all, regardless of deletion)
            $stmt = $this->conn->query("SELECT COUNT(*) AS total FROM stores");
            $total = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
            // Active stores (not deleted)
            $stmt = $this->conn->query("SELECT COUNT(*) AS active FROM stores WHERE is_deleted = 0");
            $active = (int)$stmt->fetch(PDO::FETCH_ASSOC)['active'];
    
            // Deleted stores
            $stmt = $this->conn->query("SELECT COUNT(*) AS deleted FROM stores WHERE is_deleted = 1");
            $deleted = (int)$stmt->fetch(PDO::FETCH_ASSOC)['deleted'];
    
            // New stores this month
            $stmt = $this->conn->query("
                SELECT COUNT(*) AS newThisMonth 
                FROM stores 
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
            throw new Exception("Error fetching Store KPIs: " . $e->getMessage());
        }
    }    

}


?>