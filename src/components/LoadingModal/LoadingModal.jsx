import React from 'react';
import './LoadingModal.css'; 

const LoadingModal = ({ isVisible }) => {
  if (!isVisible) return null; 

  return (
    <div className="loading-modal">
      <div className="loading-modal-dialog">
        <div className="loading-modal-content">
          <div className="loading-modal-body text-center">
            <div className="loading-spinner mb-2"></div>
            <div>Loading</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;