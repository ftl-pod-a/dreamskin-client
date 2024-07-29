import React, { useEffect } from 'react';
import '@fontsource-variable/dm-sans';
import './NavBar.css';
import { Link, useNavigate } from "react-router-dom";
import { useToken } from '../../context/TokenContext';

const NavBar = () => {
    const { tokenContext, setTokenContext } = useToken();
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('token');
        setTokenContext(authToken)
    }, [tokenContext]);

    const handleLogout = () => {
        localStorage.clear();
        setTokenContext("");
        navigate("/");
    }

    return (
        <nav className="navbar">
            <div className="content">
                <div className="logo-content">
                    <img src="src/assets/minimalisticLogoUpdated.png" alt="logo" className="logo" />
                </div>
                <input type="checkbox" id="menu-toggle" className="menu-toggle" />
                <label htmlFor="menu-toggle" className="menu-icon">
                    <div className="hamburger"></div>
                </label>
                <div className="nav-content">
                    <div className="tabs">
                        <Link to={'/'}>
                            <div>Home</div>
                        </Link>
                        {tokenContext &&
                            <Link to={'/routine'}>
                                <div>Routine</div>
                            </Link>
                        }
                        <Link to={'/skinhub'}>
                            <div>SkinHUB</div>
                        </Link>
                        <Link to={'/trending'}>
                            <div>Trending</div>
                        </Link>
                        <Link to={'/article'}>
                            <div>Education</div>
                        </Link>
                    </div>
                    <div className="buttons">
                        {!tokenContext &&
                            <div>
                                <Link to={'/register'}>
                                    <button>Log in</button>
                                </Link>
                            </div>
                        }
                        {tokenContext &&
                            <div className="logged-in">
                                <img src="src/assets/quizicon.jpg" alt="user logo" className="user-image" />
                                <button className="logout" onClick={handleLogout}>Log Out</button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;