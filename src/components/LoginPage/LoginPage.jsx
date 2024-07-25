import React, { useState, useEffect } from "react";
import "./LoginPage.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!username || !password) {
            alert("Please fill out all required fields.");
            return;
        }

        const newUser = {
            username,
            password
        }

        try {
            const response = await axios.post("http://localhost:3000/users/login", newUser);
            console.log("Gotten routine", response.data);
            if (response.data.token) {
                console.log("yes");
                localStorage.setItem('authToken', response.data.token);
                let routine = await getRecommendedProducts();
                console.log(routine);
                localStorage.setItem('products', JSON.stringify(routine));
                console.log(routine);
                navigate("/routine");
            }
        }
        catch (error){
            console.log("Error logging in", error);
            alert("Incorrect username and/or password")
        }
    }

    const getRecommendedProducts = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const decodedToken = jwtDecode(authToken);
            const { userId, username } = decodedToken;
            console.log(userId, username);
            const response = await axios.get(`http://localhost:3000/routine/${userId}`);
            console.log("Response", response.data.products);
            return response.data.products;
            //console.log("Products", response.data.products);
            //localStorage.setItem('products', JSON.stringify(response.data.products));

        } catch (error){
            console.log("Error getting recommendated products", error);
        }
    }

    return (
        <div className="LoginPage">
            <img src="src/assets/placeholder.jpg" alt="banner"/>
            <div className="info">
                <h1>Login Page</h1>
                <div className="container">
                    <div>
                        <label htmlFor="username">Username: </label>
                        <input type="text" placeholder="Enter a username" id="username" value={username} onChange={(event) => setUsername(event.target.value)} required/>
                    </div>
                    <div>
                        <label htmlFor="password">Password: </label>
                        <input type="text" placeholder="Enter a password" id="password" value={password} onChange={(event) => setPassword(event.target.value)} required/>
                    </div>
                    <button className="submit" onClick={handleSubmit}>Login</button>
                    
                </div>
            </div>
        </div>
    )
}


export default LoginPage;