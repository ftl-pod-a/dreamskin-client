import React, { useState, useEffect } from 'react';
import './ScrollToTop.css'

const ScrollToTop = () => { 
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => { 
    const scrolled = document.documentElement.scrollTop; 
    if (scrolled > 300) { 
      setVisible(true); 
    } else { 
      setVisible(false); 
    } 
  };

  const scrollToTop = () => { 
    window.scrollTo({ 
      top: 0,  
      behavior: 'smooth'
    }); 
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisible);
    return () => {
      window.removeEventListener('scroll', toggleVisible);
    };
  }, []);

  return (
    visible && (
      <button onClick={scrollToTop} className="scroll-to-top-button">
        <i className="fa-solid fa-arrow-up-long"></i>
      </button>
    )
  ); 
};

export default ScrollToTop;
