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
    <title>HAUZISHA - Help Center</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="icon" type="image/svg+xml" href="images/logo.png">
    <link rel="preconnect" href="https://fonts.gstatic.com/">
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700&amp;display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
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

        .tab-buttons {
            display: flex;
            gap: 1rem;
            margin: 1.5rem 0;
            border-bottom: 1px solid #222;
        }

        .tab-btn {
            background: none;
            border: none;
            color: #888;
            padding: 0.8rem 1.5rem;
            cursor: pointer;
            font-weight: 600;
            border-bottom: 3px solid transparent;
            transition: all 0.3s;
        }

        .tab-btn.active {
            color: #ffd700;
            border-bottom-color: #ffd700;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .faq-item {
            background: #111;
            border-radius: 8px;
            margin-bottom: 0.8rem;
            overflow: hidden;
        }

        .faq-question {
            padding: 0.5rem;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
        }

        .faq-question:hover {
            background: #111;
        }

        .faq-answer {
            padding: 0.5rem;
            color: #aaa;
            display: none;
        }

        .faq-item.open .faq-answer {
            display: block;
        }

        .faq-item.open .faq-icon {
            transform: rotate(180deg);
        }

        .faq-icon {
            transition: transform 0.3s;
        }

        .form-control,
        .form-select {
            background: #000;
            color: #fff;
            border: 1px solid #444;
        }

        .form-control:focus,
        .form-select:focus {
            background: #111;
            color: #fff;
            border-color: #ffd700;
            box-shadow: 0 0 0 0.2rem rgba(255, 215, 0, 0.25);
        }

        textarea.form-control {
            min-height: 120px;
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
    </style>
</head>

<body>

    <section class="container-sm">
        <h6 class="mt-5" style="font-weight: 900; cursor: pointer;" onclick="window.history.back()">
            <span><i class="fa fa-angle-left" aria-hidden="true"></i></span>&nbsp;&nbsp;&nbsp;Help Center
        </h6>

        <div class="tab-buttons">
            <button class="tab-btn active" data-tab="faq">FAQ</button>
        </div>

        <!-- FAQ Tab -->
        <div id="faq" class="tab-content active">
            <div class="faq-list">
                <div class="faq-item">
                    <div class="faq-question">
                        <span>How do I book a property viewing?</span>
                        <i class="fa fa-chevron-down faq-icon"></i>
                    </div>
                    <div class="faq-answer">
                        Browse properties, select one you like, and click the "Book Viewing" button. Fill in your
                        details and preferred date, and we'll confirm your appointment.
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">
                        <span>How do I update my profile information?</span>
                        <i class="fa fa-chevron-down faq-icon"></i>
                    </div>
                    <div class="faq-answer">
                        Go to your Profile page and click the edit icon next to your profile picture. You can update
                        your name, email, and profile picture.
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">
                        <span>Can I save properties to view later?</span>
                        <i class="fa fa-chevron-down faq-icon"></i>
                    </div>
                    <div class="faq-answer">
                        Yes! Click the heart icon on any property to add it to your Favourites. Access them anytime from
                        the Favourites page in your profile menu.
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">
                        <span>How do I change my password?</span>
                        <i class="fa fa-chevron-down faq-icon"></i>
                    </div>
                    <div class="faq-answer">
                        Navigate to Security from your profile menu. Enter your current password and your new password
                        to update it.
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">
                        <span>What is Two-Factor Authentication?</span>
                        <i class="fa fa-chevron-down faq-icon"></i>
                    </div>
                    <div class="faq-answer">
                        2FA adds an extra layer of security to your account. When enabled, you'll receive a verification
                        code via email each time you log in.
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">
                        <span>How do I cancel a booking?</span>
                        <i class="fa fa-chevron-down faq-icon"></i>
                    </div>
                    <div class="faq-answer">
                        Go to My Bookings, find the booking you want to cancel, and click the cancel button. Please note
                        our cancellation policy.
                    </div>
                </div>
            </div>
        </div>

        <div class="mb-5"></div>
    </section>

    <?php include 'footer2.php'; ?>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../js/logout-handler.js" defer></script>
    <script src="js/help-center.js"></script>
    <script src="js/footer2.js"></script>

</body>

</html>