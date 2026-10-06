<?php

class FavProperty {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }
    

    public function addFavoriteProperty($propertyId) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to add favorites.');
        }
        $userId = $_SESSION['user_id'];

        // Validate property ID
        if (!is_numeric($propertyId)) {
            throw new Exception('Invalid property ID.');
        }

        // Check if property exists
        $stmt = $this->conn->prepare("SELECT id FROM properties WHERE id = :property_id AND is_deleted = 0");
        $stmt->execute([':property_id' => $propertyId]);
        if ($stmt->rowCount() === 0) {
            throw new Exception('Property not found.');
        }

        // Check if already favorited
        $stmt = $this->conn->prepare("SELECT id FROM favorites_properties WHERE user_id = :user_id AND property_id = :property_id");
        $stmt->execute([
            ':user_id' => $userId,
            ':property_id' => $propertyId
        ]);
        if ($stmt->rowCount() > 0) {
            return ['success' => true, 'message' => 'Property is already in your favorites.', 'is_favorite' => true];
        }

        $stmt = $this->conn->prepare("INSERT INTO favorites_properties (user_id, property_id) VALUES (:user_id, :property_id)");
        $stmt->execute([
            ':user_id' => $userId,
            ':property_id' => $propertyId
        ]);

        return ['success' => true, 'message' => 'Property added to favorites.', 'is_favorite' => true];
    }

    public function getFavoriteProperties() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to view favorites.');
        }
        $userId = $_SESSION['user_id'];

        $stmt = $this->conn->prepare("
            SELECT p.*, fp.created_at 
            FROM properties p
            JOIN favorites_properties fp ON p.id = fp.property_id
            WHERE fp.user_id = :user_id
        ");
        $stmt->execute([':user_id' => $userId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function removeFavoriteProperty($propertyId) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to remove favorites.');
        }
        $userId = $_SESSION['user_id'];

        // Validate property ID
        if (!is_numeric($propertyId)) {
            throw new Exception('Invalid property ID.');
        }

        $stmt = $this->conn->prepare("DELETE FROM favorites_properties WHERE user_id = :user_id AND property_id = :property_id");
        $stmt->execute([
            ':user_id' => $userId,
            ':property_id' => $propertyId
        ]);

        $rowsAffected = $stmt->rowCount();

        return [
            'success' => true, 
            'message' => $rowsAffected > 0 ? 'Property removed from favorites.' : 'Property was not in favorites.',
            'is_favorite' => false
        ];
    }
    
    public function toggleFavoriteProperty($propertyId) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to manage favorites.');
        }
        $userId = $_SESSION['user_id'];

        // Validate property ID
        if (!is_numeric($propertyId)) {
            throw new Exception('Invalid property ID.');
        }

        // Check if property exists
        $stmt = $this->conn->prepare("SELECT id FROM properties WHERE id = :property_id AND is_deleted = 0");
        $stmt->execute([':property_id' => $propertyId]);
        if ($stmt->rowCount() === 0) {
            throw new Exception('Property not found.');
        }

        // Check if already favorited
        $stmt = $this->conn->prepare("SELECT id FROM favorites_properties WHERE user_id = :user_id AND property_id = :property_id");
        $stmt->execute([
            ':user_id' => $userId,
            ':property_id' => $propertyId
        ]);

        if ($stmt->rowCount() > 0) {
            // Remove from favorites
            $stmt = $this->conn->prepare("DELETE FROM favorites_properties WHERE user_id = :user_id AND property_id = :property_id");
            $stmt->execute([
                ':user_id' => $userId,
                ':property_id' => $propertyId
            ]);
            return ['success' => true, 'message' => 'Property removed from favorites.', 'is_favorite' => false];
        } else {
            // Add to favorites
            $stmt = $this->conn->prepare("INSERT INTO favorites_properties (user_id, property_id) VALUES (:user_id, :property_id)");
            $stmt->execute([
                ':user_id' => $userId,
                ':property_id' => $propertyId
            ]);
            return ['success' => true, 'message' => 'Property added to favorites.', 'is_favorite' => true];
        }
    }
    
    public function isFavorite($propertyId) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            return false;
        }
        $userId = $_SESSION['user_id'];

        $stmt = $this->conn->prepare("SELECT id FROM favorites_properties WHERE user_id = :user_id AND property_id = :property_id");
        $stmt->execute([
            ':user_id' => $userId,
            ':property_id' => $propertyId
        ]);

        return $stmt->rowCount() > 0;
    }
    
    public function getFavoriteIds() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            return [];
        }
        $userId = $_SESSION['user_id'];

        $stmt = $this->conn->prepare("SELECT property_id FROM favorites_properties WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $userId]);

        $ids = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $ids[] = (int)$row['property_id'];
        }

        return $ids;
    }
}

?>