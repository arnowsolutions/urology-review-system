import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    // Debug environment variables
    const envInfo = {
        SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Missing',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
        SITE_NAME: process.env.SITE_NAME || 'Not set',
        NODE_ENV: process.env.NODE_ENV || 'Not set'
    };

    res.status(200).json({
        message: 'Environment Debug Info',
        environment: envInfo,
        timestamp: new Date().toISOString()
    });
}