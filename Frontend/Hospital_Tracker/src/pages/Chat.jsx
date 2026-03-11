import { useEffect, useState, useRef, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { socket } from "../context/SocketContext";
import api from "../api/api";
import AudioRecorder from "../components/AudioRecorder";
import AudioMessage from "../components/AudioMessage";
import VideoCall from "../components/VideoCall";
import { AuthContext } from "../context/AuthContext";
import "./Chat.css";
import { useToast } from "../context/ToastContext";

export default function Chat() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const appointmentId = location.state?.appointmentId;
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const { showToast } = useToast();

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
    socket.on("connect", () => {
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
      showToast("Failed to send audio message", "error");
    }
  };

  const generateSummary = async () => {
    try {
      const res = await api.post(`/chat/summary/${roomId}`);
      showToast("Summary generated successfully", "success");
      console.log("Conversation summary:", res.data.summary);
    } catch (err) {
      showToast("Failed to generate summary", "error");
    }
  };

  const handleCompleteConsultation = async () => {
    if (!appointmentId) return;
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: "COMPLETED" });
      showToast("Consultation marked as completed", "success");
      navigate("/doctor");
    } catch (err) {
      showToast("Failed to complete consultation. It might already be completed.", "error");
    }
  };

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
                {appointmentId && (
                  <button onClick={handleCompleteConsultation} className="btn-call btn-complete">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 13l4 4L19 7" />
                    </svg>
                    Complete
                  </button>
                )}
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