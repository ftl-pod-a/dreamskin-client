import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import _ from 'lodash'; // Import lodash for debounce
import SkinHubModal from '../SkinHubModal/SkinHubModal'; // Import SkinHubModal
import CommentModal from '../CommentModal/CommentModal'; // Import CommentModal
import './SkinHub.css';
import { jwtDecode } from 'jwt-decode';
import { useToken } from '../../context/TokenContext';
import { Link } from 'react-router-dom'; // Import Link

function SkinHub() {
  const [showSkinHubModal, setShowSkinHubModal] = useState(false); // State for SkinHubModal
  const [showCommentModal, setShowCommentModal] = useState(false); // State for CommentModal
  const [modalContent, setModalContent] = useState({}); // Content for SkinHubModal
  const [selectedProductId, setSelectedProductId] = useState(null); // Product ID for CommentModal
  const [newComment, setNewComment] = useState('');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [allProductsLoaded, setAllProductsLoaded] = useState(false);
  const [userId, setUserId] = useState(null);
  const { tokenContext, setTokenContext } = useToken();
  const [addComment, setAddComment] = useState(false);

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

  const debouncedSearch = useCallback(
    _.debounce(async (searchTerm, page) => {
      if (searchTerm.trim() === '') {
        setProducts([]);
        setTotalPages(1);
        setCurrentPage(1);
        setAllProductsLoaded(false);
        return;
      }

      try {
        const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
          params: {
            name: searchTerm,
            page,
            pageSize: 10,
          },
        });

        const fetchedProducts = response.data?.products || [];
        const totalPages = response.data?.totalPages || 1;
        const hasMoreProducts = fetchedProducts.length >= 10;

        setProducts(prevProducts => {
          const existingIds = new Set(prevProducts.map(product => product.id));
          const newProducts = fetchedProducts.filter(product => !existingIds.has(product.id));
          return [...prevProducts, ...newProducts];
        });

        setTotalPages(totalPages);
        setAllProductsLoaded(!hasMoreProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setLoading(true);
    setCurrentPage(1);
    debouncedSearch(event.target.value, 1);
  };

  const handleLoadMore = () => {
    if (!allProductsLoaded) {
      setLoading(true);
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      debouncedSearch(searchTerm, newPage);
    }
  };

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

  const handleLearnMoreClick = (product) => {
    setModalContent(product);
    setShowSkinHubModal(true);
  };

  const handleCommentIconClick = (productId) => {
    setSelectedProductId(productId);
    setShowCommentModal(true);
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
        productId: selectedProductId,
        text: newComment,
      });

      const updatedProducts = products.map(product => {
        if (product.id === selectedProductId) {
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
      await axios.delete(`https://dreamskin-server-tzka.onrender.com/comments/${commentId}`, { params: { userId } });
 
 
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
 

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const authToken = localStorage.getItem('token'); // Retrieve authToken

  return (
    <div className='skinhub-content'>
      <div className='skinhub-banner'>
        <img src="assets/skinhubBannerImg.png" alt="Image" />
      </div>

      <div className='search-container'>
        <div className='skinhub-search'>
          <input
            type="text"
            placeholder="Search by product name cerave, tatcha, aveno, etc..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <i className="fas fa-search search-icon"></i>
        </div>
      </div>

      <div className='products'>
      {filteredProducts.length === 0 && searchTerm.trim() !== '' && (
  <div className='no-products-container'>
    <img src='assets/allArticlesImgSkinhub.png' className='no-products-image' />
    <p className='no-products'>Product not found.</p>
    <p className='no-products'>Please try something else.</p>
  </div>
)}

        {filteredProducts.length > 0 && filteredProducts.map(product => (
          <div className='products-card' key={product.id}>
            <div className='product-details'>
              <h3>{product.name}</h3>
              <h4>{product.brand}</h4>
              <img src={product.imageUrl} alt={product.name}  style={{ width: 'fill-content', height: '15rem' }}/>
            </div>

            <div className='products-review'>
              <i
                className="fa-solid fa-circle-info"
                style={{ fontSize: '1.5rem', color: '#a9714b', cursor: 'pointer' }}
                onClick={() => handleLearnMoreClick(product)}
              ></i>
              <Link to={authToken ? '#' : '/register'} onClick={() => !authToken && console.log("Redirecting to register page")}>
                <i
                  className="far fa-comments"
                  style={{ fontSize: '1.5rem', color: '#a9714b' }} 
                  onClick={() => authToken && handleCommentIconClick(product.id)}
                ></i>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {searchTerm.trim() !== '' && filteredProducts.length > 0 && !allProductsLoaded && (
        <div className='pagination'>
          <button
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {showSkinHubModal && (
        <SkinHubModal
          show={showSkinHubModal}
          onClose={() => setShowSkinHubModal(false)}
        >
          <img src={modalContent.imageUrl} alt="Product image" className="modal-image" />
          <div>
            <h3>{modalContent.name}</h3>
            <h4>{modalContent.brand}</h4>
            <p>${modalContent.price}</p>
            <p>{modalContent.description}</p>
            <h4>Notable Ingredients: </h4>
            <div className="ingredients">
              {modalContent.ingredients?.map((ingredient) => (
                <p key={ingredient}> - {ingredient}</p>
              ))}
            </div>
          </div>
        </SkinHubModal>
      )}

      {showCommentModal && (
        <CommentModal
          isOpen={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          comments={products.find(product => product.id === selectedProductId)?.comments || []}
          newComment={newComment}
          setNewComment={setNewComment}
          handleSubmitComment={handleSubmitComment}
          setAddComment={setAddComment}
          loggedInUser={{id:userId}}
          handleDeleteComment={handleDeleteComment}
        />
      )}
    </div>
  );
}

export default SkinHub;










//THIS CODE WORKS IN EVERYTHING JUST TRYING TO ADD CSS
// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import _ from 'lodash'; // Import lodash for debounce
// import SkinHubModal from '../SkinHubModal/SkinHubModal'; // Import SkinHubModal
// import CommentModal from '../CommentModal/CommentModal'; // Import CommentModal
// import './SkinHub.css';
// import { jwtDecode } from 'jwt-decode';
// import { useToken } from '../../context/TokenContext';
// import { Link } from 'react-router-dom'; // Import Link

// function SkinHub() {
//   const [showSkinHubModal, setShowSkinHubModal] = useState(false); // State for SkinHubModal
//   const [showCommentModal, setShowCommentModal] = useState(false); // State for CommentModal
//   const [modalContent, setModalContent] = useState({}); // Content for SkinHubModal
//   const [selectedProductId, setSelectedProductId] = useState(null); // Product ID for CommentModal
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [allProductsLoaded, setAllProductsLoaded] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const { tokenContext, setTokenContext } = useToken();
//   const [addComment, setAddComment] = useState(false);

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

//   const debouncedSearch = useCallback(
//     _.debounce(async (searchTerm, page) => {
//       if (searchTerm.trim() === '') {
//         setProducts([]);
//         setTotalPages(1);
//         setCurrentPage(1);
//         setAllProductsLoaded(false);
//         return;
//       }

//       try {
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.comproducts', {
//           params: {
//             name: searchTerm,
//             page,
//             pageSize: 10,
//           },
//         });

//         const fetchedProducts = response.data?.products || [];
//         const totalPages = response.data?.totalPages || 1;
//         const hasMoreProducts = fetchedProducts.length >= 10;

//         setProducts(prevProducts => {
//           const existingIds = new Set(prevProducts.map(product => product.id));
//           const newProducts = fetchedProducts.filter(product => !existingIds.has(product.id));
//           return [...prevProducts, ...newProducts];
//         });

//         setTotalPages(totalPages);
//         setAllProductsLoaded(!hasMoreProducts);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching products:', error);
//         setLoading(false);
//       }
//     }, 300),
//     []
//   );

//   const handleSearchChange = (event) => {
//     setSearchTerm(event.target.value);
//     setLoading(true);
//     setCurrentPage(1);
//     debouncedSearch(event.target.value, 1);
//   };

//   const handleLoadMore = () => {
//     if (!allProductsLoaded) {
//       setLoading(true);
//       const newPage = currentPage + 1;
//       setCurrentPage(newPage);
//       debouncedSearch(searchTerm, newPage);
//     }
//   };

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

//   const handleLearnMoreClick = (product) => {
//     setModalContent(product);
//     setShowSkinHubModal(true);
//   };

//   const handleCommentIconClick = (productId) => {
//     setSelectedProductId(productId);
//     setShowCommentModal(true);
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
//         productId: selectedProductId,
//         text: newComment,
//       });

//       const updatedProducts = products.map(product => {
//         if (product.id === selectedProductId) {
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

//   const filteredProducts = products.filter(product =>
//     product.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const authToken = localStorage.getItem('token'); // Retrieve authToken

//   return (
//     <div className='skinhub-content'>
//       <div className='skinhub-banner'>
//         <img src="assets/skinhubBannerImg.png" alt="Image" />
//       </div>

//       <div className='search-container'>
//         <div className='skinhub-search'>
//           <input
//             type="text"
//             placeholder="Search by product name cerave, tatcha, aveno, etc..."
//             value={searchTerm}
//             onChange={handleSearchChange}
//           />
//           <i className="fas fa-search search-icon"></i>
//         </div>
//       </div>

//       <div className='products'>
//         {filteredProducts.length === 0 && searchTerm.trim() !== '' && (
//           <p className='no-products'>Product not found</p>
//         )}

//         {filteredProducts.length > 0 && filteredProducts.map(product => (
//           <div className='products-card' key={product.id}>
//             <div className='product-details'>
//               <h3>{product.name}</h3>
//               <h4>{product.brand}</h4>
//               <p>Price: ${product.price}</p>
//               <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               <h5>{product.category}</h5>
//               <p>{product.description}</p>
//             </div>

//             <div className='products-review'>
//               <i
//                 className="fa-solid fa-circle-info"
//                 style={{ fontSize: '24px', color: '#000', cursor: 'pointer' }}
//                 onClick={() => handleLearnMoreClick(product)}
//               ></i>
//               <Link to={authToken ? '#' : '/register'} onClick={() => !authToken && console.log("Redirecting to register page")}>
//                 <i
//                   className="far fa-comments"
//                   style={{ color: 'black' }} // Inline style to make the icon black
//                   onClick={() => authToken && handleCommentIconClick(product.id)}
//                 ></i>
//               </Link>
//             </div>
//           </div>
//         ))}
//       </div>

//       {searchTerm.trim() !== '' && filteredProducts.length > 0 && !allProductsLoaded && (
//         <div className='pagination'>
//           <button
//             onClick={handleLoadMore}
//             disabled={loading}
//           >
//             {loading ? 'Loading...' : 'Load More'}
//           </button>
//         </div>
//       )}

//       {showSkinHubModal && (
//         <SkinHubModal
//           show={showSkinHubModal}
//           onClose={() => setShowSkinHubModal(false)}
//         >
//           <img src={modalContent.imageUrl} alt="Product image" className="modal-image" />
//           <div>
//             <h3>{modalContent.name}</h3>
//             <h4>{modalContent.brand}</h4>
//             <p>${modalContent.price}</p>
//             <p>{modalContent.description}</p>
//             <h4>Notable Ingredients: </h4>
//             <div className="ingredients">
//               {modalContent.ingredients?.map((ingredient) => (
//                 <p key={ingredient}> - {ingredient}</p>
//               ))}
//             </div>
//           </div>
//         </SkinHubModal>
//       )}

//       {showCommentModal && (
//         <CommentModal
//           isOpen={showCommentModal}
//           onClose={() => setShowCommentModal(false)}
//           comments={products.find(product => product.id === selectedProductId)?.comments || []}
//           newComment={newComment}
//           setNewComment={setNewComment}
//           handleSubmitComment={handleSubmitComment}
//           setAddComment={setAddComment}
//         />
//       )}
//     </div>
//   );
// }

// export default SkinHub;

