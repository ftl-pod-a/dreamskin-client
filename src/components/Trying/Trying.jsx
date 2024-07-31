import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentModal from '../CommentModal/CommentModal';
import './Trying.css';
import { jwtDecode } from 'jwt-decode';
import { useToken } from '../../context/TokenContext';
import { useNavigate } from 'react-router-dom';

function Trying() {
  const [showModal, setShowModal] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const { tokenContext, setTokenContext } = useToken();
  const [addComment, setAddComment] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [topProducts, setTopProducts] = useState({
    cleanser: null,
    moisturizer: null,
    sunscreen: null,
  });
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [likedProductIds, setLikedProductIds] = useState(new Set());

  const navigate = useNavigate();

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
  }, [setTokenContext]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const [cleanserResponse, moisturizerResponse, sunscreenResponse] = await Promise.all([
          axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'cleanser', sort: 'likes' } }),
          axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'moisturizer', sort: 'likes' } }),
          axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'sunscreen', sort: 'likes' } }),
        ]);

        const getTopProduct = (response) => response.data.products[0] || null;

        setTopProducts({
          cleanser: getTopProduct(cleanserResponse),
          moisturizer: getTopProduct(moisturizerResponse),
          sunscreen: getTopProduct(sunscreenResponse),
        });
      } catch (error) {
        console.error('Error fetching top products:', error);
      }
    };

    fetchTopProducts();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
          params: {
            sort: 'likes',
            page: currentPage,
            pageSize: 4,
          },
        });

        const { products: fetchedProducts, pagination } = response.data;

        const likedProducts = fetchedProducts.filter(product => product.likes > 0);

        const updatedProducts = likedProducts.map(product => {
          const liked = JSON.parse(localStorage.getItem(`liked_${product.id}`)) || false;
          return { ...product, liked };
        });

        setProducts(prevProducts => {
          const existingIds = new Set(prevProducts.map(product => product.id));
          const newProducts = updatedProducts.filter(product => !existingIds.has(product.id));
          return [...prevProducts, ...newProducts];
        });

        setTotalPages(pagination.totalPages);

        const isLastPage = pagination.currentPage >= pagination.totalPages;
        const hasProductsToLoad = likedProducts.length >= 4;
        setHasMoreProducts(!isLastPage && hasProductsToLoad);

      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const productPromises = products.map(async (product) => {
          const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/comments/product/${product.id}`);
          return { ...product, comments: response.data || [] };
        });

        const productsWithComments = await Promise.all(productPromises);

        setProducts(productsWithComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [addComment]);

  const getLikedProducts = async () => {
    try {
      if (userId) {
        const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/users/${userId}`, { params: { user_id: userId } });
        const likedProducts = response.data.likedProducts;
        localStorage.setItem("likedProducts", JSON.stringify(likedProducts));
        setLikedProductIds(new Set(likedProducts.map(product => product.id)));
      }
    } catch (error) {
      console.log("Error getting user", error);
    }
  };

  useEffect(() => {
    if (userId) {
      getLikedProducts();
    }
  }, [userId]);

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

      const response = await axios.post('https://dreamskin-server-tzka.onrender.com/comments', {
        userId: userId,
        productId: showModal,
        text: newComment,
      });

      const updatedProducts = products.map(product => {
        if (product.id === showModal) {
          return {
            ...product,
            comments: [...product.comments, response.data],
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
        navigate('/register');
        return;
      }

      const product = products.find(product => product.id === productId);
      const hasLiked = product ? product.liked : false;

      const response = await axios.post(`https://dreamskin-server-tzka.onrender.com/products/${productId}/like`, {
        userId: userId,
      });

      const newLikes = response.data.likes;
      const newLikedState = !hasLiked;

      const updatedProducts = products.map(product =>
        product.id === productId ? { ...product, likes: newLikes, liked: newLikedState } : product
      );

      localStorage.setItem(`liked_${productId}`, JSON.stringify(newLikedState));

      setProducts(updatedProducts);

      // Update liked products state
      if (newLikes > (product ? product.likes : 0)) {
        setLikedProductIds(prev => new Set(prev).add(productId));
      } else {
        setLikedProductIds(prev => {
          const updated = new Set(prev);
          updated.delete(productId);
          return updated;
        });
      }

      await getLikedProducts();
    } catch (error) {
      console.error('Error liking/unliking product:', error);
      alert('Failed to like/unlike product. Please try again.');
    }
  };

  const handleLoadMore = () => {
    if (hasMoreProducts) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  return (
    <div className='trending-content'>
      <div className='trending-banner'>
        <img src="assets/trendingBannerImg.png" alt="Banner" />
      </div>

      <div className='trending-trending'>
        <h3 className='trending-trending-heading'>Trending</h3>
        <div className='trending-trending-products'>
          {topProducts.cleanser && (
            <div className='trending-trending-product'>
              <span>{topProducts.cleanser.name}</span>
              <img src={topProducts.cleanser.imageUrl} style={{ width: '200px', height: '200px' }} />
              <i className="fa-solid fa-arrow-trend-up"></i>
            </div>
          )}
          {topProducts.moisturizer && (
            <div className='trending-trending-product'>
              <span>{topProducts.moisturizer.name}</span>
              <img src={topProducts.moisturizer.imageUrl} style={{ width: '200px', height: '200px' }} />
              <i className="fa-solid fa-arrow-trend-up"></i>
            </div>
          )}
          {topProducts.sunscreen && (
            <div className='trending-trending-product'>
              <span>{topProducts.sunscreen.name}</span>
              <img src={topProducts.sunscreen.imageUrl} style={{ width: '200px', height: '200px' }} />
              <i className="fa-solid fa-arrow-trend-up"></i>
            </div>
          )}
        </div>
      </div>

      <div className='trending-products-content'>
        {products.map(product => (
          <div className='trending-products-card' key={product.id}>
            <div
              className={`trending-products-upvote ${likedProductIds.has(product.id) && product.likes > (product.likes - 1) ? 'liked' : ''}`}
              onClick={() => handleUpvote(product.id)}
            >
              <i className={`fa-regular fa-heart ${likedProductIds.has(product.id) ? 'liked' : ''}`}></i>
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
              <i
                className="far fa-comments"
                onClick={() => {
                  if (!userId) {
                    navigate('/register');
                  } else {
                    toggleModal(product.id);
                  }
                }}
              ></i>
            </div>
          </div>
        ))}
      </div>

      <div className='trending-pagination'>
        {hasMoreProducts ? (
          <button
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        ) : (
          <span>No more products</span>
        )}
      </div>

      {showModal !== null && (
        <CommentModal
          isOpen={showModal !== null}
          onClose={() => setShowModal(null)}
          comments={products.find(product => product.id === showModal)?.comments || []}
          newComment={newComment}
          setNewComment={setNewComment}
          handleSubmitComment={handleSubmitComment}
          setAddComment={setAddComment}
        />
      )}
    </div>
  );
}

export default Trying;




























// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import CommentModal from '../CommentModal/CommentModal';
// import './Trying.css';
// import { jwtDecode } from 'jwt-decode';
// import { useToken } from '../../context/TokenContext';
// import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

// function Trying() {
//   const [showModal, setShowModal] = useState(null);
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const { tokenContext, setTokenContext } = useToken();
//   const [addComment, setAddComment] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [topProducts, setTopProducts] = useState({
//     cleanser: null,
//     moisturizer: null,
//     sunscreen: null,
//   });
//   const [hasMoreProducts, setHasMoreProducts] = useState(true);

//   const navigate = useNavigate(); // Initialize useNavigate

//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           setTokenContext(token);
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
//   }, [setTokenContext]);

//   useEffect(() => {
//     const fetchTopProducts = async () => {
//       try {
//         const [cleanserResponse, moisturizerResponse, sunscreenResponse] = await Promise.all([
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'cleanser', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'moisturizer', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'sunscreen', sort: 'likes' } }),
//         ]);

//         const getTopProduct = (response) => response.data.products[0] || null;

//         setTopProducts({
//           cleanser: getTopProduct(cleanserResponse),
//           moisturizer: getTopProduct(moisturizerResponse),
//           sunscreen: getTopProduct(sunscreenResponse),
//         });
//       } catch (error) {
//         console.error('Error fetching top products:', error);
//       }
//     };

//     fetchTopProducts();
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
//           params: {
//             sort: 'likes',
//             page: currentPage,
//             pageSize: 4,
//           },
//         });

//         const { products: fetchedProducts, pagination } = response.data;

//         const likedProducts = fetchedProducts.filter(product => product.likes > 0);

//         const updatedProducts = likedProducts.map(product => {
//           const liked = JSON.parse(localStorage.getItem(`liked_${product.id}`)) || false;
//           return { ...product, liked };
//         });

//         setProducts(prevProducts => {
//           const existingIds = new Set(prevProducts.map(product => product.id));
//           const newProducts = updatedProducts.filter(product => !existingIds.has(product.id));
//           return [...prevProducts, ...newProducts];
//         });

