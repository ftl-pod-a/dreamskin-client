import React, { useState, useEffect } from "react";
import LinearProgress from '@mui/joy/LinearProgress';
import "./QuizPage.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

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
    const navigate = useNavigate();


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
        setCurrentChoice(e.target.textContent);
    }

    const handleForwardButtonClick = async () => {
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
        await quizResponsetoChat();
        navigate("/routine");
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

    const quizResponsetoChat = async () => {
        try {
          console.log(response);
          const r = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {userResponse: response});
          let geminiIngredients = r.data.response;
          console.log("Gemini", geminiIngredients);

        let cleanedStr = geminiIngredients.replace(/```/g, '').trim();
        console.log(cleanedStr)

        let ingredientsArray = JSON.parse(cleanedStr);
        ingredientsArray = {
            ingredients: ingredientsArray
          };
        console.log("Array", ingredientsArray);

        await getRecommendedProducts(ingredientsArray);
        } catch (error) {
          console.error("Error getting ingredients", error); 
        }
    };
      
    const getRecommendedProducts = async (ingredients) => {
        try {
          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/products/products/search`, ingredients);
          console.log("Response", response.data);
          localStorage.setItem('products', JSON.stringify(response.data));
          await saveRoutine();
        }
        catch (error){
          console.log("Error fetching products", error);
        }
    }

    const saveRoutine = async () => {
        try {
          const localProducts = JSON.parse(localStorage.getItem('products'));
          const authToken = localStorage.getItem('token');
          const decodedToken = jwtDecode(authToken);
          const { userId, username } = decodedToken;
          console.log(userId, username);

          const userRoutine = {
            user_id: userId,
            products: [
                {id: localProducts[0].id},  // morning cleanser
                {id: localProducts[1].id},  // night cleanser
                {id: localProducts[2].id},  // morning moisturizer
                {id: localProducts[3].id},  // night moisturizer
                {id: localProducts[4].id}, // sunscreen
            ]
          }
          console.log(userRoutine);
          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/routine`, userRoutine);
          console.log("Saved Routine", response.data);
        }
        catch (error){
          console.log("Error saving routine", error);
        }
    }

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
                { currentQuestion < quizQuestions.length - 1 && currentChoice != "" &&
                <button className="forward" onClick={handleForwardButtonClick}>Continue</button>
                }
                { currentQuestion == quizQuestions.length - 1 &&
                    <button className="forward" onClick={handleForwardButtonClick}>Finish</button>
                    
                }
            </div>
        </div>
    )
}

export default QuizPage;