import React, { useEffect, useState } from 'react';
import '@fontsource-variable/dm-sans';
import './NavBar.css';
import { Link, useNavigate } from "react-router-dom";
import { useToken } from '../../context/TokenContext';

const NavBar = () => {
    const { tokenContext, setTokenContext } = useToken();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('/')

    useEffect(() => {
        const authToken = localStorage.getItem('token');
        setTokenContext(authToken)
    }, []); //this used to have tokenContext inside the array, which can cause an infinity loop

    const handleLogout = () => {
        localStorage.clear();
        setTokenContext("");
        navigate("/");
    }

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    }

    return (
        <nav className="navbar">
            <div className="content">
                <div className="logo-content">
                    <Link to={'/'}>
                        <img src="assets/minimalisticLogoUpdated.png" alt="logo" className="logo" />
                    </Link>
                </div>
                <input type="checkbox" id="menu-toggle" className="menu-toggle" />
                <label htmlFor="menu-toggle" className="menu-icon">
                    <div className="hamburger"></div>
                </label>
                <div className="nav-content">
                    <div className="tabs">
                        <Link to={'/'} onClick={() => handleTabClick('/')}>
                            <div className={activeTab === '/' ? 'active-tab' : ''}>Home</div>
                        </Link>
                        {tokenContext &&
                            <Link to={'/routine'} onClick={() => handleTabClick('/routine')}>
                                <div className={activeTab === '/routine' ? 'active-tab' : ''}>Routine</div>
                            </Link>
                        }
                        <Link to={'/skinhub'} onClick={() => handleTabClick('/skinhub')}>
                            <div className={activeTab === '/skinhub' ? 'active-tab' : ''}>SkinHUB</div>
                        </Link>
                        <Link to={'/trending'} onClick={() => handleTabClick('/trending')}>
                            <div className={activeTab === '/trending' ? 'active-tab' : ''}>Trending</div>
                        </Link>
                        <Link to={'/article'} onClick={() => handleTabClick('/article')}>
                            <div className={activeTab === '/article' ? 'active-tab' : ''}>Education</div>
                        </Link>


                    </div>
                    <div className="buttons">
                        {!tokenContext &&
                            <div>
                                <Link to={'/login'}>
                                    <button>Log in</button>
                                </Link>
                            </div>
                        }
                        {tokenContext &&
                            <div className="logged-in">
                                <img src="assets/quizicon.jpg" alt="user logo" className="user-image" />
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