import React from "react";
import "./RoutinePage.css";
import NavBar from '../NavBar/NavBar';
import ProductsList from '../ProductsList/ProductsList';

const RoutinePage = () => {
    return (
        <div className="RoutinePage">
            <h1>Routine</h1>
            <img className="banner-image" src="src/assets/placeholder.jpg" alt="Banner image" />
            <ProductsList />
        </div>
    )

}

export default RoutinePage;