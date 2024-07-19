import React, { useState } from 'react';
import {Link} from 'react-router-dom';
import LoginButton from '../LoginButton/LoginButton';
// import LoginModal from '../LoginSet/LoginModal';
import '@fontsource-variable/dm-sans'
import './NavBar.css'


const NavBar = () => {

    const[loggedIn, setLoggedIn] = useState(false);
    const handleLogout = () => {
        setLoggedIn(false);
      };
    return (
        <>
        <nav className="navbar">
            <div className="content">
                <div className='logo-content'>
                    <img src="src/assets/minimalisticLogo.png" alt="logo" className="logo"/>
                </div>
                <div className='nav-content'>
                    <div className='tabs'>
                        <a href="home">Home</a>
                        <a href="skinhub">SkinHUB</a>
                        <a href="education">Education</a>
                    </div>
                    <div className='buttons'>
                        {loggedIn ? (
                            <div className='profile' onClick={toggleDropdown}>
                                <img src = "src/assets/placeholder.jpg" alt="profile" className='profile-icon'/>
                                {showDropdown && (
                                    <div className="dropdown-content">
                                        <Link to="/profile">Profile</Link>
                                        <button onClick={handleLogout}>Log Out</button>
                                    </div>
                                )}
                                </div>
                        ) : (
                        <LoginButton/>
                        )}
                    </div>
                </div>
            </div>
        </nav>
        </>


    );
    
  };

export default NavBar;

