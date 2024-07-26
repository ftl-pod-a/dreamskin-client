// import React, { useState, useEffect } from 'react';
// import './SkinHub.css';
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// import CommentModal from '../CommentModal/CommentModal';


// //IT CREATES AN INFINITE LOOP FOR GET REQUEST 
// function SkinHub() {
//   const [showModal, setShowModal] = useState(false);
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [trendingProducts, setTrendingProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const [authToken, setAuthToken] = useState(null);
//   const [addComment, setAddComment] = useState(false);

//   // Simulate login or fetch JWT token from localStorage
//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         // Mock authentication or fetch token from localStorage
//         const token = localStorage.getItem('authToken');
//         if (token) {
//           setAuthToken(token);
//           const decodedToken = jwtDecode(token);
//           setUserId(decodedToken.userId);
//         } else {
//           console.log('No authToken found in localStorage');
//           // Handle scenario where user is not logged in
//         }
//       } catch (error) {
//         console.error('Error fetching authToken:', error);
//       }
//     };

//     fetchAuthToken();
//   }, []);

//   // Fetch trending products (most liked products in each category)
//   useEffect(() => {
//     const fetchTrendingProducts = async () => {
//       try {
//         const cleanserResponse = await axios.get('http://localhost:3000/products?category=cleanser&sort=likes');
//         const moisturizerResponse = await axios.get('http://localhost:3000/products?category=moisturizer&sort=likes');
//         const sunscreenResponse = await axios.get('http://localhost:3000/products?category=sunscreen&sort=likes');

//         const trendingProductsData = [
//           cleanserResponse.data[0],
//           moisturizerResponse.data[0],
//           sunscreenResponse.data[0],
//         ];

//         setTrendingProducts(trendingProductsData);
//       } catch (error) {
//         console.error('Error fetching trending products:', error);
//       }
//     };

//     fetchTrendingProducts();
//   }, []);

//   // Fetch most liked products for each category (cleanser, moisturizer, sunscreen)
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const cleanserResponse = await axios.get('http://localhost:3000/products?category=cleanser&sort=likes');
//         const moisturizerResponse = await axios.get('http://localhost:3000/products?category=moisturizer&sort=likes');
//         const sunscreenResponse = await axios.get('http://localhost:3000/products?category=sunscreen&sort=likes');

//         const mostLikedCleanser = cleanserResponse.data[0];
//         const mostLikedMoisturizer = moisturizerResponse.data[0];
//         const mostLikedSunscreen = sunscreenResponse.data[0];

//         // Combine the most liked products from each category
//         const mostLikedProducts = [mostLikedCleanser, mostLikedMoisturizer, mostLikedSunscreen];

//         setProducts(mostLikedProducts);
//       } catch (error) {
//         console.error('Error fetching products:', error);
//       }
//     };

//     fetchProducts();
    
//   }, []);

//   // Fetch comments for products
//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async product => {
//           const response = await axios.get(`http://localhost:3000/comments/product/${product.id}`);
//           return { ...product, comments: response.data };
//         });

//         // Wait for all requests to complete
//         const productsWithComments = await Promise.all(productPromises);

//         // Update the comments only, not the entire products list
//         setProducts(prevProducts => {
//           // Merge the fetched comments into the existing products list
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
//   }, [addComment]); // Fetch comments whenever products change //missing products there

//   const toggleModal = (productId) => {
//     setShowModal(productId);
//   };

//   const handleSubmitComment = async () => {
//     // setAddComment(true)
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
//         //setAddComment(false)
//         return product;
//       });

//       setProducts(updatedProducts);
//       setNewComment('');
//       setAddComment(false)
//     } catch (error) {
//       console.error('Error creating comment:', error);
//       alert('Failed to create comment. Please try again.');
//     }
//   };

//   const handleSearchChange = (event) => {
//     setSearchTerm(event.target.value);
//   };

//   const handleUpvote = async (productId) => {
//     try {
//       if (!userId) {
//         alert('User not authenticated.'); // Handle this case as needed
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
//     product.name.toLowerCase().includes(searchTerm.toLowerCase())
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
//         {filteredProducts.map(product => (
//           <div className='products-card' key={product.id}>
//             <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
//               <i className="fas fa-caret-up"></i>
//               <span>{product.likes}</span>
//             </div>

//             <div className='product-details'>
//               <h3>{product.name}</h3>
//               <h4>{product.brand}</h4>
//               <h4>{product.category}</h4>
//               <p>Price: ${product.price}</p>
//                <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//             </div>

//             <div className='products-review'>
//               <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//             </div>
//           </div>
//         ))}
//       </div>

//       <CommentModal
//         isOpen={showModal !== false}
//         onClose={() => setShowModal(false)}
//         comments={filteredProducts.find(product => product.id === showModal)?.comments || []}
//         newComment={newComment}
//         setNewComment={setNewComment}
//         handleSubmitComment={handleSubmitComment}
//         setAddComment={setAddComment}
//       />
//     </div>
//   );
// }

// export default SkinHub;



// import React, { useState, useEffect } from 'react';
// import './SkinHub.css';
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// import CommentModal from '../CommentModal/CommentModal';


// import React, { useState, useEffect } from 'react';
// import './SkinHub.css';
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// import CommentModal from '../CommentModal/CommentModal';


// //IT CREATES AN INFINITE LOOP FOR GET REQUEST 
// function SkinHub() {
//     const [showModal, setShowModal] = useState(false);
//     const [newComment, setNewComment] = useState('');
//     const [products, setProducts] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [trendingProducts, setTrendingProducts] = useState([]);
//     const [userId, setUserId] = useState(null);
//     const [authToken, setAuthToken] = useState(null);
  
//     // Fetch auth token and user ID
//     useEffect(() => {
//       const fetchAuthToken = async () => {
//         try {
//           const token = localStorage.getItem('authToken');
//           if (token) {
//             setAuthToken(token);
//             const decodedToken = jwtDecode(token);
//             setUserId(decodedToken.userId);
//           } else {
//             console.log('No authToken found in localStorage');
//           }
//         } catch (error) {
//           console.error('Error fetching authToken:', error);
//         }
//       };
  
//       fetchAuthToken();
//     }, []);
  
//     // Fetch trending products
//     useEffect(() => {
//       const fetchTrendingProducts = async () => {
//         try {
//           const responses = await Promise.all([
//             axios.get('http://localhost:3000/products?category=cleanser&sort=likes'),
//             axios.get('http://localhost:3000/products?category=moisturizer&sort=likes'),
//             axios.get('http://localhost:3000/products?category=sunscreen&sort=likes'),
//           ]);
  
//           const trendingProductsData = responses.map(response => response.data[0]).filter(Boolean);
//           setTrendingProducts(trendingProductsData);
//         } catch (error) {
//           console.error('Error fetching trending products:', error);
//         }
//       };
  
//       fetchTrendingProducts();
//     }, []);
  
//     // Fetch most liked products for each category
//     useEffect(() => {
//       const fetchProducts = async () => {
//         try {
//           const responses = await Promise.all([
//             axios.get('http://localhost:3000/products?category=cleanser&sort=likes'),
//             axios.get('http://localhost:3000/products?category=moisturizer&sort=likes'),
//             axios.get('http://localhost:3000/products?category=sunscreen&sort=likes'),
//           ]);
  
//           const mostLikedProducts = responses.map(response => response.data[0]).filter(Boolean);
//           setProducts(mostLikedProducts);
//         } catch (error) {
//           console.error('Error fetching products:', error);
//         }
//       };
  
//       fetchProducts();
//     }, []);
  
//     // Fetch comments for products
//     useEffect(() => {
//       const fetchComments = async () => {
//         if (products.length === 0) return;
  
//         try {
//           const productPromises = products.map(product => 
//             axios.get(`http://localhost:3000/comments/product/${product.id}`)
//               .then(response => ({ ...product, comments: response.data }))
//           );
  
//           const productsWithComments = await Promise.all(productPromises);
//           setProducts(prevProducts => prevProducts.map(prevProduct => {
//             const foundProduct = productsWithComments.find(updatedProduct => updatedProduct.id === prevProduct.id);
//             return foundProduct ? { ...prevProduct, comments: foundProduct.comments } : prevProduct;
//           }));
//         } catch (error) {
//           console.error('Error fetching comments:', error);
//         }
//       };
  
//       fetchComments();
//     }, [products]);
  
//     const toggleModal = (productId) => {
//       setShowModal(productId);
//     };
  
//     const handleSubmitComment = async () => {
//       if (newComment.trim() === '') {
//         alert('Please enter a comment.');
//         return;
//       }
  
//       try {
//         if (!userId) {
//           alert('User not authenticated.');
//           return;
//         }
  
//         const response = await axios.post('http://localhost:3000/comments', {
//           userId: userId,
//           productId: showModal,
//           text: newComment,
//         });
  
//         setProducts(prevProducts => prevProducts.map(product => 
//           product.id === showModal 
//             ? { ...product, comments: [...(product.comments || []), response.data] } 
//             : product
//         ));
  
//         setNewComment('');
//         setShowModal(false);
//       } catch (error) {
//         console.error('Error creating comment:', error);
//         alert('Failed to create comment. Please try again.');
//       }
//     };
  
//     const handleSearchChange = (event) => {
//       setSearchTerm(event.target.value);
//     };
  
//     const handleUpvote = async (productId) => {
//       try {
//         if (!userId) {
//           alert('User not authenticated.');
//           return;
//         }
  
//         const response = await axios.post(`http://localhost:3000/products/${productId}/like`, {
//           userId: userId,
//         });
  
//         setProducts(prevProducts => prevProducts.map(product => 
//           product.id === productId 
//             ? { ...product, likes: response.data.likes } 
//             : product
//         ));
//       } catch (error) {
//         console.error('Error liking product:', error);
//         alert('Failed to like product. Please try again.');
//       }
//     };
  
//     const filteredProducts = products.filter(product => 
//       product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
  
//     return (
//       <div className='skinhub-content'>
//         <div className='skinhub-banner'>
//           <img src="src/assets/placeholder.jpg" alt="Image" />
//         </div>
  
//         <div className='search-container'>
//           <div className='skinhub-search'>
//             <input
//               type="text"
//               placeholder="Search by product name..."
//               value={searchTerm}
//               onChange={handleSearchChange}
//             />
//             <i className="fas fa-search search-icon"></i>
//           </div>
//         </div>
  
//         <div className='skinhub-trending'>
//           <h3 className='trending-heading'>Trending</h3>
//           <div className='trending-products'>
//             {trendingProducts.map(product => (
//               <div key={product.id} className='trending-product'>
//                 <span>{product.name}</span>
//                 <i className="fa-solid fa-arrow-trend-up"></i>
//               </div>
//             ))}
//           </div>
//         </div>
  
//         <div className='products'>
//           {filteredProducts.map(product => (
//             <div className='products-card' key={product.id}>
//               <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
//                 <i className="fas fa-caret-up"></i>
//                 <span>{product.likes}</span>
//               </div>
  
//               <div className='product-details'>
//                 <h3>{product.name}</h3>
//                 <h4>{product.brand}</h4>
//                 <h4>{product.category}</h4>
//                 <p>Price: ${product.price}</p>
//                 <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               </div>
  
//               <div className='products-review'>
//                 <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//               </div>
//             </div>
//           ))}
//         </div>
  
//         <CommentModal
//           isOpen={!!showModal}
//           onClose={() => setShowModal(false)}
//           comments={filteredProducts.find(product => product.id === showModal)?.comments || []}
//           newComment={newComment}
//           setNewComment={setNewComment}
//           handleSubmitComment={handleSubmitComment}
//         />
//       </div>
//     );
//   }
  
//   export default SkinHub;




//WORKS WITH PAGINATION AND ITS GOING TO BE USE FOR THE PRODUCTS SEARCH FUNCTIONALITY
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import _ from 'lodash'; // Import lodash for debounce
import CommentModal from '../CommentModal/CommentModal';
import './SkinHub.css';

function SkinHub() {
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [addComment, setAddComment] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        const products = response.data?.products || [];
        const totalPages = response.data?.totalPages || 1;
        const currentPage = response.data?.currentPage || 1;

        setProducts(products);
        setTotalPages(totalPages);
        setCurrentPage(currentPage);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }, 300), // Debounce delay of 300ms
    []
  );

  
  // Handle search term change and trigger debounced search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    debouncedSearch(event.target.value, currentPage);
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

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    debouncedSearch(searchTerm, newPage);
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
        alert('User not authenticated.'); // Handle case where userId is not available
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
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
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

