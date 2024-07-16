import React from "react";
import "./ProductsList.css";
import Product from "../Product/Product"

const ProductsList = () => {
    return (
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
    )
}


export default ProductsList;