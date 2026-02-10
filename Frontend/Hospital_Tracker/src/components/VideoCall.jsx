import { useEffect, useRef, useState, useContext } from "react";
import Peer from "simple-peer";
import { socket } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";

export default function VideoCall({ roomId, partnerId, isInitiator, onEndCall, audioOnly, incomingSignal, partnerSocketId }) {
    const { user } = useContext(AuthContext);
    const [stream, setStream] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const peerRef = useRef();

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
                    console.log("Initiator sending signal");
                    socket.emit("callRoom", {
                        roomId,
                        signalData: data,
                        from: socket.id,
                        name: user.name,
                        callType: audioOnly ? "AUDIO" : "VIDEO"
                    });
                });

                peer.on("stream", (remoteStream) => {
                    console.log("Initiator received remote stream");
                    if (userVideo.current) userVideo.current.srcObject = remoteStream;
                });

                peer.on("error", (err) => {
                    console.error("Peer error (initiator):", err);
                });

                peerRef.current = peer;
                connectionRef.current = peer;

                // Listen for answer from the other peer
                const handleCallAccepted = (signal) => {
                    console.log("Call accepted, signaling peer");
                    setCallAccepted(true);
                    if (peerRef.current && !peerRef.current.destroyed) {
                        try {
                            peerRef.current.signal(signal);
                        } catch (err) {
                            console.error("Error signaling peer:", err);
                        }
                    }
                };

                socket.on("callAccepted", handleCallAccepted);

                return () => {
                    socket.off("callAccepted", handleCallAccepted);
                    if (currentStream) currentStream.getTracks().forEach(t => t.stop());
                    if (peerRef.current) peerRef.current.destroy();
                };

            } else if (incomingSignal) {
                // Answering Logic
                setCallAccepted(true);
                const peer = new Peer({
                    initiator: false,
                    trickle: false,
                    stream: currentStream
                });

                peer.on("signal", (data) => {
                    console.log("Answerer sending signal");
                    socket.emit("answerCall", { signal: data, to: partnerSocketId });
                });

                peer.on("stream", (remoteStream) => {
                    console.log("Answerer received remote stream");
                    if (userVideo.current) userVideo.current.srcObject = remoteStream;
                });

                peer.on("error", (err) => {
                    console.error("Peer error (answerer):", err);
                });

                try {
                    peer.signal(incomingSignal);
                } catch (err) {
                    console.error("Error signaling incoming call:", err);
                }

                peerRef.current = peer;
                connectionRef.current = peer;

                return () => {
                    if (currentStream) currentStream.getTracks().forEach(t => t.stop());
                    if (peerRef.current) peerRef.current.destroy();
                };
            }

        }).catch(err => {
            console.error("Media Error:", err);
            alert("Camera/Mic Error: " + err.message);
            onEndCall();
        });

        // Listen for call ended event
        const handleCallEnded = () => {
            console.log("Call ended by remote peer");
            leaveCall();
        };

        socket.on("callEnded", handleCallEnded);

        return () => {
            socket.off("callEnded", handleCallEnded);
        };
    }, []);

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
                            <p className="animate-pulse">
                                {isInitiator ? "Calling..." : "Connecting..."}
                            </p>
                        </div>
                    )}
                    <p className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 rounded">
                        {callAccepted ? "Partner" : "Not Connected"}
                    </p>
                </div>
            </div>

            <div className="mt-8 flex gap-4">
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
