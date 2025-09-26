import { Router, Request, Response } from 'express';
import { ApplicantService } from '../services/applicantService';
import {
    CreateApplicantRequest,
    UpdateApplicantRequest,
    ErrorResponse
} from '../types';

const router = Router();

/**
 * GET /api/applicants
 * Get all applicants
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const applicants = await ApplicantService.getAllApplicants();
        res.json({ success: true, data: applicants });
    } catch (error) {
        console.error('GET /api/applicants error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch applicants',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/applicants/distribution
 * Get applicant distribution for reviewers
 */
router.get('/distribution', async (req: Request, res: Response) => {
    try {
        const distribution = await ApplicantService.getApplicantDistribution();
        res.json({ success: true, data: distribution });
    } catch (error) {
        console.error('GET /api/applicants/distribution error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch applicant distribution',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/applicants/regular
 * Get all regular applicants
 */
router.get('/regular', async (req: Request, res: Response) => {
    try {
        const applicants = await ApplicantService.getApplicantsByCategory('regular');
        res.json({ success: true, data: applicants });
    } catch (error) {
        console.error('GET /api/applicants/regular error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch regular applicants',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/applicants/i-sub
 * Get all I Sub applicants
 */
router.get('/i-sub', async (req: Request, res: Response) => {
    try {
        const applicants = await ApplicantService.getApplicantsByCategory('i-sub');
        res.json({ success: true, data: applicants });
    } catch (error) {
        console.error('GET /api/applicants/i-sub error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch I Sub applicants',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/applicants/:id
 * Get applicant by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const applicant = await ApplicantService.getApplicantById(id);

        if (!applicant) {
            res.status(404).json({
                error: 'Applicant not found',
                message: `No applicant found with ID: ${id}`
            });
            return;
        }

        res.json({ success: true, data: applicant });
    } catch (error) {
        console.error('GET /api/applicants/:id error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch applicant',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * GET /api/applicants/external/:externalId
 * Get applicant by external ID
 */
router.get('/external/:externalId', async (req: Request, res: Response) => {
    try {
        const { externalId } = req.params;
        const applicant = await ApplicantService.getApplicantByExternalId(externalId);

        if (!applicant) {
            return res.status(404).json({
                error: 'Applicant not found',
                message: `No applicant found with external ID: ${externalId}`
            });
        }

        res.json({ success: true, data: applicant });
    } catch (error) {
        console.error('GET /api/applicants/external/:externalId error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to fetch applicant',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * POST /api/applicants
 * Create a new applicant
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const applicantData: CreateApplicantRequest = req.body;

        // Basic validation
        if (!applicantData.external_id || !applicantData.name) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'external_id and name are required'
            });
        }

        // Check if applicant already exists
        const existing = await ApplicantService.getApplicantByExternalId(applicantData.external_id);
        if (existing) {
            return res.status(409).json({
                error: 'Conflict',
                message: `Applicant with external ID ${applicantData.external_id} already exists`
            });
        }

        const applicant = await ApplicantService.createApplicant(applicantData);
        res.status(201).json({ success: true, data: applicant });
    } catch (error) {
        console.error('POST /api/applicants error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to create applicant',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * POST /api/applicants/batch
 * Create multiple applicants
 */
router.post('/batch', async (req: Request, res: Response) => {
    try {
        const { applicants }: { applicants: CreateApplicantRequest[] } = req.body;

        if (!Array.isArray(applicants) || applicants.length === 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'applicants array is required and must not be empty'
            });
        }

        // Validate each applicant
        for (const applicant of applicants) {
            if (!applicant.external_id || !applicant.name) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Each applicant must have external_id and name'
                });
            }
        }

        const createdApplicants = await ApplicantService.batchCreateApplicants(applicants);
        res.status(201).json({
            success: true,
            data: createdApplicants,
            count: createdApplicants.length
        });
    } catch (error) {
        console.error('POST /api/applicants/batch error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to create applicants',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * PUT /api/applicants/:id
 * Update an applicant
 */
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates: UpdateApplicantRequest = req.body;

        // Check if applicant exists
        const existing = await ApplicantService.getApplicantById(id);
        if (!existing) {
            return res.status(404).json({
                error: 'Applicant not found',
                message: `No applicant found with ID: ${id}`
            });
        }

        const updatedApplicant = await ApplicantService.updateApplicant(id, updates);
        res.json({ success: true, data: updatedApplicant });
    } catch (error) {
        console.error('PUT /api/applicants/:id error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to update applicant',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

/**
 * DELETE /api/applicants/:id
 * Delete an applicant
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if applicant exists
        const existing = await ApplicantService.getApplicantById(id);
        if (!existing) {
            return res.status(404).json({
                error: 'Applicant not found',
                message: `No applicant found with ID: ${id}`
            });
        }

        await ApplicantService.deleteApplicant(id);
        res.json({
            success: true,
            message: 'Applicant deleted successfully'
        });
    } catch (error) {
        console.error('DELETE /api/applicants/:id error:', error);
        const errorResponse: ErrorResponse = {
            error: 'Failed to delete applicant',
            message: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
});

export default router;