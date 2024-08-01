import React, { useEffect } from 'react';
import './TryingModal.css'; // Adjust the path as necessary

const TryingModal = ({ show, onClose, children }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (show) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="TryingModal" onClick={onClose}>
      <div className="TryingModal-content" onClick={(e) => e.stopPropagation()}>
        <div className="TryingModal-header">
          <button onClick={onClose} className="close">Close</button>
        </div>
        <div className="TryingModal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TryingModal;
