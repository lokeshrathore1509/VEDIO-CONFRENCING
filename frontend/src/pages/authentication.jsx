import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar, Alert } from '@mui/material';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#d97500',
            light: '#ff9839',
            dark: '#b86200',
            contrastText: '#ffffff',
        },
        background: {
            default: '#0a0e1a',
            paper: '#131b2e',
        },
        text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
        },
    },
    typography: {
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    shape: {
        borderRadius: 12,
    },
});

export default function Authentication() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async (e) => {
        if (e) e.preventDefault();
        setError("");
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                setUsername("");
                setMessage(result || "Registered successfully! Please log in.");
                setOpen(true);
                setError("");
                setFormState(0);
                setPassword("");
            }
        } catch (err) {
            console.error(err);
            let errMsg = err?.response?.data?.message || err?.message || "An error occurred. Please try again.";
            setError(errMsg);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <Grid container component="main" sx={{ minHeight: '100vh', background: '#0a0e1a' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        background: 'radial-gradient(circle at 30% 30%, rgba(217, 117, 0, 0.25) 0%, transparent 60%), linear-gradient(135deg, #0b1021 0%, #151d38 100%)',
                        display: { xs: 'none', sm: 'flex' },
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 4,
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Box sx={{ maxWidth: 480, textAlign: 'center', zIndex: 2 }}>
                        <Avatar
                            sx={{
                                width: 72,
                                height: 72,
                                bgcolor: 'rgba(217, 117, 0, 0.15)',
                                color: '#ff9839',
                                border: '2px solid rgba(255, 152, 57, 0.4)',
                                mx: 'auto',
                                mb: 3,
                            }}
                        >
                            <VideoCallIcon sx={{ fontSize: 44 }} />
                        </Avatar>
                        <Box component="h1" sx={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: '#ffffff', mb: 2, fontFamily: "'Outfit', sans-serif" }}>
                            Apna Video Call
                        </Box>
                        <Box component="p" sx={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>
                            High-quality, crystal-clear, peer-to-peer video conferencing for everyone, anywhere.
                        </Box>
                    </Box>
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={8}
                    md={5}
                    component={Paper}
                    elevation={0}
                    square
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: { xs: 3, sm: 5, md: 6 },
                        backgroundColor: '#131b2e',
                        borderLeft: { sm: '1px solid rgba(255, 255, 255, 0.08)' },
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: 400,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 48, height: 48 }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        <Box component="h2" sx={{ fontSize: '1.6rem', fontWeight: 700, mt: 1, mb: 3, color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}>
                            {formState === 0 ? "Welcome Back" : "Create Account"}
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                width: '100%',
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                p: '4px',
                                borderRadius: '999px',
                                mb: 3,
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                        >
                            <Button
                                fullWidth
                                variant={formState === 0 ? "contained" : "text"}
                                onClick={() => { setFormState(0); setError(""); }}
                                sx={{
                                    borderRadius: '999px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: formState === 0 ? '0 4px 12px rgba(217, 117, 0, 0.4)' : 'none',
                                }}
                            >
                                Sign In
                            </Button>
                            <Button
                                fullWidth
                                variant={formState === 1 ? "contained" : "text"}
                                onClick={() => { setFormState(1); setError(""); }}
                                sx={{
                                    borderRadius: '999px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: formState === 1 ? '0 4px 12px rgba(217, 117, 0, 0.4)' : 'none',
                                }}
                            >
                                Sign Up
                            </Button>
                        </Box>

                        <Box component="form" onSubmit={handleAuth} noValidate sx={{ width: '100%' }}>
                            {formState === 1 && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="fullname"
                                    label="Full Name"
                                    name="fullname"
                                    value={name}
                                    autoFocus={formState === 1}
                                    onChange={(e) => setName(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus={formState === 0}
                                onChange={(e) => setUsername(e.target.value)}
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                sx={{ mb: 1 }}
                            />

                            {error && (
                                <Box sx={{ mt: 1.5, mb: 1 }}>
                                    <Alert severity="error" sx={{ borderRadius: '8px' }}>
                                        {error}
                                    </Alert>
                                </Box>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    py: 1.4,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 6px 18px rgba(217, 117, 0, 0.4)',
                                    '&:hover': {
                                        boxShadow: '0 8px 24px rgba(217, 117, 0, 0.6)',
                                    }
                                }}
                            >
                                {formState === 0 ? "Sign In" : "Register"}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                message={message}
            />
        </ThemeProvider>
    );
}