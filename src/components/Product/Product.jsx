import React from "react";
import "./Product.css";

const Product = ({ product_id, name, brand, price, liked, imageUrl}) => {
    return (
        <div className="Product" key={product_id}>
            <img className="product-image" src={imageUrl} alt="Product image" />
            <div className="product-info">
                <div className="name-price">
                    <h3>{name}</h3>
                    <p>${price}</p>
                </div>
                <p>{brand}</p>
                <div className="learn-likes">
                    <button className="learn-more">LEARN MORE</button>
                    <div>♡</div>
                </div>
            </div>
        </div>
    )
}

export default Product;