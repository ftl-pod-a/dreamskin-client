import React from 'react';
import './SideNavbar.css';

  const SideNavbar = ({ activeCategory, setActiveCategory}) => {
  const categories = ["All", "Cleanser", "Moisturizer", "Sunscreen", "Dry Skin", "Oily Skin", "Combination Skin"];

  return (
    <nav className="SubNavbar">
      <div className="content">
        <div className="column">
          <ul className="category-menu">
            {categories.map((cat) => (
              <li className={activeCategory === cat ? "is-active" : ""} key={cat}>
                <button onClick={() => setActiveCategory(cat)}>{cat}</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default SideNavbar;


