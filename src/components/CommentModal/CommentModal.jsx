import React, {useEffect} from 'react';
import './CommentModal.css'; // Import your modal CSS file

const CommentModal = ({ isOpen, onClose, comments, newComment, setNewComment, handleSubmitComment, setAddComment }) => {

    useEffect(() => {
        if (isOpen) {
            setAddComment(true);
        }
    }, [isOpen, setAddComment]);

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
                        
                        <button onClick={handleSubmitComment}><i className="fa-solid fa-paper-plane" ></i></button>
                    </div>
                    <ul>
                        {comments.map((comment, index) => (
                            <li key={index}>
                                <p>{comment.text}</p>
                                {                                
                                // comment.user && <small>by {comment.user.username}</small>
                                comment.user && <small>by {comment.user.username}</small>
                                }
                            </li>
                        ))}
                    </ul>
                    
                </div>
            </div>
        </div>
    )
};

export default CommentModal;


