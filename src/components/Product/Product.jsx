import React from "react";
import "./Product.css";

const Product = ({ product_id, name, brand, price, liked, imageUrl}) => {
    return (
        <div className="Product" key={product_id}>
            <img className="product-image" src={imageUrl} alt="Product image" />
            <div className="product-info">
                <h3>{name}</h3>
                <h4>{brand}</h4>
                <div className="name-price">
                    <div className="learn-likes">
                        <button className="learn-more">LEARN MORE</button>
                        <div>♡</div>
                    </div>
                    <p>${price}</p>              
                </div>
                
            </div>
        </div>
    )
}

export default Product;