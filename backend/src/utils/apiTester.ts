import { getDynamicCorsOrigins, validateCorsOrigins, CorsValidationResult } from './corsConfig';
import { getCurrentEnvironment, getEnvironmentInfo } from './environmentDetector';

/**
 * Interface for test request options
 */
export interface TestRequestOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    timeout?: number;
}

/**
 * Interface for test response
 */
export interface TestResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    duration: number;
    error?: string;
}

/**
 * Interface for CORS test result
 */
export interface CorsTestResult {
    origin: string;
    allowed: boolean;
    response?: TestResponse;
    error?: string;
}

/**
 * Interface for API endpoint test result
 */
export interface ApiEndpointTestResult {
    endpoint: string;
    method: string;
    success: boolean;
    response?: TestResponse;
    error?: string;
}

/**
 * Interface for comprehensive CORS test report
 */
export interface CorsTestReport {
    timestamp: Date;
    environment: string;
    corsOrigins: string[];
    validation: CorsValidationResult;
    tests: CorsTestResult[];
    summary: {
        totalTests: number;
        passedTests: number;
        failedTests: number;
        blockedOrigins: string[];
    };
}

/**
 * Makes a test HTTP request to the specified URL
 * @param url The URL to test
 * @param options Request options
 * @returns Promise resolving to test response
 */
