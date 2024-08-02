import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import Modal from '../Modal/Modal';
import { jwtDecode } from 'jwt-decode';
import axios from "axios";
import "./Product.css";

const Product = ({ product_id, name, brand, price, liked, imageUrl, ingredients, description}) => {
    const [activeModal, setActiveModal] = useState(false);
    let likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];
    const authToken = localStorage.getItem('token');
    const decodedToken = jwtDecode(authToken);
    const { userId, username } = decodedToken;
    const [like, setLiked] = useState(likedProducts.some((product) => product.id == product_id) ? "red" : "black");

    const handleClick = () => {
        setActiveModal(true);
        console.log("open modal");
    }

    const getLikedProducts = async (params = {}) => {
        try {
            const response = await axios.get(`http://localhost:3000/users/${userId}`, {user_id: userId});
            localStorage.setItem("likedProducts", JSON.stringify(response.data.likedProducts));
            likedProducts = JSON.parse(localStorage.getItem('likedProducts'));
        } catch (error) {
            console.log("Error getting user", error);
        }
    }

    useEffect(() =>  {
        getLikedProducts(); 
    }, [like]);

    const handleLike = async () => {
        try {
            const response = await axios.post(`http://localhost:3000/products/${product_id}/like`, {
                userId: userId,
            });
            const response1 = await axios.get(`http://localhost:3000/users/${userId}`, {user_id: userId});
            //console.log("liked", response1.data.likedProducts);

            if (response1.data.likedProducts.some((product) => product.id == product_id)) setLiked("red");
            else setLiked("black");
            
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
                        <button className="learn-more" onClick={handleClick}>Learn More</button>
                        <div className='upvote'>
                            <i className="fa-regular fa-heart heart" style={{color: like}} onClick={(event) => handleLike(event)}></i>
                        </div>
                    </div>
                    <p>${price}</p>              
                </div>
            </div>

            { activeModal && 
                <Modal show={activeModal} onClose={() => setActiveModal(false)}>
                    <div className="image-container">
                        <img src={imageUrl} alt="Product image" className="modal-image"/>
                    </div>
                    <div>
                        <h3>{name}</h3>
                        <h4>{brand}</h4>
                        <p>${price}</p>  
                        <p>{description}</p>
                        <h4>Notable Ingredients: </h4>
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