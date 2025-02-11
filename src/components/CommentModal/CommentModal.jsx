import React, { useEffect, useCallback } from 'react';
import './CommentModal.css'; // Import your modal CSS file

const CommentModal = ({ isOpen, onClose, comments, newComment, setNewComment, handleSubmitComment, setAddComment,loggedInUser, handleDeleteComment }) => {
  
  // Function to handle the ESC key press
  const escFunction = useCallback((event) => {
    if (event.key === "Escape") {
      onClose(); // Close the modal on ESC key press
    }
  }, [onClose]);

  // Set up and clean up the event listener for ESC key press
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", escFunction, false);
      setAddComment(true); // Call setAddComment when modal opens
    }

    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, [isOpen, escFunction, setAddComment]);

  // Don't render the modal if it's not open
  if (!isOpen) return null;

  return (
    <div className='modal-overlay'>
      <div className='modal'>
        <div className='modal-header'>
          <h2>Comments</h2>
          <button onClick={onClose}>Close</button>
        </div>
        <div className='modal-body'>
          <div className='add-comment'>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
            />
            <button onClick={handleSubmitComment}>
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
          
          <ul>
            {comments.map((comment, index) => (
              <li key={index}>
                <p>{comment.text}</p>
                <div className='comment-info'>
                {comment.user && <small>by {comment.user.username}</small>}
                {loggedInUser && comment.user && comment.user.user_id === loggedInUser.id && (
                  <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                  )}
                  </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;



