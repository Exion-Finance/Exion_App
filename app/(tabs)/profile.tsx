import { StyleSheet, View, Image, TouchableOpacity, ToastAndroid, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import userIcon from '@/assets/images/user.png';
import { PrimaryFontText } from '@/components/PrimaryFontText';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import reusableStyle from '@/constants/ReusableStyles';
import ProfileOption from '@/components/ProfileOption';
import NavBar from '@/components/NavBar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';
import * as SecureStore from "expo-secure-store";
import { useState } from 'react';
import { useAuth, TOKEN_KEY } from '../context/AuthContext';
import { selectUserProfile } from '../state/slices';
import { useSelector } from 'react-redux';
import Constants from 'expo-constants';
import Loading from "@/components/Loading";
// import { authAPI, publicAPI } from "../context/AxiosProvider";
import Feather from '@expo/vector-icons/Feather';

export default function Profile() {
  const route = useRouter()
  const { onClearData, onLogout } = useAuth()
  const [logout, setLogout] = useState<boolean>(false)

  const user_profile = useSelector(selectUserProfile)
  const appVersion = Constants.expoConfig?.version ?? Constants.manifest?.version ?? '1.0.0';

  const copyToClipboard = () => {
    Clipboard.setStringAsync(user_profile?.wallet?.publicKey as string);

    if (Platform.OS === 'android') {
      ToastAndroid.show('Text copied to clipboard!',
        ToastAndroid.SHORT);
    } else if (Platform.OS === 'ios') {
      alert('Text copied to clipboard!');
    }
  };


  const getRefreshToken = async () => {
    const stored = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!stored) {
      return null;
    }
    const parsed = JSON.parse(stored);
    const { refreshToken, token } = parsed;
    return refreshToken;
  }

  // const handleLogout = async () => {
  //   try {
  //     setLogout(true)
  //     const refreshToken = await getRefreshToken()
  //     console.log("token", refreshToken)
  //     if (refreshToken) {
  //       const response = await publicAPI.post(`/auth/logout`, { refreshToken });
  //       console.log(response.data)
  //       if (response.data.success) {
  //         await onClearData!()
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }
  //   finally {
  //     setLogout(false)
  //   }
  // }

  const handleLogout = async () => {
    try {
      setLogout(true)
      const refreshToken = await getRefreshToken()
      if (refreshToken) {
        await onLogout!(refreshToken)
      }
    }
    catch (error) {
      console.log(error)
    }
    finally {
      setLogout(false)
      route.replace('/login');
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style={'dark'} />
      <NavBar title='Profile' onBackPress={() => route.back()} />

      <View style={[styles.flexRow, reusableStyle.paddingContainer, { marginTop: 30 }]}>
        <Image source={userIcon} style={styles.userIcon} />
        <View>
          <View style={styles.flexRow}>
            <PrimaryFontBold style={{ fontSize: 19 }}>{user_profile?.userName || "--"}</PrimaryFontBold>
          </View>
          <PrimaryFontText style={{ fontSize: 15, color: '#79828E', marginTop: 5 }}>{user_profile?.email || "--"}</PrimaryFontText>
        </View>
      </View>

      <View style={[reusableStyle.paddingContainer, { flex: 1, justifyContent: 'space-between', backgroundColor: '#f8f8f8', marginTop: 20, paddingBottom: 20 }]}>
        <View>
          <ProfileOption
            option="Edit profile"
            icon={<Feather name="user" size={22} color="#00C48F" />}
            containerStyle={{ backgroundColor: '#f8f8f8', marginTop: 20 }}
            textStyle={{ fontSize: 19 }}
            route='/editprofile'
          />

          <ProfileOption
            option="Reset password"
            icon={<Feather name="lock" size={20} color="#00C48F" />}
            containerStyle={{ backgroundColor: '#f8f8f8' }}
            textStyle={{ fontSize: 19 }}
            route='/resetpasswordprofile'
          />

          <ProfileOption
            option="Settings"
            icon={<Feather name="settings" size={20} color="#00C48F" />}
            containerStyle={{ backgroundColor: '#f8f8f8' }}
            textStyle={{ fontSize: 19 }}
            route='/settings'
          />

          <View style={styles.separator}></View>

          <PrimaryFontMedium style={{ fontSize: 15, color: '#3A3B3C' }}>Wallet address</PrimaryFontMedium>

          <PrimaryFontText style={{ fontSize: 18, color: '#79828E', marginTop: 10, marginBottom: 15 }}>
            {user_profile?.wallet.publicKey
              ? `${user_profile.wallet.publicKey.slice(0, 13)}...${user_profile.wallet.publicKey.slice(-5)}`
              : "--"}
          </PrimaryFontText>

          <TouchableOpacity style={[styles.buttonContainer]} onPress={copyToClipboard}>
            <MaterialIcons name="content-copy" size={15} color="#00C48F" />
            <PrimaryFontMedium style={[styles.text]}>Tap to copy</PrimaryFontMedium>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center' }}>
          <PrimaryFontMedium style={{ fontSize: 10, marginBottom: 12, color: 'gray' }}>Version: {appVersion}</PrimaryFontMedium>
          {/* <PrimaryButton onPress={() => handleLogout()} textOnButton="Logout" route='/login' widthProp={reusableStyle.width100} /> */}

          <View style={[{ justifyContent: 'center', alignItems: 'center' }, reusableStyle.width100]}>
            <TouchableOpacity onPress={() => handleLogout()} style={styles.button}>
              <PrimaryFontBold style={{ color: 'white', fontSize: 19 }}>{logout ? (
                <Loading color='#fff' description='Logging out' />
              ) :
                "Logout"
              }
              </PrimaryFontBold>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f8f8f8'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '100%',
    backgroundColor: '#ECECEC'
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  userIcon: {
    width: 46,
    height: 45,
    marginRight: 10
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 11,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#DFE4E5',
    width: 160
  },
  text: {
    color: '#00C48F',
    fontSize: 16,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#00C48F',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 18,
    width: '100%',
    marginBottom: 10,
    // opacity: 0
  }
});
