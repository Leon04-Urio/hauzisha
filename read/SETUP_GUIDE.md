# Quick Setup Guide

## Step 1: Database Setup

Run the SQL migration to create new tables:

```bash
mysql -u your_username -p loft < database-updates.sql
```

Or manually execute the SQL in phpMyAdmin or your database tool.

## Step 2: Verify Uploads Directory

Ensure the uploads directory exists and is writable:

```bash
# Create directory if it doesn't exist
mkdir -p uploads

# Set proper permissions
chmod 755 uploads
```

## Step 3: Test the Features

### Test Profile Image Upload
1. Go to Profile page
2. Click the edit icon (pen icon)
3. Upload a profile picture
4. Save changes
5. Verify image displays correctly

### Test Security Features
1. Navigate to Security from profile menu
2. Try changing password
3. Toggle 2FA on/off

### Test Language Settings
1. Navigate to Language from profile menu
2. Select different languages
3. Verify selection is saved

### Test Help Center
1. Navigate to Help Center
2. Expand FAQ items
3. Submit a support ticket

### Test Invite Friends
1. Navigate to Invite Friends
2. Copy referral link
3. Try social sharing buttons
4. Send email invitation

## Step 4: Verify Database Tables

Check that these tables were created:
- `user_preferences`
- `support_tickets`
- `referrals`

```sql
SHOW TABLES LIKE 'user_preferences';
SHOW TABLES LIKE 'support_tickets';
SHOW TABLES LIKE 'referrals';
```

## Troubleshooting

### Profile Image Not Displaying

**Issue:** Image uploads but doesn't display

**Solution:**
1. Check uploads directory permissions: `chmod 755 uploads`
2. Verify image path in database starts with `/loft-studio/uploads/`
3. Check browser console for 404 errors
4. Ensure web server can serve files from uploads directory

### 2FA Toggle Not Working

**Issue:** Toggle doesn't save state

**Solution:**
1. Verify `user_preferences` table exists
2. Check browser console for API errors
3. Verify database connection in `api/config/database.php`

### Referral Link Not Generating

**Issue:** Referral link shows "Loading..."

**Solution:**
1. Verify `referrals` table exists
2. Check API endpoint: `/loft-studio/api/get-referral-link.php`
3. Check browser console for errors

### Email Invitations Not Sending

**Issue:** Email invitation fails

**Solution:**
1. PHP `mail()` function may not be configured on your server
2. For production, integrate a proper email service:
   - SendGrid
   - Mailgun
   - AWS SES
3. Check PHP error logs for mail-related errors

## File Permissions

Ensure proper permissions:

```bash
# PHP files
chmod 644 user-profile/*.php
chmod 644 api/*.php

# JavaScript files
chmod 644 user-profile/js/*.js

# Uploads directory
chmod 755 uploads
```

## Security Checklist

- [ ] Uploads directory is NOT inside a publicly accessible git repository
- [ ] Database credentials are secure
- [ ] Session security is configured
- [ ] File upload validation is working
- [ ] SQL injection protection (prepared statements) is in place
- [ ] XSS protection is implemented

## Production Recommendations

1. **Email Service:** Replace PHP `mail()` with a proper email service
2. **Image Optimization:** Add image compression on upload
3. **CDN:** Serve uploaded images from a CDN
4. **Rate Limiting:** Add rate limiting to API endpoints
5. **CSRF Tokens:** Implement CSRF protection for forms
6. **Logging:** Add comprehensive error and activity logging
7. **Backup:** Regular database backups including new tables

## Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Check PHP error logs
3. Verify database tables exist
4. Test API endpoints directly
5. Review the PROFILE_FEATURES_README.md for detailed documentation
