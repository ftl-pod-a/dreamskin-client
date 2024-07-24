import React from "react";
import "./RoutinePage.css";
import Product from "../Product/Product"
import axios from "axios";
import { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';

const RoutinePage = () => {
    const authToken = localStorage.getItem('authToken');
    const decodedToken = jwtDecode(authToken);
    const { userId, username } = decodedToken;
    console.log(userId, username);
    console.log(authToken);
    const localProducts = JSON.parse(localStorage.getItem('products'));
    console.log(localProducts);
    const hasBalm = localProducts.balm;
    const hasSunscreen = localProducts.sunscreen;
    const hasMorningCleanser = localProducts.morning_cleansers;
    const hasNightCleanser = localProducts.night_cleansers;
    const hasMorningMoisturizer = localProducts.morning_moisturizers;
    const hasNightMoisturizer = localProducts.night_moisturizers;

    // Object.entries(localProducts).forEach(([key, value]) => {
    //     console.log(key, value);
    // })

    // useEffect(() => {
    // }, [])


    const quizResponsetoChat = async () => {
        try {
          console.log(response);
          let ingredientQuestion = `This user has ${response[0]} and they are dealing with ${response[1]}, they are hoping to ${response[2]}. What are the best ingredients for this user, only provide the name of ingredients in an array`;
          console.log(ingredientQuestion);
          const r = await axios.post("http://localhost:3000/api/chat", {prompt: ingredientQuestion});
          let geminiIngredients = r.data.response;
          console.log("Gemini", geminiIngredients);

        let cleanedStr = geminiIngredients.replace(/```/g, '').trim();
        console.log(cleanedStr)

        let ingredientsArray = JSON.parse(cleanedStr);
        ingredientsArray = {
            ingredients: ingredientsArray
          };
        console.log("Array", ingredientsArray);

        const generatedProduct = await getRecommendedProducts(ingredientsArray);
        console.log("Returned Response", generatedProduct);
        } catch (error) {
          console.error("Error getting ingredients", error); 
        }
    }
      
    const getRecommendedProducts = async (ingredients) => {
        try {
          const response = await axios.post("http://localhost:3000/products/products/search", ingredients);
          setProducts([response.data])
          return response.data;
        }
        catch (error){
          console.log("Error getting products", error);
        }
    }


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
                                product_id={localProducts.morning_cleansers.id}
                                name={localProducts.morning_cleansers.name} 
                                brand={localProducts.morning_cleansers.brand} 
                                price={localProducts.morning_cleansers.price} 
                                liked={false}
                                imageUrl={localProducts.morning_cleansers.imageUrl}
                            />
                        }
                        
                        { hasMorningMoisturizer && 
                            <Product 
                                product_id={localProducts.morning_moisturizers.id}
                                name={localProducts.morning_moisturizers.name} 
                                brand={localProducts.morning_moisturizers.brand} 
                                price={localProducts.morning_moisturizers.price} 
                                liked={false}
                                imageUrl={localProducts.morning_moisturizers.imageUrl}
                            />
                        }
                        
                        { hasSunscreen && 
                            <Product 
                                product_id={localProducts.sunscreen.id}
                                name={localProducts.sunscreen.name} 
                                brand={localProducts.sunscreen.brand} 
                                price={localProducts.sunscreen.price} 
                                liked={false}
                                imageUrl={localProducts.sunscreen.imageUrl}
                            />
                        }
                    </div>
                </div>
                <div className="night">
                    <h2>Night</h2>
                    <div className="night-products">
                        { hasBalm && 
                            <Product 
                                product_id={localProducts.balm.id}
                                name={localProducts.balm.name} 
                                brand={localProducts.balm.brand} 
                                price={localProducts.balm.price} 
                                liked={false}
                                imageUrl={localProducts.balm.imageUrl}
                            />
                        }

                        { hasNightCleanser && 
                            <Product 
                                product_id={localProducts.night_cleansers.id}
                                name={localProducts.night_cleansers.name} 
                                brand={localProducts.night_cleansers.brand} 
                                price={localProducts.night_cleansers.price} 
                                liked={false}
                                imageUrl={localProducts.night_cleansers.imageUrl}
                            />
                        }

                        { hasNightMoisturizer && 
                            <Product 
                                product_id={localProducts.night_moisturizers.id}
                                name={localProducts.night_moisturizers.name} 
                                brand={localProducts.night_moisturizers.brand} 
                                price={localProducts.night_moisturizers.price} 
                                liked={false}
                                imageUrl={localProducts.night_moisturizers.imageUrl}
                            />
                        }
                    </div>
                </div>
            </div>
        </div>
    )

}

export default RoutinePage;