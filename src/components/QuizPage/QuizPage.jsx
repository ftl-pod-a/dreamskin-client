import React, { useState, useEffect } from "react";
import LinearProgress from '@mui/joy/LinearProgress';
import "./QuizPage.css";
import axios from "axios";

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
                "None",
                "Fragrances",
                "Preservatives",
                "Dyes"
            ]
        }
    ]

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [response, setResponse] = useState([]);
    const [progress, setProgress] = useState(0);
    const [showFinish, setShowFinish] = useState(false);

    const handleOptionClick = (e) => {
        const nextQuestion = currentQuestion + 1;
        const newProgress = progress + 25;
        if (nextQuestion < quizQuestions.length) {
            setCurrentQuestion(nextQuestion);
            setResponse([...response, e])
            setProgress(newProgress);
        }
       else {
        setShowFinish(true);
        quizResponsetoChat()
        setProgress(newProgress);
        
       }

    }

    const quizResponsetoChat = async () => {
        try {
          console.log(response);
          let ingredientQuestion = `This user has ${response[0]} and they are dealing with ${response[1]}, they are hoping to ${response[2]}. What are the best ingredients for this user, only provide the name of ingredients in an array`;
          console.log(ingredientQuestion);
          const r = await axios.post("http://localhost:3000/api/chat", {prompt: ingredientQuestion });
          console.log("Ingredients:", r.data);
        } catch (error) {
          console.error("Error getting ingredients", error); 
        }
      };

    return (
        <div className="Quiz">
            <div className="quiz-top">
                <img src="src/assets/quizbanner.jpg" alt="quiz banner" className="quiz-banner"/>
                <img src="src/assets/quizicon.jpg" alt="quiz banner" className="quiz-icon"/>
            </div>
            <h1>Skincare Quiz</h1>
            <LinearProgress className="progress-bar" variant="solid" determinate value={progress}/>
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
            <div className=""></div>
        </div>
    )
}

export default QuizPage;

