<?php

function authenticate() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401); // Better HTTP semantics
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
        exit();
    }
}


// require_once 'vendor/autoload.php';

// use \Firebase\JWT\JWT;

// function authenticate() {
//     $headers = apache_request_headers(); // Get headers
//     if (!isset($headers['Authorization'])) {
//         echo json_encode(['success' => false, 'message' => 'Authorization header missing']);
//         exit();
//     }

//     $token = str_replace('Bearer ', '', $headers['Authorization']); // Get token from Authorization header

//     try {
//         $decoded = JWT::decode($token, 'your-secret-key', array('HS256')); // Decode token
//         $_SESSION['user_id'] = $decoded->user_id; // Store user ID in session (optional)
//     } catch (Exception $e) {
//         echo json_encode(['success' => false, 'message' => 'Token is invalid or expired']);
//         exit();
//     }
// }

?>