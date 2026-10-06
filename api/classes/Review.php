<?php

class Review {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }
    

    public function submitReview($data) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('Please log in to submit a review.');
        }
    
        $userId = $_SESSION['user_id'];
        $propertyId = $data['property_id'] ?? null;
        $review = trim($data['review'] ?? '');
        $rating = isset($data['rating']) ? (int)$data['rating'] : null;
    
        // Validation
        if (!$propertyId || !is_numeric($propertyId)) {
            throw new Exception('Property ID is required.');
        }
        
        // Must have either review text or rating
        if (empty($review) && $rating === null) {
            throw new Exception('Please provide a review, rating, or both.');
        }
        
        // Validate rating if provided
        if ($rating !== null && ($rating < 1 || $rating > 5)) {
            throw new Exception('Rating must be between 1 and 5.');
        }
    
        // Check if property exists
        $stmt = $this->conn->prepare("SELECT id FROM properties WHERE id = ? AND is_deleted = 0");
        $stmt->execute([$propertyId]);
        if ($stmt->rowCount() === 0) {
            throw new Exception('Property not found.');
        }
        
        // Add rating column to reviews table if it doesn't exist
        try {
            $this->conn->exec("ALTER TABLE reviews ADD COLUMN rating INT DEFAULT NULL AFTER review");
        } catch (PDOException $e) {
            // Column already exists, ignore error
        }
    
        // Insert review into existing reviews table
        $stmt = $this->conn->prepare("
            INSERT INTO reviews (property_id, user_id, review, rating) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$propertyId, $userId, $review ?: null, $rating]);
        
        $reviewId = $this->conn->lastInsertId();
        
        // Update property's average rating if rating was provided
        if ($rating !== null) {
            $stmt = $this->conn->prepare("
                UPDATE properties 
                SET rating = (
                    SELECT AVG(rating) 
                    FROM reviews 
                    WHERE property_id = ? AND rating IS NOT NULL AND is_deleted = 0
                )
                WHERE id = ?
            ");
            $stmt->execute([$propertyId, $propertyId]);
        }
        
        // Get user info for response
        $stmt = $this->conn->prepare("SELECT firstname, lastname, image FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get total review count for this property
        $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM reviews WHERE property_id = ? AND is_deleted = 0");
        $stmt->execute([$propertyId]);
        $totalReviews = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
        return [
            'success' => true,
            'message' => 'Review submitted successfully.',
            'review' => [
                'id' => $reviewId,
                'review' => $review,
                'rating' => $rating,
                'firstname' => $user['firstname'],
                'lastname' => $user['lastname'],
                'image' => $user['image'],
                'likes' => 0,
                'created_at' => date('Y-m-d H:i:s')
            ],
            'total_reviews' => $totalReviews
        ];
    }
    
    // Legacy method for backward compatibility
    public function addReview($propertyId, $review) {
        return $this->submitReview([
            'property_id' => $propertyId,
            'review' => $review
        ]);
    }    

    public function getPropertyReviews($propertyId, $limit = null, $offset = 0) {
        if (!is_numeric($propertyId)) {
            throw new Exception('Invalid property ID.');
        }
        
        // Add rating column to reviews table if it doesn't exist
        try {
            $this->conn->exec("ALTER TABLE reviews ADD COLUMN rating INT DEFAULT NULL AFTER review");
        } catch (PDOException $e) {
            // Column already exists, ignore error
        }
        
        // Get total count from existing reviews table
        $stmt = $this->conn->prepare("
            SELECT COUNT(*) as total 
            FROM reviews 
            WHERE property_id = ? AND is_deleted = 0
        ");
        $stmt->execute([$propertyId]);
        $totalCount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Build query
        $sql = "
            SELECT 
                r.id,
                r.review,
                r.rating,
                r.likes,
                r.created_at,
                u.firstname,
                u.lastname,
                u.image
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.property_id = ? AND r.is_deleted = 0
            ORDER BY r.created_at DESC
        ";
        
        if ($limit !== null) {
            $sql .= " LIMIT ? OFFSET ?";
        }
        
        $stmt = $this->conn->prepare($sql);
        
        if ($limit !== null) {
            $stmt->execute([$propertyId, $limit, $offset]);
        } else {
            $stmt->execute([$propertyId]);
        }
        
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'reviews' => $reviews,
            'total' => $totalCount,
            'showing' => count($reviews),
            'has_more' => ($offset + count($reviews)) < $totalCount
        ];
    }
    
    // Legacy method for backward compatibility
    public function getReviewsByProperty($propertyId) {
        return $this->getPropertyReviews($propertyId);
    }

    public function deleteReview($reviewId) {
        try {
            if (session_status() == PHP_SESSION_NONE) {
                session_start();
            }

            if (!isset($_SESSION['user_id'])) {
                throw new Exception('User not logged in.');
            }

            $stmt = $this->conn->prepare("SELECT user_id, is_deleted FROM reviews WHERE id = :review_id");
            $stmt->bindParam(':review_id', $reviewId);
            $stmt->execute();
            $review = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$review) {
                throw new Exception('Review not found.');
            }

            if ($review['user_id'] != $_SESSION['user_id']) {
                throw new Exception('You can only delete your own review.');
            }

            $stmt = $this->conn->prepare("UPDATE reviews SET is_deleted = 1 WHERE id = :review_id");
            $stmt->bindParam(':review_id', $reviewId);
            $stmt->execute();

            return [
                'success' => true,
                'message' => 'Review deleted successfully.'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    public function likeReview($reviewId, $userId) {
        try {
            if (session_status() == PHP_SESSION_NONE) {
                session_start();
            }
            
            if (!isset($_SESSION['user_id'])) {
                throw new Exception('You must be logged in to like a review.');
            }
            
            // Validate inputs
            if (!is_numeric($reviewId) || !is_numeric($userId)) {
                throw new Exception('Invalid review or user ID.');
            }
            
            // Check if review exists
            $stmt = $this->conn->prepare("SELECT id FROM reviews WHERE id = ? AND is_deleted = 0");
            $stmt->execute([$reviewId]);
            if ($stmt->rowCount() === 0) {
                throw new Exception('Review not found.');
            }
            
            // Fix review_likes table if it has wrong foreign key
            try {
                // Check if table exists and has wrong foreign key
                $stmt = $this->conn->query("SHOW CREATE TABLE review_likes");
                $tableInfo = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($tableInfo && strpos($tableInfo['Create Table'], 'property_reviews') !== false) {
                    // Table exists with wrong foreign key - drop and recreate
                    $this->conn->exec("DROP TABLE IF EXISTS review_likes");
                }
            } catch (PDOException $e) {
                // Table doesn't exist, which is fine
            }
            
            // Create review_likes table with correct foreign key
            $this->conn->exec("CREATE TABLE IF NOT EXISTS review_likes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                review_id INT NOT NULL,
                user_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_like (review_id, user_id),
                FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )");
            
            // Check if user already liked this review
            $stmt = $this->conn->prepare("SELECT id FROM review_likes WHERE review_id = ? AND user_id = ?");
            $stmt->execute([$reviewId, $userId]);
            
            if ($stmt->rowCount() > 0) {
                // Unlike - remove the like
                $stmt = $this->conn->prepare("DELETE FROM review_likes WHERE review_id = ? AND user_id = ?");
                $stmt->execute([$reviewId, $userId]);
                
                // Decrement likes count
                $stmt = $this->conn->prepare("UPDATE reviews SET likes = GREATEST(0, likes - 1) WHERE id = ?");
                $stmt->execute([$reviewId]);
                
                $liked = false;
            } else {
                // Like - add the like
                $stmt = $this->conn->prepare("INSERT INTO review_likes (review_id, user_id) VALUES (?, ?)");
                $stmt->execute([$reviewId, $userId]);
                
                // Increment likes count
                $stmt = $this->conn->prepare("UPDATE reviews SET likes = likes + 1 WHERE id = ?");
                $stmt->execute([$reviewId]);
                
                $liked = true;
            }
            
            // Get updated like count
            $stmt = $this->conn->prepare("SELECT likes FROM reviews WHERE id = ?");
            $stmt->execute([$reviewId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $likeCount = $result ? (int)$result['likes'] : 0;
            
            return [
                'success' => true,
                'liked' => $liked,
                'likes' => $likeCount,
                'message' => $liked ? 'Review liked' : 'Review unliked'
            ];
        } catch (Exception $e) {
            // Log the error for debugging
            error_log("Like review error: " . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'message' => $e->getMessage()
            ];
        }
    }
    
    public function getUserLikedReviews($userId, $propertyId) {
        if (!is_numeric($userId) || !is_numeric($propertyId)) {
            return [];
        }
        
        // Fix review_likes table if it has wrong foreign key
        try {
            // Check if table exists and has wrong foreign key
            $stmt = $this->conn->query("SHOW CREATE TABLE review_likes");
            $tableInfo = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($tableInfo && strpos($tableInfo['Create Table'], 'property_reviews') !== false) {
                // Table exists with wrong foreign key - drop and recreate
                $this->conn->exec("DROP TABLE IF EXISTS review_likes");
            }
        } catch (PDOException $e) {
            // Table doesn't exist, which is fine
        }
        
        // Create review_likes table with correct foreign key
        $this->conn->exec("CREATE TABLE IF NOT EXISTS review_likes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            review_id INT NOT NULL,
            user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_like (review_id, user_id),
            FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");
        
        $stmt = $this->conn->prepare("
            SELECT rl.review_id 
            FROM review_likes rl
            JOIN reviews r ON rl.review_id = r.id
            WHERE rl.user_id = ? AND r.property_id = ? AND r.is_deleted = 0
        ");
        $stmt->execute([$userId, $propertyId]);
        
        $likedReviews = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $likedReviews[] = (int)$row['review_id'];
        }
        
        return $likedReviews;
    }

}

?>