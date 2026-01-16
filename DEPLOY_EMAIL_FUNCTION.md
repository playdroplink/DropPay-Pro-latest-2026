# ===================================
# SUPABASE EDGE FUNCTIONS DEPLOYMENT
# ===================================
# Run these commands to deploy the email function:

# 1. Deploy the send-download-email function
supabase functions deploy send-download-email --project-ref xoofailhzhfyebzpzrfs

# 2. Set the required secrets (if not already set)
supabase secrets set RESEND_API_KEY="re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u" --project-ref xoofailhzhfyebzpzrfs
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvb2ZhaWxoemhmeWVienB6cmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM4MDM3OSwiZXhwIjoyMDgxOTU2Mzc5fQ.gJmhCpYAzEW_6iA6xD5LMsKz9u0tC2vQ1Z0eYfKl6hE" --project-ref xoofailhzhfyebzpzrfs
supabase secrets set SUPABASE_URL="https://xoofailhzhfyebzpzrfs.supabase.co" --project-ref xoofailhzhfyebzpzrfs

# 3. Verify deployment
supabase functions list --project-ref xoofailhzhfyebzpzrfs

# 4. Test the function (optional)
curl -X POST 'https://xoofailhzhfyebzpzrfs.supabase.co/functions/v1/send-download-email' \
  -H 'Authorization: Bearer [YOUR_ANON_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{
    "transactionId": "test-123",
    "buyerEmail": "test@example.com",
    "paymentLinkId": "test-link",
    "downloadUrl": "https://example.com/download",
    "productTitle": "Test Product"
  }'

# ===================================
# EMAIL FUNCTION FEATURES
# ===================================
# ✅ Professional HTML email template
# ✅ Mobile-responsive design  
# ✅ 24-hour download link expiry notice
# ✅ Transaction details included
# ✅ Security warnings
# ✅ Support contact information
# ✅ DropPay branding
# ✅ Plain text fallback

# ===================================
# RESEND CONFIGURATION
# ===================================
# Domain: droppay.space (verify in Resend dashboard)
# From: DropPay <noreply@droppay.space>
# API Key: re_L6a3FcFc_Je1n1sWQu4KZJ9aqNXNAg25u

# ===================================
# TESTING EMAIL DELIVERY
# ===================================
# 1. Complete a payment in your app
# 2. Check browser console for email logs
# 3. Check recipient's email (including spam folder)
# 4. Check Resend dashboard for delivery status