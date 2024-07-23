import React from 'react';
import './ArticlesList.css'

const ArticlesList = ({ articles }) => {
  return (
    <div className="article-list">
        
      {articles.map(article => (
        
        <div key={article.articleId} className="article">
         
          <a href={article.articleUrl} target="_blank" rel="noopener noreferrer">{article.articleTitle}</a>
        </div>
      ))}
    </div>
  );
};

export default ArticlesList;
