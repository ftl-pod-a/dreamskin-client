import React from 'react';
import './SideNavbar.css';

  const SideNavbar = ({ activeCategory, setActiveCategory}) => {
  const categories = ["All", "Cleanser", "Moisturizer", "Sunscreen", "Dry Skin", "Oily Skin", "Combination Skin"];

  return (
    <nav className="SideNavbar">
      <div className="SideNavbar-content">
          <ul className="category-menu">
            {categories.map((cat) => (
              <li className={activeCategory === cat ? "is-active" : ""} key={cat}>
                <a href="#" onClick={() => setActiveCategory(cat)}>{cat}</a>
              </li>
            ))}
          </ul>
      </div>
    </nav>
  );
};

export default SideNavbar;


