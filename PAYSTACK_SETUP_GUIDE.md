# Paystack Integration Setup Guide

## Overview
Your LOFT STUDIO services now have Paystack payment integration! This guide will help you complete the setup.

## What's Been Implemented

✅ **Payment Flow**
- Service selection page with "Pay Now" buttons
- Payment form with customer and property details
- Paystack payment gateway integration
- Payment verification and callback handling
- Success and failure pages
- Webhook for real-time payment notifications

✅ **Files Created/Updated**
- `services/paystack-config.php` - Paystack API configuration
- `services/paystack-process.php` - Payment initialization
- `services/paystack-callback.php` - Payment verification after redirect
- `services/paystack-webhook.php` - Real-time webhook handler
- `services/payment-failed.php` - Failed payment page
- `services/index.php` - Updated with "Pay Now" buttons
- `services/payment.php` - Updated payment form

## Setup Steps

### 1. Create Paystack Account
1. Go to https://paystack.com/
2. Click "Get Started" and create an account
3. Complete business verification (required for live payments)

### 2. Get API Keys
1. Log in to Paystack Dashboard
2. Go to **Settings** → **API Keys & Webhooks**
3. You'll see two sets of keys:
   - **Test Keys** (for development)
   - **Live Keys** (for production)

### 3. Configure API Keys
Edit `services/paystack-config.php` and update:

```php
// For Testing
define('PAYSTACK_PUBLIC_KEY', 'pk_test_YOUR_TEST_PUBLIC_KEY');
define('PAYSTACK_SECRET_KEY', 'sk_test_YOUR_TEST_SECRET_KEY');
define('PAYSTACK_ENV', 'test');

// For Production (after testing)
define('PAYSTACK_PUBLIC_KEY', 'pk_live_YOUR_LIVE_PUBLIC_KEY');
define('PAYSTACK_SECRET_KEY', 'sk_live_YOUR_LIVE_SECRET_KEY');
define('PAYSTACK_ENV', 'live');
```

### 4. Update Callback URL
In `services/paystack-config.php`, update:

```php
define('PAYSTACK_CALLBACK_URL', 'https://yourdomain.com/loft-studio/services/paystack-callback.php');
```

Replace `yourdomain.com` with your actual domain.

### 5. Configure Webhook
1. In Paystack Dashboard, go to **Settings** → **API Keys & Webhooks**
2. Scroll to **Webhooks** section
3. Click **Add Webhook URL**
4. Enter: `https://yourdomain.com/loft-studio/services/paystack-webhook.php`
5. Click **Save**

### 6. Create Logs Directory
```bash
mkdir -p logs
chmod 755 logs
```

### 7. Test the Integration

#### Test Mode
1. Use test API keys
2. Go to your services page: `https://yourdomain.com/loft-studio/services/`
3. Click "Pay Now" on any package
4. Fill in the form with test data
5. Use Paystack test cards:
   - **Success**: `4084084084084081` (any CVV, any future date)
   - **Insufficient Funds**: `5060666666666666666`
   - **Declined**: `5143010522339965`

#### Test M-Pesa (Kenya)
Paystack supports M-Pesa in Kenya. Use test phone numbers provided by Paystack.

### 8. Go Live Checklist
- [ ] Complete Paystack business verification
- [ ] Update to live API keys in `paystack-config.php`
- [ ] Change `PAYSTACK_ENV` to `'live'`
- [ ] Test with small real transaction
- [ ] Verify webhook is receiving events
- [ ] Check email notifications are working

## Payment Methods Supported

Paystack automatically provides:
- 💳 **Credit/Debit Cards** (Visa, Mastercard, Verve)
- 📱 **M-Pesa** (Kenya)
- 🏦 **Bank Transfer**
- 💰 **USSD**
- 📲 **Mobile Money** (Ghana, Uganda, etc.)

## Package Prices

| Package | Price (KES) |
|---------|-------------|
| Basic Listing | 2,500 |
| Professional Package | 8,500 |
| Premium 3D Experience | 25,000 |

## Webhook Events Handled

The webhook handles these Paystack events:
- `charge.success` - Payment successful
- `charge.failed` - Payment failed

## Database Table

The system creates a `payment_records` table with:
- Payment reference
- Customer details
- Property information
- Payment status
- Gateway responses
- Timestamps

## Testing Checklist

- [ ] Payment form loads correctly
- [ ] Form validation works
- [ ] Paystack payment page opens
- [ ] Test card payment succeeds
- [ ] Callback redirects to success page
- [ ] Payment record saved in database
- [ ] Confirmation email sent
- [ ] Webhook receives notification
- [ ] Failed payment shows error page

## Troubleshooting

### Payment Not Initializing
- Check API keys are correct
- Verify internet connection
- Check PHP cURL is enabled
- Look at browser console for errors

### Webhook Not Working
- Verify webhook URL is publicly accessible
- Check webhook signature verification
- Look at logs: `logs/paystack-webhooks.log`
- Test webhook from Paystack Dashboard

### Email Not Sending
- Check PHP `mail()` function is configured
- Verify email headers are correct
- Consider using SMTP (PHPMailer)

## Security Notes

1. **Never commit API keys to Git**
   - Add `paystack-config.php` to `.gitignore`
   - Use environment variables in production

2. **Always verify webhook signatures**
   - Already implemented in `paystack-webhook.php`

3. **Validate amounts server-side**
   - Already implemented in `paystack-process.php`

4. **Use HTTPS in production**
   - Required by Paystack for live mode

## Support

### Paystack Support
- Email: support@paystack.com
- Docs: https://paystack.com/docs
- Dashboard: https://dashboard.paystack.com

### LOFT STUDIO
- Phone: +254 791 488 881
- Email: services@loftstudio.com

## Next Steps

1. **Test thoroughly** with test keys
2. **Complete business verification** on Paystack
3. **Switch to live keys** when ready
4. **Monitor payments** in Paystack Dashboard
5. **Set up email notifications** (optional: use SMTP)
6. **Add SMS notifications** (optional: integrate with Africa's Talking)

## Optional Enhancements

- Add payment receipt PDF generation
- Implement refund functionality
- Add subscription/recurring payments
- Create admin dashboard for payment management
- Add payment analytics and reporting

---

**Ready to accept payments!** 🎉

Start with test mode, verify everything works, then switch to live mode to start accepting real payments.
