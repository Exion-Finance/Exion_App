// import { useState, useCallback, useEffect } from 'react';
// import { useRouter, usePathname, router } from "expo-router";
// import { useFonts } from 'expo-font';
// // import * as Font from 'expo-font';
// import { Stack } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { QueryClientProvider } from '@tanstack/react-query';
// import queryClient from './context/queryProvider';
// import { persistor, store } from './state/store';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/lib/integration/react';
// import { ActivityIndicator } from 'react-native';
// import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';
// import { useTokenValidation } from './hooks/useTokenValidation';
// import * as SecureStore from "expo-secure-store";
// import { authAPI } from "./context/AxiosProvider";
// import { TOKEN_KEY } from "./context/AuthContext";
// import { setUserProfile } from './state/slices';
// import { useDispatch, useSelector } from 'react-redux';

// export {
//   // Catch any errors thrown by the Layout component.
//   ErrorBoundary,
// } from 'expo-router';

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: 'login',
// };

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const { onLoadToken } = useAuth()
//   // const dispatch = useDispatch()

//   const [loaded, error] = useFonts({
//     SpaceGrotesk: require('../assets/fonts/SpaceGrotesk-Bold.ttf'),
//     DMSansMedium: require('../assets/fonts/DMSans-Medium.ttf'),
//     DMSansRegular: require('../assets/fonts/DMSans-Regular.ttf'),
//     DMSansBold: require('../assets/fonts/DMSans-Bold.ttf'),
//   });

//   // const isTokenValid = useTokenValidation();
//   // console.log("Hooooooook", isTokenValid)
//   const [appReady, setAppReady] = useState(false);
//   const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
//   const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
//   const [tokenValid, setTokenValid] = useState<boolean | null>(null);

//   // Expo Router uses Error Boundaries to catch errors in the navigation tree.
//   // useEffect(() => {
//   //   if (error) {
//   //     console.log("Erorrrrrrrrrrrrrrrrxxxxxxx", error)
//   //     throw error
//   //   };
//   // }, [error]);

//   // useEffect(() => {
//   //   const load = false
//   //   if (loaded || error) {
//   //     SplashScreen.hideAsync();
//   //     setAppReady(true);
//   //   }
//   // }, [loaded, error]);

//   // if (!loaded) {
//   //   return null;
//   // }

//   useEffect(() => {
//     console.log("Loaded ueffectt called")
//     if (loaded) {
//       console.log("Loaded true in ueffectt called")
//       // SplashScreen.hideAsync();
//       setAppReady(true);
//     }
//   }, [loaded]);

//   // useEffect(() => {
//   //   if (loaded) {
//   //     // SplashScreen.hideAsync();
//   //     setAppReady(true);
//   //   }
//   // }, [loaded]);





//   useEffect(() => {
//     // Keep the splash up until we’re ready
//     // SplashScreen.preventAutoHideAsync();

//     (async () => {
//       // if (loaded || error) {
//       //   try {
//       //     const valid = await onLoadToken!();
//       //     console.log("Hook responseeee", valid)
//       //     if (!valid) {
//       //       // Redirect if token invalid
//       //       router.replace('/login');
//       //       return;
//       //     }
//       //     setTokenValid(true);
//       //   } catch {
//       //     setTokenValid(false);
//       //     router.replace('/login');
//       //   } finally {
//       //     // Now that fonts & token check are done, hide splash
//       //     await SplashScreen.hideAsync();
//       //   }
//       // }
//       const sumn = useTokenValidation()
//       console.log("sumn founddd-->", sumn)
//       if(sumn){
//         setIsUserAuthenticated(true)
//         return;
//       }
//       console.log("sumn-->", sumn)
//       setIsUserAuthenticated(true)
//     })();
//   }, [ isUserAuthenticated]);

//   if (!appReady || !isUserAuthenticated) {
//     console.log("ONe is still false. Appready->", appReady, isUserAuthenticated)
//     return null;
//   }

