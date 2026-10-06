<?php

class Model {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }
    

    public function createModel($data) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admin can create furniture_models.');
        }
    
        try {
            $imagePath = null;
    
            // ✅ Handle file upload if provided
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../../uploads/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
    
                $fileTmp = $_FILES['image']['tmp_name'];
                $fileName = uniqid("model_", true) . "_" . basename($_FILES['image']['name']);
                $targetPath = $uploadDir . $fileName;
    
                if (move_uploaded_file($fileTmp, $targetPath)) {
                    $imagePath = "uploads/" . $fileName; // relative path for DB
                } else {
                    throw new Exception("Failed to move uploaded file.");
                }
            }
    
            // ✅ Insert model
            $stmt = $this->conn->prepare("
                INSERT INTO furniture_models 
                    (name, image, description, likes, size, material, units, store_id, seater, price, purchase_link, category, in_stock)
                VALUES 
                    (:name, :image, :description, :likes, :size, :material, :units, :store_id, :seater, :price, :purchase_link, :category, :in_stock)
            ");
            
            $stmt->execute([
                ':name' => $data['name'],
                ':description' => isset($data['description']) ? trim($data['description']) : null,
                ':image' => $imagePath,
                ':likes' => isset($data['likes']) ? intval($data['likes']) : 0,
                ':size' => isset($data['size']) ? trim($data['size']) : null,
                ':material' => isset($data['material']) ? trim($data['material']) : null,
                ':units' => isset($data['units']) ? intval($data['units']) : 0,
                ':store_id' => isset($data['store_id']) ? intval($data['store_id']) : null,
                ':seater' => isset($data['seater']) ? intval($data['seater']) : null,
                ':price' => isset($data['price']) ? floatval($data['price']) : null,
                ':purchase_link' => isset($data['purchase_link']) ? trim($data['purchase_link']) : null,
                ':category' => isset($data['category']) ? trim($data['category']) : null,
                ':in_stock' => isset($data['in_stock']) ? intval($data['in_stock']) : 1
            ]);
    
            return ['success' => true, 'message' => 'Furniture model created successfully.'];
    
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }    

    public function getAllModels() {
        try {
            $stmt = $this->conn->query("
            SELECT 
                m.*, 
                s.name AS store_name, 
                s.website AS store_website
            FROM furniture_models m
            JOIN stores s ON m.store_id = s.id 
            WHERE m.is_deleted = 0
        ");
        
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception('Error fetching models: ' . $e->getMessage());
        }
    }
    
    public function getDeletedModels() {
        try {
            $stmt = $this->conn->query("
            SELECT 
                m.*, 
                s.name AS store_name, 
                s.website AS store_website
            FROM furniture_models m
            JOIN stores s ON m.store_id = s.id 
        ");
        
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception('Error fetching models: ' . $e->getMessage());
        }
    }
    
    public function getStoreModels($StoreId) {
        $query = "
            SELECT 
                m.*, 
                s.name AS store_name, 
                s.website, 
                s.contact_email, 
                s.logo_image 
            FROM furniture_models m
            JOIN stores s ON m.store_id = s.id
            WHERE m.store_id = :store_id AND m.is_deleted = 0
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':store_id', $StoreId, PDO::PARAM_INT);
        $stmt->execute();

        $models = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $models;
    }  

    public function getModel($id) {
        $stmt = $this->conn->prepare("SELECT 
        m.*, 
        s.name AS store_name, 
        s.website AS store_website
            FROM furniture_models m
            JOIN stores s ON m.store_id = s.id 
            WHERE m.id = :id AND m.is_deleted = 0");

        $stmt->execute([':id' => $id]);
        $model = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$model) {
            throw new Exception('Model not found.');
        }
        return ['success' => true, 'data' => $model];
    }    

    public function updateModel($id, $data) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admin can update models.');
        }
    
        $fields = [];
        $params = [':id' => $id];
    
        if (!empty($data['name'])) {
            $fields[] = "name = :name";
            $params[':name'] = strtolower(trim($data['name']));
        }
        if (!empty($data['description'])) {
            $fields[] = "description = :description";
            $params[':description'] = trim($data['description']);
        }
        if (!empty($data['size'])) {
            $fields[] = "size = :size";
            $params[':size'] = trim($data['size']);
        }
        if (!empty($data['material'])) {
            $fields[] = "material = :material";
            $params[':material'] = $data['material'];
        }
        if (!empty($data['units'])) {
            $fields[] = "units = :units";
            $params[':units'] = $data['units'];
        }
        if (!empty($data['seater'])) {
            $fields[] = "seater = :seater";
            $params[':seater'] = $data['seater'];
        } 
        if (!empty($data['price'])) {
            $fields[] = "price = :price";
            $params[':price'] = $data['price'];
        } 
        if (!empty($data['purchase_link'])) {
            $fields[] = "purchase_link = :purchase_link";
            $params[':purchase_link'] = $data['purchase_link'];
        }
        if (!empty($data['category'])) {
            $fields[] = "category = :category";
            $params[':category'] = $data['category'];
        }
        if (!empty($data['cloud_link'])) {
            $fields[] = "cloud_link = :cloud_link";
            $params[':cloud_link'] = $data['cloud_link'];
        }
        if (!empty($data['in_stock'])) {
            $fields[] = "in_stock = :in_stock";
            $params[':in_stock'] = $data['in_stock'];
        }
        if (!empty($data['store_id'])) {
            $fields[] = "store_id = :store_id";
            $params[':store_id'] = $data['store_id'];
        }
        if (isset($data['image']) && $data['image'] !== '') {
            $fields[] = "image = :image";
            $params[':image'] = $data['image'];
        }        
    
        if (empty($fields)) {
            throw new Exception('No fields to update.');
        }
    
        $setClause = implode(", ", $fields);
        $stmt = $this->conn->prepare("UPDATE furniture_models SET $setClause WHERE id = :id");
        $stmt->execute($params);
    
        return ['success' => true, 'message' => 'Model updated successfully.'];
    }
    
    public function deleteModel($id) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admin can delete models.');
        }
    
        $stmt = $this->conn->prepare("UPDATE furniture_models SET is_deleted = 1 WHERE id = :id");
        $stmt->execute([':id' => $id]);
    
        return ['success' => true, 'message' => 'Model soft deleted.'];
    }  
    
    public function getModelKPIs() {
        try {
            // Total models (all, regardless of deletion)
            $stmt = $this->conn->query("SELECT COUNT(*) AS total FROM furniture_models");
            $total = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
            // Active models
            $stmt = $this->conn->query("SELECT COUNT(*) AS active FROM furniture_models WHERE is_deleted = 0");
            $active = (int)$stmt->fetch(PDO::FETCH_ASSOC)['active'];
    
            // Inactive models
            $stmt = $this->conn->query("SELECT COUNT(*) AS inactive FROM furniture_models WHERE is_deleted = 1");
            $inactive = (int)$stmt->fetch(PDO::FETCH_ASSOC)['inactive'];
    
            // Total stores
            $stmt = $this->conn->query("SELECT COUNT(*) AS stores FROM stores WHERE is_deleted = 0");
            $totalStores = (int)$stmt->fetch(PDO::FETCH_ASSOC)['stores'];
    
            // Pending models (example: in_stock = 'Pending')
            $stmt = $this->conn->query("SELECT COUNT(*) AS pending FROM furniture_models WHERE in_stock = 'Pending' AND is_deleted = 0");
            $pending = (int)$stmt->fetch(PDO::FETCH_ASSOC)['pending'];
    
            // New models this month
            $stmt = $this->conn->query("
                SELECT COUNT(*) AS newThisMonth 
                FROM furniture_models 
                WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
                  AND YEAR(created_at) = YEAR(CURRENT_DATE())
            ");
            $newThisMonth = (int)$stmt->fetch(PDO::FETCH_ASSOC)['newThisMonth'];
    
            return [
                'total' => $total,
                'active' => $active,
                'inactive' => $inactive,
                'totalStores' => $totalStores,
                'pending' => $pending,
                'newThisMonth' => $newThisMonth,
                'activePercent' => $total ? round(($active / $total) * 100, 1) : 0,
                'newPercent' => $total ? round(($newThisMonth / $total) * 100, 1) : 0,
            ];
        } catch (Exception $e) {
            throw new Exception("Error fetching KPIs: " . $e->getMessage());
        }
    }
    

}

?>