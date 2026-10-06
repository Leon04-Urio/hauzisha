<?php

class Report {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }


    public function createReport($userId, $propertyId, $reason) {
        try {
            $stmt = $this->conn->prepare(
			    "INSERT INTO reported_listings (reported_by, property_id, reason, status, created_at) 
			     VALUES (:reported_by, :property_id, :reason, 'Pending', NOW())"
			);
            $stmt->bindParam(':reported_by', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':property_id', $propertyId, PDO::PARAM_INT);
            $stmt->bindParam(':reason', $reason, PDO::PARAM_STR);
            $stmt->execute();

            return ['success' => true, 'message' => 'Report submitted successfully.'];
        } catch (Exception $e) {
            error_log("Report submission failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to submit report.', 'error' => $e->getMessage()];
        }
    }

    public function getAllReports() {
        try {
            $stmt = $this->conn->prepare("
                SELECT r.*, u.first_name, u.last_name, p.name 
                FROM reported_listings r
                LEFT JOIN users u ON r.reported_by = u.id
                LEFT JOIN properties p ON r.property_id = p.id
                ORDER BY r.created_at DESC
            ");

            $stmt->execute();
            
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Print the results to error log
            error_log("Fetched reports: " . json_encode($result));


            return $result;
        } catch (Exception $e) {
            error_log("Failed to fetch reports: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function getReportById($reportId) {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM reported_listings WHERE id = :report_id");
            $stmt->bindParam(':report_id', $reportId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Failed to fetch report: " . $e->getMessage());
            return null;
        }
    }

    public function updateReportStatus($reportId, $status) {
        try {
            $stmt = $this->conn->prepare("UPDATE reported_listings SET status = :status WHERE id = :report_id");
            $stmt->bindParam(':status', $status, PDO::PARAM_STR);
            $stmt->bindParam(':report_id', $reportId, PDO::PARAM_INT);
            $stmt->execute();
            return ['success' => true, 'message' => 'Report status updated.'];
        } catch (Exception $e) {
            error_log("Failed to update report status: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update report.'];
        }
    }
}

?>
