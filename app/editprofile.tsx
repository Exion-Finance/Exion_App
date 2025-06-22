import React, { useState } from 'react';
import { View, TextInput, Alert, TouchableOpacity, StyleSheet, ImageBackground, StatusBar as RNStatusBar, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSelector, useDispatch } from 'react-redux';
import { selectUserProfile } from './state/slices';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SecondaryFontText } from "@/components/SecondaryFontText";
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
import { PrimaryFontBold } from "@/components/PrimaryFontBold";
import { PrimaryFontText } from "@/components/PrimaryFontText";
import { updateUser, sendUpdateEmailOTP } from './Apiconfig/api';
import { setUserProfile } from './state/slices';
import Loading from "@/components/Loading";

const editProfileBackground = require('@/assets/images/Edit Profile Bg.png');
const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 15 : 0;

export default function EditProfileScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const user_profile = useSelector(selectUserProfile)

    const initial = user_profile?.userName?.[0]?.toUpperCase() ?? '?';

    const [username, setUsername] = useState(user_profile?.userName ?? '');
    const [usernameFocused, setUsernameFocused] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [saved, setSaved] = useState<boolean>(false);
    const [changeEmailClicked, setChangeEmailClicked] = useState<boolean>(false)

    const handleUsernameSave = async () => {
        try {
            if (user_profile?.userName === username) {
                console.log('Save username same as current');
                setUsernameFocused(false)
                return;
            }
            else if (!username) {
                console.log('Empty username');
                return;
            }
            setSaving(true)
            const updateRes = await updateUser({ username })
            console.log(updateRes.data)
            if (updateRes.data.success) {
                setSaved(true)
                dispatch(setUserProfile(updateRes.data.data))
                setTimeout(() => {
                    setUsernameFocused(false)
                    setSaved(false)
                }, 2000)
            }
            else {
                setUsernameFocused(false)
                Alert.alert("Oops😕", "Couldn't update username, try again")
            }
        } catch (error) {
            console.log(error)
            setUsernameFocused(false)
            Alert.alert("Oops😕", "Couldn't update username, try again")
        } finally {
            // setUsernameFocused(false)
            setSaving(false)
        }
    };

    const handleEmailChange = async() => {
        try{
            if(!user_profile?.email){
                console.log("No email found")
                return;
            }
            setChangeEmailClicked(true)
            const user = {
                email: user_profile?.email,
                source: 'editprofile',
                textOnButton: 'Continue',
                loadingText: 'Verifying..',
                title: 'Verify identity',
                description: 'To ensure your account\'s security, we\'ve sent a secure OTP to your email. Enter it here to verify it\'s you'
            }

            const otpRes = await sendUpdateEmailOTP(user_profile?.email)
            console.log(otpRes.status)
            if (otpRes.status === 200) {
                router.push({
                    pathname: '/otp',
                    params: {
                        user: JSON.stringify(user)
                    }
                });
                setChangeEmailClicked(false)
            }
            else {
                setChangeEmailClicked(false)
                Alert.alert("Oops🌵", "Could not send otp, please try again" )
            }

        }catch(error){
            console.log(error)
        }finally{}

    }

    return (
        <View style={styles.container}>
            <StatusBar style={'light'} />
            <ImageBackground style={styles.editProfileHeader} source={editProfileBackground}>

                <TouchableOpacity onPress={() => router.navigate('/profile')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 18 }}>
                    <Ionicons name="arrow-back-outline" size={19} color="#353434" />
                    <PrimaryFontMedium style={styles.title}>Edit Profile</PrimaryFontMedium>
                </TouchableOpacity>

                <View style={styles.initialContainer}>
                    <View style={styles.circle}>
                        <SecondaryFontText style={styles.initial}>{initial}</SecondaryFontText>
                    </View>

                    <View style={styles.info}>
                        <SecondaryFontText style={styles.username}>{user_profile?.userName}</SecondaryFontText>
                        <PrimaryFontMedium style={styles.email}>{user_profile?.email}</PrimaryFontMedium>
                    </View>
                </View>

            </ImageBackground>


            <View style={styles.bottomContainer}>
                <PrimaryFontBold style={{ marginBottom: 25, fontSize: 17 }}>User Details 🫣</PrimaryFontBold>

                <PrimaryFontMedium style={styles.label}>Username</PrimaryFontMedium>
                <View style={styles.unameInputRow}>
                    <TextInput
                        value={username}
                        onChangeText={setUsername}
                        onFocus={() => setUsernameFocused(true)}
                        onBlur={() => setUsernameFocused(false)}
                        onChange={() => setUsernameFocused(true)}
                        style={[
                            styles.unameInput,
                            {
                                borderColor: usernameFocused ? '#B5BFB5' : '#C3C3C3',
                                flex: usernameFocused ? 1 : 1.1,
                                borderWidth: usernameFocused ? 2 : 1,
                            },
                        ]}
                        placeholder="Username"
                    />
                    {usernameFocused && (
                        <TouchableOpacity onPress={handleUsernameSave} style={styles.saveBtn}>
                            {saving ?
                                <Loading color='#007AFF' description='' />
                                :
                                saved ?
                                    <PrimaryFontMedium style={{ fontSize: 25 }}>🎉</PrimaryFontMedium>
                                    :
                                    <PrimaryFontMedium style={{ color: '#007AFF', fontSize: 17 }}>Save</PrimaryFontMedium>
                            }
                        </TouchableOpacity>
                    )}
                </View>

                <PrimaryFontMedium style={styles.label}>Email</PrimaryFontMedium>
                <View style={styles.inputRow}>
                    <TextInput
                        defaultValue={user_profile?.email}
                        placeholder="Email"
                        editable={false}
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={handleEmailChange}>
                        {changeEmailClicked ? <Loading color='green' description='' /> : <PrimaryFontText style={styles.changeText}>Change</PrimaryFontText>}
                    </TouchableOpacity>
                </View>

                <PrimaryFontMedium style={styles.label}>Phone number</PrimaryFontMedium>
                <View style={styles.inputRow}>
                    <TextInput
                        defaultValue={user_profile?.phoneNumber}
                        placeholder="Phone number"
                        editable={false}
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={() => router.push('/')}>
                        <PrimaryFontText style={styles.changeText}>Change</PrimaryFontText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        height: '100%',
        backgroundColor: '#fff',
    },
    editProfileHeader: {
        height: 200,
        resizeMode: "cover",
        width: '100%',
        paddingTop: statusBarHeight,
    },
    bottomContainer: {
        flex: 1,
        paddingTop: 40,
        paddingHorizontal: 18,
        justifyContent: 'flex-start',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        marginTop: -25,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 18,
        marginLeft: 5,
        color: '#353434'
        // fontWeight: '600',
        // marginBottom: 24,
    },
    unameInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderColor: '#C3C3C3',
        padding: 12,
        paddingRight: 14,
        borderWidth: 1,
        borderRadius: 8,
    },
    input: {
        fontSize: 17,
        color: '#504646',
        fontFamily: 'DMSansMedium'
    },
    unameInput: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        fontSize: 17,
        color: '#504646',
        fontFamily: 'DMSansMedium'
    },
    saveBtn: {
        marginLeft: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    changeText: {
        color: 'green',
        fontSize: 15,
    },
    initialContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 18,
        marginTop: 28,
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#1BAE86',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        backgroundColor: '#FFF6C2'
    },
    initial: {
        fontSize: 25,
        color: '#000',
    },
    info: {
        justifyContent: 'center',
    },
    username: {
        fontSize: 21,
        color: '#000',
        // marginBottom: 5,
    },
    email: {
        fontSize: 14,
        color: '#585757',
        marginTop: 5,
    },
    label: {
        fontSize: 15,
        marginBottom: 8,
        color: '#79828E',
    }
});
