import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type MainStackParamList = {
  MainTabs: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Alerts: undefined;
  Documents: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

// Navigation prop types
export type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;
export type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;
export type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
export type ResetPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ResetPassword'>;

export type DashboardScreenNavigationProp = StackNavigationProp<MainStackParamList, 'MainTabs'>;
export type AlertsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Alerts'>;
export type DocumentsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Documents'>;

// Route prop types
export type ResetPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;