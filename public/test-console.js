// Manual Test Console for DropPay
// Open browser console and run these commands to test functionality

console.log('🧪 DropPay Manual Test Console Loaded');
console.log('=====================================');

// Test 1: Environment Check
console.log('1️⃣ Environment Configuration:');
const env = {
  apiKey: typeof import !== 'undefined' ? import.meta?.env?.VITE_PI_API_KEY : 'Check .env file',
  validationKey: typeof import !== 'undefined' ? import.meta?.env?.VITE_PI_VALIDATION_KEY : 'Check .env file',
  network: typeof import !== 'undefined' ? import.meta?.env?.VITE_PI_NETWORK : 'Check .env file',
  supabaseUrl: typeof import !== 'undefined' ? import.meta?.env?.VITE_SUPABASE_URL : 'Check .env file'
};

console.log('   API Key configured:', !!(env.apiKey && env.apiKey.length > 10));
console.log('   Validation Key configured:', !!(env.validationKey && env.validationKey.length > 10));
console.log('   Network mode:', env.network || 'undefined');

// Test 2: Pi SDK
console.log('\n2️⃣ Pi SDK Status:');
const Pi = (window as any).Pi;
if (Pi) {
  console.log('   ✅ Pi SDK loaded');
  console.log('   Methods available:', {
    authenticate: !!Pi.authenticate,
    createPayment: !!Pi.createPayment,
    ads: !!Pi.Ads,
    init: !!Pi.init
  });
  
  // Test initialization
  try {
    Pi.init({ version: '2.0', sandbox: false });
    console.log('   ✅ Pi SDK initialized successfully');
  } catch (error) {
    console.log('   ⚠️ Pi SDK initialization:', error);
  }
} else {
  console.log('   ⚠️ Pi SDK not available (normal in regular browser)');
}

// Test 3: App State
console.log('\n3️⃣ App State:');
const appRoot = document.getElementById('root');
console.log('   React app loaded:', !!appRoot);
console.log('   Current route:', window.location.pathname);

// Check for stored authentication
const storedUser = localStorage.getItem('pi_user');
const storedToken = localStorage.getItem('pi_access_token');
console.log('   Stored user session:', !!storedUser);
console.log('   Stored access token:', !!storedToken);

if (storedUser) {
  try {
    const userData = JSON.parse(storedUser);
    console.log('   User data:', userData);
  } catch (e) {
    console.log('   Invalid user data in storage');
  }
}

// Test 4: Manual Test Functions
console.log('\n4️⃣ Manual Test Functions Available:');
console.log('   testPiAuth() - Test Pi authentication');
console.log('   testPayment() - Test payment creation');
console.log('   testAds() - Test ad network');
console.log('   testNavigation() - Test app navigation');

// Test Pi Authentication
(window as any).testPiAuth = async function() {
  console.log('🔐 Testing Pi Authentication...');
  const Pi = (window as any).Pi;
  
  if (!Pi) {
    console.log('❌ Pi SDK not available. Open in Pi Browser for full test.');
    return;
  }
  
  try {
    console.log('📡 Calling Pi.authenticate...');
    const result = await Pi.authenticate(['username', 'payments'], (payment) => {
      console.log('Incomplete payment found:', payment);
    });
    console.log('✅ Authentication successful:', result);
    
    // Store result
    localStorage.setItem('pi_user', JSON.stringify(result.user));
    localStorage.setItem('pi_access_token', result.accessToken);
    
    return result;
  } catch (error) {
    console.log('❌ Authentication failed:', error);
  }
};

