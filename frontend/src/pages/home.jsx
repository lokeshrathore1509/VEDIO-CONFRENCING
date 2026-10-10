import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");


    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    return (
        <div className="homePageContainer">

            <div className="navBar">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <h2>Apna Video Call</h2>
                </div>

                <div className="navActions">
                    <button className="historyBtn" onClick={() => navigate("/history")}>
                        <RestoreIcon fontSize="small" />
                        <span>History</span>
                    </button>

                    <Button 
                        className="logoutBtn"
                        onClick={() => {
                            localStorage.removeItem("token")
                            navigate("/auth")
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Education</h2>

                        <div className="joinForm">
                            <TextField 
                                className="meetingInput"
                                onChange={e => setMeetingCode(e.target.value)} 
                                onKeyDown={e => {
                                    if (e.key === "Enter" && meetingCode.trim() !== "") {
                                        handleJoinVideoCall();
                                    }
                                }}
                                id="meeting-code-input" 
                                label="Meeting Code" 
                                variant="outlined" 
                                size="medium"
                            />
                            <Button 
                                className="joinBtn"
                                onClick={handleJoinVideoCall} 
                                variant='contained'
                                disabled={!meetingCode.trim()}
                            >
                                Join Call
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img src='/logo3.png' alt="Video Meeting Illustration" />
                </div>
            </div>
        </div>
    )
}


export default withAuth(HomeComponent)