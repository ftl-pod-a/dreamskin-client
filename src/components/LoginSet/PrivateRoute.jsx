import React from "react";
import { Navigate } from "react-router-dom";
import {jwtDecode} from 'jwt-decode';

const PrivateRoute = ({ children }) => {

  const isValid = () => {
    const decodedToken = jwtDecode(token);
    console.log(decodedToken);
    // check name field for validity
    if (!decodedToken.name) {
      return false;
    }
    
    // check exp field for expiry
    const expirationTime = decodedToken.exp; // This is the exp field
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
  
    if (expirationTime < now) {
      console.log("invalid token!");
      return false;
    }
    return true;
  }
  const token = localStorage.getItem("token");
  console.log("Token in PrivateRoute is: ", token); // Debugging log
  return isValid() ? children : <Navigate to="/login" />;
};

export default PrivateRoute;