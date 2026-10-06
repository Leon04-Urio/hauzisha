# ✅ PRODUCTION DEPLOYMENT CHECKLIST

## 🚀 PRE-LAUNCH (Do These First)

### 1. Environment Configuration
```bash
# Create .env file
cp .env.example .env

# Set these variables:
DB_HOST=localhost
DB_NAME=loft
DB_USER=your_user
DB_PASS=your_password
ADMIN_EMAIL=admin@yourdomain.com
APP_URL=https://yourdomain.com
```

### 2. Security Hardening
```bash
# Fix file permissions
chmod 755 uploads/properties/
chmod 644 api/classes/*.php
chmod 644 api/index.php

# Disable error display in production
# In php.ini or .htaccess:
display_errors = Off
log_errors = On
error_log = /path/to/error.log
```

### 3. Database Optimization
```sql
-- Add indexes if not present
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_property_images_property ON property_images(property_id);
```

### 4. Update Hardcoded Values
**File:** `api/classes/Booking.php` (Line 42)
```php
// BEFORE:
$adminEmail = "admin@example.com";

// AFTER:
$adminEmail = getenv('ADMIN_EMAIL') ?: "admin@yourdomain.com";
```

---

## 🔒 SECURITY ENHANCEMENTS

### Add CSRF Protection
**Create:** `api/helpers/csrf.php`
```php
<?php
function generateCSRFToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && 
           hash_equals($_SESSION['csrf_token'], $token);
}
```

**Usage in forms:**
```html
<input type="hidden" name="csrf_token" value="<?php echo generateCSRFToken(); ?>">
```

**Validation:**
```php
if (!validateCSRFToken($_POST['csrf_token'])) {
    throw new Exception('Invalid request');
}
```

---

## 📧 EMAIL CONFIGURATION

### Option 1: SMTP (Recommended)
```php
// Install PHPMailer (already in composer.json)
composer require phpmailer/phpmailer

// Configure in api/config/email.php
$mail = new PHPMailer\PHPMailer\PHPMailer();
$mail->isSMTP();
$mail->Host = 'smtp.gmail.com';
$mail->SMTPAuth = true;
$mail->Username = 'your-email@gmail.com';
$mail->Password = 'your-app-password';
$mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
$mail->Port = 587;
```

### Option 2: SendGrid/Mailgun
Use their APIs for better deliverability.

---

## ⚡ PERFORMANCE OPTIMIZATION

### 1. Enable PHP OPcache
```ini
; In php.ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
```

### 2. Enable Gzip Compression
```apache
# In .htaccess
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### 3. Browser Caching
```apache
# In .htaccess
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## 🔍 MONITORING SETUP

### 1. Error Logging
```php
// In api/config/error_handler.php
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("[$errno] $errstr in $errfile:$errline");
    // Send to monitoring service (Sentry, Rollbar, etc.)
});
```

### 2. API Monitoring
```php
// Log all API requests
file_put_contents('logs/api.log', 
    date('Y-m-d H:i:s') . " - " . $_SERVER['REQUEST_METHOD'] . " " . $_SERVER['REQUEST_URI'] . "\n",
    FILE_APPEND
);
```

---

## 🗄️ BACKUP STRATEGY

### Daily Database Backup
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root loft > backups/loft_$DATE.sql
# Keep only last 7 days
find backups/ -name "loft_*.sql" -mtime +7 -delete
```

### Cron Job
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## 🧪 TESTING CHECKLIST

### Manual Testing
- [ ] User registration works
- [ ] User login works
- [ ] Google OAuth works
- [ ] Property listing loads
- [ ] Property details page works
- [ ] Image upload works
- [ ] Booking creation works
- [ ] Booking notifications sent
- [ ] Favorites add/remove works
- [ ] Reviews submission works
- [ ] Admin dashboard accessible
- [ ] All API endpoints return JSON

### Load Testing
```bash
# Install Apache Bench
apt-get install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 http://yourdomain.com/api/index.php/properties
```

---

## 🚨 EMERGENCY PROCEDURES

### If Site Goes Down
1. Check error logs: `tail -f /path/to/error.log`
2. Check database: `mysql -u root -p loft`
3. Check disk space: `df -h`
4. Check Apache/Nginx: `systemctl status apache2`
5. Restart services: `systemctl restart apache2`

### If Database Corrupted
```bash
# Restore from backup
mysql -u root -p loft < backups/loft_YYYYMMDD.sql
```

---

## 📱 POST-LAUNCH MONITORING

### Week 1
- [ ] Monitor error logs daily
- [ ] Check API response times
- [ ] Review user feedback
- [ ] Monitor server resources

### Month 1
- [ ] Review security logs
- [ ] Analyze user behavior
- [ ] Optimize slow queries
- [ ] Update dependencies

---

## 🎯 SUCCESS METRICS

Track these KPIs:
- User registrations per day
- Properties viewed per day
- Bookings created per day
- API response time (< 200ms)
- Error rate (< 0.1%)
- Uptime (> 99.9%)

---

## 📞 SUPPORT CONTACTS

**Hosting Provider:** [Your hosting support]  
**Domain Registrar:** [Your domain support]  
**Email Service:** [Your email provider]  
**Developer:** [Your contact]

---

## ✅ FINAL VERIFICATION

Before going live, verify:
- [ ] All environment variables set
- [ ] Database credentials correct
- [ ] Email sending works
- [ ] File uploads work
- [ ] SSL certificate installed
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Error logging active
- [ ] Performance optimized
- [ ] Security hardened

---

**🎉 YOU'RE READY TO LAUNCH!**

Your platform is production-ready. Follow this checklist and you'll have a smooth deployment.

Good luck! 🚀
