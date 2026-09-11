import { useState, useEffect, useRef } from 'react';

import ChatbotIcon from "./ChatbotIcon";
import "./chatbot.css";
import ChartForm from "./ChartForm";
import ChatMessage from "./ChatMessage";
import { companyInfo } from './companyInfo';
import api from '../../lib/axios';

function Chatbot() {
 const [chatHistory, setChatHistory] = useState([
    { hideInChat: true, role: "model", text: JSON.stringify(companyInfo) },
    { role: "model", text: "👋 Hey there!\nHow can I help you today?" }, 
  ]);

  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {

    //helper function to update chat history
    const updateHistory= (text,isError=false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."), 
        { role: "model", text , isError}
      ]);
    }

    //Format the chat history for the API request
    history = history.map(({ role, text }) => ({role, parts: [{ text }]}));

    try{
      // Goes through our own backend, which holds the Gemini key. A key in the
      // frontend bundle would be readable by every visitor.
      const { data } = await api.post("/api/chat", { contents: history });
      updateHistory(data.text);

        }catch (error) {
      updateHistory(
        error?.response?.data?.message ||
          "I couldn't reach the assistant. Please try again.",
        true
      );
  }

  };
  //Automatically scroll to the bottom of the chat body when new messages are added
  useEffect(() => {
    chatBodyRef.current.scrollTo({top: chatBodyRef.current.scrollHeight, behavior: "smooth"});
  }, [chatHistory]);

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ''}`}>
      <button onClick={()=> setShowChatbot(prev => !prev)} id="chatbot-toggler">
        <span className="material-symbols-rounded">chat</span>
         <span className="material-symbols-rounded">Close</span>
      </button>
      <div className="chatbot-popup">
        {/* Chatbot Header */}
        <div className="chatbot-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button onClick={()=> setShowChatbot(prev => !prev)} 
          className="material-symbols-rounded">Close</button>
        </div>
        {/* Chatbot Body */}
        <div ref={chatBodyRef} className="chat-body">
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>
        {/* Chatbot Footer */}
        <div className="chat-footer">
          <ChartForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
}

export default Chatbot;