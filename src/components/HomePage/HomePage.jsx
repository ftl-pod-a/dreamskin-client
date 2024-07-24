import { useState } from 'react';
import * as React from 'react';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/montserrat';
import '@fontsource/poppins';
import { Link } from "react-router-dom";
import './HomePage.css';

function HomePage(){

    const [faqs, setFaqs] = useState([
        { question: 'Can I see the ingredients of the recommended products?', answer: 'Yes, users can view the recommended ingredients of the product, specifically highlighting the top 4 key ingredients.', isOpen: false },
        { question: 'How does the quiz work?', answer: 'The quiz works by asking a series of questions. An AI analyzes the answers to identify the best ingredients of the user needs. Then, it searches through products and creates a customized routine page.', isOpen: false },
        { question: 'Can I take the quiz multiple times?', answer: 'Yes, users can take the quiz multiple times, but the previous quiz data will not be saved.', isOpen: false },
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
                    <h1>Personalized Skincare</h1>
                    <h2>Simplify Your Skincare Routine with Dreamskin</h2>
                    <p>Are you tired of wasting money on skincare products that don't work for your unique skin needs? Dreamskin is here to help! Our comprehensive and personalized skincare platform is designed to identify the most effective products tailored to your skin type and concerns.</p>
                    <Link to={`quiz`} onClick={() => console.log("switch to quiz page")}>
                        <button>Take Quiz</button>
                    </Link>
                </div>
                <div className='header-image'>
                    {/* <img src="src/assets/placeholder.jpg" alt="Image"/> */}
                    <video className="video" autoPlay loop muted>
                    <source src="src/assets/homepagevid.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
                </div>
            </div>

            <div className='homepage-numbers'>
                <div className='heading'>
                    <h2>Statistics</h2>
                </div>
                <div className='numbers-content'>
                    <div className='numbers-par'>
                        <p>Based on statistics from Statista, Kline & Company, Epsilon, and SkinStore, consumers face significant challenges in finding effective skincare products, often resulting in wasted money and time due to a trial-and-error approach. This highlights the need for personalized skincare solutions like Dreamskin, which aim to simplify routines and provide tailored recommendations to prevent unnecessary expenses and ineffective products.</p>
                    </div>
                    <div className='number-box'>
                        <div className='box'>
                            <i className='fas fa-globe'></i>
                            <h3 className='box-number'>$145.3 Billion</h3>
                            <p className='box-number'>2023 Skincare Market Value</p>
                            
                        </div>
                        <div className='box'>
                            <i className='fas fa-frown'></i>
                            <h3 className='box-number'>70%</h3>
                            <p className='box-number'>Consumers Frustrated with Product Efficacy</p>
                           
                        </div>
                        <div className='box'>
                            <i className='fas fa-user-check'></i>
                            <h3 className='box-number'>80 %</h3>
                            <p className='box-number'>Consumers Prefer Personalized Experiences</p>
                          
                        </div>
                        <div className='box'>
                            <i className='fas fa-dollar-sign'></i>
                            <h3 className='box-number'>$200</h3>
                            <p className='box-number'>Annual Expenditure on Ineffective Products</p>
                          
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
                        <img src="src/assets/quizImg.png" alt="Image"/>
                    </div>
                    <div className='quiz-box'>
                            <div className='box-content'>
                                <div className='quiz-row'>
                                    <i className="fas fa-question-circle"></i>
                                    <p className='box-par'>Answer Questions</p>
                                </div>
                                <p className='box-par'>You'll answer a series of questions designed to understand your preferences and needs.</p>
                            </div>
                            <div className='box-content'>
                                <div className='quiz-row'>
                                    <i className="fas fa-flask"></i>
                                    <p className='box-par'>Ingredient Analysis</p>
                                </div>
                                <p className='box-par'>Based on your answers, an AI analyzes the data to determine which ingredients best suit your individual needs.</p>
                            </div>
                            <div className='box-content'>
                                <div className='quiz-row'>
                                    <i className="fas fa-search"></i>
                                    <p className='box-par'>Product Matching</p>
                                </div>
                                <p className='box-par'>Once the AI identifies the key ingredients tailored to you, it searches through a range of products.</p>
                            </div>
                            <div className='box-content'>
                                <div className='quiz-row'>
                                    <i className="fas fa-list-alt"></i>
                                    <p className='box-par'>Personalized Routine</p>
                                </div>
                                <p className='box-par'>A customized routine page is generated for you based on the matched products.</p>
                            </div>
                    </div>
                </div>
            </div>

            <div className='homepage-faq'>
                <div className='heading'>
                    <h2>FREQUENTLY ASKED QUESTIONS</h2>
                </div>
                <div className='faq-content'>
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

            <div className='homepage-about'>
                <div className='heading'>
                    <h2>About Us</h2>
                </div>
                <div className='about-content'>
                <p>We are a passionate team of skincare enthusiasts who have ventured into the skincare industry to address a common problem: the complexity of skincare routines. Our mission is to simplify skincare by offering a streamlined routine consisting of just three essential products: a cleanser, a moisturizer, and a sunscreen.</p>
                <p>Our innovative solution helps you choose the best products tailored to your skin type and needs, ensuring an effective and manageable skincare routine.</p>
                </div>
            </div>

            <div className='homepage-team'>
                <div className='heading'>
                    <h2>Our Lovely Team</h2>
                </div>
                <div className='team-content'>
                    <div className='team-member'>
                        <img src="src/assets/lizimg.png" alt="Image" className='member-image'/>
                        <h4 className='member-name'>Elizabeth J.</h4>
                        <a href='https://www.linkedin.com/in/elizafoam' className='connect-button'>Contact</a>
                    </div>
                    <div className='team-member'>
                        <img src="src/assets/mariaimg.png" alt="Image" className='member-image'/>
                        <h4 className='member-name'>Maria P.</h4>
                        <a href='https://www.linkedin.com/in/maria-gabriela-perez-0ba469244/' className='connect-button'>Contact</a>
                    </div>
                    <div className='team-member'>
                        <img src="src/assets/eveimg.png" alt="Image" className='member-image'/>
                        <h4 className='member-name'>Evelyn Z.</h4>
                        <a href='https://www.linkedin.com/in/evelynzhinin' className='connect-button'>Contact</a>
                        {/* <button className='connect-button'>Contact</button> */}
                    </div>
                </div>
            </div>

            
        </div>
        </>
    );
};
export default HomePage;
