import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

// Import routes
import applicantsRouter from '../src/routes/applicants';
import reviewsRouter from '../src/routes/reviews';
import progressRouter from '../src/routes/progress';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration for Vercel
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://your-frontend-domain.vercel.app', // Update this with your actual frontend URL
        /^https:\/\/.*\.vercel\.app$/ // Allow all Vercel preview deployments
    ],
    credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'urological-review-backend',
        environment: 'vercel'
    });
});

// Mount API routes
app.use('/api/applicants', applicantsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/progress', progressRouter);

// Root endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Urological Review System Backend API - Vercel Deployment',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            applicants: '/api/applicants',
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
        availableEndpoints: [
            'GET /api',
            'GET /api/health',
            'GET /api/applicants',
            'POST /api/applicants',
            'GET /api/reviews',
            'POST /api/reviews',
            'GET /api/progress'
        ]
    });
});

// Export the Express app as a Vercel function
export default app;