import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SideNavbar from '../SideNavbar/SideNavbar';
import ArticlesList from '../ArticlesList/ArticlesList';
import './Articles.css';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categoryDetails, setCategoryDetails] = useState({ title: "", image: "", summary: "" });
  const categoryInfo = {
    "All": { title: "All Articles", image: "path/to/all.jpg", summary: "Browse all articles." },
    "Cleanser": { title: "Cleanser", image: "path/to/cleanser.jpg", summary: "Find the best cleansers for your skin." },
    "Moisturizer": { title: "Moisturizer", image: "path/to/moisturizer.jpg", summary: "Discover top moisturizers." },
    "Sunscreen": { title: "Sunscreen", image: "path/to/sunscreen.jpg", summary: "Protect your skin with the best sunscreens." },
    "Dry Skin": { title: "Dry Skin", image: "path/to/dry_skin.jpg", summary: "Tips and products for dry skin." },
    "Oily Skin": { title: "Oily Skin", image: "path/to/oily_skin.jpg", summary: "Manage oily skin effectively." },
    "Combination Skin": { title: "Combination Skin", image: "path/to/combination_skin.jpg", summary: "Care for combination skin." }
    };


  useEffect(() => {
    const fetchArticles = async () => {
      try {
        let response;
        if (activeCategory === "All") {
          response = await axios.get("http://localhost:3000/articles");
        } else {
          response = await axios.get("http://localhost:3000/articles", {
            params: { articleCategory: activeCategory }
          });
        }
        setArticles(response.data);
      } catch (error) {
        console.error("Error fetching articles", error);
      }
    };

    

    fetchArticles();
    setCategoryDetails(categoryInfo[activeCategory]);
   
  }, [activeCategory]);

  return (
    <div className="articles-page">
      <SideNavbar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        // searchInputValue={searchInputValue}
        // handleOnSearchInputChange={handleOnSearchInputChange}
      />
      < div className='display-article'>
      <div className="category-header">
      <h1>{categoryDetails.title}</h1>
      <img src={categoryDetails.image} alt={categoryDetails.title} />
      <p>{categoryDetails.summary}</p>
      </div>
      <ArticlesList articles={articles} />
    </div>
    </div>
  );
};

export default Articles;
