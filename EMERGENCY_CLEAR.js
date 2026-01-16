// EMERGENCY FIX FOR MOBILE USERS
// Copy this entire code block and paste in browser console

// Clear all storage
console.log('🧹 Clearing all cached data...');
localStorage.clear();
sessionStorage.clear();

// Clear any service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

// Force reload
console.log('✅ Cache cleared! Reloading...');
setTimeout(() => {
  location.href = location.origin + '/auth';
}, 1000);
