<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../api/config/database.php';
require_once __DIR__ . '/../api/classes/User.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$conn = Database::getInstance();

$userProfile = null;

if (!empty($_SESSION['user_id'])) {
    $userObj = new User($conn);
    $userProfile = $userObj->getUserProfile($_SESSION['user_id']);
}

// fallback values
$firstname = $userProfile['firstname'] ?? 'User';
$lastname  = $userProfile['lastname'] ?? '';
$email     = $userProfile['email'] ?? '';
$image     = $userProfile['image'] ?? '../images/male_cv.jpg';

// Dynamically set greeting
date_default_timezone_set('Africa/Nairobi'); // Change timezone if needed
$hour = (int) date('H');

if ($hour >= 5 && $hour < 12) {
    $greeting = "Good Morning";
} elseif ($hour >= 12 && $hour < 18) {
    $greeting = "Good Afternoon";
} else {
    $greeting = "Good Evening";
}

$current_page = basename($_SERVER['REQUEST_URI'], ".php");
?>
<main class="user-main-content px-1 py-1">
    <div class="d-flex justify-content-between align-items-center text-white mb-0 header-icons">
        <a href="profile.php">
            <div class="user-profile" id="userProfile">
                <div class="d-flex title-collapse">
                    <img src="<?= htmlspecialchars($image) ?>" alt="PFP" class="rounded-circle mr-2" style="width:45px; height:45px; object-fit:cover;">
                    <div>
                        <p class="mb-0" style="font-size: 0.8rem; color: #ccc;"><?= $greeting ?></p>
                        <h6 class="text-white"><?= htmlspecialchars("$firstname $lastname") ?></h6>
                    </div>
                    <!-- <div class="dropdown text-white" id="profileDropdown" style="color: #fff;">
                        <a href="dashboard.php" style="text-decoration: none; color: inherit; background: none;">
                            <div class="d-flex">
                                <img src="<?= htmlspecialchars($image) ?>" alt="PFP" class="rounded-circle mr-2" style="width:35px; height:35px; object-fit:cover;">
                                <div>
                                    <h6 class="mb-0" style="font-size: 0.8rem; color: #fff;"><?= htmlspecialchars("$firstname $lastname") ?></h6>
                                    <p class="mb-0 mt-0" style="font-size: 0.7rem; color: #999999; font-weight: 500;"><?= htmlspecialchars($email) ?></p>
                                </div>
                            </div>
                        </a>
                        <hr class="mb-0"/>
                        <a href="profile.php"><i class="far fa-user"></i> View Profile</a>
                        <a href="bookings.php"><i class="far fa-calendar-check"></i> My Bookings</a>
                        <a href="favourites.php"><i class="far fa-heart"></i> Favourites</a>
                        <a href="notifications.php"><i class="far fa-bell"></i> Notifications</a>
                        <hr class="mb-0"/>
                        <a href="/hauzisha/api/logout.php" id="logoutLink" style="color: red;"><i class="fas fa-sign-out-alt" style="color: red;"></i> Logout</a>
                    </div> -->
                </div>
            </div>
        </a>
        <div>
            <a href="notifications.php"><i class="fa fa-bell text-warning"></i></a>
        </div>
    </div>
</main>