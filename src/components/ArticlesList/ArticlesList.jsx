import React from 'react';
import './ArticlesList.css'

const ArticlesList = ({ articles }) => {
  return (
    <div className="article-list"> 
      {articles.map(article => (
        <div key={article.articleId} className="article">
          <div className='article-heading'>
            <p>{article.articleTitle}</p>
          </div>
          <div className='article-link'>
            <a href={article.articleUrl} target="_blank" rel="noopener noreferrer">
              <i className="fa-solid fa-up-right-from-square"></i>
            </a>
          </div>
        </div>
      ))}
    </div>
  )
};

export default ArticlesList;