//         setTotalPages(pagination.totalPages);

//         const isLastPage = pagination.currentPage >= pagination.totalPages;
//         const hasProductsToLoad = likedProducts.length >= 4;
//         setHasMoreProducts(!isLastPage && hasProductsToLoad);

//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [currentPage]);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async (product) => {
//           const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/comments/product/${product.id}`);
//           return { ...product, comments: response.data || [] };
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

//       const response = await axios.post('https://dreamskin-server-tzka.onrender.com/comments', {
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
//       setAddComment(false);
//     } catch (error) {
//       console.error('Error creating comment:', error);
//       alert('Failed to create comment. Please try again.');
//     }
//   };

//   const handleUpvote = async (productId) => {
//     try {
//       if (!userId) {
//         navigate('/register'); // Redirect to register page if not authenticated
//         return;
//       }

//       const product = products.find(product => product.id === productId);
//       const hasLiked = product ? product.liked : false;

//       const response = await axios.post(`https://dreamskin-server-tzka.onrender.com/products/${productId}/like`, {
//         userId: userId,
//       });

//       const newLikes = response.data.likes;
//       const newLikedState = !hasLiked;

//       const updatedProducts = products.map(product =>
//         product.id === productId ? { ...product, likes: newLikes, liked: newLikedState } : product
//       );

//       localStorage.setItem(`liked_${productId}`, JSON.stringify(newLikedState));

//       setProducts(updatedProducts);
//     } catch (error) {
//       console.error('Error liking/unliking product:', error);
//       alert('Failed to like/unlike product. Please try again.');
//     }
//   };

//   const handleLoadMore = () => {
//     if (hasMoreProducts) {
//       setCurrentPage(prevPage => prevPage + 1);
//     }
//   };

//   return (
//     <div className='trending-content'>
//       <div className='trending-banner'>
//         <img src="assets/trendingBannerImg.png" alt="Banner" />
//       </div>

//       <div className='trending-trending'>
//         <h3 className='trending-trending-heading'>Trending</h3>
//         <div className='trending-trending-products'>
//           {topProducts.cleanser && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.cleanser.name}</span>
//               <img src={topProducts.cleanser.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.moisturizer && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.moisturizer.name}</span>
//               <img src={topProducts.moisturizer.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.sunscreen && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.sunscreen.name}</span>
//               <img src={topProducts.sunscreen.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className='trending-products-content'>
//         {products.map(product => (
//           <div className='trending-products-card' key={product.id}>
//             <div
//               className={`trending-products-upvote ${product.liked ? 'liked' : ''}`}
//               onClick={() => handleUpvote(product.id)}
//             >
//               <i className={`fa-regular fa-heart ${product.liked ? 'liked' : ''}`}></i>
//               <span>{product.likes}</span>
//             </div>

//             <div className='trending-product-details'>
//               <div className='trending-product-details-image'>
//                 <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               </div>
//               <div className='trending-product-details-text'>
//                 <h3 className='trending-product-text'>{product.name}</h3>
//                 <h4 className='trending-product-text'>{product.brand}</h4>
//                 <p>{product.category}</p>
//               </div>
//             </div>

//             <div className='trending-products-review'>
//               <i
//                 className="far fa-comments"
//                 onClick={() => {
//                   if (!userId) {
//                     navigate('/register'); // Redirect to register page if not authenticated
//                   } else {
//                     toggleModal(product.id);
//                   }
//                 }}
//               ></i>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className='trending-pagination'>
//         {hasMoreProducts ? (
//           <button
//             onClick={handleLoadMore}
//             disabled={loading}
//           >
//             {loading ? 'Loading...' : 'Load More'}
//           </button>
//         ) : (
//           <span>No more products</span>
//         )}
//       </div>

//       {showModal !== null && (
//         <CommentModal
//           isOpen={showModal !== null}
//           onClose={() => setShowModal(null)}
//           comments={products.find(product => product.id === showModal)?.comments || []}
//           newComment={newComment}
//           setNewComment={setNewComment}
//           handleSubmitComment={handleSubmitComment}
//           setAddComment={setAddComment}
//         />
//       )}
//     </div>
//   );
// }

// export default Trying;















//CHANGES THE COLOR BUT DOES NOT STAY
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import CommentModal from '../CommentModal/CommentModal';
// import './Trying.css';
// import { jwtDecode } from 'jwt-decode';
// import { useToken } from '../../context/TokenContext';
// import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

// function Trying() {
//   const [showModal, setShowModal] = useState(null);
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const { tokenContext, setTokenContext } = useToken();
//   const [addComment, setAddComment] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [topProducts, setTopProducts] = useState({
//     cleanser: null,
//     moisturizer: null,
//     sunscreen: null,
//   });
//   const [hasMoreProducts, setHasMoreProducts] = useState(true);

//   const navigate = useNavigate(); // Initialize useNavigate

//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           setTokenContext(token);
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
//   }, [setTokenContext]);

//   useEffect(() => {
//     const fetchTopProducts = async () => {
//       try {
//         const [cleanserResponse, moisturizerResponse, sunscreenResponse] = await Promise.all([
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'cleanser', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'moisturizer', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'sunscreen', sort: 'likes' } }),
//         ]);

//         const getTopProduct = (response) => response.data.products[0] || null;

//         setTopProducts({
//           cleanser: getTopProduct(cleanserResponse),
//           moisturizer: getTopProduct(moisturizerResponse),
//           sunscreen: getTopProduct(sunscreenResponse),
//         });
//       } catch (error) {
//         console.error('Error fetching top products:', error);
//       }
//     };

//     fetchTopProducts();
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
//           params: {
//             sort: 'likes',
//             page: currentPage,
//             pageSize: 4,
//           },
//         });

//         const { products: fetchedProducts, pagination } = response.data;

//         const likedProducts = fetchedProducts.filter(product => product.likes > 0);

//         const updatedProducts = likedProducts.map(product => {
//           const liked = JSON.parse(localStorage.getItem(`liked_${product.id}`)) || false;
//           return { ...product, liked };
//         });

//         setProducts(prevProducts => {
//           const existingIds = new Set(prevProducts.map(product => product.id));
//           const newProducts = updatedProducts.filter(product => !existingIds.has(product.id));
//           return [...prevProducts, ...newProducts];
//         });

//         setTotalPages(pagination.totalPages);

//         const isLastPage = pagination.currentPage >= pagination.totalPages;
//         const hasProductsToLoad = likedProducts.length >= 4;
//         setHasMoreProducts(!isLastPage && hasProductsToLoad);

//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [currentPage]);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async (product) => {
//           const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/comments/product/${product.id}`);
//           return { ...product, comments: response.data || [] };
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

//       const response = await axios.post('https://dreamskin-server-tzka.onrender.com/comments', {
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
//       setAddComment(false);
//     } catch (error) {
//       console.error('Error creating comment:', error);
//       alert('Failed to create comment. Please try again.');
//     }
//   };

//   const handleUpvote = async (productId) => {
//     try {
//       if (!userId) {
//         navigate('/register'); // Redirect to register page if not authenticated
//         return;
//       }

//       const product = products.find(product => product.id === productId);
//       const hasLiked = product ? product.liked : false;

//       const response = await axios.post(`https://dreamskin-server-tzka.onrender.com/products/${productId}/like`, {
//         userId: userId,
//       });

//       const newLikes = response.data.likes;
//       const newLikedState = !hasLiked;

//       const updatedProducts = products.map(product =>
//         product.id === productId ? { ...product, likes: newLikes, liked: newLikedState } : product
//       );

//       localStorage.setItem(`liked_${productId}`, JSON.stringify(newLikedState));

//       setProducts(updatedProducts);
//     } catch (error) {
//       console.error('Error liking/unliking product:', error);
//       alert('Failed to like/unlike product. Please try again.');
//     }
//   };

//   const handleLoadMore = () => {
//     if (hasMoreProducts) {
//       setCurrentPage(prevPage => prevPage + 1);
//     }
//   };

//   return (
//     <div className='trending-content'>
//       <div className='trending-banner'>
//         <img src="assets/trendingBannerImg.png" alt="Banner" />
//       </div>

//       <div className='trending-trending'>
//         <h3 className='trending-trending-heading'>Trending</h3>
//         <div className='trending-trending-products'>
//           {topProducts.cleanser && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.cleanser.name}</span>
//               <img src={topProducts.cleanser.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.moisturizer && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.moisturizer.name}</span>
//               <img src={topProducts.moisturizer.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.sunscreen && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.sunscreen.name}</span>
//               <img src={topProducts.sunscreen.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className='trending-products-content'>
//         {products.map(product => (
//           <div className='trending-products-card' key={product.id}>
//             <div
//               className={`trending-products-upvote ${product.liked ? 'liked' : ''}`}
//               onClick={() => handleUpvote(product.id)}
//             >
//               <i className={`fa-regular fa-heart ${product.liked ? 'liked' : ''}`}></i>
//               <span>{product.likes}</span>
//             </div>

