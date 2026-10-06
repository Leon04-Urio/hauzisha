<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

$config = parse_ini_file(__DIR__ . '/../api/config/app.ini');
$clientID = $config['google_client_id'] ?? '';
$clientSecret = $config['google_client_secret'] ?? '';
$redirectUri = "http://localhost/hauzisha/auth/callback.php";

if (isset($_GET['code'])) {
    // Exchange code for access token
    $token_url = "https://oauth2.googleapis.com/token";
    $postData = [
        'code' => $_GET['code'],
        'client_id' => $clientID,
        'client_secret' => $clientSecret,
        'redirect_uri' => $redirectUri,
        'grant_type' => 'authorization_code'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $token_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);

    if (!$response) {
        die('cURL error: ' . curl_error($ch));
    }

    curl_close($ch);

    $tokenData = json_decode($response, true);

    if (isset($tokenData['access_token'])) {
        $accessToken = $tokenData['access_token'];

        // Get user info
        $userInfo = file_get_contents("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" . $accessToken);
        $userData = json_decode($userInfo, true);

        // Example response: ["id","email","name","image"]

        // ⚡️ Optional: auto-register/login this user in your DB
        require_once "../api/config/database.php"; // your DB connection
        require_once "../api/classes/User.php";   // your User class

        $conn = Database::getInstance();

        $user = new User($conn);
        $email = $userData['email'];
        $firstname = explode(' ', $userData['name'])[0];
        $lastname = isset(explode(' ', $userData['name'])[1]) ? explode(' ', $userData['name'])[1] : '';

        // Check if user exists, else create
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        if ($stmt->rowCount() === 0) {
            // Create account with random password
            $password = bin2hex(random_bytes(8));
            $user->registerUser([
                'firstname' => $firstname,
                'lastname' => $lastname,
                'email' => $email,
                'password' => $password
            ]);
        }

        // Log them in
        $_SESSION['email'] = $email;
        $_SESSION['name'] = $userData['name'];
        $_SESSION['image'] = $userData['image'];

        // Fetch role and user_id for proper redirect
        $stmt2 = $conn->prepare("SELECT id, role FROM users WHERE email = :email");
        $stmt2->execute([':email' => $email]);
        $dbUser = $stmt2->fetch(PDO::FETCH_ASSOC);
        if ($dbUser) {
            $_SESSION['user_id'] = $dbUser['id'];
            $_SESSION['role'] = $dbUser['role'];
        }

        $redirectUrl = (isset($dbUser['role']) && $dbUser['role'] === 'admin')
            ? '/hauzisha/control-room/dashboard.php'
            : '/hauzisha/user-profile/dashboard.php';

        header("Location: " . $redirectUrl);
        exit();
    } else {
        echo "Error fetching token: " . $response;
    }
} else {
    echo "No authorization code provided.";
}