import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import { Button, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async (codeToJoin) => {
        const code = (typeof codeToJoin === 'string' && codeToJoin.trim()) ? codeToJoin.trim() : meetingCode.trim();
        if (!code) return;
        await addToUserHistory(code);
        navigate(`/${code}`);
    };

    let handleStartInstantMeeting = async () => {
        const randomCode = Math.random().toString(36).substring(2, 10);
        await addToUserHistory(randomCode);
        navigate(`/${randomCode}`);
    };

    return (
        <div className="homePageContainer">
            <div className="navBar">
                <div className="navBrand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    <VideoCallIcon sx={{ color: "#ff9839", fontSize: { xs: "1.6rem", sm: "2rem" } }} />
                    <h2>Apna Video Call</h2>
                </div>

                <div className="navActions">
                    <button className="historyBtn" onClick={() => navigate("/history")} aria-label="Meeting History">
                        <RestoreIcon fontSize="small" />
                        <span>History</span>
                    </button>

                    <Button 
                        className="logoutBtn"
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="leftPanel">
                    <div className="leftPanelContent">
                        <h2>Quality Video Meetings for Everyone</h2>
                        <p className="meetSubtitle">
                            Connect, collaborate, and celebrate from anywhere with secure video calling.
                        </p>

                        <div className="quickActionsRow">
                            <Button 
                                className="instantMeetBtn"
                                variant="contained"
                                startIcon={<AddCircleOutlineIcon />}
                                onClick={handleStartInstantMeeting}
                            >
                                New Meeting
                            </Button>
                        </div>

                        <div className="joinDivider">
                            <span>or join with code</span>
                        </div>

                        <div className="joinForm">
                            <TextField 
                                className="meetingInput"
                                value={meetingCode}
                                onChange={e => setMeetingCode(e.target.value)} 
                                onKeyDown={e => {
                                    if (e.key === "Enter" && meetingCode.trim() !== "") {
                                        handleJoinVideoCall();
                                    }
                                }}
                                id="meeting-code-input" 
                                placeholder="Enter meeting code" 
                                variant="outlined" 
                                size="medium"
                                fullWidth
                            />
                            <Button 
                                className="joinBtn"
                                onClick={() => handleJoinVideoCall()} 
                                variant='contained'
                                disabled={!meetingCode.trim()}
                            >
                                Join
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img src='/logo3.png' alt="Video Meeting Illustration" />
                </div>
            </div>
        </div>
    );
}

export default withAuth(HomeComponent);