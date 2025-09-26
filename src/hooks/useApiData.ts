import { useState, useEffect, useCallback } from 'react';
import {
    ApiApplicant,
    Review,
    Reviewer,
    ProgressStats,
    FinalSelection,
    ApplicantDistribution,
} from '../types';
import * as api from '../services/api';
import { detectEnvironment, getApiBaseUrl, testApiConnectivity } from '../services/apiConfig';

// Hook return type
export interface UseApiDataReturn {
    // Data
    applicants: ApiApplicant[];
    regularApplicants: ApiApplicant[];
    iSubApplicants: ApiApplicant[];
    reviews: Review[];
    reviewers: Reviewer[];
    progress: ProgressStats | null;
    finalSelections: FinalSelection[];
    applicantDistribution: ApplicantDistribution | null;

    // Loading states
    applicantsLoading: boolean;
    regularApplicantsLoading: boolean;
    iSubApplicantsLoading: boolean;
    reviewsLoading: boolean;
    reviewersLoading: boolean;
    progressLoading: boolean;
    distributionLoading: boolean;

    // Error states
    applicantsError: string | null;
    reviewsError: string | null;
    reviewersError: string | null;
    progressError: string | null;
    distributionError: string | null;

    // Refresh functions
    refreshApplicants: () => Promise<void>;
    refreshRegularApplicants: () => Promise<void>;
    refreshISubApplicants: () => Promise<void>;
    refreshReviews: (reviewerName?: string) => Promise<void>;
    refreshReviewers: () => Promise<void>;
    refreshProgress: () => Promise<void>;
    refreshDistribution: () => Promise<void>;
    refreshAll: () => Promise<void>;

    // Save functions
    saveReview: (applicantId: string, reviewData: Partial<Review>) => Promise<Review | null>;
    saveFinalSelection: (applicantId: string, decision: 'interview' | 'reject' | 'waitlist', notes?: string) => Promise<FinalSelection | null>;

    // Export function
    exportReviewData: () => Promise<{ applicants: ApiApplicant[]; reviews: Review[]; finalSelections: FinalSelection[]; }>;

    // Health check
    isApiHealthy: boolean;
    checkApiHealth: () => Promise<boolean>;

    // Environment and connection
    currentEnvironment: 'development' | 'production';
    apiBaseUrl: string;
    connectionStatus: 'checking' | 'connected' | 'disconnected';
    detectApiEnvironment: () => Promise<{ env: 'development' | 'production'; baseUrl: string; }>;
    refreshApiConfig: () => Promise<void>;
}

/**
 * Custom hook for managing API data loading and caching
 */
