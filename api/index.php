<?php
// Suppress all error output to prevent JSON corruption
error_reporting(0);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);

header('Content-Type: application/json');
if (session_status() == PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'cookie_samesite' => 'Lax', // or 'None' if cross-site
    ]);
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Methods: GET');

include_once 'config/database.php';
include_once 'helpers/cache.php';
include_once 'helpers/csrf.php';
include_once 'classes/User.php';
include_once 'classes/Property.php';
include_once 'classes/Agent.php';
include_once 'classes/Store.php';
include_once 'classes/Review.php';
include_once 'classes/Model.php';
include_once 'classes/FavModel.php';
include_once 'classes/FavProperty.php';
include_once 'classes/Report.php';
include_once 'classes/Booking.php';
include_once 'classes/Revenue.php';
include_once 'classes/Analytic.php';
include_once 'classes/View.php';
include_once 'classes/Activity.php';
include_once 'classes/Notification.php';
include_once 'classes/SMSService.php';
include_once 'classes/EmailService.php';
include_once 'classes/LoftTour.php';
include_once 'middleware/auth.php';
include_once 'middleware/RateLimiter.php';

// Initialize rate limiter
$rateLimiter = new RateLimiter();

// Skip rate limiting for whitelisted IPs
if (!$rateLimiter->isWhitelisted()) {
    // Determine endpoint type for appropriate rate limiting
    $endpoint = 'default';

    if (
        strpos($_SERVER['REQUEST_URI'], '/auth') !== false ||
        strpos($_SERVER['REQUEST_URI'], '/login') !== false ||
        strpos($_SERVER['REQUEST_URI'], '/register') !== false
    ) {
        $endpoint = 'auth';
    } elseif (strpos($_SERVER['REQUEST_URI'], '/search') !== false) {
        $endpoint = 'search';
    } elseif (strpos($_SERVER['REQUEST_URI'], '/upload') !== false) {
        $endpoint = 'upload';
    } elseif (
        strpos($_SERVER['REQUEST_URI'], '/admin') !== false ||
        strpos($_SERVER['REQUEST_URI'], '/delete') !== false
    ) {
        $endpoint = 'strict';
    }

    // Check rate limit
    $limitResult = $rateLimiter->checkLimit($endpoint);

    if (!$limitResult['allowed']) {
        $rateLimiter->sendRateLimitResponse($limitResult);
    }

    // Add rate limit headers to successful responses
    header('X-RateLimit-Limit: ' . $limitResult['limit']);
    header('X-RateLimit-Remaining: ' . $limitResult['remaining']);
    header('X-RateLimit-Reset: ' . $limitResult['reset_time']);
}

$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$conn = Database::getInstance();

$data = json_decode(file_get_contents('php://input'), true) ?: [];

// Test SMS endpoint to activate AfricasTalking account
if ($requestMethod === 'GET' && strpos($requestUri, '/test-sms') !== false) {
    header('Content-Type: application/json');

    try {
        $phone = $_GET['phone'] ?? '+254791488881';
        $smsService = new SMSService($conn);

        $testMessage = "Hello from Loft Studio! This is a test SMS to activate your AfricasTalking account. 🏠";
        $result = $smsService->sendSMS($phone, $testMessage);

        echo json_encode([
            'success' => true,
            'message' => 'Test SMS sent successfully',
            'result' => $result,
            'phone' => $phone
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage(),
            'phone' => $_GET['phone'] ?? 'not_provided'
        ]);
    }
    exit();
}