//   if (appReady && isUserAuthenticated) {
//     console.log("Both are now truuuueeee")
//     SplashScreen.hideAsync();
//   }

//   // const hideSplash = !appReady || !isUserAuthenticated;

//   // console.log("<<<hideSplash----------->", hideSplash)

//   // if (loaded && tokenValid !== true) {
//   //   return null;
//   // }

//   // useEffect(() => {
//   //   // Only proceed once fonts are loaded (or errored) AND token check is done
//   //   if ((loaded || error) && isTokenValid !== null) {
//   //     if (isTokenValid) {
//   //       setAppReady(true);
//   //     } else {
//   //       // redirect to login if token invalid
//   //       // router.replace('/login');
//   //       console.log("isTokenValid inueeee", isTokenValid)
//   //     }
//   //     SplashScreen.hideAsync();
//   //   }
//   // }, [loaded, error, isTokenValid, router]);

//   // if (!appReady) {
//   //   return null; 
//   // }

//   // const showAnimatedSplash = !appReady || !splashAnimationFinished;
//   // // console.log("isUserAuthenticated inside", isUserAuthenticated)

//   // if (showAnimatedSplash) {
//   //   return (
//   //     <AnimatedSplashScreen
//   //       onAnimationFinish={(isCancelled) => {
//   //         if (!isCancelled) {
//   //           setSplashAnimationFinished(true);
//   //         }
//   //       }}
//   //     />
//   //   );
//   // }

//   // const { authState, onLogout, setAuthState, onLoadToken } = useAuth()


//   // const dispatch = useDispatch()

//   // const checkIfAuthenticated = async () => {
//   //   const stored = await SecureStore.getItemAsync(TOKEN_KEY);
//   //   if (!stored) {
//   //     console.log("No token found in local store")
//   //     return false;
//   //   };

//   //   const parsed = JSON.parse(stored);
//   //   const { token } = parsed;

//   //   try {
//   //     const checkIfValid = await authAPI.get(`/user/profile`);
//   //     console.log("Check layout if user is authenticated res", checkIfValid.data)

//   //     if (checkIfValid.data.success) {
//   //       dispatch(setUserProfile(checkIfValid.data.data))
//   //       setAuthState!({ token, authenticated: true });
//   //       console.log("Authenticated from layout")
//   //       return true;
//   //     }

//   //   } catch (error) {
//   //     console.log(error)
//   //   }
//   // }

//   return (
//     <Provider store={store}>
//       <PersistGate loading={<ActivityIndicator size="small" />} persistor={persistor}>
//         <QueryClientProvider client={queryClient}>
//           <AuthProvider>
//             <RootLayoutNav />
//           </AuthProvider>
//         </QueryClientProvider>
//       </PersistGate>

//     </Provider>
//   );
// }

// function RootLayoutNav() {
//   const route = useRouter()
//   const pathname = usePathname();
//   const { authState, onLogout, setAuthState, onLoadToken } = useAuth()
//   // const dispatch = useDispatch()

//   // setIsUserAuthenticated(true)

//   // const checkIfAuthenticated = async () => {
//   //   const stored = await SecureStore.getItemAsync(TOKEN_KEY);
//   //   if (!stored) {
//   //     console.log("No token found in local store")
//   //     return false;
//   //   };

//   //   const parsed = JSON.parse(stored);
//   //   const { token } = parsed;

//   //   try {
//   //     const checkIfValid = await authAPI.get(`/user/profile`);
//   //     console.log("Check layout if user is authenticated res", checkIfValid.data)

//   //     if (checkIfValid.data.success) {
//   //       dispatch(setUserProfile(checkIfValid.data.data))
//   //       setAuthState!({ token, authenticated: true });
//   //       console.log("Authenticated from layout")
//   //       return true;
//   //     }

//   //   } catch (error) {
//   //     console.log(error)
//   //   }
//   // }
//   // useEffect(() => {
//   //   (async () => {
//   //     try {
//   //       console.log("Useeffect in layout....")
//   //       const isTokenValid = await onLoadToken!();
//   //       console.log("isTokenValidddddd--->>", isTokenValid)
//   //     } catch (err) {
//   //       console.error("Useeffect failed", err);
//   //     }
//   //   })();
//   // }, []);

