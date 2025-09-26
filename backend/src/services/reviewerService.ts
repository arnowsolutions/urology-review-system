import { supabase, supabaseAdmin } from '../config/supabase';
import { DatabaseReviewer } from '../types';

export class ReviewerService {
    private static readonly SITE_NAME = 'urology_review';

    /**
     * Get all reviewers
     */
    static async getAllReviewers(): Promise<DatabaseReviewer[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_reviewers')
                .select('*')
                .eq('site_name', this.SITE_NAME)
                .order('name');

            if (error) {
                console.error('Error fetching reviewers:', error);
                throw new Error(`Failed to fetch reviewers: ${error.message}`);
            }

            return data || [];
        } catch (err) {
            console.error('ReviewerService.getAllReviewers error:', err);
            throw err;
        }
    }

    /**
     * Get reviewer by ID
     */
    static async getReviewerById(id: string): Promise<DatabaseReviewer | null> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_reviewers')
                .select('*')
                .eq('id', id)
                .eq('site_name', this.SITE_NAME)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Not found
                }
                console.error('Error fetching reviewer:', error);
                throw new Error(`Failed to fetch reviewer: ${error.message}`);
            }

            return data;
        } catch (err) {
            console.error('ReviewerService.getReviewerById error:', err);
            throw err;
        }
    }

    /**
     * Get reviewer by name
     */
    static async getReviewerByName(name: string): Promise<DatabaseReviewer | null> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_reviewers')
                .select('*')
                .eq('name', name)
                .eq('site_name', this.SITE_NAME)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Not found
                }
                console.error('Error fetching reviewer by name:', error);
                throw new Error(`Failed to fetch reviewer: ${error.message}`);
            }

            return data;
        } catch (err) {
            console.error('ReviewerService.getReviewerByName error:', err);
            throw err;
        }
    }

    /**
     * Create a new reviewer
     */
    static async createReviewer(reviewer: {
        name: string;
        email?: string;
        is_admin?: boolean;
    }): Promise<DatabaseReviewer> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_reviewers')
                .insert([{
                    name: reviewer.name,
                    email: reviewer.email,
                    is_admin: reviewer.is_admin || false,
                    site_name: this.SITE_NAME
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating reviewer:', error);
                throw new Error(`Failed to create reviewer: ${error.message}`);
            }

            return data;
        } catch (err) {
            console.error('ReviewerService.createReviewer error:', err);
            throw err;
        }
    }

    /**
     * Update a reviewer
     */
    static async updateReviewer(id: string, updates: {
        name?: string;
        email?: string;
        is_admin?: boolean;
    }): Promise<DatabaseReviewer> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_reviewers')
                .update(updates)
                .eq('id', id)
                .eq('site_name', this.SITE_NAME)
                .select()
                .single();

            if (error) {
                console.error('Error updating reviewer:', error);
                throw new Error(`Failed to update reviewer: ${error.message}`);
            }

            return data;
        } catch (err) {
            console.error('ReviewerService.updateReviewer error:', err);
            throw err;
        }
    }

    /**
     * Delete a reviewer
     */
    static async deleteReviewer(id: string): Promise<void> {
        try {
            const { error } = await supabaseAdmin
                .from('urology_reviewers')
                .delete()
                .eq('id', id)
                .eq('site_name', this.SITE_NAME);

            if (error) {
                console.error('Error deleting reviewer:', error);
                throw new Error(`Failed to delete reviewer: ${error.message}`);
            }
        } catch (err) {
            console.error('ReviewerService.deleteReviewer error:', err);
            throw err;
        }
    }

    /**
     * Get admin reviewers
     */
    static async getAdminReviewers(): Promise<DatabaseReviewer[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_reviewers')
                .select('*')
                .eq('site_name', this.SITE_NAME)
                .eq('is_admin', true)
                .order('name');

            if (error) {
                console.error('Error fetching admin reviewers:', error);
                throw new Error(`Failed to fetch admin reviewers: ${error.message}`);
            }

            return data || [];
        } catch (err) {
            console.error('ReviewerService.getAdminReviewers error:', err);
            throw err;
        }
    }

    /**
     * Get non-admin reviewers
     */
    static async getNonAdminReviewers(): Promise<DatabaseReviewer[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('urology_reviewers')
                .select('*')
                .eq('site_name', this.SITE_NAME)
                .eq('is_admin', false)
                .order('name');

            if (error) {
                console.error('Error fetching non-admin reviewers:', error);
                throw new Error(`Failed to fetch non-admin reviewers: ${error.message}`);
            }

            return data || [];
        } catch (err) {
            console.error('ReviewerService.getNonAdminReviewers error:', err);
            throw err;
        }
    }
}