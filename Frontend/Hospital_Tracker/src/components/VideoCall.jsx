import { useEffect, useRef, useState, useContext } from "react";
import Peer from "simple-peer";
import { socket } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";

export default function VideoCall({ roomId, partnerId, isInitiator, onEndCall, audioOnly, incomingSignal, partnerSocketId }) {
    const { user } = useContext(AuthContext);
    const [stream, setStream] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState(null);
    const [name, setName] = useState("");

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        // Media Constraints
        const constraints = { video: !audioOnly, audio: true };

        navigator.mediaDevices.getUserMedia(constraints).then((currentStream) => {
            setStream(currentStream);
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }

            // Initialize Peer once stream is ready
            if (isInitiator) {
                const peer = new Peer({
                    initiator: true,
                    trickle: false,
                    stream: currentStream
                });

                peer.on("signal", (data) => {
                    socket.emit("callRoom", {
                        roomId,
                        signalData: data,
                        from: socket.id,
                        name: user.name,
                        callType: audioOnly ? "AUDIO" : "VIDEO"
                    });
                });

                peer.on("stream", (remoteStream) => {
                    if (userVideo.current) userVideo.current.srcObject = remoteStream;
                });

                socket.on("callAccepted", (signal) => {
                    setCallAccepted(true);
                    peer.signal(signal);
                });

                connectionRef.current = peer;
            } else if (incomingSignal) {
                // Answering Logic
                setCallAccepted(true);
                const peer = new Peer({
                    initiator: false,
                    trickle: false,
                    stream: currentStream
                });

                peer.on("signal", (data) => {
                    socket.emit("answerCall", { signal: data, to: partnerSocketId });
                });

                peer.on("stream", (remoteStream) => {
                    if (userVideo.current) userVideo.current.srcObject = remoteStream;
                });

                peer.signal(incomingSignal);
                connectionRef.current = peer;
            }

        }).catch(err => {
            console.error("Media Error:", err);
            alert("Camera/Mic Error: " + err.message);
            onEndCall();
        });

        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
            if (connectionRef.current) connectionRef.current.destroy();
            socket.off("callAccepted");
            socket.off("callUser"); // Cleanup old listener if any
        };
    }, []);

    // Removed old callUser/answerCall manual functions as logic is now in effect

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        // Stop tracks
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        onEndCall && onEndCall();
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                {/* My Video */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                    <p className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 rounded">
                        {user.name} (You)
                    </p>
                </div>

                {/* User Video */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                    {callAccepted && !callEnded ? (
                        <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-white text-center">
                            {receivingCall && !callAccepted ? (
                                <p className="animate-pulse">Incoming Call from {name}...</p>
                            ) : (
                                <p>Waiting for connection...</p>
                            )}
                        </div>
                    )}
                    <p className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 rounded">
                        {callAccepted ? (name || "Partner") : "Not Connected"}
                    </p>
                </div>
            </div>

            <div className="mt-8 flex gap-4">
                {receivingCall && !callAccepted ? (
                    <button
                        onClick={answerCall}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-lg shadow-lg animate-bounce"
                    >
                        Answer Call
                    </button>
                ) : null}

                {/* If initiator and not connected yet, show a 'Call' button? 
            Ideally auto-call or show button to start. 
            For now, simpler manual trigger within component or externally.
        */}

                <button
                    onClick={leaveCall}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-lg shadow-lg"
                >
                    End Call
                </button>
            </div>
        </div>
    );
}
