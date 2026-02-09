import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../context/SocketContext";
import api from "../api/api";
import AudioRecorder from "../components/AudioRecorder";
import AudioMessage from "../components/AudioMessage";
import VideoCall from "../components/VideoCall";
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
    console.log("Joining chat room:", roomId);
    socket.emit("joinChatRoom", roomId);

    const handleNewMessage = (msg) => {
      console.log("Received new message:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("newMessage", handleNewMessage);

    // Add connection debugging
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("joinChatRoom", roomId); // Re-join on reconnect
    });

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("connect");
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

  /* Call Logic */
  const [inCall, setInCall] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callerId, setCallerId] = useState("");
  const [callType, setCallType] = useState("VIDEO");
  const [isInitiator, setIsInitiator] = useState(false);

  useEffect(() => {
    socket.on("incomingCall", (data) => {
      setReceivingCall(true);
      setCallerId(data.from);
      setCallerName(data.name);
      setCallerSignal(data.signal);
      setCallType(data.callType || "VIDEO");
    });

    return () => {
      socket.off("incomingCall");
    }
  }, []);

  const acceptCall = () => {
    setInCall(true);
    setReceivingCall(false);
    setIsInitiator(false);
  };

  const startCall = (type = "VIDEO") => {
    setIsInitiator(true);
    setCallType(type);
    setInCall(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-gray-50 dark:bg-gray-900 relative">
      {inCall && (
        <VideoCall
          roomId={roomId}
          isInitiator={isInitiator}
          audioOnly={callType === "AUDIO"}
          incomingSignal={callerSignal}
          partnerSocketId={callerId}
          onEndCall={() => setInCall(false)}
        />
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Chat Room</h2>
        <div className="flex gap-2">
          {user?.role === "DOCTOR" && (
            <>
              <button
                onClick={() => startCall("AUDIO")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Voice
              </button>
              <button
                onClick={() => startCall("VIDEO")}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.818v6.364a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Video
              </button>
            </>
          )}
          <button
            onClick={generateSummary}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Generate Summary
          </button>
        </div>
      </div>

      {/* Call Notification Modal */}
      {receivingCall && !inCall && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl z-10 border border-green-500 animate-bounce">
          <p className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Incoming Call from {callerName}...</p>
          <div className="flex justify-center gap-4">
            <button onClick={acceptCall} className="bg-green-500 text-white px-4 py-2 rounded-full">Accept</button>
            <button onClick={() => setReceivingCall(false)} className="bg-red-500 text-white px-4 py-2 rounded-full">Reject</button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => {
          const isMe = m.senderId === user?._id || (m.senderId?._id === user?._id); // Check structure of senderId
          // The backend User model has name, etc. senderId in message might be populated or just ID.
          // Assuming populated or handled. For visual, we align right if it matches user.

          return (
            <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-xs md:max-w-md lg:max-w-lg`}>
                <span className="text-xs text-gray-500 mb-1 px-1">
                  {m.senderId?.name || "Unknown"}
                </span>
                <div
                  className={`px-4 py-2 rounded-lg shadow-md ${isMe
                    ? "bg-green-500 text-white rounded-tr-none"
                    : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none border border-gray-200 dark:border-gray-600"
                    }`}
                >
                  {m.type === "TEXT" && <p className="text-sm">{m.translatedContent || m.content}</p>}
                  {m.type === "AUDIO" && (
                    <div className="mt-1">
                      <AudioMessage src={`http://localhost:5000/${m.content}`} />
                    </div>
                  )}
                  <div className={`text-[10px] mt-1 text-right ${isMe ? "text-green-100" : "text-gray-400"}`}>
                    {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
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
