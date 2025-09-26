import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
    className?: string;
    variant?: 'inline' | 'overlay' | 'fullscreen';
}

export default function LoadingSpinner({
    size = 'medium',
    text,
    className = '',
    variant = 'inline'
}: LoadingSpinnerProps) {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    const containerClasses = {
        inline: 'inline-flex items-center space-x-2',
        overlay: 'absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10',
        fullscreen: 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50'
    };

    const spinnerContent = (
        <>
            <div
                className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
                role="status"
                aria-label={text || 'Loading'}
            />
            {text && (
                <span className="text-gray-600 text-sm font-medium">
                    {text}
                </span>
            )}
        </>
    );

    if (variant === 'inline') {
        return (
            <div className={`${containerClasses[variant]} ${className}`}>
                {spinnerContent}
            </div>
        );
    }

    return (
        <div className={`${containerClasses[variant]} ${className}`}>
            <div className="flex flex-col items-center space-y-2">
                {spinnerContent}
            </div>
        </div>
    );
}