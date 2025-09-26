// Backend type definitions
// These mirror the frontend types but are defined independently for the backend

export type ViewState = 'login' | 'admin' | 'review' | 'applicant-list' | 'final-approval';

export type ApplicantCategory = 'regular' | 'i-sub';

export type AdminDecision = 'Selected' | 'Not Selected' | 'Pending';

export type DecisionType = 'Definitely Interview' | 'Maybe' | 'Do Not Interview';

// Applicant format: [external_id, name, category, details]
export type Applicant = [string, string, string, string];

export interface Review {
    preference?: number;
    pressure?: number;
    underserved?: number;
    leadership?: number;
    academic?: number;
    research?: number;
    personal?: number;
    notes?: string;
    decision?: DecisionType;
    reviewer: string;
    category?: ApplicantCategory;
    adminDecision?: AdminDecision;
}

export interface Reviews {
    [applicantId: string]: Review;
}

export interface FinalSelection {
    applicantId: string;
    reviewerRecommendations: Review[];
    adminDecision: AdminDecision;
    selectionReason?: string;
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

// Database-specific types
export interface DatabaseApplicant {
    id: string;
    external_id: string;
    name: string;
    category: ApplicantCategory;
    details?: string;
    site_name: string;
    created_at: string;
    updated_at: string;
}

export interface DatabaseReview {
    id: string;
    applicant_id: string;
    reviewer_name: string;
    preference?: number;
    pressure?: number;
    underserved?: number;
    leadership?: number;
    academic?: number;
    research?: number;
    personal?: number;
    notes?: string;
    decision?: DecisionType;
    total_score?: number;
    site_name: string;
    created_at: string;
    updated_at: string;
}

export interface DatabaseReviewer {
    id: string;
    name: string;
    email?: string;
    is_admin: boolean;
    site_name: string;
    created_at: string;
    updated_at: string;
}

export interface DatabaseFinalSelection {
    id: string;
    applicant_id: string;
    admin_decision: AdminDecision;
    selection_reason?: string;
    average_score?: number;
    reviewer_count: number;
    site_name: string;
    decided_at?: string;
    created_at: string;
    updated_at: string;
}

// API Request/Response types
export interface CreateApplicantRequest {
    external_id: string;
    name: string;
    category?: ApplicantCategory;
    details?: string;
}

export interface UpdateApplicantRequest {
    name?: string;
    category?: ApplicantCategory;
    details?: string;
}

export interface CreateReviewRequest {
    applicant_id: string;
    reviewer_name: string;
    preference?: number;
    pressure?: number;
    underserved?: number;
    leadership?: number;
    academic?: number;
    research?: number;
    personal?: number;
    notes?: string;
    decision?: DecisionType;
}

export interface UpdateReviewRequest {
    preference?: number;
    pressure?: number;
    underserved?: number;
    leadership?: number;
    academic?: number;
    research?: number;
    personal?: number;
    notes?: string;
    decision?: DecisionType;
}

export interface CreateFinalSelectionRequest {
    applicant_id: string;
    admin_decision: AdminDecision;
    selection_reason?: string;
}

export interface UpdateFinalSelectionRequest {
    admin_decision?: AdminDecision;
    selection_reason?: string;
}

export interface ProgressResponse {
    overall: ProgressInfo;
    byReviewer: ReviewerStats[];
}

export interface ErrorResponse {
    error: string;
    message: string;
    details?: any;
}