import React from "react";
import { useState, useEffect } from "react";
import Modal from '../Modal/Modal';
import "./Product.css";

const Product = ({ product_id, name, brand, price, liked, imageUrl, ingredients, description}) => {
    const [activeModal, setActiveModal] = useState(false);

    const handleClick = () => {
        setActiveModal(true);
        console.log("open modal");
    }
    
    return (
        <div className="Product" key={product_id}>
            <img className="product-image" src={imageUrl} alt="Product image" />
            <div className="product-info">
                <h3>{name}</h3>
                <h4>{brand}</h4>
                <div className="name-price">
                    <div className="learn-likes">
                        <button className="learn-more" onClick={handleClick}>LEARN MORE</button>
                        <div>♡</div>
                    </div>
                    <p>${price}</p>              
                </div>
            </div>

            { activeModal && 
                <Modal show={activeModal} onClose={() => setActiveModal(false)}>
                    <img src={imageUrl} alt="Product image" />
                    <div>
                        <h3>{name}</h3>
                        <h4>{brand}</h4>
                        <p>${price}</p>  
                        <p>{description}</p>
                        <h4>Ingredients: </h4>
                        <div className="ingredients">
                            {ingredients.map((ingredient) => (
                                <p key={ingredient}> - {ingredient}</p>
                            ))}
                        </div>  
                    </div>
                </Modal>
            }
        </div>
    )
}

export default Product;