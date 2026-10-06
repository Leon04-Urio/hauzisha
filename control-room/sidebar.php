<?php
$currentPage = basename($_SERVER['PHP_SELF']);
?>

<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <img src="../images/bidbrick-logo.png" class="pr-0 mr-0"
            style="height: 40px; width: 40px; filter: invert(1) brightness(2);" />
        <h2 class="sidebar-logo pl-0 ml-0" style="color: #fff; font-weight: bold;"><span> </span>CONTROL ROOM</h2>
    </div>

    <nav class="sidebar-nav">
        <a href="dashboard.php" class="<?= $currentPage == 'dashboard.php' ? 'active' : '' ?>">
            <i class="fas fa-home"></i> <span>DASHBOARD</span>
        </a>
        <a href="users.php" class="<?= $currentPage == 'users.php' ? 'active' : '' ?>">
            <i class="fas fa-users"></i> <span>USERS</span>
        </a>
        <a href="properties.php" class="<?= $currentPage == 'properties.php' ? 'active' : '' ?>">
            <i class="fas fa-building"></i> <span>PROPERTIES</span>
        </a>
        <a href="agents.php" class="<?= $currentPage == 'agents.php' ? 'active' : '' ?>">
            <i class="fa fa-male" aria-hidden="true"></i> <span>AGENTS</span>
        </a>
        <a href="bookings.php" class="<?= $currentPage == 'bookings.php' ? 'active' : '' ?>">
            <i class="fas fa-calendar-check"></i> <span>BOOKINGS</span>
        </a>
        <a href="../api/logout.php" class="logout" style="color: red;">
            <i class="fas fa-sign-out-alt"></i> <span>LOGOUT</span>
        </a>
    </nav>
</aside>