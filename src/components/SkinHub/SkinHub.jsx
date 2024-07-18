import React, { useState, useEffect } from 'react';
import './SkinHub.css';
import CommentModal from '../CommentModal/CommentModal';

function SkinHub() {
    
    // const [showComments, setShowComments] = useState(false);
    const [showModal, setShowModal] =useState(false);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);

    const [products, setProducts] = useState([
        { id: 1, name: 'Cleanser', brand: 'Brand A', tags: ['tag1', 'tag2'], upvotes: 0 },
        { id: 2, name: 'Moisturizer', brand: 'Brand B', tags: ['tag3', 'tag4'], upvotes: 0 },
        { id: 3, name: 'Sunscreen', brand: 'Brand C', tags: ['tag5', 'tag6'], upvotes: 0 },
       
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [trendingProducts, setTrendingProducts] = useState([]);

    // Function to toggle modal visibility
    const toggleModal = () => {
        setShowModal(!showModal);
    };

    // Function to handle comment submission (not implemented here)
    const handleSubmitComment = () => {
        if (newComment.trim() === '') {
            alert('Please enter a comment.');
            return;
        }

        const comment = {
            message: newComment,
            author: 'User' //Replace with actual user data or authentication info
        };

        setComments([...comments, comment])
        setNewComment('');
       
    };

    // Function to handle search term change
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    //upvote functionality
    const handleUpvote = (productId) => {
      
        const updatedProducts = products.map(product =>
            product.id === productId ? { ...product, upvotes: product.upvotes + 1 } : product
        );
        setProducts(updatedProducts);
    };

    

    // Effect to update trending products based on upvotes
    useEffect(() => {
        const sortedProducts = [...products].sort((a, b) => b.upvotes - a.upvotes);
        setTrendingProducts(sortedProducts.slice(0, 3));
    }, [products]);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='skinhub-content'>

            <div className='skinhub-banner'>
                <img src="src/assets/placeholder.jpg" alt="Image" />
            </div>


            {/* <div className='search-container'> */}
            <div className='skinhub-search'>
                <input type="text"
                 placeholder="Search by product name..." 
                 value={searchTerm} 
                 onChange={handleSearchChange} />
                <i className="fas fa-search search-icon"></i>
            </div>
            {/* </div> */}

            <div className='skinhub-trending'>
                <h3 className='trending-heading'>Trending</h3>
                <div className='trending-products'>
                    {trendingProducts.map(product => (
                        <div key={product.id} className='trending-product'>
                            <span>{product.name}</span>
                            <i className="fa-solid fa-arrow-trend-up"></i>
                        </div>
                    ))}
                </div>
            </div>

            <div className='products'>
                {/* {filteredProducts.map(product => (
                    <div className='products-card' key={product.id}>
                        <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
                            <i className="fas fa-caret-up"></i>
                            <span>{product.upvotes}</span>
                        </div>

                        <div className='product-details'>
                            <h3>{product.name}</h3>
                            <h4>{product.brand}</h4>
                            <div className='tags'>
                                {product.tags.map((tag, idx) => (
                                    <span key={idx} className='tag'>{tag}</span>
                                ))}
                            </div>
                        </div>

                        <div className='products-review'>
                            <i className={`far fa-comments ${showComments ? 'active' : ''}`} onClick={toggleComments}></i>
                            <div className={`comment-box ${showComments ? 'active' : ''}`}>
                                <input type="text" placeholder="Write a comment..." />
                                <button onClick={handleSubmitComment}>Submit</button>
                            </div>
                        </div>
                    </div>
                ))} */}

                    {products.map(product => (
                        <div className='products-card' key={product.id}>
                            <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
                                <i className="fas fa-caret-up"></i>
                                <span>{product.upvotes}</span>
                            </div>

                            <div className='product-details'>
                                <h3>{product.name}</h3>
                                <h4>{product.brand}</h4>
                                <div className='tags'>
                                    {product.tags.map((tag, idx) => (
                                        <span key={idx} className='tag'>{tag}</span>
                                    ))}
                                </div>
                            </div>

                            <div className='products-review'>
                                <i className="far fa-comments" onClick={toggleModal}></i>
                            </div>
                        </div>
                    ))}
            </div>
            <CommentModal
                isOpen={showModal}
                onClose={toggleModal}
                comments={comments}
                newComment={newComment}
                setNewComment={setNewComment}
                handleSubmitComment={handleSubmitComment}
            />

        </div>
        
    );
}

export default SkinHub;
