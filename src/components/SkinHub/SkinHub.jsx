import React, { useState, useEffect } from 'react';
import './SkinHub.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import CommentModal from '../CommentModal/CommentModal';

function SkinHub() {
    const [showModal, setShowModal] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [products, setProducts] = useState([
        { id: 1, name: 'Cleanser', brand: 'Brand A', tags: ['tag1', 'tag2'], upvotes: 0, comments: [] },
        { id: 2, name: 'Moisturizer', brand: 'Brand B', tags: ['tag3', 'tag4'], upvotes: 0, comments: [] },
        { id: 3, name: 'Sunscreen', brand: 'Brand C', tags: ['tag5', 'tag6'], upvotes: 0, comments: [] },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Simulate login or fetch JWT token from localStorage
  useEffect(() => {
    const fetchAuthToken = async () => {
      try {
        // Mock authentication or fetch token from localStorage
        const token = localStorage.getItem('authToken');
        if (token) {
          setAuthToken(token);
          const decodedToken = jwtDecode(token);
          setUserId(decodedToken.userId);
        } else {
          console.log('No authToken found in localStorage');
          // Handle scenario where user is not logged in
        }
      } catch (error) {
        console.error('Error fetching authToken:', error);
      }
    };

    fetchAuthToken();
  }, []);

  const toggleModal = (productId) => {
    setShowModal(productId);
  };

  const handleSubmitComment = async () => {
    if (newComment.trim() === '') {
      alert('Please enter a comment.');
      return;
    }

    try {
      if (!userId) {
        alert('User not authenticated.'); // Handle case where userId is not available
        return;
      }

      const response = await axios.post('http://localhost:3000/comments', {
        userId: userId, // Use dynamically retrieved userId
        productId: showModal,
        text: newComment,
      });

      const updatedProducts = products.map(product => {
        if (product.id === showModal) {
          return {
            ...product,
            comments: [...product.comments, response.data], // Add newly created comment to local state
          };
        }
        return product;
      });

      setProducts(updatedProducts);
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Failed to create comment. Please try again.');
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleUpvote = (productId) => {
    const updatedProducts = products.map(product =>
      product.id === productId ? { ...product, upvotes: product.upvotes + 1 } : product
    );
    setProducts(updatedProducts);
  };

  useEffect(() => {
    const sortedProducts = [...products].sort((a, b) => b.upvotes - a.upvotes);
    setTrendingProducts(sortedProducts.slice(0, 3));
  }, [products]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const productPromises = products.map(async product => {
          const response = await axios.get(`http://localhost:3000/comments/product/${product.id}`);
          return { ...product, comments: response.data };
        });

        const productsWithComments = await Promise.all(productPromises);
        setProducts(productsWithComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );



    // const [searchTerm, setSearchTerm] = useState('');
    // const [trendingProducts, setTrendingProducts] = useState([]);

    // useEffect(() => {
    //     const authToken = localStorage.getItem('authToken');
    //     if (authToken) {
    //       const decodedToken = jwtDecode(authToken);
    //       const { userId, username } = decodedToken;
    //       console.log(userId, username);
    //     } else {
    //       console.log('No authToken found in localStorage');
    //     }
    //   }, []);
    
    //   const toggleModal = (productId) => {
    //     setShowModal(productId);
    //   };
    
    //   const handleSubmitComment = async () => {
    //     if (newComment.trim() === '') {
    //       alert('Please enter a comment.');
    //       return;
    //     }
    
    //     try {
    //       if (!userId) {
    //         alert('User not authenticated.');
    //         return;
    //       }
    
    //       const response = await axios.post('http://localhost:3000/comments', {
    //         userId: userId,
    //         productId: showModal,
    //         text: newComment,
    //       });
    
    //       const updatedProducts = products.map(product => {
    //         if (product.id === showModal) {
    //           return {
    //             ...product,
    //             comments: [...product.comments, response.data],
    //           };
    //         }
    //         return product;
    //       });
    
    //       setProducts(updatedProducts);
    //       setNewComment('');
    //     } catch (error) {
    //       console.error('Error creating comment:', error);
    //       alert('Failed to create comment. Please try again.');
    //     }
    //   };
    
    //   const handleSearchChange = (event) => {
    //     setSearchTerm(event.target.value);
    //   };
    
    //   const handleUpvote = (productId) => {
    //     const updatedProducts = products.map(product =>
    //       product.id === productId ? { ...product, upvotes: product.upvotes + 1 } : product
    //     );
    //     setProducts(updatedProducts);
    //   };
    
    //   useEffect(() => {
    //     const sortedProducts = [...products].sort((a, b) => b.upvotes - a.upvotes);
    //     setTrendingProducts(sortedProducts.slice(0, 3));
    //   }, [products]);
    
    //   useEffect(() => {
    //     const fetchComments = async () => {
    //       try {
    //         const productPromises = products.map(async product => {
    //           const response = await axios.get(`http://localhost:3000/comments/product/${product.id}`);
    //           return { ...product, comments: response.data };
    //         });
    
    //         const productsWithComments = await Promise.all(productPromises);
    //         setProducts(productsWithComments);
    //       } catch (error) {
    //         console.error('Error fetching comments:', error);
    //       }
    //     };
    
    //     fetchComments();
    //   }, []);
    
    //   const filteredProducts = products.filter(product =>
    //     product.name.toLowerCase().includes(searchTerm.toLowerCase())
    //   );
    


    // const toggleModal = (productId) => {
    //     setShowModal(productId);
    // };

    // const handleSubmitComment = () => {
    //     if (newComment.trim() === '') {
    //         alert('Please enter a comment.');
    //         return;
    //     }

    //     const updatedProducts = products.map(product => {
    //         if (product.id === showModal) {
    //             return {
    //                 ...product,
    //                 comments: [...product.comments, { message: newComment, author: 'User' }]
    //             };
    //         }
    //         return product;
    //     });

    //     setProducts(updatedProducts);
    //     setNewComment('');
    // };

    // const handleSearchChange = (event) => {
    //     setSearchTerm(event.target.value);
    // };

    // const handleUpvote = (productId) => {
    //     const updatedProducts = products.map(product =>
    //         product.id === productId ? { ...product, upvotes: product.upvotes + 1 } : product
    //     );
    //     setProducts(updatedProducts);
    // };

    // useEffect(() => {
    //     const sortedProducts = [...products].sort((a, b) => b.upvotes - a.upvotes);
    //     setTrendingProducts(sortedProducts.slice(0, 3));
    // }, [products]);

    // const filteredProducts = products.filter(product =>
    //     product.name.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    return (
        <div className='skinhub-content'>
            <div className='skinhub-banner'>
                <img src="src/assets/placeholder.jpg" alt="Image" />
            </div>
            
            <div className='search-container'>
            <div className='skinhub-search'>
                <input
                    type="text"
                    placeholder="Search by product name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <i className="fas fa-search search-icon"></i>
            </div>
            </div>

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
                {filteredProducts.map(product => (
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
                            <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
                        </div>
                    </div>
                ))}
            </div>

            <CommentModal
                isOpen={showModal !== false}
                onClose={() => setShowModal(false)}
                comments={filteredProducts.find(product => product.id === showModal)?.comments || []}
                newComment={newComment}
                setNewComment={setNewComment}
                handleSubmitComment={handleSubmitComment}
            />
        </div>
    );
}

export default SkinHub;
