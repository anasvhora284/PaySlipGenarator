import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';

class NetworkService {
  static instance = null;
  isConnected = false;
  unsubscribe = null;

  static getInstance() {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  async initialize() {
    try {
      // Check initial connection state
      const state = await NetInfo.fetch();
      this.isConnected = state.isConnected;

      // Subscribe to network state updates
      this.unsubscribe = NetInfo.addEventListener(networkState => {
        this.isConnected = networkState.isConnected;
      });

      // Setup axios interceptors
      this.setupAxiosInterceptors();
    } catch (error) {
      console.error('Failed to initialize network service:', error);
    }
  }

  setupAxiosInterceptors() {
    axios.interceptors.request.use(
      async config => {
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
          throw new Error('No internet connection');
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    axios.interceptors.response.use(
      response => response,
      error => {
        if (!this.isConnected) {
          throw new Error('No internet connection');
        }
        return Promise.reject(error);
      },
    );
  }

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

export default NetworkService;
