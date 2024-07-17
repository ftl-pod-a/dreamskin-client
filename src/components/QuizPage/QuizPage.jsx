import React, { useState } from "react";
import "./QuizPage.css";

const QuizPage = () => {

    const quizQuestions = [
        {
            question: "What is your skin type",
            options: [
                "Dry",
                "Combination",
                "Oily"
            ]
        },
        {
            question: "Do you have any specific skin concerns",
            options: [
                "Acne",
                "Wrinkles/Fine lines",
                "Hyperpigmentation",
                "Redness/Rosacea",
                "Dryness",
                "Rough texture",
                "Eczema"
            ]
        },
        {
            question: "What are your skin goals",
            options: [
                "Even skin tone",
                "Clear acne",
                "Reduce redness",
                "Improve skin texture"
            ]
        }, 
        {
            question: "Are you allergic to any of the following",
            options: [
                "No",
                "Fragrances",
                "Preservatives",
                "Dyes"
            ]
        }
    ]

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [response, setResponse] = useState([]);
    const [showFinish, setShowFinish] = useState(false);


    const handleOptionClick = (e) => {
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < quizQuestions.length) {
            setCurrentQuestion(nextQuestion);
            setResponse([...response, e])
        }
        else {
            setShowFinish(true);
            console.log(response);
        }
    }

    return (
        <div className="Quiz">
            <img src="src/assets/quizbanner.jpg" alt="quiz banner" className="quiz-banner"/>
            <div className="question">
                <div className="question-text">{quizQuestions[currentQuestion].question}</div>
                <div className="options">
                    {
                        quizQuestions[currentQuestion].options.map((option) => (
                            <button key={option} className="option" onClick={(e) => handleOptionClick(e.target.textContent)}>{option}</button>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default QuizPage;