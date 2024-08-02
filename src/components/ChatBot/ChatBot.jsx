import React, { useState, useEffect } from "react";
import "./ChatBot.css";
import axios from "axios";

const ChatBot = () => {
    const [isActive, setIsActive] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [prompt, setPrompt] = useState("");
    console.log(window.location.href);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(prompt);
    
        try {
          const res = await axios.post("https://dreamskin-server-tzka.onrender.com/api/chat/bot", {
            prompt,
            conversationId,
          });
          console.log(res);
          const userMessage = { role: "user", content: prompt };
          const botMessage = { role: "bot", content: res.data.response };
    
          setChatHistory([...chatHistory, userMessage, botMessage]);
          setPrompt("");
          setConversationId(res.data.conversationId);
        } catch (error) {
          console.error("Error:", error);
        }
      };

    return (
        <div className="ChatBot">
            { !isActive && 
                <div className="image-container">
                    <img src="assets/quizicon.jpg" alt="chat icon" className="main-chat-icon" onClick={() => setIsActive(true)}/>
                </div>
            }

            {isActive && 
                <div className="chat-container">
                    <div className="header" onClick={() => setIsActive(false)}>
                        <img src="assets/quizicon.jpg" alt="icon" className="header-icon"/>
                        <h2>glowbot</h2>
                    </div>
                    <div className="content">
                        {/* 
                        <div className="response">
                            <img src="assets/quizicon.jpg" alt="chat icon" className="chat-icon" onClick={() => setIsActive(true)}/>
                            <p className="reply">Hello this is your glowbot here to help you</p>
                        </div>
                        <div className="message">Hello person</div>
                        <div className="message">Wonderful Weather</div>
                        <div className="response">
                            <img src="assets/quizicon.jpg" alt="chat icon" className="chat-icon" onClick={() => setIsActive(true)}/>
                            <p className="reply">Happy to help</p>
                        </div>
                         */} 
                        <div className="response">
                            <img src="assets/quizicon.jpg" alt="chat icon" className="chat-icon"/>
                            <p className="reply">Hello, how can I help C:</p>
                        </div>
                        { chatHistory.map((message, index) => (
                            <div key={index} className={message.role === "bot" ? "response" : "message"}>
                                { message.role === "bot" && 
                                    <>
                                        <img src="assets/quizicon.jpg" alt="chat icon" className="chat-icon"/> 
                                        <p className={message.role === "user" ? "message" : "reply"}>{message.content}</p>
                                    </>    
                                }

                                { message.role === "user" && 
                                    message.content
                                }
                            </div>
                        ))}
                        
                    </div>
                    <div className="input-container">
                        <input type="text" id="user-input" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                        <button onClick={handleSubmit}>
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            }
        </div>
    )
}

export default ChatBot;