import { getCurrentEnvironment, getVercelUrl, isVercelDeployment, getEnvironmentInfo } from './environmentDetector';

/**
 * Interface for CORS configuration options
 */
export interface CorsOptions {
    origin: string | string[] | boolean | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
}

/**
 * Interface for CORS origin validation result
 */
export interface CorsValidationResult {
    isValid: boolean;
    allowedOrigins: string[];
    warnings: string[];
    errors: string[];
}

/**
 * Checks if the current environment is Vercel
 * @returns True if running on Vercel
 */
export function isVercelEnvironment(): boolean {
    return isVercelDeployment();
}

/**
 * Checks if the current deployment is a preview deployment
 * @returns True if preview deployment
 */
export function isPreviewDeployment(): boolean {
    return getCurrentEnvironment() === 'preview';
}

/**
 * Checks if the current deployment is production
 * @returns True if production
 */
export function isProduction(): boolean {
    return getCurrentEnvironment() === 'production';
}

/**
 * Gets the dynamic CORS origins based on the current environment
 * @returns Array of allowed origins
 */
export function getDynamicCorsOrigins(): string[] {
    const environment = getCurrentEnvironment();
    const origins: string[] = [];

    switch (environment) {
        case 'production':
            const vercelUrl = getVercelUrl();
            if (vercelUrl) {
                origins.push(`https://${vercelUrl}`);
            } else {
                // Fallback for production without VERCEL_URL
                const frontendUrl = process.env.FRONTEND_URL;
                if (frontendUrl) {
                    origins.push(frontendUrl);
                } else {
                    throw new Error('VERCEL_URL or FRONTEND_URL must be set in production environment');
                }
            }
            break;

        case 'preview':
            const previewUrl = getVercelUrl();
            if (previewUrl) {
                origins.push(`https://${previewUrl}`);
                // Add regex pattern for preview deployments with project name for security
                let projectName = process.env.VERCEL_PROJECT_NAME;
                if (!projectName) {
                    // Extract project name from VERCEL_URL (e.g., myproject-branch -> myproject)
                    const match = previewUrl.match(/^([^-]+)-/);
                    projectName = match ? match[1] : undefined;
                }
                if (projectName) {
                    origins.push(`^https://${projectName}-.*\\.vercel\\.app$`);
                } else {
                    origins.push(/^https:\/\/.*\.vercel\.app$/.source);
                }
            } else {
                // Fallback regex for preview deployments
                origins.push(/^https:\/\/.*\.vercel\.app$/.source);
            }
            break;

        case 'development':
        default:
            // Allow localhost origins for development
            origins.push('http://localhost:3000');
            origins.push('http://localhost:3001');
            origins.push('http://127.0.0.1:3000');
            origins.push('http://127.0.0.1:3001');
            // Allow custom frontend URL if set
            const customFrontendUrl = process.env.FRONTEND_URL;
            if (customFrontendUrl) {
                origins.push(customFrontendUrl);
            }
            break;
    }

    // Always allow the root domain for API calls
    if (isVercelDeployment()) {
        const vercelUrl = getVercelUrl();
        if (vercelUrl) {
            origins.push(`https://${vercelUrl}`);
        }
    }

    return [...new Set(origins)]; // Remove duplicates
}

/**
 * Validates CORS origins for security
 * @param origins Array of origins to validate
 * @returns Validation result
 */
export function validateCorsOrigins(origins: string[]): CorsValidationResult {
    const result: CorsValidationResult = {
        isValid: true,
        allowedOrigins: origins,
        warnings: [],
        errors: [],
    };

    for (const origin of origins) {
        // Check for overly permissive patterns
        if (origin === '*' || origin.includes('*') && !origin.startsWith('^') && !origin.endsWith('$')) {
            result.warnings.push(`Potentially insecure origin pattern: ${origin}`);
        }

        // Check for localhost in production
        if (isProduction() && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
            result.errors.push(`Localhost origin not allowed in production: ${origin}`);
            result.isValid = false;
        }

        // Check for valid URL format
        try {
            if (!origin.startsWith('http') && !origin.startsWith('^')) {
                result.errors.push(`Invalid origin format: ${origin}`);
                result.isValid = false;
            }
        } catch (error) {
            result.errors.push(`Invalid origin: ${origin}`);
            result.isValid = false;
        }
    }

    return result;
}

/**
 * Creates complete CORS configuration options
 * @param additionalOptions Additional CORS options to merge
 * @returns CORS configuration object
 */
export function createCorsOptions(additionalOptions: Partial<CorsOptions> = {}): CorsOptions {
    const origins = getDynamicCorsOrigins();
    const validation = validateCorsOrigins(origins);

    if (!validation.isValid) {
        console.error('CORS validation failed:', validation.errors);
        throw new Error('Invalid CORS configuration');
    }

    if (validation.warnings.length > 0) {
        console.warn('CORS warnings:', validation.warnings);
    }

    const baseOptions: CorsOptions = {
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, etc.)
            if (!origin) return callback(null, true);

            const isAllowed = origins.some(allowedOrigin => {
                // Check exact match first
                if (allowedOrigin === origin) {
                    return true;
                }
                // Check if it's a regex pattern (stored as string)
                if (allowedOrigin.startsWith('^') && allowedOrigin.endsWith('$')) {
                    const regex = new RegExp(allowedOrigin);
                    return regex.test(origin);
                }
                return false;
            });

            if (isAllowed) {
                callback(null, true);
            } else {
                console.warn(`CORS blocked origin: ${origin}`);
                callback(new Error('Not allowed by CORS'), false);
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true,
        maxAge: 86400, // 24 hours
    };

    return { ...baseOptions, ...additionalOptions };
}

/**
 * Logs CORS configuration for debugging
 */
export function logCorsConfiguration(): void {
    const environment = getCurrentEnvironment();
    const origins = getDynamicCorsOrigins();
    const validation = validateCorsOrigins(origins);

    console.log('CORS Configuration:', {
        environment,
        allowedOrigins: origins,
        validation: {
            isValid: validation.isValid,
            warnings: validation.warnings,
            errors: validation.errors,
        },
    });

    const envInfo = getEnvironmentInfo();
    console.log('Environment Info:', envInfo);
}
