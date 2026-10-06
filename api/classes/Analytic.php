<?php

class Analytic {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }


    public function getTotalProperties() {
        $query = "SELECT 
                    COUNT(*) as total, 
                    SUM(CASE WHEN is_deleted = 1 THEN 1 ELSE 0 END) as inactive
                  FROM properties";
        return $this->fetchOne($query);
    }

    public function getTotalUsers() {
        $query = "SELECT 
                    COUNT(*) as total, 
                    SUM(CASE WHEN is_deleted = 1 THEN 1 ELSE 0 END) as inactive
                  FROM users";
        return $this->fetchOne($query);
    }

    public function getTotalModels() {
        $query = "SELECT 
                    COUNT(*) as total, 
                    SUM(CASE WHEN is_deleted = 1 THEN 1 ELSE 0 END) as inactive
                  FROM furniture_models";
        return $this->fetchOne($query);
    }

    public function getTotalRevenue() {
        $query = "SELECT 
                    COALESCE(SUM(total_revenue), 0) as totalRevenue,
                    COALESCE(SUM(CASE 
                        WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) 
                         AND YEAR(created_at) = YEAR(CURRENT_DATE()) 
                        THEN total_revenue ELSE 0 END), 0) as monthRevenue
                  FROM revenue";  
        return $this->fetchOne($query);
    }

    public function getRevenueByMonth() {
        $query = "SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    SUM(total_revenue) as total
                  FROM revenue
                  GROUP BY month
                  ORDER BY month ASC";
        return $this->fetchAll($query);
    }

    public function getUserGrowthByMonth() {
        $query = "SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COUNT(*) as total
                  FROM users
                  GROUP BY month
                  ORDER BY month ASC";
        return $this->fetchAll($query);
    }

    public function getPropertyTypeBreakdown() {
        $query = "SELECT type, COUNT(*) as count 
                  FROM properties 
                  GROUP BY type";
        return $this->fetchAll($query);
    }

    public function getPopularProperties() {
        $query = "SELECT 
                    p.id, p.name, COUNT(v.id) as views
                  FROM properties p
                  LEFT JOIN property_views v 
                    ON p.id = v.property_id 
                   AND MONTH(v.viewed_at) = MONTH(CURRENT_DATE())
                   AND YEAR(v.viewed_at) = YEAR(CURRENT_DATE())
                  GROUP BY p.id
                  ORDER BY views DESC
                  LIMIT 10";
        return $this->fetchAll($query);
    }

    public function getPopularModels() {
        $query = "SELECT 
                    m.id, m.name, COUNT(v.id) as views
                  FROM furniture_models m
                  LEFT JOIN model_views v 
                    ON m.id = v.model_id 
                   AND MONTH(v.viewed_at) = MONTH(CURRENT_DATE())
                   AND YEAR(v.viewed_at) = YEAR(CURRENT_DATE())
                  GROUP BY m.id
                  ORDER BY views DESC
                  LIMIT 10";
        return $this->fetchAll($query);
    }

    public function getDashboardKPIs() {
        return [
            'properties' => $this->getTotalProperties(),
            'users'      => $this->getTotalUsers(),
            'models'     => $this->getTotalModels(),
            'revenue'    => $this->getTotalRevenue(),
        ];
    }

    public function getBookingTrends() {
        return $this->getRevenueByMonth(); // Placeholder
    }

    public function getRevenueBreakdown() {
        return $this->getRevenueByMonth();
    }

    public function getPropertyTypeDistribution() {
        return $this->getPropertyTypeBreakdown();
    }

    public function getUserGrowth() {
        return $this->getUserGrowthByMonth();
    }

    private function fetchOne($query, $params = []) {
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    private function fetchAll($query, $params = []) {
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

}

?>