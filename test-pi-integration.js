// Pi Network Integration Test
// Test the new API key integration

console.log('🔧 Testing Pi Network Integration with new API key...');

// Environment check
const config = {
  apiKey: import.meta.env.VITE_PI_API_KEY,
  validationKey: import.meta.env.VITE_PI_VALIDATION_KEY,
  environment: import.meta.env.VITE_PI_NETWORK,
  production: import.meta.env.VITE_PI_PRODUCTION_MODE,
};

console.log('📋 Configuration:');
console.log('API Key:', config.apiKey ? '✅ Configured (64 chars)' : '❌ Missing');
console.log('Validation Key:', config.validationKey ? '✅ Configured (128 chars)' : '❌ Missing');
console.log('Environment:', config.environment);
console.log('Production Mode:', config.production);

// Basic API key validation
function validateApiKey(apiKey) {
  if (!apiKey) return { valid: false, reason: 'API key is missing' };
  if (apiKey.length !== 64) return { valid: false, reason: 'API key length invalid' };
  if (!/^[a-z0-9]+$/.test(apiKey)) return { valid: false, reason: 'API key format invalid' };
  return { valid: true, reason: 'API key format is valid' };
}

// Test the API key
const validation = validateApiKey(config.apiKey);
console.log('🔍 API Key Validation:', validation.valid ? '✅' : '❌', validation.reason);

// Validation key check
function validateValidationKey(validationKey) {
  if (!validationKey) return { valid: false, reason: 'Validation key is missing' };
  if (validationKey.length !== 128) return { valid: false, reason: 'Validation key length invalid' };
  if (!/^[a-f0-9]+$/.test(validationKey)) return { valid: false, reason: 'Validation key format invalid' };
  return { valid: true, reason: 'Validation key format is valid' };
}

const validationKeyCheck = validateValidationKey(config.validationKey);
console.log('🔍 Validation Key Check:', validationKeyCheck.valid ? '✅' : '❌', validationKeyCheck.reason);

// Pi SDK availability check
function checkPiSDK() {
  if (typeof window !== 'undefined' && window.Pi) {
    return { available: true, version: window.Pi.version || 'Unknown' };
  }
  return { available: false, reason: 'Pi SDK not loaded or not in Pi Browser' };
}

const sdkCheck = checkPiSDK();
console.log('🌐 Pi SDK:', sdkCheck.available ? `✅ Available (v${sdkCheck.version})` : `❌ ${sdkCheck.reason}`);

// Summary
console.log('\n📊 Integration Status Summary:');
console.log('- API Key:', validation.valid ? '✅ Valid' : '❌ Invalid');
console.log('- Validation Key:', validationKeyCheck.valid ? '✅ Valid' : '❌ Invalid');
console.log('- Environment:', config.environment === 'mainnet' ? '✅ Mainnet' : '⚠️ ' + config.environment);
console.log('- Production Mode:', config.production === 'true' ? '✅ Enabled' : '⚠️ Disabled');
console.log('- Pi SDK:', sdkCheck.available ? '✅ Available' : '❌ Not Available');

if (validation.valid && validationKeyCheck.valid) {
  console.log('\n🎉 Basic configuration looks good! Ready for Pi Network integration.');
  console.log('💡 Next steps:');
  console.log('   1. Test in Pi Browser for full SDK functionality');
  console.log('   2. Test Pi authentication');
  console.log('   3. Test payment processing');
  console.log('   4. Test ad network features');
} else {
  console.log('\n⚠️ Configuration issues detected. Please check your environment variables.');
}

export { config, validateApiKey, validateValidationKey, checkPiSDK };