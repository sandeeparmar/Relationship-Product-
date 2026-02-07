import { useEffect, useState } from "react";
import { socket } from "../context/SocketContext";
import api from "../api/api";

export default function Chat({ roomId }) {

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");


  const generateSummary = async () => {
  const res = await api.post(`/chat/summary/${roomId}`);
  alert(res.data.summary);
};


  useEffect(() => {

    socket.emit("joinChatRoom", roomId);

    socket.on("newMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

  }, []);

  const sendMessage = async () => {
    await api.post("/chat/text", {
      roomId,
      text
    });
    setText("");
  };

  return (
    <div>

      {messages.map((m,i)=>(
        <div key={i}>
          {m.type === "TEXT" && <p>{m.translatedContent}</p>}

          {m.type === "AUDIO" && (
            <audio controls src={`http://localhost:5000/${m.content}`} />
          )}
        </div>
      ))}

      <input value={text} onChange={e=>setText(e.target.value)} />
      <button onClick={sendMessage}>Send</button>

      <button onClick={generateSummary}>
        Generate Medical Summary
      </button>


    </div>
  );
}
