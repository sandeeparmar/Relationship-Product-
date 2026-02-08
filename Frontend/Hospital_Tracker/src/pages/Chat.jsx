import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../context/SocketContext";
import api from "../api/api";
import AudioRecorder from "../components/AudioRecorder";
import { AuthContext } from "../context/AuthContext";

export default function Chat() {
  const { roomId } = useParams(); // Use roomId from URL params
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.emit("joinChatRoom", roomId);

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("newMessage", handleNewMessage);

    // Load initial messages if needed, backend doesn't seem to have an endpoint for history in the provided code snippet, 
    // but typically we'd load it here. 
    // Assuming history is not persisted or provided by socket on join for now based on snippet.
    // If backend has history endpoint, uncomment below:
    // const loadHistory = async () => {
    //    const res = await api.get(`/chat/${roomId}`);
    //    setMessages(res.data);
    // };
    // loadHistory();

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [roomId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await api.post("/chat/text", { roomId, text });
      setText("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleAudioStop = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("roomId", roomId);

    try {
      await api.post("/chat/audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      console.error("Failed to send audio", err);
      alert("Failed to send audio message");
    }
  };

  const generateSummary = async () => {
    try {
      const res = await api.post(`/chat/summary/${roomId}`);
      alert("Summary: " + res.data.summary);
    } catch (err) {
      console.error("Failed to generate summary", err);
      alert("Failed to generate summary");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Chat Room</h2>
        <button
          onClick={generateSummary}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Generate Summary
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => {
          const isMe = m.senderId === user?._id || (m.senderId?._id === user?._id); // Check structure of senderId
          // The backend User model has name, etc. senderId in message might be populated or just ID.
          // Assuming populated or handled. For visual, we align right if it matches user.

          return (
            <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg shadow-sm ${isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-600"
                  }`}
              >
                {m.type === "TEXT" && <p>{m.translatedContent || m.content}</p>}
                {m.type === "AUDIO" && (
                  <div className="flex items-center space-x-2">
                    <audio controls src={`http://localhost:5000/${m.content}`} className="w-full max-w-[200px]" />
                  </div>
                )}
                <div className={`text-xs mt-1 ${isMe ? "text-blue-200" : "text-gray-500 dark:text-gray-400"}`}>
                  {/* Time or Sender Name if available */}
                  {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={sendMessage} className="flex items-center space-x-4">
          <AudioRecorder onStop={handleAudioStop} />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
