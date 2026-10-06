<?php

class Revenue {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }


    public function addRevenue($data) {
        $totalRevenue = $this->calculateTotal($data);
        $profit = $totalRevenue - ($data['estimated_cost'] ?? 0);

        $query = "INSERT INTO revenue 
                  (property_id, beds_size, contract, matterport_scan, monthly_sub, upload_fee, 
                   photo_2d_staging, 3d_staging, featured, total_revenue, estimated_cost, profit) 
                  VALUES 
                  (:property_id, :beds_size, :contract, :matterport_scan, :monthly_sub, :upload_fee, 
                   :photo_2d_staging, :staging3d, :featured, :total_revenue, :estimated_cost, :profit)";
        
        $stmt = $this->conn->prepare($query);

        $stmt->execute([
            ':property_id'       => $data['property_id'],
            ':beds_size'         => $data['beds_size'],
            ':contract'          => $data['contract'] ?? 0,
            ':matterport_scan'   => $data['matterport_scan'] ?? 0,
            ':monthly_sub'       => $data['monthly_sub'] ?? 0,
            ':upload_fee'        => $data['upload_fee'] ?? 0,
            ':photo_2d_staging'  => $data['photo_2d_staging'] ?? 0,
            ':staging3d'         => $data['3d_staging'] ?? 0,
            ':featured'          => $data['featured'] ?? 0,
            ':total_revenue'     => $totalRevenue,
            ':estimated_cost'    => $data['estimated_cost'] ?? 0,
            ':profit'            => $profit
        ]);

        return $this->conn->lastInsertId();
    }

    public function getRevenueByProperty($propertyId) {
        $query = "SELECT * FROM revenue WHERE property_id = :property_id ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':property_id' => $propertyId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function getAllRevenue() {
        $query = "SELECT 
                    SUM(total_revenue) as totalRevenue,
                    SUM(estimated_cost) as totalCosts,
                    SUM(profit) as totalProfit
                  FROM revenue";
        $stmt = $this->conn->query($query);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function getRevenueByMonth() {
        $query = "SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    SUM(total_revenue) as revenue,
                    SUM(estimated_cost) as costs,
                    SUM(profit) as profit
                  FROM revenue
                  GROUP BY month
                  ORDER BY month ASC";
        $stmt = $this->conn->query($query);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    private function calculateTotal($data) {
        return ($data['contract'] ?? 0) +
               ($data['matterport_scan'] ?? 0) +
               ($data['monthly_sub'] ?? 0) +
               ($data['upload_fee'] ?? 0) +
               ($data['photo_2d_staging'] ?? 0) +
               ($data['3d_staging'] ?? 0) +
               ($data['featured'] ?? 0);
    }
}

?>