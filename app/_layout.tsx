import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { store, persistor } from './state/store';
import queryClient from './context/queryProvider';
import { useTokenValidation } from './hooks/useTokenValidation';
import { useRouter, Stack } from 'expo-router';
import { useAuth} from "./context/AuthContext";

// Prevent splash auto hiding
SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator size="small" />} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppInitializer />
          </AuthProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}

function AppInitializer() {
  const router = useRouter();
  const { setAuthState } = useAuth()
  
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk: require('../assets/fonts/SpaceGrotesk-Bold.ttf'),
    DMSansMedium: require('../assets/fonts/DMSans-Medium.ttf'),
    DMSansRegular: require('../assets/fonts/DMSans-Regular.ttf'),
    DMSansBold: require('../assets/fonts/DMSans-Bold.ttf'),
  });
  const tokenValid = useTokenValidation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      // console.log("Token valid inside useff ---->", tokenValid);
      const fontsReady = fontsLoaded || fontError;
  
      if (fontsReady && tokenValid !== null) {
        if (tokenValid === false) {
          // No token or token is invalid
          setReady(true);
          setAuthState!({ token: null, authenticated: false });
          await SplashScreen.hideAsync();
          // router.replace('/landing');
          return;
        }
  
        // Token is valid
        setReady(true);
        await SplashScreen.hideAsync();
        router.replace('/(tabs)');
      }
    })();
  }, [fontsLoaded, fontError, tokenValid]);
  
  if (!ready) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="landing" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
      <Stack.Screen name="webview" options={{ headerShown: false }} />
      <Stack.Screen name="editprofile" options={{ headerShown: false }} />
      <Stack.Screen name="changeemail" options={{ headerShown: false }} />
      <Stack.Screen name="resetpasswordprofile" options={{ headerShown: false }} />
      <Stack.Screen name="changephonenumber" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="enterwalletaddress" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="resetpassword" options={{ headerTitle: 'Reset Password', headerTitleStyle: { fontFamily: 'DMSansMedium', fontSize: 18, } }} />
    </Stack>
  );
}
