import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  large?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading...',
  large = false,
}) => {
  return (
    <div className="loading-center">
      <div className={`spinner ${large ? 'spinner-lg' : ''}`} />
      {label && <span>{label}</span>}
    </div>
  );
};
