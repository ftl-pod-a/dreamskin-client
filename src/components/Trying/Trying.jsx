
import React, { useState, useEffect } from 'react';

import axios from 'axios';

import CommentModal from '../CommentModal/CommentModal';
// import jwtDecode from 'jwt-decode';
import './Trying.css';
import { jwtDecode } from 'jwt-decode';

function Trying() {
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [addComment, setAddComment] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch auth token and user ID
  useEffect(() => {
    const fetchAuthToken = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          setAuthToken(token);
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

  // Fetch products based on the current page
  useEffect(() => {
    const fetchMostLikedProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/products', {
          params: {
            sort: 'likes',
            page: currentPage,
            pageSize: 10, // Adjust page size as needed
          }
        });

        const products = response.data?.products || [];
        const totalPages = response.data?.totalPages || 1;

        setProducts(prevProducts => (currentPage === 1 ? products : [...prevProducts, ...products])); // Append new products
        setTotalPages(totalPages);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchMostLikedProducts();
  }, [currentPage]);

  // Fetch comments for products
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

  // Handle modal toggle
  const toggleModal = (productId) => {
    setShowModal(productId);
  };

  // Handle comment submission
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

  // Handle product upvote
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

  // Handle page change
  const handlePageChange = (direction) => {
    setCurrentPage(prevPage => {
      const newPage = direction === 'next' ? prevPage + 1 : prevPage - 1;
      return newPage > 0 && newPage <= totalPages ? newPage : prevPage;
    });
  };

  return (
    <div className='trying-content'>
      <div className='trying-banner'>
        <img src="src/assets/placeholder.jpg" alt="Image" />
      </div>

      <div className='products'>
        {products.map(product => (
          <div className='products-card' key={product.id}>
            <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
              <i className="fas fa-caret-up"></i>
              <span>{product.likes}</span>
            </div>

            <div className='product-details'>
              <h3>{product.name}</h3>
              <h4>{product.brand}</h4>
              <h4>{product.category}</h4>
              <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
            </div>

            <div className='products-review'>
              <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
            </div>
          </div>
        ))}
      </div>

      <div className='pagination'>
        <button
          onClick={() => handlePageChange('prev')}
          disabled={currentPage <= 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => handlePageChange('next')}
          disabled={currentPage >= totalPages}
        >
          Next
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

//WORKS PERFECTLY FINE
// function Trying() {
//   const [showModal, setShowModal] = useState(false);
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const [authToken, setAuthToken] = useState(null);
//   const [addComment, setAddComment] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         const token = localStorage.getItem('authToken');
//         if (token) {
//           setAuthToken(token);
//           const decodedToken = jwtDecode(token);
//           setUserId(decodedToken.userId);
//         } else {
//           console.log('No authToken found in localStorage');
//         }
//       } catch (error) {
//         console.error('Error fetching authToken:', error);
//       }
//     };

//     fetchAuthToken();
//   }, []);

//   useEffect(() => {
//     const fetchMostLikedProducts = async () => {
//       try {
//         const response = await axios.get('http://localhost:3000/products', {
//           params: {
//             sort: 'likes',
//             page: currentPage,
//             pageSize: 10, // Adjust page size as needed
//           }
//         });

//         const products = response.data?.products || [];
//         const totalPages = response.data?.totalPages || 1;

//         setProducts(products);
//         setTotalPages(totalPages);
//       } catch (error) {
//         console.error('Error fetching products:', error);
//       }
//     };

//     fetchMostLikedProducts();
//   }, [currentPage]);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async (product) => {
//           const response = await axios.get(`http://localhost:3000/comments/product/${product.id}`);
//           return { ...product, comments: response.data || [] }; // Ensure comments are an array
//         });

//         const productsWithComments = await Promise.all(productPromises);

//         setProducts(productsWithComments);
//       } catch (error) {
//         console.error('Error fetching comments:', error);
//       }
//     };

//     fetchComments();
//   }, [addComment]);

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
//             comments: [...product.comments, response.data], // Add newly created comment to local state
//           };
//         }
//         return product;
//       });

//       setProducts(updatedProducts);
//       setNewComment('');
//       setAddComment(false);
//     } catch (error) {
//       console.error('Error creating comment:', error);
//       alert('Failed to create comment. Please try again.');
//     }
//   };

//   const handleUpvote = async (productId) => {
//     try {
//       if (!userId) {
//         alert('User not authenticated.');
//         return;
//       }

//       const response = await axios.post(`http://localhost:3000/products/${productId}/like`, {
//         userId: userId,
//       });

//       const updatedProducts = products.map(product =>
//         product.id === productId ? { ...product, likes: response.data.likes } : product
//       );

//       setProducts(updatedProducts);
//     } catch (error) {
//       console.error('Error liking product:', error);
//       alert('Failed to like product. Please try again.');
//     }
//   };


//   const handlePageChange = (newPage) => {
//     setCurrentPage(newPage);
//   };

//   return (
//     <div className='trying-content'>
//       <div className='trying-banner'>
//         <img src="src/assets/placeholder.jpg" alt="Image" />
//       </div>

//       <div className='products'>
//         {products.map(product => (
//           <div className='products-card' key={product.id}>
//             <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
//               <i className="fas fa-caret-up"></i>
//               <span>{product.likes}</span>
//             </div>

//             <div className='product-details'>
//               <h3>{product.name}</h3>
//               <h4>{product.brand}</h4>
//               <h4>{product.category}</h4>
              
             
//               <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//             </div>

//             <div className='products-review'>
//               <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className='pagination'>
//         <button
//           onClick={() => handlePageChange(currentPage - 1)}
//           disabled={currentPage <= 1}
//         >
//           Previous
//         </button>
//         <span>Page {currentPage} of {totalPages}</span>
//         <button
//           onClick={() => handlePageChange(currentPage + 1)}
//           disabled={currentPage >= totalPages}
//         >
//           Next
//         </button>
//       </div>

//       <CommentModal
//         isOpen={showModal !== false}
//         onClose={() => setShowModal(false)}
//         comments={products.find(product => product.id === showModal)?.comments || []}
//         newComment={newComment}
//         setNewComment={setNewComment}
//         handleSubmitComment={handleSubmitComment}
//         setAddComment={setAddComment}
//       />
//     </div>
//   );
// }

// export default Trying;