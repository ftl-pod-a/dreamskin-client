import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SideNavbar from '../SideNavbar/SideNavbar';
import ArticlesList from '../ArticlesList/ArticlesList';
import { Link } from 'react-router-dom';
import './Articles.css';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categoryDetails, setCategoryDetails] = useState({ title: "", image: "", summary: "" });

  const categoryInfo = {
    "All": { 
        title: "All Articles", 
        image: "assets/allArticlesImg.png", 
        summary: "Whether you're looking for the perfect cleanser, moisturizer, or sunscreen, or seeking advice tailored to your specific skin type—be it dry, oily, or combination—our articles provide clear, science-backed insights." },
    "Cleanser": { 
        title: "Cleanser", 
        image: "assets/cleanserImage.png", 
        summary: "Learn about the importance of cleansing, how to properly use cleansers, and tips for avoiding common mistakes to keep your skin clean and healthy." },
    "Moisturizer": { 
        title: "Moisturizer", 
        image: "assets/moisturizerImage.png", 
        summary: "Our articles cover everything from the benefits of moisturizing to the best ingredients to look for, ensuring your skin stays nourished and balanced." },
    "Sunscreen": { 
        title: "Sunscreen", 
        image: "assets/sunscreenImage.png", 
        summary: "Learn how to apply sunscreen correctly, the importance of daily use, and tips for choosing the best sunscreen for your lifestyle and skin type." },
    "Dry Skin": { 
        title: "Dry Skin", 
        image: "assets/dryImage.png", 
        summary: "Combat dryness and achieve a smooth, supple complexion with our dry skin articles. We explore the causes of dry skin and offer practical advice on how to manage and treat it." },
    "Oily Skin": { 
        title: "Oily Skin", 
        image: "assets/oilyImage.png", 
        summary: "Manage excess oil and achieve a balanced complexion with our oily skin articles. We discuss the underlying causes of oily skin and offer strategies for controlling shine and preventing breakouts." },
    "Combination Skin": { 
        title: "Combination Skin", 
        image: "assets/combinationImage.png", 
        summary: "Navigate the complexities of combination skin with our targeted articles. We help you understand the unique challenges of having both oily and dry areas and provide tailored advice for balancing your skin." }
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
      />
      < div className='display-article'>
        <div className="category-header">
            <div className='category-title'>
                <h1>{categoryDetails.title}</h1>
            </div>
            <div className='category-body'>
                <img src={categoryDetails.image} alt={categoryDetails.title} />
                <p>{categoryDetails.summary}</p>
                <Link to="/articles-list" className="linktoArticles">Go to articles</Link>
            </div>
      </div>
      <ArticlesList articles={articles} />
    </div>
    </div>
  )
};

export default Articles;