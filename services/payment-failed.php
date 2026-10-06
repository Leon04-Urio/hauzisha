<?php
session_start();
$error = $_GET['error'] ?? 'Payment was not completed';
$reference = $_GET['ref'] ?? '';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Payment Failed | HAUZISHA</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/svg+xml" href="../images/logo.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../css/style.css">
    
    <style>
        body {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            min-height: 100vh;
            font-family: 'Nunito Sans', sans-serif;
        }
        
        .failed-container {
            max-width: 600px;
            margin: 100px auto;
            padding: 20px;
            text-align: center;
        }
        
        .failed-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(220, 53, 69, 0.3);
            border-radius: 16px;
            padding: 50px 40px;
            backdrop-filter: blur(10px);
        }
        
        .failed-icon {
            font-size: 4rem;
            color: #ff6b6b;
            margin-bottom: 30px;
        }
        
        .failed-title {
            font-size: 2rem;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 20px;
        }
        
        .failed-message {
            font-size: 1.1rem;
            color: #cccccc;
            margin-bottom: 40px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #000;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            text-decoration: none;
            margin: 10px;
            display: inline-block;
        }
        
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            text-decoration: none;
            margin: 10px;
            display: inline-block;
        }
    </style>
</head>
<body>

    <?php include '../navbar.php'; ?>

    <div class="failed-container">
        <div class="failed-card">
            <div class="failed-icon">
                <i class="fas fa-times-circle"></i>
            </div>
            
            <h1 class="failed-title">Payment Failed</h1>
            <p class="failed-message">
                <?php echo htmlspecialchars($error); ?>
            </p>
            
            <?php if ($reference): ?>
            <p style="color: #999; margin-bottom: 30px;">
                Reference: <code style="color: #ffd700;"><?php echo htmlspecialchars($reference); ?></code>
            </p>
            <?php endif; ?>
            
            <div>
                <a href="payment.php?package=<?php echo $_GET['package'] ?? 'listing'; ?>" class="btn-primary">
                    <i class="fas fa-redo"></i> Try Again
                </a>
                <a href="index.php" class="btn-secondary">
                    <i class="fas fa-arrow-left"></i> Back to Services
                </a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.1);">
                <p style="color: #fff; margin-bottom: 15px;">Need Help?</p>
                <p style="color: #ffd700; margin-bottom: 5px;">
                    <i class="fas fa-phone"></i> +254 791 488 881
                </p>
                <p style="color: #ffd700;">
                    <i class="fas fa-envelope"></i> services@hauzisha.com
                </p>
            </div>
        </div>
    </div>

</body>
</html>

