import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Chip,
  Stack,
  Paper,
  Divider
} from '@mui/material';
import {
  Rocket as RocketIcon,
  TouchApp as TouchAppIcon,
  Info as InfoIcon,
  Celebration as CelebrationIcon,
  LocalFireDepartment as FireIcon
} from '@mui/icons-material';

// Create Material Design theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  const [clickCount, setClickCount] = useState(0);
  const [versions, setVersions] = useState({
    node: '',
    chrome: '',
    electron: ''
  });

  useEffect(() => {
    // Get version information
    setVersions({
      node: process.versions.node,
      chrome: process.versions.chrome,
      electron: process.versions.electron
    });
  }, []);

  const handleClick = () => {
    setClickCount(clickCount + 1);
  };

  const getButtonContent = () => {
    if (clickCount === 0) return { text: 'Click Me!', icon: <TouchAppIcon /> };
    if (clickCount === 1) return { text: 'Click Me Again!', icon: <TouchAppIcon /> };
    if (clickCount === 5) return { text: 'Wow! 5 clicks!', icon: <CelebrationIcon /> };
    if (clickCount >= 10) return { text: "You're on fire!", icon: <FireIcon /> };
    return { text: 'Click Me!', icon: <TouchAppIcon /> };
  };

  const buttonContent = getButtonContent();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={8}
            sx={{
              padding: 4,
              borderRadius: 4,
            }}
          >
            <Stack spacing={3} alignItems="center">
              {/* Header */}
              <Box textAlign="center">
                <Typography
                  variant="h3"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <RocketIcon fontSize="large" sx={{ color: '#667eea' }} />
                  Electron + React
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Built with Material Design
                </Typography>
              </Box>

              <Divider flexItem />

              {/* Version Information */}
              <Card
                variant="outlined"
                sx={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <InfoIcon color="primary" />
                      <Typography variant="h6" component="h2">
                        App Information
                      </Typography>
                    </Box>
                    
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        label={`Node ${versions.node}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        label={`Chrome ${versions.chrome}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        label={`Electron ${versions.electron}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* Interactive Button */}
              <Box textAlign="center" width="100%">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={buttonContent.icon}
                  onClick={handleClick}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    paddingX: 4,
                    paddingY: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 50,
                    textTransform: 'none',
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {buttonContent.text}
                </Button>
                
                <Typography
                  variant="h6"
                  sx={{
                    marginTop: 2,
                    color: 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  Button clicked{' '}
                  <Box
                    component="span"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 700,
                      fontSize: '1.3rem',
                    }}
                  >
                    {clickCount}
                  </Box>{' '}
                  times
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
