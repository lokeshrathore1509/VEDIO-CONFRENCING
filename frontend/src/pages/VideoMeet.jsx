import React, { useEffect, useRef, useState, useCallback } from 'react';
import io from "socket.io-client";
import { Badge, IconButton, TextField, Tooltip, Snackbar } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import GroupIcon from '@mui/icons-material/Group';
import server from '../environment';

const server_url = server;
var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
};

export default function VideoMeetComponent() {
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    let chatBottomRef = useRef(null);

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState(true);
    let [audio, setAudio] = useState(true);
    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(false);
    let [screenAvailable, setScreenAvailable] = useState(false);
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);
    let [copied, setCopied] = useState(false);
    let [toastOpen, setToastOpen] = useState(false);
    let [toastMsg, setToastMsg] = useState("");

    const getPermissions = useCallback(async () => {
        try {
            let vAvailable = true;
            let aAvailable = true;

            try {
                const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoPermission) {
                    setVideoAvailable(true);
                    vAvailable = true;
                }
            } catch {
                setVideoAvailable(false);
                vAvailable = false;
            }

            try {
                const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (audioPermission) {
                    setAudioAvailable(true);
                    aAvailable = true;
                }
            } catch {
                setAudioAvailable(false);
                aAvailable = false;
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (vAvailable || aAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: vAvailable, 
                    audio: aAvailable 
                });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.error("Permission error:", error);
        }
    }, []);

    useEffect(() => {
        getPermissions();
    }, [getPermissions]);

    useEffect(() => {
        if (showModal && chatBottomRef.current) {
            chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, showModal]);

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    };

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    };

    let getUserMediaSuccess = useCallback((stream) => {
        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
        } catch (e) { 
            console.error(e); 
        }

        window.localStream = stream;
        if (localVideoref.current) {
            localVideoref.current.srcObject = stream;
        }

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                    })
                    .catch(e => console.error(e));
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(t => t.stop());
            } catch (e) { }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            if (localVideoref.current) {
                localVideoref.current.srcObject = window.localStream;
            }

            for (let id in connections) {
                connections[id].addStream(window.localStream);

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                        })
                        .catch(e => console.error(e));
                });
            }
        });
    }, []);

    let getUserMedia = useCallback(() => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .catch((e) => console.error(e));
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { }
        }
    }, [video, audio, videoAvailable, audioAvailable, getUserMediaSuccess]);

    useEffect(() => {
        if (!askForUsername && video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [video, audio, askForUsername, getUserMedia]);

    let getDislayMediaSuccess = useCallback((stream) => {
        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
        } catch (e) { console.error(e); }

        window.localStream = stream;
        if (localVideoref.current) {
            localVideoref.current.srcObject = stream;
        }

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                    })
                    .catch(e => console.error(e));
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(t => t.stop());
            } catch (e) { }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            if (localVideoref.current) {
                localVideoref.current.srcObject = window.localStream;
            }

            getUserMedia();
        });
    }, [getUserMedia]);

    let getDislayMedia = useCallback(() => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .catch((e) => {
                        console.error(e);
                        setScreen(false);
                    });
            }
        }
    }, [screen, getDislayMediaSuccess]);

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen, getDislayMedia]);

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
                            }).catch(e => console.error(e));
                        }).catch(e => console.error(e));
                    }
                }).catch(e => console.error(e));
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.error(e));
            }
        }
    };

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url || window.location.origin);

        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href);
            socketIdRef.current = socketRef.current.id;

            socketRef.current.on('chat-message', addMessage);

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
            });

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
                    
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };

                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream);
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }
                });

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;

                        try {
                            connections[id2].addStream(window.localStream);
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }));
                                })
                                .catch(e => console.error(e));
                        });
                    }
                }
            });
        });
    };

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    };

    let handleVideo = () => {
        setVideo(!video);
    };

    let handleAudio = () => {
        setAudio(!audio);
    };

    let handleScreen = () => {
        setScreen(!screen);
    };

    let handleEndCall = () => {
        try {
            if (localVideoref.current && localVideoref.current.srcObject) {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        } catch (e) { }
        window.location.href = "/";
    };

    let sendMessage = () => {
        if (!message.trim()) return;
        if (socketRef.current) {
            socketRef.current.emit('chat-message', message, username || "Guest");
            setMessage("");
        }
    };

    let connect = (e) => {
        if (e) e.preventDefault();
        if (!username.trim()) {
            setToastMsg("Please enter your name to join");
            setToastOpen(true);
            return;
        }
        setAskForUsername(false);
        getMedia();
    };

    let copyMeetingUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setToastMsg("Meeting link copied to clipboard!");
        setToastOpen(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div>
            {askForUsername === true ? (
                <div className={styles.lobbyContainer}>
                    <div className={styles.lobbyCard}>
                        <div className={styles.lobbyHeader}>
                            <h2>Enter the Lobby</h2>
                            <p>Check your camera & mic before joining the call</p>
                        </div>

                        <div className={styles.lobbyVideoWrapper}>
                            <video 
                                className={styles.lobbyVideo} 
                                ref={localVideoref} 
                                autoPlay 
                                muted 
                                playsInline
                            />
                            <div className={styles.lobbyVideoBadge}>
                                <span className={styles.liveDot}></span>
                                <span>Preview Ready</span>
                            </div>
                        </div>

                        <form className={styles.lobbyForm} onSubmit={connect}>
                            <TextField
                                className={styles.lobbyInput}
                                id="username-input"
                                label="Enter your name"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                variant="outlined"
                                autoFocus
                                fullWidth
                                required
                            />
                            <Button 
                                className={styles.lobbyConnectBtn}
                                variant="contained" 
                                type="submit"
                                fullWidth
                                disabled={!username.trim()}
                            >
                                Join Meeting Now
                            </Button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className={styles.meetVideoContainer}>
                    {/* Floating Chat Modal / Drawer */}
                    {showModal && (
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <div className={styles.chatHeader}>
                                    <h3>Meeting Chat</h3>
                                    <IconButton 
                                        className={styles.chatCloseBtn} 
                                        onClick={() => setModal(false)}
                                        size="small"
                                        aria-label="Close Chat"
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </div>

                                <div className={styles.chattingDisplay}>
                                    {messages.length !== 0 ? messages.map((item, index) => {
                                        const isSelf = item.sender === (username || "Guest");
                                        return (
                                            <div 
                                                key={index}
                                                className={`${styles.chatBubble} ${isSelf ? styles.chatBubbleSelf : styles.chatBubbleOther}`}
                                            >
                                                {!isSelf && <p className={styles.chatSenderName}>{item.sender}</p>}
                                                <p className={styles.chatMessageText}>{item.data}</p>
                                            </div>
                                        );
                                    }) : (
                                        <p style={{ color: '#94a3b8', textAlign: 'center', margin: 'auto' }}>
                                            No messages yet. Start the conversation!
                                        </p>
                                    )}
                                    <div ref={chatBottomRef} />
                                </div>

                                <div className={styles.chattingArea}>
                                    <TextField 
                                        className={styles.chatInput}
                                        value={message} 
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        placeholder="Type a message..."
                                        variant="outlined" 
                                        size="small"
                                    />
                                    <IconButton 
                                        className={styles.chatSendBtn} 
                                        onClick={sendMessage}
                                        disabled={!message.trim()}
                                        aria-label="Send Message"
                                    >
                                        <SendIcon sx={{ fontSize: '1.1rem' }} />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Remote Participants Videos or Empty State */}
                    <div className={styles.conferenceView}>
                        {videos.length > 0 ? (
                            videos.map((v) => (
                                <div className={styles.remoteVideoTile} key={v.socketId}>
                                    <video
                                        className={styles.remoteVideo}
                                        data-socket={v.socketId}
                                        ref={ref => {
                                            if (ref && v.stream) {
                                                ref.srcObject = v.stream;
                                            }
                                        }}
                                        autoPlay
                                        playsInline
                                    />
                                    <div className={styles.participantBadge}>
                                        Participant
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.waitingWrapper}>
                                <GroupIcon sx={{ fontSize: 64, color: '#ff9839', mb: 2, opacity: 0.8 }} />
                                <h3>Waiting for other participants to join...</h3>
                                <p>Share the meeting link with others so they can join this room.</p>
                                <Button
                                    className={styles.copyLinkBtn}
                                    startIcon={copied ? <CheckIcon sx={{ color: '#22c55e' }} /> : <ContentCopyIcon />}
                                    onClick={copyMeetingUrl}
                                >
                                    {copied ? "Link Copied!" : "Copy Meeting Link"}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Local User Picture-in-Picture */}
                    <video 
                        className={styles.meetUserVideo} 
                        ref={localVideoref} 
                        autoPlay 
                        muted 
                        playsInline
                    />

                    {/* Bottom Action Control Dock */}
                    <div className={styles.buttonContainers}>
                        <Tooltip title={video ? "Turn off camera" : "Turn on camera"}>
                            <IconButton 
                                onClick={handleVideo} 
                                className={`${styles.controlBtn} ${video ? styles.controlBtnActive : styles.controlBtnDisabled}`}
                            >
                                {video ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={audio ? "Mute microphone" : "Unmute microphone"}>
                            <IconButton 
                                onClick={handleAudio} 
                                className={`${styles.controlBtn} ${audio ? styles.controlBtnActive : styles.controlBtnDisabled}`}
                            >
                                {audio ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>
                        </Tooltip>

                        {screenAvailable && (
                            <Tooltip title={screen ? "Stop sharing screen" : "Share screen"}>
                                <IconButton 
                                    onClick={handleScreen} 
                                    className={`${styles.controlBtn} ${screen ? styles.controlBtnDisabled : styles.controlBtnActive}`}
                                >
                                    {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                                </IconButton>
                            </Tooltip>
                        )}

                        <Tooltip title="Meeting Chat">
                            <Badge badgeContent={newMessages} max={99} color="primary">
                                <IconButton 
                                    onClick={() => {
                                        setModal(!showModal);
                                        setNewMessages(0);
                                    }} 
                                    className={`${styles.controlBtn} ${showModal ? styles.controlBtnActive : styles.controlBtnActive}`}
                                >
                                    <ChatIcon />
                                </IconButton>
                            </Badge>
                        </Tooltip>

                        <Tooltip title="Leave Meeting">
                            <IconButton 
                                onClick={handleEndCall} 
                                className={`${styles.controlBtn} ${styles.endCallBtn}`}
                            >
                                <CallEndIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            )}

            <Snackbar
                open={toastOpen}
                autoHideDuration={3000}
                onClose={() => setToastOpen(false)}
                message={toastMsg}
            />
        </div>
    );
}