async function makeTestRequest(url: string, options: TestRequestOptions = {}): Promise<TestResponse> {
    const startTime = Date.now();

    try {
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: options.headers || {},
            body: options.body,
            signal: options.timeout ? AbortSignal.timeout(options.timeout) : undefined,
        });

        const body = await response.text();
        const duration = Date.now() - startTime;

        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });

        return {
            status: response.status,
            statusText: response.statusText,
            headers,
            body,
            duration,
        };
    } catch (error) {
        const duration = Date.now() - startTime;
        return {
            status: 0,
            statusText: 'Error',
            headers: {},
            body: '',
            duration,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Tests CORS configuration by making requests from different origins
 * @param baseUrl Base URL of the API
 * @param testOrigins Array of origins to test (optional, uses dynamic origins if not provided)
 * @returns Array of CORS test results
 */
export async function testCorsConfiguration(
    baseUrl: string,
    testOrigins?: string[]
): Promise<CorsTestResult[]> {
    const origins = testOrigins || getDynamicCorsOrigins();
    const results: CorsTestResult[] = [];

    for (const origin of origins) {
        try {
            // Test preflight request (OPTIONS)
            const preflightResponse = await makeTestRequest(`${baseUrl}/api/health`, {
                method: 'OPTIONS',
                headers: {
                    'Origin': origin,
                    'Access-Control-Request-Method': 'GET',
                    'Access-Control-Request-Headers': 'Content-Type',
                },
                timeout: 5000,
            });

            // Test actual request
            const actualResponse = await makeTestRequest(`${baseUrl}/api/health`, {
                method: 'GET',
                headers: {
                    'Origin': origin,
                },
                timeout: 5000,
            });

            const allowed = preflightResponse.status === 200 &&
                actualResponse.status !== 0 &&
                !actualResponse.error;

            results.push({
                origin,
                allowed,
                response: allowed ? actualResponse : preflightResponse,
            });
        } catch (error) {
            results.push({
                origin,
                allowed: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    return results;
}

/**
 * Tests API endpoints for connectivity
 * @param baseUrl Base URL of the API
 * @param endpoints Array of endpoint paths to test
 * @returns Array of endpoint test results
 */
export async function testApiEndpoints(
    baseUrl: string,
    endpoints: string[] = ['/health', '/api/health']
): Promise<ApiEndpointTestResult[]> {
    const results: ApiEndpointTestResult[] = [];

    for (const endpoint of endpoints) {
        try {
            const response = await makeTestRequest(`${baseUrl}${endpoint}`, {
                method: 'GET',
                timeout: 5000,
            });

            results.push({
                endpoint,
                method: 'GET',
                success: response.status >= 200 && response.status < 300,
                response,
            });
        } catch (error) {
            results.push({
                endpoint,
                method: 'GET',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    return results;
}

/**
 * Validates API routing configuration
 * @param baseUrl Base URL of the API
 * @returns Validation result
 */
export async function validateApiRouting(baseUrl: string): Promise<{
    isValid: boolean;
    routes: { path: string; accessible: boolean }[];
    errors: string[];
}> {
    const routes = [
        { path: '/api/health', expected: true },
        { path: '/health', expected: true },
        { path: '/api/debug', expected: false }, // May not exist
    ];

    const results = [];
    const errors: string[] = [];

    for (const route of routes) {
        try {
            const response = await makeTestRequest(`${baseUrl}${route.path}`, {
                timeout: 5000,
            });

            const accessible = response.status !== 404;
            results.push({ path: route.path, accessible });

            if (route.expected && !accessible) {
                errors.push(`Expected route ${route.path} is not accessible`);
            }
        } catch (error) {
            results.push({ path: route.path, accessible: false });
            if (route.expected) {
                errors.push(`Failed to access expected route ${route.path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }

    return {
        isValid: errors.length === 0,
        routes: results,
        errors,
    };
}

/**
 * Tests cross-origin requests by simulating frontend requests
 * @param apiUrl API base URL
 * @param frontendUrl Frontend URL to simulate requests from
 * @returns Test result
 */
export async function testCrossOriginRequests(
    apiUrl: string,
    frontendUrl: string
): Promise<CorsTestResult> {
    try {
        const response = await makeTestRequest(`${apiUrl}/api/health`, {
            method: 'GET',
            headers: {
                'Origin': frontendUrl,
                'Referer': frontendUrl,
            },
            timeout: 5000,
        });

        const allowed = response.status >= 200 && response.status < 300 &&
            response.headers['access-control-allow-origin'] === frontendUrl;

        return {
            origin: frontendUrl,
            allowed,
            response,
        };
    } catch (error) {
        return {
            origin: frontendUrl,
            allowed: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Generates a comprehensive CORS test report
 * @param baseUrl Base URL to test against
 * @param additionalOrigins Additional origins to test
 * @returns Comprehensive test report
 */
export async function generateCorsTestReport(
    baseUrl: string,
    additionalOrigins: string[] = []
): Promise<CorsTestReport> {
    const environment = getCurrentEnvironment();
    const corsOrigins = getDynamicCorsOrigins();
    const validation = validateCorsOrigins(corsOrigins);

    const testOrigins = [...corsOrigins, ...additionalOrigins];
    const tests = await testCorsConfiguration(baseUrl, testOrigins);

    const passedTests = tests.filter(test => test.allowed).length;
    const failedTests = tests.length - passedTests;
    const blockedOrigins = tests.filter(test => !test.allowed).map(test => test.origin);

    return {
        timestamp: new Date(),
        environment,
        corsOrigins,
        validation,
        tests,
        summary: {
            totalTests: tests.length,
            passedTests,
            failedTests,
            blockedOrigins,
        },
    };
}

/**
 * Logs a CORS test report to console
 * @param report Test report to log
 */
export function logCorsTestReport(report: CorsTestReport): void {
    console.log('=== CORS Test Report ===');
    console.log(`Timestamp: ${report.timestamp.toISOString()}`);
    console.log(`Environment: ${report.environment}`);
    console.log(`CORS Origins: ${report.corsOrigins.join(', ')}`);
    console.log(`Validation: ${report.validation.isValid ? 'Valid' : 'Invalid'}`);
    if (report.validation.warnings.length > 0) {
        console.log(`Warnings: ${report.validation.warnings.join(', ')}`);
    }
    if (report.validation.errors.length > 0) {
        console.log(`Errors: ${report.validation.errors.join(', ')}`);
    }
    console.log(`Tests: ${report.summary.passedTests}/${report.summary.totalTests} passed`);
    if (report.summary.blockedOrigins.length > 0) {
        console.log(`Blocked Origins: ${report.summary.blockedOrigins.join(', ')}`);
    }
    console.log('=== End Report ===');
}
