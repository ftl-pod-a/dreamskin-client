import React from "react";
import { useState, useEffect } from "react";
import Modal from '../Modal/Modal';
import { jwtDecode } from 'jwt-decode';
import axios from "axios";
import "./Product.css";

const Product = ({ product_id, name, brand, price, liked, imageUrl, ingredients, description}) => {
    const [activeModal, setActiveModal] = useState(false);
    const authToken = localStorage.getItem('token');
    const decodedToken = jwtDecode(authToken);
    const { userId, username } = decodedToken;
    const [like, setLiked] = useState(false);


    const handleClick = () => {
        setActiveModal(true);
        console.log("open modal");
    }

    const handleLike = async (event) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_LOCAL_HOST_URL}${product_id}/like`, {
                userId: userId,
            });
            console.log(response);
            event.target.style.color = "red";
            setLiked(true)
            console.log("liked"); 
        } catch (error) {
            console.log("Error updating likes", error);
        }
        
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
                        <div className='upvote'>
                            <i className="fa-regular fa-heart heart" onClick={(event) => handleLike(event)}></i>
                        </div>
                    </div>
                    <p>${price}</p>              
                </div>
            </div>

            { activeModal && 
                <Modal show={activeModal} onClose={() => setActiveModal(false)}>
                    <img src={imageUrl} alt="Product image" className="modal-image"/>
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