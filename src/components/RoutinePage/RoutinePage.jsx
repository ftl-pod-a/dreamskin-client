import React from "react";
import "./RoutinePage.css";
import Product from "../Product/Product"
import axios from "axios";
import { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';

const RoutinePage = () => {
    const authToken = localStorage.getItem('token');
    const decodedToken = jwtDecode(authToken);
    const { userId, username } = decodedToken;
    console.log(userId, username);
    console.log(authToken);
    const localProducts = JSON.parse(localStorage.getItem('products'));
    console.log(localProducts);
    const hasSunscreen = localProducts[4];
    const hasMorningCleanser = localProducts[0];
    const hasNightCleanser = localProducts[1];
    const hasMorningMoisturizer = localProducts[2];
    const hasNightMoisturizer = localProducts[3];

    const getLikedProducts = async () => {
        try {
            const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/users/${userId}`, {user_id: userId});
            localStorage.setItem("likedProducts", JSON.stringify(response.data.likedProducts));   
        } catch (error) {
            console.log("Error getting user", error);
        }
    }

    useEffect(() =>  {
        getLikedProducts(); 
    }, []);

    return (
        <div className="RoutinePage">
            <img className="banner-image" src="assets/routineBannerImg.png" alt="Banner image" />
            <div className="ProductsList">
                <div className="day">
                    <h2>Day ☀️</h2>
                    <div className="day-products">
                        {hasMorningCleanser && 
                            <Product 
                                product_id={localProducts[0].id}
                                name={localProducts[0].name} 
                                brand={localProducts[0].brand} 
                                price={localProducts[0].price} 
                                liked={localProducts[0].likes}
                                imageUrl={localProducts[0].imageUrl}
                                ingredients={localProducts[0].ingredients}
                                description={localProducts[0].description}
                            />
                        }
                        
                        { hasMorningMoisturizer && 
                            <Product 
                                product_id={localProducts[2].id}
                                name={localProducts[2].name} 
                                brand={localProducts[2].brand} 
                                price={localProducts[2].price} 
                                liked={localProducts[2].likes}
                                imageUrl={localProducts[2].imageUrl}
                                ingredients={localProducts[2].ingredients}
                                description={localProducts[2].description}
                            />
                        }
                        
                        { hasSunscreen && 
                            <Product 
                                product_id={localProducts[4].id}
                                name={localProducts[4].name} 
                                brand={localProducts[4].brand} 
                                price={localProducts[4].price} 
                                liked={localProducts[4].likes}
                                imageUrl={localProducts[4].imageUrl}
                                ingredients={localProducts[4].ingredients}
                                description={localProducts[4].description}
                            />
                        }
                    </div>
                </div>
                <div className="night">
                    <h2>Night 🌙</h2>
                    <div className="night-products">
                        { hasNightCleanser && 
                            <Product 
                                product_id={localProducts[1].id}
                                name={localProducts[1].name} 
                                brand={localProducts[1].brand} 
                                price={localProducts[1].price} 
                                liked={localProducts[1].likes}
                                imageUrl={localProducts[1].imageUrl}
                                ingredients={localProducts[1].ingredients}
                                description={localProducts[1].description}
                            />
                        }

                        { hasNightMoisturizer && 
                            <Product 
                                product_id={localProducts[3].id}
                                name={localProducts[3].name} 
                                brand={localProducts[3].brand} 
                                price={localProducts[3].price} 
                                liked={localProducts[3].likes}
                                imageUrl={localProducts[3].imageUrl}
                                ingredients={localProducts[3].ingredients}
                                description={localProducts[3].description}
                            />
                        }
                    </div>
                </div>
            </div>
        </div>
    )

}

export default RoutinePage;