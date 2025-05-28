import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, NavigationContainer, ThemeProvider } from '@react-navigation/native';
import { Redirect, useRouter } from "expo-router";
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './context/queryProvider';
import { persistor, store } from './state/store';
import { Provider } from 'react-redux';


import { useColorScheme } from '@/components/useColorScheme';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { ActivityIndicator } from 'react-native';



//const Stack = createNativeStackNavigator();
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'landing',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    SpaceGrotesk: require('../assets/fonts/SpaceGrotesk-Bold.ttf'),
    DMSansMedium: require('../assets/fonts/DMSans-Medium.ttf'),
    DMSansRegular: require('../assets/fonts/DMSans-Regular.ttf'),
    DMSansBold: require('../assets/fonts/DMSans-Bold.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator size="small" />} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </QueryClientProvider>
      </PersistGate>

    </Provider>
  );
}

function RootLayoutNav() {
  const route = useRouter()
  const { authState, onLogout } = useAuth()
  useEffect(() => {
    // onLogout!()
    if (!authState?.authenticated) {
      route.push("/landing")
    } else {
      route.push("/(tabs)")

    }
  }, [authState])






  return (
    <Stack>
      <Stack.Screen name="landing" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="makepayment" options={{ headerShown: false }} />
      <Stack.Screen name="keyboard" options={{ headerShown: false }} />
      <Stack.Screen name="contacts" options={{ headerShown: false }} />
      <Stack.Screen name="optionalmessage" options={{ headerShown: false }} />
      <Stack.Screen name="tillnumber" options={{ headerShown: false }} />
      <Stack.Screen name="sendmoney" options={{ headerShown: false }} />
      <Stack.Screen name="paybillbusinessnumber" options={{ headerShown: false }} />
      <Stack.Screen name="paybillaccountnumber" options={{ headerShown: false }} />
      <Stack.Screen name="fundingmethod" options={{ headerShown: false }} />
      <Stack.Screen name="fundingamount" options={{ headerShown: false }} />
      <Stack.Screen name="otp" options={{ headerShown: false }} />
      <Stack.Screen name="sendcrypto" options={{ headerShown: false }} />
      <Stack.Screen name="emailaddress" options={{ headerShown: false }} />
      <Stack.Screen name="verifyphonenumber" options={{ headerShown: false }} />
      <Stack.Screen name="resetpassword" options={{ headerTitle: 'Reset Password', headerTitleStyle: { fontFamily: 'DMSansMedium', fontSize: 18, } }} />
    </Stack>
  );
}



