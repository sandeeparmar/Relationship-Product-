import { useState, useRef, useEffect } from "react";

export default function AudioMessage({ src }) {
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

    return (
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 min-w-[200px] shadow-sm border border-gray-200 dark:border-gray-700">
            <audio ref={audioRef} src={src} preload="metadata" />

            <button
                onClick={togglePlay}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none transition-colors"
            >
                {isPlaying ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                )}
            </button>

            <div className="flex-1 flex flex-col justify-center">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress || 0}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
}
