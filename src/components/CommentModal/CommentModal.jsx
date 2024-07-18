import React from 'react';
import './CommentModal.css'; // Import your modal CSS file

const CommentModal = ({ isOpen, onClose, comments, newComment, setNewComment, handleSubmitComment }) => {
    if (!isOpen) return null;

    return (
        <div className='modal-overlay'>
            <div className='modal'>
                <div className='modal-header'>
                    <h2>Comments</h2>
                    <button onClick={onClose}>Close</button>
                </div>
                <div className='modal-body'>
                    <ul>
                        {comments.map((comment, index) => (
                            <li key={index}>
                                <p>{comment.message}</p>
                                <small>by {comment.author}</small>
                            </li>
                        ))}
                    </ul>
                    <div className='add-comment'>
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                        />
                        <button onClick={handleSubmitComment}>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentModal;
