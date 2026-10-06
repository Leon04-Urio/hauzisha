<?php
/**
 * Paystack Configuration
 * 
 * Get your API keys from: https://dashboard.paystack.com/#/settings/developer
 */

// Paystack API Keys
define('PAYSTACK_PUBLIC_KEY', 'pk_test_xxxxxxxxxxxxxxxxxxxxxx'); // Replace with your public key
define('PAYSTACK_SECRET_KEY', 'sk_test_xxxxxxxxxxxxxxxxxxxxxx'); // Replace with your secret key

// Paystack API Base URL
define('PAYSTACK_API_URL', 'https://api.paystack.co');

// Callback URLs
define('PAYSTACK_CALLBACK_URL', 'https://yourdomain.com/hauzisha/services/paystack-callback.php');
define('PAYSTACK_WEBHOOK_URL', 'https://yourdomain.com/hauzisha/services/paystack-webhook.php');

// Currency
define('PAYSTACK_CURRENCY', 'KES'); // Kenyan Shillings

// Environment
define('PAYSTACK_ENV', 'test'); // 'test' or 'live'

/**
 * Paystack API Helper Class
 */
class PaystackAPI {
    private $secretKey;
    private $publicKey;
    
    public function __construct() {
        $this->secretKey = PAYSTACK_SECRET_KEY;
        $this->publicKey = PAYSTACK_PUBLIC_KEY;
    }
    
    /**
     * Initialize a payment transaction
     */
    public function initializeTransaction($email, $amount, $reference, $metadata = [], $channels = []) {
        $url = PAYSTACK_API_URL . "/transaction/initialize";
        
        $fields = [
            'email' => $email,
            'amount' => $amount * 100, // Convert to kobo/cents
            'reference' => $reference,
            'currency' => PAYSTACK_CURRENCY,
            'callback_url' => PAYSTACK_CALLBACK_URL,
            'metadata' => $metadata
        ];
        
        // Add channels if specified
        if (!empty($channels)) {
            $fields['channels'] = $channels;
        }
        
        return $this->makeRequest($url, 'POST', $fields);
    }
    
    /**
     * Verify a transaction
     */
    public function verifyTransaction($reference) {
        $url = PAYSTACK_API_URL . "/transaction/verify/" . $reference;
        return $this->makeRequest($url, 'GET');
    }
    
    /**
     * Get transaction details
     */
    public function getTransaction($id) {
        $url = PAYSTACK_API_URL . "/transaction/" . $id;
        return $this->makeRequest($url, 'GET');
    }
    
    /**
     * List transactions
     */
    public function listTransactions($perPage = 50, $page = 1) {
        $url = PAYSTACK_API_URL . "/transaction?perPage={$perPage}&page={$page}";
        return $this->makeRequest($url, 'GET');
    }
    
    /**
     * Charge authorization (for recurring payments)
     */
    public function chargeAuthorization($email, $amount, $authorizationCode, $reference) {
        $url = PAYSTACK_API_URL . "/transaction/charge_authorization";
        
        $fields = [
            'email' => $email,
            'amount' => $amount * 100,
            'authorization_code' => $authorizationCode,
            'reference' => $reference,
            'currency' => PAYSTACK_CURRENCY
        ];
        
        return $this->makeRequest($url, 'POST', $fields);
    }
    
    /**
     * Make HTTP request to Paystack API
     */
    private function makeRequest($url, $method = 'GET', $data = null) {
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->secretKey,
            'Content-Type: application/json',
            'Cache-Control: no-cache'
        ]);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        
        curl_close($ch);
        
        if ($error) {
            return [
                'success' => false,
                'message' => 'cURL Error: ' . $error
            ];
        }
        
        $result = json_decode($response, true);
        
        if ($httpCode !== 200) {
            return [
                'success' => false,
                'message' => $result['message'] ?? 'API request failed',
                'http_code' => $httpCode,
                'response' => $result
            ];
        }
        
        return [
            'success' => true,
            'data' => $result['data'] ?? $result,
            'message' => $result['message'] ?? 'Success'
        ];
    }
    
    /**
     * Verify webhook signature
     */
    public function verifyWebhookSignature($payload, $signature) {
        $computedSignature = hash_hmac('sha512', $payload, $this->secretKey);
        return hash_equals($signature, $computedSignature);
    }
    
    /**
     * Get public key
     */
    public function getPublicKey() {
        return $this->publicKey;
    }
}
?>
