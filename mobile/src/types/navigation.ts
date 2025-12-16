// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Loading: undefined;
  Error: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
  BiometricLogin: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Regulatory: undefined;
  Standards: undefined;
  Accreditation: undefined;
  Alerts: undefined;
  Reports: undefined;
  Documents: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type DrawerParamList = {
  Dashboard: undefined;
  Regulatory: undefined;
  Standards: undefined;
  Accreditation: undefined;
  Alerts: undefined;
  Reports: undefined;
  Documents: undefined;
  Faculty: undefined;
  Institutions: undefined;
  Profile: undefined;
  Settings: undefined;
};

// Screen Props Types
export type ScreenProps<T extends keyof RootStackParamList> = {
  navigation: any;
  route: any;
} & RootStackParamList[T];

export type AuthScreenProps<T extends keyof AuthStackParamList> = {
  navigation: any;
  route: any;
} & AuthStackParamList[T];

export type MainScreenProps<T extends keyof MainTabParamList> = {
  navigation: any;
  route: any;
  user: any;
  onLogout: () => void;
} & MainTabParamList[T];

// Navigation Event Types
export type NavigationEvent = {
  type: string;
  payload?: any;
};

// Stack Navigation Props
export type StackNavigationProp = {
  navigate: (routeName: string, params?: any) => void;
  goBack: () => void;
  push: (routeName: string, params?: any) => void;
  pop: (count?: number) => void;
  popToTop: () => void;
  replace: (routeName: string, params?: any) => void;
  reset: (index: number, routes: any[]) => void;
  isFocused: () => boolean;
  canGoBack: () => boolean;
};

// Tab Navigation Props
export type TabNavigationProp = StackNavigationProp & {
  jumpTo: (routeName: string, params?: any) => void;
};

// Drawer Navigation Props
export type DrawerNavigationProp = TabNavigationProp & {
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};