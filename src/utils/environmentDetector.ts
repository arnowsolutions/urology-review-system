/**
 * Comprehensive environment detection utilities for the application.
 * Provides functions to detect various environment types and deployment contexts.
 */

// Environment types
export type EnvironmentType = 'development' | 'production' | 'preview';

/**
 * Detailed environment information
 */
export interface EnvironmentDetails {
    type: EnvironmentType;
    hostname: string;
    protocol: string;
    port?: string;
    isLocalhost: boolean;
    isVercel: boolean;
    isPreview: boolean;
    userAgent?: string;
}

/**
 * Checks if the current environment is production
 * @returns True if running in production
 */
export function isProduction(): boolean {
    // Check Vercel production environment
    if (process.env.VERCEL_ENV === 'production') {
        return true;
    }

    // Check NODE_ENV
    if (process.env.NODE_ENV === 'production') {
        return true;
    }

    // Check hostname for production indicators
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // Not localhost and not common dev domains
        return hostname !== 'localhost' &&
            hostname !== '127.0.0.1' &&
            !hostname.startsWith('192.168.') &&
            !hostname.startsWith('10.') &&
            !hostname.includes('vercel-preview.app') &&
            !hostname.includes('localhost');
    }

    return false;
}

/**
 * Checks if the current environment is development
 * @returns True if running in development
 */
export function isDevelopment(): boolean {
    return !isProduction();
}

/**
 * Checks if the current environment is a Vercel preview deployment
 * @returns True if running in Vercel preview
 */
export function isVercelPreview(): boolean {
    if (typeof window !== 'undefined') {
        return window.location.hostname.includes('vercel-preview.app') ||
            window.location.hostname.includes('vercel.app');
    }
    return process.env.VERCEL_ENV === 'preview' ||
        process.env.VERCEL_URL?.includes('vercel-preview') ||
        false;
}

/**
 * Gets the current domain/hostname
 * @returns The current hostname or 'unknown' if not available
 */
export function getCurrentDomain(): string {
    if (typeof window !== 'undefined') {
        return window.location.hostname;
    }
    return 'unknown';
}

/**
 * Checks if the current hostname indicates localhost
 * @returns True if running on localhost
 */
export function isLocalhost(): boolean {
    const hostname = getCurrentDomain();
    return hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname === '0.0.0.0';
}

/**
 * Gets Vercel-specific environment information
 * @returns Object with Vercel environment details
 */
export function getVercelEnvironment(): {
    isVercel: boolean;
    env: string | undefined;
    url: string | undefined;
    gitCommitSha: string | undefined;
    gitCommitMessage: string | undefined;
    gitCommitAuthor: string | undefined;
} {
    return {
        isVercel: !!process.env.VERCEL,
        env: process.env.VERCEL_ENV,
        url: process.env.VERCEL_URL,
        gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
        gitCommitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE,
        gitCommitAuthor: process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME,
    };
}

/**
 * Gets comprehensive environment information
 * @returns Detailed environment information object
 */
export function getEnvironmentInfo(): EnvironmentDetails {
    try {
        const isVercel = !!process.env.VERCEL;
        const isPreview = isVercelPreview();
        let hostname = 'unknown';
        let protocol = 'http';
        let port: string | undefined;
        let userAgent: string | undefined;

        if (typeof window !== 'undefined') {
            const location = window.location;
            hostname = location.hostname;
            protocol = location.protocol.replace(':', '');
            port = location.port || undefined;
            userAgent = navigator.userAgent;
        }

        const localhost = isLocalhost();
        let type: EnvironmentType = 'development';

        if (isProduction()) {
            type = 'production';
        } else if (isPreview) {
            type = 'preview';
        }

        return {
            type,
            hostname,
            protocol,
            port,
            isLocalhost: localhost,
            isVercel,
            isPreview,
            userAgent,
        };
    } catch (error) {
        console.warn('Error detecting environment info:', error);
        // Fallback to safe defaults
        return {
            type: 'development',
            hostname: 'unknown',
            protocol: 'http',
            isLocalhost: true,
            isVercel: false,
            isPreview: false,
        };
    }
}

/**
 * Checks if the application is running in a browser environment
 * @returns True if running in browser
 */
export function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Checks if the application is running in a Node.js environment
 * @returns True if running in Node.js
 */
export function isNode(): boolean {
    return typeof process !== 'undefined' &&
        process.versions != null &&
        process.versions.node != null;
}

/**
 * Gets the current environment as a string for logging/debugging
 * @returns Environment description string
 */
export function getEnvironmentString(): string {
    const info = getEnvironmentInfo();
    const vercel = getVercelEnvironment();

    let str = `Environment: ${info.type}`;
    str += ` | Hostname: ${info.hostname}`;
    str += ` | Protocol: ${info.protocol}`;
    if (info.port) str += ` | Port: ${info.port}`;
    str += ` | Localhost: ${info.isLocalhost}`;
    str += ` | Vercel: ${info.isVercel}`;
    if (vercel.env) str += ` | Vercel Env: ${vercel.env}`;

    return str;
}