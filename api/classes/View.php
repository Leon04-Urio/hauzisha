<?php

class View {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }
    

    public function recordPropertyView($propertyId) {
        error_log("View::recordPropertyView called with property_id: " . $propertyId);
        $query = "INSERT INTO property_views (property_id) VALUES (:property_id)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':property_id', $propertyId);
        $result = $stmt->execute();
        error_log("Property view insert result: " . ($result ? 'success' : 'failed'));
        if (!$result) {
            error_log("SQL Error: " . print_r($stmt->errorInfo(), true));
        }
    }
    
    public function recordModelView($modelId) {
        $query = "INSERT INTO model_views (model_id) VALUES (:model_id)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':model_id', $modelId);
        $stmt->execute();
    }
    
    public function getPropertyViews($propertyId) {
        $query = "SELECT COUNT(*) as total FROM property_views WHERE property_id = :property_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':property_id', $propertyId);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'] ?? 0;
    }
    
    public function getModelViews($modelId) {
        $query = "SELECT COUNT(*) as total FROM model_views WHERE model_id = :model_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':model_id', $modelId);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'] ?? 0;
    }
    

}

?>