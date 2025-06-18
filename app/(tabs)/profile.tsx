import { StyleSheet, View, Image, TouchableOpacity, ToastAndroid, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import userIcon from '@/assets/images/user.png';
import { PrimaryFontText } from '@/components/PrimaryFontText';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import reusableStyle from '@/constants/ReusableStyles';
import PrimaryButton from "@/components/PrimaryButton";
import ProfileOption from '@/components/ProfileOption';
import NavBar from '@/components/NavBar';
import Edit from '@/assets/icons/Edit';
import Lock from '@/assets/icons/Lock';
import Settings from '@/assets/icons/Settings';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from 'react';
import { useAuth, TOKEN_KEY } from '../context/AuthContext';
import { selectUserProfile } from '../state/slices';
import { useDispatch, useSelector } from 'react-redux';
import Constants from 'expo-constants';

export default function Profile() {
  const route = useRouter()
  const { onLogout } = useAuth()


  // const [userdetails, setUserDetails] = useState<UserDetails>({ id: "", userName: "", email: "" })

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
    if(!stored){
      return null;
    }
    const parsed = JSON.parse(stored);
    const { refreshToken } = parsed;
    return refreshToken;
  }

  const handleLogout = async () => {
    const refreshToken = await getRefreshToken()
    if(refreshToken){
      await onLogout!(refreshToken)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style={'dark'} />
      <NavBar title='Profile' onBackPress={() => route.push('/(tabs)')} />

      <View style={[styles.flexRow, reusableStyle.paddingContainer, { marginTop: 30 }]}>
        <Image source={userIcon} style={styles.userIcon} />
        <View>
          <View style={styles.flexRow}>
            <PrimaryFontBold style={{ fontSize: 19 }}>{user_profile?.userName || "--"}</PrimaryFontBold>
          </View>
          <PrimaryFontText style={{ fontSize: 15, color: '#79828E', marginTop: 5 }}>{user_profile?.email || "--"}</PrimaryFontText>
        </View>
      </View>

      <View style={[reusableStyle.paddingContainer, { flex: 1, justifyContent: 'space-between', backgroundColor: 'white', marginTop: 20, paddingBottom: 20 }]}>
        <View>
          <ProfileOption
            option="Edit profile"
            icon={<Edit />}
            containerStyle={{ backgroundColor: 'white', marginTop: 20 }}
            textStyle={{ fontSize: 18 }}
          />

          <ProfileOption
            option="Reset password"
            icon={<Lock />}
            containerStyle={{ backgroundColor: 'white' }}
            textStyle={{ fontSize: 18 }}
          />

          <ProfileOption
            option="Settings"
            icon={<Settings />}
            containerStyle={{ backgroundColor: 'white' }}
            textStyle={{ fontSize: 18 }}
          />

          <View style={styles.separator}></View>

          <PrimaryFontMedium style={{ fontSize: 15, color: '#3A3B3C' }}>Wallet address</PrimaryFontMedium>

          <PrimaryFontText style={{ fontSize: 18, color: '#79828E', marginTop: 10, marginBottom: 15 }}>
          {user_profile.wallet.publicKey
            ? `${user_profile.wallet.publicKey.slice(0, 13)}...${user_profile.wallet.publicKey.slice(-5)}`
            : "--"}
          </PrimaryFontText>

          <TouchableOpacity style={[styles.buttonContainer]} onPress={copyToClipboard}>
            <MaterialIcons name="content-copy" size={15} color="#00C48F" />
            <PrimaryFontMedium style={[styles.text]}>Tap to copy</PrimaryFontMedium>
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center'}}>
        <PrimaryFontBold style={{ fontSize: 10, marginBottom: 12, color: 'gray' }}>Version: {appVersion}</PrimaryFontBold>
        <PrimaryButton onPress={() => handleLogout()} textOnButton="Logout" route='/login' widthProp={reusableStyle.width100} />
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
    backgroundColor: 'white'
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
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DFE4E5',
    width: 160
  },
  text: {
    color: '#00C48F',
    fontSize: 16,
    marginLeft: 5,
  }
});
