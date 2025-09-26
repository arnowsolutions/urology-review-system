import { Router, Request, Response } from 'express';
import { ReviewService } from '../services/reviewService';
import {
    CreateReviewRequest,
    UpdateReviewRequest,
    CreateFinalSelectionRequest,
    ErrorResponse
} from '../types';

const router = Router();

/**
 * GET /api/reviews
 * Get all reviews (optionally filtered by query params)
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const { applicant_id, reviewer_name } = req.query;

        if (applicant_id && reviewer_name) {
            // Get specific review
            const review = await ReviewService.getReview(
                applicant_id as string,
                reviewer_name as string
            );
            if (!review) {
                return res.status(404).json({
                    error: 'Review not found',
                    message: `No review found for applicant ${applicant_id} by reviewer ${reviewer_name}`
                });
            }
            return res.json({ success: true, data: review });
        } else if (applicant_id) {
            // Get all reviews for an applicant
            const reviews = await ReviewService.getReviewsForApplicant(applicant_id as string);
            return res.json({ success: true, data: reviews });
        } else if (reviewer_name) {
            // Get all reviews by a reviewer
            const reviews = await ReviewService.getReviewsByReviewer(reviewer_name as string);
            return res.json({ success: true, data: reviews });
        } else {
            // Get all reviews with applicant info
            const reviews = await ReviewService.getAllReviewsWithApplicants();
            return res.json({ success: true, data: reviews });
        }
    } catch (error) {
        console.error('GET /api/reviews error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch reviews',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/reviews/applicant/:applicantId
 * Get all reviews for a specific applicant
 */
router.get('/applicant/:applicantId', async (req: Request, res: Response) => {
    try {
        const { applicantId } = req.params;
        const reviews = await ReviewService.getReviewsForApplicant(applicantId);
        res.json({ success: true, data: reviews });
    } catch (error) {
        console.error('GET /api/reviews/applicant/:applicantId error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch reviews for applicant',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/reviews/reviewer/:reviewerName
 * Get all reviews by a specific reviewer
 */
router.get('/reviewer/:reviewerName', async (req: Request, res: Response) => {
    try {
        const { reviewerName } = req.params;
        const reviews = await ReviewService.getReviewsByReviewer(decodeURIComponent(reviewerName));
        res.json({ success: true, data: reviews });
    } catch (error) {
        console.error('GET /api/reviews/reviewer/:reviewerName error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch reviews for reviewer',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * POST /api/reviews
 * Create a new review
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const reviewData: CreateReviewRequest = req.body;

        // Basic validation
        if (!reviewData.applicant_id || !reviewData.reviewer_name) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'applicant_id and reviewer_name are required'
            });
        }

        // Check if review already exists
        const existing = await ReviewService.getReview(
            reviewData.applicant_id,
            reviewData.reviewer_name
        );
        if (existing) {
            return res.status(409).json({
                error: 'Conflict',
                message: `Review already exists for applicant ${reviewData.applicant_id} by reviewer ${reviewData.reviewer_name}`
            });
        }

        const review = await ReviewService.createReview(reviewData);
        res.status(201).json({ success: true, data: review });
    } catch (error) {
        console.error('POST /api/reviews error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to create review',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * PUT /api/reviews/:applicantId/:reviewerName
 * Update an existing review
 */
router.put('/:applicantId/:reviewerName', async (req: Request, res: Response) => {
    try {
        const { applicantId, reviewerName } = req.params;
        const updates: UpdateReviewRequest = req.body;

        // Check if review exists
        const existing = await ReviewService.getReview(
            applicantId,
            decodeURIComponent(reviewerName)
        );
        if (!existing) {
            return res.status(404).json({
                error: 'Review not found',
                message: `No review found for applicant ${applicantId} by reviewer ${reviewerName}`
            });
        }

        const updatedReview = await ReviewService.updateReview(
            applicantId,
            decodeURIComponent(reviewerName),
            updates
        );
        res.json({ success: true, data: updatedReview });
    } catch (error) {
        console.error('PUT /api/reviews/:applicantId/:reviewerName error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to update review',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * DELETE /api/reviews/:applicantId/:reviewerName
 * Delete a review
 */
router.delete('/:applicantId/:reviewerName', async (req: Request, res: Response) => {
    try {
        const { applicantId, reviewerName } = req.params;

        // Check if review exists
        const existing = await ReviewService.getReview(
            applicantId,
            decodeURIComponent(reviewerName)
        );
        if (!existing) {
            return res.status(404).json({
                error: 'Review not found',
                message: `No review found for applicant ${applicantId} by reviewer ${reviewerName}`
            });
        }

        await ReviewService.deleteReview(applicantId, decodeURIComponent(reviewerName));
        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('DELETE /api/reviews/:applicantId/:reviewerName error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to delete review',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/reviews/final-selections
 * Get all final selections
 */
router.get('/final-selections', async (req: Request, res: Response) => {
    try {
        const finalSelections = await ReviewService.getAllFinalSelections();
        res.json({ success: true, data: finalSelections });
    } catch (error) {
        console.error('GET /api/reviews/final-selections error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch final selections',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/reviews/final-selections/:applicantId
 * Get final selection for a specific applicant
 */
router.get('/final-selections/:applicantId', async (req: Request, res: Response) => {
    try {
        const { applicantId } = req.params;
        const finalSelection = await ReviewService.getFinalSelection(applicantId);

        if (!finalSelection) {
            return res.status(404).json({
                error: 'Final selection not found',
                message: `No final selection found for applicant ${applicantId}`
            });
        }

        res.json({ success: true, data: finalSelection });
    } catch (error) {
        console.error('GET /api/reviews/final-selections/:applicantId error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch final selection',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * POST /api/reviews/final-selections
 * Create or update a final selection
 */
router.post('/final-selections', async (req: Request, res: Response) => {
    try {
        const selectionData: CreateFinalSelectionRequest = req.body;

        // Basic validation
        if (!selectionData.applicant_id || !selectionData.admin_decision) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'applicant_id and admin_decision are required'
            });
        }

        if (!['Selected', 'Not Selected', 'Pending'].includes(selectionData.admin_decision)) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'admin_decision must be one of: Selected, Not Selected, Pending'
            });
        }

        const finalSelection = await ReviewService.upsertFinalSelection(selectionData);
        res.status(201).json({ success: true, data: finalSelection });
    } catch (error) {
        console.error('POST /api/reviews/final-selections error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to create/update final selection',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

export default router;