//             <div className='trending-product-details'>
//               <div className='trending-product-details-image'>
//                 <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               </div>
//               <div className='trending-product-details-text'>
//                 <h3 className='trending-product-text'>{product.name}</h3>
//                 <h4 className='trending-product-text'>{product.brand}</h4>
//                 <p>{product.category}</p>
//               </div>
//             </div>

//             <div className='trending-products-review'>
//               <i
//                 className="far fa-comments"
//                 onClick={() => {
//                   if (!userId) {
//                     navigate('/register'); // Redirect to register page if not authenticated
//                   } else {
//                     toggleModal(product.id);
//                   }
//                 }}
//               ></i>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className='trending-pagination'>
//         {hasMoreProducts ? (
//           <button
//             onClick={handleLoadMore}
//             disabled={loading}
//           >
//             {loading ? 'Loading...' : 'Load More'}
//           </button>
//         ) : (
//           <span>No more products</span>
//         )}
//       </div>

//       {showModal !== null && (
//         <CommentModal
//           isOpen={showModal !== null}
//           onClose={() => setShowModal(null)}
//           comments={products.find(product => product.id === showModal)?.comments || []}
//           newComment={newComment}
//           setNewComment={setNewComment}
//           handleSubmitComment={handleSubmitComment}
//           setAddComment={setAddComment}
//         />
//       )}
//     </div>
//   );
// }

// export default Trying;

















//LATEST VERSION OF CODE AND IT WORKS 
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import CommentModal from '../CommentModal/CommentModal';
// import './Trying.css';
// import { jwtDecode } from 'jwt-decode';
// import { useToken } from '../../context/TokenContext';
// import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

// function Trying() {
//   const [showModal, setShowModal] = useState(null);
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const { tokenContext, setTokenContext } = useToken();
//   const [addComment, setAddComment] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [topProducts, setTopProducts] = useState({
//     cleanser: null,
//     moisturizer: null,
//     sunscreen: null,
//   });
//   const [hasMoreProducts, setHasMoreProducts] = useState(true);

//   const navigate = useNavigate(); // Initialize useNavigate

//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           setTokenContext(token);
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
//   }, [setTokenContext]);

//   useEffect(() => {
//     const fetchTopProducts = async () => {
//       try {
//         const [cleanserResponse, moisturizerResponse, sunscreenResponse] = await Promise.all([
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'cleanser', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'moisturizer', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'sunscreen', sort: 'likes' } }),
//         ]);

//         const getTopProduct = (response) => response.data.products[0] || null;

//         setTopProducts({
//           cleanser: getTopProduct(cleanserResponse),
//           moisturizer: getTopProduct(moisturizerResponse),
//           sunscreen: getTopProduct(sunscreenResponse),
//         });
//       } catch (error) {
//         console.error('Error fetching top products:', error);
//       }
//     };

//     fetchTopProducts();
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
//           params: {
//             sort: 'likes',
//             page: currentPage,
//             pageSize: 4,
//           },
//         });

//         const { products: fetchedProducts, pagination } = response.data;

//         const likedProducts = fetchedProducts.filter(product => product.likes > 0);

//         const updatedProducts = likedProducts.map(product => {
//           const liked = JSON.parse(localStorage.getItem(`liked_${product.id}`)) || false;
//           return { ...product, liked };
//         });

//         setProducts(prevProducts => {
//           const existingIds = new Set(prevProducts.map(product => product.id));
//           const newProducts = updatedProducts.filter(product => !existingIds.has(product.id));
//           return [...prevProducts, ...newProducts];
//         });

//         setTotalPages(pagination.totalPages);

//         const isLastPage = pagination.currentPage >= pagination.totalPages;
//         const hasProductsToLoad = likedProducts.length >= 4;
//         setHasMoreProducts(!isLastPage && hasProductsToLoad);

//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [currentPage]);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async (product) => {
//           const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/comments/product/${product.id}`);
//           return { ...product, comments: response.data || [] };
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

//       const response = await axios.post('https://dreamskin-server-tzka.onrender.com/comments', {
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
//       setAddComment(false);
//     } catch (error) {
//       console.error('Error creating comment:', error);
//       alert('Failed to create comment. Please try again.');
//     }
//   };

//   const handleUpvote = async (productId) => {
//     try {
//       if (!userId) {
//         navigate('/register'); // Redirect to register page if not authenticated
//         return;
//       }

//       const product = products.find(product => product.id === productId);
//       const hasLiked = product ? product.liked : false;

//       const response = await axios.post(`https://dreamskin-server-tzka.onrender.com/products/${productId}/like`, {
//         userId: userId,
//       });

//       const newLikes = response.data.likes;
//       const newLikedState = !hasLiked;

//       const updatedProducts = products.map(product =>
//         product.id === productId ? { ...product, likes: newLikes, liked: newLikedState } : product
//       );

//       localStorage.setItem(`liked_${productId}`, JSON.stringify(newLikedState));

//       setProducts(updatedProducts);
//     } catch (error) {
//       console.error('Error liking/unliking product:', error);
//       alert('Failed to like/unlike product. Please try again.');
//     }
//   };

//   const handleLoadMore = () => {
//     if (hasMoreProducts) {
//       setCurrentPage(prevPage => prevPage + 1);
//     }
//   };

//   return (
//     <div className='trending-content'>
//       <div className='trending-banner'>
//         <img src="assets/trendingBannerImg.png" alt="Banner" />
//       </div>

//       <div className='trending-trending'>
//         <h3 className='trending-trending-heading'>Trending</h3>
//         <div className='trending-trending-products'>
//           {topProducts.cleanser && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.cleanser.name}</span>
//               <img src={topProducts.cleanser.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.moisturizer && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.moisturizer.name}</span>
//               <img src={topProducts.moisturizer.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.sunscreen && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.sunscreen.name}</span>
//               <img src={topProducts.sunscreen.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className='trending-products-content'>
//         {products.map(product => (
//           <div className='trending-products-card' key={product.id}>
//             <div className='trending-products-upvote' onClick={() => handleUpvote(product.id)}>
//               <i className={`fa-regular fa-heart`}></i>
//               <span>{product.likes}</span>
//             </div>

//             <div className='trending-product-details'>
//               <div className='trending-product-details-image'>
//                 <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               </div>
//               <div className='trending-product-details-text'>
//                 <h3 className='trending-product-text'>{product.name}</h3>
//                 <h4 className='trending-product-text'>{product.brand}</h4>
//                 <p>{product.category}</p>
//               </div>
//             </div>

//             <div className='trending-products-review'>
//               <i
//                 className="far fa-comments"
//                 onClick={() => {
//                   if (!userId) {
//                     navigate('/register'); // Redirect to register page if not authenticated
//                   } else {
//                     toggleModal(product.id);
//                   }
//                 }}
//               ></i>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className='trending-pagination'>
//         {hasMoreProducts ? (
//           <button
//             onClick={handleLoadMore}
//             disabled={loading}
//           >
//             {loading ? 'Loading...' : 'Load More'}
//           </button>
//         ) : (
//           <span>No more products</span>
//         )}
//       </div>

//       {showModal !== null && (
//         <CommentModal
//           isOpen={showModal !== null}
//           onClose={() => setShowModal(null)}
//           comments={products.find(product => product.id === showModal)?.comments || []}
//           newComment={newComment}
//           setNewComment={setNewComment}
//           handleSubmitComment={handleSubmitComment}
//           setAddComment={setAddComment}
//         />
//       )}
//     </div>
//   );
// }

// export default Trying;















//WORKS JUST TRYING TO MAKE IT SO WHEN A NON REGISTER USER CLICKS THEN IT TAKES THEM TO REGISTER PAGE
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import CommentModal from '../CommentModal/CommentModal';
// import './Trying.css';
// import { jwtDecode } from 'jwt-decode';
// import { useToken } from '../../context/TokenContext';

// function Trying() {
//   const [showModal, setShowModal] = useState(null); // Use null instead of boolean
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const { tokenContext, setTokenContext } = useToken();
//   const [addComment, setAddComment] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [topProducts, setTopProducts] = useState({
//     cleanser: null,
//     moisturizer: null,
//     sunscreen: null,
//   });
//   const [hasMoreProducts, setHasMoreProducts] = useState(true);

//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           setTokenContext(token);
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
//   }, [setTokenContext]);

//   useEffect(() => {
//     const fetchTopProducts = async () => {
//       try {
//         const [cleanserResponse, moisturizerResponse, sunscreenResponse] = await Promise.all([
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'cleanser', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'moisturizer', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'sunscreen', sort: 'likes' } }),
//         ]);

//         const getTopProduct = (response) => response.data.products[0] || null;

//         setTopProducts({
//           cleanser: getTopProduct(cleanserResponse),
//           moisturizer: getTopProduct(moisturizerResponse),
//           sunscreen: getTopProduct(sunscreenResponse),
//         });
//       } catch (error) {
//         console.error('Error fetching top products:', error);
//       }
//     };

