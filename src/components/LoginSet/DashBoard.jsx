import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const DashBoard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState("");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await axios.get("http://localhost:3000/protected_route", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserInfo(resp.data.user.name);
      } catch (error) {
        console.error("Error fetching resource:", error);
      }
    };

    fetchResource();
  }, []);

  const handleLogout = () => {
    console.log("Logging out");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <div>User name: {userInfo}</div>
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
};

export default DashBoard;


