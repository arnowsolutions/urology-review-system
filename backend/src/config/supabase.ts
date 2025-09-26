import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value || value === `YOUR_${key.replace('SUPABASE_', '')}_HERE`)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Please set these variables in your .env file or deployment environment.');
    console.error('For local development, copy .env.example to .env and fill in the values.');
    process.exit(1);
}

// Create Supabase clients
const supabaseUrl = requiredEnvVars.SUPABASE_URL!;
const supabaseAnonKey = requiredEnvVars.SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY!;

// Anonymous client for general operations
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role key for privileged operations
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Utility function to test database connection
export async function testDatabaseConnection(): Promise<boolean> {
    try {
        const { data, error } = await supabaseAdmin
            .from('urology_applicants')
            .select('count', { count: 'exact', head: true });

        if (error && !error.message.includes('relation "urology_applicants" does not exist')) {
            console.error('Database connection test failed:', error.message);
            return false;
        }

        console.log('✅ Database connection successful');
        return true;
    } catch (err) {
        console.error('Database connection test failed:', err);
        return false;
    }
}

console.log('✅ Supabase clients initialized');