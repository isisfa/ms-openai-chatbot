import { useRef, useEffect, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { companyInfo } from "./companyInfo"
import { AzureOpenAI } from "openai";

const App = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo
    }
  ]);
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory(prev => [...prev.filter(msg => msg.text !== "Thinking..."), {role: "model", text, isError}]);
    }

    // Format chat for API request
    const formattedHistory = history.map(({ role, text }) => ({
      role: role === "model" ? "assistant" : "user",
      content: text
    }));

    try {
      // Make the API call to get the bot's response
      const client = new AzureOpenAI({
        endpoint: "https://isis-m7aepfts-swedencentral.cognitiveservices.azure.com/",
        apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY,
        apiVersion: "2024-04-01-preview",
        // dangerouslyAllowBrowser: true
      });
      const response = await client.chat.completions.create({
        model: "gpt-35-turbo",
        messages: formattedHistory,
        max_tokens: 100,
        temperature: 0.7,
      });

      // Clear and update chat history with bot's response
      const apiResponseText = response.choices[0].message.content.trim();
      updateHistory(apiResponseText);
    } catch (error) {
      console.error("Error:", error);
      updateHistory(error.message || "Ops, something went wrong!", true);
    }
  };

  useEffect(() => {
    // Auto-scroll whenever chat history updates
    chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className="container">
      <div className="chatbot-popup">
        {/* Chatbot header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button className="material-symbols-outlined">keyboard_arrow_down</button>
        </div>

        {/* Chatbot body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hey there!🌿 <br />
              What is your plant question today? 
            </p>
          </div>

          {/* Render the chat history dynamically */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        {/* Chatbot footer */}
        <div className="chat-footer">
          <ChatForm 
          chatHistory={chatHistory} 
          setChatHistory={setChatHistory} 
          generateBotResponse={generateBotResponse} 
          />
        </div>
      </div>
    </div>
  )
}

export default App;