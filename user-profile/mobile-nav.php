<?php
$current_page = basename($_SERVER['REQUEST_URI'], ".php");
?>

<!-- Mobile Bottom Nav -->
<nav class="mobile-bottom-nav d-lg-none">
  <a href="dashboard.php" class="nav-item <?php echo $current_page == 'index' ? 'active' : ''; ?>">
    <i class="fa-solid fa-magnifying-glass mb-1"></i>
    <span>Explore</span>
  </a>
  <a href="favourites.php" class="nav-item <?php echo $current_page == 'favorites' ? 'active' : ''; ?>">
    <i class="fa-regular fa-heart"></i>
    <span>Favorites</span>
  </a>
  <a href="profile.php" class="nav-item <?php echo $current_page == 'profile' ? 'active' : ''; ?>">
    <i class="fa-regular fa-user mb-1"></i>
    <span>Profile</span>
  </a>
</nav>