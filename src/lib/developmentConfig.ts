// Development Configuration for Pi SDK
// Handles local development issues with Pi SDK

export const configurePiSDKForDevelopment = () => {
    const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

    if (!isDevelopment) return;

    // Override postMessage for development to prevent origin errors
    const originalPostMessage = window.postMessage;
    window.postMessage = function (message: any, targetOrigin: string) {
        try {
            // In development, allow Pi SDK postMessage calls
            if (typeof message === 'object' && message?.type?.includes?.('pi-')) {
                return originalPostMessage.call(this, message, '*');
            }
            return originalPostMessage.call(this, message, targetOrigin);
        } catch (error) {
            // Silently handle development postMessage errors
            console.debug('Development postMessage handled:', message);
        }
    };

    // Suppress specific Pi SDK development errors
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
        const errorMessage = args[0]?.toString() || '';
        if (
            errorMessage.includes('Messaging promise') ||
            errorMessage.includes('timed out after') ||
            errorMessage.includes('postMessage') ||
            errorMessage.includes('target origin') ||
            errorMessage.includes('app-cdn.minepi.com') ||
            errorMessage.includes('localhost:8080')
        ) {
            return; // Suppress these in development
        }
        originalError(...args);
    };

    console.warn = (...args) => {
        const warnMessage = args[0]?.toString() || '';
        if (
            warnMessage.includes('Pi SDK') ||
            warnMessage.includes('postMessage')
        ) {
            return; // Suppress Pi SDK warnings in development
        }
        originalWarn(...args);
    };

    console.log('🔧 Pi SDK development configuration applied');
};

// Mock Pi SDK for development if not available
export const mockPiSDKForDevelopment = () => {
    const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

    if (!isDevelopment || window.Pi) return;

    (window as any).Pi = {
        init: ({ version, sandbox }: { version: string; sandbox: boolean }) => {
            console.log(`🔧 Mock Pi SDK initialized - version: ${version}, sandbox: ${sandbox}`);
            return Promise.resolve();
        },
        authenticate: (scopes: string[], onIncompletePaymentFound?: Function) => {
            console.log('🔧 Mock Pi authentication called');
            return Promise.resolve({
                accessToken: 'mock-access-token',
                user: {
                    uid: 'mock-user-id',
                    username: 'mock-user'
                }
            });
        },
        createPayment: (paymentData: any, callbacks?: any) => {
            console.log('🔧 Mock Pi payment created:', paymentData);
            return Promise.resolve({
                paymentId: 'mock-payment-id'
            });
        },
        nativeFeaturesList: () => {
            return Promise.resolve(['payments', 'authentication']);
        }
    };

    console.log('🔧 Mock Pi SDK initialized for development');
};