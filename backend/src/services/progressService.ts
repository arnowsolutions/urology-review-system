import { supabaseAdmin } from '../config/supabase';
import { ReviewerStats, ProgressInfo, ProgressResponse } from '../types';

export class ProgressService {
    private static readonly SITE_NAME = 'urology_review';

    /**
     * Get overall progress statistics
     */
    static async getOverallProgress(): Promise<ProgressInfo> {
        try {
            // Get total applicants
            const { count: totalApplicants, error: applicantsError } = await supabaseAdmin
                .from('urology_applicants')
                .select('*', { count: 'exact', head: true })
                .eq('site_name', this.SITE_NAME);

            if (applicantsError) {
                console.error('Error fetching total applicants:', applicantsError);
                throw new Error(`Failed to fetch applicants count: ${applicantsError.message}`);
            }

            // Get completed reviews (unique applicant-reviewer pairs)
            const { count: completedReviews, error: reviewsError } = await supabaseAdmin
                .from('urology_reviews')
                .select('*', { count: 'exact', head: true })
                .eq('site_name', this.SITE_NAME)
                .not('decision', 'is', null);

            if (reviewsError) {
                console.error('Error fetching completed reviews:', reviewsError);
                throw new Error(`Failed to fetch reviews count: ${reviewsError.message}`);
            }

            // Get total reviewers
            const { count: totalReviewers, error: reviewersError } = await supabaseAdmin
                .from('urology_reviewers')
                .select('*', { count: 'exact', head: true })
                .eq('site_name', this.SITE_NAME);

            if (reviewersError) {
                console.error('Error fetching total reviewers:', reviewersError);
                throw new Error(`Failed to fetch reviewers count: ${reviewersError.message}`);
            }

            const totalExpectedReviews = (totalApplicants || 0) * (totalReviewers || 0);

            return {
                completed: completedReviews || 0,
                total: totalExpectedReviews
            };
        } catch (err) {
            console.error('ProgressService.getOverallProgress error:', err);
            throw err;
        }
    }

    /**
     * Get progress by reviewer
     */
    static async getProgressByReviewer(): Promise<ReviewerStats[]> {
        try {
            // Get all reviewers
            const { data: reviewers, error: reviewersError } = await supabaseAdmin
                .from('urology_reviewers')
                .select('name')
                .eq('site_name', this.SITE_NAME)
                .order('name');

            if (reviewersError) {
                console.error('Error fetching reviewers:', reviewersError);
                throw new Error(`Failed to fetch reviewers: ${reviewersError.message}`);
            }

            if (!reviewers || reviewers.length === 0) {
                return [];
            }

            // Get total applicants for assignment calculation
            const { count: totalApplicants, error: applicantsError } = await supabaseAdmin
                .from('urology_applicants')
                .select('*', { count: 'exact', head: true })
                .eq('site_name', this.SITE_NAME);

            if (applicantsError) {
                console.error('Error fetching total applicants for progress:', applicantsError);
                throw new Error(`Failed to fetch applicants count: ${applicantsError.message}`);
            }

            // Get review counts per reviewer
            const { data: reviewCounts, error: reviewCountsError } = await supabaseAdmin
                .from('urology_reviews')
                .select('reviewer_name, decision')
                .eq('site_name', this.SITE_NAME);

            if (reviewCountsError) {
                console.error('Error fetching review counts:', reviewCountsError);
                throw new Error(`Failed to fetch review counts: ${reviewCountsError.message}`);
            }

            // Calculate stats for each reviewer
            const stats: ReviewerStats[] = reviewers.map((reviewer: { name: string }) => {
                const reviewerReviews = (reviewCounts || []).filter(
                    (r: { reviewer_name: string; decision?: string }) => r.reviewer_name === reviewer.name
                );

                const completed = reviewerReviews.filter(
                    (r: { decision?: string }) => r.decision !== null && r.decision !== undefined
                ).length;

                // For now, assume each reviewer is assigned all applicants
                // In a real system, you might have a separate assignments table
                const assigned = totalApplicants || 0;

                const percentage = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

                return {
                    name: reviewer.name,
                    assigned,
                    completed,
                    percentage
                };
            });

            return stats.sort((a, b) => b.percentage - a.percentage);
        } catch (err) {
            console.error('ProgressService.getProgressByReviewer error:', err);
            throw err;
        }
    }

    /**
     * Get complete progress information
     */
    static async getCompleteProgress(): Promise<ProgressResponse> {
        try {
            const [overall, byReviewer] = await Promise.all([
                this.getOverallProgress(),
                this.getProgressByReviewer()
            ]);

            return {
                overall,
                byReviewer
            };
        } catch (err) {
            console.error('ProgressService.getCompleteProgress error:', err);
            throw err;
        }
    }

