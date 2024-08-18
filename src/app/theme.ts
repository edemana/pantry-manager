import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4a90e2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: 'rgba(30, 30, 30, 0.8)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          position: 'relative',
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          overflow: 'hidden',
          '::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
            backgroundImage: 'url("background.jpg")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            filter: 'blur(3px)', // Blur effect applied here
            transform: 'scale(1.1)', // Slightly scales the image to cover edges
          },
        },
      },
    },
  },
});

export default theme;
