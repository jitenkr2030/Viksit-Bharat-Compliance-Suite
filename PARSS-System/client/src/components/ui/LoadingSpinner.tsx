import React from 'react';
// Simplified LoadingSpinner component without external utils dependency

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  color?: 'primary' | 'secondary' | 'white';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  className,
  color = 'primary' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  };

  const classNames = [
    'flex items-center justify-center',
    className || ''
  ].filter(Boolean).join(' ');

  const spinnerClassNames = [
    'animate-spin rounded-full border-2 border-gray-300 border-t-transparent',
    sizeClasses[size],
    colorClasses[color]
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <div className={spinnerClassNames} />
    </div>
  );
};

export default LoadingSpinner;