<?php

class Booking
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }


    public function addBooking($propertyId, $data)
    {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to book a viewing.');
        }
        $userId = $_SESSION['user_id'];

        // Prevent duplicates
        $stmt = $this->conn->prepare("SELECT id FROM bookings WHERE user_id = :user_id AND property_id = :property_id");
        $stmt->execute([
            ':user_id' => $userId,
            ':property_id' => $propertyId
        ]);
        if ($stmt->rowCount() > 0) {
            throw new Exception('You have already booked a viewing for this property.');
        }

        $bookingTime = !empty($data['booking_time']) ? $data['booking_time'] : null;

        // Insert booking
        $stmt = $this->conn->prepare("
            INSERT INTO bookings (user_id, property_id, name, email, phone, booking_date, booking_time, status) 
            VALUES (:user_id, :property_id, :name, :email, :phone, :booking_date, :booking_time, 'pending')
        ");
        $stmt->execute([
            ':user_id' => $userId,
            ':property_id' => $propertyId,
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':phone' => $data['phone'],
            ':booking_date' => $data['booking_date'],
            ':booking_time' => $bookingTime
        ]);

        // Fetch property + agent info for notification
        $stmt2 = $this->conn->prepare("
            SELECT p.name AS property_name, a.firstname, a.lastname
            FROM properties p
            LEFT JOIN agents a ON a.id = p.agent_id
            WHERE p.id = :pid
        ");
        $stmt2->execute([':pid' => $propertyId]);
        $prop = $stmt2->fetch(\PDO::FETCH_ASSOC);

        $propertyName = $prop['property_name'] ?? "Property #$propertyId";
        $agentName = isset($prop['firstname'])
            ? trim($prop['firstname'] . ' ' . $prop['lastname'])
            : 'our agent';

        $formattedDate = date('F j, Y', strtotime($data['booking_date']));
        $formattedTime = $bookingTime ? date('g:i A', strtotime($bookingTime)) : '';
        $dateTimeStr = $bookingTime ? "$formattedDate at $formattedTime" : $formattedDate;

        $notifMessage = "Your viewing for <strong>$propertyName</strong> has been scheduled for $dateTimeStr. Your agent is $agentName.";

        // Create in-app notification
        include_once __DIR__ . '/Notification.php';
        $notification = new Notification($this->conn);
        $notification->createNotification([
            'user_id' => $userId,
            'message' => $notifMessage,
            'type' => 'booking'
        ]);

        // Send confirmation email via EmailService
        include_once __DIR__ . '/EmailService.php';
        $emailService = new EmailService($this->conn);
        $emailSubject = "Viewing Confirmed – $propertyName";
        $emailBody = "
            <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;'>
                <h2 style='color:#d4af37;'>Viewing Scheduled</h2>
                <p>Hi {$data['name']},</p>
                <p>Your viewing has been booked. Here are the details:</p>
                <table style='width:100%;border-collapse:collapse;margin:16px 0;'>
                    <tr><td style='padding:8px;color:#555;'>Property</td><td style='padding:8px;font-weight:bold;'>$propertyName</td></tr>
                    <tr style='background:#f9f9f9;'><td style='padding:8px;color:#555;'>Date</td><td style='padding:8px;'>$formattedDate</td></tr>
                    " . ($bookingTime ? "<tr><td style='padding:8px;color:#555;'>Time</td><td style='padding:8px;'>$formattedTime</td></tr>" : "") . "
                    <tr style='background:#f9f9f9;'><td style='padding:8px;color:#555;'>Agent</td><td style='padding:8px;'>$agentName</td></tr>
                    <tr><td style='padding:8px;color:#555;'>Status</td><td style='padding:8px;color:#e6a817;font-weight:bold;'>Pending Confirmation</td></tr>
                </table>
                <p style='color:#888;font-size:13px;'>We'll confirm your appointment shortly. If you have questions, reply to this email.</p>
                <p style='color:#888;font-size:13px;'>— The Hauzisha Team</p>
            </div>
        ";
        try {
            $emailService->sendEmail($data['email'], $emailSubject, $emailBody);
        } catch (\Exception $e) {
            error_log("Booking email failed: " . $e->getMessage());
        }

        return ['success' => true, 'message' => 'Property booked successfully.'];
    }

    public function getAllBookings()
    {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admins can view all bookings.');
        }

        $stmt = $this->conn->query("
            SELECT b.*, u.firstname AS firstname, u.lastname AS lastname, p.name AS property_title
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN properties p ON b.property_id = p.id
            ORDER BY b.booking_date DESC
        ");

        return [
            'success' => true,
            'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ];
    }

    public function getPropertyBookings()
    {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to view bookings.');
        }
        $userId = $_SESSION['user_id'];

        $stmt = $this->conn->prepare("
            SELECT 
                b.id as booking_id,
                b.booking_date,
                b.status,
                b.name as booking_name,
                b.email as booking_email,
                b.phone as booking_phone,
                b.created_at as booking_created_at,
                p.id as property_id,
                p.name as property_name,
                p.location,
                p.price,
                p.type,
                p.hero_image,
                p.gallery
            FROM bookings b
            JOIN properties p ON p.id = b.property_id
            WHERE b.user_id = :user_id
            ORDER BY b.created_at DESC
        ");
        $stmt->execute([':user_id' => $userId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateBookingStatus($bookingId, $status)
    {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
            throw new Exception('Only admins can update booking statuses.');
        }

        // Validate allowed statuses
        $allowedStatuses = ['pending', 'confirmed', 'cancelled'];
        if (!in_array($status, $allowedStatuses)) {
            throw new Exception('Invalid status value.');
        }

        // Get booking details before updating
        $stmt = $this->conn->prepare("
            SELECT b.user_id, b.booking_date, b.booking_time, p.name as property_name,
                   a.firstname, a.lastname
            FROM bookings b 
            JOIN properties p ON b.property_id = p.id
            LEFT JOIN agents a ON a.id = p.agent_id
            WHERE b.id = :id
        ");
        $stmt->execute([':id' => $bookingId]);
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$booking) {
            throw new Exception('Booking not found.');
        }

        // Update booking status
        $stmt = $this->conn->prepare("UPDATE bookings SET status = :status WHERE id = :id");
        $stmt->execute([
            ':status' => $status,
            ':id' => $bookingId
        ]);

        if ($stmt->rowCount() === 0) {
            throw new Exception('Booking status unchanged.');
        }

        // Create notification for the user
        include_once __DIR__ . '/Notification.php';
        $notification = new Notification($this->conn);

        $formattedDate = date('F j, Y', strtotime($booking['booking_date']));
        $formattedTime = !empty($booking['booking_time']) ? ' at ' . date('g:i A', strtotime($booking['booking_time'])) : '';
        $agentName = isset($booking['firstname']) ? trim($booking['firstname'] . ' ' . $booking['lastname']) : 'our agent';

        $statusMessages = [
            'confirmed' => "Your viewing for {$booking['property_name']} has been confirmed for {$formattedDate}{$formattedTime}. Your agent is {$agentName}.",
            'cancelled' => "Your viewing for {$booking['property_name']} has been cancelled.",
            'pending' => "Your viewing for {$booking['property_name']} is pending approval."
        ];

        $notification->createNotification([
            'user_id' => $booking['user_id'],
            'message' => $statusMessages[$status],
            'type' => 'booking'
        ]);

        return ['success' => true, 'message' => "Booking #$bookingId status updated to $status."];
    }

    public function removeBooking($propertyId)
    {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to undo a booking.');
        }
        $userId = $_SESSION['user_id'];

        $stmt = $this->conn->prepare("DELETE FROM bookings WHERE user_id = :user_id AND property_id = :property_id");
        $stmt->execute([
            ':user_id' => $userId,
            ':property_id' => $propertyId
        ]);

        return ['success' => true, 'message' => 'Booking removed.'];
    }

    public function cancelBooking($bookingId)
    {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('You must be logged in to cancel a booking.');
        }
        $userId = $_SESSION['user_id'];

        // Get booking details and verify it belongs to user
        $stmt = $this->conn->prepare("
            SELECT b.*, p.name as property_name 
            FROM bookings b 
            JOIN properties p ON b.property_id = p.id 
            WHERE b.id = :id AND b.user_id = :user_id
        ");
        $stmt->execute([':id' => $bookingId, ':user_id' => $userId]);
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$booking) {
            throw new Exception('Booking not found or not accessible.');
        }

        // Update status to cancelled
        $stmt = $this->conn->prepare("UPDATE bookings SET status = 'cancelled' WHERE id = :id");
        $stmt->execute([':id' => $bookingId]);

        // Create notification for the user
        include_once __DIR__ . '/Notification.php';
        $notification = new Notification($this->conn);

        $notification->createNotification([
            'user_id' => $userId,
            'message' => "You have cancelled your viewing for {$booking['property_name']}.",
            'type' => 'booking'
        ]);

        return ['success' => true, 'message' => 'Booking cancelled successfully.'];
    }

    public function getBookingKPIs()
    {
        try {
            // Total bookings
            $stmt = $this->conn->query("SELECT COUNT(*) AS total FROM bookings");
            $total = (int) $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Pending bookings
            $stmt = $this->conn->query("SELECT COUNT(*) AS pending FROM bookings WHERE status = 'pending'");
            $pending = (int) $stmt->fetch(PDO::FETCH_ASSOC)['pending'];

            // Confirmed bookings
            $stmt = $this->conn->query("SELECT COUNT(*) AS confirmed FROM bookings WHERE status = 'confirmed'");
            $confirmed = (int) $stmt->fetch(PDO::FETCH_ASSOC)['confirmed'];

            // Cancelled bookings
            $stmt = $this->conn->query("SELECT COUNT(*) AS cancelled FROM bookings WHERE status = 'cancelled'");
            $cancelled = (int) $stmt->fetch(PDO::FETCH_ASSOC)['cancelled'];

            // New bookings this month
            $stmt = $this->conn->query("
                SELECT COUNT(*) AS newThisMonth 
                FROM bookings 
                WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
                  AND YEAR(created_at) = YEAR(CURRENT_DATE())
            ");
            $newThisMonth = (int) $stmt->fetch(PDO::FETCH_ASSOC)['newThisMonth'];

            return [
                'total' => $total,
                'pending' => $pending,
                'confirmed' => $confirmed,
                'cancelled' => $cancelled,
                'newThisMonth' => $newThisMonth,
                'confirmedPercent' => $total ? round(($confirmed / $total) * 100, 1) : 0,
                'pendingPercent' => $total ? round(($pending / $total) * 100, 1) : 0,
                'newPercent' => $total ? number_format(($newThisMonth / $total) * 100, 1) : '0.0',
            ];
        } catch (Exception $e) {
            throw new Exception("Error fetching Booking KPIs: " . $e->getMessage());
        }
    }

    public function getPerPropertyKPIs()
    {
        try {
            $stmt = $this->conn->query("
                SELECT 
                    p.id AS property_id,
                    p.title AS property_title,
                    COUNT(b.id) AS total_bookings,
                    SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
                    SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) AS pending,
                    SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
                    MAX(b.created_at) AS last_booking
                FROM properties p
                LEFT JOIN bookings b ON p.id = b.property_id
                GROUP BY p.id, p.title
                ORDER BY total_bookings DESC
            ");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception("Error fetching per-property KPIs: " . $e->getMessage());
        }
    }

}

?>