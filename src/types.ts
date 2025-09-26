import { LucideIcon } from 'lucide-react';

export type ViewState = 'login' | 'admin' | 'review' | 'applicant-list' | 'final-approval' | 'i-sub';

export type ApplicantCategory = 'regular' | 'i-sub';

export type AdminDecision = 'Selected' | 'Not Selected' | 'Pending';

export type DecisionType = 'Definitely Interview' | 'Maybe' | 'Do Not Interview';

// Legacy format: [external_id, name, category, details]
export type Applicant = [string, string, string, string];

// API format for applicants
export interface ApiApplicant {
    id: string;
    external_id: string;
    name: string;
    category: ApplicantCategory;
    details?: string;
    site_name: string;
    created_at: string;
    updated_at: string;
}

export interface ScoringCategory {
    key: string;
    label: string;
    icon: LucideIcon;
    color: string;
}

export interface Review {
    id?: string;
    applicant_id?: string;
    preference?: number;
    pressure?: number;
    underserved?: number;
    leadership?: number;
    academic?: number;
    research?: number;
    personal?: number;
    notes?: string;
    decision?: DecisionType;
    reviewer_name?: string;
    reviewer?: string; // Keep for backward compatibility
    category?: ApplicantCategory;
    adminDecision?: AdminDecision;
    total_score?: number;
    site_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Reviews {
    [applicantId: string]: Review;
}

export interface Reviewer {
    id: string;
    name: string;
    email?: string;
    is_admin: boolean;
    site_name: string;
    created_at: string;
    updated_at: string;
}

export interface FinalSelection {
    id?: string;
    applicant_id?: string;
    applicantId?: string; // Keep for backward compatibility
    reviewerRecommendations?: Review[];
    adminDecision?: AdminDecision;
    admin_decision?: AdminDecision;
    selectionReason?: string;
    selection_reason?: string;
    average_score?: number;
    reviewer_count?: number;
    site_name?: string;
    decided_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ApplicantDistribution {
    [reviewer: string]: Applicant[];
}

export interface ReviewerStats {
    name: string;
    assigned: number;
    completed: number;
    percentage: number;
}

export interface ProgressInfo {
    completed: number;
    total: number;
}

export interface ProgressStats {
    overall: ProgressInfo;
    byReviewer: ReviewerStats[];
}

export interface UrologicalReviewSystemProps {
    // Add props if needed in the future
}