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
    <div className="flex items-center">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        className={`p-3 rounded-full focus:outline-none transition-colors duration-200 ${isRecording
          ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
          : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
          }`}
        title={isRecording ? "Stop Recording" : "Start Recording"}
      >
        {isRecording ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" fill="currentColor" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>
      {isRecording && <span className="ml-2 text-red-500 text-sm font-medium">Recording...</span>}
    </div>
  );
}