//     fetchTopProducts();
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
//           params: {
//             sort: 'likes',
//             page: currentPage,
//             pageSize: 4,
//           },
//         });

//         const { products: fetchedProducts, pagination } = response.data;

//         // Check if there are new products
//         const likedProducts = fetchedProducts.filter(product => product.likes > 0);

//         // Initialize the liked state for each product from localStorage
//         const updatedProducts = likedProducts.map(product => {
//           const liked = JSON.parse(localStorage.getItem(`liked_${product.id}`)) || false;
//           return { ...product, liked };
//         });

//         setProducts(prevProducts => {
//           const existingIds = new Set(prevProducts.map(product => product.id));
//           const newProducts = updatedProducts.filter(product => !existingIds.has(product.id));
//           return [...prevProducts, ...newProducts];
//         });

//         // Update pagination state
//         setTotalPages(pagination.totalPages);

//         // Determine if there are more products to load
//         const isLastPage = pagination.currentPage >= pagination.totalPages;
//         const hasProductsToLoad = likedProducts.length >= 4; // Check if fetched products meet page size
//         setHasMoreProducts(!isLastPage && hasProductsToLoad);

//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [currentPage]);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async (product) => {
//           const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/comments/product/${product.id}`);
//           return { ...product, comments: response.data || [] };
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

//       const response = await axios.post('https://dreamskin-server-tzka.onrender.com/comments', {
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

//       // Check if the product is already liked
//       const product = products.find(product => product.id === productId);
//       const hasLiked = product ? product.liked : false;

//       // Send like request
//       const response = await axios.post(`https://dreamskin-server-tzka.onrender.com/products/${productId}/like`, {
//         userId: userId,
//       });

//       const newLikes = response.data.likes;
//       const newLikedState = !hasLiked;

//       // Update products state with new likes count and liked state
//       const updatedProducts = products.map(product =>
//         product.id === productId ? { ...product, likes: newLikes, liked: newLikedState } : product
//       );

//       // Save the new liked state to localStorage
//       localStorage.setItem(`liked_${productId}`, JSON.stringify(newLikedState));

//       setProducts(updatedProducts);
//     } catch (error) {
//       console.error('Error liking/unliking product:', error);
//       alert('Failed to like/unlike product. Please try again.');
//     }
//   };

//   const handleLoadMore = () => {
//     if (hasMoreProducts) {
//       setCurrentPage(prevPage => prevPage + 1);
//     }
//   };

//   return (
//     <div className='trending-content'>
//       <div className='trending-banner'>
//         <img src="assets/trendingBannerImg.png" alt="Banner" />
//       </div>

//       <div className='trending-trending'>
//         <h3 className='trending-trending-heading'>Trending</h3>
//         <div className='trending-trending-products'>
//           {topProducts.cleanser && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.cleanser.name}</span>
//               <img src={topProducts.cleanser.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.moisturizer && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.moisturizer.name}</span>
//               <img src={topProducts.moisturizer.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.sunscreen && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.sunscreen.name}</span>
//               <img src={topProducts.sunscreen.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className='trending-products-content'>
//         {products.map(product => (
//           <div className='trending-products-card' key={product.id}>
//             <div className='trending-products-upvote' onClick={() => handleUpvote(product.id)}>
//               <i className={`fa-regular fa-heart ${product.liked ? 'liked' : ''}`}></i>
//               <span>{product.likes}</span>
//             </div>

//             <div className='trending-product-details'>
//               <div className='trending-product-details-image'>
//                 <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               </div>
//               <div className='trending-product-details-text'>
//                 <h3 className='trending-product-text'>{product.name}</h3>
//                 <h4 className='trending-product-text'>{product.brand}</h4>
//                 <p>{product.category}</p>
//               </div>
//             </div>

//             <div className='trending-products-review'>
//               <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className='trending-pagination'>
//         {hasMoreProducts ? (
//           <button
//             onClick={handleLoadMore}
//             disabled={loading}
//           >
//             {loading ? 'Loading...' : 'Load More'}
//           </button>
//         ) : (
//           <span>No more products</span>
//         )}
//       </div>

//       {showModal !== null && (
//         <CommentModal
//           isOpen={showModal !== null}
//           onClose={() => setShowModal(null)}
//           comments={products.find(product => product.id === showModal)?.comments || []}
//           newComment={newComment}
//           setNewComment={setNewComment}
//           handleSubmitComment={handleSubmitComment}
//           setAddComment={setAddComment}
//         />
//       )}
//     </div>
//   );
// }

// export default Trying;























// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import CommentModal from '../CommentModal/CommentModal';
// import './Trying.css';
// import { jwtDecode } from 'jwt-decode';
// import { useToken } from '../../context/TokenContext';

// function Trying() {
//   const [showModal, setShowModal] = useState(null); // Use null instead of boolean
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const { tokenContext, setTokenContext } = useToken();
//   const [addComment, setAddComment] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [topProducts, setTopProducts] = useState({
//     cleanser: null,
//     moisturizer: null,
//     sunscreen: null,
//   });
//   const [hasMoreProducts, setHasMoreProducts] = useState(true);

//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           setTokenContext(token);
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
//   }, [setTokenContext]);

//   useEffect(() => {
//     const fetchTopProducts = async () => {
//       try {
//         const [cleanserResponse, moisturizerResponse, sunscreenResponse] = await Promise.all([
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'cleanser', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'moisturizer', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'sunscreen', sort: 'likes' } }),
//         ]);

//         const getTopProduct = (response) => response.data.products[0] || null;

//         setTopProducts({
//           cleanser: getTopProduct(cleanserResponse),
//           moisturizer: getTopProduct(moisturizerResponse),
//           sunscreen: getTopProduct(sunscreenResponse),
//         });
//       } catch (error) {
//         console.error('Error fetching top products:', error);
//       }
//     };

//     fetchTopProducts();
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
//           params: {
//             sort: 'likes',
//             page: currentPage,
//             pageSize: 4,
//           },
//         });

//         const { products: fetchedProducts, pagination } = response.data;

//         // Check if there are new products
//         const likedProducts = fetchedProducts.filter(product => product.likes > 0);

//         setProducts(prevProducts => {
//           const existingIds = new Set(prevProducts.map(product => product.id));
//           const newProducts = likedProducts.filter(product => !existingIds.has(product.id));
//           return [...prevProducts, ...newProducts];
//         });

//         // Update pagination state
//         setTotalPages(pagination.totalPages);

//         // Determine if there are more products to load
//         const isLastPage = pagination.currentPage >= pagination.totalPages;
//         const hasProductsToLoad = likedProducts.length >= 4; // Check if fetched products meet page size
//         setHasMoreProducts(!isLastPage && hasProductsToLoad);

//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [currentPage]);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async (product) => {
//           const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/comments/product/${product.id}`);
//           return { ...product, comments: response.data || [] };
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

//       const response = await axios.post('https://dreamskin-server-tzka.onrender.com/comments', {
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

//       // Check if the product is already liked
//       const product = products.find(product => product.id === productId);
//       const hasLiked = product ? product.liked : false;

//       // Send like request
//       const response = await axios.post(`https://dreamskin-server-tzka.onrender.com/products/${productId}/like`, {
//         userId: userId,
//       });

//       const newLikes = response.data.likes;
//       const newLikedState = !hasLiked;

//       // Update products state with new likes count and liked state
//       const updatedProducts = products.map(product =>
//         product.id === productId ? { ...product, likes: newLikes, liked: newLikedState } : product
//       );

//       // Save the new liked state to localStorage
//       localStorage.setItem(`liked_${productId}`, JSON.stringify(newLikedState));

//       setProducts(updatedProducts);
//     } catch (error) {
//       console.error('Error liking/unliking product:', error);
//       alert('Failed to like/unlike product. Please try again.');
//     }
//   };


//   const handleLoadMore = () => {
//     if (hasMoreProducts) {
//       setCurrentPage(prevPage => prevPage + 1);
//     }
//   };

//   return (
//     <div className='trending-content'>
//       <div className='trending-banner'>
//         <img src="assets/trendingBannerImg.png" alt="Banner" />
//       </div>

//       <div className='trending-trending'>
//         <h3 className='trending-trending-heading'>Trending</h3>
//         <div className='trending-trending-products'>
//           {topProducts.cleanser && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.cleanser.name}</span>
//               <img src={topProducts.cleanser.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.moisturizer && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.moisturizer.name}</span>
//               <img src={topProducts.moisturizer.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.sunscreen && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.sunscreen.name}</span>
//               <img src={topProducts.sunscreen.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className='trending-products-content'>
//         {products.map(product => (
//           <div className='trending-products-card' key={product.id}>
//             <div className='trending-products-upvote' onClick={() => handleUpvote(product.id)}>
//               <i className={`fa-regular fa-heart ${product.liked ? 'liked' : ''}`}></i>
//               <span>{product.likes}</span>
//             </div>

