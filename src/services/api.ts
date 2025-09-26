import { Applicant, ApiApplicant, Review, Reviewer, ProgressStats, FinalSelection, ApplicantDistribution } from '../types';
import { detectEnvironment, getApiBaseUrl } from './apiConfig';

// Initialize current base URL, with fallback to sessionStorage
let currentBaseUrl = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('apiBaseUrl')
    ? sessionStorage.getItem('apiBaseUrl')!
    : getApiBaseUrl();

// Request headers
const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
};

// API Response wrapper
interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

// Error handling
export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
        } catch {
            // Use default error message if parsing fails
        }

        throw new ApiError(errorMessage, response.status);
    }

    const data = await response.json();
    return data;
}

// Helper function to make API requests with retry logic
async function makeRequest<T>(
    url: string,
    options: RequestInit = {},
    retries = 2
): Promise<T> {
    const fullUrl = `${currentBaseUrl}${url}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(fullUrl, {
                ...options,
                headers: {
                    ...DEFAULT_HEADERS,
                    ...options.headers,
                },
            });

            return await handleResponse<T>(response);
        } catch (error) {
            if (attempt === retries) {
                throw error;
            }

            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }

    throw new Error('Max retries exceeded');
}

// API Functions

/**
 * Fetch all applicants from the backend
 */
export async function fetchApplicants(): Promise<ApiApplicant[]> {
    const response = await makeRequest<ApiApplicant[]>('/applicants');
    return response;
}

/**
 * Fetch regular applicants only
 */
export async function fetchRegularApplicants(): Promise<ApiApplicant[]> {
    const response = await makeRequest<ApiApplicant[]>('/applicants/regular');
    return response;
}

/**
 * Fetch I Sub applicants only
 */
export async function fetchISubApplicants(): Promise<ApiApplicant[]> {
    const response = await makeRequest<ApiApplicant[]>('/applicants/i-sub');
    return response;
}

/**
 * Fetch applicant distribution with reviewer assignments
 */
export async function fetchApplicantDistribution(): Promise<ApplicantDistribution> {
    const response = await makeRequest<ApplicantDistribution>('/applicants/distribution');
    return response;
}

/**
 * Fetch all reviewers from the backend
 */
export async function fetchReviewers(): Promise<Reviewer[]> {
    const response = await makeRequest<Reviewer[]>('/reviewers');
    return response;
}

/**
 * Fetch reviews with optional reviewer filtering
 */
export async function fetchReviews(reviewerName?: string): Promise<Review[]> {
    const url = reviewerName ? `/reviews?reviewer=${encodeURIComponent(reviewerName)}` : '/reviews';
    const response = await makeRequest<Review[]>(url);
    return response;
}

/**
 * Save or update a review with smart POST/PUT logic
 */
export async function saveReview(
    applicantId: string,
    reviewData: Partial<Review>
): Promise<Review> {
    // Check if review already exists by trying to fetch it first
    try {
        const reviewerName = reviewData.reviewer_name || reviewData.reviewer;
        if (reviewerName) {
            const existingReviews = await fetchReviews(reviewerName);
            const existingReview = existingReviews.find(r => r.applicant_id === applicantId);

            if (existingReview && existingReview.id) {
                // Update existing review (PUT)
                const response = await makeRequest<Review>(`/reviews/${existingReview.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(reviewData),
                });
                return response;
            }
        }
    } catch (error) {
        // If fetch fails, proceed with POST
    }

    // Create new review (POST)
    const response = await makeRequest<Review>('/reviews', {
        method: 'POST',
        body: JSON.stringify({
            ...reviewData,
            applicant_id: applicantId,
        }),
    });
    return response;
}

/**
 * Fetch progress statistics
 */
export async function fetchProgress(): Promise<ProgressStats> {
    const response = await makeRequest<ProgressStats>('/progress/stats');
    return response;
}

/**
 * Save final admin decision for an applicant
 */
export async function saveFinalSelection(
    applicantId: string,
    decision: 'interview' | 'reject' | 'waitlist',
    notes?: string
): Promise<FinalSelection> {
    const response = await makeRequest<FinalSelection>('/reviews/final-selections', {
        method: 'POST',
        body: JSON.stringify({
            applicant_id: applicantId,
            final_decision: decision,
            admin_notes: notes,
        }),
    });
    return response;
}

/**
 * Fetch final selections for admin dashboard
 */
export async function fetchFinalSelections(): Promise<FinalSelection[]> {
    const response = await makeRequest<FinalSelection[]>('/reviews/final-selections');
    return response;
}

/**
 * Export all review data for CSV generation
 */
export async function exportReviewData(): Promise<{
    applicants: ApiApplicant[];
    reviews: Review[];
    finalSelections: FinalSelection[];
}> {
    const [applicants, reviews, finalSelections] = await Promise.all([
        fetchApplicants(),
        fetchReviews(),
        fetchFinalSelections(),
    ]);

    return {
        applicants,
        reviews,
        finalSelections,
    };
}

/**
 * Check API health and connectivity with fallback attempts
 */
export async function checkApiHealth(): Promise<boolean> {
    const primaryUrl = getApiBaseUrl();
    const env = detectEnvironment();
    const fallbackUrl = env === 'development' ? '/api' : 'http://localhost:3001/api';

    try {
        await makeRequest('/health');
        return true;
    } catch (error) {
        console.error('API health check failed with primary URL:', error);

        // Try fallback URL
        try {
            const fallbackFullUrl = `${fallbackUrl}/health`;
            const response = await fetch(fallbackFullUrl, {
                headers: DEFAULT_HEADERS,
            });
            if (response.ok) {
                console.log('API health check succeeded with fallback URL');
                currentBaseUrl = fallbackUrl;
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.setItem('apiBaseUrl', fallbackUrl);
                }
                return true;
            }
        } catch (fallbackError) {
            console.error('API health check failed with fallback URL:', fallbackError);
        }

        return false;
    }
}

/**
 * Format error for user display
 */
export function formatApiError(error: unknown): string {
    if (error instanceof ApiError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
}