// Test Payment Creation
(window as any).testPayment = async function() {
  console.log('💳 Testing Payment Creation...');
  const Pi = (window as any).Pi;
  
  if (!Pi?.createPayment) {
    console.log('❌ Pi.createPayment not available. Open in Pi Browser for full test.');
    return;
  }
  
  const paymentData = {
    amount: 1.0,
    memo: "DropPay Test Payment - " + new Date().toISOString(),
    metadata: { 
      test: true, 
      timestamp: Date.now(),
      source: 'manual_test'
    }
  };
  
  const callbacks = {
    onReadyForServerApproval: (paymentId) => {
      console.log('✅ Payment ready for approval:', paymentId);
    },
    onReadyForServerCompletion: (paymentId, txid) => {
      console.log('✅ Payment ready for completion:', paymentId, txid);
    },
    onCancel: (paymentId) => {
      console.log('⚠️ Payment cancelled:', paymentId);
    },
    onError: (error, payment) => {
      console.log('❌ Payment error:', error, payment);
    }
  };
  
  try {
    console.log('📡 Creating payment:', paymentData);
    await Pi.createPayment(paymentData, callbacks);
    console.log('✅ Payment creation initiated');
  } catch (error) {
    console.log('❌ Payment creation failed:', error);
  }
};

// Test Ad Network
(window as any).testAds = async function() {
  console.log('📺 Testing Ad Network...');
  const Pi = (window as any).Pi;
  
  if (!Pi?.Ads) {
    console.log('❌ Pi.Ads not available. Open in Pi Browser with ads enabled for full test.');
    return;
  }
  
  try {
    // Check ad readiness
    const adTypes = ['rewarded', 'banner', 'interstitial'];
    
    for (const adType of adTypes) {
      try {
        const readyCheck = await Pi.Ads.isAdReady(adType);
        console.log(`📊 ${adType} ad ready:`, readyCheck.ready);
      } catch (error) {
        console.log(`⚠️ ${adType} ad check failed:`, error);
      }
    }
    
  } catch (error) {
    console.log('❌ Ad network test failed:', error);
  }
};

// Test Navigation
(window as any).testNavigation = function() {
  console.log('🧭 Testing Navigation...');
  
  const routes = [
    { path: '/', name: 'Homepage' },
    { path: '/auth', name: 'Authentication' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/pricing', name: 'Pricing' },
    { path: '/docs', name: 'Documentation' }
  ];
  
  console.log('Available routes to test:');
  routes.forEach((route, index) => {
    console.log(`   ${index + 1}. ${route.name}: ${window.location.origin}${route.path}`);
  });
  
  console.log('Use: window.location.href = "http://localhost:8080/route" to navigate');
};

// Test Database Connection (simplified)
(window as any).testDatabase = function() {
  console.log('🗄️ Testing Database Connection...');
  
  // Check if Supabase client exists (simplified check)
  const hasSupabase = !!(window as any).supabase || 
                      document.querySelector('script[src*="supabase"]') ||
                      env.supabaseUrl;
  
  console.log('   Supabase configured:', hasSupabase);
  console.log('   Database URL:', env.supabaseUrl ? 'Configured' : 'Not configured');
  
  if (hasSupabase) {
    console.log('✅ Database configuration detected');
  } else {
    console.log('⚠️ Database configuration missing');
  }
};

// Run All Tests
(window as any).runAllTests = async function() {
  console.log('🚀 Running All DropPay Tests...');
  console.log('================================');
  
  (window as any).testNavigation();
  (window as any).testDatabase();
  
  if ((window as any).Pi) {
    console.log('\n🔄 Running Pi Integration Tests...');
    await (window as any).testAds();
    // Note: testPiAuth and testPayment require user interaction
  } else {
    console.log('\n⚠️ Pi SDK not available - skipping Pi integration tests');
    console.log('   To test Pi features: Open this page in Pi Browser');
  }
  
  console.log('\n✅ All automated tests completed');
  console.log('🎯 Manual tests available: testPiAuth(), testPayment()');
};

console.log('\n🎮 Ready for testing!');
console.log('🔧 Run: runAllTests() for automated tests');
console.log('🔧 Run individual tests: testPiAuth(), testPayment(), testAds(), etc.');
console.log('📱 For full Pi integration: Open in Pi Browser');
console.log('');