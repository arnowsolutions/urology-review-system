/**
 * Centralized API configuration module for managing API URLs and endpoints.
 * Provides environment-aware URL detection and connectivity testing.
 */

import { isDevelopment } from '../utils/environmentDetector';

// Environment types
export type Environment = 'development' | 'production';

/**
 * Configuration options for API connectivity
 */
export interface ApiConfigOptions {
    /** Override the base URL */
    baseUrl?: string;
    /** Timeout for connectivity tests in milliseconds */
    timeout?: number;
    /** Number of retry attempts */
    retries?: number;
}

/**
 * Environment information object
 */
export interface EnvironmentInfo {
    type: Environment;
    hostname: string;
    protocol: string;
    port?: string;
    isLocalhost: boolean;
    isVercel: boolean;
}

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
    HEALTH: '/health',
    APPLICANTS: '/applicants',
    APPLICANTS_REGULAR: '/applicants/regular',
    APPLICANTS_I_SUB: '/applicants/i-sub',
    APPLICANTS_DISTRIBUTION: '/applicants/distribution',
    REVIEWERS: '/reviewers',
    REVIEWS: '/reviews',
    PROGRESS_STATS: '/progress/stats',
    FINAL_SELECTIONS: '/reviews/final-selections',
} as const;

/**
 * Detects the current environment based on various indicators
 * @returns The detected environment type
 */
export function detectEnvironment(): Environment {
    return isDevelopment() ? 'development' : 'production';
}

/**
 * Gets the API base URL based on the current environment
 * Environment variable precedence (highest to lowest):
 * 1. API_BASE_URL - Direct override for all environments
 * 2. REACT_APP_API_URL - React-specific override
 * 3. VITE_API_URL - Vite-specific override
 * @param options Configuration options
 * @returns The API base URL
 */
export function getApiBaseUrl(options: ApiConfigOptions = {}): string {
    // Check for environment variable override
    const envOverride = process.env.API_BASE_URL || process.env.REACT_APP_API_URL || process.env.VITE_API_URL;
    if (envOverride) {
        return envOverride;
    }

    // Use provided override
    if (options.baseUrl) {
        return options.baseUrl;
    }

    const env = detectEnvironment();
    return env === 'development' ? 'http://localhost:3001/api' : '/api';
}

/**
 * Gets detailed environment information
 * @returns Environment information object
 */
export function getEnvironmentInfo(): EnvironmentInfo {
    const env = detectEnvironment();
    let hostname = 'unknown';
    let protocol = 'http';
    let isVercel = false;

    if (typeof window !== 'undefined') {
        const location = window.location;
        hostname = location.hostname;
        protocol = location.protocol.replace(':', '');
        isVercel = hostname.includes('vercel.app') || !!process.env.VERCEL;
    }

    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    return {
        type: env,
        hostname,
        protocol,
        ...(typeof window !== 'undefined' && window.location.port && { port: window.location.port }),
        isLocalhost,
        isVercel,
    };
}

/**
 * Tests API connectivity by attempting to connect to different possible API URLs
 * @param options Configuration options
 * @returns Promise resolving to true if connection successful, false otherwise
 */
export async function testApiConnectivity(options: ApiConfigOptions = {}): Promise<boolean> {
    const timeout = options.timeout || 5000;
    const retries = options.retries || 2;

    const env = detectEnvironment();
    const urlsToTest = env === 'production'
        ? [getApiBaseUrl(options)]
        : [
            getApiBaseUrl(options),
            env === 'development' ? '/api' : 'http://localhost:3001/api',
        ];

    for (const baseUrl of urlsToTest) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(`${baseUrl}${API_ENDPOINTS.HEALTH}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    return true;
                }
            } catch (error) {
                if (attempt === retries) {
                    console.warn(`Connectivity test failed for ${baseUrl} after ${retries + 1} attempts:`, error);
                } else {
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
    }

    return false;
}