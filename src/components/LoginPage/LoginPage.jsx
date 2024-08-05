// export default LoginPage;
import React, { useState } from "react";
import "./LoginPage.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useToken } from '../../context/TokenContext';
import { jwtDecode } from 'jwt-decode';
import LoadingModal from "../LoadingModal/LoadingModal";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const {tokenContext, setTokenContext} = useToken();
  const [loading, setLoading] = useState(false);

    //handle register
  const handleLogin = async () => {
    setLoading(true);
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
    } finally{
      setLoading(false);
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
        const response2 = await axios.get(`https://dreamskin-server-tzka.onrender.com/users/${userId}`, {user_id: userId});
        localStorage.setItem("likedProducts", JSON.stringify(response2.data.likedProducts));   
        console.log(response2.data.likedProducts);   
    } catch (error){
        console.log("Error getting recommendated products", error);
    }
  }

  return (
    <div className="Login">
      {loading && <LoadingModal isVisible={loading} />}
      <div className="login-container">
        <img src="/assets/profileLogo.jpg" alt="profile image" className="image"/>
        <div className="head-container">
          <h1>Login</h1>
          <p>Please login to continue</p>
        </div>

        <div className="info-container">
          <input type="text" placeholder="Username" id="username" onChange={(e) => setUsername(e.target.value)} required />
          <input type="text" placeholder="Password" id="password" value={"*".repeat(password.length)} onChange={(e) => setPassword(e.target.value)} required/>
          <button className="login-button" onClick={handleLogin}>Login</button>
          <div className="signup">
            <span>Don't have an account? </span>     
              <Link to={'/register'}>
                  <button className="redirect"> Sign Up</button>
              </Link>
            </div>
        </div>
        

      </div>
    </div>
  )
}

export default Login;