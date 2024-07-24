import React, { useState, useEffect } from "react";
import "./LoginPage.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

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
            console.log("Response", response.data);
            //localStorage.setItem('authToken', response.data.token);
            //navigate("/routine");
            //window.location.reload();
        }
        catch (error){
            console.log("Error logging in", error);
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
                    <button className="submit" onClick={handleSubmit}>Create Account</button>
                    
                </div>
            </div>
        </div>
    )
}


export default LoginPage;