// Enhanced debug OTP endpoint with full API response
if ($requestMethod === 'GET' && strpos($requestUri, '/debug-otp-detailed') !== false) {
    header('Content-Type: application/json');

    try {
        $phone = $_GET['phone'] ?? '+254791488881';

        // Direct SMS test like the activation
        $config = parse_ini_file(__DIR__ . '/config/app.ini');
        $apiKey = trim($config['africas_talking_api_key'] ?? '');
        $username = trim($config['africas_talking_username'] ?? 'sandbox');

        // Generate OTP
        $otp = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        // Clean phone number
        $cleanPhone = preg_replace('/[^0-9+]/', '', $phone);
        if (preg_match('/^\+254[7][0-9]{8}$/', $cleanPhone)) {
            $cleanPhone = $cleanPhone;
        } elseif (preg_match('/^254[7][0-9]{8}$/', $cleanPhone)) {
            $cleanPhone = '+' . $cleanPhone;
        } elseif (preg_match('/^[7][0-9]{8}$/', $cleanPhone)) {
            $cleanPhone = '+254' . $cleanPhone;
        } elseif (preg_match('/^0[7][0-9]{8}$/', $cleanPhone)) {
            $cleanPhone = '+254' . substr($cleanPhone, 1);
        } else {
            $cleanPhone = '+254791488881';
        }

        $message = "Loft Studio: Your login code is $otp. Expires in 5 min. Keep it safe!";

        // Direct API call
        $postData = [
            'username' => $username,
            'to' => $cleanPhone,
            'message' => $message
        ];

        $headers = [
            'Accept: application/json',
            'Content-Type: application/x-www-form-urlencoded',
            'apiKey: ' . $apiKey
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.sandbox.africastalking.com/version1/messaging');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        $result = json_decode($response, true);

        echo json_encode([
            'success' => true,
            'message' => 'Detailed OTP debug',
            'otp' => $otp,
            'phone' => $cleanPhone,
            'http_code' => $httpCode,
            'api_response' => $result,
            'raw_response' => $response,
            'curl_error' => $error,
            'post_data' => $postData
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit();
}
if ($requestMethod === 'GET' && strpos($requestUri, '/debug-otp') !== false) {
    header('Content-Type: application/json');

    try {
        $phone = $_GET['phone'] ?? '+254791488881';

        $smsService = new SMSService($conn);
        $result = $smsService->sendOTP($phone);

        echo json_encode([
            'success' => true,
            'message' => 'Debug OTP request',
            'result' => $result,
            'phone' => $phone
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage(),
            'phone' => $_GET['phone'] ?? 'not_provided'
        ]);
    }
    exit();
}
if ($requestMethod === 'GET' && strpos($requestUri, '/activate-africastalking') !== false) {
    header('Content-Type: application/json');

    try {
        $phone = $_GET['phone'] ?? '+254791488881';

        // Direct AfricasTalking API call for activation
        $config = parse_ini_file(__DIR__ . '/config/app.ini');
        $apiKey = trim($config['africas_talking_api_key'] ?? '');
        $username = trim($config['africas_talking_username'] ?? 'sandbox');

        if (empty($apiKey)) {
            throw new Exception("API key not configured");
        }

        // Clean phone number format - more flexible
        $cleanPhone = preg_replace('/[^0-9+]/', '', $phone);

        // Handle various Kenyan number formats
        if (preg_match('/^\+254[7][0-9]{8}$/', $cleanPhone)) {
            // Already in correct format: +254791488881
            $cleanPhone = $cleanPhone;
        } elseif (preg_match('/^254[7][0-9]{8}$/', $cleanPhone)) {
            // Missing +: 254791488881
            $cleanPhone = '+' . $cleanPhone;
        } elseif (preg_match('/^[7][0-9]{8}$/', $cleanPhone)) {
            // Missing country code: 791488881
            $cleanPhone = '+254' . $cleanPhone;
        } elseif (preg_match('/^0[7][0-9]{8}$/', $cleanPhone)) {
            // Local format: 0791488881
            $cleanPhone = '+254' . substr($cleanPhone, 1);
        } else {
            // Default to the provided phone if we can't format it
            $cleanPhone = '+254791488881';
            error_log("Could not format phone: $phone, using default: $cleanPhone");
        }

        $message = "🎉 Welcome to Loft Studio! Your AfricasTalking account is now activated and ready to use. This SMS confirms your API integration is working perfectly!";

        // AfricasTalking API call with basic format for activation
        $postData = [
            'username' => $username,
            'to' => $cleanPhone,
            'message' => $message
        ];

        $headers = [
            'Accept: application/json',
            'Content-Type: application/x-www-form-urlencoded',
            'apiKey: ' . $apiKey
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.sandbox.africastalking.com/version1/messaging');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new Exception("Network error: " . $error);
        }

        if ($httpCode === 401) {
            echo json_encode([
                'success' => false,
                'error' => 'Authentication failed',
                'message' => 'API key authentication failed. Please check your AfricasTalking account status.',
                'debug' => [
                    'api_key_length' => strlen($apiKey),
                    'api_key_prefix' => substr($apiKey, 0, 10) . '...',
                    'api_key_suffix' => '...' . substr($apiKey, -10),
                    'username' => $username,
                    'phone' => $cleanPhone,
                    'http_code' => $httpCode,
                    'response' => $response,
                    'post_data' => $postData,
                    'headers' => $headers,
                    'endpoint' => 'https://api.sandbox.africastalking.com/version1/messaging'
                ]
            ]);
            exit();
        }

        if ($httpCode !== 201) {
            throw new Exception("API error: HTTP $httpCode - $response");
        }

        $result = json_decode($response, true);

        if (!$result || !isset($result['SMSMessageData'])) {
            throw new Exception("Invalid API response");
        }

        $messageData = $result['SMSMessageData'];
        $recipients = $messageData['Recipients'] ?? [];

        if (empty($recipients)) {
            throw new Exception("No recipients in response");
        }

        $recipient = $recipients[0];
        $status = $recipient['status'] ?? 'Unknown';

        echo json_encode([
            'success' => true,
            'message' => '🎉 AfricasTalking account activated successfully!',
            'phone' => $cleanPhone,
            'status' => $status,
            'messageId' => $recipient['messageId'] ?? null,
            'cost' => $recipient['cost'] ?? null,
            'debug' => [
                'http_code' => $httpCode,
                'full_response' => $result
            ]
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage(),
            'debug' => [
                'api_key_configured' => !empty($config['africas_talking_api_key'] ?? ''),
                'username' => $config['africas_talking_username'] ?? 'not set'
            ]
        ]);
    }
    exit();
}

// Debug OTP verification endpoint
if ($requestMethod === 'GET' && strpos($requestUri, '/debug-verify-otp') !== false) {
    header('Content-Type: application/json');

    try {
        $contact = $_GET['contact'] ?? 'test@example.com';
        $otp = $_GET['otp'] ?? '123456';
        $type = $_GET['type'] ?? 'email'; // 'email' or 'phone'

        if ($type === 'email') {
            $emailService = new EmailService($conn);
            $result = $emailService->verifyOTP($contact, $otp);
        } else {
            $smsService = new SMSService($conn);
            $result = $smsService->verifyOTP($contact, $otp);
        }

        echo json_encode([
            'success' => true,
            'message' => 'Debug OTP verification',
            'contact' => $contact,
            'otp' => $otp,
            'type' => $type,
            'result' => $result
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit();
}
if ($requestMethod === 'GET' && strpos($requestUri, '/debug-email-otp') !== false) {
    header('Content-Type: application/json');

    try {
        $email = $_GET['email'] ?? 'test@example.com';

        // Check PHP mail configuration
        $mailConfig = [
            'mail_function_available' => function_exists('mail'),
            'smtp_host' => ini_get('SMTP'),
            'smtp_port' => ini_get('smtp_port'),
            'sendmail_path' => ini_get('sendmail_path')
        ];

        $emailService = new EmailService($conn);
        $result = $emailService->sendOTP($email);

        echo json_encode([
            'success' => true,
            'message' => 'Debug Email OTP request',
            'result' => $result,
            'email' => $email,
            'php_mail_config' => $mailConfig
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage(),
            'email' => $_GET['email'] ?? 'not_provided'
        ]);
    }
    exit();
}

/////////////////////////////USER ROUTING///////////////////////


// Route: /register
if ($requestMethod === 'POST' && strpos($requestUri, '/register') !== false) {
    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !is_array($data)) {
            throw new Exception("Invalid JSON data.");
        }

        $user = new User($conn);
        $response = $user->registerUser($data);

        if ($response['success']) {
            $userId = $conn->lastInsertId(); // newly created ID
            $activity = new Activity($conn);
            $activity->logActivity("Registered account");
        }

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Route: /login
if ($requestMethod === 'POST' && strpos($requestUri, '/login') !== false) {
    header('Content-Type: application/json');

    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    try {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !is_array($data)) {
            throw new Exception("Invalid JSON data.");
        }

        $user = new User($conn);
        $response = $user->loginUser($data);

        if ($response['success']) {
            $_SESSION['user_id'] = $response['user_id'];
            $_SESSION['email'] = $response['email']; // Or whatever you want
            $_SESSION['role'] = $response['role'];

            // Optional: explicit admin flag
            if ($response['role'] === 'admin') {
                $_SESSION['admin_logged_in'] = true;
            }

            $activity = new Activity($conn);
            $activity->logActivity("Logged in");
        }

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Route: /google-auth
if ($requestMethod === 'POST' && strpos($requestUri, '/google-auth') !== false) {
    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents("php://input"), true);

        $user = new User($conn);
        $response = $user->loginOrRegisterGoogleUser($data);

        if ($response['success']) {
            $_SESSION['user_id'] = $response['user_id'];
            $_SESSION['email'] = $response['email']; // Or whatever you want
            $_SESSION['role'] = $response['role'];

            // Optional: explicit admin flag
            if ($response['role'] === 'admin') {
                $_SESSION['admin_logged_in'] = true;
            }

            $activity = new Activity($conn);
            $activity->logActivity("Logged in");
        }


        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Route: /firebase-login
if ($requestMethod === 'POST' && strpos($requestUri, '/firebase-login') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    try {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !is_array($data)) {
            throw new Exception("Invalid JSON data");
        }

        $user = new User($conn);
        $response = $user->loginOrRegisterGoogleUser($data);

        if ($response['success']) {
            $_SESSION['user_id'] = $response['user_id'];
            $_SESSION['email'] = $response['email'];
            $_SESSION['role'] = $response['role'];


            // Optional: explicit admin flag
            if ($response['role'] === 'admin') {
                $_SESSION['admin_logged_in'] = true;
            }

            $activity = new Activity($conn);
            $activity->logActivity("Logged in via Firebase", $response['user_id'], "user");
        }

        echo json_encode($response);

    } catch (Exception $e) {
        // Always return JSON
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Route matching for /check-login
if ($requestMethod === 'GET' && strpos($requestUri, '/check-login') !== false) {
    session_start();

    if (isset($_SESSION['user_id'])) {
        echo json_encode([
            'success' => true,
            'user_id' => $_SESSION['user_id'],
            'role' => $_SESSION['role'],
            'email' => $_SESSION['email'] ?? null  // ← fallback just in case
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'User not logged in.']);
    }
    exit();
}

// Route matching for /check-session (for logout security)
if ($requestMethod === 'GET' && strpos($requestUri, '/check-session') !== false) {
    header("Cache-Control: no-cache, no-store, must-revalidate");
    header("Pragma: no-cache");
    header("Expires: 0");

    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
        echo json_encode([
            'logged_in' => true,
            'user_id' => $_SESSION['user_id'],
            'role' => $_SESSION['role'] ?? 'user'
        ]);
    } else {
        echo json_encode(['logged_in' => false]);
    }
    exit();
}

// Route matching for /profile
if ($requestMethod === 'GET' && strpos($requestUri, '/profile') !== false) {
    authenticate();

    $user = new User($conn);

    $profile = $user->getUserProfile($_SESSION['user_id']);

    if ($profile) {
        echo json_encode(['success' => true, 'data' => $profile]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Profile not found.']);
    }

    exit();
}

// Route matching for /users (GET request)
if ($requestMethod === 'GET' && strpos($requestUri, '/users') !== false) {
    header('Content-Type: application/json');

    try {
        $user = new User($conn);
        $users = $user->getAllUsers();
        echo json_encode(['success' => true, 'data' => $users]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route matching for /update (to update user details)
// if ($requestMethod === 'PUT' && strpos($requestUri, '/update') !== false) {
//     if (!isset($_SESSION['user_id'])) {
//         echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
//         exit();
//     }

//     $user = new User($conn);

//     try {
//         $response = $user->updateUser($data, $_SESSION['user_id']);
//         echo json_encode($response);
//     } catch (Exception $e) {
//         echo json_encode(['success' => false, 'message' => $e->getMessage()]);
//     }

//     exit();
// }
// Route matching for /update (to update user details) - Make more specific to avoid conflicts
if (($requestMethod === 'PUT' || $requestMethod === 'POST') && $requestUri === '/update') {
    error_log("Hit /update route");
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
        exit();
    }

    $user = new User($conn);

    try {
        if ($requestMethod === 'PUT') {
            // JSON body
            $data = json_decode(file_get_contents('php://input'), true);
        } else {
            // POST with form-data
            $data = $_POST;

            // Handle image upload if provided
            if (!empty($_FILES['image']['name'])) {
                $uploadDir = __DIR__ . '/../uploads/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                // Safe, unique filename
                $filename = time() . "_" . preg_replace('/[^A-Za-z0-9_\-\.]/', '_', basename($_FILES['image']['name']));
                $targetPath = $uploadDir . $filename;

                if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                    $data['image'] = '/uploads/' . $filename;
                } else {
                    $data['image'] = null;
                }
            }
        }

        $response = $user->updateUser($data, $_SESSION['user_id']);
        echo json_encode($response);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}

// Route matching for /update-profile-image
if ($requestMethod === 'POST' && strpos($requestUri, '/update-profile-image') !== false) {
    session_start();
    authenticate(); // Make sure user is logged in

    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
        $fileTmp = $_FILES['profile_image']['tmp_name'];
        $fileName = basename($_FILES['profile_image']['name']);
        $fileType = mime_content_type($fileTmp);

        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($fileType, $allowedTypes)) {
            echo json_encode(['success' => false, 'message' => 'Invalid file type.']);
            exit;
        }

        $uploadDir = __DIR__ . '/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $newFileName = uniqid() . '_' . preg_replace('/[^A-Za-z0-9\._-]/', '', $fileName);
        $targetPath = $uploadDir . $newFileName;

        if (move_uploaded_file($fileTmp, $targetPath)) {
            $relativePath = 'uploads/' . $newFileName;

            $user = new User($conn);
            $user->updateUser(['profile_image' => $relativePath], $_SESSION['user_id']);

            echo json_encode(['success' => true, 'message' => 'Profile image updated!', 'path' => $relativePath]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Upload failed.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No file uploaded.']);
    }
    exit;
}

// Route: Change password (POST /change-password)
if ($requestMethod === 'POST' && strpos($requestUri, '/change-password') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    $user = new User($conn);

    try {
        $currentPassword = $_POST['current_password'] ?? '';
        $newPassword = $_POST['new_password'] ?? '';

        $result = $user->changePassword($_SESSION['user_id'], $currentPassword, $newPassword);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    exit();
}

// Route: Get user profile (GET /get-user-profile)
if ($requestMethod === 'GET' && strpos($requestUri, '/get-user-profile') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    $user = new User($conn);

    try {
        $profile = $user->getUserProfile($_SESSION['user_id']);

        if (!$profile) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit();
        }

        echo json_encode([
            'success' => true,
            'user' => $profile
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    exit();
}

// Route: Update user profile (POST /update-user-profile)
if ($requestMethod === 'POST' && strpos($requestUri, '/update-user-profile') !== false) {
    error_log("Hit /update-user-profile route");
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    $user = new User($conn);

    try {
        $result = $user->updateUserProfile($_SESSION['user_id'], $_POST, $_FILES);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    exit();
}

// Route: Get user language (GET /get-user-language)
if ($requestMethod === 'GET' && strpos($requestUri, '/get-user-language') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    $user = new User($conn);

    try {
        $result = $user->getUserLanguage($_SESSION['user_id']);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    exit();
}

// Route: Update user language (POST /update-user-language)
if ($requestMethod === 'POST' && strpos($requestUri, '/update-user-language') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    $user = new User($conn);

    try {
        $language = $_POST['language'] ?? 'en';
        $result = $user->updateUserLanguage($_SESSION['user_id'], $language);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    exit();
}

// Route matching for /update-password
if ($requestMethod === 'POST' && strpos($requestUri, '/update-password') !== false) {
    session_start();
    authenticate();

    header('Content-Type: application/json');

    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['current_password']) || empty($data['new_password'])) {
        echo json_encode(['success' => false, 'message' => 'All fields required.']);
        exit;
    }

    $user = new User($conn);
    $response = $user->updatePassword($_SESSION['user_id'], $data['current_password'], $data['new_password']);

    echo json_encode($response);
    exit();
}

// Route matching for /forgot-password
if ($requestMethod === 'POST' && strpos($requestUri, '/forgot-password') !== false) {
    header('Content-Type: application/json');

    $data = json_decode(file_get_contents('php://input'), true);

    $email = $data['email'] ?? '';

    $user = new User($conn);
    $response = $user->generatePasswordResetToken($email);

    echo json_encode($response);
    exit();
}

// Route matching for /reset-password
if ($requestMethod === 'POST' && strpos($requestUri, '/reset-password') !== false) {
    header('Content-Type: application/json');

    $data = json_decode(file_get_contents('php://input'), true);

    $token = trim($_GET['token'] ?? '');
    $newPassword = $data['new_password'] ?? '';

    $user = new User($conn);
    $response = $user->resetPassword($token, $newPassword);

    echo json_encode($response);
    exit();
}

// Route for soft deleting a single user ( /delete-account )
if ($requestMethod === 'POST' && strpos($requestUri, '/delete-account') !== false) {
    session_start();

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
        exit();
    }

    $user = new User($conn);

    try {
        $response = $user->softDeleteUser($_SESSION['user_id']);

        // Log activity before destroying session
        $activity = new Activity($conn);
        $activity = new Activity($conn);
        $activity->logActivity("Deleted their account", $_SESSION['user_id'], "user");

        // Destroy the session immediately
        session_unset();
        session_destroy();

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}

// Route for suspending a user (POST request to /suspend/{user_id})
if ($requestMethod === 'POST' && preg_match('/suspend\/(\d+)$/', $requestUri, $matches)) {
    $user_id = intval($matches[1]);

    // Use this if JSON:
    $data = json_decode(file_get_contents('php://input'), true);
    $reason = isset($data['sus_reason']) ? trim($data['sus_reason']) : '';

    $user = new User($conn);
    try {
        $response = $user->suspendUser(['user_id' => $user_id, 'sus_reason' => $reason]);

        if (isset($_SESSION['user_id'])) {
            $activity = new Activity($conn);
            $activity->logActivity("Suspended user (reason: $reason)", $_SESSION['user_id'], "user");
        }

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Activate user (set is_suspended = 0)
if ($requestMethod === 'POST' && preg_match('/activate\/(\d+)$/', $requestUri, $matches)) {
    header('Content-Type: application/json');

    $user_id = intval($matches[1]);

    $user = new User($conn);

    try {
        $response = $user->activateUser($user_id);

        if (isset($_SESSION['user_id'])) {
            $activity = new Activity($conn);
            $activity->logActivity("Activated user", $_SESSION['user_id'], "user");
        }

        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to activate user: ' . $e->getMessage()
        ]);
    }

    exit();
}

// Route for user KPIs (/user-kpis)
if ($requestMethod === 'GET' && strpos($requestUri, '/user-kpis') !== false) {
    $user = new User($conn);

    try {
        $response = $user->getUserKPIs();
        echo json_encode(['success' => true, 'data' => $response]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route: Check session (GET /check-session)
if ($requestMethod === 'GET' && strpos($requestUri, '/check-session') !== false) {
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');

    $user = new User($conn);
    $result = $user->checkSession();
    echo json_encode($result);
    exit();
}

// Route: Get 2FA status (GET /get-2fa-status)
if ($requestMethod === 'GET' && strpos($requestUri, '/get-2fa-status') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    $user = new User($conn);

    try {
        $result = $user->get2FAStatus($_SESSION['user_id']);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    exit();
}

// Route: Toggle 2FA (POST /toggle-2fa)
if ($requestMethod === 'POST' && strpos($requestUri, '/toggle-2fa') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    $user = new User($conn);

    try {
        $enabled = isset($_POST['enabled']) && $_POST['enabled'] === '1' ? 1 : 0;
        $result = $user->toggle2FA($_SESSION['user_id'], $enabled);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    exit();
}

// Route: Get referral link (GET /get-referral-link)
if ($requestMethod === 'GET' && strpos($requestUri, '/get-referral-link') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    $user = new User($conn);

    try {
        $result = $user->getReferralLink($_SESSION['user_id']);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    exit();
}

// Route: Send referral email (POST /send-referral-email)
if ($requestMethod === 'POST' && strpos($requestUri, '/send-referral-email') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    $user = new User($conn);

    try {
        $email = trim($_POST['email'] ?? '');
        $name = trim($_POST['name'] ?? '');
        $result = $user->sendReferralEmail($_SESSION['user_id'], $email, $name);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    exit();
}

// Route: Submit support ticket (POST /submit-support-ticket)
if ($requestMethod === 'POST' && strpos($requestUri, '/submit-support-ticket') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    $user = new User($conn);

    try {
        $subject = trim($_POST['subject'] ?? '');
        $category = trim($_POST['category'] ?? '');
        $message = trim($_POST['message'] ?? '');
        $result = $user->submitSupportTicket($_SESSION['user_id'], $subject, $category, $message);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    exit();
}

// Route: Check if contact is unique (POST /auth/check-contact)
if ($requestMethod === 'POST' && strpos($requestUri, '/auth/check-contact') !== false) {
    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid request data'
            ]);
            exit();
        }

        $contact = '';
        $isPhone = false;
        $isEmail = false;

        if (isset($data['phone']) && !empty(trim($data['phone']))) {
            $contact = trim($data['phone']);
            if (filter_var($contact, FILTER_VALIDATE_EMAIL)) {
                $isEmail = true;
            } else {
                $isPhone = true;
            }
        } elseif (isset($data['email']) && !empty(trim($data['email']))) {
            $contact = trim($data['email']);
            $isEmail = true;
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Phone number or email is required'
            ]);
            exit();
        }

        $user = new User($conn);

        if ($isPhone) {
            $smsService = new SMSService($conn);
            $formattedContact = $smsService->formatPhoneNumber($contact);
            $existingUser = $user->getUserByPhone($formattedContact);
        } else {
            $formattedContact = strtolower(trim($contact));
            $existingUser = $user->getUserByEmail($formattedContact);
        }

        echo json_encode([
            'success' => true,
            'available' => !$existingUser,
            'exists' => (bool) $existingUser,
            'contact_type' => $isPhone ? 'phone' : 'email'
        ]);

    } catch (Exception $e) {
        error_log("Check contact error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to check contact. Please try again.'
        ]);
    }

    exit();
}

// Route: Request OTP (POST /auth/request-otp and /auth/request-email-otp)
if ($requestMethod === 'POST' && (strpos($requestUri, '/auth/request-otp') !== false || strpos($requestUri, '/auth/request-email-otp') !== false)) {
    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid request data'
            ]);
            exit();
        }

        // Check if it's a phone number or email
        $contact = '';
        $isPhone = false;
        $isEmail = false;

        if (isset($data['phone']) && !empty(trim($data['phone']))) {
            $contact = trim($data['phone']);
            // Check if it's actually an email
            if (filter_var($contact, FILTER_VALIDATE_EMAIL)) {
                $isEmail = true;
            } else {
                $isPhone = true;
            }
        } elseif (isset($data['email']) && !empty(trim($data['email']))) {
            $contact = trim($data['email']);
            $isEmail = true;
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Phone number or email is required'
            ]);
            exit();
        }

        if (empty($contact)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Contact information cannot be empty'
            ]);
            exit();
        }

        if ($isPhone) {
            // Send SMS OTP
            $smsService = new SMSService($conn);
            $result = $smsService->sendOTP($contact);
        } elseif ($isEmail) {
            // Send Email OTP
            $emailService = new EmailService($conn);
            $result = $emailService->sendOTP($contact);
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid phone number or email format'
            ]);
            exit();
        }

        if ($result['success']) {
            echo json_encode($result);
        } else {
            http_response_code(400);
            echo json_encode($result);
        }

    } catch (Exception $e) {
        error_log("OTP request error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to send OTP. Please try again.'
        ]);
    }

    exit();
}

// Route: Verify OTP (POST /auth/verify-otp and /auth/verify-email-otp)
if ($requestMethod === 'POST' && (strpos($requestUri, '/auth/verify-otp') !== false || strpos($requestUri, '/auth/verify-email-otp') !== false)) {
    header('Content-Type: application/json');

    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    try {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['otp'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'OTP is required'
            ]);
            exit();
        }

        $otp = trim($data['otp']);
        $contact = '';
        $isPhone = false;
        $isEmail = false;

        // Determine if it's phone or email
        if (isset($data['phone']) && !empty(trim($data['phone']))) {
            $contact = trim($data['phone']);
            // Check if it's actually an email
            if (filter_var($contact, FILTER_VALIDATE_EMAIL)) {
                $isEmail = true;
            } else {
                $isPhone = true;
            }
        } elseif (isset($data['email']) && !empty(trim($data['email']))) {
            $contact = trim($data['email']);
            $isEmail = true;
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Phone number or email is required'
            ]);
            exit();
        }

        if (empty($contact) || empty($otp)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Contact information and OTP cannot be empty'
            ]);
            exit();
        }

        // Verify OTP based on type
        if ($isPhone) {
            $smsService = new SMSService($conn);
            $verificationResult = $smsService->verifyOTP($contact, $otp);
            $formattedContact = $smsService->formatPhoneNumber($contact);
        } elseif ($isEmail) {
            $emailService = new EmailService($conn);
            $verificationResult = $emailService->verifyOTP($contact, $otp);
            $formattedContact = strtolower(trim($contact));
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid contact format'
            ]);
            exit();
        }

        if (!$verificationResult['success']) {
            http_response_code(400);
            echo json_encode($verificationResult);
            exit();
        }

        // OTP verified successfully, now handle user authentication
        $user = new User($conn);

        // Check if user exists with this contact information
        if ($isPhone) {
            $existingUser = $user->getUserByPhone($formattedContact);
        } else {
            $existingUser = $user->getUserByEmail($formattedContact);
        }

        if ($existingUser) {
            // User exists, log them in
            $normalizedRole = strtolower($existingUser['role']);

            // Hardcoded admin email override
            if (strtolower($existingUser['email']) === 'khuleealoo@gmail.com') {
                $normalizedRole = 'admin';
            }

            $_SESSION['user_id'] = $existingUser['id'];
            $_SESSION['email'] = $existingUser['email'];
            $_SESSION['phone'] = $existingUser['phone'];
            $_SESSION['role'] = $normalizedRole;
            $_SESSION['auth_method'] = $isPhone ? 'phone' : 'email';

            // Set admin flag if user is admin
            if ($normalizedRole === 'admin') {
                $_SESSION['admin_logged_in'] = true;
            }

            // Log activity
            $activity = new Activity($conn);
            $activity->logActivity("Logged in via " . ($isPhone ? 'phone' : 'email') . " OTP", $existingUser['id'], "user");

            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'user_id' => $existingUser['id'],
                'phone' => $existingUser['phone'],
                'email' => $existingUser['email'],
                'firstname' => $existingUser['firstname'],
                'lastname' => $existingUser['lastname'],
                'role' => $normalizedRole,
                'auth_method' => $isPhone ? 'phone' : 'email',
                'action' => 'login'
            ]);
        } else {
            // User doesn't exist, prepare for registration
            // Store verified contact in session for registration completion
            if ($isPhone) {
                $_SESSION['verified_phone'] = $formattedContact;
                $_SESSION['phone_verified_at'] = time();
            } else {
                $_SESSION['verified_email'] = $formattedContact;
                $_SESSION['email_verified_at'] = time();
            }

            echo json_encode([
                'success' => true,
                'message' => 'Contact verified. Please complete registration.',
                'contact' => $formattedContact,
                'contact_type' => $isPhone ? 'phone' : 'email',
                'action' => 'register',
                'requires_registration' => true
            ]);
        }

    } catch (Exception $e) {
        error_log("OTP verification error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Verification failed. Please try again.'
        ]);
    }

    exit();
}