export function useApiData(): UseApiDataReturn {
    // Data state
    const [applicants, setApplicants] = useState<ApiApplicant[]>([]);
    const [regularApplicants, setRegularApplicants] = useState<ApiApplicant[]>([]);
    const [iSubApplicants, setISubApplicants] = useState<ApiApplicant[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewers, setReviewers] = useState<Reviewer[]>([]);
    const [progress, setProgress] = useState<ProgressStats | null>(null);
    const [finalSelections, setFinalSelections] = useState<FinalSelection[]>([]);
    const [applicantDistribution, setApplicantDistribution] = useState<ApplicantDistribution | null>(null);

    // Loading states
    const [applicantsLoading, setApplicantsLoading] = useState(false);
    const [regularApplicantsLoading, setRegularApplicantsLoading] = useState(false);
    const [iSubApplicantsLoading, setISubApplicantsLoading] = useState(false);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewersLoading, setReviewersLoading] = useState(false);
    const [progressLoading, setProgressLoading] = useState(false);
    const [distributionLoading, setDistributionLoading] = useState(false);

    // Error states
    const [applicantsError, setApplicantsError] = useState<string | null>(null);
    const [reviewsError, setReviewsError] = useState<string | null>(null);
    const [reviewersError, setReviewersError] = useState<string | null>(null);
    const [progressError, setProgressError] = useState<string | null>(null);
    const [distributionError, setDistributionError] = useState<string | null>(null);

    // API health state
    const [isApiHealthy, setIsApiHealthy] = useState(true);

    // Environment and connection state
    const [currentEnvironment, setCurrentEnvironment] = useState<'development' | 'production'>('development');
    const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
    const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

    // Cache timestamps to avoid unnecessary API calls
    const [lastFetch, setLastFetch] = useState({
        applicants: 0,
        reviews: 0,
        reviewers: 0,
        progress: 0,
        distribution: 0,
    });

    const CACHE_DURATION = 30 * 1000; // 30 seconds

    // Check if cache is still valid
    const isCacheValid = useCallback((key: keyof typeof lastFetch) => {
        return Date.now() - lastFetch[key] < CACHE_DURATION;
    }, [lastFetch]);

    // Refresh applicants
    const refreshApplicants = useCallback(async () => {
        if (applicantsLoading || isCacheValid('applicants')) return;

        setApplicantsLoading(true);
        setApplicantsError(null);

        try {
            const data = await api.fetchApplicants();
            setApplicants(data);
            setLastFetch((prev: typeof lastFetch) => ({ ...prev, applicants: Date.now() }));
        } catch (error) {
            const errorMessage = api.formatApiError(error);
            setApplicantsError(errorMessage);
            console.error('Error fetching applicants:', error);
        } finally {
            setApplicantsLoading(false);
        }
    }, [applicantsLoading, isCacheValid]);

    // Refresh regular applicants
    const refreshRegularApplicants = useCallback(async () => {
        if (regularApplicantsLoading) return;

        setRegularApplicantsLoading(true);
        setApplicantsError(null);

        try {
            const data = await api.fetchRegularApplicants();
            setRegularApplicants(data);
        } catch (error) {
            const errorMessage = api.formatApiError(error);
            setApplicantsError(errorMessage);
            console.error('Error fetching regular applicants:', error);
        } finally {
            setRegularApplicantsLoading(false);
        }
    }, [regularApplicantsLoading]);

    // Refresh I Sub applicants
    const refreshISubApplicants = useCallback(async () => {
        if (iSubApplicantsLoading) return;

        setISubApplicantsLoading(true);
        setApplicantsError(null);

        try {
            const data = await api.fetchISubApplicants();
            setISubApplicants(data);
        } catch (error) {
            const errorMessage = api.formatApiError(error);
            setApplicantsError(errorMessage);
            console.error('Error fetching I Sub applicants:', error);
        } finally {
            setISubApplicantsLoading(false);
        }
    }, [iSubApplicantsLoading]);

    // Refresh reviews
    const refreshReviews = useCallback(async (reviewerName?: string) => {
        if (reviewsLoading) return;

        setReviewsLoading(true);
        setReviewsError(null);

        try {
            const data = await api.fetchReviews(reviewerName);
            setReviews(data);
            setLastFetch((prev: typeof lastFetch) => ({ ...prev, reviews: Date.now() }));
        } catch (error) {
            const errorMessage = api.formatApiError(error);
            setReviewsError(errorMessage);
            console.error('Error fetching reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    }, [reviewsLoading]);

    // Refresh reviewers
    const refreshReviewers = useCallback(async () => {
        if (reviewersLoading || isCacheValid('reviewers')) return;

        setReviewersLoading(true);
        setReviewersError(null);

        try {
            const data = await api.fetchReviewers();
            setReviewers(data);
            setLastFetch((prev: typeof lastFetch) => ({ ...prev, reviewers: Date.now() }));
        } catch (error) {
            const errorMessage = api.formatApiError(error);
            setReviewersError(errorMessage);
            console.error('Error fetching reviewers:', error);
        } finally {
            setReviewersLoading(false);
        }
    }, [reviewersLoading, isCacheValid]);

    // Refresh progress
    const refreshProgress = useCallback(async () => {
        if (progressLoading || isCacheValid('progress')) return;

        setProgressLoading(true);
        setProgressError(null);

        try {
            const data = await api.fetchProgress();
            setProgress(data);
            setLastFetch((prev: typeof lastFetch) => ({ ...prev, progress: Date.now() }));
        } catch (error) {
            const errorMessage = api.formatApiError(error);
            setProgressError(errorMessage);
            console.error('Error fetching progress:', error);
        } finally {
            setProgressLoading(false);
        }
    }, [progressLoading, isCacheValid]);

    // Refresh distribution
    const refreshDistribution = useCallback(async () => {
        if (distributionLoading || isCacheValid('distribution')) return;

        setDistributionLoading(true);
        setDistributionError(null);

        try {
            const data = await api.fetchApplicantDistribution();
            setApplicantDistribution(data);
            setLastFetch((prev: typeof lastFetch) => ({ ...prev, distribution: Date.now() }));
        } catch (error) {
            const errorMessage = api.formatApiError(error);
            setDistributionError(errorMessage);
            console.error('Error fetching applicant distribution:', error);
        } finally {
            setDistributionLoading(false);
        }
    }, [distributionLoading, isCacheValid]);

    // Refresh all data
    const refreshAll = useCallback(async () => {
        await Promise.all([
            refreshApplicants(),
            refreshRegularApplicants(),
            refreshISubApplicants(),
            refreshReviews(),
            refreshReviewers(),
            refreshProgress(),
            refreshDistribution(),
        ]);
    }, [refreshApplicants, refreshRegularApplicants, refreshISubApplicants, refreshReviews, refreshReviewers, refreshProgress, refreshDistribution]);

    // Save review with optimistic updates
    const saveReview = useCallback(async (applicantId: string, reviewData: Partial<Review>): Promise<Review | null> => {
        try {
            const savedReview = await api.saveReview(applicantId, reviewData);

            // Optimistically update local state
            setReviews((prevReviews: Review[]) => {
                const existingIndex = prevReviews.findIndex(
                    (r: Review) => r.applicant_id === applicantId && r.reviewer_name === (reviewData.reviewer_name || reviewData.reviewer)
                );

                if (existingIndex >= 0) {
                    // Update existing review
                    const updatedReviews = [...prevReviews];
                    updatedReviews[existingIndex] = { ...updatedReviews[existingIndex], ...savedReview };
                    return updatedReviews;
                } else {
                    // Add new review
                    return [...prevReviews, savedReview];
                }
            });

            // Refresh progress to get updated statistics
            refreshProgress();

            return savedReview;
        } catch (error) {
            console.error('Error saving review:', error);
            return null;
        }
    }, [refreshProgress]);

    // Save final selection
    const saveFinalSelection = useCallback(async (
        applicantId: string,
        decision: 'interview' | 'reject' | 'waitlist',
        notes?: string
    ): Promise<FinalSelection | null> => {
        try {
            const savedSelection = await api.saveFinalSelection(applicantId, decision, notes);

            // Optimistically update local state
            setFinalSelections((prevSelections: FinalSelection[]) => {
                const existingIndex = prevSelections.findIndex((s: FinalSelection) => s.applicant_id === applicantId);

                if (existingIndex >= 0) {
                    // Update existing selection
                    const updatedSelections = [...prevSelections];
                    updatedSelections[existingIndex] = { ...updatedSelections[existingIndex], ...savedSelection };
                    return updatedSelections;
                } else {
                    // Add new selection
                    return [...prevSelections, savedSelection];
                }
            });

            return savedSelection;
        } catch (error) {
            console.error('Error saving final selection:', error);
            return null;
        }
    }, []);

    // Detect API environment
    const detectApiEnvironment = useCallback(async () => {
        try {
            const env = detectEnvironment();
            const baseUrl = getApiBaseUrl();
            setCurrentEnvironment(env);
            setApiBaseUrl(baseUrl);
            return { env, baseUrl };
        } catch (error) {
            console.error('Error detecting API environment:', error);
            setConnectionStatus('disconnected');
            throw error;
        }
    }, []);

    // Refresh API configuration
    const refreshApiConfig = useCallback(async () => {
        setConnectionStatus('checking');
        try {
            await detectApiEnvironment();
            const connected = await testApiConnectivity();
            setConnectionStatus(connected ? 'connected' : 'disconnected');
        } catch (error) {
            setConnectionStatus('disconnected');
        }
    }, [detectApiEnvironment]);

    // Check API health
    const checkApiHealth = useCallback(async (): Promise<boolean> => {
        setConnectionStatus('checking');
        try {
            const healthy = await testApiConnectivity();
            setIsApiHealthy(healthy);
            setConnectionStatus(healthy ? 'connected' : 'disconnected');
            return healthy;
        } catch (error) {
            setIsApiHealthy(false);
            setConnectionStatus('disconnected');
            return false;
        }
    }, []);

    // Initial data loading on mount
    useEffect(() => {
        const initializeData = async () => {
            try {
                await refreshApiConfig();
                const healthy = await checkApiHealth();
                if (healthy) {
                    await refreshAll();
                }
            } catch (error) {
                console.error('Error during initialization:', error);
                setConnectionStatus('disconnected');
            }
        };

        initializeData();
    }, []); // Empty dependency array for initial load only

    return {
        // Data
        applicants,
        regularApplicants,
        iSubApplicants,
        reviews,
        reviewers,
        progress,
        finalSelections,
        applicantDistribution,

        // Loading states
        applicantsLoading,
        regularApplicantsLoading,
        iSubApplicantsLoading,
        reviewsLoading,
        reviewersLoading,
        progressLoading,
        distributionLoading,

        // Error states
        applicantsError,
        reviewsError,
        reviewersError,
        progressError,
        distributionError,

        // Refresh functions
        refreshApplicants,
        refreshRegularApplicants,
        refreshISubApplicants,
        refreshReviews,
        refreshReviewers,
        refreshProgress,
        refreshDistribution,
        refreshAll,

        // Save functions
        saveReview,
        saveFinalSelection,

        // Health check
        isApiHealthy,
        checkApiHealth,

        // Environment and connection
        currentEnvironment,
        apiBaseUrl,
        connectionStatus,
        detectApiEnvironment,
        refreshApiConfig,

        // Export function
        exportReviewData: api.exportReviewData,
    };
}