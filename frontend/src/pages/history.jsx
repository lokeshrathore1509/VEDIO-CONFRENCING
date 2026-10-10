import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import { IconButton } from '@mui/material';
import '../App.css';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(Array.isArray(history) ? history : []);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [getHistoryOfUser]);

    let formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="historyPageWrapper">
            <div className="historyContainer">
                <div className="historyHeader">
                    <div className="historyHeaderTitle">
                        <IconButton 
                            className="historyBackBtn"
                            onClick={() => navigate("/home")}
                            aria-label="Back to Home"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <h2>Meeting History</h2>
                    </div>
                    {meetings.length > 0 && (
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            {meetings.length} {meetings.length === 1 ? 'call' : 'calls'}
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="historyEmptyState">
                        <p>Loading your history...</p>
                    </div>
                ) : meetings.length !== 0 ? (
                    <div className="historyGrid">
                        {meetings.map((item, index) => (
                            <Card key={item._id || index} className="historyCardItem">
                                <div className="historyCardContent">
                                    <div className="historyMeetingInfo">
                                        <h4>Meeting: {item.meetingCode}</h4>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <CalendarMonthIcon sx={{ fontSize: '1rem', color: '#ff9839' }} />
                                            <span>{formatDate(item.date)}</span>
                                        </p>
                                    </div>
                                    <Button
                                        className="historyRejoinBtn"
                                        startIcon={<VideoCallIcon />}
                                        onClick={() => navigate(`/${item.meetingCode}`)}
                                    >
                                        Rejoin
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="historyEmptyState">
                        <HistoryToggleOffIcon sx={{ fontSize: 56, color: '#64748b', mb: 1 }} />
                        <p>No past meetings found in your history.</p>
                        <Button
                            variant="contained"
                            className="joinBtn"
                            onClick={() => navigate("/home")}
                            sx={{
                                background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                                color: 'white',
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '999px',
                                px: 3,
                                py: 1,
                            }}
                        >
                            Start a Meeting
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
