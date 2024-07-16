
import { useState } from 'react';
import * as React from 'react';
import './HomePage.css';

function HomePage(){

    const [faqs, setFaqs] = useState([
        { question: 'Question 1?', answer: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium, aliquid!', isOpen: false },
        { question: 'Question 2?', answer: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium, aliquid!', isOpen: false },
        { question: 'Question 3?', answer: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium, aliquid!', isOpen: false },
        ]);
        const toggleAnswer = (index) => {
        setFaqs(faqs.map((faq, i) => (
        i === index ? { ...faq, isOpen: !faq.isOpen } : faq
        )));
        };


    return(
        <>
        <div className='homepage-content'>
            <div className='homepage-header'>
                <div className='header-content'>
                    <h1>Your Personalized Skincare Solution</h1>
                    <h2>Simplify Your Skincare Routine with Dreamskin</h2>
                    <p>Are you tired of wasting money on skincare products that don't work for your unique skin needs? Dreamskin is here to help! Our comprehensive and personalized skincare platform is designed to identify the most effective products tailored to your skin type and concerns.</p>
                    <button>Take Quiz</button>
                </div>
                <div className='header-image'>
                    <img src="src/assets/placeholder.jpg" alt="Image"/>
                </div>
            </div>

            <div className='homepage-numbers'>
                <div className='heading'>
                    <h2>Statistics</h2>
                </div>
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
                <div className='heading'>
                    <h2>How the Quiz Works!</h2>
                </div>
                <div className='quiz-content'>
                    <div className='quiz-image'>
                        <img src="src/assets/placeholder.jpg" alt="Image"/>
                    </div>
                    <div className='quiz-box'>
                        <div className='quiz-row'>
                            <div className='box-content'>
                                <i className='fas fa-comments'>ICON</i>
                                <p className='box-par'>Lorem ipsum dolor sit a</p>
                            </div>
                            <div className='box-content'>
                                <i className='fas fa-comments'>ICON</i>
                                <p className='box-par'>Lorem ipsum dolor sit a</p>
                            </div>
                        </div>
                        <div className='quiz-row'>
                            <div className='box-content'>
                                <i className='fas fa-comments'>ICON</i>
                                <p className='box-par'>Lorem ipsum dolor sit a</p>
                            </div>
                            <div className='box-content'>
                                <i className='fas fa-comments'>ICON</i>
                                <p className='box-par'>Lorem ipsum dolor sit a</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='homepage-about'>
                <div className='heading'>
                    <h2>About Us</h2>
                </div>
                <div className='about-content'>
                <h3>Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque porro totam commodi placeat distinctio aliquid rerum ipsam nam molestiae quasi, repellendus ullam, ducimus nesciunt, explicabo similique assumenda eveniet quos autem.</h3>
                </div>
            </div>

            <div className='homepage-team'>
                <div className='heading'>
                    <h2>Our Lovely Team</h2>
                </div>
                <div className='team-content'>
                    <div className='team-member'>
                        <img src="src/assets/placeholder.jpg" alt="Image" className='member-image'/>
                        <h4 className='member-name'>Elizabeth</h4>
                        <h5 className='member-title'>FrontEnd</h5>
                        <button className='connect-button'>Contact Elizabeth</button>
                    </div>
                    <div className='team-member'>
                        <img src="src/assets/placeholder.jpg" alt="Image" className='member-image'/>
                        <h4 className='member-name'>Maria</h4>
                        <h5 className='member-title'>BackEnd</h5>
                        <button className='connect-button'>Contact Maria</button>
                    </div>
                    <div className='team-member'>
                        <img src="src/assets/placeholder.jpg" alt="Image" className='member-image'/>
                        <h4 className='member-name'>Evelyn</h4>
                        <h5 className='member-title'>FrontEnd</h5>
                        <button className='connect-button'>Contact Evelyn</button>
                    </div>
                </div>
            </div>

            <div className='homepage-faq'>
                <div className='heading'>
                    <h2>FREQUENTLY ASKED QUESTIONS</h2>
                </div>
                <div className='faq-content'>
                    {/* <div className='faq-item'>
                        <div className='faq-question'>
                            <h3>Question 1?</h3>
                            <div className='toggle-icon'>+</div>
                        </div>
                        <div className='faq-answer'>
                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium, aliquid!</p>
                        </div>
                    </div> */}

                    {faqs.map((faq, index)=> (
                        <div className='faq-item' key={index}>
                            <div className='faq-question' onClick={() => toggleAnswer(index)}>
                                <h3>{faq.question}</h3>
                                <div className='toggle-icon'>{faq.isOpen ? '-' : '+'}</div>
                            </div>
                            {faq.isOpen && (
                                <div className='faq-answer'>
                                    <p>{faq.answer}</p>
                                </div>
                            )}
                        </div>

                    ))}
                </div>
            </div>
        </div>
        </>
    );
};
export default HomePage;
