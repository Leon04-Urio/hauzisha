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
    <title>HAUZISHA - Language</title>
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

        .language-option {
            background: #111;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 0.8rem;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .language-option:hover {
            background: #1a1a1a;
            border-color: #444;
        }

        .language-option.active {
            border-color: #ffd700;
            background: #1a1a1a;
        }

        .language-option .check-icon {
            color: #ffd700;
            font-size: 1.2rem;
            display: none;
        }

        .language-option.active .check-icon {
            display: block;
        }

        .language-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .language-flag {
            font-size: 1.1rem;
        }

        .language-name {
            font-weight: 600;
            font-size: 0.9rem;
        }

        .language-native {
            color: #888;
            font-size: 0.8rem;
        }
    </style>
</head>
<body>

<section class="container-sm">
    <h6 class="mt-5" style="font-weight: 900; cursor: pointer;" onclick="window.history.back()">
        <span><i class="fa fa-angle-left" aria-hidden="true"></i></span>&nbsp;&nbsp;&nbsp;Language
    </h6>

    <p class="my-4" style="color: #666;">Select your preferred language</p>

    <div id="languageList" class="mt-3">
        <!-- Languages will be loaded here -->
    </div>

    <div id="languageMessage" class="alert d-none mt-3" role="alert"></div>

    <div class="mb-5"></div>
</section>

<?php include 'footer2.php'; ?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="../js/logout-handler.js" defer></script>
<script src="js/language.js"></script>
<script src="js/footer2.js"></script>

</body>
</html>
