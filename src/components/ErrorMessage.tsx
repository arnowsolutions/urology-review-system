import React from 'react';

interface ErrorMessageProps {
    message: string;
    variant?: 'error' | 'warning' | 'info';
    onRetry?: () => void;
    onDismiss?: () => void;
    dismissible?: boolean;
    className?: string;
}

export default function ErrorMessage({
    message,
    variant = 'error',
    onRetry,
    onDismiss,
    dismissible = true,
    className = ''
}: ErrorMessageProps) {
    const variantClasses = {
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const iconClasses = {
        error: 'text-red-400',
        warning: 'text-yellow-400',
        info: 'text-blue-400'
    };

    return (
        <div className={`rounded-md border p-4 ${variantClasses[variant]} ${className}`} role="alert">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {variant === 'error' && (
                        <svg className={`h-5 w-5 ${iconClasses[variant]}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                    )}
                    {variant === 'warning' && (
                        <svg className={`h-5 w-5 ${iconClasses[variant]}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                    )}
                    {variant === 'info' && (
                        <svg className={`h-5 w-5 ${iconClasses[variant]}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>

                <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">
                        {message}
                    </p>
                </div>

                <div className="ml-4 flex flex-shrink-0 space-x-2">
                    {onRetry && (
                        <button
                            type="button"
                            className="inline-flex rounded-md text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={onRetry}
                            aria-label="Retry operation"
                        >
                            Retry
                        </button>
                    )}

                    {dismissible && onDismiss && (
                        <button
                            type="button"
                            className="inline-flex rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={onDismiss}
                            aria-label="Dismiss notification"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}