// Route: Complete OTP registration (POST /auth/complete-otp-registration)
if ($requestMethod === 'POST' && strpos($requestUri, '/auth/complete-otp-registration') !== false) {
    header('Content-Type: application/json');

    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    try {
        $data = json_decode(file_get_contents("php://input"), true);

        // Check if phone or email was recently verified
        $isPhone = isset($_SESSION['verified_phone']) && isset($_SESSION['phone_verified_at']);
        $isEmail = isset($_SESSION['verified_email']) && isset($_SESSION['email_verified_at']);

        if (!$isPhone && !$isEmail) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Contact verification required'
            ]);
            exit();
        }

        // Check if verification is still valid (5 minutes)
        $verificationTime = $isPhone ? $_SESSION['phone_verified_at'] : $_SESSION['email_verified_at'];
        if (time() - $verificationTime > 300) {
            if ($isPhone) {
                unset($_SESSION['verified_phone'], $_SESSION['phone_verified_at']);
            } else {
                unset($_SESSION['verified_email'], $_SESSION['email_verified_at']);
            }
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Verification expired. Please verify again.'
            ]);
            exit();
        }

        if (!$data || !isset($data['firstname']) || !isset($data['lastname'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'First name and last name are required'
            ]);
            exit();
        }

        $firstname = trim($data['firstname']);
        $lastname = trim($data['lastname']);
        $optionalEmail = isset($data['email']) ? trim($data['email']) : null;

        if (empty($firstname) || empty($lastname)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'First name and last name cannot be empty'
            ]);
            exit();
        }

        // Validate optional email if provided
        if ($optionalEmail && !filter_var($optionalEmail, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email format'
            ]);
            exit();
        }

        $user = new User($conn);

        if ($isPhone) {
            $phone = $_SESSION['verified_phone'];
            $email = $optionalEmail; // Optional email for phone registration
            $authMethod = 'phone';
        } else {
            $phone = null; // No phone for email registration
            $email = $_SESSION['verified_email'];
            $authMethod = 'email';
        }

        // Create user with OTP authentication
        $registrationData = [
            'phone' => $phone,
            'email' => $email,
            'firstname' => $firstname,
            'lastname' => $lastname,
            'auth_method' => $authMethod
        ];

        if ($isPhone) {
            $response = $user->registerUserWithPhone($registrationData);
        } else {
            $response = $user->registerUserWithEmail($registrationData);
        }

        if ($response['success']) {
            // Clear verification session data
            if ($isPhone) {
                unset($_SESSION['verified_phone'], $_SESSION['phone_verified_at']);
            } else {
                unset($_SESSION['verified_email'], $_SESSION['email_verified_at']);
            }

            // Set user session
            $_SESSION['user_id'] = $response['user_id'];
            $_SESSION['phone'] = $phone;
            $_SESSION['email'] = $email;
            $_SESSION['role'] = 'user';
            $_SESSION['auth_method'] = $authMethod;

            // Log activity
            $activity = new Activity($conn);
            $activity->logActivity("Registered account via $authMethod", $response['user_id'], "user");

            echo json_encode([
                'success' => true,
                'message' => 'Registration completed successfully',
                'user_id' => $response['user_id'],
                'phone' => $phone,
                'email' => $email,
                'firstname' => $firstname,
                'lastname' => $lastname,
                'role' => 'user',
                'auth_method' => $authMethod
            ]);
        } else {
            http_response_code(400);
            echo json_encode($response);
        }

    } catch (Exception $e) {
        error_log("OTP registration completion error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Registration failed. Please try again.'
        ]);
    }

    exit();
}





////////////////////////////PROPERTY ROUTING///////////////////////


