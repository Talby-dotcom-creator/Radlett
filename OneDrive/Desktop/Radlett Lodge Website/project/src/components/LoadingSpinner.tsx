import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  subtle?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '', subtle = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  if (subtle) {
    return (
      <div className={`text-center ${className}`}>
        <span className="text-neutral-500 text-sm animate-pulse">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full border-2 border-secondary-200 border-t-secondary-500 rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;