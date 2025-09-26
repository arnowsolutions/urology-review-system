import React, { useState, useEffect, useCallback } from 'react';
import { Users, FileText, BarChart3, Download, CheckCircle, Clock, Star, User, GraduationCap, Heart, Brain, Zap, Award, MessageCircle, Eye } from 'lucide-react';
import {
    ViewState,
    DecisionType,
    Applicant,
    ApiApplicant,
    ScoringCategory,
    Review,
    Reviews,
    ApplicantDistribution,
    ReviewerStats,
    ProgressInfo,
    UrologicalReviewSystemProps,
    ApplicantCategory,
    AdminDecision,
    FinalSelection
} from './types';
import { useApiData } from './hooks/useApiData';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

// Scoring categories remain static as they define the UI structure

// Scoring categories with icons
const SCORING_CATEGORIES: ScoringCategory[] = [
    { key: 'preference', label: 'Preference for Program', icon: Heart, color: 'text-red-500' },
    { key: 'pressure', label: 'Ability to Handle Pressure', icon: Zap, color: 'text-yellow-500' },
    { key: 'underserved', label: 'Commitment to Underserved', icon: Users, color: 'text-blue-500' },
    { key: 'leadership', label: 'Leadership', icon: Award, color: 'text-purple-500' },
    { key: 'academic', label: 'Academic Performance', icon: GraduationCap, color: 'text-green-500' },
    { key: 'research', label: 'Research', icon: Brain, color: 'text-indigo-500' },
    { key: 'personal', label: 'Personal Attributes/Grit', icon: Star, color: 'text-orange-500' }
];

