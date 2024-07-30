// export default LoginPage;
import React, { useState } from "react";
import "./LoginPage.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useToken } from '../../context/TokenContext';
import { jwtDecode } from 'jwt-decode';


const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const {tokenContext, setTokenContext} = useToken();

    //handle register
  const handleLogin = async () => {
    try {
      //login the user
      const loginResponse = await axios.post(
        "https://dreamskin-server-tzka.onrender.com/users/login",
        { username, password }
      );
      console.log(loginResponse);
      setTokenContext(loginResponse.data.token)

      //store the toekn in the localstorage as token
      localStorage.setItem("token", loginResponse.data.token);
      await getRecommendedProducts();
      navigate("/");
    } catch (error) {
        console.log(error);
      alert("Login failed. Try again");
    }
  };

    const getRecommendedProducts = async () => {
        try {
            const authToken = localStorage.getItem('token');
            const decodedToken = jwtDecode(authToken);
            const { userId, username } = decodedToken;
            console.log(userId, username);
            const response = await axios.get(`https://dreamskin-server-tzka.onrender.com/routine/${userId}`);
            localStorage.setItem('products', JSON.stringify(response.data.products));
            console.log("Response", response.data.products);
            return response.data.products;
                    //console.log("Products", response.data.products);
            
        
        } catch (error){
            console.log("Error getting recommendated products", error);
        }
    }

    return (
        <div className="Login">
            <div className="login">
                <img src="src/assets/login-banner.avif" alt="banner" className="register-image"/>
                <div className="info">
                    <h1>Log In</h1>
                    <div className="input-container">
                        <div>
                            <label htmlFor="username">Username: </label>
                            <input type="text" placeholder="Username" id="username" onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor="password">Password: </label>
                            <input type="text" placeholder="Password" id="password" value={"*".repeat(password.length)} onChange={(e) => setPassword(e.target.value)} required/>
                        </div>
                        <div className="signup">
                          Don't have an account?
                          <Link to={'/register'}>
                            <button className="redirect">Sign Up</button>
                          </Link>
                        </div>
                        <button className="submit" onClick={handleLogin}>Log In</button>
                        
                    </div>
                </div>
            </div> 
        </div>
    )
}

export default Login;