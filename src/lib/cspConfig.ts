// Content Security Policy Configuration
// Handles different CSP policies for development and production

export const getCSPPolicy = () => {
    const isDevelopment = process.env.NODE_ENV === 'development' ||
        typeof window !== 'undefined' && window.location.hostname === 'localhost';

    const basePolicy = {
        'default-src': ["'self'", 'https:', 'data:', 'blob:'],
        'script-src': [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://sdk.minepi.com',
            'https://app-cdn.minepi.com'
        ],
        'style-src': [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com'
        ],
        'font-src': [
            "'self'",
            'https://fonts.gstatic.com'
        ],
        'img-src': [
            "'self'",
            'https:',
            'data:',
            'blob:'
        ],
        'connect-src': [
            "'self'",
            'https:',
            'wss:',
            'ws:'
        ],
        'frame-src': [
            "'self'",
            'https://app-cdn.minepi.com'
        ]
    };

    // Add development-specific policies
    if (isDevelopment) {
        basePolicy['connect-src'].push('http://localhost:*', 'ws://localhost:*');
        basePolicy['script-src'].push('http://localhost:*');
        basePolicy['frame-src'].push('http://localhost:*');
    }

    // Convert to CSP string
    return Object.entries(basePolicy)
        .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
        .join('; ') + ';';
};

export const applyCSPMeta = () => {
    // Remove existing CSP meta tags
    const existingMeta = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    existingMeta.forEach(meta => meta.remove());

    // Add new CSP meta tag
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = getCSPPolicy();
    document.head.appendChild(meta);

    console.log('🔒 CSP policy applied:', meta.content);
};