    /**
     * Get specific reviewer's progress
     */
    static async getReviewerProgress(reviewerName: string): Promise<ReviewerStats | null> {
        try {
            // Check if reviewer exists
            const { data: reviewer, error: reviewerError } = await supabaseAdmin
                .from('urology_reviewers')
                .select('name')
                .eq('name', reviewerName)
                .eq('site_name', this.SITE_NAME)
                .single();

            if (reviewerError) {
                if (reviewerError.code === 'PGRST116') {
                    return null; // Reviewer not found
                }
                console.error('Error fetching reviewer:', reviewerError);
                throw new Error(`Failed to fetch reviewer: ${reviewerError.message}`);
            }

            // Get total applicants for assignment calculation
            const { count: totalApplicants, error: applicantsError } = await supabaseAdmin
                .from('urology_applicants')
                .select('*', { count: 'exact', head: true })
                .eq('site_name', this.SITE_NAME);

            if (applicantsError) {
                console.error('Error fetching total applicants:', applicantsError);
                throw new Error(`Failed to fetch applicants count: ${applicantsError.message}`);
            }

            // Get completed reviews for this reviewer
            const { count: completedReviews, error: reviewsError } = await supabaseAdmin
                .from('urology_reviews')
                .select('*', { count: 'exact', head: true })
                .eq('reviewer_name', reviewerName)
                .eq('site_name', this.SITE_NAME)
                .not('decision', 'is', null);

            if (reviewsError) {
                console.error('Error fetching completed reviews for reviewer:', reviewsError);
                throw new Error(`Failed to fetch reviews count: ${reviewsError.message}`);
            }

            const assigned = totalApplicants || 0;
            const completed = completedReviews || 0;
            const percentage = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

            return {
                name: reviewerName,
                assigned,
                completed,
                percentage
            };
        } catch (err) {
            console.error('ProgressService.getReviewerProgress error:', err);
            throw err;
        }
    }

    /**
     * Export progress data as CSV string
     */
    static async exportProgressCSV(): Promise<string> {
        try {
            const progress = await this.getProgressByReviewer();

            const headers = ['Reviewer Name', 'Assigned', 'Completed', 'Percentage'];
            const rows = progress.map(stat => [
                stat.name,
                stat.assigned.toString(),
                stat.completed.toString(),
                `${stat.percentage}%`
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            return csvContent;
        } catch (err) {
            console.error('ProgressService.exportProgressCSV error:', err);
            throw err;
        }
    }

    /**
     * Get applicants needing reviews (no final decision yet)
     */
    static async getApplicantsNeedingReviews(): Promise<any[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_applicants')
                .select(`
          *,
          reviews:urology_reviews(count),
          final_selection:urology_final_selections(admin_decision)
        `)
                .eq('site_name', this.SITE_NAME);

            if (error) {
                console.error('Error fetching applicants needing reviews:', error);
                throw new Error(`Failed to fetch applicants: ${error.message}`);
            }

            // Filter applicants without final decisions or insufficient reviews
            return (data || []).filter((applicant: any) => {
                const finalDecision = applicant.final_selection?.[0]?.admin_decision;
                return !finalDecision || finalDecision === 'Pending';
            });
        } catch (err) {
            console.error('ProgressService.getApplicantsNeedingReviews error:', err);
            throw err;
        }
    }

    /**
     * Get summary statistics for dashboard
     */
    static async getDashboardSummary(): Promise<{
        totalApplicants: number;
        totalReviewers: number;
        completedReviews: number;
        pendingReviews: number;
        finalizedDecisions: number;
        averageScore: number;
    }> {
        try {
            // Get counts
            const [
                { count: totalApplicants },
                { count: totalReviewers },
                { count: completedReviews },
                { count: finalizedDecisions }
            ] = await Promise.all([
                supabaseAdmin
                    .from('urology_applicants')
                    .select('*', { count: 'exact', head: true })
                    .eq('site_name', this.SITE_NAME),
                supabaseAdmin
                    .from('urology_reviewers')
                    .select('*', { count: 'exact', head: true })
                    .eq('site_name', this.SITE_NAME),
                supabaseAdmin
                    .from('urology_reviews')
                    .select('*', { count: 'exact', head: true })
                    .eq('site_name', this.SITE_NAME)
                    .not('decision', 'is', null),
                supabaseAdmin
                    .from('urology_final_selections')
                    .select('*', { count: 'exact', head: true })
                    .eq('site_name', this.SITE_NAME)
                    .neq('admin_decision', 'Pending')
            ]);

            // Calculate average score
            const { data: scores, error: scoresError } = await supabaseAdmin
                .from('urology_reviews')
                .select('total_score')
                .eq('site_name', this.SITE_NAME)
                .not('total_score', 'is', null);

            if (scoresError) {
                console.error('Error fetching scores for average:', scoresError);
            }

            const validScores = (scores || []).map((s: { total_score: number }) => s.total_score);
            const averageScore = validScores.length > 0
                ? validScores.reduce((sum: number, score: number) => sum + score, 0) / validScores.length
                : 0;

            const expectedTotalReviews = (totalApplicants || 0) * (totalReviewers || 0);
            const pendingReviews = Math.max(0, expectedTotalReviews - (completedReviews || 0));

            return {
                totalApplicants: totalApplicants || 0,
                totalReviewers: totalReviewers || 0,
                completedReviews: completedReviews || 0,
                pendingReviews,
                finalizedDecisions: finalizedDecisions || 0,
                averageScore: parseFloat(averageScore.toFixed(2))
            };
        } catch (err) {
            console.error('ProgressService.getDashboardSummary error:', err);
            throw err;
        }
    }
}