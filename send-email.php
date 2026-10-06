<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/autoload.php'; // Composer autoload

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name    = htmlspecialchars($_POST['name']);
    $email   = htmlspecialchars($_POST['email']);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);

    $mail = new PHPMailer(true);

    try {
        //Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'aloopat51@gmail.com'; // Replace with your Gmail
        $mail->Password   = 'wvcc epzr vyyg aslq';   // Use Gmail App Password
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;

        //Recipients
        $mail->setFrom('aloopat51@gmail.com', 'Hauzisha');
        $mail->addAddress('aloopat51@gmail.com'); // Recipient
        $mail->addReplyTo($email, $name);

        //Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = "<h2>New Contact Form Submission</h2>
                          <p><strong>Name:</strong> $name</p>
                          <p><strong>Email:</strong> $email</p>
                          <p><strong>Subject:</strong> $subject</p>
                          <p><strong>Message:</strong><br>$message</p>";

        $mail->send();
    } catch (Exception $e) {
        echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
}
?>