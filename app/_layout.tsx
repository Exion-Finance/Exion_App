import FontAwesome from '@expo/vector-icons/FontAwesome';
import {  useRouter, usePathname } from "expo-router";
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './context/queryProvider';
import { persistor, store } from './state/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { ActivityIndicator } from 'react-native';



//const Stack = createNativeStackNavigator();
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'login',
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
    if (error) {
      console.log("Erorrrrrrrrrrrrrrrrxxxxxxx", error)
      throw error
    };
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
  const pathname = usePathname();
  const { authState, onLogout } = useAuth()
  useEffect(() => {
    // onLogout!()
    try {
      if (!authState?.authenticated) {
        route.push("/landing")
      } else {
        if (pathname === "/landing") {
          // console.log("Pushing to tabs screen")
          // console.log("pathname-->", pathname)
          route.push("/(tabs)");
          return;
        }
        // console.log("Tried pushing to tabs")
      }
    }
    catch (error) {
      onLogout!()
      console.log("/layout error-->", error)
    }

  }, [authState?.authenticated])






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



