import { Router, Request, Response } from 'express';
import { ReviewerService } from '../services/reviewerService';
import { ErrorResponse } from '../types';

const router = Router();

/**
 * GET /api/reviewers
 * Get all reviewers
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const reviewers = await ReviewerService.getAllReviewers();
        res.json({ success: true, data: reviewers });
    } catch (error) {
        console.error('GET /api/reviewers error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch reviewers',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/reviewers/admins
 * Get all admin reviewers
 */
router.get('/admins', async (req: Request, res: Response) => {
    try {
        const admins = await ReviewerService.getAdminReviewers();
        res.json({ success: true, data: admins });
    } catch (error) {
        console.error('GET /api/reviewers/admins error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch admin reviewers',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/reviewers/:id
 * Get reviewer by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const reviewer = await ReviewerService.getReviewerById(id);

        if (!reviewer) {
            res.status(404).json({
                error: 'Reviewer not found',
                message: `No reviewer found with ID: ${id}`
            });
            return;
        }

        res.json({ success: true, data: reviewer });
    } catch (error) {
        console.error('GET /api/reviewers/:id error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch reviewer',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * POST /api/reviewers
 * Create a new reviewer
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const reviewerData = req.body;

        // Basic validation
        if (!reviewerData.name) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'name is required'
            });
        }

        // Check if reviewer already exists
        const existing = await ReviewerService.getReviewerByName(reviewerData.name);
        if (existing) {
            return res.status(409).json({
                error: 'Conflict',
                message: `Reviewer with name ${reviewerData.name} already exists`
            });
        }

        const reviewer = await ReviewerService.createReviewer(reviewerData);
        res.status(201).json({ success: true, data: reviewer });
    } catch (error) {
        console.error('POST /api/reviewers error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to create reviewer',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * PUT /api/reviewers/:id
 * Update a reviewer
 */
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check if reviewer exists
        const existing = await ReviewerService.getReviewerById(id);
        if (!existing) {
            return res.status(404).json({
                error: 'Reviewer not found',
                message: `No reviewer found with ID: ${id}`
            });
        }

        const updatedReviewer = await ReviewerService.updateReviewer(id, updates);
        res.json({ success: true, data: updatedReviewer });
    } catch (error) {
        console.error('PUT /api/reviewers/:id error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to update reviewer',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * DELETE /api/reviewers/:id
 * Delete a reviewer
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if reviewer exists
        const existing = await ReviewerService.getReviewerById(id);
        if (!existing) {
            return res.status(404).json({
                error: 'Reviewer not found',
                message: `No reviewer found with ID: ${id}`
            });
        }

        await ReviewerService.deleteReviewer(id);
        res.json({
            success: true,
            message: 'Reviewer deleted successfully'
        });
    } catch (error) {
        console.error('DELETE /api/reviewers/:id error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to delete reviewer',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

export default router;