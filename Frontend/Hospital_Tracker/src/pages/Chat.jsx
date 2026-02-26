import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../context/SocketContext";
import api from "../api/api";
import AudioRecorder from "../components/AudioRecorder";
import AudioMessage from "../components/AudioMessage";
import VideoCall from "../components/VideoCall";
import { AuthContext } from "../context/AuthContext";

export default function Chat() {
  const { roomId } = useParams();
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
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("joinChatRoom", roomId);
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
    };
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .chat-root {
          font-family: 'DM Sans', sans-serif;
          --teal: #0d9488;
          --teal-light: #14b8a6;
          --teal-dim: #ccfbf1;
          --surface: #f8fafc;
          --surface-card: #ffffff;
          --border: #e2e8f0;
          --text-primary: #0f172a;
          --text-secondary: #64748b;
          --text-muted: #94a3b8;
          --me-bubble: #0d9488;
          --me-bubble-text: #ffffff;
          --them-bubble: #ffffff;
          --them-bubble-text: #0f172a;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
          --shadow-lg: 0 12px 40px rgba(0,0,0,0.12);
        }

        .chat-root.dark {
          --surface: #0f172a;
          --surface-card: #1e293b;
          --border: #334155;
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --text-muted: #64748b;
          --them-bubble: #1e293b;
          --them-bubble-text: #f1f5f9;
          --teal-dim: #134e4a;
        }

        .chat-header {
          padding: 0 1.75rem;
          height: 4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--surface-card);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .chat-header-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .chat-header-title::before {
          content: '';
          display: block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--teal-light);
          box-shadow: 0 0 0 3px var(--teal-dim);
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 3px var(--teal-dim); }
          50% { box-shadow: 0 0 0 5px var(--teal-dim); }
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-call {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.9rem;
          border-radius: 8px;
          border: 1.5px solid transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          letter-spacing: 0.01em;
        }

        .btn-voice {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
        }
        .btn-voice:hover {
          background: #dbeafe;
          border-color: #93c5fd;
        }

        .btn-video {
          background: #f0fdf4;
          color: #16a34a;
          border-color: #bbf7d0;
        }
        .btn-video:hover {
          background: #dcfce7;
          border-color: #86efac;
        }

        .btn-summary {
          background: var(--teal);
          color: white;
          border-color: var(--teal);
          padding: 0.45rem 1rem;
        }
        .btn-summary:hover {
          background: var(--teal-light);
          border-color: var(--teal-light);
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          background: var(--surface);
        }

        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

        .msg-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 0.75rem;
        }

        .msg-group.me { align-items: flex-end; }
        .msg-group.them { align-items: flex-start; }

        .msg-sender {
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: 0.3rem;
          padding: 0 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .msg-bubble {
          max-width: min(75%, 480px);
          padding: 0.65rem 1rem;
          border-radius: 14px;
          box-shadow: var(--shadow-sm);
          position: relative;
          animation: bubbleIn 0.2s ease;
        }

        @keyframes bubbleIn {
          from { opacity: 0; transform: translateY(6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .msg-group.me .msg-bubble {
          background: var(--me-bubble);
          color: var(--me-bubble-text);
          border-bottom-right-radius: 4px;
        }

        .msg-group.them .msg-bubble {
          background: var(--them-bubble);
          color: var(--them-bubble-text);
          border-bottom-left-radius: 4px;
          border: 1px solid var(--border);
        }

        .msg-text {
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .msg-time {
          font-size: 0.65rem;
          margin-top: 0.3rem;
          text-align: right;
          opacity: 0.65;
        }

        .input-area {
          padding: 1rem 1.75rem;
          background: var(--surface-card);
          border-top: 1px solid var(--border);
        }

        .input-form {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 14px;
          padding: 0.5rem 0.6rem 0.5rem 0.75rem;
          transition: border-color 0.15s;
        }

        .input-form:focus-within {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(13,148,136,0.1);
        }

        .msg-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: var(--text-primary);
          min-width: 0;
        }

        .msg-input::placeholder { color: var(--text-muted); }

        .send-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: var(--teal);
          color: white;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .send-btn:hover:not(:disabled) {
          background: var(--teal-light);
          transform: scale(1.05);
        }

        .send-btn:disabled {
          background: var(--border);
          color: var(--text-muted);
          cursor: not-allowed;
          transform: none;
        }

        .incoming-call-banner {
          position: absolute;
          top: 5rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--surface-card);
          border: 1.5px solid var(--teal-light);
          border-radius: 16px;
          padding: 1.25rem 1.75rem;
          box-shadow: var(--shadow-lg);
          z-index: 50;
          min-width: 300px;
          text-align: center;
          animation: slideDown 0.25s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .call-pulse-ring {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--teal-dim);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.85rem;
          position: relative;
        }

        .call-pulse-ring::before,
        .call-pulse-ring::after {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 2px solid var(--teal-light);
          opacity: 0;
          animation: callRing 1.5s ease-out infinite;
        }

        .call-pulse-ring::after { animation-delay: 0.5s; }

        @keyframes callRing {
          0% { opacity: 0.7; transform: scale(0.9); }
          100% { opacity: 0; transform: scale(1.4); }
        }

        .call-banner-name {
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .call-banner-sub {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .call-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .btn-accept {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.25rem;
          background: var(--teal);
          color: white;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-accept:hover { background: var(--teal-light); }

        .btn-reject {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.25rem;
          background: #fef2f2;
          color: #dc2626;
          border: 1.5px solid #fecaca;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-reject:hover { background: #fee2e2; border-color: #fca5a5; }

        .date-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0.5rem 0 1rem;
        }
        .date-divider::before, .date-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .date-divider span {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }
      `}</style>

      <div
        className="chat-root flex flex-col relative"
        style={{ height: "calc(100vh - 6rem)" }}
      >
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
        <div className="chat-header">
          <div className="chat-header-title">Chat Room</div>
          <div className="header-actions">
            {user?.role === "DOCTOR" && (
              <>
                <button onClick={() => startCall("AUDIO")} className="btn-call btn-voice">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Voice
                </button>
                <button onClick={() => startCall("VIDEO")} className="btn-call btn-video">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.818v6.364a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Video
                </button>
              </>
            )}
            <button onClick={generateSummary} className="btn-call btn-summary">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Summary
            </button>
          </div>
        </div>

        {/* Incoming Call Banner */}
        {receivingCall && !inCall && (
          <div className="incoming-call-banner">
            <div className="call-pulse-ring">
              <svg width="22" height="22" fill="none" stroke="#0d9488" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <p className="call-banner-name">{callerName}</p>
            <p className="call-banner-sub">Incoming {callType === "VIDEO" ? "video" : "voice"} call…</p>
            <div className="call-actions">
              <button onClick={acceptCall} className="btn-accept">
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Accept
              </button>
              <button onClick={() => setReceivingCall(false)} className="btn-reject">
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="messages-area">
          {messages.length === 0 && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "var(--teal-dim)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  margin: "0 auto 0.75rem"
                }}>
                  <svg width="24" height="24" fill="none" stroke="var(--teal)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>No messages yet. Say hello!</p>
              </div>
            </div>
          )}

          {messages.map((m, i) => {
            const isMe = m.senderId === user?._id || (m.senderId?._id === user?._id);
            return (
              <div key={i} className={`msg-group ${isMe ? "me" : "them"}`}>
                {(!messages[i - 1] || messages[i - 1]?.senderId?._id !== m.senderId?._id) && (
                  <span className="msg-sender">{m.senderId?.name || "Unknown"}</span>
                )}
                <div className="msg-bubble">
                  {m.type === "TEXT" && (
                    <p className="msg-text">{m.translatedContent || m.content}</p>
                  )}
                  {m.type === "AUDIO" && (
                    <AudioMessage src={`http://localhost:5000/${m.content}`} />
                  )}
                  <div className="msg-time">
                    {new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <form onSubmit={sendMessage} className="input-form">
            <AudioRecorder onStop={handleAudioStop} />
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              className="msg-input"
            />
            <button type="submit" disabled={!text.trim()} className="send-btn">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}