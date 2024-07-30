import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import _ from 'lodash'; // Import lodash for debounce
import './SkinHub.css';

function SkinHub() {
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false); // State for loading feedback

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
        const response = await axios.get('https://dreamskin-server-tzka.onrender.com/products', {
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

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {filteredProducts.map(product => (
          <div className='products-card' key={product.id}>

            <div className='product-details'>
              <h3>{product.name}</h3>
              <h4>{product.brand}</h4>
         
              <p>Price: ${product.price}</p>
              <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
              <h5>{product.category}</h5>
              <p>{product.description}</p>
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

    </div>
  );
}

export default SkinHub;
