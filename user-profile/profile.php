<?php
require_once '../api/helpers/security.php';

// Require authentication and prevent caching
Security::requireAuth();
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <title>HAUZISHA - Profile</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <link rel="icon" type="image/svg+xml" href="../images/logo.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <link rel="preconnect" href="https://fonts.gstatic.com/">
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap"
        rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.gstatic.com/">
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="../css/font-awesome.min.css">
    <link rel="stylesheet" href="../css/ionicons.min.css">
    <link rel="stylesheet" href="../css/flaticon.css">

    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="css/footer-fix.css">

    <style>
        body {
            background-color: #000;
            color: #fff;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .profile-header {
            text-align: center;
            padding: 2rem 1rem 1rem;
            background: #000;
        }

        .profile-header img {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            border: 2px solid #fff;
            margin-bottom: 0.5rem;
            margin-left: 0.5rem;
            object-fit: cover;
        }

        #profileEmail {
            color: #999;
            font-size: 0.9rem;
            margin-top: 0.3rem;
        }

        .edit-icon {
            position: relative;
            display: inline-block;
        }

        .edit-icon span {
            position: absolute;
            /* bottom: 0; */
            right: -3px;
            bottom: 6px;
            background: #ffd700;
            color: #000;
            padding: 1px 5px;
            border-radius: 20%;
            font-size: 0.8rem;
            cursor: pointer;
        }

        .edit-icon:hover span {
            background: #ffed4e;
        }

        .menu-list {
            margin-top: 1rem;
        }

        .menu-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 1rem;
            /* border-bottom: 1px solid #222; */
            color: #fff;
            font-weight: 600;
            text-decoration: none;
            transition: background 0.2s;
        }

        .menu-item:hover {
            background: #000;
            color: #fff;
        }

        .menu-item i {
            font-size: 1rem;
            color: #fff;
            font-weight: bold;
            margin-right: 1rem;
        }

        .menu-item span {
            flex-grow: 1;
            font-size: 1.1rem;
            letter-spacing: 0.4px;
            word-spacing: 2px;
        }

        .logout-btn {
            text-align: start;
            padding: 1rem;
            color: red;
            /* font-weight: bold; */
            text-decoration: none;
        }

        .logout-btn:hover {
            background: #000;
            color: red;
        }

        .bottom-nav {
            background: #000;
            border-top: 1px solid #222;
            display: flex;
            justify-content: space-around;
            padding: 0.6rem 0;
            position: fixed;
            bottom: 0;
            width: 100%;
        }

        .bottom-nav a {
            color: #aaa;
            text-decoration: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: 0.8rem;
        }

        .bottom-nav a.active {
            color: #ffd700;
        }

        .bottom-nav i {
            font-size: 1.4rem;
            margin-bottom: 0.2rem;
        }

        .menu-item div {
            display: flex;
            align-items: center;
        }

        .menu-item div i {
            width: 24px;
            /* all icons become same width */
            text-align: center;
        }
    </style>
</head>