//             <div className='trending-product-details'>
//               <div className='trending-product-details-image'>
//                 <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               </div>
//               <div className='trending-product-details-text'>
//                 <h3 className='trending-product-text'>{product.name}</h3>
//                 <h4 className='trending-product-text'>{product.brand}</h4>
//                 <p>{product.category}</p>
//               </div>
//             </div>

//             <div className='trending-products-review'>
//               <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className='trending-pagination'>
//         {hasMoreProducts ? (
//           <button
//             onClick={handleLoadMore}
//             disabled={loading}
//           >
//             {loading ? 'Loading...' : 'Load More'}
//           </button>
//         ) : (
//           <span>No more products</span>
//         )}
//       </div>

//       {showModal !== null && (
//         <CommentModal
//           isOpen={showModal !== null}
//           onClose={() => setShowModal(null)}
//           comments={products.find(product => product.id === showModal)?.comments || []}
//           newComment={newComment}
//           setNewComment={setNewComment}
//           handleSubmitComment={handleSubmitComment}
//           setAddComment={setAddComment}
//         />
//       )}
//     </div>
//   );
// }

// export default Trying;












//JUST COLOR CHANGING LIKES WORK
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import CommentModal from '../CommentModal/CommentModal';
// import './Trying.css';
// import { jwtDecode } from 'jwt-decode';
// import { useToken } from '../../context/TokenContext';

// function Trying() {
//   const [showModal, setShowModal] = useState(null); // Use null instead of boolean
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const { tokenContext, setTokenContext } = useToken();
//   const [addComment, setAddComment] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [topProducts, setTopProducts] = useState({
//     cleanser: null,
//     moisturizer: null,
//     sunscreen: null,
//   });
//   const [hasMoreProducts, setHasMoreProducts] = useState(true);

//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           setTokenContext(token);
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
//   }, [setTokenContext]);

//   useEffect(() => {
//     const fetchTopProducts = async () => {
//       try {
//         const [cleanserResponse, moisturizerResponse, sunscreenResponse] = await Promise.all([
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'cleanser', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'moisturizer', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'sunscreen', sort: 'likes' } }),
//         ]);

//         const getTopProduct = (response) => response.data.products[0] || null;

//         setTopProducts({
//           cleanser: getTopProduct(cleanserResponse),
//           moisturizer: getTopProduct(moisturizerResponse),
//           sunscreen: getTopProduct(sunscreenResponse),
//         });
//       } catch (error) {
//         console.error('Error fetching top products:', error);
//       }
//     };

//     fetchTopProducts();
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
//           params: {
//             sort: 'likes',
//             page: currentPage,
//             pageSize: 4,
//           },
//         });

//         const { products: fetchedProducts, pagination } = response.data;

//         // Initialize the liked state for each product from localStorage
//         const updatedProducts = fetchedProducts.map(product => {
//           const liked = JSON.parse(localStorage.getItem(`liked_${product.id}`)) || false;
//           return { ...product, liked };
//         });

//         setProducts(prevProducts => {
//           const existingIds = new Set(prevProducts.map(product => product.id));
//           const newProducts = updatedProducts.filter(product => !existingIds.has(product.id));
//           return [...prevProducts, ...newProducts];
//         });

//         // Update pagination state
//         setTotalPages(pagination.totalPages);

//         // Determine if there are more products to load
//         const isLastPage = pagination.currentPage >= pagination.totalPages;
//         const hasProductsToLoad = updatedProducts.length >= 4; // Check if fetched products meet page size
//         setHasMoreProducts(!isLastPage && hasProductsToLoad);

//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [currentPage]);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async (product) => {
//           const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/comments/product/${product.id}`);
//           return { ...product, comments: response.data || [] };
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

//       const response = await axios.post('https://dreamskin-server-tzka.onrender.com/comments', {
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

//       // Check if the product is already liked
//       const product = products.find(product => product.id === productId);
//       const hasLiked = product ? product.liked : false;

//       // Send like request
//       const response = await axios.post(`https://dreamskin-server-tzka.onrender.com/products/${productId}/like`, {
//         userId: userId,
//       });

//       const newLikes = response.data.likes;
//       const newLikedState = !hasLiked;

//       // Update products state with new likes count and liked state
//       const updatedProducts = products.map(product =>
//         product.id === productId ? { ...product, likes: newLikes, liked: newLikedState } : product
//       );

//       // Save the new liked state to localStorage
//       localStorage.setItem(`liked_${productId}`, JSON.stringify(newLikedState));

//       setProducts(updatedProducts);
//     } catch (error) {
//       console.error('Error liking/unliking product:', error);
//       alert('Failed to like/unlike product. Please try again.');
//     }
//   };

//   const handleLoadMore = () => {
//     if (hasMoreProducts) {
//       setCurrentPage(prevPage => prevPage + 1);
//     }
//   };

//   return (
//     <div className='trending-content'>
//       <div className='trending-banner'>
//         <img src="assets/trendingBannerImg.png" alt="Banner" />
//       </div>

//       <div className='trending-trending'>
//         <h3 className='trending-trending-heading'>Trending</h3>
//         <div className='trending-trending-products'>
//           {topProducts.cleanser && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.cleanser.name}</span>
//               <img src={topProducts.cleanser.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.moisturizer && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.moisturizer.name}</span>
//               <img src={topProducts.moisturizer.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.sunscreen && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.sunscreen.name}</span>
//               <img src={topProducts.sunscreen.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className='trending-products-content'>
//         {products.map(product => (
//           <div className='trending-products-card' key={product.id}>
//             <div className='trending-products-upvote' onClick={() => handleUpvote(product.id)}>
//               <i className={`fa-regular fa-heart ${product.liked ? 'liked' : ''}`}></i>
//               <span>{product.likes}</span>
//             </div>

//             <div className='trending-product-details'>
//               <div className='trending-product-details-image'>
//                 <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               </div>
//               <div className='trending-product-details-text'>
//                 <h3 className='trending-product-text'>{product.name}</h3>
//                 <h4 className='trending-product-text'>{product.brand}</h4>
//                 <p>{product.category}</p>
//               </div>
//             </div>

//             <div className='trending-products-review'>
//               <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className='trending-pagination'>
//         {hasMoreProducts ? (
//           <button
//             onClick={handleLoadMore}
//             disabled={loading}
//           >
//             {loading ? 'Loading...' : 'Load More'}
//           </button>
//         ) : (
//           <span>No more products</span>
//         )}
//       </div>

//       {showModal !== null && (
//         <CommentModal
//           isOpen={showModal !== null}
//           onClose={() => setShowModal(null)}
//           comments={products.find(product => product.id === showModal)?.comments || []}
//           newComment={newComment}
//           setNewComment={setNewComment}
//           handleSubmitComment={handleSubmitComment}
//           setAddComment={setAddComment}
//         />
//       )}
//     </div>
//   );
// }

// export default Trying;















//THIS VERSION WORKS WITH EVERYHTING JUST TRYING TO MAKE THE COLOR OF THE LIKES STAY AFTER REFRESHING
// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import CommentModal from '../CommentModal/CommentModal';
// import './Trying.css';
// import { jwtDecode } from 'jwt-decode';
// import { useToken } from '../../context/TokenContext';

// function Trying() {
//   const [showModal, setShowModal] = useState(null); // Use null instead of boolean
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const { tokenContext, setTokenContext } = useToken();
//   const [addComment, setAddComment] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [topProducts, setTopProducts] = useState({
//     cleanser: null,
//     moisturizer: null,
//     sunscreen: null,
//   });
//   const [hasMoreProducts, setHasMoreProducts] = useState(true);

//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           setTokenContext(token);
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
//   }, [setTokenContext]);

//   useEffect(() => {
//     const fetchTopProducts = async () => {
//       try {
//         const [cleanserResponse, moisturizerResponse, sunscreenResponse] = await Promise.all([
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'cleanser', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'moisturizer', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'sunscreen', sort: 'likes' } }),
//         ]);

//         const getTopProduct = (response) => response.data.products[0] || null;

//         setTopProducts({
//           cleanser: getTopProduct(cleanserResponse),
//           moisturizer: getTopProduct(moisturizerResponse),
//           sunscreen: getTopProduct(sunscreenResponse),
//         });
//       } catch (error) {
//         console.error('Error fetching top products:', error);
//       }
//     };

//     fetchTopProducts();
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
//           params: {
//             sort: 'likes',
//             page: currentPage,
//             pageSize: 4,
//           },
//         });

//         const { products: fetchedProducts, pagination } = response.data;

//         // Check if there are new products
//         const likedProducts = fetchedProducts.filter(product => product.likes > 0);

//         setProducts(prevProducts => {
//           const existingIds = new Set(prevProducts.map(product => product.id));
//           const newProducts = likedProducts.filter(product => !existingIds.has(product.id));
//           return [...prevProducts, ...newProducts];
//         });

//         // Update pagination state
//         setTotalPages(pagination.totalPages);

