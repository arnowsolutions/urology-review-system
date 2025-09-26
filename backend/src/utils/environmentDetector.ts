/**
 * Interface for Vercel environment information
 */
export interface VercelEnvironmentInfo {
    url: string;
    env: string;
    region?: string;
    projectId?: string;
    teamId?: string;
}

/**
 * Interface for comprehensive environment information
 */
export interface EnvironmentInfo {
    environment: 'development' | 'preview' | 'production';
    isVercel: boolean;
    vercelInfo?: VercelEnvironmentInfo;
    nodeEnv: string;
    port?: number;
}

/**
 * Gets the current Vercel URL from environment variables
 * @returns The Vercel deployment URL or undefined if not available
 */
export function getVercelUrl(): string | undefined {
    return process.env.VERCEL_URL;
}

/**
 * Gets the current Vercel environment (production, preview, development)
 * @returns The Vercel environment or undefined if not available
 */
export function getVercelEnvironment(): string | undefined {
    return process.env.VERCEL_ENV;
}

/**
 * Gets the Vercel region
 * @returns The Vercel region or undefined if not available
 */
export function getVercelRegion(): string | undefined {
    return process.env.VERCEL_REGION;
}

/**
 * Checks if the application is running in a Vercel environment
 * @returns True if running on Vercel, false otherwise
 */
export function isVercelDeployment(): boolean {
    return !!getVercelUrl() && !!getVercelEnvironment();
}

/**
 * Determines the current environment based on available context
 * @returns 'development', 'preview', or 'production'
 */
export function getCurrentEnvironment(): 'development' | 'preview' | 'production' {
    const vercelEnv = getVercelEnvironment();
    const nodeEnv = process.env.NODE_ENV;

    if (vercelEnv === 'production') {
        return 'production';
    }

    if (vercelEnv === 'preview') {
        return 'preview';
    }

    // Fallback to NODE_ENV or default to development
    if (nodeEnv === 'production') {
        return 'production';
    }

    return 'development';
}

/**
 * Gets comprehensive environment information
 * @returns Detailed environment information object
 */
export function getEnvironmentInfo(): EnvironmentInfo {
    const environment = getCurrentEnvironment();
    const isVercel = isVercelDeployment();

    const info: EnvironmentInfo = {
        environment,
        isVercel,
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    };

    if (isVercel) {
        info.vercelInfo = {
            url: getVercelUrl()!,
            env: getVercelEnvironment()!,
            region: getVercelRegion(),
            projectId: process.env.VERCEL_PROJECT_ID,
            teamId: process.env.VERCEL_TEAM_ID,
        };
    }

    return info;
}

/**
 * Validates that required environment variables are present
 * @param requiredVars Array of required environment variable names
 * @returns Object with validation results
 */
export function validateEnvironment(requiredVars: string[] = []): {
    isValid: boolean;
    missingVars: string[];
    warnings: string[];
} {
    const missingVars: string[] = [];
    const warnings: string[] = [];

    // Check for Vercel-specific variables if in Vercel environment
    if (isVercelDeployment()) {
        if (!getVercelUrl()) {
            missingVars.push('VERCEL_URL');
        }
        if (!getVercelEnvironment()) {
            missingVars.push('VERCEL_ENV');
        }
    }

    // Check custom required variables
    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    }

    // Add warnings for potential issues
    if (getCurrentEnvironment() === 'production' && !isVercelDeployment()) {
        warnings.push('Running in production but not on Vercel - CORS may not work correctly');
    }

    if (getCurrentEnvironment() === 'development' && isVercelDeployment()) {
        warnings.push('Running on Vercel but detected as development environment');
    }

    return {
        isValid: missingVars.length === 0,
        missingVars,
        warnings,
    };
}

/**
 * Logs environment information for debugging
 */
export function logEnvironmentInfo(): void {
    const info = getEnvironmentInfo();
    console.log('Environment Detection:', {
        environment: info.environment,
        isVercel: info.isVercel,
        nodeEnv: info.nodeEnv,
        port: info.port,
        vercelInfo: info.vercelInfo ? {
            url: info.vercelInfo.url,
            env: info.vercelInfo.env,
            region: info.vercelInfo.region,
        } : undefined,
    });

    const validation = validateEnvironment();
    if (!validation.isValid) {
        console.warn('Environment validation failed:', validation.missingVars);
    }
    if (validation.warnings.length > 0) {
        console.warn('Environment warnings:', validation.warnings);
    }
}