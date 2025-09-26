import { Router, Request, Response } from 'express';
import { ProgressService } from '../services/progressService';
import { ErrorResponse } from '../types';

const router = Router();

/**
 * GET /api/progress
 * Get complete progress information
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const progress = await ProgressService.getCompleteProgress();
        res.json({ success: true, data: progress });
    } catch (error) {
        console.error('GET /api/progress error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch progress',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/progress/overall
 * Get overall progress statistics
 */
router.get('/overall', async (req: Request, res: Response) => {
    try {
        const overallProgress = await ProgressService.getOverallProgress();
        res.json({ success: true, data: overallProgress });
    } catch (error) {
        console.error('GET /api/progress/overall error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch overall progress',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/progress/by-reviewer
 * Get progress broken down by reviewer
 */
router.get('/by-reviewer', async (req: Request, res: Response) => {
    try {
        const reviewerProgress = await ProgressService.getProgressByReviewer();
        res.json({ success: true, data: reviewerProgress });
    } catch (error) {
        console.error('GET /api/progress/by-reviewer error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch progress by reviewer',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/progress/reviewer/:reviewerName
 * Get progress for a specific reviewer
 */
router.get('/reviewer/:reviewerName', async (req: Request, res: Response) => {
    try {
        const { reviewerName } = req.params;
        const reviewerProgress = await ProgressService.getReviewerProgress(
            decodeURIComponent(reviewerName)
        );

        if (!reviewerProgress) {
            return res.status(404).json({
                error: 'Reviewer not found',
                message: `No reviewer found with name: ${reviewerName}`
            });
        }

        res.json({ success: true, data: reviewerProgress });
    } catch (error) {
        console.error('GET /api/progress/reviewer/:reviewerName error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch reviewer progress',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/progress/dashboard
 * Get dashboard summary statistics
 */
router.get('/dashboard', async (req: Request, res: Response) => {
    try {
        const dashboardData = await ProgressService.getDashboardSummary();
        res.json({ success: true, data: dashboardData });
    } catch (error) {
        console.error('GET /api/progress/dashboard error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch dashboard data',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/progress/export/csv
 * Export progress data as CSV
 */
router.get('/export/csv', async (req: Request, res: Response) => {
    try {
        const csvData = await ProgressService.exportProgressCSV();

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=reviewer_progress.csv');
        res.send(csvData);
    } catch (error) {
        console.error('GET /api/progress/export/csv error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to export progress data',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/progress/applicants-needing-reviews
 * Get applicants that still need reviews or final decisions
 */
router.get('/applicants-needing-reviews', async (req: Request, res: Response) => {
    try {
        const applicants = await ProgressService.getApplicantsNeedingReviews();
        res.json({ success: true, data: applicants, count: applicants.length });
    } catch (error) {
        console.error('GET /api/progress/applicants-needing-reviews error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch applicants needing reviews',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/progress/stats
 * Get detailed statistics for admin dashboard
 */
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const [complete, dashboard, needingReviews] = await Promise.all([
            ProgressService.getCompleteProgress(),
            ProgressService.getDashboardSummary(),
            ProgressService.getApplicantsNeedingReviews()
        ]);

        const stats = {
            progress: complete,
            dashboard,
            applicantsNeedingReviews: needingReviews.length,
            completionRate: dashboard.totalApplicants > 0
                ? Math.round((dashboard.completedReviews / (dashboard.totalApplicants * dashboard.totalReviewers)) * 100)
                : 0,
            decisionRate: dashboard.totalApplicants > 0
                ? Math.round((dashboard.finalizedDecisions / dashboard.totalApplicants) * 100)
                : 0
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('GET /api/progress/stats error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch detailed statistics',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

export default router;