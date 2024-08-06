import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import Modal from '../Modal/Modal';
import { jwtDecode } from 'jwt-decode';
import axios from "axios";
import "./Product.css";

const Product = ({ product_id, name, brand, price, liked, imageUrl, ingredients, description}) => {
    const [activeModal, setActiveModal] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [conversationId, setConversationId] = useState(null);
    let likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];
    let userInfo = JSON.parse(localStorage.getItem('user'))
    const authToken = localStorage.getItem('token');
    const decodedToken = jwtDecode(authToken);
    const { userId, username } = decodedToken;
    const [like, setLiked] = useState(likedProducts.some((product) => product.id == product_id) ? "red" : "black");

    const handleClick = () => {
        setActiveModal(true);
        
    }

    const getLikedProducts = async (params = {}) => {
        try {
            const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/users/${userId}`, {user_id: userId});
            localStorage.setItem("likedProducts", JSON.stringify(response.data.likedProducts));
            likedProducts = JSON.parse(localStorage.getItem('likedProducts'));
            localStorage.setItem("user", JSON.stringify(response.data));  
            userInfo = JSON.parse(localStorage.getItem('user'));
            //console.log(userInfo.concerns.split(","));
            
        } catch (error) {
            console.log("Error getting liked products", error);
        }
    }

    const handleSubmit = async (e) => {
        try {
          const res = await axios.post("https://dreamskin-server-tzka.onrender.com/api/chat/bot", {
            prompt,
            conversationId,
          });

          const botMessage = { role: "bot", content: res.data.response };
          setPrompt("");
          setResponse(botMessage.content);
          setConversationId(res.data.conversationId);

        } catch (error) {
          console.error("Error:", error);
        }
    };


    const questionSelected = async (e) => {
        let newPrompt = e.target.textContent;
        if (newPrompt.includes("this product")){
            newPrompt = newPrompt.replace("product", name);
        }
        newPrompt = newPrompt.replace("?", "");
        setPrompt(newPrompt);
    }

    useEffect(() =>  {
        getLikedProducts(); 
    }, [like]);

    const handleLike = async () => {
        try {
            const response = await axios.post(`https://dreamskin-server-tzka.onrender.com/products/${product_id}/like`, {
                userId: userId,
            });
            const response1 = await axios.get(`https://dreamskin-server-tzka.onrender.com/users/${userId}`, {user_id: userId});
            

            if (response1.data.likedProducts.some((product) => product.id == product_id)) setLiked("red");
            else setLiked("black");
            
            
        } catch (error) {
            
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
                    <div className="product-chat">
                        <h4>Ask me questions about {name}</h4>
                        <div className="possible-questions">
                            <p className="question" onClick={(e) => questionSelected(e)}>? How does this product help with {userInfo.concerns.split(",")[0]}</p>
                            <p className="question" onClick={(e) => questionSelected(e)}>? How does {ingredients[1].toLowerCase()} help with {userInfo.concerns.split(",")[0].toLowerCase()}</p>
                            <p className="question" onClick={(e) => questionSelected(e)}>? How does {ingredients[2].toLowerCase()} help with {userInfo.concerns.split(",")[0].toLowerCase()}</p>
                        </div>
                        <p className="response">{response}</p>
                        
                        <div className="input-container">
                        <input type="text" placeholder="Ask me about skincare" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                        <button onClick={handleSubmit} className="submit-prompt">
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                    </div>
                </Modal>
            }
        </div>
    )
}

export default Product;