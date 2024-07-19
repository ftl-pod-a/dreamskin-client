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
    const [currentChoice, setCurrentChoice] = useState("");
    const [response, setResponse] = useState(["", "", "", ""]);
    const [progress, setProgress] = useState(0);
    const [showFinish, setShowFinish] = useState(false);


    useEffect(() => {
        console.log(currentChoice);
        setCurrentChoice("");
        console.log(response);

    }, [response]);

    const checkProgress = (newProgress) => {
        if (newProgress >= 0 && newProgress <= 100){
            setProgress(newProgress);
        }
    }

    const handleOptionClick = (e) => {
        if(currentQuestion > 0 && currentChoice == ""){
            let newChoice = currentChoice + " , " + e.target.textContent;
            setCurrentChoice(newChoice)
        }
        else setCurrentChoice(e.target.textContent);
    }

    const handleForwardButtonClick = () => {
        const nextQuestion = currentQuestion + 1;
        const newProgress = progress + 25;
        if (nextQuestion < quizQuestions.length) {
            let newResponseArr = [...response];
            newResponseArr[currentQuestion] = currentChoice;
            setResponse(newResponseArr);
            setCurrentQuestion(nextQuestion);
        }
       else {
        setShowFinish(true);
        quizResponsetoChat();
       }
       checkProgress(newProgress);
    }

    const handleBackButtonClick = () => {
        const updatedQuestion = currentQuestion - 1;
        const newProgress = progress - 25;
        if (updatedQuestion >= 0){
            setCurrentQuestion(updatedQuestion);
            setCurrentChoice(response[currentQuestion])
        }
        checkProgress(newProgress); 
    }

    const t = () => {
        const updatedQuestion = currentQuestion + 1;
        const newProgress = progress + 25;
        if (updatedQuestion < quizQuestions.length){
            setCurrentQuestion(updatedQuestion);
        }
        if (newProgress <= 100){
            setProgress(newProgress);
        }
        checkProgress(newProgress);
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
                            <button key={option} className="option" onClick={(e) => handleOptionClick(e)}>{option}</button>
                        ))
                    }
                </div>
            </div>
            <div className="buttons">
                { currentQuestion > 0 &&
                <button className="back" onClick={handleBackButtonClick}>Back</button>
                }
                { currentQuestion < quizQuestions.length && currentChoice != "" &&
                <button className="forward" onClick={handleForwardButtonClick}>Continue</button>
                }
            </div>
        </div>
    )
}

export default QuizPage;