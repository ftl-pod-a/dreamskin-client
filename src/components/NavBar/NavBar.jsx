import React, { useState, useEffect } from 'react';
import '@fontsource-variable/dm-sans'
import './NavBar.css';
import { Link } from "react-router-dom";

const NavBar = () => {
    const [token, setToken] = useState("");


    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        setToken(authToken)
        console.log(token);
    }, [token])


    const handleLogout = () => {
        localStorage.clear()
        setToken("")
    }
    return (
        <>
        <nav className="navbar">
            <div className="content">
                <div className='logo-content'>
                    <img src="src/assets/minimalisticLogo.png" alt="logo" className="logo"/>
                </div>
                <div className='nav-content'>
                    <div className='tabs'>
                        <Link to={'/'}>
                            <div>Home</div>
                        </Link>
                        <Link to={'/skinhub'}>
                            <div>SkinHUB</div>
                        </Link>
                        <Link to={'/article'}>
                            <div>Education</div>
                        </Link> 
                    </div>
                    <div className='buttons'>
                        { !token && 
                            <div>
                                <Link to={'/signup'}>
                                    <button>Sign Up</button>
                                </Link>
                                <Link to={'/login'}>
                                    <button>Login</button>
                                </Link>
                            </div>
                            
                        }
                        { token && 
                            <div className='logged-in'>
                                <img src="src/assets/quizicon.jpg" alt="user logo" className="user-image" />
                                <button className="logout" onClick={handleLogout}>Log Out</button>
                            </div>
                            
                        }
                    </div>
                </div>
            </div>
        </nav>
        </>


    );
    
  };

export default NavBar;

