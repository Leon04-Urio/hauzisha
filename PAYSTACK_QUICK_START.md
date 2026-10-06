# Paystack Quick Start - What You Need To Do

## 🚀 Immediate Actions Required

### 1. Get Paystack Account & API Keys (5 minutes)
```
1. Go to: https://paystack.com/
2. Sign up for an account
3. Go to Settings → API Keys & Webhooks
4. Copy your Test Keys:
   - Public Key (starts with pk_test_)
   - Secret Key (starts with sk_test_)
```

### 2. Update Configuration File (2 minutes)
Edit: `services/paystack-config.php`

Replace these lines:
```php
define('PAYSTACK_PUBLIC_KEY', 'pk_test_xxxxxxxxxxxxxxxxxxxxxx');
define('PAYSTACK_SECRET_KEY', 'sk_test_xxxxxxxxxxxxxxxxxxxxxx');
```

With your actual keys from Paystack Dashboard.

### 3. Update Callback URL (1 minute)
In same file, replace:
```php
define('PAYSTACK_CALLBACK_URL', 'https://yourdomain.com/loft-studio/services/paystack-callback.php');
```

With your actual domain (e.g., `https://loftstudio.co.ke/services/paystack-callback.php`)

### 4. Set Up Webhook (2 minutes)
```
1. In Paystack Dashboard → Settings → Webhooks
2. Click "Add Webhook URL"
3. Enter: https://yourdomain.com/loft-studio/services/paystack-callback.php
4. Save
```

### 5. Create Logs Directory (30 seconds)
```bash
cd /opt/lampp/htdocs/loft-studio
mkdir -p logs
chmod 755 logs
```

## ✅ Test It Works

### Quick Test (2 minutes)
1. Go to: `http://localhost/loft-studio/services/`
2. Click "Pay Now" on any package
3. Fill the form
4. Use test card: `4084084084084081`
   - CVV: any 3 digits
   - Expiry: any future date
   - PIN: `1234`
5. Complete payment
6. Should redirect to success page

## 📋 Test Cards

| Card Number | Result |
|-------------|--------|
| 4084084084084081 | ✅ Success |
| 5060666666666666666 | ❌ Insufficient Funds |
| 5143010522339965 | ❌ Declined |

## 🔴 Common Issues

**"Invalid API Key"**
→ Check you copied the full key from Paystack Dashboard

**"Payment not initializing"**
→ Check `paystack-config.php` has correct keys

**"Webhook not working"**
→ Make sure URL is publicly accessible (not localhost)

## 🎯 When Ready for Production

1. Complete business verification on Paystack
2. Get Live API keys (pk_live_ and sk_live_)
3. Update `paystack-config.php` with live keys
4. Change `PAYSTACK_ENV` to `'live'`
5. Update webhook URL to live domain

## 📞 Need Help?

**Paystack Support:**
- support@paystack.com
- https://paystack.com/docs

**Your Setup:**
- All payment files are in: `/services/`
- Logs will be in: `/logs/paystack-webhooks.log`
- Database table: `payment_records`

---

**That's it!** Once you add your API keys, payments will work immediately in test mode. 🎉
