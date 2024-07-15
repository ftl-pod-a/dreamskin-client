import * as React from 'react';
import './NavBar.css'


function NavBar() {
    return (
        <>
        <nav className="navbar">
            <div className= "content">
                <div className='logo-content'>
                    <img src="logo.png" alt="logo" className="logo"/>
                </div>
                <div className='nav-content'>
                    <div className='tabs'>
                        <a href="home">Home</a>
                        <a href="skinhub">SkinHUB</a>
                        <a href="education">Education</a>
                    </div>
                    <div className='buttons'>
                        <button>Sign In</button>
                        <button>Log In</button>
                    </div>
                    <div className='profile'>
                        <img src="profile.png" alt="Proflie" className="profile-icon"/>
                        <span className='profile-name'>Name</span>
                    </div>
                </div>

            </div>
        </nav>

        </>


    );
    
  };

export default NavBar;