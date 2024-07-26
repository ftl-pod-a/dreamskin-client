
import React, { useState, useEffect } from 'react';

import axios from 'axios';

import CommentModal from '../CommentModal/CommentModal';
// import jwtDecode from 'jwt-decode';
import './Trying.css';
import { jwtDecode } from 'jwt-decode';
import { useToken } from '../../context/TokenContext';

function Trying() {
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const {tokenContext, setTokenContext} = useToken();
  //const [authToken, setAuthToken] = useState(null);
  const [addComment, setAddComment] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5); // Assuming a default value or fetch initially
  const [loading, setLoading] = useState(false);
  // const [trendingProducts, setTrendingProducts] = useState([]);

  useEffect(() => {
    const fetchAuthToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setTokenContext(token);
          const decodedToken = jwtDecode(token);
          setUserId(decodedToken.userId);
        } else {
          console.log('No authToken found in localStorage');
        }
      } catch (error) {
        console.error('Error fetching authToken:', error);
      }
    };

    fetchAuthToken();
  }, []);

  useEffect(() => {
    const fetchMostLikedProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/products', {
          params: {
            sort: 'likes',
            page: currentPage,
            pageSize: 10, // Adjust page size as needed
          }
        });

        const fetchedProducts = response.data?.products || [];
        const totalPages = response.data?.totalPages || 10;

        setProducts(prevProducts => {
          // Ensure no duplicate products
          const existingIds = new Set(prevProducts.map(product => product.id));
          const newProducts = fetchedProducts.filter(product => !existingIds.has(product.id));
          return [...prevProducts, ...newProducts];
        });
        setTotalPages(totalPages);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMostLikedProducts();
  }, [currentPage]);


  // useEffect(() => {
  //   const fetchTrendingProducts = async () => {
  //     try {
  //       const cleanserResponse = await axios.get('http://localhost:3000/products?category=cleanser&sort=likes');
  //       const moisturizerResponse = await axios.get('http://localhost:3000/products?category=moisturizer&sort=likes');
  //       const sunscreenResponse = await axios.get('http://localhost:3000/products?category=sunscreen&sort=likes');

  //       const trendingProductsData = [
  //         cleanserResponse.data?.[0],
  //         moisturizerResponse.data?.[0],
  //         sunscreenResponse.data?.[0],
  //       ].filter(product => product); // Filter out any undefined products

  //       setTrendingProducts(trendingProductsData);
  //     } catch (error) {
  //       console.error('Error fetching trending products:', error);
  //     }
  //   };

  //   fetchTrendingProducts();
  // }, []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const productPromises = products.map(async (product) => {
          const response = await axios.get(`http://localhost:3000/comments/product/${product.id}`);
          return { ...product, comments: response.data || [] }; // Ensure comments are an array
        });

        const productsWithComments = await Promise.all(productPromises);

        setProducts(productsWithComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [addComment]);

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
        alert('User not authenticated.');
        return;
      }

      const response = await axios.post('http://localhost:3000/comments', {
        userId: userId,
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
      setAddComment(false);
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Failed to create comment. Please try again.');
    }
  };

  const handleUpvote = async (productId) => {
    try {
      if (!userId) {
        alert('User not authenticated.');
        return;
      }

      const response = await axios.post(`http://localhost:3000/products/${productId}/like`, {
        userId: userId,
      });

      const updatedProducts = products.map(product =>
        product.id === productId ? { ...product, likes: response.data.likes } : product
      );

      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error liking product:', error);
      alert('Failed to like product. Please try again.');
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  return (
    <div className='trending-content'>
      <div className='trending-banner'>
        <img src="src/assets/trendingBanner.png" alt="Image" />
      </div>

      {/* <div className='trending-trending'>
        <h3 className='trending-trending-heading'>Trending</h3>
        <div className='trending-trending-products'>
          {trendingProducts.map(product => (
            <div key={product.id} className='trending-trending-product'>
              <span>{product.name}</span>
              <i className="fa-solid fa-arrow-trend-up"></i>
            </div>
          ))}
        </div>
      </div> */}

      <div className='trending-products-content'>
        {products.map(product => (
          <div className='trending-products-card' key={product.id}>
            <div className='trending-products-upvote' onClick={() => handleUpvote(product.id)}>
              <i className="fa-regular fa-heart"></i>
              <span>{product.likes}</span>
            </div>

            <div className='trending-product-details'>
              <div className='trending-product-details-image'>
                <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
              </div>
              <div className='trending-product-details-text'>
                <h3 className='trending-product-text'>{product.name}</h3>
                <h4 className='trending-product-text'>{product.brand}</h4>
                <p>{product.category}</p>
              </div>
              
            </div>

            <div className='trending-products-review'>
              <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
            </div>
          </div>
        ))}
      </div>

      <div className='trending-pagination'>
        <button
          onClick={handleLoadMore}
          disabled={loading || currentPage >= totalPages}
        >
          {loading ? 'Loading...' : currentPage >= totalPages ? 'No more products' : 'Load More'}
        </button>
      </div>

      <CommentModal
        isOpen={showModal !== false}
        onClose={() => setShowModal(false)}
        comments={products.find(product => product.id === showModal)?.comments || []}
        newComment={newComment}
        setNewComment={setNewComment}
        handleSubmitComment={handleSubmitComment}
        setAddComment={setAddComment}
      />
    </div>
  );
}

export default Trying;
