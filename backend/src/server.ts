import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { testDatabaseConnection } from './config/supabase';
import { DataSeeder } from './utils/dataSeeder';

// Import routes
import applicantsRouter from './routes/applicants';
import reviewersRouter from './routes/reviewers';
import reviewsRouter from './routes/reviews';
import progressRouter from './routes/progress';

// Import CORS utilities
import { createCorsOptions, logCorsConfiguration, validateCorsOrigins, getDynamicCorsOrigins } from './utils/corsConfig';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Dynamic CORS configuration
const corsOptions = createCorsOptions();
app.use(cors(corsOptions));

// Log CORS configuration for debugging
logCorsConfiguration();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'urological-review-backend'
    });
});

// Mount API routes
app.use('/api/applicants', applicantsRouter);
app.use('/api/reviewers', reviewersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/progress', progressRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Urological Review System Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            applicants: '/api/applicants',
            reviewers: '/api/reviewers',
            reviews: '/api/reviews',
            progress: '/api/progress'
        },
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        availableEndpoints: [
            'GET /',
            'GET /health',
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

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error handler:', err);

    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// Initialize server
async function initializeServer(): Promise<void> {
    try {
        console.log('🚀 Starting Urological Review System Backend...');

        // Validate CORS configuration
        console.log('🔒 Validating CORS configuration...');
        const corsOrigins = getDynamicCorsOrigins();
        const corsValidation = validateCorsOrigins(corsOrigins);
        if (!corsValidation.isValid) {
            console.error('❌ CORS validation failed:', corsValidation.errors);
            console.log('Allowed origins:', corsOrigins);
            process.exit(1);
        }
        if (corsValidation.warnings.length > 0) {
            console.warn('⚠️ CORS warnings:', corsValidation.warnings);
        }
        console.log('✅ CORS configuration validated. Allowed origins:', corsOrigins);

        // Test database connection
        console.log('🔍 Testing database connection...');
        const dbConnected = await testDatabaseConnection();
        if (!dbConnected) {
            console.error('❌ Database connection failed. Please check your Supabase configuration.');
            process.exit(1);
        }

        // Check and seed initial data
        console.log('🌱 Checking initial data...');
        try {
            const seededStatus = await DataSeeder.isDataSeeded();

            if (!seededStatus.hasApplicants || !seededStatus.hasReviewers) {
                console.log('📊 Seeding initial data...');
                await DataSeeder.seedAll();
            } else {
                console.log(`✅ Data already exists: ${seededStatus.applicantCount} applicants, ${seededStatus.reviewerCount} reviewers`);
            }
        } catch (seedError) {
            console.warn('⚠️ Data seeding failed, but server will continue:', seedError);
            // Don't exit on seed failure - the API should still work for manual data entry
        }

        // Start server
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 API docs: http://localhost:${PORT}/`);
            console.log(`🏥 Urological Review System API ready!`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🔄 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Initialize the server
initializeServer();