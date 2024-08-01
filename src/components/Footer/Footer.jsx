import React from "react";
import './Footer.css';
import '@fontsource-variable/dm-sans';

const Footer = () => {
    return(
        <div className="footer">
            <div className="footer-tags">
                <a href="home">Home</a>
                <a href="skinhub">SkinHUB</a>
                <a href="trending">Trending</a>
                <a href="article">Education</a>
            </div>
            <div className="footer-logo">
                <img src="assets/minimalisticLogoWhiteVersion-2.png" alt="logo" className="footer-logo" />
            </div>
            <div className="footer-content">
                <p className="copyright">Copyright © dreamskin 2024</p>
                <p className="powered">Powered by Gemini</p>
            </div>
        </div>
    )
}

export default Footer;