import React, { useState, useEffect } from "react";
import LinearProgress from '@mui/joy/LinearProgress';
import "./QuizPage.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import LoadingModal from "../LoadingModal/LoadingModal";

const QuizPage = () => {

    const quizQuestions = [
        {
            question: "What is your skin type",
            options: [
                "Dry",
                "Combination",
                "Oily", 
                "Normal"
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
    const [currentChoice, setCurrentChoice] = useState([]);
    const [response, setResponse] = useState(["", "", "", ""]);
    const [progress, setProgress] = useState(0);
    const [showFinish, setShowFinish] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        setCurrentChoice([]);
    }, [response]);

    const checkProgress = (newProgress) => {
        if (newProgress >= 0 && newProgress <= 100){
            setProgress(newProgress);
        }
    }

    const handleOptionClick = (e) => {
        let newChoices = [...currentChoice];
        if (currentQuestion == 0){
            setCurrentChoice([e.target.textContent]);
            return;
        }
        if (currentChoice.includes(e.target.textContent)) {
            newChoices.splice(currentChoice.indexOf(e.target.textContent), 1)
        }
        else {
            newChoices.push(e.target.textContent)
        }
        setCurrentChoice(newChoices);
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
        await updateUserInfo();
        setShowFinish(true);
        setLoading(true);
        await quizResponsetoChat();
        setLoading(false);
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
        const r = await axios.post("https://dreamskin-server-tzka.onrender.com/api/chat", {userResponse: response});
        let geminiIngredients = r.data.response;
        let cleanedStr = geminiIngredients.replace(/```/g, '').trim();
        
        let ingredientsArray = JSON.parse(cleanedStr);
        ingredientsArray = {
            ingredients: ingredientsArray
        };

        await getRecommendedProducts(ingredientsArray);
        } catch (error) {
          console.error("Error getting ingredients", error); 
        }
    };
      
    const getRecommendedProducts = async (ingredients) => {
        try {
          const response = await axios.post("https://dreamskin-server-tzka.onrender.com/products/products/search", ingredients);
          localStorage.setItem('products', JSON.stringify(response.data));
          await saveRoutine();
        }
        catch (error){
            console.log("error getting products", error); 
        }
    }

    const saveRoutine = async () => {
        try {
          const localProducts = JSON.parse(localStorage.getItem('products'));
          const authToken = localStorage.getItem('token');
          const decodedToken = jwtDecode(authToken);
          const { userId, username } = decodedToken;
          
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
          const response = await axios.post("https://dreamskin-server-tzka.onrender.com/routine", userRoutine);
        }
        catch (error){
            console.log("error saving routine", error);  
        }
    }

    const updateUserInfo = async () => {
        try {
            const authToken = localStorage.getItem('token');
            const decodedToken = jwtDecode(authToken);
            const { userId } = decodedToken;
    
            const userInfo = {
                skinType: response[0]?.toString() || '',
                goals: response[2]?.toString() || '',
                concerns: response[1]?.toString() || '',
            }
    
            const updateResponse = await axios.put(`https://dreamskin-server-tzka.onrender.com/users/${userId}`, userInfo);
        }
        catch (error) {
            console.error("Error updating user info", error.response?.data || error.message);
        }
    }

    // when clicking a button, change color to opposite, add to current choice
    return (
        <div className="Quiz">
            {loading && <LoadingModal isVisible={loading} />}
            <div className="quiz-container">
                <div className="image-container">
                    <img src="assets/quizbannerimage.jpg" alt="quiz banner image" className="image"/>
                </div>
                
                <span className="question">
                    <h2>{currentQuestion+1}. </h2>
                    <h2 className="question-text">{quizQuestions[currentQuestion].question}</h2>
                </span>

                <LinearProgress className="progress-bar" variant="solid" determinate value={progress}/>

                <div className="options">
                    { quizQuestions[currentQuestion].options.map((option) => (
                            <button key={option} className="option" onClick={(e) => handleOptionClick(e)} style={{backgroundColor: currentChoice.includes(option) ? "#d8796c" : "#507d68" }}>{option}</button>
                    ))}
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
        </div>
    )
}

export default QuizPage;