const UrologicalReviewSystem: React.FC<UrologicalReviewSystemProps> = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [view, setView] = useState<ViewState>('login');
    const [currentApplicantIndex, setCurrentApplicantIndex] = useState<number>(0);
    const [password, setPassword] = useState<string>('');
    const [loginError, setLoginError] = useState<boolean>(false);
    const [saveStatus, setSaveStatus] = useState<{ [key: string]: 'idle' | 'saving' | 'saved' | 'error' }>({});

    // Use API data hook
    const apiData = useApiData();

    // Convert ApiApplicant to legacy format for UI compatibility
    const convertToLegacyApplicant = (apiApplicant: ApiApplicant): Applicant => {
        return [
            apiApplicant.external_id,
            apiApplicant.name.split(' ')[0] || '',
            apiApplicant.name.split(' ').slice(1).join(' ') || '',
            apiApplicant.details || ''
        ];
    };

    // Get applicants in legacy format
    const allApiApplicants = apiData.applicants || [];
    const regularApplicants = allApiApplicants
        .filter(app => app.category === 'regular')
        .map(convertToLegacyApplicant);
    const iSubApplicants = allApiApplicants
        .filter(app => app.category === 'i-sub')
        .map(convertToLegacyApplicant);
    const allApplicants = [...regularApplicants, ...iSubApplicants];

    // Get reviewers
    const reviewers = apiData.reviewers.map(r => r.name);

    // Helper to get applicant distribution from API
    const applicantDistribution = apiData.applicantDistribution || {};

    // Debounced save function
    const debouncedSave = useCallback(
        (() => {
            const timeouts: { [key: string]: number } = {};
            return (applicantId: string, reviewData: Partial<Review>) => {
                const key = `${applicantId}-${currentUser}`;

                // Clear existing timeout
                if (timeouts[key]) {
                    clearTimeout(timeouts[key]);
                }

                // Set saving status
                setSaveStatus(prev => ({ ...prev, [key]: 'saving' }));

                // Set new timeout
                timeouts[key] = setTimeout(async () => {
                    try {
                        const savedReview = await apiData.saveReview(applicantId, {
                            ...reviewData,
                            reviewer_name: currentUser || '',
                        });

                        if (savedReview) {
                            setSaveStatus(prev => ({ ...prev, [key]: 'saved' }));
                            // Clear saved status after 2 seconds
                            setTimeout(() => {
                                setSaveStatus(prev => ({ ...prev, [key]: 'idle' }));
                            }, 2000);
                        } else {
                            setSaveStatus(prev => ({ ...prev, [key]: 'error' }));
                        }
                    } catch (error) {
                        console.error('Error saving review:', error);
                        setSaveStatus(prev => ({ ...prev, [key]: 'error' }));
                    }
                }, 500); // 500ms delay
            };
        })(),
        [apiData, currentUser]
    );

    const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (password === 'Urology2026') {
            setIsAuthenticated(true);
            setLoginError(false);
        } else {
            setLoginError(true);
            setTimeout(() => setLoginError(false), 3000);
        }
    };

    const handleLogin = (reviewer: string): void => {
        setCurrentUser(reviewer);
        setView('review');
    };

    const handleScoreChange = (applicantId: string, category: string, score: number): void => {
        // Get current review data from API
        const existingReview = apiData.reviews.find(r =>
            r.applicant_id === applicantId && r.reviewer_name === currentUser
        );

        const updatedReview: Partial<Review> = {
            ...existingReview,
            [category]: score,
            reviewer_name: currentUser!,
            category: regularApplicants.some(([id]) => id === applicantId) ? 'regular' : 'i-sub'
        };

        debouncedSave(applicantId, updatedReview);
    };

    const handleNotesChange = (applicantId: string, notes: string): void => {
        // Get current review data from API
        const existingReview = apiData.reviews.find(r =>
            r.applicant_id === applicantId && r.reviewer_name === currentUser
        );

        const updatedReview: Partial<Review> = {
            ...existingReview,
            notes,
            reviewer_name: currentUser!,
            category: regularApplicants.some(([id]) => id === applicantId) ? 'regular' : 'i-sub'
        };

        debouncedSave(applicantId, updatedReview);
    };

    const handleDecisionChange = (applicantId: string, decision: DecisionType): void => {
        // Get current review data from API
        const existingReview = apiData.reviews.find(r =>
            r.applicant_id === applicantId && r.reviewer_name === currentUser
        );

        const updatedReview: Partial<Review> = {
            ...existingReview,
            decision,
            reviewer_name: currentUser!,
            category: regularApplicants.some(([id]) => id === applicantId) ? 'regular' : 'i-sub'
        };

        debouncedSave(applicantId, updatedReview);
    };

    const handleAdminDecision = async (applicantId: string, decision: AdminDecision): Promise<void> => {
        try {
            await apiData.saveFinalSelection(
                applicantId,
                decision === 'Selected' ? 'interview' : decision === 'Not Selected' ? 'reject' : 'waitlist'
            );
        } catch (error) {
            console.error('Error saving admin decision:', error);
        }
    };

    const getReviewerRecommendations = (applicantId: string): Review[] => {
        return apiData.reviews.filter(r => r.applicant_id === applicantId);
    };

    const getFinalSelectionStats = (): { regularSelected: number; iSubSelected: number; totalSelected: number; target: number } => {
        const finalSelections = apiData.finalSelections || [];
        const regularSelected = finalSelections.filter(selection => {
            const applicant = regularApplicants.find(([aid]) => aid === selection.applicant_id);
            return applicant && selection.admin_decision === 'Selected';
        }).length;
        const iSubSelected = finalSelections.filter(selection => {
            const applicant = iSubApplicants.find(([aid]) => aid === selection.applicant_id);
            return applicant && selection.admin_decision === 'Selected';
        }).length;
        const totalSelected = regularSelected + iSubSelected;
        return { regularSelected, iSubSelected, totalSelected, target: 51 };
    };

    const getTotalScore = (applicantId: string): number => {
        const review = apiData.reviews.find(r =>
            r.applicant_id === applicantId && r.reviewer_name === currentUser
        );
        if (!review) return 0;

        return SCORING_CATEGORIES.reduce((total: number, category: ScoringCategory) => {
            return total + (review[category.key as keyof Review] as number || 0);
        }, 0);
    };

    const getCompletedReviews = (): ProgressInfo => {
        if (!currentUser) return { completed: 0, total: 0 };
        const userApplicants: Applicant[] = applicantDistribution[currentUser] || [];
        const completed = userApplicants.filter(([id]) => {
            const review = apiData.reviews.find(r =>
                r.applicant_id === id && r.reviewer_name === currentUser
            );
            return review && review.decision;
        }).length;
        return { completed, total: userApplicants.length };
    };

    const exportData = async (): Promise<void> => {
        try {
            const data = await apiData.exportReviewData();
            const csvData = data.applicants.map((applicant: ApiApplicant) => {
                const review = data.reviews.find((r: Review) => r.applicant_id === applicant.id);
                const finalSelection = data.finalSelections.find((f: FinalSelection) => f.applicant_id === applicant.id);
                const isRegular = applicant.category === 'regular';
                return {
                    'AAMC ID': applicant.external_id,
                    'First Name': applicant.name.split(' ')[0] || '',
                    'Last Name': applicant.name.split(' ').slice(1).join(' ') || '',
                    'Medical School': applicant.details || '',
                    'Category': isRegular ? 'Regular' : 'I-Sub',
                    'Reviewer': review?.reviewer_name || '',
                    'Preference for Program': review?.preference || '',
                    'Ability to Handle Pressure': review?.pressure || '',
                    'Commitment to Underserved': review?.underserved || '',
                    'Leadership': review?.leadership || '',
                    'Academic Performance': review?.academic || '',
                    'Research': review?.research || '',
                    'Personal Attributes/Grit': review?.personal || '',
                    'Total Score': review?.total_score || 0,
                    'Notes': review?.notes || '',
                    'Interview Recommendation': review?.decision || '',
                    'Final Admin Decision': finalSelection?.admin_decision || 'Pending'
                };
            });

            const csvContent = [
                Object.keys(csvData[0] || {}).join(','),
                ...csvData.map((row: any) => Object.values(row).map((val: any) => `"${val}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'urology_reviews_with_final_selections.csv';
            a.click();
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    // Password Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                            <FileText className="w-10 h-10 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Secure Access Required</h1>
                        <p className="text-gray-600">Enter the system password to continue</p>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                System Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${loginError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                placeholder="Enter password"
                                required
                            />
                            {loginError && (
                                <p className="mt-2 text-sm text-red-600">
                                    Incorrect password. Please try again.
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                        >
                            Access System
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        Urology Residency Review System 2025
                    </div>
                </div>
            </div>
        );
    }

    // Login Screen
    if (view === 'login') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                            <FileText className="w-10 h-10 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Urology Residency Review System</h1>
                        <p className="text-xl text-gray-600">Select your reviewer profile to begin</p>
                    </div>

                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reviewers.map((reviewer: string, index: number) => {
                            const stats: Applicant[] = applicantDistribution[reviewer] || [];
                            return (
                                <div
                                    key={reviewer}
                                    onClick={() => handleLogin(reviewer)}
                                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 p-6"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                            <User className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{reviewer}</h3>
                                            <p className="text-sm text-gray-500">Reviewer</p>
                                        </div>
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Applications:</span>
                                            <span className="font-semibold text-blue-600">{stats.length}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-12 text-center">
                        <button
                            onClick={() => setView('admin')}
                            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <BarChart3 className="w-5 h-5 mr-2" />
                            Admin Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    if (view === 'admin') {
        // Get data from API hook
        const regularApplicantsCount = apiData.regularApplicants.length;
        const iSubApplicantsCount = apiData.iSubApplicants.length;
        const totalApplicants = regularApplicantsCount + iSubApplicantsCount;

        // Calculate completion rates using API data
        const regularReviews = apiData.reviews.filter(r =>
            apiData.regularApplicants.some(app => app.id === r.applicant_id)
        );
        const completedRegularReviews = regularReviews.filter(r => r.decision).length;

        const iSubReviews = apiData.reviews.filter(r =>
            apiData.iSubApplicants.some(app => app.id === r.applicant_id)
        );
        const completedISubReviews = iSubReviews.filter(r => r.decision).length;

        const reviewerStats: ReviewerStats[] = reviewers.map((reviewer: string) => {
            const assignedApplicants: Applicant[] = applicantDistribution[reviewer] || [];
            const completed: number = assignedApplicants.filter(([id]) => {
                const review = apiData.reviews.find(r => r.applicant_id === id && r.reviewer_name === reviewer);
                return review && review.decision;
            }).length;
            return {
                name: reviewer,
                assigned: assignedApplicants.length,
                completed,
                percentage: assignedApplicants.length > 0 ? Math.round((completed / assignedApplicants.length) * 100) : 0
            };
        });

        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow-sm border-b">
                    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <div className="flex space-x-3">
                            <button
                                onClick={exportData}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Data
                            </button>
                            {(completedRegularReviews === regularApplicantsCount && completedISubReviews === iSubApplicantsCount) && (
                                <button
                                    onClick={() => setView('final-approval')}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Final Approval
                                </button>
                            )}
                            <button
                                onClick={() => setView('i-sub')}
                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Manage I Sub
                            </button>
                            <button
                                onClick={() => setView('login')}
                                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {/* Regular Applicants Statistics */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Regular Applicants</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-full mr-4">
                                        <FileText className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Regular Applications</p>
                                        <p className="text-2xl font-bold text-gray-900">{regularApplicantsCount}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-green-100 rounded-full mr-4">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Completed Regular Reviews</p>
                                        <p className="text-2xl font-bold text-gray-900">{completedRegularReviews}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-orange-100 rounded-full mr-4">
                                        <Clock className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Regular Completion Rate</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {regularApplicantsCount > 0 ? Math.round((completedRegularReviews / regularApplicantsCount) * 100) : 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* I Sub Applicants Statistics */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">I Sub Applicants</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-purple-100 rounded-full mr-4">
                                        <FileText className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total I Sub Applications</p>
                                        <p className="text-2xl font-bold text-gray-900">{iSubApplicantsCount}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-green-100 rounded-full mr-4">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Completed I Sub Reviews</p>
                                        <p className="text-2xl font-bold text-gray-900">{completedISubReviews}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-orange-100 rounded-full mr-4">
                                        <Clock className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">I Sub Completion Rate</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {iSubApplicantsCount > 0 ? Math.round((completedISubReviews / iSubApplicantsCount) * 100) : 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Reviewer Progress</h2>
                        <div className="space-y-4">
                            {reviewerStats.map((reviewer: ReviewerStats) => (
                                <div key={reviewer.name} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-gray-900">{reviewer.name}</h3>
                                        <span className="text-sm text-gray-600">{reviewer.completed}/{reviewer.assigned} completed</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${reviewer.percentage === 100 ? 'bg-green-500' : reviewer.percentage > 50 ? 'bg-blue-500' : 'bg-orange-500'}`}
                                            style={{ width: `${reviewer.percentage}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{reviewer.percentage}% complete</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Final Approval View

    if (view === 'final-approval') {
        const stats = getFinalSelectionStats();
        const allApplicants = [...apiData.regularApplicants, ...apiData.iSubApplicants];

        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow-sm border-b">
                    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Final Approval</h1>
                        <div className="flex space-x-3">
                            <button
                                onClick={exportData}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Data
                            </button>
                            <button
                                onClick={() => setView('admin')}
                                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Back to Admin
                            </button>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 rounded-full mr-4">
                                    <CheckCircle className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Regular Selected</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.regularSelected}/48</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 rounded-full mr-4">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">I-Sub Selected</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.iSubSelected}/3</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-orange-100 rounded-full mr-4">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Selected</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalSelected}/51</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">All Applicants</h2>
                        <div className="space-y-4">
                            {allApplicants.map((applicant: ApiApplicant) => {
                                const recommendations = getReviewerRecommendations(applicant.id);
                                const decision = 'Pending'; // TODO: Get from actual final selections
                                const totalScore = getTotalScore(applicant.id);
                                const isRegular = apiData.regularApplicants.some(app => app.id === applicant.id);

                                return (
                                    <div key={applicant.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{applicant.name}</h3>
                                                <p className="text-gray-600">ID: {applicant.id} | {applicant.details}</p>
                                                <p className="text-sm text-gray-500">Category: {isRegular ? 'Regular' : 'I-Sub'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Total Score</p>
                                                <p className="text-xl font-bold text-blue-600">{totalScore}/35</p>
                                            </div>
                                        </div>

                                        {recommendations.length > 0 && recommendations[0] && (
                                            <div className="mb-4">
                                                <h4 className="font-semibold text-gray-900 mb-2">Reviewer Recommendation</h4>
                                                <div className="bg-gray-50 p-3 rounded">
                                                    <p className="text-sm"><strong>Reviewer:</strong> {recommendations[0]?.reviewer_name || recommendations[0]?.reviewer || 'Unknown'}</p>
                                                    <p className="text-sm"><strong>Decision:</strong> <span className={`px-2 py-1 rounded text-xs font-medium ${recommendations[0]?.decision === 'Definitely Interview' ? 'bg-green-100 text-green-800' : recommendations[0]?.decision === 'Maybe' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{recommendations[0]?.decision}</span></p>
                                                    {recommendations[0]?.notes && <p className="text-sm"><strong>Notes:</strong> {recommendations[0].notes}</p>}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-semibold text-gray-700">Final Decision:</label>
                                            <select
                                                value={decision}
                                                onChange={(e) => handleAdminDecision(applicantId, e.target.value as AdminDecision)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Selected">Selected</option>
                                                <option value="Not Selected">Not Selected</option>
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Applicant List View
    if (view === 'applicant-list') {
        const userApplicants: Applicant[] = applicantDistribution[currentUser!] || [];
        const progress: ProgressInfo = getCompletedReviews();

        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow-sm border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Your Assigned Applicants</h1>
                                <p className="text-gray-600">Reviewer: {currentUser}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-sm text-gray-600">
                                    Progress: {progress.completed}/{progress.total} ({Math.round((progress.completed / progress.total) * 100)}%)
                                </div>
                                <button
                                    onClick={() => setView('login')}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userApplicants.map(([applicantId, firstName, lastName, medicalSchool]: Applicant, index: number) => {
                                const review: Review | undefined = apiData.reviews.find(r => r.applicant_id === applicantId);
                                const isCompleted: boolean = review && review.decision ? true : false;
                                const totalScore: number = getTotalScore(applicantId);

                                return (
                                    <div
                                        key={applicantId}
                                        onClick={() => {
                                            setCurrentApplicantIndex(index);
                                            setView('review');
                                        }}
                                        className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 p-6 ${isCompleted
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-gray-900 mb-1">
                                                    {firstName} {lastName}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">ID: {applicantId}</p>
                                                <p className="text-sm text-gray-700 line-clamp-2">{medicalSchool}</p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {isCompleted ? (
                                                    <div className="flex items-center text-green-600 mb-2">
                                                        <CheckCircle className="w-5 h-5 mr-1" />
                                                        <span className="text-sm font-semibold">Complete</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-orange-600 mb-2">
                                                        <Clock className="w-5 h-5 mr-1" />
                                                        <span className="text-sm font-semibold">Pending</span>
                                                    </div>
                                                )}
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">Score:</p>
                                                    <p className="text-xl font-bold text-blue-600">{totalScore}/35</p>
                                                </div>
                                            </div>
                                        </div>

                                        {review && review.decision && (
                                            <div className="border-t pt-3 mt-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Decision:</span>
                                                    <span className={`text-sm font-semibold px-2 py-1 rounded ${review.decision === 'Definitely Interview'
                                                        ? 'bg-green-100 text-green-800'
                                                        : review.decision === 'Maybe'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {review.decision}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-t pt-3 mt-3">
                                            <div className="flex justify-between items-center text-sm text-gray-600">
                                                <span>Applicant {index + 1} of {userApplicants.length}</span>
                                                <span className="text-blue-600 font-medium">Click to Review →</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // I Sub Management View
    if (view === 'i-sub') {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow-sm border-b">
                    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">I Sub Management</h1>
                        <button
                            onClick={() => setView('admin')}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Back to Admin
                        </button>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {/* I Sub Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-100 rounded-full mr-4">
                                    <FileText className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total I Sub Applications</p>
                                    <p className="text-2xl font-bold text-gray-900">{apiData.iSubApplicants.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 rounded-full mr-4">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Completed I Sub Reviews</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {apiData.reviews.filter(r =>
                                            apiData.iSubApplicants.some(app => app.id === r.applicant_id) && r.decision
                                        ).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-orange-100 rounded-full mr-4">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">I Sub Completion Rate</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {apiData.iSubApplicants.length > 0
                                            ? Math.round((apiData.reviews.filter(r =>
                                                apiData.iSubApplicants.some(app => app.id === r.applicant_id) && r.decision
                                            ).length / apiData.iSubApplicants.length) * 100)
                                            : 0}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* I Sub Applicants List */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">I Sub Applicants</h2>
                            <button
                                onClick={apiData.refreshISubApplicants}
                                disabled={apiData.iSubApplicantsLoading}
                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
                            >
                                {apiData.iSubApplicantsLoading ? 'Refreshing...' : 'Refresh Data'}
                            </button>
                        </div>

                        {apiData.iSubApplicantsLoading ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600">Loading I Sub applicants...</p>
                            </div>
                        ) : apiData.iSubApplicants.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600">No I Sub applicants found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {apiData.iSubApplicants.map((applicant) => {
                                    const review = apiData.reviews.find(r => r.applicant_id === applicant.id);
                                    return (
                                        <div key={applicant.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {applicant.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">{applicant.details}</p>
                                                    <p className="text-xs text-purple-600 font-medium mt-1">I Sub</p>
                                                </div>
                                            </div>

                                            {review && review.decision && (
                                                <div className="mb-3">
                                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${review.decision === 'Definitely Interview'
                                                            ? 'bg-green-100 text-green-800'
                                                            : review.decision === 'Maybe'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {review.decision}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="border-t pt-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className={review && review.decision ? 'text-green-600' : 'text-gray-500'}>
                                                        {review && review.decision ? 'Reviewed' : 'Pending Review'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Review Interface
    const userApplicants: Applicant[] = applicantDistribution[currentUser!] || [];
    const currentApplicant: Applicant | undefined = userApplicants[currentApplicantIndex];
    const progress: ProgressInfo = getCompletedReviews();

    if (!currentApplicant) {
        return <div className="min-h-screen flex items-center justify-center">No applicants assigned</div>;
    }

    const [applicantId, firstName, lastName, medicalSchool] = currentApplicant;
    const currentReview: Review = apiData.reviews.find(r => r.applicant_id === applicantId) || {};

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Review Dashboard</h1>
                            <p className="text-gray-600">Reviewer: {currentUser}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                Progress: {progress.completed}/{progress.total} ({Math.round((progress.completed / progress.total) * 100)}%)
                            </div>
                            <button
                                onClick={() => setView('applicant-list')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                View All Applicants
                            </button>
                            <button
                                onClick={() => setView('login')}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{firstName} {lastName}</h2>
                                <p className="text-gray-600 mb-2">AAMC ID: {applicantId}</p>
                                <p className="text-gray-700">{medicalSchool}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Application {currentApplicantIndex + 1} of {userApplicants.length}</p>
                                <p className="text-2xl font-bold text-blue-600">Total: {getTotalScore(applicantId)}/35</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {SCORING_CATEGORIES.map((category: ScoringCategory) => {
                                const IconComponent = category.icon;
                                return (
                                    <div key={category.key} className="border rounded-lg p-4">
                                        <div className="flex items-center mb-3">
                                            <IconComponent className={`w-5 h-5 ${category.color} mr-2`} />
                                            <h3 className="font-semibold text-gray-900">{category.label}</h3>
                                        </div>
                                        <div className="flex space-x-2">
                                            {[1, 2, 3, 4, 5].map((score: number) => (
                                                <button
                                                    key={score}
                                                    onClick={() => handleScoreChange(applicantId, category.key, score)}
                                                    className={`w-10 h-10 rounded-full border-2 font-semibold transition-all ${currentReview[category.key as keyof Review] === score
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                                                        }`}
                                                >
                                                    {score}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <MessageCircle className="w-4 h-4 inline mr-1" />
                                    Reviewer Notes
                                </label>
                                <textarea
                                    value={currentReview.notes || ''}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleNotesChange(applicantId, e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Add your notes about this applicant..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <Eye className="w-4 h-4 inline mr-1" />
                                    Interview Recommendation
                                </label>
                                <div className="flex space-x-3">
                                    {(['Definitely Interview', 'Maybe', 'Do Not Interview'] as DecisionType[]).map((decision: DecisionType) => (
                                        <button
                                            key={decision}
                                            onClick={() => handleDecisionChange(applicantId, decision)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${currentReview.decision === decision
                                                ? decision === 'Definitely Interview'
                                                    ? 'bg-green-600 text-white'
                                                    : decision === 'Maybe'
                                                        ? 'bg-yellow-600 text-white'
                                                        : 'bg-red-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {decision}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            onClick={() => setCurrentApplicantIndex(Math.max(0, currentApplicantIndex - 1))}
                            disabled={currentApplicantIndex === 0}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous Applicant
                        </button>

                        <button
                            onClick={() => setCurrentApplicantIndex(Math.min(userApplicants.length - 1, currentApplicantIndex + 1))}
                            disabled={currentApplicantIndex === userApplicants.length - 1}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Next Applicant
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UrologicalReviewSystem;