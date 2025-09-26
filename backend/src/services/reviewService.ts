import { supabase, supabaseAdmin } from '../config/supabase';
import {
    Review,
    DecisionType,
    AdminDecision,
    DatabaseReview,
    DatabaseFinalSelection,
    CreateReviewRequest,
    UpdateReviewRequest,
    CreateFinalSelectionRequest,
    UpdateFinalSelectionRequest
} from '../types';

export class ReviewService {
    private static readonly SITE_NAME = 'urology_review';

    /**
     * Get all reviews for an applicant
     */
    static async getReviewsForApplicant(applicantId: string): Promise<DatabaseReview[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_reviews')
                .select('*')
                .eq('applicant_id', applicantId)
                .eq('site_name', this.SITE_NAME)
                .order('created_at');

            if (error) {
                console.error('Error fetching reviews for applicant:', error);
                throw new Error(`Failed to fetch reviews: ${error.message}`);
            }

            return data || [];
        } catch (err) {
            console.error('ReviewService.getReviewsForApplicant error:', err);
            throw err;
        }
    }

    /**
     * Get all reviews by reviewer
     */
    static async getReviewsByReviewer(reviewerName: string): Promise<DatabaseReview[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_reviews')
                .select('*')
                .eq('reviewer_name', reviewerName)
                .eq('site_name', this.SITE_NAME)
                .order('created_at');

            if (error) {
                console.error('Error fetching reviews by reviewer:', error);
                throw new Error(`Failed to fetch reviews: ${error.message}`);
            }

            return data || [];
        } catch (err) {
            console.error('ReviewService.getReviewsByReviewer error:', err);
            throw err;
        }
    }

    /**
     * Get a specific review
     */
    static async getReview(applicantId: string, reviewerName: string): Promise<DatabaseReview | null> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_reviews')
                .select('*')
                .eq('applicant_id', applicantId)
                .eq('reviewer_name', reviewerName)
                .eq('site_name', this.SITE_NAME)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Not found
                }
                console.error('Error fetching review:', error);
                throw new Error(`Failed to fetch review: ${error.message}`);
            }

            return data;
        } catch (err) {
            console.error('ReviewService.getReview error:', err);
            throw err;
        }
    }

    /**
     * Create a new review
     */
    static async createReview(review: CreateReviewRequest): Promise<DatabaseReview> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_reviews')
                .insert([{
                    applicant_id: review.applicant_id,
                    reviewer_name: review.reviewer_name,
                    preference: review.preference,
                    pressure: review.pressure,
                    underserved: review.underserved,
                    leadership: review.leadership,
                    academic: review.academic,
                    research: review.research,
                    personal: review.personal,
                    notes: review.notes,
                    decision: review.decision,
                    site_name: this.SITE_NAME
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating review:', error);
                throw new Error(`Failed to create review: ${error.message}`);
            }

            // Update final selection with new average
            await this.updateFinalSelectionStats(review.applicant_id);

            return data;
        } catch (err) {
            console.error('ReviewService.createReview error:', err);
            throw err;
        }
    }

    /**
     * Update an existing review
     */
    static async updateReview(
        applicantId: string,
        reviewerName: string,
        updates: UpdateReviewRequest
    ): Promise<DatabaseReview> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_reviews')
                .update(updates)
                .eq('applicant_id', applicantId)
                .eq('reviewer_name', reviewerName)
                .eq('site_name', this.SITE_NAME)
                .select()
                .single();

            if (error) {
                console.error('Error updating review:', error);
                throw new Error(`Failed to update review: ${error.message}`);
            }

            // Update final selection with new average
            await this.updateFinalSelectionStats(applicantId);

            return data;
        } catch (err) {
            console.error('ReviewService.updateReview error:', err);
            throw err;
        }
    }

    /**
     * Delete a review
     */
    static async deleteReview(applicantId: string, reviewerName: string): Promise<void> {
        try {
            const { error } = await supabaseAdmin
                .from('urology_reviews')
                .delete()
                .eq('applicant_id', applicantId)
                .eq('reviewer_name', reviewerName)
                .eq('site_name', this.SITE_NAME);

            if (error) {
                console.error('Error deleting review:', error);
                throw new Error(`Failed to delete review: ${error.message}`);
            }

            // Update final selection with new average
            await this.updateFinalSelectionStats(applicantId);
        } catch (err) {
            console.error('ReviewService.deleteReview error:', err);
            throw err;
        }
    }

    /**
     * Get all reviews with applicant info
     */
    static async getAllReviewsWithApplicants(): Promise<(DatabaseReview & { applicant: any })[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_reviews')
                .select(`
          *,
          applicant:urology_applicants(*)
        `)
                .eq('site_name', this.SITE_NAME)
                .order('created_at');

            if (error) {
                console.error('Error fetching reviews with applicants:', error);
                throw new Error(`Failed to fetch reviews: ${error.message}`);
            }

            return data || [];
        } catch (err) {
            console.error('ReviewService.getAllReviewsWithApplicants error:', err);
            throw err;
        }
    }

    /**
     * Calculate total score for a review
     */
    static calculateTotalScore(review: DatabaseReview | CreateReviewRequest | UpdateReviewRequest): number {
        const scores = [
            review.preference || 0,
            review.pressure || 0,
            review.underserved || 0,
            review.leadership || 0,
            review.academic || 0,
            review.research || 0,
            review.personal || 0
        ];

        return scores.reduce((sum, score) => sum + score, 0);
    }

    /**
     * Get final selection for an applicant
     */
    static async getFinalSelection(applicantId: string): Promise<DatabaseFinalSelection | null> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_final_selections')
                .select('*')
                .eq('applicant_id', applicantId)
                .eq('site_name', this.SITE_NAME)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Not found
                }
                console.error('Error fetching final selection:', error);
                throw new Error(`Failed to fetch final selection: ${error.message}`);
            }

            return data;
        } catch (err) {
            console.error('ReviewService.getFinalSelection error:', err);
            throw err;
        }
    }

    /**
     * Create or update final selection
     */
    static async upsertFinalSelection(selection: CreateFinalSelectionRequest): Promise<DatabaseFinalSelection> {
        try {
            // Calculate current stats
            const reviews = await this.getReviewsForApplicant(selection.applicant_id);
            const validScores = reviews.filter(r => r.total_score !== null && r.total_score !== undefined);
            const averageScore = validScores.length > 0
                ? validScores.reduce((sum, r) => sum + (r.total_score || 0), 0) / validScores.length
                : 0;

            const { data, error } = await supabaseAdmin
                .from('urology_final_selections')
                .upsert([{
                    applicant_id: selection.applicant_id,
                    admin_decision: selection.admin_decision,
                    selection_reason: selection.selection_reason,
                    average_score: parseFloat(averageScore.toFixed(2)),
                    reviewer_count: reviews.length,
                    decided_at: selection.admin_decision !== 'Pending' ? new Date().toISOString() : null,
                    site_name: this.SITE_NAME
                }], {
                    onConflict: 'applicant_id,site_name'
                })
                .select()
                .single();

            if (error) {
                console.error('Error upserting final selection:', error);
                throw new Error(`Failed to upsert final selection: ${error.message}`);
            }

            return data;
        } catch (err) {
            console.error('ReviewService.upsertFinalSelection error:', err);
            throw err;
        }
    }

    /**
     * Update final selection stats (called after review changes)
     */
    private static async updateFinalSelectionStats(applicantId: string): Promise<void> {
        try {
            const reviews = await this.getReviewsForApplicant(applicantId);
            const validScores = reviews.filter(r => r.total_score !== null && r.total_score !== undefined);
            const averageScore = validScores.length > 0
                ? validScores.reduce((sum, r) => sum + (r.total_score || 0), 0) / validScores.length
                : 0;

            // Check if final selection exists
            const existing = await this.getFinalSelection(applicantId);

            if (existing) {
                // Update existing
                await supabaseAdmin
                    .from('urology_final_selections')
                    .update({
                        average_score: parseFloat(averageScore.toFixed(2)),
                        reviewer_count: reviews.length
                    })
                    .eq('applicant_id', applicantId)
                    .eq('site_name', this.SITE_NAME);
            } else {
                // Create new with default pending status
                await supabaseAdmin
                    .from('urology_final_selections')
                    .insert([{
                        applicant_id: applicantId,
                        admin_decision: 'Pending',
                        average_score: parseFloat(averageScore.toFixed(2)),
                        reviewer_count: reviews.length,
                        site_name: this.SITE_NAME
                    }]);
            }
        } catch (err) {
            console.error('Error updating final selection stats:', err);
            // Don't throw here to avoid cascading failures
        }
    }

    /**
     * Get all final selections
     */
    static async getAllFinalSelections(): Promise<DatabaseFinalSelection[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_final_selections')
                .select('*')
                .eq('site_name', this.SITE_NAME)
                .order('average_score', { ascending: false });

            if (error) {
                console.error('Error fetching final selections:', error);
                throw new Error(`Failed to fetch final selections: ${error.message}`);
            }

            return data || [];
        } catch (err) {
            console.error('ReviewService.getAllFinalSelections error:', err);
            throw err;
        }
    }

    /**
     * Convert database review to frontend format
     */
    static toFrontendFormat(dbReview: DatabaseReview): Review {
        return {
            preference: dbReview.preference || undefined,
            pressure: dbReview.pressure || undefined,
            underserved: dbReview.underserved || undefined,
            leadership: dbReview.leadership || undefined,
            academic: dbReview.academic || undefined,
            research: dbReview.research || undefined,
            personal: dbReview.personal || undefined,
            notes: dbReview.notes || undefined,
            decision: dbReview.decision || undefined,
            reviewer: dbReview.reviewer_name
        };
    }
}