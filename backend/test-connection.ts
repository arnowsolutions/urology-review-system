/**
 * Database Connection Test Script
 *
 * This script tests the Supabase database connection using the configured environment variables.
 *
 * Usage:
 * - Local development: npm run test:connection
 * - Vercel environment: npm run test:connection:vercel
 * - Direct execution: npx ts-node test-connection.ts
 */

import 'dotenv/config';

function detectEnvironment(): string {
    if (process.env.VERCEL) {
        if (process.env.VERCEL_ENV === 'production') return 'Vercel Production';
        if (process.env.VERCEL_ENV === 'preview') return 'Vercel Preview';
        return 'Vercel Development';
    }
    if (process.env.NODE_ENV === 'production') return 'Local Production';
    return 'Local Development';
}

function validateEnvironmentVariables(): boolean {
    const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        console.error('Please check your .env file or Vercel dashboard environment variables.');
        return false;
    }

    console.log('✅ All required environment variables are set.');
    return true;
}

function logEnvironmentInfo(): void {
    console.log(`🌍 Testing in: ${detectEnvironment()}`);
    console.log('📋 Environment Variables Status:');
    console.log(`   - SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Set (masked)' : '❌ Missing'}`);
    console.log(`   - SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set (masked)' : '❌ Missing'}`);
    console.log('');
}

async function testConnection(): Promise<boolean> {
    try {
        console.log('🔍 Testing Supabase database connection...\n');

        // Validate environment variables first
        if (!validateEnvironmentVariables()) {
            return false;
        }

        // Dynamically import Supabase after env validation passes
        const { supabaseAdmin } = await import('./src/config/supabase');

        // Log environment information
        logEnvironmentInfo();

        // Try a simple health check by querying a non-existent table
        // This tests connectivity without affecting real data
        const { data, error } = await supabaseAdmin
            .from('connection_test_table')
            .select('*', { count: 'exact', head: true });

        // If we get a "relation does not exist" error, connection is working
        if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
            console.log('✅ Database connection successful!');
            console.log('   - Supabase service is reachable');
            console.log('   - Authentication credentials are valid');
            console.log('   - Database permissions are working');
            console.log(`   - Connection established to: ${process.env.SUPABASE_URL}`);
            return true;
        }

        // Handle other types of errors
        if (error) {
            console.error('❌ Connection failed with error:');
            console.error(`   Code: ${error.code || 'Unknown'}`);
            console.error(`   Message: ${error.message}`);
            console.error(`   Details: ${error.details || 'No additional details'}`);

            // Provide specific guidance based on error type
            if (error.message.includes('JWT')) {
                console.error('💡 This appears to be an authentication issue. Check your SUPABASE_SERVICE_ROLE_KEY.');
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                console.error('💡 This appears to be a network connectivity issue. Check your SUPABASE_URL.');
            }

            return false;
        }

        // Unexpected success (shouldn't happen with non-existent table)
        console.log('✅ Connection successful! (Unexpected response, but connection works)');
        return true;

    } catch (err) {
        console.error('❌ Connection test failed with exception:');
        console.error(`   Error: ${err instanceof Error ? err.message : String(err)}`);

        if (err instanceof Error && err.stack) {
            console.error('   Stack trace available - this might be a code issue');
        }

        return false;
    }
}

testConnection().then(result => {
    process.exit(result ? 0 : 1);
});