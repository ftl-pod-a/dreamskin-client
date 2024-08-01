import React, { useEffect } from 'react';
import './SkinHubModal.css'; // Adjust the path as necessary

const SkinHubModal = ({ show, onClose, children }) => {
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
    <div className="skinHubModal" onClick={onClose}>
      <div className="skinHubModal-content" onClick={(e) => e.stopPropagation()}>
        <div className="skinHubModal-header">
          <button onClick={onClose} className="close">Close</button>
        </div>
        <div className="skinHubModal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SkinHubModal;


