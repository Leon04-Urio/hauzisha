<?php

class Security {
    
    /**
     * Prevent page caching for authenticated pages
     */
    public static function preventCaching() {
        header("Cache-Control: no-cache, no-store, must-revalidate, private");
        header("Pragma: no-cache");
        header("Expires: 0");
        header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
    }
    
    /**
     * Check if user is authenticated and redirect if not
     */
    public static function requireAuth($redirectTo = '/hauzisha/index.php') {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Prevent caching
        self::preventCaching();
        
        // Check authentication
        if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
            // Don't destroy session here - just redirect
            // This allows login process to work properly
            header("Location: $redirectTo");
            exit();
        }
    }
    
    /**
     * Check if admin is authenticated
     */
    public static function requireAdmin($redirectTo = '/hauzisha/index.php') {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Prevent caching
        self::preventCaching();
        
        // Check admin authentication
        if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
            // Redirect to main page if admin auth fails
            header("Location: $redirectTo");
            exit();
        }
    }
    
    /**
     * Secure logout with history clearing
     */
    public static function secureLogout($redirectTo = '/hauzisha/index.php') {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Prevent caching
        self::preventCaching();
        
        // Destroy the session completely
        $_SESSION = [];
        
        // Delete the session cookie
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        // Destroy the session
        session_destroy();
        
        // Redirect
        header("Location: $redirectTo");
        exit();
    }
}

?>

