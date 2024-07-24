import React from "react";
import "./RoutinePage.css";
import Product from "../Product/Product"
import { useLocation } from 'react-router-dom';
import axios from "axios";
import { useState, useEffect } from "react";

const RoutinePage = () => {
    

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
                        <Product 
                            product_id={0} 
                            name={"Product name"} 
                            brand={"Brand name"} 
                            price={0} 
                            liked={false}
                        />
                        <Product 
                            product_id={0} 
                            name={"Product name"} 
                            brand={"Brand name"} 
                            price={0} 
                            liked={false}
                        />
                        <Product 
                            product_id={0} 
                            name={"Product name"} 
                            brand={"Brand name"} 
                            price={0} 
                            liked={false}
                        />
                    </div>
                </div>
                <div className="night">
                    <h2>Night</h2>
                    <div className="night-products">
                    <Product 
                            product_id={0} 
                            name={"Product name"} 
                            brand={"Brand name"} 
                            price={0} 
                            liked={false}
                        />
                        <Product 
                            product_id={0} 
                            name={"Product name"} 
                            brand={"Brand name"} 
                            price={0} 
                            liked={false}
                        />
                        <Product 
                            product_id={0} 
                            name={"Product name"} 
                            brand={"Brand name"} 
                            price={0} 
                            liked={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    )

}

export default RoutinePage;