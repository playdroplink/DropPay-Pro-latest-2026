// Pi Payment Diagnostic Component
// Add this to help debug payment issues

export interface PaymentDiagnostic {
  timestamp: string;
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export const logPaymentStep = (
  step: string,
  status: 'pending' | 'success' | 'error',
  message: string,
  details?: any
): PaymentDiagnostic => {
  const diagnostic: PaymentDiagnostic = {
    timestamp: new Date().toISOString(),
    step,
    status,
    message,
    details,
  };
  
  const icon = status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳';
  console.log(`${icon} [${step}] ${message}`, details || '');
  
  return diagnostic;
};

export const checkPaymentPrerequisites = (): {
  ready: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Check if in Pi Browser
  const isPiBrowser = Boolean((window as any).Pi) || 
                     navigator.userAgent.includes('PiBrowser');
  if (!isPiBrowser) {
    issues.push('Not running in Pi Browser');
  }
  
  // Check if Pi SDK is loaded
  if (!(window as any).Pi) {
    issues.push('Pi SDK not loaded');
  }
  
  // Check if Pi SDK methods are available
  const Pi = (window as any).Pi;
  if (Pi) {
    if (typeof Pi.authenticate !== 'function') {
      issues.push('Pi.authenticate not available');
    }
    if (typeof Pi.createPayment !== 'function') {
      issues.push('Pi.createPayment not available');
    }
  }
  
  // Check environment configuration
  if (!import.meta.env.VITE_SUPABASE_URL) {
    issues.push('VITE_SUPABASE_URL not configured');
  }
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    issues.push('VITE_SUPABASE_ANON_KEY not configured');
  }
  
  return {
    ready: issues.length === 0,
    issues,
  };
};

// Run diagnostic and log results
export const runPaymentDiagnostic = () => {
  console.group('💳 Pi Payment Diagnostic');
  
  const check = checkPaymentPrerequisites();
  
  console.log('Environment:', {
    isPiBrowser: Boolean((window as any).Pi) || navigator.userAgent.includes('PiBrowser'),
    piSdkLoaded: Boolean((window as any).Pi),
    userAgent: navigator.userAgent,
    supabaseConfigured: Boolean(import.meta.env.VITE_SUPABASE_URL),
    sandboxMode: import.meta.env.VITE_PI_SANDBOX_MODE,
  });
  
  if (check.ready) {
    console.log('✅ All prerequisites met');
  } else {
    console.warn('⚠️ Issues found:');
    check.issues.forEach((issue, i) => {
      console.warn(`  ${i + 1}. ${issue}`);
    });
  }
  
  console.groupEnd();
  
  return check;
};
