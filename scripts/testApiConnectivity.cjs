// Node-compatible API connectivity test script
// Performs a simple health check with absolute URLs provided via API_BASE_URL env var

const API_BASE_URL = process.env.API_BASE_URL;

if (!API_BASE_URL) {
    console.error('Error: API_BASE_URL environment variable is required');
    process.exit(1);
}

async function testConnectivity() {
    try {
        console.log(`Testing API connectivity to: ${API_BASE_URL}/health`);

        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Timeout after 10 seconds
            signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
            console.log('API connectivity test: SUCCESS');
            process.exit(0);
        } else {
            console.log(`API connectivity test: FAILED (HTTP ${response.status})`);
            process.exit(1);
        }
    } catch (error) {
        console.error('API connectivity test: FAILED');
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testConnectivity();