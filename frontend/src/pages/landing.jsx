import React from 'react';
import "../App.css";
import { Link, useNavigate } from 'react-router-dom';
import VideoCallIcon from '@mui/icons-material/VideoCall';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div 
            className='landingPageContainer'
            style={{
                backgroundImage: 'linear-gradient(135deg, rgba(10, 14, 26, 0.95), rgba(19, 27, 46, 0.92)), url(/background.png)',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundSize: 'cover'
            }}
        >
            <nav>
                <div className='navHeader' onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    <VideoCallIcon sx={{ color: "#ff9839", fontSize: { xs: "1.75rem", sm: "2.2rem" } }} />
                    <h2>Apna Video Call</h2>
                </div>
                <div className='navlist'>
                    <button className='navGuestBtn' onClick={() => {
                        const randomId = Math.random().toString(36).substring(2, 9);
                        navigate(`/${randomId}`);
                    }}>
                        Join as Guest
                    </button>
                    <button className='navAuthBtn' onClick={() => navigate("/auth")}>
                        Register
                    </button>
                    <button className='navLoginBtn' onClick={() => navigate("/auth")}>
                        Login
                    </button>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div className="landingHeroText">
                    <h1>
                        <span className="gradientHighlight">Connect</span> with your loved ones
                    </h1>
                    <p>
                        Crystal-clear, high quality peer-to-peer video calling without boundaries. Start or join instant meetings from any device.
                    </p>
                    <div className="heroActionGroup">
                        <Link to="/auth" className="getStartedBtn">
                            Get Started Free
                        </Link>
                    </div>
                </div>
                <div className="landingHeroImage">
                    <img src="/mobile.png" alt="Mobile Video Conferencing Preview" />
                </div>
            </div>
        </div>
    );
}
