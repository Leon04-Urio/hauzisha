<?php
/**
 * Unified API Error Handler
 * Ensures all API responses follow a consistent format
 */

function sendJSONResponse($success, $message, $data = null, $httpCode = 200) {
    http_response_code($httpCode);
    header('Content-Type: application/json');
    
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        if (is_array($data)) {
            $response = array_merge($response, $data);
        } else {
            $response['data'] = $data;
        }
    }
    
    echo json_encode($response);
    exit();
}

function sendSuccessResponse($message, $data = null) {
    sendJSONResponse(true, $message, $data, 200);
}

function sendErrorResponse($message, $httpCode = 400) {
    sendJSONResponse(false, $message, null, $httpCode);
}

function handleException($e) {
    error_log('API Exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    
    // Don't expose internal errors in production
    $message = $e->getMessage();
    
    // Sanitize error messages for production
    if (strpos($message, 'SQLSTATE') !== false || strpos($message, 'PDO') !== false) {
        $message = 'A database error occurred. Please try again.';
    }
    
    sendErrorResponse($message, 500);
}

// Set global exception handler
set_exception_handler('handleException');

// Set global error handler
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    // Don't handle suppressed errors
    if (!(error_reporting() & $errno)) {
        return false;
    }
    
    error_log("PHP Error [$errno]: $errstr in $errfile:$errline");
    
    // Convert errors to exceptions for consistent handling
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});
