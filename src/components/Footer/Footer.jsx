import React from "react";
import './Footer.css';
import '@fontsource-variable/dm-sans';


const Footer = () => {
    return(
        <div className="footer">
            <div className="footer-content">
                <h3>Copyright © dreamskin 2024</h3>
            </div>
            <div className="footer-tags">
                <a href="home">Home</a>
                <a href="skinhub">SkinHUB</a>
                <a href="article">Education</a>
            </div>
        </div>

    )
}
export default Footer;