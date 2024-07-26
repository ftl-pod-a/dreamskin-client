// import React, { useState, useEffect } from 'react';
// import './SkinHub.css';
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// import CommentModal from '../CommentModal/CommentModal';



import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import _ from 'lodash'; // Import lodash for debounce
import CommentModal from '../CommentModal/CommentModal';
import { useToken } from '../../context/TokenContext';
import './SkinHub.css';

function SkinHub() {
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const {tokenContext, setTokenContext} = useToken();
  //const [authToken, setAuthToken] = useState(null);
  const [addComment, setAddComment] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false); // State for loading feedback

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

  // Debounced search function
  const debouncedSearch = useCallback(
    _.debounce(async (searchTerm, page) => {
      if (searchTerm.trim() === '') {
        setProducts([]);
        setTotalPages(1);
        setCurrentPage(1);
        return;
      }

      try {
        const response = await axios.get('http://localhost:3000/products', {
          params: {
            name: searchTerm,
            page,
            pageSize: 10, // Adjust page size as needed
          },
        });

        // Safeguard against unexpected response structure
        const fetchedProducts = response.data?.products || [];
        const totalPages = response.data?.totalPages || 10;

        setProducts(prevProducts => {
          // Ensure no duplicate products
          const existingIds = new Set(prevProducts.map(product => product.id));
          const newProducts = fetchedProducts.filter(product => !existingIds.has(product.id));
          return [...prevProducts, ...newProducts];
        });
        setTotalPages(totalPages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    }, 300), // Debounce delay of 300ms
    []
  );

  // Handle search term change and trigger debounced search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setLoading(true);
    debouncedSearch(event.target.value, 1); // Reset to page 1 for new search
    setCurrentPage(1); // Reset current page when search term changes
  };

  // Fetch trending products
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const cleanserResponse = await axios.get('http://localhost:3000/products?category=cleanser&sort=likes');
        const moisturizerResponse = await axios.get('http://localhost:3000/products?category=moisturizer&sort=likes');
        const sunscreenResponse = await axios.get('http://localhost:3000/products?category=sunscreen&sort=likes');

        const trendingProductsData = [
          cleanserResponse.data?.[0],
          moisturizerResponse.data?.[0],
          sunscreenResponse.data?.[0],
        ].filter(product => product); // Filter out any undefined products

        setTrendingProducts(trendingProductsData);
      } catch (error) {
        console.error('Error fetching trending products:', error);
      }
    };

    fetchTrendingProducts();
  }, []);

  // Fetch comments for products
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const productPromises = products.map(async product => {
          const response = await axios.get(`http://localhost:3000/comments/product/${product.id}`);
          return { ...product, comments: response.data || [] }; // Ensure comments are an array
        });

        const productsWithComments = await Promise.all(productPromises);

        setProducts(prevProducts => {
          return prevProducts.map(prevProduct => {
            const foundProduct = productsWithComments.find(updatedProduct => updatedProduct.id === prevProduct.id);
            if (foundProduct) {
              return { ...prevProduct, comments: foundProduct.comments };
            }
            return prevProduct;
          });
        });
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [addComment]);

  // Handle page change to load more products
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setLoading(true);
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      debouncedSearch(searchTerm, newPage);
    }
  };

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

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <span>{product.likes}</span>
            </div>

            <div className='product-details'>
              <h3>{product.name}</h3>
              <h4>{product.brand}</h4>
              <h4>{product.category}</h4>
              <h4>{product.description}</h4>
              <p>Price: ${product.price}</p>
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

export default SkinHub;




//WORKS WITH PAGINATION AND ITS GOING TO BE USE FOR THE PRODUCTS SEARCH FUNCTIONALITY
// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// import _ from 'lodash'; // Import lodash for debounce
// import CommentModal from '../CommentModal/CommentModal';
// import './SkinHub.css';

// function SkinHub() {
//   const [showModal, setShowModal] = useState(false);
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [trendingProducts, setTrendingProducts] = useState([]);
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

