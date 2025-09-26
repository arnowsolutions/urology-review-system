import { supabase, supabaseAdmin } from '../config/supabase';
import { Applicant, ApplicantCategory, ApplicantDistribution, DatabaseApplicant } from '../types';

export class ApplicantService {
    private static readonly SITE_NAME = 'urology_review';

    /**
     * Get all applicants
     */
    static async getAllApplicants(): Promise<DatabaseApplicant[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_applicants')
                .select('*')
                .eq('site_name', this.SITE_NAME)
                .order('name');

            if (error) {
                console.error('Error fetching applicants:', error);
                throw new Error(`Failed to fetch applicants: ${error.message}`);
            }

            return data || [];
        } catch (err) {
            console.error('ApplicantService.getAllApplicants error:', err);
            throw err;
        }
    }

    /**
     * Get applicant by ID
     */
    static async getApplicantById(id: string): Promise<DatabaseApplicant | null> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_applicants')
                .select('*')
                .eq('id', id)
                .eq('site_name', this.SITE_NAME)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Not found
                }
                console.error('Error fetching applicant:', error);
                throw new Error(`Failed to fetch applicant: ${error.message}`);
            }

            return data;
        } catch (err) {
            console.error('ApplicantService.getApplicantById error:', err);
            throw err;
        }
    }

    /**
     * Get applicant by external ID
     */
    static async getApplicantByExternalId(externalId: string): Promise<DatabaseApplicant | null> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_applicants')
                .select('*')
                .eq('external_id', externalId)
                .eq('site_name', this.SITE_NAME)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Not found
                }
                console.error('Error fetching applicant by external ID:', error);
                throw new Error(`Failed to fetch applicant: ${error.message}`);
            }

            return data;
        } catch (err) {
            console.error('ApplicantService.getApplicantByExternalId error:', err);
            throw err;
        }
    }

    /**
     * Create a new applicant
     */
    static async createApplicant(applicant: {
        external_id: string;
        name: string;
        category?: ApplicantCategory;
        details?: string;
    }): Promise<DatabaseApplicant> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_applicants')
                .insert([{
                    external_id: applicant.external_id,
                    name: applicant.name,
                    category: applicant.category || 'regular',
                    details: applicant.details,
                    site_name: this.SITE_NAME
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating applicant:', error);
                throw new Error(`Failed to create applicant: ${error.message}`);
            }

            return data;
        } catch (err) {
            console.error('ApplicantService.createApplicant error:', err);
            throw err;
        }
    }

    /**
     * Update an applicant
     */
    static async updateApplicant(id: string, updates: {
        name?: string;
        category?: ApplicantCategory;
        details?: string;
    }): Promise<DatabaseApplicant> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_applicants')
                .update(updates)
                .eq('id', id)
                .eq('site_name', this.SITE_NAME)
                .select()
                .single();

            if (error) {
                console.error('Error updating applicant:', error);
                throw new Error(`Failed to update applicant: ${error.message}`);
            }

            return data;
        } catch (err) {
            console.error('ApplicantService.updateApplicant error:', err);
            throw err;
        }
    }

    /**
     * Delete an applicant
     */
    static async deleteApplicant(id: string): Promise<void> {
        try {
            const { error } = await supabaseAdmin
                .from('urology_applicants')
                .delete()
                .eq('id', id)
                .eq('site_name', this.SITE_NAME);

            if (error) {
                console.error('Error deleting applicant:', error);
                throw new Error(`Failed to delete applicant: ${error.message}`);
            }
        } catch (err) {
            console.error('ApplicantService.deleteApplicant error:', err);
            throw err;
        }
    }

    /**
     * Batch create applicants
     */
    static async batchCreateApplicants(applicants: Array<{
        external_id: string;
        name: string;
        category?: ApplicantCategory;
        details?: string;
    }>): Promise<DatabaseApplicant[]> {
        try {
            const applicantsToInsert = applicants.map(applicant => ({
                external_id: applicant.external_id,
                name: applicant.name,
                category: applicant.category || 'regular',
                details: applicant.details,
                site_name: this.SITE_NAME
            }));

            const { data, error } = await supabaseAdmin
                .from('urology_applicants')
                .insert(applicantsToInsert)
                .select();

            if (error) {
                console.error('Error batch creating applicants:', error);
                throw new Error(`Failed to batch create applicants: ${error.message}`);
            }

            return data || [];
        } catch (err) {
            console.error('ApplicantService.batchCreateApplicants error:', err);
            throw err;
        }
    }

    /**
     * Get applicants by category
     */
    static async getApplicantsByCategory(category: ApplicantCategory): Promise<DatabaseApplicant[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_applicants')
                .select('*')
                .eq('category', category)
                .eq('site_name', this.SITE_NAME)
                .order('name');

            if (error) {
                console.error('Error fetching applicants by category:', error);
                throw new Error(`Failed to fetch ${category} applicants: ${error.message}`);
            }

            return data || [];
        } catch (err) {
            console.error('ApplicantService.getApplicantsByCategory error:', err);
            throw err;
        }
    }

    /**
     * Get applicant distribution for reviewers
     */
    static async getApplicantDistribution(): Promise<ApplicantDistribution> {
        try {
            // This is a placeholder implementation
            // In a real system, you might store reviewer assignments in a separate table
            // For now, we'll return all applicants for each reviewer
            const applicants = await this.getAllApplicants();
            const distribution: ApplicantDistribution = {};

            // Convert database applicants to frontend format
            const frontendApplicants: Applicant[] = applicants.map(app => [
                app.external_id,
                app.name,
                app.category,
                app.details || ''
            ]);

            // Get all reviewers
            const { data: reviewers, error } = await supabaseAdmin
                .from('urology_reviewers')
                .select('name')
                .eq('site_name', this.SITE_NAME);

            if (error) {
                console.error('Error fetching reviewers for distribution:', error);
                throw new Error(`Failed to fetch reviewers: ${error.message}`);
            }

            // Distribute only regular applicants to reviewers (exclude I-Sub applicants)
            const regularApplicants = frontendApplicants.filter(app => app[2] === 'regular');

            if (reviewers && reviewers.length > 0 && regularApplicants.length > 0) {
                reviewers.forEach((reviewer: { name: string }, index: number) => {
                    distribution[reviewer.name] = regularApplicants.filter((_, appIndex) =>
                        appIndex % reviewers.length === index
                    );
                });
            } return distribution;
        } catch (err) {
            console.error('ApplicantService.getApplicantDistribution error:', err);
            throw err;
        }
    }

    /**
     * Convert database applicant to frontend format
     */
    static toFrontendFormat(applicant: DatabaseApplicant): Applicant {
        return [
            applicant.external_id,
            applicant.name,
            applicant.category,
            applicant.details || ''
        ];
    }

    /**
     * Convert frontend applicant to database format
     */
    static fromFrontendFormat(applicant: Applicant, externalId?: string): {
        external_id: string;
        name: string;
        category: ApplicantCategory;
        details: string;
    } {
        return {
            external_id: externalId || applicant[0],
            name: applicant[1],
            category: applicant[2] as ApplicantCategory,
            details: applicant[3]
        };
    }
}