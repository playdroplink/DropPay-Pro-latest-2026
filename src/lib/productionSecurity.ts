/**
 * Production Security Configuration
 * Disable debug logging and secure sensitive data exposure
 */

// Production environment detection
const isProduction = import.meta.env.PROD || import.meta.env.VITE_ENVIRONMENT === 'production';
export const isDevelopment = !isProduction;

// Override console methods in production to prevent data leakage
if (isProduction) {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  // List of sensitive patterns to block
  const SENSITIVE_PATTERNS = [
    /api[_-]?key/i,
    /validation[_-]?key/i,
    /secret/i,
    /token/i,
    /password/i,
    /private[_-]?key/i,
    /service[_-]?role/i,
    /[a-z0-9]{40,}/i, // Long strings that might be keys
  ];

  // Safe console wrapper
  const safeConsole = (originalMethod: any, level: string) => {
    return (...args: any[]) => {
      // Check if any argument contains sensitive data
      const argsString = JSON.stringify(args, null, 2);
      const hasSensitiveData = SENSITIVE_PATTERNS.some(pattern =>
        pattern.test(argsString)
      );

      if (hasSensitiveData) {
        originalMethod(`[${level.toUpperCase()}] Log suppressed - contains sensitive data`);
        return;
      }

      // Log normally if no sensitive data detected
      originalMethod(...args);
    };
  };

  // Override console methods
  console.log = safeConsole(originalLog, 'log');
  console.warn = safeConsole(originalWarn, 'warn');
  console.error = safeConsole(originalError, 'error');

  // Disable debug features
  (window as any).__DEBUG__ = false;
  (window as any).__DEVELOPMENT__ = false;

  console.log('🔒 Production security enabled - sensitive logging disabled');
}

// Environment sanitizer for client-side
export const sanitizeEnvForClient = () => {
  return {
    // Only include non-sensitive environment variables
    VITE_DOMAIN: import.meta.env.VITE_DOMAIN,
    VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
    VITE_PI_NETWORK: import.meta.env.VITE_PI_NETWORK,
    VITE_PI_SANDBOX_MODE: import.meta.env.VITE_PI_SANDBOX_MODE,
    VITE_PI_PRODUCTION_MODE: import.meta.env.VITE_PI_PRODUCTION_MODE,
    VITE_PLATFORM_NAME: import.meta.env.VITE_PLATFORM_NAME,
    VITE_PLATFORM_URL: import.meta.env.VITE_PLATFORM_URL,

    // Status indicators only (not actual values)
    secrets: {
      apiKeyConfigured: !!import.meta.env.VITE_PI_API_KEY,
      validationKeyConfigured: !!import.meta.env.VITE_PI_VALIDATION_KEY,
      supabaseConfigured: !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    }
  };
};

// Security headers injection
import { applyCSPMeta } from './cspConfig';

export const injectSecurityHeaders = () => {
  // Apply comprehensive CSP policy
  applyCSPMeta();

  // Prevent debugging in production
  if (isProduction) {
    // Disable right-click context menu
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Disable F12 and other dev tool shortcuts
    document.addEventListener('keydown', e => {
      if (e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        console.log('🔒 Developer tools access restricted in production');
      }
    });
  }
};

// Initialize security measures
if (typeof window !== 'undefined') {
  injectSecurityHeaders();
}