import { useState, useRef, useEffect } from "react";

export default function AudioMessage({ src, isMe = false }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const setAudioDuration = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", setAudioDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", setAudioDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(e.target.value);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const barHeights = [3, 5, 8, 6, 10, 7, 4, 9, 6, 11, 8, 5, 7, 10, 6, 4, 8, 9, 5, 7, 11, 6, 4, 8, 6, 9, 5, 3];
  const filledBars = Math.round((progress / 100) * barHeights.length);

  return (
    <div className="flex items-center gap-2.5 min-w-[210px] max-w-[260px]">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play / Pause Button */}
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className={`
          flex-shrink-0 w-[34px] h-[34px] rounded-full
          flex items-center justify-center
          transition-transform duration-150 active:scale-95 hover:scale-105
          ${isMe
            ? "bg-white/25 hover:bg-white/35 text-white"
            : "bg-teal-600 hover:bg-teal-500 text-white"
          }
        `}
      >
        {isPlaying ? (
          <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
            <rect x="5" y="4" width="4" height="16" rx="1.5" />
            <rect x="15" y="4" width="4" height="16" rx="1.5" />
          </svg>
        ) : (
          <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Waveform + Times */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">

        {/* Waveform bars */}
        <div className="relative flex items-center gap-0.5 h-[22px]">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className={`
                w-[3px] rounded-sm flex-shrink-0 transition-colors duration-75
                ${i < filledBars
                  ? isMe ? "bg-white/90" : "bg-teal-600"
                  : isMe ? "bg-white/35" : "bg-slate-300 dark:bg-slate-600"
                }
              `}
              style={{ height: `${h}px` }}
            />
          ))}
          {/* Invisible seek input layered on top */}
          <input
            type="range"
            min="0"
            max="100"
            value={progress || 0}
            onChange={handleSeek}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Timestamps */}
        <div
          className={`flex justify-between items-center text-[10px] font-medium tracking-wide
            ${isMe ? "text-white/60" : "text-slate-400"}`}
        >
          <span className="flex items-end gap-1">
            {formatTime(currentTime)}
            {/* Bouncing bars while playing */}
            {isPlaying && (
              <span className="flex items-end gap-0.5 h-2.5 mb-px">
                {[0, 150, 300].map((delay, i) => (
                  <span
                    key={i}
                    className={`block w-0.5 rounded-sm animate-bounce
                      ${isMe ? "bg-white/75" : "bg-teal-600"}`}
                    style={{
                      height: "10px",
                      animationDelay: `${delay}ms`,
                      animationDuration: "0.8s",
                    }}
                  />
                ))}
              </span>
            )}
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}