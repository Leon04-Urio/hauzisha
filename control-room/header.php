<?php
require_once __DIR__ . '/../api/config/database.php';
require_once __DIR__ . '/../api/classes/User.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function renderDashboardHeader($pageTitle) {
    $conn = Database::getInstance();
    $userProfile = null;

    if (!empty($_SESSION['user_id'])) {
        $userObj = new User($conn);
        $userProfile = $userObj->getUserProfile($_SESSION['user_id']);
    }

    // Fallback values
    $firstname = $userProfile['firstname'] ?? 'User';
    $lastname  = $userProfile['lastname'] ?? '';
    $image     = $userProfile['image'] ?? '../images/male_cv.jpg';
?>
<main class="main-content px-1 pt-3" >
    <div class="d-flex justify-content-between align-items-center text-white mb-3 header-icons">
        <div class="d-flex title-collapse">
            <button id="toggleSidebar" class="toggle-btn mb-2">
                <i class="fas fa-bars"></i>
            </button>
            <h6 class="mt-2 mx-1" style="font-size: 1rem;"><?= htmlspecialchars($pageTitle) ?></h6>
        </div>
        <div class="d-flex align-items-center gap-3">
            <a href="notifications.php"><i class="fa fa-bell text-warning"></i></a>
            <a href="profile.php">
                <div class="d-flex align-items-center gap-2">
                    <img src="<?= htmlspecialchars($image) ?>" alt="PFP" class="rounded-circle" style="width:35px; height:35px; object-fit:cover;">
                    <h6 class="mb-0 text-white" style="font-size: 0.85rem;">
                        <?= htmlspecialchars(trim("$firstname $lastname")) ?>
                    </h6>
                </div>
            </a>
        </div>
    </div>
</main>
<?php
}
?>
