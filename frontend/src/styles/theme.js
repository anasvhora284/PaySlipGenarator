import {createTheme} from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0D6EFD',
      light: '#EBF3FF',
      dark: '#0756CA',
    },
    secondary: {
      main: '#FFB800',
      light: '#FFE4B5',
      dark: '#CC9200',
    },
    error: {
      main: '#FF4D4F',
    },
    warning: {
      main: '#ed6c02',
    },
    success: {
      main: '#52C41A',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
    background: {
      default: '#EBF3FF',
      paper: '#FFFFFF',
    },
  },
  shape: {
    borderRadius: 16,
  },
});
