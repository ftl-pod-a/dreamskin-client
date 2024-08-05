import React, { useState, useEffect } from "react";
import "./ChatBot.css";
import axios from "axios";

const ChatBot = () => {
    const [isActive, setIsActive] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [hover, setHover] = useState(false);
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

    const closeChatBot = () => {
        setIsActive(false);
        setHover(false);

    }

    return (
        <div className="ChatBot">
            { !isActive && 
                <div className="non-active" onClick={() => setIsActive(true)} onMouseEnter={() => setHover(!hover)} onMouseLeave={() => setHover(!hover)}>
                    <div className="image-container">
                        <img width="48" height="48" src="https://img.icons8.com/pulsar-color/96/lotus.png" alt="lotus"/>
                    </div>
                    { hover && 
                        <div>Questions?</div> 
                    }
                </div>  
            }

            { isActive && 
                <div className="chat-container">
                    <div className="header" onClick={closeChatBot}>
                        <img src="https://img.icons8.com/pulsar-color/96/lotus.png" alt="icon" className="header-icon"/>
                        <h2>glowbot</h2>
                    </div>
                    <div className="content">
                        
                        <div className="response">
                            <img src="https://img.icons8.com/pulsar-color/96/lotus.png" alt="chat icon" className="chat-icon"/>
                            <p className="reply">Hello, how can I help C:</p>
                        </div>
                        { chatHistory.map((message, index) => (
                            <div key={index} className={message.role === "bot" ? "response" : "message"}>
                                { message.role === "bot" && 
                                    <>
                                        <img src="https://img.icons8.com/pulsar-color/96/lotus.png" alt="chat icon" className="chat-icon"/> 
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
                        <input type="text" id="user-input" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask me about skincare :D" />
                        <button onClick={handleSubmit} className="submit-prompt">
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            }
        </div>
    )
}

export default ChatBot;