export default SkinHub;


//IT CREATES AN INFINITE LOOP FOR GET REQUEST 
// function SkinHub() {
//   const [showModal, setShowModal] = useState(false);
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [trendingProducts, setTrendingProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const [authToken, setAuthToken] = useState(null);
//   const [addComment, setAddComment] = useState(false);

//   // Simulate login or fetch JWT token from localStorage
//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         // Mock authentication or fetch token from localStorage
//         const token = localStorage.getItem('authToken');
//         if (token) {
//           setAuthToken(token);
//           const decodedToken = jwtDecode(token);
//           setUserId(decodedToken.userId);
//         } else {
//           console.log('No authToken found in localStorage');
//           // Handle scenario where user is not logged in
//         }
//       } catch (error) {
//         console.error('Error fetching authToken:', error);
//       }
//     };

//     fetchAuthToken();
//   }, []);

//   // Fetch trending products (most liked products in each category)
//   useEffect(() => {
//     const fetchTrendingProducts = async () => {
//       try {
//         const cleanserResponse = await axios.get('http://localhost:3000/products?category=cleanser&sort=likes');
//         const moisturizerResponse = await axios.get('http://localhost:3000/products?category=moisturizer&sort=likes');
//         const sunscreenResponse = await axios.get('http://localhost:3000/products?category=sunscreen&sort=likes');

//         const trendingProductsData = [
//           cleanserResponse.data[0],
//           moisturizerResponse.data[0],
//           sunscreenResponse.data[0],
//         ];

//         setTrendingProducts(trendingProductsData);
//       } catch (error) {
//         console.error('Error fetching trending products:', error);
//       }
//     };

//     fetchTrendingProducts();
//   }, []);

//   // Fetch most liked products for each category (cleanser, moisturizer, sunscreen)
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const cleanserResponse = await axios.get('http://localhost:3000/products?category=cleanser&sort=likes');
//         const moisturizerResponse = await axios.get('http://localhost:3000/products?category=moisturizer&sort=likes');
//         const sunscreenResponse = await axios.get('http://localhost:3000/products?category=sunscreen&sort=likes');

//         const mostLikedCleanser = cleanserResponse.data[0];
//         const mostLikedMoisturizer = moisturizerResponse.data[0];
//         const mostLikedSunscreen = sunscreenResponse.data[0];

//         // Combine the most liked products from each category
//         const mostLikedProducts = [mostLikedCleanser, mostLikedMoisturizer, mostLikedSunscreen];

//         setProducts(mostLikedProducts);
//       } catch (error) {
//         console.error('Error fetching products:', error);
//       }
//     };

//     fetchProducts();
    
//   }, []);

//   // Fetch comments for products
//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async product => {
//           const response = await axios.get(`http://localhost:3000/comments/product/${product.id}`);
//           return { ...product, comments: response.data };
//         });

//         // Wait for all requests to complete
//         const productsWithComments = await Promise.all(productPromises);

//         // Update the comments only, not the entire products list
//         setProducts(prevProducts => {
//           // Merge the fetched comments into the existing products list
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
//   }, [addComment]); // Fetch comments whenever products change //missing products there

//   const toggleModal = (productId) => {
//     setShowModal(productId);
//   };

//   const handleSubmitComment = async () => {
//     // setAddComment(true)
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
//         setAddComment(false)
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

//   const handleUpvote = async (productId) => {
//     try {
//       if (!userId) {
//         alert('User not authenticated.'); // Handle this case as needed
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
//     product.name.toLowerCase().includes(searchTerm.toLowerCase())
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
//         {filteredProducts.map(product => (
//           <div className='products-card' key={product.id}>
//             <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
//               <i className="fas fa-caret-up"></i>
//               <span>{product.likes}</span>
//             </div>

//             <div className='product-details'>
//               <h3>{product.name}</h3>
//               <h4>{product.brand}</h4>
//               <h4>{product.category}</h4>
//               <p>Price: ${product.price}</p>
//                <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//             </div>

//             <div className='products-review'>
//               <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//             </div>
//           </div>
//         ))}
//       </div>

//       <CommentModal
//         isOpen={showModal !== false}
//         onClose={() => setShowModal(false)}
//         comments={filteredProducts.find(product => product.id === showModal)?.comments || []}
//         newComment={newComment}
//         setNewComment={setNewComment}
//         handleSubmitComment={handleSubmitComment}
//         setAddComment={setAddComment}
//       />
//     </div>
//   );
// }

// export default SkinHub;





//WORKS PLEASE KEEP
// function SkinHub() {
//     const [showModal, setShowModal] = useState(false);
//     const [newComment, setNewComment] = useState('');
//     const [products, setProducts] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [trendingProducts, setTrendingProducts] = useState([]);
//     const [userId, setUserId] = useState(null);
//     const [authToken, setAuthToken] = useState(null);
  
//     // Simulate login or fetch JWT token from localStorage
//     useEffect(() => {
//       const fetchAuthToken = async () => {
//         try {
//           // Mock authentication or fetch token from localStorage
//           const token = localStorage.getItem('authToken');
//           if (token) {
//             setAuthToken(token);
//             const decodedToken = jwtDecode(token);
//             setUserId(decodedToken.userId);
//           } else {
//             console.log('No authToken found in localStorage');
//             // Handle scenario where user is not logged in
//           }
//         } catch (error) {
//           console.error('Error fetching authToken:', error);
//         }
//       };
  
//       fetchAuthToken();
//     }, []);
  
//     const toggleModal = (productId) => {
//       setShowModal(productId);
//     };
  
//     // Fetch trending products (most liked products in each category)
//     useEffect(() => {
//       const fetchTrendingProducts = async () => {
//         try {
//           const cleanserResponse = await axios.get('http://localhost:3000/products?category=cleanser&sort=likes');
//           const moisturizerResponse = await axios.get('http://localhost:3000/products?category=moisturizer&sort=likes');
//           const sunscreenResponse = await axios.get('http://localhost:3000/products?category=sunscreen&sort=likes');
  
//           const trendingProductsData = [
//             cleanserResponse.data[0],
//             moisturizerResponse.data[0],
//             sunscreenResponse.data[0],
//           ];
  
//           setTrendingProducts(trendingProductsData);
//         } catch (error) {
//           console.error('Error fetching trending products:', error);
//         }
//       };
  
//       fetchTrendingProducts();
//     }, []);
  
//     // Fetch most liked products for each category (cleanser, moisturizer, sunscreen)
//     useEffect(() => {
//       const fetchProducts = async () => {
//         try {
//           const cleanserResponse = await axios.get('http://localhost:3000/products?category=cleanser&sort=likes');
//           const moisturizerResponse = await axios.get('http://localhost:3000/products?category=moisturizer&sort=likes');
//           const sunscreenResponse = await axios.get('http://localhost:3000/products?category=sunscreen&sort=likes');
  
//           const mostLikedCleanser = cleanserResponse.data[0];
//           const mostLikedMoisturizer = moisturizerResponse.data[0];
//           const mostLikedSunscreen = sunscreenResponse.data[0];
  
//           // Combine the most liked products from each category
//           const mostLikedProducts = [mostLikedCleanser, mostLikedMoisturizer, mostLikedSunscreen];
  
//           setProducts(mostLikedProducts);
//         } catch (error) {
//           console.error('Error fetching products:', error);
//         }
//       };
  
//       fetchProducts();
//     }, []);
  
//     const handleSubmitComment = async () => {
//       if (newComment.trim() === '') {
//         alert('Please enter a comment.');
//         return;
//       }
  
//       try {
//         if (!userId) {
//           alert('User not authenticated.'); // Handle case where userId is not available
//           return;
//         }
  
//         const response = await axios.post('http://localhost:3000/comments', {
//           userId: userId, // Use dynamically retrieved userId
//           productId: showModal,
//           text: newComment,
//         });
  
//         const updatedProducts = products.map(product => {
//           if (product.id === showModal) {
//             return {
//               ...product,
//               comments: [...product.comments, response.data], // Add newly created comment to local state
//             };
//           }
//           return product;
//         });
  
//         setProducts(updatedProducts);
//         setNewComment('');
//       } catch (error) {
//         console.error('Error creating comment:', error);
//         alert('Failed to create comment. Please try again.');
//       }
//     };
  
//     const handleSearchChange = (event) => {
//       setSearchTerm(event.target.value);
//     };
  
//     const handleUpvote = async (productId) => {
//       try {
//         if (!userId) {
//           alert('User not authenticated.'); // Handle this case as needed
//           return;
//         }
  
//         const response = await axios.post(`http://localhost:3000/products/${productId}/like`, {
//           userId: userId,
//         });
  
//         const updatedProducts = products.map(product =>
//           product.id === productId ? { ...product, upvotes: response.data.likes } : product
//         );
  
//         setProducts(updatedProducts);
//       } catch (error) {
//         console.error('Error liking product:', error);
//         alert('Failed to like product. Please try again.');
//       }
//     };

//     /////

//     useEffect(() => {
//         const fetchComments = async () => {
//           try {
//             const productPromises = products.map(async product => {
//               const response = await axios.get(`http://localhost:3000/comments/product/${product.id}`);
//               return { ...product, comments: response.data };
//             });
    
//             const productsWithComments = await Promise.all(productPromises);
//             setProducts(productsWithComments);
//           } catch (error) {
//             console.error('Error fetching comments:', error);
//           }
//         };
    
//         fetchComments();
//       }, []);

//     /////
  
//     const filteredProducts = products.filter(product =>
//       product.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
  
//     return (
//       <div className='skinhub-content'>
//         <div className='skinhub-banner'>
//           <img src="src/assets/placeholder.jpg" alt="Image" />
//         </div>
  
//         <div className='search-container'>
//           <div className='skinhub-search'>
//             <input
//               type="text"
//               placeholder="Search by product name..."
//               value={searchTerm}
//               onChange={handleSearchChange}
//             />
//             <i className="fas fa-search search-icon"></i>
//           </div>
//         </div>
  
//         <div className='skinhub-trending'>
//           <h3 className='trending-heading'>Trending</h3>
//           <div className='trending-products'>
//             {trendingProducts.map(product => (
//               <div key={product.id} className='trending-product'>
//                 <span>{product.name}</span>
//                 <i className="fa-solid fa-arrow-trend-up"></i>
//               </div>
//             ))}
//           </div>
//         </div>
  
//         <div className='products'>
//           {filteredProducts.map(product => (
//             <div className='products-card' key={product.id}>
//               <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
//                 <i className="fas fa-caret-up"></i>
//                 <span>{product.likes}</span>
//               </div>
  
//               <div className='product-details'>
//                 <h3>{product.name}</h3>
//                 <h4>{product.brand}</h4>
//                 <p>Likes: {product.likes}</p>
//                 {/* Render comments */}
//                 {product.comments && (
//                   <div className='comments'>
//                     <h4>Commentsss:</h4>
//                     <ul>
//                       {product.comments.map((comment, idx) => (
//                         <li key={idx}>{comment.text}</li>
//                       ))}
//                       <p>Price: ${product.price}</p>
//               <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//                     </ul>
//                   </div>
//                 )}
//               </div>
  
//               <div className='products-review'>
//                 <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//               </div>
//             </div>
//           ))}
//         </div>
  
//         <CommentModal
//           isOpen={showModal !== false}
//           onClose={() => setShowModal(false)}
//           comments={filteredProducts.find(product => product.id === showModal)?.comments || []}
//           newComment={newComment}
//           setNewComment={setNewComment}
//           handleSubmitComment={handleSubmitComment}
//         />
//       </div>
//     );
// }
  
//   export default SkinHub;

//GETS THE PRODUCTS BY THE LIKES BUT THE COMMENT FUNCTIONALITY WAS
//COMPROMISED
// function SkinHub() {
//     const [showModal, setShowModal] = useState(false);
//     const [newComment, setNewComment] = useState('');
//     const [products, setProducts] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [trendingProducts, setTrendingProducts] = useState([]);
//     const [userId, setUserId] = useState(null);
//     const [authToken, setAuthToken] = useState(null);
  
//     // Simulate login or fetch JWT token from localStorage
//     useEffect(() => {
//       const fetchAuthToken = async () => {
//         try {
//           // Mock authentication or fetch token from localStorage
//           const token = localStorage.getItem('authToken');
//           if (token) {
//             setAuthToken(token);
//             const decodedToken = jwtDecode(token);
//             setUserId(decodedToken.userId);
//           } else {
//             console.log('No authToken found in localStorage');
//             // Handle scenario where user is not logged in
//           }
//         } catch (error) {
//           console.error('Error fetching authToken:', error);
//         }
//       };
  
//       fetchAuthToken();
//     }, []);
  
//     const toggleModal = (productId) => {
//       setShowModal(productId);
//     };
  
//     // Fetch trending products (most liked products in each category)
//     useEffect(() => {
//       const fetchTrendingProducts = async () => {
//         try {
//           const cleanserResponse = await axios.get('http://localhost:3000/products?category=cleanser&sort=likes');
//           const moisturizerResponse = await axios.get('http://localhost:3000/products?category=moisturizer&sort=likes');
//           const sunscreenResponse = await axios.get('http://localhost:3000/products?category=sunscreen&sort=likes');
  
//           const trendingProductsData = [
//             cleanserResponse.data[0],
//             moisturizerResponse.data[0],
//             sunscreenResponse.data[0],
//           ];
  
//           setTrendingProducts(trendingProductsData);
//         } catch (error) {
//           console.error('Error fetching trending products:', error);
//         }
//       };
  
//       fetchTrendingProducts();
//     }, []);
  
//     // Fetch most liked products for each category (cleanser, moisturizer, sunscreen)
//     useEffect(() => {
//       const fetchProducts = async () => {
//         try {
//           const cleanserResponse = await axios.get('http://localhost:3000/products?category=cleanser&sort=likes');
//           const moisturizerResponse = await axios.get('http://localhost:3000/products?category=moisturizer&sort=likes');
//           const sunscreenResponse = await axios.get('http://localhost:3000/products?category=sunscreen&sort=likes');
  
//           const mostLikedCleanser = cleanserResponse.data[0];
//           const mostLikedMoisturizer = moisturizerResponse.data[0];
//           const mostLikedSunscreen = sunscreenResponse.data[0];
  
//           // Combine the most liked products from each category
//           const mostLikedProducts = [mostLikedCleanser, mostLikedMoisturizer, mostLikedSunscreen];
  
//           setProducts(mostLikedProducts);
//         } catch (error) {
//           console.error('Error fetching products:', error);
//         }
//       };
  
//       fetchProducts();
//     }, []);
  
//     const handleSubmitComment = async () => {
//       if (newComment.trim() === '') {
//         alert('Please enter a comment.');
//         return;
//       }
  
//       try {
//         if (!userId) {
//           alert('User not authenticated.'); // Handle case where userId is not available
//           return;
//         }
  
//         const response = await axios.post('http://localhost:3000/comments', {
//           userId: userId, // Use dynamically retrieved userId
//           productId: showModal,
//           text: newComment,
//         });
  
//         const updatedProducts = products.map(product => {
//           if (product.id === showModal) {
//             return {
//               ...product,
//               comments: [...product.comments, response.data], // Add newly created comment to local state
//             };
//           }
//           return product;
//         });
  
//         setProducts(updatedProducts);
//         setNewComment('');
//       } catch (error) {
//         console.error('Error creating comment:', error);
//         alert('Failed to create comment. Please try again.');
//       }
//     };
  
//     const handleSearchChange = (event) => {
//       setSearchTerm(event.target.value);
//     };
  
//     const handleUpvote = async (productId) => {
//       try {
//         if (!userId) {
//           alert('User not authenticated.'); // Handle this case as needed
//           return;
//         }
  
//         const response = await axios.post(`http://localhost:3000/products/${productId}/like`, {
//           userId: userId,
//         });
  
//         const updatedProducts = products.map(product =>
//           product.id === productId ? { ...product, upvotes: response.data.likes } : product
//         );
  
//         setProducts(updatedProducts);
//       } catch (error) {
//         console.error('Error liking product:', error);
//         alert('Failed to like product. Please try again.');
//       }
//     };
  
//     const filteredProducts = products.filter(product =>
//       product.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
  
//     return (
//       <div className='skinhub-content'>
//         <div className='skinhub-banner'>
//           <img src="src/assets/placeholder.jpg" alt="Image" />
//         </div>
  
//         <div className='search-container'>
//           <div className='skinhub-search'>
//             <input
//               type="text"
//               placeholder="Search by product name..."
//               value={searchTerm}
//               onChange={handleSearchChange}
//             />
//             <i className="fas fa-search search-icon"></i>
//           </div>
//         </div>
  
//         <div className='skinhub-trending'>
//           <h3 className='trending-heading'>Trending</h3>
//           <div className='trending-products'>
//             {trendingProducts.map(product => (
//               <div key={product.id} className='trending-product'>
//                 <span>{product.name}</span>
//                 <i className="fa-solid fa-arrow-trend-up"></i>
//               </div>
//             ))}
//           </div>
//         </div>
  
//         <div className='products'>
//           {filteredProducts.map(product => (
//             <div className='products-card' key={product.id}>
//               <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
//                 <i className="fas fa-caret-up"></i>
//                 <span>{product.upvotes}</span>
//               </div>
  
//               <div className='product-details'>
//                 <h3>{product.name}</h3>
//                 <h4>{product.brand}</h4>
//                 <p>Likes: {product.likes}</p>
//                 {/* Render comments */}
//                 {product.comments && (
//                   <div className='comments'>
//                     <h4>Commentsss:</h4>
//                     <ul>
//                       {product.comments.map((comment, idx) => (
//                         <li key={idx}>{comment.text}</li>
//                       ))}
//                       <p>Price: ${product.price}</p>
//               <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//                     </ul>
//                   </div>
//                 )}
//               </div>
  
//               <div className='products-review'>
//                 <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//               </div>
//             </div>
//           ))}
//         </div>
  
//         <CommentModal
//           isOpen={showModal !== false}
//           onClose={() => setShowModal(false)}
//           comments={filteredProducts.find(product => product.id === showModal)?.comments || []}
//           newComment={newComment}
//           setNewComment={setNewComment}
//           handleSubmitComment={handleSubmitComment}
//         />
//       </div>
//     );
//   }
  
//   export default SkinHub;
 

//MAYBE WELLS SEE
// function SkinHub() {
//     const [showModal, setShowModal] = useState(false);
//     const [newComment, setNewComment] = useState('');
//     const [products, setProducts] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [trendingProducts, setTrendingProducts] = useState([]);
//     const [userId, setUserId] = useState(null);
//     const [authToken, setAuthToken] = useState(null);
          
//             // Simulate login or fetch JWT token from localStorage
//             useEffect(() => {
//               const fetchAuthToken = async () => {
//                 try {
//                   // Mock authentication or fetch token from localStorage
//                   const token = localStorage.getItem('authToken');
//                   if (token) {
//                     setAuthToken(token);
//                     const decodedToken = jwtDecode(token);
//                     setUserId(decodedToken.userId);
//                   } else {
//                     console.log('No authToken found in localStorage');
//                     // Handle scenario where user is not logged in
//                   }
//                 } catch (error) {
//                   console.error('Error fetching authToken:', error);
//                 }
//               };
          
//               fetchAuthToken();
//             }, []);


//             const toggleModal = (productId) => {
//                 setShowModal(productId);
//               };
//             //////////////////

//             useEffect(() => {
//                 const fetchTrendingProducts = async () => {
//                   try {
//                     // Example endpoint to fetch products with most likes in each category
//                     const cleanserResponse = await axios.get('http://localhost:3000/products?category=cleanser&sort=likes');
//                     const moisturizerResponse = await axios.get('http://localhost:3000/products?category=moisturizer&sort=likes');
//                     const sunscreenResponse = await axios.get('http://localhost:3000/products?category=sunscreen&sort=likes');
            

//                     console.log(cleanserResponse.data[0]);
//                     const trendingProductsData = [
//                       cleanserResponse.data[0], // Assuming API returns the product with most likes for each category
//                       moisturizerResponse.data[0],
//                       sunscreenResponse.data[0],
//                     ];
            
//                     setTrendingProducts(trendingProductsData);
//                   } catch (error) {
//                     console.error('Error fetching trending products:', error);
//                   }
//                 };
            
//                 fetchTrendingProducts();
//               }, []);

//             ///////////////////
          
          
//             const handleSubmitComment = async () => {
//               if (newComment.trim() === '') {
//                 alert('Please enter a comment.');
//                 return;
//               }
          
//               try {
//                 if (!userId) {
//                   alert('User not authenticated.'); // Handle case where userId is not available
//                   return;
//                 }
          
//                 const response = await axios.post('http://localhost:3000/comments', {
//                   userId: userId, // Use dynamically retrieved userId
//                   productId: showModal,
//                   text: newComment,
//                 });
          
//                 const updatedProducts = products.map(product => {
//                   if (product.id === showModal) {
//                     return {
//                       ...product,
//                       comments: [...product.comments, response.data], // Add newly created comment to local state
//                     };
//                   }
//                   return product;
//                 });
          
//                 setProducts(updatedProducts);
//                 setNewComment('');
//               } catch (error) {
//                 console.error('Error creating comment:', error);
//                 alert('Failed to create comment. Please try again.');
//               }
//             };
          
//             const handleSearchChange = (event) => {
//               setSearchTerm(event.target.value);
//             };
          
            
//             const handleUpvote = async (productId) => {
//               try {
//                 if (!userId) {
//                   alert('User not authenticated.'); // Handle this case as needed
//                   return;
//                 }
          
//                 const response = await axios.post(`http://localhost:3000/products/${productId}/like`, {
//                   userId: userId,
//                 });
          
//                 const updatedProducts = products.map(product =>
//                   product.id === productId ? { ...product, upvotes: response.data.likes } : product
//                 );
          
//                 setProducts(updatedProducts);
//               } catch (error) {
//                 console.error('Error liking product:', error);
//                 alert('Failed to like product. Please try again.');
//               }
//             };
          
//             useEffect(() => {
//               const sortedProducts = [...products].sort((a, b) => b.upvotes - a.upvotes);
//               setTrendingProducts(sortedProducts.slice(0, 3));
//             }, [products]);
          
//             useEffect(() => {
//               const fetchComments = async () => {
//                 try {
//                   const productPromises = products.map(async product => {
//                     const response = await axios.get(`http://localhost:3000/comments/product/${product.id}`);
//                     return { ...product, comments: response.data };
//                   });
          
//                   const productsWithComments = await Promise.all(productPromises);
//                   setProducts(productsWithComments);
//                 } catch (error) {
//                   console.error('Error fetching comments:', error);
//                 }
//               };
          
//               fetchComments();
//             }, []);
          
//             const filteredProducts = products.filter(product =>
//               product.name.toLowerCase().includes(searchTerm.toLowerCase())
//             );
          
//             return (
//               <div className='skinhub-content'>
//                 <div className='skinhub-banner'>
//                   <img src="src/assets/placeholder.jpg" alt="Image" />
//                 </div>
          
//                 <div className='search-container'>
//                   <div className='skinhub-search'>
//                     <input
//                       type="text"
//                       placeholder="Search by product name..."
//                       value={searchTerm}
//                       onChange={handleSearchChange}
//                     />
//                     <i className="fas fa-search search-icon"></i>
//                   </div>
//                 </div>
          
//                 <div className='skinhub-trending'>
//                   <h3 className='trending-heading'>Trending</h3>
//                   <div className='trending-products'>
//                     {trendingProducts.map(product => (
//                       <div key={product.id} className='trending-product'>
//                         <span>{product.name}</span>
//                         <i className="fa-solid fa-arrow-trend-up"></i>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
          
//                 <div className='products'>
//                   {filteredProducts.map(product => (
//                     <div className='products-card' key={product.id}>
//                       <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
//                         <i className="fas fa-caret-up"></i>
//                         <span>{product.upvotes}</span>
//                       </div>
          
//                       {/* <div className='product-details'>
//                         <h3>{product.name}</h3>
//                         <h4>{product.brand}</h4>
//                         <div className='tags'>
//                           {product.tags.map((tag, idx) => (
//                             <span key={idx} className='tag'>{tag}</span>
//                           ))}
//                         </div>
//                       </div> */}
//                       <div className='product-details'>
//   <h3>{product.name}</h3>
//   <h4>{product.brand}</h4>
// </div>
          
//                       <div className='products-review'>
//                         <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
          
//                 <CommentModal
//                   isOpen={showModal !== false}
//                   onClose={() => setShowModal(false)}
//                   comments={filteredProducts.find(product => product.id === showModal)?.comments || []}
//                   newComment={newComment}
//                   setNewComment={setNewComment}
//                   handleSubmitComment={handleSubmitComment}
//                 />
//               </div>
//             );
//           }
          
//           export default SkinHub;
    






























//THIS WORKS BUT THE DUMMY DATA IS MESSING ME UP T_T
// function SkinHub() {
//         const [showModal, setShowModal] = useState(false);
//         const [newComment, setNewComment] = useState('');
//         const [products, setProducts] = useState([
//           { id: 1, name: 'Cleanser', brand: 'Brand A', tags: ['ta21', 'tag2'], upvotes: 2, comments: [] },
//           { id: 80, name: 'Moisturizer', brand: 'Brand B', tags: ['tag3', 'tag4'], upvotes: 0, comments: [] },
//           { id: 125, name: 'Sunscreennnnn', brand: 'Brand C', tags: ['tag5', 'tag6'], upvotes: 0, comments: [] },
//         ]);
      
//         const [searchTerm, setSearchTerm] = useState('');
//         const [trendingProducts, setTrendingProducts] = useState([]);
//         const [userId, setUserId] = useState(null);
//         const [authToken, setAuthToken] = useState(null);
      
//         // Simulate login or fetch JWT token from localStorage
//         useEffect(() => {
//           const fetchAuthToken = async () => {
//             try {
//               // Mock authentication or fetch token from localStorage
//               const token = localStorage.getItem('authToken');
//               if (token) {
//                 setAuthToken(token);
//                 const decodedToken = jwtDecode(token);
//                 setUserId(decodedToken.userId);
//               } else {
//                 console.log('No authToken found in localStorage');
//                 // Handle scenario where user is not logged in
//               }
//             } catch (error) {
//               console.error('Error fetching authToken:', error);
//             }
//           };
      
//           fetchAuthToken();
//         }, []);
      
//         const toggleModal = (productId) => {
//           setShowModal(productId);
//         };
      
//         const handleSubmitComment = async () => {
//           if (newComment.trim() === '') {
//             alert('Please enter a comment.');
//             return;
//           }
      
//           try {
//             if (!userId) {
//               alert('User not authenticated.'); // Handle case where userId is not available
//               return;
//             }
      
//             const response = await axios.post('http://localhost:3000/comments', {
//               userId: userId, // Use dynamically retrieved userId
//               productId: showModal,
//               text: newComment,
//             });
      
//             const updatedProducts = products.map(product => {
//               if (product.id === showModal) {
//                 return {
//                   ...product,
//                   comments: [...product.comments, response.data], // Add newly created comment to local state
//                 };
//               }
//               return product;
//             });
      
//             setProducts(updatedProducts);
//             setNewComment('');
//           } catch (error) {
//             console.error('Error creating comment:', error);
//             alert('Failed to create comment. Please try again.');
//           }
//         };
      
//         const handleSearchChange = (event) => {
//           setSearchTerm(event.target.value);
//         };
      
        
//         const handleUpvote = async (productId) => {
//           try {
//             if (!userId) {
//               alert('User not authenticated.'); // Handle this case as needed
//               return;
//             }
      
//             const response = await axios.post(`http://localhost:3000/products/${productId}/like`, {
//               userId: userId,
//             });
      
//             const updatedProducts = products.map(product =>
//               product.id === productId ? { ...product, upvotes: response.data.likes } : product
//             );
      
//             setProducts(updatedProducts);
//           } catch (error) {
//             console.error('Error liking product:', error);
//             alert('Failed to like product. Please try again.');
//           }
//         };
      
//         useEffect(() => {
//           const sortedProducts = [...products].sort((a, b) => b.upvotes - a.upvotes);
//           setTrendingProducts(sortedProducts.slice(0, 3));
//         }, [products]);
      
//         useEffect(() => {
//           const fetchComments = async () => {
//             try {
//               const productPromises = products.map(async product => {
//                 const response = await axios.get(`http://localhost:3000/comments/product/${product.id}`);
//                 return { ...product, comments: response.data };
//               });
      
//               const productsWithComments = await Promise.all(productPromises);
//               setProducts(productsWithComments);
//             } catch (error) {
//               console.error('Error fetching comments:', error);
//             }
//           };
      
//           fetchComments();
//         }, []);
      
//         const filteredProducts = products.filter(product =>
//           product.name.toLowerCase().includes(searchTerm.toLowerCase())
//         );
      
//         return (
//           <div className='skinhub-content'>
//             <div className='skinhub-banner'>
//               <img src="src/assets/placeholder.jpg" alt="Image" />
//             </div>
      
//             <div className='search-container'>
//               <div className='skinhub-search'>
//                 <input
//                   type="text"
//                   placeholder="Search by product name..."
//                   value={searchTerm}
//                   onChange={handleSearchChange}
//                 />
//                 <i className="fas fa-search search-icon"></i>
//               </div>
//             </div>
      
//             <div className='skinhub-trending'>
//               <h3 className='trending-heading'>Trending</h3>
//               <div className='trending-products'>
//                 {trendingProducts.map(product => (
//                   <div key={product.id} className='trending-product'>
//                     <span>{product.name}</span>
//                     <i className="fa-solid fa-arrow-trend-up"></i>
//                   </div>
//                 ))}
//               </div>
//             </div>
      
//             <div className='products'>
//               {filteredProducts.map(product => (
//                 <div className='products-card' key={product.id}>
//                   <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
//                     <i className="fas fa-caret-up"></i>
//                     <span>{product.upvotes}</span>
//                   </div>
      
//                   <div className='product-details'>
//                     <h3>{product.name}</h3>
//                     <h4>{product.brand}</h4>
//                     <div className='tags'>
//                       {product.tags.map((tag, idx) => (
//                         <span key={idx} className='tag'>{tag}</span>
//                       ))}
//                     </div>
//                   </div>
      
//                   <div className='products-review'>
//                     <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//                   </div>
//                 </div>
//               ))}
//             </div>
      
//             <CommentModal
//               isOpen={showModal !== false}
//               onClose={() => setShowModal(false)}
//               comments={filteredProducts.find(product => product.id === showModal)?.comments || []}
//               newComment={newComment}
//               setNewComment={setNewComment}
//               handleSubmitComment={handleSubmitComment}
//             />
//           </div>
//         );
//       }
      
//       export default SkinHub;




//THIS WORKS BUT THE LIKES DISSAPEAR WHEN YOU REFREHS IT 
// function SkinHub() {
//     const [showModal, setShowModal] = useState(false);
//     const [newComment, setNewComment] = useState('');
//     const [products, setProducts] = useState([
//       { id: 1, name: 'Cleanser', brand: 'Brand A', tags: ['tag1', 'tag2'], upvotes: 0, comments: [] },
//       { id: 2, name: 'Moisturizer', brand: 'Brand B', tags: ['tag3', 'tag4'], upvotes: 0, comments: [] },
//       { id: 3, name: 'Sunscreen', brand: 'Brand C', tags: ['tag5', 'tag6'], upvotes: 0, comments: [] },
//     ]);
  
//     const [searchTerm, setSearchTerm] = useState('');
//     const [trendingProducts, setTrendingProducts] = useState([]);
//     const [userId, setUserId] = useState(null);
//     const [authToken, setAuthToken] = useState(null);
  
//     // Simulate login or fetch JWT token from localStorage
//     useEffect(() => {
//       const fetchAuthToken = async () => {
//         try {
//           // Mock authentication or fetch token from localStorage
//           const token = localStorage.getItem('authToken');
//           if (token) {
//             setAuthToken(token);
//             const decodedToken = jwtDecode(token);
//             setUserId(decodedToken.userId);
//           } else {
//             console.log('No authToken found in localStorage');
//             // Handle scenario where user is not logged in
//           }
//         } catch (error) {
//           console.error('Error fetching authToken:', error);
//         }
//       };
  
//       fetchAuthToken();
//     }, []);
  
//     const toggleModal = (productId) => {
//       setShowModal(productId);
//     };
  
//     const handleSubmitComment = async () => {
//       if (newComment.trim() === '') {
//         alert('Please enter a comment.');
//         return;
//       }
  
//       try {
//         if (!userId) {
//           alert('User not authenticated.'); // Handle case where userId is not available
//           return;
//         }
  
//         const response = await axios.post('http://localhost:3000/comments', {
//           userId: userId, // Use dynamically retrieved userId
//           productId: showModal,
//           text: newComment,
//         });
  
//         const updatedProducts = products.map(product => {
//           if (product.id === showModal) {
//             return {
//               ...product,
//               comments: [...product.comments, response.data], // Add newly created comment to local state
//             };
//           }
//           return product;
//         });
  
//         setProducts(updatedProducts);
//         setNewComment('');
//       } catch (error) {
//         console.error('Error creating comment:', error);
//         alert('Failed to create comment. Please try again.');
//       }
//     };
  
//     const handleSearchChange = (event) => {
//       setSearchTerm(event.target.value);
//     };
  
//     const handleUpvote = async (productId) => {
//       try {
//         if (!userId) {
//           alert('User not authenticated.'); // Handle this case as needed
//           return;
//         }
  
//         const response = await axios.post(`http://localhost:3000/products/${productId}/like`, {
//           userId: userId,
//         });
  
//         const updatedProducts = products.map(product =>
//           product.id === productId ? { ...product, upvotes: response.data.likes } : product
//         );
  
//         setProducts(updatedProducts);
//       } catch (error) {
//         console.error('Error liking product:', error);
//         alert('Failed to like product. Please try again.');
//       }
//     };
  
//     useEffect(() => {
//       const sortedProducts = [...products].sort((a, b) => b.upvotes - a.upvotes);
//       setTrendingProducts(sortedProducts.slice(0, 3));
//     }, [products]);
  
//     useEffect(() => {
//       const fetchComments = async () => {
//         try {
//           const productPromises = products.map(async product => {
//             const response = await axios.get(`http://localhost:3000/comments/product/${product.id}`);
//             return { ...product, comments: response.data };
//           });
  
//           const productsWithComments = await Promise.all(productPromises);
//           setProducts(productsWithComments);
//         } catch (error) {
//           console.error('Error fetching comments:', error);
//         }
//       };
  
//       fetchComments();
//     }, []);
  
//     const filteredProducts = products.filter(product =>
//       product.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
  
//     return (
//       <div className='skinhub-content'>
//         <div className='skinhub-banner'>
//           <img src="src/assets/placeholder.jpg" alt="Image" />
//         </div>
  
//         <div className='search-container'>
//           <div className='skinhub-search'>
//             <input
//               type="text"
//               placeholder="Search by product name..."
//               value={searchTerm}
//               onChange={handleSearchChange}
//             />
//             <i className="fas fa-search search-icon"></i>
//           </div>
//         </div>
  
//         <div className='skinhub-trending'>
//           <h3 className='trending-heading'>Trending</h3>
//           <div className='trending-products'>
//             {trendingProducts.map(product => (
//               <div key={product.id} className='trending-product'>
//                 <span>{product.name}</span>
//                 <i className="fa-solid fa-arrow-trend-up"></i>
//               </div>
//             ))}
//           </div>
//         </div>
  
//         <div className='products'>
//           {filteredProducts.map(product => (
//             <div className='products-card' key={product.id}>
//               <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
//                 <i className="fas fa-caret-up"></i>
//                 <span>{product.upvotes}</span>
//               </div>
  
//               <div className='product-details'>
//                 <h3>{product.name}</h3>
//                 <h4>{product.brand}</h4>
//                 <div className='tags'>
//                   {product.tags.map((tag, idx) => (
//                     <span key={idx} className='tag'>{tag}</span>
//                   ))}
//                 </div>
//               </div>
  
//               <div className='products-review'>
//                 <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//               </div>
//             </div>
//           ))}
//         </div>
  
//         <CommentModal
//           isOpen={showModal !== false}
//           onClose={() => setShowModal(false)}
//           comments={filteredProducts.find(product => product.id === showModal)?.comments || []}
//           newComment={newComment}
//           setNewComment={setNewComment}
//           handleSubmitComment={handleSubmitComment}
//         />
//       </div>
//     );
//   }
  
//   export default SkinHub;



//THIS IS FOR WHEN I STOP USING THE DUMMY DATA
// function SkinHub() {
//     const [showModal, setShowModal] = useState(false);
//     const [newComment, setNewComment] = useState('');
//     const [products, setProducts] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [trendingProducts, setTrendingProducts] = useState([]);
//     const [userId, setUserId] = useState(null);
//     const [authToken, setAuthToken] = useState(null);
  
//     // Simulate login or fetch JWT token from localStorage
//     function SkinHub() {
//         const [showModal, setShowModal] = useState(false);
//         const [newComment, setNewComment] = useState('');
//         const [products, setProducts] = useState([]);
//         const [searchTerm, setSearchTerm] = useState('');
//         const [trendingProducts, setTrendingProducts] = useState([]);
//         const [userId, setUserId] = useState(null);
//         const [authToken, setAuthToken] = useState(null);
      
//         // Simulate login or fetch JWT token from localStorage
//         useEffect(() => {
//           const fetchAuthToken = async () => {
//             try {
//               // Mock authentication or fetch token from localStorage
//               const token = localStorage.getItem('authToken');
//               if (token) {
//                 setAuthToken(token);
//                 const decodedToken = jwtDecode(token);
//                 setUserId(decodedToken.userId);
//               } else {
//                 console.log('No authToken found in localStorage');
//                 // Handle scenario where user is not logged in
//               }
//             } catch (error) {
//               console.error('Error fetching authToken:', error);
//             }
//           };
      
//           fetchAuthToken();
//         }, []);
      
//         // Fetch initial products data including likes on component mount
//         useEffect(() => {
//           const fetchProducts = async () => {
//             try {
//               const response = await axios.get('http://localhost:3000/products'); // Replace with your endpoint
//               setProducts(response.data);
      
//               // Calculate trending products
//               const sortedProducts = [...response.data].sort((a, b) => b.upvotes - a.upvotes);
//               setTrendingProducts(sortedProducts.slice(0, 3));
//             } catch (error) {
//               console.error('Error fetching products:', error);
//             }
//           };
      
//           fetchProducts();
//         }, []);
      
//         const toggleModal = (productId) => {
//           setShowModal(productId);
//         };
      
//         const handleSubmitComment = async () => {
//           if (newComment.trim() === '') {
//             alert('Please enter a comment.');
//             return;
//           }
      
//           try {
//             if (!userId) {
//               alert('User not authenticated.'); // Handle case where userId is not available
//               return;
//             }
      
//             const response = await axios.post('http://localhost:3000/comments', {
//               userId: userId,
//               productId: showModal,
//               text: newComment,
//             });
      
//             const updatedProducts = products.map(product => {
//               if (product.id === showModal) {
//                 return {
//                   ...product,
//                   comments: [...product.comments, response.data],
//                 };
//               }
//               return product;
//             });
      
//             setProducts(updatedProducts);
//             setNewComment('');
//           } catch (error) {
//             console.error('Error creating comment:', error);
//             alert('Failed to create comment. Please try again.');
//           }
//         };
      
//         const handleSearchChange = (event) => {
//           setSearchTerm(event.target.value);
//         };
      
//         const handleUpvote = async (productId) => {
//           try {
//             if (!userId) {
//               alert('User not authenticated.'); // Handle this case as needed
//               return;
//             }
      
//             const response = await axios.post(`http://localhost:3000/products/${productId}/like`, {
//               userId: userId,
//             });
      
//             const updatedProducts = products.map(product =>
//               product.id === productId ? { ...product, upvotes: response.data.likes } : product
//             );
      
//             setProducts(updatedProducts);
      
//             // Update localStorage to persist likes across refreshes
//             localStorage.setItem('products', JSON.stringify(updatedProducts));
//           } catch (error) {
//             console.error('Error liking product:', error);
//             alert('Failed to like product. Please try again.');
//           }
//         };
      
//         const restoreProductsFromStorage = () => {
//           const storedProducts = localStorage.getItem('products');
//           if (storedProducts) {
//             setProducts(JSON.parse(storedProducts));
//           }
//         };
      
//         useEffect(() => {
//           restoreProductsFromStorage();
//         }, []);
      
//         const filteredProducts = products.filter(product =>
//           product.name.toLowerCase().includes(searchTerm.toLowerCase())
//         );
      
//         return (
//           <div className='skinhub-content'>
//             <div className='skinhub-banner'>
//               <img src="src/assets/placeholder.jpg" alt="Image" />
//             </div>
      
//             <div className='search-container'>
//               <div className='skinhub-search'>
//                 <input
//                   type="text"
//                   placeholder="Search by product name..."
//                   value={searchTerm}
//                   onChange={handleSearchChange}
//                 />
//                 <i className="fas fa-search search-icon"></i>
//               </div>
//             </div>
      
//             <div className='skinhub-trending'>
//               <h3 className='trending-heading'>Trending</h3>
//               <div className='trending-products'>
//                 {trendingProducts.map(product => (
//                   <div key={product.id} className='trending-product'>
//                     <span>{product.name}</span>
//                     <i className="fa-solid fa-arrow-trend-up"></i>
//                   </div>
//                 ))}
//               </div>
//             </div>
      
//             <div className='products'>
//               {filteredProducts.map(product => (
//                 <div className='products-card' key={product.id}>
//                   <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
//                     <i className="fas fa-caret-up"></i>
//                     <span>{product.upvotes}</span>
//                   </div>
      
//                   <div className='product-details'>
//                     <h3>{product.name}</h3>
//                     <h4>{product.brand}</h4>
//                     <div className='tags'>
//                       {product.tags.map((tag, idx) => (
//                         <span key={idx} className='tag'>{tag}</span>
//                       ))}
//                     </div>
//                   </div>
      
//                   <div className='products-review'>
//                     <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//                   </div>
//                 </div>
//               ))}
//             </div>
      
//             <CommentModal
//               isOpen={showModal !== false}
//               onClose={() => setShowModal(false)}
//               comments={filteredProducts.find(product => product.id === showModal)?.comments || []}
//               newComment={newComment}
//               setNewComment={setNewComment}
//               handleSubmitComment={handleSubmitComment}
//             />
//           </div>
//         );
//       }
//     }
//   export default SkinHub;





//THIS IS JUST THE COMMENT FUNCTIONALITY IMPLEMENTED 
// function SkinHub() {
//     const [showModal, setShowModal] = useState(false);
//     const [newComment, setNewComment] = useState('');
//     const [products, setProducts] = useState([
//         { id: 1, name: 'Cleanser', brand: 'Brand A', tags: ['tag1', 'tag2'], upvotes: 0, comments: [] },
//         { id: 2, name: 'Moisturizer', brand: 'Brand B', tags: ['tag3', 'tag4'], upvotes: 0, comments: [] },
//         { id: 3, name: 'Sunscreen', brand: 'Brand C', tags: ['tag5', 'tag6'], upvotes: 0, comments: [] },
//     ]);

//     const [searchTerm, setSearchTerm] = useState('');
//   const [trendingProducts, setTrendingProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const [authToken, setAuthToken] = useState(null);

//   // Simulate login or fetch JWT token from localStorage
//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         // Mock authentication or fetch token from localStorage
//         const token = localStorage.getItem('authToken');
//         if (token) {
//           setAuthToken(token);
//           const decodedToken = jwtDecode(token);
//           setUserId(decodedToken.userId);
//         } else {
//           console.log('No authToken found in localStorage');
//           // Handle scenario where user is not logged in
//         }
//       } catch (error) {
//         console.error('Error fetching authToken:', error);
//       }
//     };

//     fetchAuthToken();
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
//         alert('User not authenticated.'); // Handle case where userId is not available
//         return;
//       }

//       const response = await axios.post('http://localhost:3000/comments', {
//         userId: userId, // Use dynamically retrieved userId
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


//     return (
//         <div className='skinhub-content'>
//             <div className='skinhub-banner'>
//                 <img src="src/assets/placeholder.jpg" alt="Image" />
//             </div>
            
//             <div className='search-container'>
//             <div className='skinhub-search'>
//                 <input
//                     type="text"
//                     placeholder="Search by product name..."
//                     value={searchTerm}
//                     onChange={handleSearchChange}
//                 />
//                 <i className="fas fa-search search-icon"></i>
//             </div>
//             </div>

//             <div className='skinhub-trending'>
//                 <h3 className='trending-heading'>Trending</h3>
//                 <div className='trending-products'>
//                     {trendingProducts.map(product => (
//                         <div key={product.id} className='trending-product'>
//                             <span>{product.name}</span>
//                             <i className="fa-solid fa-arrow-trend-up"></i>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             <div className='products'>
//                 {filteredProducts.map(product => (
//                     <div className='products-card' key={product.id}>
//                         <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
//                             <i className="fas fa-caret-up"></i>
//                             <span>{product.upvotes}</span>
//                         </div>

//                         <div className='product-details'>
//                             <h3>{product.name}</h3>
//                             <h4>{product.brand}</h4>
//                             <div className='tags'>
//                                 {product.tags.map((tag, idx) => (
//                                     <span key={idx} className='tag'>{tag}</span>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className='products-review'>
//                             <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             <CommentModal
//                 isOpen={showModal !== false}
//                 onClose={() => setShowModal(false)}
//                 comments={filteredProducts.find(product => product.id === showModal)?.comments || []}
//                 newComment={newComment}
//                 setNewComment={setNewComment}
//                 handleSubmitComment={handleSubmitComment}
//             />
//         </div>
//     );
// }

// export default SkinHub;
