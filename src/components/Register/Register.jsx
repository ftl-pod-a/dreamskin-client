import React, { useState, useEffect } from "react";
import "./Register.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useToken } from '../../context/TokenContext';

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const {tokenContext, setTokenContext} = useToken();

  //handle register
  const handleRegister = async () => {
    try {
      //register the user
      const response = await axios.post(
        "http://localhost:3000/users/register",
        { username, password }
      );
      //login the user
      const loginResponse = await axios.post(
        "http://localhost:3000/users/login",
        { username, password }
      );
      console.log(response);
      setTokenContext(loginResponse.data.token)

      //store the toekn in the localstorage as token
      localStorage.setItem("token", loginResponse.data.token);
      navigate("/quiz");
    } catch (error) {
      alert("Registration failed. Try again");
    }
  };

    return (
        <div className="Register">
            <div className="register">
                <img src="src/assets/login-banner.avif" alt="banner" className="register-image"/>
                <div className="info">
                    <h1>Register</h1>
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
                          Already have an account?
                          <Link to={'/login'}>
                            <button className="redirect">Log In</button>
                          </Link>
                        </div>
                        <button className="submit" onClick={handleRegister}>Create Account</button>
                        
                    </div>
                </div>
            </div> 
        </div>
    )
}

export default Register;