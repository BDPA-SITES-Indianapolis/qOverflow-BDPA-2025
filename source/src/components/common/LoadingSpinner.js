import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;