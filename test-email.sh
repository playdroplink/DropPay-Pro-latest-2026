#!/bin/bash

# Test send-receipt-email function

echo "🧪 Testing DropPay Receipt Email Function..."
echo ""

# Replace with your actual email to test
TEST_EMAIL="your-email@gmail.com"

echo "📧 Sending test receipt to: $TEST_EMAIL"
echo ""

curl -X POST https://xoofailhzhfyebzpzrfs.supabase.co/functions/v1/send-receipt-email \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvb2ZhaWxoemhmZWVienhwcmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzEwODI2NDAsImV4cCI6MTk4NjY1ODY0MH0.0XqNlJLfQH_1AZLSvvuKWHnlCl4KhwqEGfvvvBKzPDc" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "test-receipt-001",
    "buyerEmail": "'$TEST_EMAIL'",
    "paymentLinkTitle": "Test DropPay Product",
    "merchantName": "DropPay Test Merchant",
    "payerUsername": "testpiuser",
    "amount": 10.5,
    "currency": "Pi",
    "txid": "test-blockchain-transaction-id",
    "isBlockchainVerified": true
  }'

echo ""
echo "✅ Test request sent!"
echo "📩 Check your email inbox for the receipt."
