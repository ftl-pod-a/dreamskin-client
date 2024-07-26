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

    // Object.entries(localProducts).forEach(([key, value]) => {
    //     console.log(key, value);
    // })

    
    return (
        <div className="RoutinePage">
            <h1>Routine</h1>
            <img className="banner-image" src="src/assets/quizbanner.jpg" alt="Banner image" />
            <div className="ProductsList">
                <div className="day">
                    <h2>Day</h2>
                    <div className="day-products">
                        {hasMorningCleanser && 
                            <Product 
                                product_id={localProducts[0].id}
                                name={localProducts[0].name} 
                                brand={localProducts[0].brand} 
                                price={localProducts[0].price} 
                                liked={false}
                                imageUrl={localProducts[0].imageUrl}
                            />
                        }
                        
                        { hasMorningMoisturizer && 
                            <Product 
                                product_id={localProducts[2].id}
                                name={localProducts[2].name} 
                                brand={localProducts[2].brand} 
                                price={localProducts[2].price} 
                                liked={false}
                                imageUrl={localProducts[2].imageUrl}
                            />
                        }
                        
                        { hasSunscreen && 
                            <Product 
                                product_id={localProducts[4].id}
                                name={localProducts[4].name} 
                                brand={localProducts[4].brand} 
                                price={localProducts[4].price} 
                                liked={false}
                                imageUrl={localProducts[4].imageUrl}
                            />
                        }
                    </div>
                </div>
                <div className="night">
                    <h2>Night</h2>
                    <div className="night-products">
                        { hasNightCleanser && 
                            <Product 
                                product_id={localProducts[1].id}
                                name={localProducts[1].name} 
                                brand={localProducts[1].brand} 
                                price={localProducts[1].price} 
                                liked={false}
                                imageUrl={localProducts[1].imageUrl}
                            />
                        }

                        { hasNightMoisturizer && 
                            <Product 
                                product_id={localProducts[3].id}
                                name={localProducts[3].name} 
                                brand={localProducts[3].brand} 
                                price={localProducts[3].price} 
                                liked={false}
                                imageUrl={localProducts[3].imageUrl}
                            />
                        }
                    </div>
                </div>
            </div>
        </div>
    )

}

export default RoutinePage;