<body>

    <section class="container-sm">
        <h6 class="mt-5" style="font-weight: 900; cursor: pointer;" onclick="window.history.back()"><span><i
                    class="fa fa-angle-left" aria-hidden="true"></i></span>&nbsp;&nbsp;&nbsp;Profile</h6>
        <div class="profile-header">
            <div class="edit-icon" style="cursor: pointer;" id="editProfileBtn" data-bs-toggle="modal"
                data-bs-target="#editProfileModal">
                <img id="profileImage" src="../images/male_cv.jpg" alt="Profile">
                <span><i class="fa fa-pen"></i></span>
            </div>
            <h5 class="mt-2 mb-0 fw-bold" style="font-size: 1.3rem; color: #fff;" id="profileName">Loading...</h5>
            <p class="my-0" style="font-size: 0.8rem;" id="profileEmail"></p>
        </div>

        <!-- Profile Details Section -->
        <div class="profile-details mt-3 mb-3"
            style="padding: 1rem; background: #000; border-radius: 8px; display: none;">
            <div class="detail-item" style="padding: 0.5rem 0; border-bottom: 1px solid #222;">
                <small style="color: #888;">Email</small>
                <p id="profileEmailDetail" style="margin: 0.2rem 0 0 0; color: #fff;">Loading...</p>
            </div>
            <div class="detail-item" style="padding: 0.5rem 0; border-bottom: 1px solid #222;">
                <small style="color: #888;">Account Type</small>
                <p id="profileRole" style="margin: 0.2rem 0 0 0; color: #fff; text-transform: capitalize;">Loading...
                </p>
            </div>
            <div class="detail-item" style="padding: 0.5rem 0;">
                <small style="color: #888;">Member Since</small>
                <p id="profileMemberSince" style="margin: 0.2rem 0 0 0; color: #fff;">Loading...</p>
            </div>
        </div>

        <div class="menu-list">
            <a href="bookings.php" class="menu-item">
                <div><i class="fa fa-calendar" aria-hidden="true"></i><span>My Bookings</span></div><i
                    class="fa fa-chevron-right"></i>
            </a>
            <a href="favourites.php" class="menu-item">
                <div><i class="fa fa-heart-o" aria-hidden="true"></i><span>Favourites</span></div><i
                    class="fa fa-chevron-right"></i>
            </a>
            <!-- <a href="#" class="menu-item"><div><i class="fa-solid fa-user"></i><span>Profile</span></div><i class="fa fa-chevron-right"></i></a> -->
            <a href="notifications.php" class="menu-item">
                <div><i class="fa fa-bell-o" aria-hidden="true"></i><span>Notifications</span></div><i
                    class="fa fa-chevron-right"></i>
            </a>
            <a href="security.php" class="menu-item">
                <div><i class="fa fa-shield" aria-hidden="true"></i><span>Security</span></div><i
                    class="fa fa-chevron-right"></i>
            </a>
            <a href="language.php" class="menu-item">
                <div><i class="fa fa-language" aria-hidden="true"></i><span>Language</span></div><i
                    class="fa fa-chevron-right"></i>
            </a>
            <a href="help-center.php" class="menu-item">
                <div><i class="fa fa-info" aria-hidden="true"></i><span>Help Center</span></div><i
                    class="fa fa-chevron-right"></i>
            </a>
            <hr style="color: #555;" />
        </div>

        <hr style="color: #555;" />
        <p
            style="color: red; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.75rem; margin: 0.75rem 0 0.5rem;">
            Red Zone</p>

        <div class="mb-5 mt-4">
            <a href="/hauzisha/api/logout.php" id="logoutLink" class="logout-btn">
                <span><i class="fa-solid fa-arrow-right-from-bracket"></i></span>
                &nbsp;&nbsp;&nbsp;
                Logout
            </a>
        </div>

    </section>

    <!-- Edit Profile Modal -->
    <div class="modal fade" id="editProfileModal" tabindex="-1" aria-labelledby="editProfileModalLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="background: #000; color: #fff; border: 1px solid #333;">
                <div class="modal-header" style="border-bottom: 1px solid #333;">
                    <h5 class="modal-title" id="editProfileModalLabel" style="color: #fff;">
                        <img src="../images/logo.png" alt="Logo" style="height: 40px; width: 40px;">
                        &nbsp;EDIT PROFILE
                    </h5>
                    <button type="button" class="btn-close btn-close-white" style="font-size: 0.6rem;"
                        data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="editProfileForm" enctype="multipart/form-data">
                        <div class="mb-3">
                            <label for="editFirstname" class="form-label">First Name</label>
                            <input type="text" class="form-control" id="editFirstname" name="firstname" required
                                style="background: transparent; color: #999; border: 1px solid lightgrey;">
                            <div class="invalid-feedback">First name is required.</div>
                        </div>
                        <div class="mb-3">
                            <label for="editLastname" class="form-label">Last Name</label>
                            <input type="text" class="form-control" id="editLastname" name="lastname" required
                                style="background: transparent; color: #999; border: 1px solid lightgrey;">
                            <div class="invalid-feedback">Last name is required.</div>
                        </div>
                        <div class="mb-3">
                            <label for="editEmail" class="form-label">Email</label>
                            <input type="email" class="form-control" id="editEmail" name="email" required
                                style="background: transparent; color: #999; border: 1px solid lightgrey;">
                            <div class="invalid-feedback">Valid email is required.</div>
                        </div>
                        <div class="mb-3">
                            <label for="editProfilePicture" class="form-label">Profile Picture</label>
                            <input type="file" class="form-control" id="editProfilePicture" name="profile_picture"
                                accept="image/jpeg,image/jpg,image/png,image/gif"
                                style="background: transparent; color: #999; border: 1px solid lightgrey;">
                            <small class="text-muted">Allowed: JPG, JPEG, PNG, GIF (Max 5MB)</small>
                            <div class="invalid-feedback">Invalid image file.</div>
                        </div>
                        <div id="updateMessage" class="alert d-none" role="alert"></div>
                    </form>
                </div>
                <div class="modal-footer" style="border-top: 1px solid #333;">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="saveProfileBtn"
                        style="background: #ffd700; color: #000; border: none;">Save Changes</button>
                </div>
            </div>
        </div>
    </div>

    <?php include 'footer2.php'; ?>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../js/logout-handler.js" defer></script>
    <script src="../js/toast.js" defer></script>
    <script src="../js/profile-dropdown.js" defer></script>
    <script src="js/footer2.js"></script>
    <script src="js/profile.js"></script>
</body>

</html>