//         // Determine if there are more products to load
//         const isLastPage = pagination.currentPage >= pagination.totalPages;
//         const hasProductsToLoad = likedProducts.length >= 4; // Check if fetched products meet page size
//         setHasMoreProducts(!isLastPage && hasProductsToLoad);

//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [currentPage]);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async (product) => {
//           const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/comments/product/${product.id}`);
//           return { ...product, comments: response.data || [] };
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

//       const response = await axios.post('https://dreamskin-server-tzka.onrender.com/comments', {
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

//       // Check if the product is already liked
//       const product = products.find(product => product.id === productId);
//       const hasLiked = product ? product.liked : false;

//       // Send like or unlike request based on current state
//       const response = await axios.post(`https://dreamskin-server-tzka.onrender.com/products/${productId}/like`, {
//                 userId: userId,
//               });
      

//       // Update products state with new likes count
//       const updatedProducts = products.map(product =>
//         product.id === productId ? { ...product, likes: response.data.likes, liked: !hasLiked } : product
//       );

//       setProducts(updatedProducts);
//     } catch (error) {
//       console.error('Error liking/unliking product:', error);
//       alert('Failed to like/unlike product. Please try again.');
//     }
//   };

//   const handleLoadMore = () => {
//     if (hasMoreProducts) {
//       setCurrentPage(prevPage => prevPage + 1);
//     }
//   };

//   return (
//     <div className='trending-content'>
//       <div className='trending-banner'>
//         <img src="assets/trendingBannerImg.png" alt="Banner" />
//       </div>

//       <div className='trending-trending'>
//         <h3 className='trending-trending-heading'>Trending</h3>
//         <div className='trending-trending-products'>
//           {topProducts.cleanser && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.cleanser.name}</span>
//               <img src={topProducts.cleanser.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.moisturizer && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.moisturizer.name}</span>
//               <img src={topProducts.moisturizer.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.sunscreen && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.sunscreen.name}</span>
//               <img src={topProducts.sunscreen.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className='trending-products-content'>
//         {products.map(product => (
//           <div className='trending-products-card' key={product.id}>
//             <div className='trending-products-upvote' onClick={() => handleUpvote(product.id)}>
//               <i className={`fa-regular fa-heart ${product.liked ? 'liked' : ''}`}></i>
//               <span>{product.likes}</span>
//             </div>

//             <div className='trending-product-details'>
//               <div className='trending-product-details-image'>
//                 <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               </div>
//               <div className='trending-product-details-text'>
//                 <h3 className='trending-product-text'>{product.name}</h3>
//                 <h4 className='trending-product-text'>{product.brand}</h4>
//                 <p>{product.category}</p>
//               </div>
//             </div>

//             <div className='trending-products-review'>
//               <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className='trending-pagination'>
//         {hasMoreProducts ? (
//           <button
//             onClick={handleLoadMore}
//             disabled={loading}
//           >
//             {loading ? 'Loading...' : 'Load More'}
//           </button>
//         ) : (
//           <span>No more products</span>
//         )}
//       </div>

//       {showModal !== null && (
//         <CommentModal
//           isOpen={showModal !== null}
//           onClose={() => setShowModal(null)}
//           comments={products.find(product => product.id === showModal)?.comments || []}
//           newComment={newComment}
//           setNewComment={setNewComment}
//           handleSubmitComment={handleSubmitComment}
//           setAddComment={setAddComment}
//         />
//       )}
//     </div>
//   );
// }

// export default Trying;



















// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import CommentModal from '../CommentModal/CommentModal';
// import './Trying.css';
// import { jwtDecode } from 'jwt-decode';
// import { useToken } from '../../context/TokenContext';

// function Trying() {
//   const [showModal, setShowModal] = useState(null); // Use null instead of boolean
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const { tokenContext, setTokenContext } = useToken();
//   const [addComment, setAddComment] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [topProducts, setTopProducts] = useState({
//     cleanser: null,
//     moisturizer: null,
//     sunscreen: null,
//   });
//   const [hasMoreProducts, setHasMoreProducts] = useState(true);

//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           setTokenContext(token);
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
//   }, [setTokenContext]);

//   useEffect(() => {
//     const fetchTopProducts = async () => {
//       try {
//         const [cleanserResponse, moisturizerResponse, sunscreenResponse] = await Promise.all([
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'cleanser', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'moisturizer', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'sunscreen', sort: 'likes' } }),
//         ]);

//         const getTopProduct = (response) => response.data.products[0] || null;

//         setTopProducts({
//           cleanser: getTopProduct(cleanserResponse),
//           moisturizer: getTopProduct(moisturizerResponse),
//           sunscreen: getTopProduct(sunscreenResponse),
//         });
//       } catch (error) {
//         console.error('Error fetching top products:', error);
//       }
//     };

//     fetchTopProducts();
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
//           params: {
//             sort: 'likes',
//             page: currentPage,
//             pageSize: 4,
//           },
//         });

//         const { products: fetchedProducts, pagination } = response.data;

//         // Check if there are new products
//         const likedProducts = fetchedProducts.filter(product => product.likes > 0);

//         setProducts(prevProducts => {
//           const existingIds = new Set(prevProducts.map(product => product.id));
//           const newProducts = likedProducts.filter(product => !existingIds.has(product.id));
//           return [...prevProducts, ...newProducts];
//         });

//         // Update pagination state
//         setTotalPages(pagination.totalPages);

//         // Determine if there are more products to load
//         const isLastPage = pagination.currentPage >= pagination.totalPages;
//         const hasProductsToLoad = likedProducts.length >= 4; // Check if fetched products meet page size
//         setHasMoreProducts(!isLastPage && hasProductsToLoad);

//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [currentPage]);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async (product) => {
//           const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/comments/product/${product.id}`);
//           return { ...product, comments: response.data || [] };
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

//       const response = await axios.post('https://dreamskin-server-tzka.onrender.com/comments', {
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

//       // Check if the product is already liked
//       const product = products.find(product => product.id === productId);
//       const hasLiked = product ? product.liked : false;

//       // Send like or unlike request based on current state
//       const response = await axios.post(`https://dreamskin-server-tzka.onrender.com/products/${productId}/like`, {
//                 userId: userId,
//               });
      

//       // Update products state with new likes count
//       const updatedProducts = products.map(product =>
//         product.id === productId ? { ...product, likes: response.data.likes, liked: !hasLiked } : product
//       );

//       setProducts(updatedProducts);
//     } catch (error) {
//       console.error('Error liking/unliking product:', error);
//       alert('Failed to like/unlike product. Please try again.');
//     }
//   };

//   const handleLoadMore = () => {
//     if (hasMoreProducts) {
//       setCurrentPage(prevPage => prevPage + 1);
//     }
//   };

//   return (
//     <div className='trending-content'>
//       <div className='trending-banner'>
//         <img src="assets/trendingBannerImg.png" alt="Banner" />
//       </div>

//       <div className='trending-trending'>
//         <h3 className='trending-trending-heading'>Trending</h3>
//         <div className='trending-trending-products'>
//           {topProducts.cleanser && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.cleanser.name}</span>
//               <img src={topProducts.cleanser.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.moisturizer && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.moisturizer.name}</span>
//               <img src={topProducts.moisturizer.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.sunscreen && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.sunscreen.name}</span>
//               <img src={topProducts.sunscreen.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className='trending-products-content'>
//         {products.map(product => (
//           <div className='trending-products-card' key={product.id}>
//             <div className='trending-products-upvote' onClick={() => handleUpvote(product.id)}>
//               <i className={`fa-regular fa-heart ${product.liked ? 'liked' : ''}`}></i>
//               <span>{product.likes}</span>
//             </div>

//             <div className='trending-product-details'>
//               <div className='trending-product-details-image'>
//                 <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               </div>
//               <div className='trending-product-details-text'>
//                 <h3 className='trending-product-text'>{product.name}</h3>
//                 <h4 className='trending-product-text'>{product.brand}</h4>
//                 <p>{product.category}</p>
//               </div>
//             </div>

//             <div className='trending-products-review'>
//               <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className='trending-pagination'>
//         {hasMoreProducts ? (
//           <button
//             onClick={handleLoadMore}
//             disabled={loading}
//           >
//             {loading ? 'Loading...' : 'Load More'}
//           </button>
//         ) : (
//           <span>No more products</span>
//         )}
//       </div>

//       {showModal !== null && (
//         <CommentModal
//           isOpen={showModal !== null}
//           onClose={() => setShowModal(null)}
//           comments={products.find(product => product.id === showModal)?.comments || []}
//           newComment={newComment}
//           setNewComment={setNewComment}
//           handleSubmitComment={handleSubmitComment}
//           setAddComment={setAddComment}
//         />
//       )}
//     </div>
//   );
// }

// export default Trying;










//THIS WORKS BUT NOT THE LIKES 
// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import CommentModal from '../CommentModal/CommentModal';
// import './Trying.css';
// import { jwtDecode } from 'jwt-decode';
// import { useToken } from '../../context/TokenContext';

