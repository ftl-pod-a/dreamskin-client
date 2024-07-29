import React from "react";
import './Footer.css';
import '@fontsource-variable/dm-sans';

const Footer = () => {
    return(
        <div className="footer">
            <div className="footer-tags">
                <a href="home">Home</a>
                <a href="skinhub">SkinHUB</a>
                <a href="article">Education</a>
            </div>
            <div className="footer-logo">
                <img src="src/assets/minimalisticLogoWhiteVersion-2.png" alt="logo" className="footer-logo" />
            </div>
            <div className="footer-content">
                <p>Copyright © dreamskin 2024</p>
            </div>
        </div>
    )
}

export default Footer;