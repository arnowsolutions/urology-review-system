import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

// Import CORS utilities
import { createCorsOptions, logCorsConfiguration } from '../src/utils/corsConfig';

// Import environment utilities
import { getCurrentEnvironment, logEnvironmentInfo, getEnvironmentInfo } from '../src/utils/environmentDetector';

// Import API route handlers
import applicantsRouter from '../src/routes/applicants';
import reviewersRouter from '../src/routes/reviewers';
import reviewsRouter from '../src/routes/reviews';
import progressRouter from '../src/routes/progress';

// Import data seeder
import { DataSeeder } from '../src/utils/dataSeeder';

// Load environment variables
dotenv.config();

// Log environment information for debugging
logEnvironmentInfo();

const app = express();

// Dynamic CORS configuration for Vercel
const corsOptions = createCorsOptions();
app.use(cors(corsOptions));

// Log CORS configuration for debugging
logCorsConfiguration();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    const envInfo = getEnvironmentInfo();
    const envVarsStatus = {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        PORT: !!process.env.PORT,
        NODE_ENV: !!process.env.NODE_ENV,
        CORS_ORIGIN: !!process.env.CORS_ORIGIN,
        DATABASE_URL: !!process.env.DATABASE_URL,
        VERCEL_URL: !!process.env.VERCEL_URL,
        VERCEL_ENV: !!process.env.VERCEL_ENV
    };
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'urological-review-backend',
        environment: envInfo.environment,
        isVercel: envInfo.isVercel,
        nodeEnv: envInfo.nodeEnv,
        port: envInfo.port,
        vercelInfo: envInfo.vercelInfo,
        environmentVariables: envVarsStatus
    });
});

// Database seeding endpoint
app.post('/api/seed', async (req, res) => {
    try {
        console.log('🌱 Starting database seeding via API endpoint...');
        await DataSeeder.seedAll();
        res.status(200).json({
            success: true,
            message: 'Database seeding completed successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        res.status(500).json({
            success: false,
            error: 'Database seeding failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});

// Mount API routes synchronously
app.use('/api/applicants', applicantsRouter);
app.use('/api/reviewers', reviewersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/progress', progressRouter);

// Root endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Urological Review System Backend API - Vercel Deployment',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            seed: 'POST /api/seed',
            applicants: '/api/applicants',
            reviewers: '/api/reviewers',
            reviews: '/api/reviews',
            progress: '/api/progress'
        },
        timestamp: new Date().toISOString()
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
        requestedPath: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        availableEndpoints: [
            'GET /api',
            'GET /api/health',
            'POST /api/seed',
            'GET /api/applicants',
            'POST /api/applicants',
            'GET /api/reviewers',
            'POST /api/reviewers',
            'GET /api/reviews',
            'POST /api/reviews',
            'GET /api/progress'
        ]
    });
});

// Global error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        timestamp: new Date().toISOString(),
        message: 'An unexpected error occurred'
    });
});

// Export the Express app as a Vercel function
export default app;