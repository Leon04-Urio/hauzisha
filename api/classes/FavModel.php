<?php

class FavModel {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }


    public function addFavorite($modelId) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to add favorites.');
        }
        $userId = $_SESSION['user_id'];

        // Check if already favorited
        $stmt = $this->conn->prepare("SELECT id FROM favorites_models WHERE user_id = :user_id AND model_id = :model_id");
        $stmt->execute([
            ':user_id' => $userId,
            ':model_id' => $modelId
        ]);
        if ($stmt->rowCount() > 0) {
            throw new Exception('This model is already in your favorites.');
        }

        $stmt = $this->conn->prepare("INSERT INTO favorites_models (user_id, model_id) VALUES (:user_id, :model_id)");
        $stmt->execute([
            ':user_id' => $userId,
            ':model_id' => $modelId
        ]);

        return ['success' => true, 'message' => 'Model added to favorites.'];
    }

    public function getFavorites() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to view favorites.');
        }
        $userId = $_SESSION['user_id'];

        $stmt = $this->conn->prepare("
            SELECT m.*, fm.created_at 
            FROM furniture_models m
            JOIN favorites_models fm ON m.id = fm.model_id
            WHERE fm.user_id = :user_id
        ");
        $stmt->execute([':user_id' => $userId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function removeFavorite($modelId) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to remove favorites.');
        }
        $userId = $_SESSION['user_id'];

        $stmt = $this->conn->prepare("DELETE FROM favorites_models WHERE user_id = :user_id AND model_id = :model_id");
        $stmt->execute([
            ':user_id' => $userId,
            ':model_id' => $modelId
        ]);

        return ['success' => true, 'message' => 'Model removed from favorites.'];
    }
}

?>