//   useEffect(() => {
//     // onLogout!()
//     try {
//       // console.log("pathname-->", pathname)
//       if (!authState?.authenticated && pathname === "/login") {
//         // route.replace("/login")
//         router.replace("/login");
//         return;
//       }
//       else if (!authState?.authenticated) {
//         // route.replace("/landing")
//         router.replace("/landing");
//         return;
//       }
//       else {
//         if (pathname === "/landing" || pathname === "/login") {
//           // console.log("Pushing to tabs screen")
//           // console.log("pathname-->", pathname)
//           route.push("/(tabs)");
//           return;
//         }
//         // console.log("Tried pushing to tabs")
//       }
//     }
//     catch (error) {
//       // onLogout!()
//       console.log("/layout error-->", error)
//     }

//   }, [authState?.authenticated])






//   return (
//     <Stack>
//       <Stack.Screen name="landing" options={{ headerShown: false }} />
//       <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
//       <Stack.Screen name="login" options={{ headerShown: false }} />
//       <Stack.Screen name="signup" options={{ headerShown: false }} />
//       <Stack.Screen name="index" options={{ headerShown: false }} />
//       <Stack.Screen name="makepayment" options={{ headerShown: false }} />
//       <Stack.Screen name="keyboard" options={{ headerShown: false }} />
//       <Stack.Screen name="contacts" options={{ headerShown: false }} />
//       <Stack.Screen name="optionalmessage" options={{ headerShown: false }} />
//       <Stack.Screen name="tillnumber" options={{ headerShown: false }} />
//       <Stack.Screen name="sendmoney" options={{ headerShown: false }} />
//       <Stack.Screen name="paybillbusinessnumber" options={{ headerShown: false }} />
//       <Stack.Screen name="paybillaccountnumber" options={{ headerShown: false }} />
//       <Stack.Screen name="fundingmethod" options={{ headerShown: false }} />
//       <Stack.Screen name="fundingamount" options={{ headerShown: false }} />
//       <Stack.Screen name="otp" options={{ headerShown: false }} />
//       <Stack.Screen name="sendcrypto" options={{ headerShown: false }} />
//       <Stack.Screen name="emailaddress" options={{ headerShown: false }} />
//       <Stack.Screen name="verifyphonenumber" options={{ headerShown: false }} />
//       <Stack.Screen name="webview" options={{ headerShown: false }} />
//       <Stack.Screen name="editprofile" options={{ headerShown: false }} />
//       <Stack.Screen name="changeemail" options={{ headerShown: false }} />
//       <Stack.Screen name="resetpasswordprofile" options={{ headerShown: false }} />
//       <Stack.Screen name="changephonenumber" options={{ headerShown: false }} />
//       <Stack.Screen name="settings" options={{ headerShown: false }} />
//       <Stack.Screen name="resetpassword" options={{ headerTitle: 'Reset Password', headerTitleStyle: { fontFamily: 'DMSansMedium', fontSize: 18, } }} />
//     </Stack>
//   );
// }


import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
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

  // useEffect(() => {
  //   (async () => {
  //     console.log("Token valid inside useff---->", tokenValid)
  //     if ((fontsLoaded || fontError) && tokenValid !== null) {
  //       if (!tokenValid) {

  //         router.replace('/landing');
  //         // await SplashScreen.hideAsync();
  //       } else {
  //         setReady(true);
  //       }
  //       await SplashScreen.hideAsync();
  //       router.push('/(tabs)');
  //     }
      
  //   })();
  // }, [fontsLoaded, fontError, tokenValid]);



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
      <Stack.Screen name="resetpassword" options={{ headerTitle: 'Reset Password', headerTitleStyle: { fontFamily: 'DMSansMedium', fontSize: 18, } }} />
    </Stack>
  );
}
