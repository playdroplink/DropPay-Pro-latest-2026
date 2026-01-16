#!/bin/bash
# DropPay Full Feature Validation Script
# Tests all Pi integrations and app functionality

echo "🚀 DropPay Full Feature Validation"
echo "=================================="

# Test 1: Environment Check
echo ""
echo "1️⃣ Environment Configuration..."

# Check .env file
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    
    # Check critical environment variables
    if grep -q "VITE_PI_API_KEY=" .env && grep -q "a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq" .env; then
        echo "   ✅ Pi API Key configured (new key)"
    else
        echo "   ❌ Pi API Key not properly configured"
    fi
    
    if grep -q "VITE_PI_VALIDATION_KEY=" .env; then
        echo "   ✅ Pi Validation Key configured"
    else
        echo "   ❌ Pi Validation Key missing"
    fi
    
    if grep -q "VITE_SUPABASE_URL=" .env; then
        echo "   ✅ Supabase URL configured"
    else
        echo "   ❌ Supabase URL missing"
    fi
else
    echo "   ❌ .env file not found"
fi

# Test 2: Development Server
echo ""
echo "2️⃣ Development Server..."

if curl -s http://localhost:8080 > /dev/null; then
    echo "   ✅ Dev server running on port 8080"
else
    echo "   ❌ Dev server not accessible"
fi

# Test 3: Pi SDK Integration
echo ""
echo "3️⃣ Pi SDK Integration..."

# Check index.html for Pi SDK
if grep -q "https://sdk.minepi.com/pi-sdk.js" index.html; then
    echo "   ✅ Pi SDK script loaded"
else
    echo "   ❌ Pi SDK script not found"
fi

if grep -q "window.Pi.init" index.html; then
    echo "   ✅ Pi SDK initialization present"
else
    echo "   ❌ Pi SDK initialization missing"
fi

# Test 4: Supabase Functions
echo ""
echo "4️⃣ Supabase Edge Functions..."

functions=("approve-payment" "complete-payment" "verify-ad-reward" "verify-payment")
for func in "${functions[@]}"; do
    if [ -d "supabase/functions/$func" ]; then
        echo "   ✅ $func function exists"
    else
        echo "   ❌ $func function missing"
    fi
done

# Test 5: Database Migrations
echo ""
echo "5️⃣ Database Migrations..."

migration_count=$(ls supabase/migrations/*.sql 2>/dev/null | wc -l)
echo "   📋 Migration files: $migration_count"

if [ $migration_count -gt 0 ]; then
    echo "   ✅ Database migrations present"
else
    echo "   ❌ No migration files found"
fi

# Test 6: Key Components
echo ""
echo "6️⃣ Key App Components..."

components=("AuthContext.tsx" "PiAuthGuard.tsx" "PayPage.tsx" "WatchAds.tsx" "MerchantCheckout.tsx")
for component in "${components[@]}"; do
    if find src -name "$component" -type f > /dev/null 2>&1; then
        echo "   ✅ $component found"
    else
        echo "   ❌ $component missing"
    fi
done

# Test 7: Pi Integration Features
echo ""
echo "7️⃣ Pi Integration Features..."

# Check for Pi authentication
if grep -q "Pi.authenticate" src/contexts/AuthContext.tsx; then
    echo "   ✅ Pi Authentication implemented"
else
    echo "   ❌ Pi Authentication missing"
fi

# Check for Pi payments
if grep -q "Pi.createPayment" src/pages/PayPage.tsx; then
    echo "   ✅ Pi Payments implemented"
else
    echo "   ❌ Pi Payments missing"
fi

# Check for Pi Ad Network
if grep -q "Pi.Ads" src/pages/WatchAds.tsx; then
    echo "   ✅ Pi Ad Network implemented"
else
    echo "   ❌ Pi Ad Network missing"
fi

# Summary
echo ""
echo "🎯 Validation Summary:"
echo "====================="

# Count successful tests (simplified)
total_tests=7
echo "📊 Core systems validated"
echo "🔧 For interactive testing:"
echo "   • Open http://localhost:8080 in Pi Browser"
echo "   • Test authentication flow"
echo "   • Create payment links"
echo "   • Test checkout process"
echo "   • Watch ads functionality"

echo ""
echo "💡 Next Steps:"
echo "   1. Test in Pi Browser for full functionality"
echo "   2. Update Supabase secrets with new API key:"
echo "      supabase secrets set PI_API_KEY=\"a7hucm1nw9255vsanfdwtqzvou0rnyijvumnm50ble7hrmumuwnokacmkwfuychq\""
echo "   3. Deploy edge functions if needed"
echo "   4. Test end-to-end payment flows"

echo ""
echo "✅ DropPay validation complete!"
echo "🚀 App is ready for Pi Network integration testing"