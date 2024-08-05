import React, { useState, useEffect } from "react";
import "./Register.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useToken } from '../../context/TokenContext';
import LoadingModal from "../LoadingModal/LoadingModal";

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [checkPassword, setCheckPassword] = useState(false);
    const [samePassword, setSamePassword] = useState(false);
    const {tokenContext, setTokenContext} = useToken();
    const [memo, setMemo] = useState("Please register to continue");
    const [memoColor, setMemoColor] = useState("black");
    const [loading, setLoading] = useState(false);

  //handle register
  const handleRegister = async () => {
    
    if (!samePassword){
      return;
    }
    setLoading(true);

    try {
      //register the user
      const response = await axios.post(
        "https://dreamskin-server-tzka.onrender.com/users/register",
        { username, password }
      );
      //login the user
      const loginResponse = await axios.post(
        "https://dreamskin-server-tzka.onrender.com/users/login",
        { username, password }
      );
      
      setTokenContext(loginResponse.data.token)

      //store the toekn in the localstorage as token
      localStorage.setItem("token", loginResponse.data.token);
      navigate("/quiz");
    } catch (error) {
      alert("Registration failed. Try again");
    } finally {
      setLoading(false);
    }
  };

  const confirmPassword = (e) => {
    setCheckPassword(e.target.value)
    if (e.target.value != password){
      setMemo("Password typed in does not match")
      setMemoColor("red")
    } 
    else {
      setMemo("Please register to continue");
      setMemoColor("black")
      setSamePassword(true);
    }
  }

  return (
    <div className="Register">
      {loading && <LoadingModal isVisible={loading} />}
      <div className="register-container">
        <img src="/assets/profileLogo.jpg" alt="profile image" className="image"/>

        <div className="head-container">
          <h1>Register</h1>
          <p className="memo" style={{color: memoColor}}>{memo}</p>
        </div>

        <div className="info-container">
          <input type="text" placeholder="Username" id="username" onChange={(e) => setUsername(e.target.value)} required />
          <input type="text" placeholder="Password" id="password" value={"*".repeat(password.length)} onChange={(e) => setPassword(e.target.value)} required/>
          <input placeholder="Confirm Password" id="check-password" value={"*".repeat(checkPassword.length)} onChange={(e) => confirmPassword(e)} required/>
          <button className="register-button" onClick={handleRegister}>Create Account</button>
          <div className="signup">
            <span>Already have an account? </span>     
              <Link to={'/login'}>
                  <button className="redirect">Login</button>
              </Link>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Register;