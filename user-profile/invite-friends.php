<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    header("Location: /hauzisha/index.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <title>HAUZISHA - Invite Friends</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="icon" type="image/svg+xml" href="images/logo.png">
    <link rel="preconnect" href="https://fonts.gstatic.com/">
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../css/font-awesome.min.css">
    <link rel="stylesheet" href="../css/ionicons.min.css">
    <link rel="stylesheet" href="../css/animate.css">
    <link rel="stylesheet" href="../css/flaticon.css">
    <link rel="stylesheet" href="../css/tiny-slider.css">
    <link rel="stylesheet" href="../css/glightbox.min.css">
    <link rel="stylesheet" href="../css/aos.css">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../control-room/admin.css">
    <link rel="stylesheet" href="css/footer-fix.css">

    <style>
        body {
            background-color: #000;
            color: #fff;
            min-height: 100vh;
        }

        .referral-card {
            background: #111;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .referral-link-box {
            background: #222;
            border: 1px solid #444;
            border-radius: 8px;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1rem;
        }

        .referral-link {
            color: #ffd700;
            word-break: break-all;
            flex: 1;
            margin-right: 1rem;
        }

        .btn-copy {
            background: #ffd700;
            color: #000;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
        }

        .btn-copy:hover {
            background: #ffed4e;
        }

        .share-buttons {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            flex-wrap: wrap;
        }

        .share-btn {
            flex: 1;
            min-width: 120px;
            padding: 0.8rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.3s;
        }

        .share-btn.email {
            background: #ffd700;
            color: #000;
        }

        .share-btn.whatsapp {
            background: #25D366;
            color: #fff;
        }

        .share-btn.twitter {
            background: #1DA1F2;
            color: #fff;
        }

        .share-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3);
        }

        .form-control {
            background: #222;
            color: #fff;
            border: 1px solid #444;
        }

        .form-control:focus {
            background: #222;
            color: #fff;
            border-color: #ffd700;
            box-shadow: 0 0 0 0.2rem rgba(255, 215, 0, 0.25);
        }

        .btn-primary {
            background: #ffd700;
            color: #000;
            border: none;
            font-weight: 600;
        }

        .btn-primary:hover {
            background: #ffed4e;
            color: #000;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-top: 1rem;
        }

        .stat-card {
            background: #1a1a1a;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
        }

        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #ffd700;
        }

        .stat-label {
            color: #888;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>

<section class="container-sm">
    <h6 class="mt-5" style="font-weight: 900; cursor: pointer;" onclick="window.history.back()">
        <span><i class="fa fa-angle-left" aria-hidden="true"></i></span>&nbsp;&nbsp;&nbsp;Invite Friends
    </h6>

    <!-- Referral Link Section -->
    <div class="referral-card mt-4">
        <h6 style="color: #ffd700;"><i class="fa fa-link"></i> Your Referral Link</h6>
        <p class="text-muted">Share this link with friends to invite them to HAUZISHA</p>
        
        <div class="referral-link-box">
            <span class="referral-link" id="referralLink">Loading...</span>
            <button class="btn-copy" id="copyBtn">
                <i class="fa fa-copy"></i> Copy
            </button>
        </div>

        <div class="share-buttons">
            <button class="share-btn email" id="shareEmail">
                <i class="fa fa-envelope"></i> Email
            </button>
            <button class="share-btn whatsapp" id="shareWhatsApp">
                <i class="fab fa-whatsapp"></i> WhatsApp
            </button>
            <button class="share-btn twitter" id="shareTwitter">
                <i class="fab fa-twitter"></i> Twitter
            </button>
        </div>
    </div>

    <!-- Email Invite Section -->
    <div class="referral-card">
        <h6 style="color: #ffd700;"><i class="fa fa-envelope"></i> Send Email Invitation</h6>
        <p class="text-muted">Invite friends directly via email</p>
        
        <form id="emailInviteForm">
            <div class="mb-3">
                <label for="friendEmail" class="form-label">Friend's Email</label>
                <input type="email" class="form-control" id="friendEmail" name="email" required placeholder="friend@example.com">
            </div>
            
            <div class="mb-3">
                <label for="friendName" class="form-label">Friend's Name (Optional)</label>
                <input type="text" class="form-control" id="friendName" name="name" placeholder="John Doe">
            </div>
            
            <div id="inviteMessage" class="alert d-none mb-3" role="alert"></div>
            
            <button type="submit" class="btn btn-primary">
                <i class="fa fa-paper-plane"></i> Send Invitation
            </button>
        </form>
    </div>

    <!-- Referral Stats -->
    <div class="referral-card">
        <h6 style="color: #ffd700;"><i class="fa fa-chart-line"></i> Your Referral Stats</h6>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" id="totalInvites">0</div>
                <div class="stat-label">Invites Sent</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="totalJoined">0</div>
                <div class="stat-label">Friends Joined</div>
            </div>
        </div>
    </div>

    <div class="mb-5"></div>
</section>

<?php include 'footer2.php'; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="../js/logout-handler.js" defer></script>
<script src="js/invite-friends.js"></script>
<script src="js/footer2.js"></script>

</body>
</html>
