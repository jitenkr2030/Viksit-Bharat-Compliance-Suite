/**
 * PARSS - Penalty Avoidance & Regulatory Survival System - Mobile App
 * Main Application Component
 */

import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Alert,
  AppState,
  AppStateStatus
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-root-toast';
import SplashScreen from 'react-native-splash-screen';
import Orientation from 'react-native-orientation-locker';
import KeepAwake from 'react-native-keep-awake';

// Contexts and Services
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { QueryProvider } from './src/contexts/QueryContext';
import { initializeServices } from './src/services';

// Navigation
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { navigationRef } from './src/navigation/RootNavigation';

// Types
import { RootStackParamList } from './src/types/navigation';
import { User } from './src/types/auth';

// Screens
import LoadingScreen from './src/screens/LoadingScreen';
import ErrorBoundaryScreen from './src/screens/ErrorBoundaryScreen';

// Configuration
import { COLORS } from './src/constants/theme';
import { APP_CONFIG } from './src/constants/app';

// Services
import { AuthService } from './src/services/AuthService';
import { NotificationService } from './src/services/NotificationService';
import { StorageService } from './src/services/StorageService';
import { BiometricService } from './src/services/BiometricService';

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Initialize application
  const initializeApp = async () => {
    try {
      // Lock orientation to portrait
      Orientation.lockToPortrait();
      
      // Keep screen awake for compliance work
      KeepAwake.activate();

      // Initialize services
      await initializeServices();

      // Check authentication status
      await checkAuthStatus();

      // Setup error handling
      setupErrorHandling();

      // Hide splash screen
      SplashScreen.hide();

      setIsAppReady(true);
      setIsLoading(false);
    } catch (error) {
      console.error('App initialization error:', error);
      setIsLoading(false);
      showErrorAlert('Failed to initialize application');
    }
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const token = await StorageService.getAuthToken();
      if (token) {
        // Validate token and get user data
        const userData = await AuthService.validateToken();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          
          // Enable biometric authentication if available
          await BiometricService.enableBiometricIfAvailable();
        } else {
          // Invalid token, clear storage
          await StorageService.clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await StorageService.clearAuthData();
    }
  };

  // Handle app state changes
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background') {
      // App went to background
      console.log('App went to background');
    } else if (nextAppState === 'active') {
      // App came to foreground
      console.log('App came to foreground');
      
      // Check if we need to re-authenticate
      if (isAuthenticated) {
        try {
          const userData = await AuthService.validateToken();
          if (!userData) {
            // Token expired, logout user
            await logout();
            Toast.show('Session expired. Please login again.', {
              duration: Toast.durations.LONG,
              backgroundColor: COLORS.error
            });
          }
        } catch (error) {
          console.error('Token validation error:', error);
          await logout();
        }
      }
    }
  };

  // Setup global error handling
  const setupErrorHandling = () => {
    // Global error handler
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError(...args);
      
      // Log critical errors
      if (args[0]?.includes?.('Warning:')) {
        // React warnings are not critical
        return;
      }
      
      // Report critical errors (in production)
      if (APP_CONFIG.environment === 'production') {
        // TODO: Send to error reporting service
        console.log('Critical error:', args);
      }
    };
  };

  // Show error alert
  const showErrorAlert = (message: string) => {
    Alert.alert(
      'Error',
      message,
      [
        {
          text: 'OK',
          onPress: () => {
            // Could implement retry logic here
          }
        }
      ]
    );
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear storage
      await StorageService.clearAuthData();
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      
      // Logout from services
      await AuthService.logout();
      await NotificationService.unregister();
      
      Toast.show('Logged out successfully', {
        duration: Toast.durations.SHORT,
        backgroundColor: COLORS.success
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Render loading screen
  if (!isAppReady || isLoading) {
    return <LoadingScreen />;
  }

  // Render error boundary
  if (!isAppReady) {
    return <ErrorBoundaryScreen />;
  }

  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <NotificationProvider>
            <NavigationContainer ref={navigationRef}>
              <StatusBar
                barStyle="light-content"
                backgroundColor={COLORS.primary}
                translucent={false}
              />
              
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  gestureEnabled: false,
                  cardStyle: { backgroundColor: COLORS.background }
                }}
              >
                {!isAuthenticated ? (
                  // Authentication flow
                  <Stack.Screen name="Auth" component={AuthNavigator} />
                ) : (
                  // Main application flow
                  <Stack.Screen name="Main">
                    {(props) => (
                      <MainNavigator
                        {...props}
                        user={user}
                        onLogout={logout}
                      />
                    )}
                  </Stack.Screen>
                )}
              </Stack.Navigator>
            </NavigationContainer>
          </NotificationProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  }
});

export default App;