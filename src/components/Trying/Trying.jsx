import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentModal from '../CommentModal/CommentModal';
import TryingModal from '../TryingModal/TryingModal'; // Modal for detailed product info
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
  const [activeModal, setActiveModal] = useState(null); // State for the product details modal

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
          axios.get('http://localhost:3000/products', { params: { category: 'cleanser', sort: 'likes' } }),
          axios.get('http://localhost:3000/products', { params: { category: 'moisturizer', sort: 'likes' } }),
          axios.get('http://localhost:3000/products', { params: { category: 'sunscreen', sort: 'likes' } }),
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
        const response = await axios.get('http://localhost:3000/products', {
          params: {
            sort: 'likes',
            page: currentPage,
            pageSize: 10,
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
          const response = await axios.get(`http://localhost:3000/comments/product/${product.id}`);
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
        const response = await axios.get(`http://localhost:3000/users/${userId}`, { params: { user_id: userId } });
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

      const response = await axios.post('http://localhost:3000/comments', {
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

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:3000/comments/${commentId}`, { params: { userId } });
 
 
      // Update products state to remove the deleted comment
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === showModal
            ? { ...product, comments: product.comments.filter(comment => comment.id !== commentId) }
            : product
        )
      );
 
 
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  }
 

  const handleUpvote = async (productId) => {
    try {
      if (!userId) {
        navigate('/register');
        return;
      }

      const product = products.find(product => product.id === productId);
      const hasLiked = product ? product.liked : false;

      const response = await axios.post(`http://localhost:3000/products/${productId}/like`, {
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
              <span>Most liked {topProducts.cleanser.category}!</span>
              <span>{topProducts.cleanser.name}</span>
              <img src={topProducts.cleanser.imageUrl}  />
              <i className="fa-solid fa-arrow-trend-up"></i>
            </div>
          )}
          {topProducts.moisturizer && (
            <div className='trending-trending-product'>
              <span>Most liked {topProducts.moisturizer.category}!</span>
              <span>{topProducts.moisturizer.name}</span>
              <img src={topProducts.moisturizer.imageUrl}  />
              <i className="fa-solid fa-arrow-trend-up"></i>
            </div>
          )}
          {topProducts.sunscreen && (
            <div className='trending-trending-product'>
              <span>Most liked {topProducts.sunscreen.category}!</span>
              <span>{topProducts.sunscreen.name}</span>
              <img src={topProducts.sunscreen.imageUrl}  />
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
                <img src={product.imageUrl} alt={product.name}  style={{ width: 'fit-content', height: '200px' }}/>
              </div>
              <div className='trending-product-details-text'>
                <h3 className='trending-product-text'>{product.name}</h3>
                <h4 className='trending-product-text'>{product.brand}</h4>
                <p>{product.category}</p>
              </div>
            </div>

            <div className='trending-products-actions'>
              <div className='trending-products-actions-icons-info'>
                <i
                  className="fa-solid fa-circle-info"
                  onClick={() => setActiveModal(product)}
                  style={{ fontSize: '1.5rem', cursor: 'pointer' }}
                ></i>

              </div>
              <div className='trending-products-actions-icons-comment'>
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
          loggedInUser={{id:userId}}
          handleDeleteComment={handleDeleteComment}
        />
      )}

      {activeModal && (
        <TryingModal
          show={!!activeModal}
          onClose={() => setActiveModal(null)}
        >
          <img src={activeModal.imageUrl} alt="Product image" className="modal-image"/>
          <div>
            <h3>{activeModal.name}</h3>
            <h4>{activeModal.brand}</h4>
            <p>${activeModal.price}</p>  
            <p>{activeModal.description}</p>
            <h4>Notable Ingredients: </h4>
            <div className="ingredients">
              {activeModal.ingredients.map((ingredient) => (
                <p key={ingredient}> - {ingredient}</p>
              ))}
            </div>  
          </div>
        </TryingModal>
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
// import { useNavigate } from 'react-router-dom';

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
//   const [likedProductIds, setLikedProductIds] = useState(new Set());

//   const navigate = useNavigate();

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
//           axios.get('https://dreamskin-server-tzka.onrender.comproducts', { params: { category: 'cleanser', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.comproducts', { params: { category: 'moisturizer', sort: 'likes' } }),
//           axios.get('https://dreamskin-server-tzka.onrender.comproducts', { params: { category: 'sunscreen', sort: 'likes' } }),
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
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.comproducts', {
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
//           const response = await axios.get(`https://dreamskin-server-tzka.onrender.comcomments/product/${product.id}`);
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

//   const getLikedProducts = async () => {
//     try {
//       if (userId) {
//         const response = await axios.get(`https://dreamskin-server-tzka.onrender.comusers/${userId}`, { params: { user_id: userId } });
//         const likedProducts = response.data.likedProducts;
//         localStorage.setItem("likedProducts", JSON.stringify(likedProducts));
//         setLikedProductIds(new Set(likedProducts.map(product => product.id)));
//       }
//     } catch (error) {
//       console.log("Error getting user", error);
//     }
//   };

//   useEffect(() => {
//     if (userId) {
//       getLikedProducts();
//     }
//   }, [userId]);

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

//       const response = await axios.post('https://dreamskin-server-tzka.onrender.comcomments', {
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
//         navigate('/register');
//         return;
//       }

//       const product = products.find(product => product.id === productId);
//       const hasLiked = product ? product.liked : false;

//       const response = await axios.post(`https://dreamskin-server-tzka.onrender.comproducts/${productId}/like`, {
//         userId: userId,
//       });

//       const newLikes = response.data.likes;
//       const newLikedState = !hasLiked;

//       const updatedProducts = products.map(product =>
//         product.id === productId ? { ...product, likes: newLikes, liked: newLikedState } : product
//       );

//       localStorage.setItem(`liked_${productId}`, JSON.stringify(newLikedState));

//       setProducts(updatedProducts);

//       // Update liked products state
//       if (newLikes > (product ? product.likes : 0)) {
//         setLikedProductIds(prev => new Set(prev).add(productId));
//       } else {
//         setLikedProductIds(prev => {
//           const updated = new Set(prev);
//           updated.delete(productId);
//           return updated;
//         });
//       }

//       await getLikedProducts();
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
//               className={`trending-products-upvote ${likedProductIds.has(product.id) && product.likes > (product.likes - 1) ? 'liked' : ''}`}
//               onClick={() => handleUpvote(product.id)}
//             >
//               <i className={`fa-regular fa-heart ${likedProductIds.has(product.id) ? 'liked' : ''}`}></i>
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
//                     navigate('/register');
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

