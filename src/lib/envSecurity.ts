/**
 * Security utilities for handling environment variables safely
 * Prevents exposure of sensitive information in console logs
 */

export interface EnvSecurityConfig {
  maskKeys: boolean;
  logLevel: 'none' | 'minimal' | 'full';
}

export class EnvSecurityManager {
  private static readonly SENSITIVE_KEYS = [
    'API_KEY',
    'VALIDATION_KEY',
    'SECRET',
    'PASSWORD',
    'TOKEN',
    'PRIVATE_KEY',
    'SERVICE_ROLE_KEY',
    'ANON_KEY'
  ];

  /**
   * Safely log environment variable status without exposing values
   */
  static logEnvStatus(envVar: string, value?: string): void {
    const isSensitive = this.SENSITIVE_KEYS.some(key => 
      envVar.toUpperCase().includes(key)
    );

    if (isSensitive) {
      console.log(`🔒 ${envVar}:`, value ? '✅ Configured' : '❌ Missing');
    } else {
      console.log(`⚙️ ${envVar}:`, value || 'Not set');
    }
  }

  /**
   * Mask sensitive values for logging
   */
  static maskValue(value: string, visibleChars: number = 4): string {
    if (!value || value.length <= visibleChars) {
      return '[PROTECTED]';
    }
    return `${value.substring(0, visibleChars)}${'*'.repeat(value.length - visibleChars)}`;
  }

  /**
   * Validate environment variable without logging its value
   */
  static validateSecurely(envVar: string, value: string, validator?: (val: string) => boolean): {
    valid: boolean;
    configured: boolean;
    message: string;
  } {
    const configured = !!value;
    
    if (!configured) {
      return {
        valid: false,
        configured: false,
        message: `${envVar} is not configured`
      };
    }

    const valid = validator ? validator(value) : true;
    
    return {
      valid,
      configured: true,
      message: valid ? 
        `${envVar} is valid` : 
        `${envVar} format is invalid`
    };
  }

  /**
   * Get safe environment configuration for logging
   */
  static getSafeConfig() {
    return {
      // Public configuration - safe to log
      network: import.meta.env.VITE_PI_NETWORK,
      environment: import.meta.env.VITE_PI_ENVIRONMENT,
      production: import.meta.env.VITE_PI_PRODUCTION_MODE === 'true',
      sandbox: import.meta.env.VITE_PI_SANDBOX_MODE === 'true',
      
      // Sensitive configuration - only status
      apiKey: {
        configured: !!import.meta.env.VITE_PI_API_KEY,
        length: import.meta.env.VITE_PI_API_KEY?.length || 0,
        valid: import.meta.env.VITE_PI_API_KEY?.length === 64
      },
      validationKey: {
        configured: !!import.meta.env.VITE_PI_VALIDATION_KEY,
        length: import.meta.env.VITE_PI_VALIDATION_KEY?.length || 0,
        valid: import.meta.env.VITE_PI_VALIDATION_KEY?.length === 128
      },
      supabase: {
        urlConfigured: !!import.meta.env.VITE_SUPABASE_URL,
        keyConfigured: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      }
    };
  }

  /**
   * Log configuration safely
   */
  static logSafeConfig(): void {
    const config = this.getSafeConfig();
    
    console.group('🔒 DropPay Configuration Status');
    
    // Network configuration
    console.log('🌐 Network:', config.network);
    console.log('🏭 Environment:', config.environment);
    console.log('⚙️ Production Mode:', config.production);
    console.log('🧪 Sandbox Mode:', config.sandbox);
    
    // API configuration status only
    console.log('🔑 API Key:', config.apiKey.configured ? '✅ Configured' : '❌ Missing');
    console.log('🔐 Validation Key:', config.validationKey.configured ? '✅ Configured' : '❌ Missing');
    console.log('🗄️ Supabase:', config.supabase.urlConfigured && config.supabase.keyConfigured ? '✅ Configured' : '❌ Missing');
    
    console.groupEnd();
  }

  /**
   * Remove sensitive data from objects for logging
   */
  static sanitizeForLogging(obj: any): any {
    const sanitized = { ...obj };
    
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'string') {
        const isSensitive = this.SENSITIVE_KEYS.some(sensitiveKey => 
          key.toUpperCase().includes(sensitiveKey)
        );
        
        if (isSensitive) {
          sanitized[key] = sanitized[key] ? '[PROTECTED]' : undefined;
        }
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeForLogging(sanitized[key]);
      }
    }
    
    return sanitized;
  }
}

// For development only - remove in production builds
if (import.meta.env.DEV) {
  (window as any).EnvSecurityManager = EnvSecurityManager;
}