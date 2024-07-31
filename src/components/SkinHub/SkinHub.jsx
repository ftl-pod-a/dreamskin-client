import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import _ from 'lodash'; // Import lodash for debounce
import CommentModal from '../CommentModal/CommentModal'; // Adjust the import path as needed
import './SkinHub.css';
import { jwtDecode } from 'jwt-decode';
import { useToken } from '../../context/TokenContext';
import { Link } from 'react-router-dom'; // Import Link

function SkinHub() {
  const [showModal, setShowModal] = useState(null); // Set initial value to null
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
          <p className='no-products'>Product not found</p>
        )}

        {filteredProducts.length > 0 && filteredProducts.map(product => (
          <div className='products-card' key={product.id}>
            {/* <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
              <i className="fa-regular fa-heart"></i>
              <span>{product.likes}</span>
            </div> */}

            <div className='product-details'>
              <h3>{product.name}</h3>
              <h4>{product.brand}</h4>
              <p>Price: ${product.price}</p>
              <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
              <h5>{product.category}</h5>
              <p>{product.description}</p>
            </div>

            <div className='products-review'>
              {/* Apply inline style to comment icon */}
              <Link to={authToken ? '#' : '/register'} onClick={() => !authToken && console.log("Redirecting to register page")}>
                <i
                  className="far fa-comments"
                  style={{ color: 'black' }} // Inline style to make the icon black
                  onClick={() => authToken && toggleModal(product.id)}
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

export default SkinHub;

















//THE LATEST CODE IT WORKS PERFECTLY JUST TRYING TO ADD SO THAT IT TAKES NONREGISTER USERS TO REGISTER 
// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import _ from 'lodash'; // Import lodash for debounce
// import CommentModal from '../CommentModal/CommentModal'; // Adjust the import path as needed
// import './SkinHub.css';
// import { jwtDecode } from 'jwt-decode';
// import { useToken } from '../../context/TokenContext';

// function SkinHub() {
//   const [showModal, setShowModal] = useState(null); // Set initial value to null
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
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
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
//   }, [addComment, products]);

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

//   const filteredProducts = products.filter(product =>
//     product.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

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
//             {/* <div className='products-upvote' onClick={() => handleUpvote(product.id)}>
//               <i className="fa-regular fa-heart"></i>
//               <span>{product.likes}</span>
//             </div> */}

//             <div className='product-details'>
//               <h3>{product.name}</h3>
//               <h4>{product.brand}</h4>
//               <p>Price: ${product.price}</p>
//               <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               <h5>{product.category}</h5>
//               <p>{product.description}</p>
//             </div>

//             <div className='products-review'>
//               <i className="far fa-comments" onClick={() => toggleModal(product.id)}></i>
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

// export default SkinHub;





//THIS IS THE LAST UPDATED WORKING CODE WITH THE NEW UPDATES
// import React, { useState, useCallback } from 'react';
// import axios from 'axios';
// import _ from 'lodash'; // Import lodash for debounce
// import './SkinHub.css';

// function SkinHub() {
//   const [products, setProducts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false); // State for loading feedback
//   const [allProductsLoaded, setAllProductsLoaded] = useState(false); // Flag for loading state

//   // Debounced search function
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
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
//           params: {
//             name: searchTerm,
//             page,
//             pageSize: 10, // Adjust page size as needed
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
//     }, 300), // Debounce delay of 300ms
//     []
//   );

//   // Handle search term change and trigger debounced search
//   const handleSearchChange = (event) => {
//     setSearchTerm(event.target.value);
//     setLoading(true);
//     setCurrentPage(1); // Reset current page when search term changes
//     debouncedSearch(event.target.value, 1); // Start with page 1 for new search
//   };

//   // Handle page change to load more products
//   const handleLoadMore = () => {
//     if (!allProductsLoaded) {
//       setLoading(true);
//       const newPage = currentPage + 1;
//       setCurrentPage(newPage);
//       debouncedSearch(searchTerm, newPage);
//     }
//   };

//   // Filter products based on search term
//   const filteredProducts = products.filter(product =>
//     product.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

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
//     </div>
//   );
// }

// export default SkinHub;


// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import _ from 'lodash'; // Import lodash for debounce
// import './SkinHub.css';

// function SkinHub() {
//   const [showModal, setShowModal] = useState(false);
//   const [newComment, setNewComment] = useState('');
//   const [products, setProducts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(false); // State for loading feedback

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
//         const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
//           params: {
//             name: searchTerm,
//             page,
//             pageSize: 10, // Adjust page size as needed
//           },
//         });

//         // Safeguard against unexpected response structure
//         const fetchedProducts = response.data?.products || [];
//         const totalPages = response.data?.totalPages || 10;

//         setProducts(prevProducts => {
//           // Ensure no duplicate products
//           const existingIds = new Set(prevProducts.map(product => product.id));
//           const newProducts = fetchedProducts.filter(product => !existingIds.has(product.id));
//           return [...prevProducts, ...newProducts];
//         });
//         setTotalPages(totalPages);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching products:', error);
//         setLoading(false);
//       }
//     }, 300), // Debounce delay of 300ms
//     []
//   );

//   // Handle search term change and trigger debounced search
//   const handleSearchChange = (event) => {
//     setSearchTerm(event.target.value);
//     setLoading(true);
//     debouncedSearch(event.target.value, 1); // Reset to page 1 for new search
//     setCurrentPage(1); // Reset current page when search term changes
//   };

//   // Handle page change to load more products
//   const handleLoadMore = () => {
//     if (currentPage < totalPages) {
//       setLoading(true);
//       const newPage = currentPage + 1;
//       setCurrentPage(newPage);
//       debouncedSearch(searchTerm, newPage);
//     }
//   };

//   const toggleModal = (productId) => {
//     setShowModal(productId);
//   };

//   // Filter products based on search term
//   const filteredProducts = products.filter(product =>
//     product.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

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
//         {filteredProducts.map(product => (
//           <div className='products-card' key={product.id}>

//             <div className='product-details'>
//               <h3>{product.name}</h3>
//               <h4>{product.brand}</h4>
         
//               <p>Price: ${product.price}</p>
//               <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
//               <h5>{product.category}</h5>
//               <p>{product.description}</p>
//             </div>

//           </div>
//         ))}
//       </div>

//       <div className='pagination'>
//         <button
//           onClick={handleLoadMore}
//           disabled={loading || currentPage >= totalPages}
//         >
//           {loading ? 'Loading...' : currentPage >= totalPages ? 'No more products' : 'Load More'}
//         </button>
//       </div>

//     </div>
//   );
// }

// export default SkinHub;
