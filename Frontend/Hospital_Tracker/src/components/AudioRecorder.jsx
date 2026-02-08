import { useState, useRef } from "react";

export default function AudioRecorder({ onStop }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        if (onStop) {
          onStop(blob);
        }
        chunks.current = [];
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      // Stop all tracks to release microphone
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        className={`p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white animate-pulse shadow-lg shadow-red-500/50"
            : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 text-white shadow-md hover:shadow-lg"
        }`}
        title={isRecording ? "Stop Recording" : "Start Recording"}
      >
        {isRecording ? (
          // Stop icon (square)
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          // Microphone icon (improved)
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>
      {isRecording && (
        <span className="flex items-center gap-1.5 text-red-500 text-sm font-medium">
          <span className="flex gap-0.5">
            <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></span>
            <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></span>
            <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></span>
          </span>
          Recording...
        </span>
      )}
    </div>
  );
}