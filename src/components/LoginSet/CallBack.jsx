import React, { useEffect } from "react";
import queryString from "query-string";

const CallBack = () => {
  useEffect(() => {
    const urlParams = queryString.parse(window.location.search);
    const token = urlParams.token;
    console.log("Token from URL:", token); // Debugging log

    if (token) {
      localStorage.setItem("token", token);
      console.log("Token stored in localStorage"); // Debugging log
      window.location.href = "/dashboard"; // Redirect to dashboard after successful login
    } else {
      console.log("No token found, redirecting to login"); // Debugging log
      window.location.href = "/login"; // Redirect to login if no token found
    }
  }, []);

  return <div>Loading...</div>;
};

export default CallBack;