// function Trying() {
//   const [showModal, setShowModal] = useState(null); // Use null instead of boolean
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const { tokenContext, setTokenContext } = useToken();
//   const [addComment, setAddComment] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [topProducts, setTopProducts] = useState({
//     cleanser: null,
//     moisturizer: null,
//     sunscreen: null,
//   });
//   const [hasMoreProducts, setHasMoreProducts] = useState(true);

//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           setTokenContext(token);
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
//   }, [setTokenContext]);

//   useEffect(() => {
//     const fetchTopProducts = async () => {
//       try {
//         const [cleanserResponse, moisturizerResponse, sunscreenResponse] = await Promise.all([
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'cleanser', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'moisturizer', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'sunscreen', sort: 'likes' } }),
//         ]);

//         const getTopProduct = (response) => response.data.products[0] || null;

//         setTopProducts({
//           cleanser: getTopProduct(cleanserResponse),
//           moisturizer: getTopProduct(moisturizerResponse),
//           sunscreen: getTopProduct(sunscreenResponse),
//         });
//       } catch (error) {
//         console.error('Error fetching top products:', error);
//       }
//     };

//     fetchTopProducts();
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
//           params: {
//             sort: 'likes',
//             page: currentPage,
//             pageSize: 4,
//           },
//         });

//         const { products: fetchedProducts, pagination } = response.data;

//         // Check if there are new products
//         const likedProducts = fetchedProducts.filter(product => product.likes > 0);

//         setProducts(prevProducts => {
//           const existingIds = new Set(prevProducts.map(product => product.id));
//           const newProducts = likedProducts.filter(product => !existingIds.has(product.id));
//           return [...prevProducts, ...newProducts];
//         });

//         // Update pagination state
//         setTotalPages(pagination.totalPages);

//         // Determine if there are more products to load
//         const isLastPage = pagination.currentPage >= pagination.totalPages;
//         const hasProductsToLoad = likedProducts.length >= 4; // Check if fetched products meet page size
//         setHasMoreProducts(!isLastPage && hasProductsToLoad);

//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [currentPage]);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async (product) => {
//           const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/comments/product/${product.id}`);
//           return { ...product, comments: response.data || [] };
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

//       const response = await axios.post('https://dreamskin-server-tzka.onrender.com/comments', {
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

//       const response = await axios.post(`https://dreamskin-server-tzka.onrender.com/products/${productId}/like`, {
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

//   const handleLoadMore = () => {
//     if (hasMoreProducts) {
//       setCurrentPage(prevPage => prevPage + 1);
//     }
//   };

//   return (
//     <div className='trending-content'>
//       <div className='trending-banner'>
//         <img src="assets/trendingBannerImg.png" alt="Banner" />
//       </div>

//       <div className='trending-trending'>
//         <h3 className='trending-trending-heading'>Trending</h3>
//         <div className='trending-trending-products'>
//           {topProducts.cleanser && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.cleanser.name}</span>
//               <img src={topProducts.cleanser.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.moisturizer && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.moisturizer.name}</span>
//               <img src={topProducts.moisturizer.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.sunscreen && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.sunscreen.name}</span>
//               <img src={topProducts.sunscreen.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className='trending-products-content'>
//         {products.map(product => (
//           <div className='trending-products-card' key={product.id}>
//             <div className='trending-products-upvote' onClick={() => handleUpvote(product.id)}>
//               <i className={`fa-regular fa-heart ${product.likes > 0 ? 'liked' : ''}`}></i>
//               <span>{product.likes}</span>
//             </div>

//             <div className='trending-product-details'>
//               <div className='trending-product-details-image'>
//                 <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               </div>
//               <div className='trending-product-details-text'>
//                 <h3 className='trending-product-text'>{product.name}</h3>
//                 <h4 className='trending-product-text'>{product.brand}</h4>
//                 <p>{product.category}</p>
//               </div>
//             </div>

//             <div className='trending-products-review'>
//               <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className='trending-pagination'>
//         {hasMoreProducts ? (
//           <button
//             onClick={handleLoadMore}
//             disabled={loading}
//           >
//             {loading ? 'Loading...' : 'Load More'}
//           </button>
//         ) : (
//           <span>No more products</span>
//         )}
//       </div>

//       {showModal !== null && (
//         <CommentModal
//           isOpen={showModal !== null}
//           onClose={() => setShowModal(null)}
//           comments={products.find(product => product.id === showModal)?.comments || []}
//           newComment={newComment}
//           setNewComment={setNewComment}
//           handleSubmitComment={handleSubmitComment}
//           setAddComment={setAddComment}
//         />
//       )}
//     </div>
//   );
// }

// export default Trying;














//LATEST VERSION OF THE CODE WITH THE NEW UPDATES //IT WORKS 
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import CommentModal from '../CommentModal/CommentModal';
// import './Trying.css';
// import { jwtDecode } from 'jwt-decode';
// import { useToken } from '../../context/TokenContext';

// function Trying() {
//   const [showModal, setShowModal] = useState(false);
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const { tokenContext, setTokenContext } = useToken();
//   const [addComment, setAddComment] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [topProducts, setTopProducts] = useState({
//     cleanser: null,
//     moisturizer: null,
//     sunscreen: null,
//   });
//   const [hasMoreProducts, setHasMoreProducts] = useState(true); // Track if there are more products

//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           setTokenContext(token);
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
//   }, [setTokenContext]);

//   useEffect(() => {
//     const fetchTopProducts = async () => {
//       try {
//         const [cleanserResponse, moisturizerResponse, sunscreenResponse] = await Promise.all([
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'cleanser', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'moisturizer', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'sunscreen', sort: 'likes' } }),
//         ]);

//         const getTopProduct = (response) => response.data.products[0] || null;

//         setTopProducts({
//           cleanser: getTopProduct(cleanserResponse),
//           moisturizer: getTopProduct(moisturizerResponse),
//           sunscreen: getTopProduct(sunscreenResponse),
//         });
//       } catch (error) {
//         console.error('Error fetching top products:', error);
//       }
//     };

//     fetchTopProducts();
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
//           params: {
//             sort: 'likes',
//             page: currentPage,
//             pageSize: 4,
//           },
//         });

//         const { products: fetchedProducts, pagination } = response.data;

//         // Check if there are new products
//         const likedProducts = fetchedProducts.filter(product => product.likes > 0);

//         setProducts(prevProducts => {
//           const existingIds = new Set(prevProducts.map(product => product.id));
//           const newProducts = likedProducts.filter(product => !existingIds.has(product.id));
//           return [...prevProducts, ...newProducts];
//         });

//         // Update pagination state
//         setTotalPages(pagination.totalPages);

//         // Determine if there are more products to load
//         const isLastPage = pagination.currentPage >= pagination.totalPages;
//         const hasProductsToLoad = likedProducts.length >= 4; // Check if fetched products meet page size
//         setHasMoreProducts(!isLastPage && hasProductsToLoad);

//         // Debugging output
//         console.log(`Current Page: ${currentPage}, Total Pages: ${pagination.totalPages}`);
//         console.log('Has More Products:', !isLastPage && hasProductsToLoad);

//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [currentPage, setTokenContext]);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async (product) => {
//           const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/comments/product/${product.id}`);
//           return { ...product, comments: response.data || [] };
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

//       const response = await axios.post('https://dreamskin-server-tzka.onrender.com/comments', {
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

//       const response = await axios.post(`https://dreamskin-server-tzka.onrender.com/products/${productId}/like`, {
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

//   const handleLoadMore = () => {
//     if (hasMoreProducts) {
//       setCurrentPage(prevPage => prevPage + 1);
//     }
//   };

//   return (
//     <div className='trending-content'>
//       <div className='trending-banner'>
//         <img src="assets/trendingBannerImg.png" alt="Banner" />
//       </div>

//       <div className='trending-trending'>
//         <h3 className='trending-trending-heading'>Trending</h3>
//         <div className='trending-trending-products'>
//           {topProducts.cleanser && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.cleanser.name}</span>
//               <img src={topProducts.cleanser.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.moisturizer && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.moisturizer.name}</span>
//               <img src={topProducts.moisturizer.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.sunscreen && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.sunscreen.name}</span>
//               <img src={topProducts.sunscreen.imageUrl} style={{ width: '200px', height: '200px' }} />
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className='trending-products-content'>
//         {products.map(product => (
//           <div className='trending-products-card' key={product.id}>
//             <div className='trending-products-upvote' onClick={() => handleUpvote(product.id)}>
//               <i className={`fa-regular fa-heart ${product.likes > 0 ? 'liked' : ''}`}></i>
//               <span>{product.likes}</span>
//             </div>

//             <div className='trending-product-details'>
//               <div className='trending-product-details-image'>
//                 <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               </div>
//               <div className='trending-product-details-text'>
//                 <h3 className='trending-product-text'>{product.name}</h3>
//                 <h4 className='trending-product-text'>{product.brand}</h4>
//                 <p>{product.category}</p>
//               </div>
//             </div>