//   // Debounced search function
//   const debouncedSearch = useCallback(
//     _.debounce(async (searchTerm, page) => {
//       if (searchTerm.trim() === '') {
//         setProducts([]);
//         setTotalPages(1);
//         setCurrentPage(1);
//         return;
//       }

//       try {
//         const response = await axios.get('http://localhost:3000/products', {
//           params: {
//             name: searchTerm,
//             page,
//             pageSize: 10, // Adjust page size as needed
//           },
//         });

//         // Safeguard against unexpected response structure
//         const products = response.data?.products || [];
//         const totalPages = response.data?.totalPages || 1;
//         const currentPage = response.data?.currentPage || 1;

//         setProducts(products);
//         setTotalPages(totalPages);
//         setCurrentPage(currentPage);
//       } catch (error) {
//         console.error('Error fetching products:', error);
//       }
//     }, 300), // Debounce delay of 300ms
//     []
//   );

  
//   // Handle search term change and trigger debounced search
//   const handleSearchChange = (event) => {
//     setSearchTerm(event.target.value);
//     debouncedSearch(event.target.value, currentPage);
//   };

//   // Fetch trending products
//   useEffect(() => {
//     const fetchTrendingProducts = async () => {
//       try {
//         const cleanserResponse = await axios.get('http://localhost:3000/products?category=cleanser&sort=likes');
//         const moisturizerResponse = await axios.get('http://localhost:3000/products?category=moisturizer&sort=likes');
//         const sunscreenResponse = await axios.get('http://localhost:3000/products?category=sunscreen&sort=likes');

//         const trendingProductsData = [
//           cleanserResponse.data?.[0],
//           moisturizerResponse.data?.[0],
//           sunscreenResponse.data?.[0],
//         ].filter(product => product); // Filter out any undefined products

//         setTrendingProducts(trendingProductsData);
//       } catch (error) {
//         console.error('Error fetching trending products:', error);
//       }
//     };

//     fetchTrendingProducts();
//   }, []);

//   // Fetch comments for products
//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async product => {
//           const response = await axios.get(`http://localhost:3000/comments/product/${product.id}`);
//           return { ...product, comments: response.data || [] }; // Ensure comments are an array
//         });

//         const productsWithComments = await Promise.all(productPromises);

//         setProducts(prevProducts => {
//           return prevProducts.map(prevProduct => {
//             const foundProduct = productsWithComments.find(updatedProduct => updatedProduct.id === prevProduct.id);
//             if (foundProduct) {
//               return { ...prevProduct, comments: foundProduct.comments };
//             }
//             return prevProduct;
//           });
//         });
//       } catch (error) {
//         console.error('Error fetching comments:', error);
//       }
//     };

//     fetchComments();
//   }, [addComment]);

//   // Handle page change
//   const handlePageChange = (newPage) => {
//     setCurrentPage(newPage);
//     debouncedSearch(searchTerm, newPage);
//   };

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
//         alert('User not authenticated.'); // Handle case where userId is not available
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

//   // Filter products based on search term
//   const filteredProducts = products.filter(product =>
//     product.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );


//   return (
//     <div className='skinhub-content'>
//       <div className='skinhub-banner'>
//         <img src="src/assets/placeholder.jpg" alt="Image" />
//       </div>

//       <div className='search-container'>
//         <div className='skinhub-search'>
//           <input
//             type="text"
//             placeholder="Search by product name..."
//             value={searchTerm}
//             onChange={handleSearchChange}
//           />
//           <i className="fas fa-search search-icon"></i>
//         </div>
//       </div>

//       <div className='skinhub-trending'>
//         <h3 className='trending-heading'>Trending</h3>
//         <div className='trending-products'>
//           {trendingProducts.map(product => (
//             <div key={product.id} className='trending-product'>
//               <span>{product.name}</span>
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           ))}
//         </div>
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
//               <h4>{product.description}</h4>
//               <p>Price: ${product.price}</p>
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

// export default SkinHub;



