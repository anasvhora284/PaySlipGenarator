import React, {useEffect} from 'react';
import NetworkService from './src/services/networkService';
import {Provider as PaperProvider} from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import {ThemeProvider} from '@mui/material';
import {theme} from './src/styles/theme';

const App = () => {
  useEffect(() => {
    const networkService = NetworkService.getInstance();
    networkService.initialize();

    return () => {
      networkService.cleanup();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AppNavigator />
    </ThemeProvider>
  );
};

export default App;
