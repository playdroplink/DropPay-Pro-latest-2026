#!/bin/bash
# ========================================
# QUICK SETUP SCRIPT - Transaction Notifications
# Run this script to complete the setup
# ========================================

echo "🔔 Setting up Transaction Notification Bell..."
echo ""

# Step 1: Check for required files
echo "✅ Step 1: Checking files..."
if [ -f "CREATE_TRANSACTION_NOTIFICATION_TRIGGER.sql" ]; then
    echo "   ✓ Found CREATE_TRANSACTION_NOTIFICATION_TRIGGER.sql"
else
    echo "   ✗ Missing CREATE_TRANSACTION_NOTIFICATION_TRIGGER.sql"
    exit 1
fi

if [ -f "supabase/functions/complete-payment/index.ts" ]; then
    echo "   ✓ Found complete-payment function"
else
    echo "   ✗ Missing complete-payment function"
    exit 1
fi

if [ -f "src/components/dashboard/NotificationBell.tsx" ]; then
    echo "   ✓ Found NotificationBell component"
else
    echo "   ✗ Missing NotificationBell component"
    exit 1
fi

echo ""
echo "⏳ Step 2: Install dependencies (if needed)..."
if [ -f "package.json" ]; then
    # Check if packages are installed
    if [ -d "node_modules" ]; then
        echo "   ✓ Dependencies already installed"
    else
        echo "   Installing npm packages..."
        npm install
    fi
else
    echo "   ⚠ package.json not found, skipping npm install"
fi

echo ""
echo "📡 Step 3: Deploy Supabase functions..."
echo ""
echo "   Option A - Using CLI:"
echo "   $ supabase functions deploy complete-payment"
echo ""
echo "   Option B - Using git:"
echo "   $ git add ."
echo "   $ git commit -m 'feat: Add transaction notification system'"
echo "   $ git push origin main"
echo ""

echo "🗄️  Step 4: Apply Database Trigger (IMPORTANT!)"
echo ""
echo "   You MUST run this SQL in Supabase Dashboard > SQL Editor:"
echo "   ────────────────────────────────────────────────────────"
cat CREATE_TRANSACTION_NOTIFICATION_TRIGGER.sql
echo ""
echo "   ────────────────────────────────────────────────────────"
echo ""

echo "✅ All files are in place!"
echo ""
echo "📋 Next Steps:"
echo "   1. Deploy the edge function:"
echo "      supabase functions deploy complete-payment"
echo ""
echo "   2. Copy CREATE_TRANSACTION_NOTIFICATION_TRIGGER.sql"
echo "   3. Open Supabase Dashboard > SQL Editor"
echo "   4. Paste and run the SQL script"
echo ""
echo "   5. Verify setup:"
echo "      SELECT COUNT(*) FROM information_schema.triggers"
echo "      WHERE trigger_name = 'transaction_notification_trigger';"
echo ""
echo "🎉 Once done, notifications will appear in real-time!"