//             <div className='trending-products-review'>
//               <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className='trending-pagination'>
//         {hasMoreProducts ? (
//           <button
//             onClick={handleLoadMore}
//             disabled={loading}
//           >
//             {loading ? 'Loading...' : 'Load More'}
//           </button>
//         ) : (
//           <span>No more products</span>
//         )}
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

















// //LATEST VERSION OF THE CODE WITH THE NEW UPDATES 
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import CommentModal from '../CommentModal/CommentModal';
// import './Trying.css';
// import { jwtDecode } from 'jwt-decode';
// import { useToken } from '../../context/TokenContext';

// function Trying() {
//   const [showModal, setShowModal] = useState(false);
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const { tokenContext, setTokenContext } = useToken();
//   const [addComment, setAddComment] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [topProducts, setTopProducts] = useState({
//     cleanser: null,
//     moisturizer: null,
//     sunscreen: null,
//   });
//   const [hasMoreProducts, setHasMoreProducts] = useState(true); // Track if there are more products

//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           setTokenContext(token);
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
//   }, [setTokenContext]);

//   useEffect(() => {
//     const fetchTopProducts = async () => {
//       try {
//         const [cleanserResponse, moisturizerResponse, sunscreenResponse] = await Promise.all([
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'cleanser', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'moisturizer', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products', { params: { category: 'sunscreen', sort: 'likes' } }),
//         ]);

//         const getTopProduct = (response) => response.data.products[0] || null;

//         setTopProducts({
//           cleanser: getTopProduct(cleanserResponse),
//           moisturizer: getTopProduct(moisturizerResponse),
//           sunscreen: getTopProduct(sunscreenResponse),
//         });
//       } catch (error) {
//         console.error('Error fetching top products:', error);
//       }
//     };

//     fetchTopProducts();
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
//           params: {
//             sort: 'likes',
//             page: currentPage,
//             pageSize: 4,
//           },
//         });

//         const { products: fetchedProducts, pagination } = response.data;

//         // Check if there are new products
//         const likedProducts = fetchedProducts.filter(product => product.likes > 0);

//         setProducts(prevProducts => {
//           const existingIds = new Set(prevProducts.map(product => product.id));
//           const newProducts = likedProducts.filter(product => !existingIds.has(product.id));
//           return [...prevProducts, ...newProducts];
//         });

//         // Update pagination state
//         setTotalPages(pagination.totalPages);

//         // Determine if there are more products to load
//         const isLastPage = pagination.currentPage >= pagination.totalPages;
//         const hasProductsToLoad = likedProducts.length >= 4; // Check if fetched products meet page size
//         setHasMoreProducts(!isLastPage && hasProductsToLoad);

//         // Debugging output
//         console.log(`Current Page: ${currentPage}, Total Pages: ${pagination.totalPages}`);
//         console.log('Has More Products:', !isLastPage && hasProductsToLoad);

//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [currentPage, setTokenContext]);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async (product) => {
//           const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/comments/product/${product.id}`);
//           return { ...product, comments: response.data || [] };
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

//       const response = await axios.post('https://dreamskin-server-tzka.onrender.com/comments', {
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

//       const response = await axios.post(`https://dreamskin-server-tzka.onrender.com/products/${productId}/like`, {
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

//   const handleLoadMore = () => {
//     if (hasMoreProducts) {
//       setCurrentPage(prevPage => prevPage + 1);
//     }
//   };

//   return (
//     <div className='trending-content'>
//       <div className='trending-banner'>
//         <img src="assets/trendingBannerImg.png" alt="Banner" />
//       </div>

//       <div className='trending-trending'>
//         <h3 className='trending-trending-heading'>Trending</h3>
//         <div className='trending-trending-products'>
//           {topProducts.cleanser && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.cleanser.name}</span>
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.moisturizer && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.moisturizer.name}</span>
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.sunscreen && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.sunscreen.name}</span>
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className='trending-products-content'>
//         {products.map(product => (
//           <div className='trending-products-card' key={product.id}>
//             <div className='trending-products-upvote' onClick={() => handleUpvote(product.id)}>
//               <i className={`fa-regular fa-heart ${product.likes > 0 ? 'liked' : ''}`}></i>
//               <span>{product.likes}</span>
//             </div>

//             <div className='trending-product-details'>
//               <div className='trending-product-details-image'>
//                 <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               </div>
//               <div className='trending-product-details-text'>
//                 <h3 className='trending-product-text'>{product.name}</h3>
//                 <h4 className='trending-product-text'>{product.brand}</h4>
//                 <p>{product.category}</p>
//               </div>
//             </div>

//             <div className='trending-products-review'>
//               <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className='trending-pagination'>
//         {hasMoreProducts ? (
//           <button
//             onClick={handleLoadMore}
//             disabled={loading}
//           >
//             {loading ? 'Loading...' : 'Load More'}
//           </button>
//         ) : (
//           <span>No more products</span>
//         )}
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





//MAIN VERSION OF THE CODE WORKS JUST FINE
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import CommentModal from '../CommentModal/CommentModal';
// import './Trying.css';
// import { jwtDecode } from 'jwt-decode';
// import { useToken } from '../../context/TokenContext';

// function Trying() {
//   const [showModal, setShowModal] = useState(false);
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [userId, setUserId] = useState(null);
//   const { tokenContext, setTokenContext } = useToken();
//   const [addComment, setAddComment] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(5);
//   const [loading, setLoading] = useState(false);
//   const [topProducts, setTopProducts] = useState({
//     cleanser: null,
//     moisturizer: null,
//     sunscreen: null,
//   });

//   useEffect(() => {
//     const fetchAuthToken = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           setTokenContext(token);
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
//       setLoading(true);
//       try {
//         // Fetch the most liked products by category
//         const [cleanserResponse, moisturizerResponse, sunscreenResponse] = await Promise.all([
//           axios.get('https://dreamskin-server-tzka.onrender.com/products?category=cleanser&sort=likes'),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products?category=moisturizer&sort=likes'),
//           axios.get('https://dreamskin-server-tzka.onrender.com/products?category=sunscreen&sort=likes'),
//         ]);

//         // Extract the most liked product from each response
//         const getTopProduct = (response) => response.data.products[0] || null;

//         setTopProducts({
//           cleanser: getTopProduct(cleanserResponse),
//           moisturizer: getTopProduct(moisturizerResponse),
//           sunscreen: getTopProduct(sunscreenResponse),
//         });

//         // Fetch the most liked products for pagination
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
//           params: {
//             sort: 'likes',
//             page: currentPage,
//             pageSize: 10,
//           }
//         });

//         const fetchedProducts = response.data?.products || [];
//         const totalPages = response.data?.totalPages || 10;

//         setProducts(prevProducts => {
//           const existingIds = new Set(prevProducts.map(product => product.id));
//           const newProducts = fetchedProducts.filter(product => !existingIds.has(product.id));
//           return [...prevProducts, ...newProducts];
//         });
//         setTotalPages(totalPages);
//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMostLikedProducts();
//   }, [currentPage]);

//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const productPromises = products.map(async (product) => {
//           const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/comments/product/${product.id}`);
//           return { ...product, comments: response.data || [] };
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

//       const response = await axios.post('https://dreamskin-server-tzka.onrender.com/comments', {
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

//       const response = await axios.post(`https://dreamskin-server-tzka.onrender.com/products/${productId}/like`, {
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

//   const handleLoadMore = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(prevPage => prevPage + 1);
//     }
//   };

//   return (
//     <div className='trending-content'>
//       <div className='trending-banner'>
//         <img src="assets/trendingBannerImg.png" alt="Banner" />
//       </div>

//       <div className='trending-trending'>
//         <h3 className='trending-trending-heading'>Trending</h3>
//         <div className='trending-trending-products'>
//           {topProducts.cleanser && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.cleanser.name}</span>
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.moisturizer && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.moisturizer.name}</span>
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//           {topProducts.sunscreen && (
//             <div className='trending-trending-product'>
//               <span>{topProducts.sunscreen.name}</span>
//               <i className="fa-solid fa-arrow-trend-up"></i>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className='trending-products-content'>
//         {products.map(product => (
//           <div className='trending-products-card' key={product.id}>
//             <div className='trending-products-upvote' onClick={() => handleUpvote(product.id)}>
//               <i className="fa-regular fa-heart"></i>
//               <span>{product.likes}</span>
//             </div>

//             <div className='trending-product-details'>
//               <div className='trending-product-details-image'>
//                 <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               </div>
//               <div className='trending-product-details-text'>
//                 <h3 className='trending-product-text'>{product.name}</h3>
//                 <h4 className='trending-product-text'>{product.brand}</h4>
//                 <p>{product.category}</p>
//               </div>
//             </div>

//             <div className='trending-products-review'>
//               <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className='trending-pagination'>
//         <button
//           onClick={handleLoadMore}
//           disabled={loading || currentPage >= totalPages}
//         >
//           {loading ? 'Loading...' : currentPage >= totalPages ? 'No more products' : 'Load More'}
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