// Route matching for property creation ( /create-property )
if ($requestMethod === 'POST' && strpos($requestUri, '/create-property') !== false) {
    header('Content-Type: application/json');

    // Suppress notices/warnings from breaking JSON
    error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
    ini_set('display_errors', 0);

    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
        exit();
    }

    $property = new Property($conn);

    ob_start();
    try {
        $response = $property->createProperty($_POST);
        ob_clean();

        if ($response['success'] && isset($response['property_id'])) {
            $activity = new Activity($conn);
            $activity->logActivity("Created a new property", $response['property_id'], "property");
        }

        echo json_encode($response);
    } catch (Exception $e) {
        ob_clean();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route matching for getting all properties ( /properties )
if ($requestMethod === 'GET' && strpos($_SERVER['REQUEST_URI'], '/properties') !== false) {
    $filters = [
        'location' => $_GET['location'] ?? null,
        'type' => $_GET['type'] ?? null,
        'min_price' => $_GET['min_price'] ?? null,
        'max_price' => $_GET['max_price'] ?? null,
        'size' => $_GET['size'] ?? null
    ];

    // Create cache key based on filters
    $cacheKey = 'properties_' . md5(json_encode($filters) . ($_GET['page'] ?? '1'));
    $cache = getCache();

    // Try to get from cache
    $cachedResponse = $cache->get($cacheKey);

    if ($cachedResponse !== null) {
        echo json_encode($cachedResponse);
        exit();
    }

    // Not in cache, fetch from database
    try {
        $property = new Property($conn);
        $response = $property->getAllProperties($filters);

        // Cache the response for 5 minutes
        $cache->set($cacheKey, $response, 300);

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route matching for getting all properties including deleted ( /deleted-properties )
if ($requestMethod === 'GET' && strpos($_SERVER['REQUEST_URI'], '/deleted-properties') !== false) {
    $property = new Property($conn);

    $filters = [
        'location' => $_GET['location'] ?? null,
        'type' => $_GET['type'] ?? null,
        'min_price' => $_GET['min_price'] ?? null,
        'max_price' => $_GET['max_price'] ?? null,
        'size' => $_GET['size'] ?? null
    ];

    try {
        $response = $property->getDeletedPropertiesToo($filters);
        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route matching for fetching a single property ( /property/{id} )
if ($requestMethod === 'GET' && preg_match('#/property/(\d+)$#', $requestUri, $matches)) {
    header('Content-Type: application/json');

    $propertyId = $matches[1];

    try {
        $property = new Property($conn);

        $response = $property->getPropertyById($propertyId);

        if ($response['success']) {
            echo json_encode([
                "success" => true,
                "data" => $response['property']
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => $response['message'] ?? 'Unknown error'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }
    exit();
}

// Route matching for fetching all properties of a specific agent ( /agent-properties )
if ($requestMethod === 'GET' && strpos($requestUri, '/agent-properties') !== false) {
    // if (!isset($_SESSION['user_id'])) {
    //     echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
    //     exit();
    // }

    // Example: you can pass the agent_id as a GET param: ?agent_id=1
    $agent_id = isset($_GET['agent_id']) ? (int) $_GET['agent_id'] : null;

    if (!$agent_id) {
        echo json_encode(['success' => false, 'message' => 'Missing agent_id.']);
        exit();
    }

    $property = new Property($conn);

    try {
        $response = $property->getAgentProperties($agent_id);

        if (empty($response)) {
            echo json_encode(['success' => false, 'message' => 'No properties found for this agent.']);
        } else {
            echo json_encode(['success' => true, 'data' => $response]);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}

// Route matching for updating a property ( /property/{id} )
if (($requestMethod === 'PUT' || $requestMethod === 'POST') && preg_match('#/p-update-property/(\d+)$#', $requestUri, $matches)) {
    $propertyId = $matches[1];

    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
        exit();
    }

    $property = new Property($conn);

    try {
        $data = $_POST; // ✅ handles form-data
        $response = $property->updateProperty($data, $propertyId);

        if ($response['success']) {
            $activity = new Activity($conn);
            $activity->logActivity("Updated property", $propertyId, "property");

            // Clear property cache
            $cache = getCache();
            $cache->clear();
        }

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}

// Route for soft deleting a property (/p-delete-property/{property_id})
if ($requestMethod === 'POST' && preg_match('#/p-delete-property/(\d+)#', $requestUri, $matches)) {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
        exit();
    }

    $propertyId = $matches[1];

    $property = new Property($conn);

    try {
        $response = $property->softDeleteProperty($propertyId);

        if ($response['success']) {
            $activity = new Activity($conn);
            $activity->logActivity("Soft deleted property", $propertyId, "property");
        }

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}

// Route for suspending a property (/suspend-property/{property_id})
if ($requestMethod === 'POST' && preg_match('/suspend-property\/(\d+)$/', $requestUri, $matches)) {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Only admins can suspend properties.']);
        exit();
    }

    $property_id = intval($matches[1]);

    // ✅ If JSON: parse the raw input!
    $input = json_decode(file_get_contents('php://input'), true);
    $sus_reason = isset($input['sus_reason']) ? trim($input['sus_reason']) : '';

    $property = new Property($conn);
    try {
        $response = $property->suspendProperty(['property_id' => $property_id, 'sus_reason' => $sus_reason]);

        if ($response['success']) {
            $activity = new Activity($conn);
            $activity->logActivity("Suspended property (reason: $sus_reason)", $property_id, "property");
        }

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for activating a suspended property (/activate-property/{property_id})
if ($requestMethod === 'POST' && preg_match('/activate-property\/(\d+)/', $requestUri, $matches)) {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    $property_id = intval($matches[1]);
    $property = new Property($conn);

    try {
        $response = $property->activateProperty($property_id);

        if ($response['success']) {
            $activity = new Activity($conn);
            $activity->logActivity("Activated property", $property_id, "property");
        }

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit;
}

// Route: /bulk-import-properties
if ($requestMethod === 'POST' && strpos($requestUri, '/bulk-import-properties') !== false) {
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
        exit();
    }

    if (!isset($_FILES['csv_file'])) {
        echo json_encode(['success' => false, 'message' => 'No file uploaded.']);
        exit();
    }

    $property = new Property($conn);

    try {
        $response = $property->bulkImportProperties($_FILES['csv_file']);

        if ($response['success']) {
            $activity = new Activity($conn);
            $activity->logActivity("Bulk imported properties", null, "property");
        }

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}

// Route for property KPIs (/property-kpis)
if ($requestMethod === 'GET' && strpos($requestUri, '/property-kpis') !== false) {
    $property = new Property($conn);

    try {
        $response = $property->getPropertyKPIs();
        echo json_encode(['success' => true, 'data' => $response]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route: Get similar properties (GET /get-similar-properties)
if ($requestMethod === 'GET' && strpos($requestUri, '/get-similar-properties') !== false) {
    header('Content-Type: application/json');

    $propertyId = $_GET['property_id'] ?? null;
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 6;

    if (!$propertyId) {
        echo json_encode(['error' => 'Property ID required']);
        exit();
    }

    $property = new Property($conn);

    try {
        $result = $property->getSimilarProperties($propertyId, $limit);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    exit();
}

// Route: remove image from gallery
if ($requestMethod === 'POST' && strpos($requestUri, '/remove-image') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $propertyId = $input['property_id'] ?? null;
    $imageUrl = $input['url'] ?? null;

    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON payload']);
        exit;
    }

    if (!$propertyId || !$imageUrl) {
        echo json_encode(['success' => false, 'message' => 'Property ID and image URL are required.']);
        exit;
    }

    $property = new Property($conn);

    try {
        $result = $property->removeGalleryImage($propertyId, $imageUrl);
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}





////////////////////////////AGENT ROUTING///////////////////////

// Route for creating a new agent 
if ($requestMethod === 'POST' && strpos($requestUri, '/create-agent') !== false) {
    header('Content-Type: application/json');

    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
        exit();
    }

    $agent = new Agent($conn);

    try {
        // If content-type is multipart/form-data, use $_POST/$_FILES
        if (isset($_POST['firstname'])) {
            $data = $_POST;

            // Handle file upload if an image was provided
            if (!empty($_FILES['image']['name'])) {
                $uploadDir = __DIR__ . '/../uploads/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                $filename = time() . "_" . basename($_FILES['image']['name']);
                $targetPath = $uploadDir . $filename;

                if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                    // Save relative path for DB
                    $data['image'] = '/uploads/' . $filename;
                } else {
                    $data['image'] = null;
                }
            } else {
                $data['image'] = null;
            }

        } else {
            // Otherwise, assume JSON
            $data = json_decode(file_get_contents('php://input'), true);
        }

        $response = $agent->createAgent($data);

        // Log activity
        $activity = new Activity($conn);
        $activity->logActivity("Created agent", $response['id'], "agent");

        echo json_encode($response);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for getting all agents
if ($requestMethod === 'GET' && strpos($requestUri, '/agents') !== false) {
    header('Content-Type: application/json');

    try {
        $agent = new Agent($conn);
        $agents = $agent->getAllAgents();
        echo json_encode(['success' => true, 'data' => $agents]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for getting a single agent
if ($requestMethod === 'GET' && preg_match('#/agent/(\d+)$#', $requestUri, $matches)) {
    $id = intval($matches[1]);
    $agent = new Agent($conn);

    try {
        $response = $agent->getAgent($id);
        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for updating an agent's details
if (($requestMethod === 'PUT' || $requestMethod === 'POST') && preg_match('#/agent-update/(\d+)$#', $requestUri, $matches)) {
    $id = intval($matches[1]);
    $agent = new Agent($conn);

    try {
        if ($requestMethod === 'PUT') {
            // JSON body
            $data = json_decode(file_get_contents('php://input'), true);
        } else {
            // POST with form-data
            $data = $_POST;
            if (!empty($_FILES['image']['name'])) {
                $uploadDir = __DIR__ . '/../uploads/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                // Create a safe, unique filename
                $filename = time() . "_" . preg_replace('/[^A-Za-z0-9_\-\.]/', '_', basename($_FILES['image']['name']));
                $targetPath = $uploadDir . $filename;

                if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                    $data['image'] = '/uploads/' . $filename; // same format as creation
                } else {
                    $data['image'] = null;
                }
            }

        }

        $response = $agent->updateAgent($id, $data);

        $activity = new Activity($conn);
        $activity->logActivity("Updated agent details", $id, "agent");

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for soft deleting an agent
if ($requestMethod === 'POST' && preg_match('#/delete-agent/(\d+)$#', $requestUri, $matches)) {
    $id = intval($matches[1]);
    $agent = new Agent($conn);

    try {
        $response = $agent->deleteAgent($id);

        $activity = new Activity($conn);
        $activity->logActivity("Deleted agent", $id, "agent");

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for agent KPIs (/agent-kpis)
if ($requestMethod === 'GET' && strpos($requestUri, '/agent-kpis') !== false) {
    $agent = new Agent($conn);

    try {
        $response = $agent->getAgentKPIs();
        echo json_encode(['success' => true, 'data' => $response]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}





///////////////////////////STORE ROUTING/////////////////////

// Route for creating a new store 
if ($requestMethod === 'POST' && strpos($requestUri, '/create-store') !== false) {
    header('Content-Type: application/json');

    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
        exit();
    }

    $store = new Store($conn);

    try {
        // Use $_POST instead of json_decode
        $data = $_POST;

        // Handle file upload
        if (!empty($_FILES['logo_image']['name'])) {
            $uploadDir = __DIR__ . '/../uploads/stores/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $fileName = time() . "_" . basename($_FILES['logo_image']['name']);
            $targetPath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['logo_image']['tmp_name'], $targetPath)) {
                $data['logo_image'] = "uploads/stores/" . $fileName;
            }
        }

        $response = $store->createStore($data);

        $activity = new Activity($conn);
        $activity->logActivity("Created store", $response['id'], "store");

        echo json_encode($response);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for getting all stores
if ($requestMethod === 'GET' && strpos($requestUri, '/stores') !== false) {
    header('Content-Type: application/json');

    try {
        $store = new Store($conn);
        $stores = $store->getAllStores();
        echo json_encode(['success' => true, 'data' => $stores]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for getting all stores including deleted ones
if ($requestMethod === 'GET' && strpos($requestUri, '/deleted-stores') !== false) {
    header('Content-Type: application/json');

    try {
        $store = new Store($conn);
        $stores = $store->getDeletedStoresToo();
        echo json_encode(['success' => true, 'data' => $stores]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for getting a single store
if ($requestMethod === 'GET' && preg_match('#/store/(\d+)$#', $requestUri, $matches)) {
    $id = intval($matches[1]);
    $store = new Store($conn);

    try {
        $response = $store->getStore($id);
        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for updating a store's details
if (($requestMethod === 'PUT' || $requestMethod === 'POST') && preg_match('#/store-update/(\d+)$#', $requestUri, $matches)) {
    $id = intval($matches[1]);
    $store = new Store($conn);

    try {
        if ($requestMethod === 'PUT') {
            // JSON body
            $data = json_decode(file_get_contents('php://input'), true);
        } else {
            // POST with form-data
            $data = $_POST;

            if (!empty($_FILES['logo_image']['name'])) {
                $uploadDir = __DIR__ . '/../uploads/stores/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                // Create safe unique filename
                $filename = time() . "_" . preg_replace('/[^A-Za-z0-9_\-\.]/', '_', basename($_FILES['logo_image']['name']));
                $targetPath = $uploadDir . $filename;

                if (move_uploaded_file($_FILES['logo_image']['tmp_name'], $targetPath)) {
                    $data['logo_image'] = 'uploads/stores/' . $filename; // relative path for DB
                } else {
                    $data['logo_image'] = null;
                }
            }
        }

        $response = $store->updateStore($id, $data);

        $activity = new Activity($conn);
        $activity->logActivity("Updated store details", $id, "store");

        echo json_encode($response);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for soft deleting a store
if ($requestMethod === 'POST' && preg_match('#/delete-store/(\d+)$#', $requestUri, $matches)) {
    $id = intval($matches[1]);
    $store = new Store($conn);

    try {
        $response = $store->deleteStore($id);

        $activity = new Activity($conn);
        $activity->logActivity("Deleted store", $id, "store");

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for store KPIs (/store-kpis)
if ($requestMethod === 'GET' && strpos($requestUri, '/store-kpis') !== false) {
    $store = new Store($conn);

    try {
        $response = $store->getStoreKPIs();
        echo json_encode(['success' => true, 'data' => $response]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}





///////////////////////// REVIEWS ROUTING //////////////////////

// Route: Submit review (POST /submit-review)
if ($requestMethod === 'POST' && strpos($requestUri, '/submit-review') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Please log in to submit a review']);
        exit();
    }

    $reviewObj = new Review($conn);

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $result = $reviewObj->submitReview($data);

        $activity = new Activity($conn);
        $activity->logActivity("Posted a review", $data['property_id'] ?? 0, "property");

        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    exit();
}

// Route: Get property reviews (GET /get-property-reviews)
if ($requestMethod === 'GET' && strpos($requestUri, '/get-property-reviews') !== false) {
    header('Content-Type: application/json');

    $propertyId = $_GET['property_id'] ?? null;
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : null;
    $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;

    if (!$propertyId) {
        echo json_encode(['error' => 'Property ID is required']);
        exit();
    }

    $reviewObj = new Review($conn);

    try {
        $result = $reviewObj->getPropertyReviews($propertyId, $limit, $offset);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    exit();
}

// Route to create a review for a specific property (legacy)
if ($requestMethod === 'POST' && strpos($requestUri, '/create-review') !== false) {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
        exit();
    }

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON payload.']);
        exit();
    }

    $propertyId = $data['property_id'] ?? null;
    $review = $data['review'] ?? null;

    if (empty($propertyId) || empty($review)) {
        echo json_encode(['success' => false, 'message' => 'Property ID and review are required.']);
        exit();
    }

    $reviewObj = new Review($conn);

    try {
        $result = $reviewObj->addReview($propertyId, $review);

        $activity = new Activity($conn);
        $activity->logActivity("Posted a review", $propertyId, "property");

        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}

// Route to fetch reviews for a specific property (legacy)
if ($requestMethod === 'GET' && strpos($requestUri, '/get-reviews') !== false) {
    if (!isset($_GET['property_id']) || empty($_GET['property_id'])) {
        echo json_encode(['success' => false, 'message' => 'Property ID is required.']);
        exit();
    }

    $propertyId = $_GET['property_id'];
    $reviewObj = new Review($conn);

    try {
        $result = $reviewObj->getReviewsByProperty($propertyId);
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}

// Route: Like/Unlike review (POST /like-review)
if ($requestMethod === 'POST' && strpos($requestUri, '/like-review') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Please log in to like reviews']);
        exit();
    }

    $reviewObj = new Review($conn);

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $reviewId = $data['review_id'] ?? null;

        if (!$reviewId) {
            echo json_encode(['error' => 'Review ID is required']);
            exit();
        }

        $result = $reviewObj->likeReview($reviewId, $_SESSION['user_id']);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }

    exit();
}

// Route: Get user liked reviews (GET /get-user-liked-reviews)
if ($requestMethod === 'GET' && strpos($requestUri, '/get-user-liked-reviews') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    $propertyId = $_GET['property_id'] ?? null;

    if (!$propertyId) {
        echo json_encode(['liked_reviews' => []]);
        exit();
    }

    $userId = $_SESSION['user_id'] ?? null;

    if (!$userId) {
        echo json_encode(['liked_reviews' => []]);
        exit();
    }

    $reviewObj = new Review($conn);

    try {
        $likedReviews = $reviewObj->getUserLikedReviews($userId, $propertyId);
        echo json_encode(['liked_reviews' => $likedReviews]);
    } catch (Exception $e) {
        echo json_encode(['liked_reviews' => []]);
    }

    exit();
}

// Route to delete review (soft delete)
if ($requestMethod === 'POST' && strpos($requestUri, '/delete-review') !== false) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
        exit();
    }

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON payload.']);
        exit();
    }

    $reviewId = $data['review_id'] ?? null;

    if (empty($reviewId)) {
        echo json_encode(['success' => false, 'message' => 'Review ID is required.']);
        exit();
    }

    $reviewObj = new Review($conn);

    try {
        $result = $reviewObj->deleteReview($reviewId);

        $activity = new Activity($conn);
        $activity->logActivity("Deleted a review", $reviewId, "review");

        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}







///////////////////////////FURNITURE MODEL ROUTING/////////////////////

// Route for creating a new model 
if ($requestMethod === 'POST' && strpos($requestUri, '/create-model') !== false) {
    header('Content-Type: application/json');

    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
        exit();
    }

    $model = new Model($conn);

    try {
        $response = $model->createModel($_POST);

        $activity = new Activity($conn);
        $activity->logActivity("Created a model", $response['id'] ?? null, "model");

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for getting all models
if ($requestMethod === 'GET' && strpos($requestUri, '/models') !== false) {
    header('Content-Type: application/json');

    try {
        $model = new Model($conn);
        $models = $model->getAllModels();
        echo json_encode(['success' => true, 'data' => $models]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for getting all models including deleted
if ($requestMethod === 'GET' && strpos($requestUri, '/deleted-models') !== false) {
    header('Content-Type: application/json');

    try {
        $model = new Model($conn);
        $models = $model->getDeletedModels();
        echo json_encode(['success' => true, 'data' => $models]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for fetching all models of a specific store ( /store-models )
if ($requestMethod === 'GET' && strpos($requestUri, '/store-models') !== false) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
        exit();
    }

    // Example: you can pass the store_id as a GET param: ?store_id=1
    $store_id = isset($_GET['store_id']) ? (int) $_GET['store_id'] : null;

    if (!$store_id) {
        echo json_encode(['success' => false, 'message' => 'Missing store_id.']);
        exit();
    }

    $model = new Model($conn);

    try {
        $response = $model->getStoreModels($store_id);

        if (empty($response)) {
            echo json_encode(['success' => false, 'message' => 'No models found for this store.']);
        } else {
            echo json_encode(['success' => true, 'data' => $response]);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}

// Route for getting a single model
if ($requestMethod === 'GET' && preg_match('#/model/(\d+)$#', $requestUri, $matches)) {
    $id = intval($matches[1]);
    $model = new Model($conn);

    try {
        $response = $model->getModel($id);
        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for updating a model's details
if (($requestMethod === 'PUT' || $requestMethod === 'POST') && preg_match('#/model-update/(\d+)$#', $requestUri, $matches)) {
    $id = intval($matches[1]);
    $model = new Model($conn);

    try {
        if ($requestMethod === 'PUT') {
            // JSON body
            $data = json_decode(file_get_contents('php://input'), true);
        } else {
            // POST with form-data
            $data = $_POST;

            // Handle image/file upload if provided
            if (!empty($_FILES['image']['name'])) {
                $uploadDir = __DIR__ . '/../uploads/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                // Safe, unique filename
                $filename = time() . "_" . preg_replace('/[^A-Za-z0-9_\-\.]/', '_', basename($_FILES['image']['name']));
                $targetPath = $uploadDir . $filename;

                if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                    $data['image'] = '/uploads/' . $filename; // same format as creation
                } else {
                    $data['image'] = null;
                }
            }
        }

        $response = $model->updateModel($id, $data);

        $activity = new Activity($conn);
        $activity->logActivity("Updated a model", $id, "model");

        echo json_encode($response);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}

// Route for soft deleting a model
if ($requestMethod === 'POST' && preg_match('#/delete-model/(\d+)$#', $requestUri, $matches)) {
    $id = intval($matches[1]);
    $model = new Model($conn);

    try {
        $response = $model->deleteModel($id);

        $activity = new Activity($conn);
        $activity->logActivity("Deleted a model", $id, "model");

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for model KPIs (/model-kpis)
if ($requestMethod === 'GET' && strpos($requestUri, '/model-kpis') !== false) {
    $model = new Model($conn);

    try {
        $response = $model->getModelKPIs();
        echo json_encode(['success' => true, 'data' => $response]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}






///////////////////////////FAVORITE MODEL ROUTING/////////////////////

// Route for creating a new favorite model
if ($requestMethod === 'POST' && strpos($requestUri, '/add-favorite-model') !== false) {
    header('Content-Type: application/json');

    $data = json_decode(file_get_contents("php://input"), true);
    $modelId = isset($data['model_id']) ? (int) $data['model_id'] : null;
    $favModel = new FavModel($conn);

    try {
        $response = $favModel->addFavorite($modelId);

        $activity = new Activity($conn);
        $activity->logActivity("Added model to favorites", $modelId, "favorite_model");

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for fetching all favorite models
if ($requestMethod === 'GET' && strpos($requestUri, '/get-favorite-models') !== false) {
    header('Content-Type: application/json');

    $favModel = new FavModel($conn);

    try {
        $favorites = $favModel->getFavorites();
        echo json_encode(['success' => true, 'favorites' => $favorites]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for removing a model from favorites
if ($requestMethod === 'DELETE' && strpos($requestUri, '/remove-favorite-model') !== false) {
    header('Content-Type: application/json');

    $data = json_decode(file_get_contents("php://input"), true);
    $modelId = isset($data['model_id']) ? (int) $data['model_id'] : null;
    $favModel = new FavModel($conn);

    try {
        $response = $favModel->removeFavorite($modelId);

        $activity = new Activity($conn);
        $activity->logActivity("Removed model from favorites", $modelId, "favorite_model");

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}






///////////////////////////FAVORITE PROPERTY ROUTING/////////////////////

// Route for creating a new favorite property
if ($requestMethod === 'POST' && strpos($requestUri, '/add-favorite-property') !== false) {
    header('Content-Type: application/json');

    $data = json_decode(file_get_contents("php://input"), true);
    $propertyId = isset($data['property_id']) ? (int) $data['property_id'] : null;
    $favProperty = new FavProperty($conn);

    try {
        $response = $favProperty->addFavoriteProperty($propertyId);

        $activity = new Activity($conn);
        $activity->logActivity("Added property to favorites", $propertyId, "favorite_property");

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for fetching all favorite properties
if ($requestMethod === 'GET' && strpos($requestUri, '/get-favorite-properties') !== false) {
    header('Content-Type: application/json');

    $favProperty = new FavProperty($conn);

    try {
        $favorites = $favProperty->getFavoriteProperties();
        echo json_encode(['success' => true, 'favorites' => $favorites]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for removing a property from favorites (supports both DELETE and POST)
if (($requestMethod === 'DELETE' || $requestMethod === 'POST') && strpos($requestUri, '/remove-favorite-property') !== false) {
    header('Content-Type: application/json');

    $data = json_decode(file_get_contents("php://input"), true);
    $propertyId = isset($data['property_id']) ? (int) $data['property_id'] : null;
    $favProperty = new FavProperty($conn);

    try {
        $response = $favProperty->removeFavoriteProperty($propertyId);

        $activity = new Activity($conn);
        $activity->logActivity("Removed property from favorites", $propertyId, "favorite_property");

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for toggling favorite property (add if not favorited, remove if favorited)
if ($requestMethod === 'POST' && strpos($requestUri, '/toggle-favorite-property') !== false) {
    header('Content-Type: application/json');

    $data = json_decode(file_get_contents("php://input"), true);
    $propertyId = isset($data['property_id']) ? (int) $data['property_id'] : null;
    $favProperty = new FavProperty($conn);

    try {
        $response = $favProperty->toggleFavoriteProperty($propertyId);

        $activity = new Activity($conn);
        $action = $response['is_favorite'] ? "Added property to favorites" : "Removed property from favorites";
        $activity->logActivity($action, $propertyId, "favorite_property");

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for getting favorite property IDs only
if ($requestMethod === 'GET' && strpos($requestUri, '/get-favorite-ids') !== false) {
    header('Content-Type: application/json');

    $favProperty = new FavProperty($conn);

    try {
        $ids = $favProperty->getFavoriteIds();
        echo json_encode(['success' => true, 'favorite_ids' => $ids]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage(), 'favorite_ids' => []]);
    }
    exit();
}


///////////////////////////PROPERTY IMAGES ROUTING/////////////////////

// Route for uploading property images
if ($requestMethod === 'POST' && strpos($requestUri, '/upload-property-images') !== false) {
    // Set header first to ensure JSON response even on errors
    header('Content-Type: application/json');

    // Suppress any PHP warnings/errors from being output
    error_reporting(E_ERROR | E_PARSE);

    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Authentication required']);
        exit();
    }

    $propertyId = $_POST['property_id'] ?? null;

    if (!$propertyId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Property ID is required', 'debug' => $_POST]);
        exit();
    }

    if (!isset($_FILES['images']) || empty($_FILES['images']['name'][0])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No images provided']);
        exit();
    }

    $categories = $_POST['categories'] ?? [];
    $heroIndex = isset($_POST['hero_index']) && $_POST['hero_index'] !== '' ? (int) $_POST['hero_index'] : null;

    try {
        include_once 'classes/PropertyImage.php';
        include_once 'classes/Activity.php';

        $imageManager = new PropertyImage($conn);
        $result = $imageManager->uploadImages($propertyId, $_FILES['images'], $categories, $heroIndex);

        if ($result['success']) {
            $activity = new Activity($conn);
            $activity->logActivity("Uploaded " . count($result['uploaded']) . " images to property", $propertyId, "property_images");
        }

        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
    }
    exit();
}

// Route for listing property images (RESTful: GET /property-images/{id})
if ($requestMethod === 'GET' && preg_match('/\/property-images\/(\d+)/', $requestUri, $matches)) {
    header('Content-Type: application/json');

    $propertyId = $matches[1];
    $groupByCategory = false; // Return flat array for frontend

    try {
        include_once 'classes/PropertyImage.php';
        $imageManager = new PropertyImage($conn);
        $images = $imageManager->getPropertyImages($propertyId, $groupByCategory);

        echo json_encode([
            'success' => true,
            'property_id' => (int) $propertyId,
            'data' => $images,
            'count' => count($images)
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

// Route for listing property images (legacy: GET /get-property-images?property_id=X)
if ($requestMethod === 'GET' && strpos($requestUri, '/get-property-images') !== false) {
    header('Content-Type: application/json');

    $propertyId = $_GET['property_id'] ?? null;

    if (!$propertyId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Property ID is required']);
        exit();
    }

    $groupByCategory = isset($_GET['group']) ? filter_var($_GET['group'], FILTER_VALIDATE_BOOLEAN) : true;

    try {
        include_once 'classes/PropertyImage.php';
        $imageManager = new PropertyImage($conn);
        $images = $imageManager->getPropertyImages($propertyId, $groupByCategory);

        echo json_encode([
            'success' => true,
            'property_id' => (int) $propertyId,
            'images' => $images,
            'count' => $groupByCategory ? array_sum(array_map('count', $images['categories'])) : count($images)
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

// Route for setting hero image
if ($requestMethod === 'POST' && strpos($requestUri, '/set-hero-image') !== false) {
    header('Content-Type: application/json');

    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Authentication required']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $imageId = $data['image_id'] ?? $_POST['image_id'] ?? null;

    if (!$imageId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Image ID is required']);
        exit();
    }

    try {
        include_once 'classes/PropertyImage.php';
        $imageManager = new PropertyImage($conn);
        $result = $imageManager->setHeroImage($imageId);

        $activity = new Activity($conn);
        $activity->logActivity("Set hero image", $imageId, "property_images");

        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

// Route for deleting property image (RESTful: DELETE /property-images/{id})
if ($requestMethod === 'DELETE' && preg_match('/\/property-images\/(\d+)/', $requestUri, $matches)) {
    header('Content-Type: application/json');

    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Authentication required', 'message' => 'Please log in']);
        exit();
    }

    $imageId = $matches[1];

    if (!$imageId || !is_numeric($imageId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid image ID', 'message' => 'Image ID is required']);
        exit();
    }

    try {
        include_once 'classes/PropertyImage.php';
        include_once 'classes/Activity.php';

        $imageManager = new PropertyImage($conn);
        $result = $imageManager->deleteImage($imageId);

        if ($result['success']) {
            $activity = new Activity($conn);
            $activity->logActivity("Deleted property image", $imageId, "property_images");
        }

        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage(), 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for deleting property image (legacy)
if (($requestMethod === 'DELETE' || $requestMethod === 'POST') && strpos($requestUri, '/delete-property-image') !== false) {
    header('Content-Type: application/json');

    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Authentication required']);
        exit();
    }

    $imageId = null;
    if ($requestMethod === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);
        $imageId = $data['image_id'] ?? null;
    } else {
        $imageId = $_POST['image_id'] ?? null;
    }

    if (!$imageId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Image ID is required']);
        exit();
    }

    try {
        include_once 'classes/PropertyImage.php';
        $imageManager = new PropertyImage($conn);
        $result = $imageManager->deleteImage($imageId);

        $activity = new Activity($conn);
        $activity->logActivity("Deleted property image", $imageId, "property_images");

        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}

// Route for migrating gallery images
if ($requestMethod === 'GET' && strpos($requestUri, '/migrate-gallery-images') !== false) {
    header('Content-Type: application/json');

    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Authentication required']);
        exit();
    }

    try {
        include_once 'classes/PropertyImage.php';
        $imageManager = new PropertyImage($conn);

        $propertyId = $_GET['property_id'] ?? null;

        if ($propertyId) {
            $result = $imageManager->migrateGalleryImages($propertyId);
            echo json_encode([
                'success' => $result['success'],
                'property_id' => (int) $propertyId,
                'migrated' => $result['migrated'] ?? 0,
                'message' => $result['message']
            ]);
        } else {
            $stmt = $conn->query("SELECT id, name FROM properties WHERE gallery IS NOT NULL AND gallery != '[]' AND gallery != '' AND is_deleted = 0");
            $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($properties)) {
                echo json_encode(['success' => true, 'message' => 'No properties with gallery images found', 'migrated_properties' => 0, 'total_images' => 0]);
                exit();
            }

            $results = [];
            $totalImages = 0;
            $successCount = 0;

            foreach ($properties as $property) {
                try {
                    $result = $imageManager->migrateGalleryImages($property['id']);
                    $results[] = ['property_id' => $property['id'], 'property_name' => $property['name'], 'success' => $result['success'], 'migrated' => $result['migrated'] ?? 0, 'message' => $result['message']];
                    if ($result['success']) {
                        $successCount++;
                        $totalImages += $result['migrated'] ?? 0;
                    }
                } catch (Exception $e) {
                    $results[] = ['property_id' => $property['id'], 'property_name' => $property['name'], 'success' => false, 'error' => $e->getMessage()];
                }
            }

            echo json_encode(['success' => true, 'total_properties' => count($properties), 'migrated_properties' => $successCount, 'total_images' => $totalImages, 'details' => $results, 'message' => "Migrated {$totalImages} images from {$successCount} properties"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}


///////////////////////// REPORT ROUTING //////////////////////

// Ensure user is logged in before submitting a report
if ($requestMethod === 'POST' && strpos($requestUri, '/create-report') !== false) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
        exit();
    }

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON payload.']);
        exit();
    }

    $propertyId = $data['property_id'] ?? null;
    $reason = $data['reason'] ?? null;

    if (empty($propertyId) || empty($reason)) {
        echo json_encode(['success' => false, 'message' => 'Property ID and reason are required.']);
        exit();
    }

    try {
        $report = new Report($conn);
        $result = $report->createReport($_SESSION['user_id'], $propertyId, $reason);
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}

// Fetch all reports (Admin only)
if ($requestMethod === 'GET' && strpos($requestUri, '/get-reports') !== false) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized access.']);
        exit();
    }

    try {
        $report = new Report($conn);
        $result = $report->getAllReports();
        echo json_encode([
            'success' => true,
            'reports' => $result
        ]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}


// Fetch a single report by ID (Admin only)
if ($requestMethod === 'GET' && preg_match('/\/get-report\/(\d+)/', $requestUri, $matches)) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized access.']);
        exit();
    }

    $reportId = (int) $matches[1];

    try {
        $report = new Report($conn);
        $result = $report->getReportById($reportId);

        if (!$result) {
            echo json_encode(['success' => false, 'message' => 'Report not found.']);
        } else {
            echo json_encode(['success' => true, 'data' => $result]);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}


// Update report status (Admin only)
if ($requestMethod === 'POST' && strpos($requestUri, '/update-report-status') !== false) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized access.']);
        exit();
    }

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON payload.']);
        exit();
    }

    $reportId = $data['report_id'] ?? null;
    $status = $data['status'] ?? null;

    if (empty($reportId) || empty($status)) {
        echo json_encode(['success' => false, 'message' => 'Report ID and status are required.']);
        exit();
    }

    try {
        $report = new Report($conn);
        $result = $report->updateReportStatus($reportId, $status);
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}







///////////////////////// BOOKINGS ROUTING //////////////////////

// Route for creating a booking (POST /create-booking) - new format
if ($requestMethod === 'POST' && strpos($requestUri, '/create-booking') !== false && !preg_match('#/create-booking/(\d+)$#', $requestUri)) {
    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['property_id'])) {
            throw new Exception('Property ID is required');
        }

        $propertyId = intval($data['property_id']);
        $booking = new Booking($conn);
        $response = $booking->addBooking($propertyId, $data);

        if ($response['success']) {
            $activity = new Activity($conn);
            $activity->logActivity("Created a booking", $propertyId, "booking");
        }

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for creating a booking (POST /create-booking/{id}) - legacy format
if ($requestMethod === 'POST' && preg_match('#/create-booking/(\d+)$#', $requestUri, $matches)) {
    $propertyId = intval($matches[1]);
    $booking = new Booking($conn);

    try {
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $response = $booking->addBooking($propertyId, $data);

        $activity = new Activity($conn);
        $activity->logActivity("Created a booking", $propertyId, "booking");

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for getting current user's bookings (GET /my-bookings)
if ($requestMethod === 'GET' && strpos($requestUri, '/my-bookings') !== false) {
    header('Content-Type: application/json');
    $booking = new Booking($conn);

    try {
        $bookings = $booking->getPropertyBookings();
        echo json_encode(['success' => true, 'bookings' => $bookings, 'count' => count($bookings)]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for updating booking status (PUT /change-booking-status/{id})
if (($requestMethod === 'PUT' || $requestMethod === 'POST') && preg_match('#/change-booking-status/(\d+)$#', $requestUri, $matches)) {
    $bookingId = intval($matches[1]);
    $booking = new Booking($conn);

    try {
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        if (!isset($data['status'])) {
            throw new Exception("Status is required.");
        }
        $response = $booking->updateBookingStatus($bookingId, $data['status']);

        $activity = new Activity($conn);
        $activity->logActivity("Updated booking status to {$data['status']}", $bookingId, "booking");

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for canceling a booking (POST /cancel-booking)
if ($requestMethod === 'POST' && strpos($requestUri, '/cancel-booking') !== false) {
    header('Content-Type: application/json');
    $booking = new Booking($conn);

    try {
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        if (!isset($data['booking_id'])) {
            throw new Exception('Booking ID is required.');
        }

        $bookingId = intval($data['booking_id']);
        $response = $booking->cancelBooking($bookingId);

        $activity = new Activity($conn);
        $activity->logActivity("Cancelled booking", $bookingId, "booking");

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for admin: get all bookings (GET /all-bookings)
if ($requestMethod === 'GET' && strpos($requestUri, '/all-bookings') !== false) {
    $booking = new Booking($conn);

    try {
        $response = $booking->getAllBookings();
        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for booking KPIs (/booking-kpis)
if ($requestMethod === 'GET' && strpos($requestUri, '/booking-kpis') !== false) {
    $booking = new Booking($conn);

    try {
        $response = $booking->getBookingKPIs();
        echo json_encode(['success' => true, 'data' => $response]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for per-property KPIs (/booking-property-kpis)
if ($requestMethod === 'GET' && strpos($requestUri, '/booking-property-kpis') !== false) {
    $booking = new Booking($conn);

    try {
        $response = $booking->getPerPropertyKPIs();
        echo json_encode(['success' => true, 'data' => $response]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}






///////////////////////// REVENUE ROUTING //////////////////////

// Add revenue (POST /revenue)
if ($requestMethod === 'POST' && strpos($requestUri, '/revenue') !== false) {
    $data = json_decode(file_get_contents("php://input"), true);
    $revenue = new Revenue($conn);

    try {
        $id = $revenue->addRevenue($data);
        echo json_encode(['success' => true, 'id' => $id]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Get revenue for a property (GET /revenue/property/{id})
if ($requestMethod === 'GET' && preg_match('#/revenue-property/(\d+)$#', $requestUri, $matches)) {
    $propertyId = intval($matches[1]);
    $revenue = new Revenue($conn);

    try {
        $rows = $revenue->getRevenueByProperty($propertyId);
        echo json_encode(['success' => true, 'data' => $rows]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Get overall revenue (GET /revenue/summary)
if ($requestMethod === 'GET' && strpos($requestUri, '/revenue/summary') !== false) {
    $revenue = new Revenue($conn);

    try {
        $summary = $revenue->getAllRevenue();
        echo json_encode(['success' => true, 'data' => $summary]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Get revenue trends (GET /revenue/trends)
if ($requestMethod === 'GET' && strpos($requestUri, '/revenue/trends') !== false) {
    $revenue = new Revenue($conn);

    try {
        $rows = $revenue->getRevenueByMonth();
        echo json_encode(['success' => true, 'data' => $rows]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}






//////////////////////////// DASHBOARD ANALYTICS ROUTING ///////////////////////

// Route for dashboard KPIs (/analytics/kpis)
if ($requestMethod === 'GET' && strpos($requestUri, '/analytics/kpis') !== false) {
    $analytics = new Analytic($conn);

    try {
        $response = $analytics->getDashboardKPIs();
        echo json_encode(['success' => true, 'data' => $response]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for booking trends (/analytics/bookings-trends)
if ($requestMethod === 'GET' && strpos($requestUri, '/analytics/bookings-trends') !== false) {
    $analytics = new Analytic($conn);

    try {
        $response = $analytics->getBookingTrends();
        echo json_encode(['success' => true, 'data' => $response]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for revenue breakdown (/analytics/revenue)
if ($requestMethod === 'GET' && strpos($requestUri, '/analytics/revenue') !== false) {
    $analytics = new Analytic($conn);

    try {
        $response = $analytics->getRevenueBreakdown();
        echo json_encode(['success' => true, 'data' => $response]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for property types distribution (/analytics/property-types)
if ($requestMethod === 'GET' && strpos($requestUri, '/analytics/property-types') !== false) {
    $analytics = new Analytic($conn);

    try {
        $response = $analytics->getPropertyTypeDistribution();
        echo json_encode(['success' => true, 'data' => $response]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for user growth (/analytics/user-growth)
if ($requestMethod === 'GET' && strpos($requestUri, '/analytics/user-growth') !== false) {
    $analytics = new Analytic($conn);

    try {
        $response = $analytics->getUserGrowth();
        echo json_encode(['success' => true, 'data' => $response]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for popular properties this month (/analytics/popular-properties)
if ($requestMethod === 'GET' && strpos($requestUri, '/analytics/popular-properties') !== false) {
    $analytics = new Analytic($conn);

    try {
        $response = $analytics->getPopularProperties();
        echo json_encode(['success' => true, 'data' => $response]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for popular models this month (/analytics/popular-models)
if ($requestMethod === 'GET' && strpos($requestUri, '/analytics/popular-models') !== false) {
    $analytics = new Analytic($conn);

    try {
        $response = $analytics->getPopularModels();
        echo json_encode(['success' => true, 'data' => $response]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}






///////////////////////// VIEWS ROUTING //////////////////////

// Route for recording a property view (POST /record-property-view/{id})
if ($requestMethod === 'POST' && preg_match('#/record-property-view/(\d+)$#', $requestUri, $matches)) {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    $propertyId = intval($matches[1]);
    error_log("Property view recording attempt for ID: " . $propertyId);

    $view = new View($conn);
    $activity = new Activity($conn);

    try {
        $view->recordPropertyView($propertyId);
        error_log("Property view recorded in property_views table for ID: " . $propertyId);

        $userId = $_SESSION['user_id'] ?? null;
        error_log("User ID from session: " . ($userId ?? 'null'));

        if ($userId) {
            $activity->logActivity("viewed a property", $propertyId, "property_view");
            error_log("Activity logged for user ID: " . $userId);
        } else {
            $activity->logActivity("Someone viewed a property", $propertyId, "property_view");
            error_log("Activity logged for anonymous user");
        }

        echo json_encode(['success' => true, 'message' => 'Property view recorded', 'property_id' => $propertyId, 'user_id' => $userId]);
    } catch (Exception $e) {
        error_log("Error recording property view: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for recording a model view (POST /record-model-view/{id})
if ($requestMethod === 'POST' && preg_match('#/record-model-view/(\d+)$#', $requestUri, $matches)) {
    $modelId = intval($matches[1]);
    $view = new View($conn);
    $activity = new Activity($conn);

    try {
        $view->recordModelView($modelId);

        $userId = $_SESSION['user_id'] ?? null;
        $username = $userId ? "User #$userId" : "Someone";

        $activity->logActivity("$username viewed a model", $modelId, "model_view");

        echo json_encode(['success' => true, 'message' => 'Model view recorded']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for getting total property views (GET /property-views/{id})
if ($requestMethod === 'GET' && preg_match('#/property-views/(\d+)$#', $requestUri, $matches)) {
    $propertyId = intval($matches[1]);
    $view = new View($conn);

    try {
        $count = $view->getPropertyViews($propertyId);
        echo json_encode(['success' => true, 'property_id' => $propertyId, 'views' => $count]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route for getting total model views (GET /model-views/{id})
if ($requestMethod === 'GET' && preg_match('#/model-views/(\d+)$#', $requestUri, $matches)) {
    $modelId = intval($matches[1]);
    $view = new View($conn);

    try {
        $count = $view->getModelViews($modelId);
        echo json_encode(['success' => true, 'model_id' => $modelId, 'views' => $count]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}





///////////////////////// ACTIVITY ROUTING //////////////////////

// Route for fetching recent activities (GET /recent-activities)
if ($requestMethod === 'GET' && strpos($requestUri, '/recent-activities') !== false) {
    header('Content-Type: application/json');

    $activity = new Activity($conn);

    try {
        // Optional limit query param: ?limit=20
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;

        $recentActivities = $activity->getRecent($limit);

        echo json_encode([
            'success' => true,
            'data' => $recentActivities
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }

    exit();
}



///////////////////////// NOTIFICATIONS ROUTING //////////////////////

$notificationObj = new Notification($conn);

// Route: Get all notifications for the logged-in user (GET /get-notifications)
if ($requestMethod === 'GET' && strpos($requestUri, '/get-notifications') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    try {
        $result = $notificationObj->getUserNotifications();
        // Match the format expected by frontend
        echo json_encode([
            'success' => $result['success'],
            'notifications' => $result['data']
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    exit();
}

// Route: Get unread notification count (GET /get-unread-count)
if ($requestMethod === 'GET' && strpos($requestUri, '/get-unread-count') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        echo json_encode(['count' => 0]);
        exit();
    }

    try {
        $count = $notificationObj->getUnreadCount();
        echo json_encode([
            'success' => true,
            'count' => $count
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'count' => 0,
            'error' => $e->getMessage()
        ]);
    }

    exit();
}

// Route: Mark a notification as read (POST /mark-notification-read)
if ($requestMethod === 'POST' && strpos($requestUri, '/mark-notification-read') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $notificationId = $data['notification_id'] ?? $data['id'] ?? null;

    if (empty($notificationId)) {
        echo json_encode(['error' => 'Notification ID required']);
        exit();
    }

    try {
        $result = $notificationObj->markAsRead($notificationId);
        echo json_encode([
            'success' => $result['success'],
            'message' => $result['message']
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }

    exit();
}

// Route: Create a new notification (POST /create-notification)
if ($requestMethod === 'POST' && strpos($requestUri, '/create-notification') !== false) {
    header('Content-Type: application/json');
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $userId = $data['user_id'] ?? null;
    $message = $data['message'] ?? '';
    $type = $data['type'] ?? 'system';
    $notifyAll = $data['notify_all'] ?? false;

    if (empty($message)) {
        echo json_encode(['success' => false, 'error' => 'Notification message is required.']);
        exit();
    }

    try {
        if ($notifyAll) {
            // Broadcast to all users (admin only)
            $result = $notificationObj->createNotification([
                'message' => $message,
                'type' => $type
            ]);
        } elseif ($userId) {
            // Single user notification
            $result = $notificationObj->createNotification([
                'user_id' => $userId,
                'message' => $message,
                'type' => $type
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'User ID required']);
            exit();
        }

        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}

// Route: Delete a notification (admin only)
if ($requestMethod === 'POST' && strpos($requestUri, '/delete-notification') !== false) {
    if (session_status() == PHP_SESSION_NONE)
        session_start();
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
        exit();
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $notificationId = $data['id'] ?? null;

    if (empty($notificationId)) {
        echo json_encode(['success' => false, 'message' => 'Notification ID is required.']);
        exit();
    }

    try {
        $result = $notificationObj->deleteNotification($notificationId);
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    exit();
}



// ============================================
// ADMIN DASHBOARD ROUTES
// ============================================

// Route: Get dashboard statistics
if ($requestMethod === 'GET' && strpos($requestUri, '/admin/dashboard-stats') !== false) {
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
        exit();
    }

    try {
        // Get total properties
        $stmt = $conn->prepare("SELECT COUNT(*) as total, SUM(CASE WHEN is_deleted = 1 THEN 1 ELSE 0 END) as inactive FROM properties");
        $stmt->execute();
        $properties = $stmt->fetch(PDO::FETCH_ASSOC);

        // Get total users
        $stmt = $conn->prepare("SELECT COUNT(*) as total, SUM(CASE WHEN is_suspended = 1 THEN 1 ELSE 0 END) as inactive FROM users WHERE is_deleted = 0");
        $stmt->execute();
        $users = $stmt->fetch(PDO::FETCH_ASSOC);

        // Get total agents
        $agent = new Agent($conn);
        $agentKPIs = $agent->getAgentKPIs();

        // Get bookings data with monthly breakdown and revenue calculation (estimate $1500 per booking)
        $stmt = $conn->prepare("
            SELECT 
                COUNT(*) as total_bookings, 
                COUNT(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) THEN 1 END) as this_month,
                COUNT(*) * 1500 as total_revenue,
                COUNT(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) THEN 1 END) * 1500 as monthly_revenue
            FROM bookings
        ");
        $stmt->execute();
        $bookings = $stmt->fetch(PDO::FETCH_ASSOC);

        // Get models/furniture count (using a simple count for now - you can expand this)
        $stmt = $conn->prepare("
            SELECT 
                COUNT(DISTINCT CASE WHEN gallery IS NOT NULL AND gallery != '[]' THEN 1 END) as total_models,
                COUNT(DISTINCT CASE WHEN gallery IS NOT NULL AND gallery != '[]' AND is_deleted = 0 THEN 1 END) as active_models
            FROM properties
        ");
        $stmt->execute();
        $models = $stmt->fetch(PDO::FETCH_ASSOC);
        $models['inactive'] = $models['total_models'] - $models['active_models'];

        // Get monthly bookings for chart (last 6 months)
        $stmt = $conn->prepare("
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM bookings 
            WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month ASC
        ");
        $stmt->execute();
        $monthlyBookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get quarterly revenue (estimate $1500 per booking)
        $stmt = $conn->prepare("
            SELECT 
                QUARTER(created_at) as quarter,
                COUNT(*) * 1500 as revenue
            FROM bookings 
            WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
            GROUP BY QUARTER(created_at)
            ORDER BY quarter ASC
        ");
        $stmt->execute();
        $quarterlyRevenue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get property types breakdown
        $stmt = $conn->prepare("SELECT type, COUNT(*) as count FROM properties WHERE is_deleted = 0 GROUP BY type");
        $stmt->execute();
        $propertyTypes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get monthly user registrations (last 6 months)
        $stmt = $conn->prepare("
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM users 
            WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month ASC
        ");
        $stmt->execute();
        $userGrowth = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get recent activities with user names
        $stmt = $conn->prepare("
            SELECT 
                CASE 
                    WHEN a.action LIKE '%logged in%' THEN CONCAT(COALESCE(u.firstname, 'User'), ' ', COALESCE(u.lastname, ''), ' logged in')
                    WHEN a.action LIKE '%viewed a property%' THEN CONCAT(COALESCE(u.firstname, 'Someone'), ' ', COALESCE(u.lastname, ''), ' viewed a property')
                    WHEN a.action LIKE '%added to favorites%' THEN CONCAT(COALESCE(u.firstname, 'User'), ' ', COALESCE(u.lastname, ''), ' added property to favorites')
                    WHEN a.action LIKE '%removed from favorites%' THEN CONCAT(COALESCE(u.firstname, 'User'), ' ', COALESCE(u.lastname, ''), ' removed property from favorites')
                    WHEN a.action LIKE '%booked%' THEN CONCAT(COALESCE(u.firstname, 'User'), ' ', COALESCE(u.lastname, ''), ' booked a property viewing')
                    WHEN a.action LIKE 'Someone%' THEN a.action
                    ELSE CONCAT(COALESCE(u.firstname, 'User'), ' ', COALESCE(u.lastname, ''), ': ', a.action)
                END as action,
                a.reference_id as property_id, 
                a.created_at, 
                'activity' as type 
            FROM activities a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            UNION ALL
            SELECT 
                CONCAT(firstname, ' ', lastname, ' registered') as action, 
                NULL as property_id, 
                created_at, 
                'user' as type 
            FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND is_deleted = 0
            ORDER BY created_at DESC 
            LIMIT 10
        ");
        $stmt->execute();
        $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => [
                'properties' => $properties,
                'users' => $users,
                'agents' => $agentKPIs,
                'models' => $models,
                'bookings' => $bookings,
                'propertyTypes' => $propertyTypes,
                'userGrowth' => $userGrowth,
                'monthlyBookings' => $monthlyBookings,
                'quarterlyRevenue' => $quarterlyRevenue,
                'activities' => $activities
            ]
        ]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route: Get popular properties
if ($requestMethod === 'GET' && strpos($requestUri, '/admin/popular-properties') !== false) {
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
        exit();
    }

    try {
        $stmt = $conn->prepare("
            SELECT p.id, p.name, p.gallery,
                   (SELECT CONCAT('/hauzisha/uploads/properties/', file_base, '-thumb.jpg')
                    FROM property_images 
                    WHERE property_id = p.id AND is_hero = 1 
                    LIMIT 1) AS hero_image,
                   COUNT(a.id) as views
            FROM properties p
            LEFT JOIN activities a ON p.id = a.reference_id AND a.reference_type = 'property_view'
            WHERE p.is_deleted = 0
            GROUP BY p.id
            ORDER BY views DESC, p.created_at DESC
            LIMIT 5
        ");
        $stmt->execute();
        $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Process gallery for each property
        foreach ($properties as &$property) {
            if ($property['gallery']) {
                $property['gallery'] = json_decode($property['gallery'], true);
            }
        }

        echo json_encode(['success' => true, 'data' => $properties]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route: Get popular models/furniture
if ($requestMethod === 'GET' && strpos($requestUri, '/admin/popular-models') !== false) {
    if (session_status() == PHP_SESSION_NONE)
        session_start();

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
        exit();
    }

    try {
        // Get properties with the most gallery images (representing furniture models)
        $stmt = $conn->prepare("
            SELECT 
                p.id, 
                p.name,
                JSON_LENGTH(p.gallery) as model_count,
                (SELECT CONCAT('/hauzisha/uploads/properties/', file_base, '-thumb.jpg')
                 FROM property_images 
                 WHERE property_id = p.id AND is_hero = 1 
                 LIMIT 1) AS hero_image,
                COUNT(b.id) as usage_count
            FROM properties p
            LEFT JOIN bookings b ON p.id = b.property_id
            WHERE p.is_deleted = 0 AND p.gallery IS NOT NULL AND p.gallery != '[]'
            GROUP BY p.id
            ORDER BY model_count DESC, usage_count DESC
            LIMIT 5
        ");
        $stmt->execute();
        $models = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $models]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

////////////////////////////LOFT³ TOUR ROUTING///////////////////////

// Route: Create LOFT³ tour (Admin only)
if ($requestMethod === 'POST' && strpos($requestUri, '/create-loft-tour') !== false) {
    header('Content-Type: application/json');

    try {
        $loftTour = new LoftTour($conn);
        $response = $loftTour->createTour($data);
        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code($e->getMessage() === 'Authentication required' ? 401 :
            ($e->getMessage() === 'Admin access required' ? 403 : 400));
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route: Get LOFT³ tour by ID (Public read access)
if ($requestMethod === 'GET' && strpos($requestUri, '/get-loft-tour') !== false) {
    header('Content-Type: application/json');

    $tourId = $_GET['id'] ?? null;
    if (!$tourId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tour ID required']);
        exit();
    }

    try {
        $loftTour = new LoftTour($conn);
        $response = $loftTour->getTourById($tourId);
        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route: Get tours for a property (Public read access)
if ($requestMethod === 'GET' && strpos($requestUri, '/get-property-tours') !== false) {
    header('Content-Type: application/json');

    $propertyId = $_GET['property_id'] ?? null;
    if (!$propertyId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Property ID required']);
        exit();
    }

    try {
        $loftTour = new LoftTour($conn);
        $response = $loftTour->getPropertyTours($propertyId);
        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route: Update LOFT³ tour (Admin only)
if ($requestMethod === 'POST' && strpos($requestUri, '/update-loft-tour') !== false) {
    header('Content-Type: application/json');

    $tourId = $data['tour_id'] ?? null;
    if (!$tourId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tour ID required']);
        exit();
    }

    try {
        $loftTour = new LoftTour($conn);
        $response = $loftTour->updateTour($tourId, $data);
        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code($e->getMessage() === 'Authentication required' ? 401 :
            ($e->getMessage() === 'Admin access required' ? 403 : 400));
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route: Delete LOFT³ tour (Admin only)
if ($requestMethod === 'POST' && strpos($requestUri, '/delete-loft-tour') !== false) {
    header('Content-Type: application/json');

    $tourId = $data['tour_id'] ?? null;
    if (!$tourId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tour ID required']);
        exit();
    }

    try {
        $loftTour = new LoftTour($conn);
        $response = $loftTour->deleteTour($tourId);
        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code($e->getMessage() === 'Authentication required' ? 401 :
            ($e->getMessage() === 'Admin access required' ? 403 : 400));
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route: Upload panorama image (Admin only)
if ($requestMethod === 'POST' && strpos($requestUri, '/upload-tour-panorama') !== false) {
    header('Content-Type: application/json');

    $tourId = $_POST['tour_id'] ?? null;
    if (!$tourId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tour ID required']);
        exit();
    }

    if (!isset($_FILES['panorama'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Panorama image required']);
        exit();
    }

    try {
        $loftTour = new LoftTour($conn);
        $nodeData = [
            'scene_name' => $_POST['scene_name'] ?? 'Scene',
            'image_order' => $_POST['image_order'] ?? 0,
            'yaw' => $_POST['yaw'] ?? 0,
            'pitch' => $_POST['pitch'] ?? 0,
            'fov' => $_POST['fov'] ?? 1.5708
        ];

        $response = $loftTour->uploadPanorama($tourId, $nodeData, $_FILES['panorama']);
        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code($e->getMessage() === 'Authentication required' ? 401 :
            ($e->getMessage() === 'Admin access required' ? 403 : 400));
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route: Add hotspot between images (Admin only)
if ($requestMethod === 'POST' && strpos($requestUri, '/add-tour-hotspot') !== false) {
    header('Content-Type: application/json');

    $sourceImageId = $data['source_image_id'] ?? null;
    $targetImageId = $data['target_image_id'] ?? null;

    if (!$sourceImageId || !$targetImageId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Source and target image IDs required']);
        exit();
    }

    try {
        $loftTour = new LoftTour($conn);
        $hotspotData = [
            'yaw' => $data['yaw'] ?? 0,
            'pitch' => $data['pitch'] ?? 0,
            'label' => $data['label'] ?? 'Navigate'
        ];

        $response = $loftTour->addHotspot($sourceImageId, $targetImageId, $hotspotData);
        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code($e->getMessage() === 'Authentication required' ? 401 :
            ($e->getMessage() === 'Admin access required' ? 403 : 400));
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route: Process metadata for automatic tour generation (Admin only)
if ($requestMethod === 'POST' && strpos($requestUri, '/process-tour-metadata') !== false) {
    header('Content-Type: application/json');

    $tourId = $_POST['tour_id'] ?? null;
    if (!$tourId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tour ID required']);
        exit();
    }

    if (!isset($_FILES['metadata'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Metadata file required']);
        exit();
    }

    try {
        $loftTour = new LoftTour($conn);
        $response = $loftTour->processMetadata($tourId, $_FILES['metadata']);
        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code($e->getMessage() === 'Authentication required' ? 401 :
            ($e->getMessage() === 'Admin access required' ? 403 : 400));
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route: Track tour analytics
if ($requestMethod === 'POST' && strpos($requestUri, '/track-tour-analytics') !== false) {
    header('Content-Type: application/json');

    $tourId = $data['tour_id'] ?? null;
    if (!$tourId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tour ID required']);
        exit();
    }

    try {
        $loftTour = new LoftTour($conn);
        $response = $loftTour->trackAnalytics($tourId, $data);
        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route: Validate tour nodes (Admin only)
if ($requestMethod === 'POST' && strpos($requestUri, '/validate-tour-nodes') !== false) {
    header('Content-Type: application/json');

    $tourId = $data['tour_id'] ?? null;
    if (!$tourId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tour ID required']);
        exit();
    }

    try {
        $loftTour = new LoftTour($conn);
        $response = $loftTour->validateTourNodes($tourId);
        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

// Route: Generate metadata template (Admin only)
if ($requestMethod === 'POST' && strpos($requestUri, '/generate-template') !== false) {
    requireAdmin();
    header('Content-Type: application/json');

    try {
        $templateType = $_POST['template_type'] ?? 'basic';
        $options = [
            'tourName' => $_POST['tour_name'] ?? 'New Tour',
            'description' => $_POST['description'] ?? 'A beautiful property walkthrough',
            'nodeCount' => (int) ($_POST['node_count'] ?? 3),
            'includeLayerExamples' => isset($_POST['include_layers']),
            'propertyType' => $_POST['property_type'] ?? 'residential'
        ];

        require_once __DIR__ . '/classes/LoftTourTemplateGenerator.php';
        $generator = new LoftTourTemplateGenerator();

        if (($_POST['format'] ?? 'json') === 'csv') {
            $template = $generator->generateCSVTemplate($options);
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="loft-tour-template.csv"');
            echo $template;
            exit;
        } else {
            $template = $generator->generateBasicTemplate($options);
            echo json_encode([
                'success' => true,
                'template' => $template
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Template generation failed: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Route: Validate metadata (Admin only)
if ($requestMethod === 'POST' && strpos($requestUri, '/validate-metadata') !== false) {
    requireAdmin();
    header('Content-Type: application/json');

    try {
        $metadata = json_decode(file_get_contents('php://input'), true);
        if (!$metadata) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON metadata'
            ]);
            exit;
        }

        require_once __DIR__ . '/classes/LoftTourTemplateGenerator.php';
        $generator = new LoftTourTemplateGenerator();
        $validationResult = $generator->validateMetadata($metadata);

        echo json_encode([
            'success' => true,
            'validation' => $validationResult,
            'report' => $generator->generateErrorReport($validationResult)
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Validation failed: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Route: Create template files (Admin only)
if ($requestMethod === 'POST' && strpos($requestUri, '/create-template-files') !== false) {
    requireAdmin();
    header('Content-Type: application/json');

    try {
        $templateType = $_POST['template_type'] ?? 'basic';
        $options = [
            'tourName' => $_POST['tour_name'] ?? 'Generated Tour',
            'nodeCount' => (int) ($_POST['node_count'] ?? 3),
            'propertyType' => $_POST['property_type'] ?? 'residential'
        ];

        require_once __DIR__ . '/classes/LoftTourTemplateGenerator.php';
        $generator = new LoftTourTemplateGenerator();
        $result = $generator->createTemplateFiles($templateType, $options);

        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Template file creation failed: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Route: Generate shareable URL (Public access)
if ($requestMethod === 'POST' && strpos($requestUri, '/generate-share-url') !== false) {
    header('Content-Type: application/json');

    $tourId = $data['tour_id'] ?? null;

    if (!$tourId) {
        echo json_encode(['success' => false, 'message' => 'Tour ID is required']);
        exit;
    }

    try {
        $loftTour = new LoftTour($conn);
        $options = [
            'startNode' => $data['start_node'] ?? null,
            'autoplay' => $data['autoplay'] ?? false,
            'hideUI' => $data['hide_ui'] ?? false,
            'fullscreen' => $data['fullscreen'] ?? false
        ];

        $response = $loftTour->generateShareableUrl($tourId, $options);

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

// Route: Generate embed code (Public access)
if ($requestMethod === 'POST' && strpos($requestUri, '/generate-embed-code') !== false) {
    header('Content-Type: application/json');

    $tourId = $data['tour_id'] ?? null;

    if (!$tourId) {
        echo json_encode(['success' => false, 'message' => 'Tour ID is required']);
        exit;
    }

    try {
        $loftTour = new LoftTour($conn);
        $options = [
            'width' => $data['width'] ?? '100%',
            'height' => $data['height'] ?? '600px',
            'allowFullscreen' => $data['allow_fullscreen'] ?? true,
            'showUI' => $data['show_ui'] ?? true,
            'autoplay' => $data['autoplay'] ?? false,
            'startNode' => $data['start_node'] ?? ''
        ];

        $response = $loftTour->generateEmbedCode($tourId, $options);

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

// Route: Generate offline package (Admin only)
if ($requestMethod === 'POST' && strpos($requestUri, '/generate-offline-package') !== false) {
    requireAdmin();
    header('Content-Type: application/json');

    $tourId = $data['tour_id'] ?? null;

    if (!$tourId) {
        echo json_encode(['success' => false, 'message' => 'Tour ID is required']);
        exit;
    }

    try {
        $loftTour = new LoftTour($conn);
        $response = $loftTour->generateOfflinePackage($tourId);

        echo json_encode($response);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
    exit;
}

// Route: Get all tours for admin management (Admin only)
if ($requestMethod === 'GET' && strpos($requestUri, '/admin/virtual-tours') !== false) {
    header('Content-Type: application/json');

    try {
        // Check admin authentication
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Admin authentication required']);
            exit();
        }

        // Get all tours with property information
        $stmt = $conn->prepare("
            SELECT t.*, p.name as property_name, p.location as property_location,
                   COUNT(n.id) as scenes_count,
                   COALESCE(SUM(a.views), 0) as total_views,
                   u.firstname, u.lastname
            FROM loft_tours t
            LEFT JOIN properties p ON t.property_id = p.id
            LEFT JOIN loft_tour_nodes n ON t.id = n.tour_id
            LEFT JOIN (
                SELECT tour_id, COUNT(*) as views 
                FROM loft_tour_analytics 
                WHERE event_type = 'tour_view' 
                GROUP BY tour_id
            ) a ON t.id = a.tour_id
            LEFT JOIN users u ON t.created_by = u.id
            WHERE t.deleted_at IS NULL AND (p.is_deleted = 0 OR p.is_deleted IS NULL)
            GROUP BY t.id
            ORDER BY t.created_at DESC
        ");

        $stmt->execute();
        $tours = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format the data for the admin interface
        $formattedTours = array_map(function ($tour) {
            return [
                'id' => (int) $tour['id'],
                'name' => $tour['tour_name'],
                'property_id' => (int) $tour['property_id'],
                'property_name' => $tour['property_name'] ?? 'Unknown Property',
                'property_location' => $tour['property_location'] ?? '',
                'status' => $tour['status'],
                'views' => (int) $tour['total_views'],
                'created_at' => $tour['created_at'],
                'updated_at' => $tour['updated_at'],
                'scenes_count' => (int) $tour['scenes_count'],
                'tour_type' => 'panoramic', // Default type
                'description' => $tour['description'] ?? '',
                'created_by' => trim(($tour['firstname'] ?? '') . ' ' . ($tour['lastname'] ?? '')),
                'tour_url' => $tour['status'] === 'active' ? "/loft-tour/viewer.html?tour={$tour['id']}" : null,
                'thumbnail' => "/images/property-placeholder.jpg" // Default thumbnail
            ];
        }, $tours);

        echo json_encode([
            'success' => true,
            'data' => $formattedTours,
            'total' => count($formattedTours)
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch tours: ' . $e->getMessage()
        ]);
    }
    exit();
}

// Route: Get tour statistics for admin dashboard (Admin only)
if ($requestMethod === 'GET' && strpos($requestUri, '/admin/virtual-tours/stats') !== false) {
    header('Content-Type: application/json');

    try {
        // Check admin authentication
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Admin authentication required']);
            exit();
        }

        // Get tour statistics
        $stats = [];

        // Total tours
        $stmt = $conn->prepare("SELECT COUNT(*) as total FROM loft_tours WHERE deleted_at IS NULL");
        $stmt->execute();
        $stats['total_tours'] = (int) $stmt->fetchColumn();

        // Active tours
        $stmt = $conn->prepare("SELECT COUNT(*) as active FROM loft_tours WHERE deleted_at IS NULL AND status = 'active'");
        $stmt->execute();
        $stats['active_tours'] = (int) $stmt->fetchColumn();

        // Draft tours
        $stmt = $conn->prepare("SELECT COUNT(*) as draft FROM loft_tours WHERE deleted_at IS NULL AND status = 'draft'");
        $stmt->execute();
        $stats['draft_tours'] = (int) $stmt->fetchColumn();

        // Total views
        $stmt = $conn->prepare("SELECT COUNT(*) as views FROM loft_tour_analytics WHERE event_type = 'tour_view'");
        $stmt->execute();
        $stats['total_views'] = (int) $stmt->fetchColumn();

        // Tours created this month
        $stmt = $conn->prepare("
            SELECT COUNT(*) as new_this_month 
            FROM loft_tours 
            WHERE deleted_at IS NULL 
            AND YEAR(created_at) = YEAR(CURRENT_DATE()) 
            AND MONTH(created_at) = MONTH(CURRENT_DATE())
        ");
        $stmt->execute();
        $stats['new_this_month'] = (int) $stmt->fetchColumn();

        echo json_encode([
            'success' => true,
            'stats' => $stats
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch statistics: ' . $e->getMessage()
        ]);
    }
    exit();
}

echo json_encode(['success' => false, 'message' => 'Invalid request.']);

