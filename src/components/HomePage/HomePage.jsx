
import * as React from 'react';
import './HomePage.css'
function HomePage(){
    return(
        <>
        <div className='homepage-content'>
            <div className='homepage-header'>
                <div className='header-content'>
                    <h1>Label</h1>
                    <h2>Headline</h2>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis, error autem accusantium temporibus dolorum rem vel voluptatem expedita saepe itaque minus tenetur quod perspiciatis nisi dolore perferendis nam adipisci hic?</p>
                    <button>Button</button>
                </div>
                <div className='header-image'>
                    <img src="image.jpg" alt="Image"/>
                </div>
            </div>
            <div className='homepage-numbers'>
                <div className='numbers-content'>
                    <div className='numbers-par'>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea dolor placeat, magni ipsam nesciunt cumque nihil eos fugit nam non soluta odit quibusdam unde doloremque nisi fugiat iste quasi eius!</p>
                    </div>
                    <div className='number-box'>
                        <div className='box'>
                            <i className='fas fa-comments'>Icon</i>
                            <h3 className='box-number'>Number</h3>
                        </div>
                        <div className='box'>
                            <i className='fas fa-comments'>Icon</i>
                            <h3 className='box-number'>Number</h3>
                        </div>
                        <div className='box'>
                            <i className='fas fa-comments'>Icon</i>
                            <h3 className='box-number'>Number</h3>
                        </div>
                        <div className='box'>
                            <i className='fas fa-comments'>Icon</i>
                            <h3 className='box-number'>Number</h3>
                        </div>
                    </div>
                </div>

            </div>
            <div className='homepage-quiz'>
            </div>
            <div className='homepage-about'>
            </div>
            <div className='homepage-team'>
            </div>
            <div className='homepage-faq'>
            </div>
        </div>
        </>
    );
};
export default HomePage;
