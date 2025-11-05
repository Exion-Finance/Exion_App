import React, { useState } from "react";
import PrimaryButton from "@/components/PrimaryButton";
import NavBar from "@/components/NavBar";
import validator from "validator";
import { StyleSheet, ScrollView, View, ImageBackground, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FormDescription } from "@/components/FormDescription";
import { StatusBar } from "expo-status-bar";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import reusableStyles from '@/constants/ReusableStyles';
import { PrimaryFontText } from "@/components/PrimaryFontText";
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
const signupBackground = require('@/assets/images/SignupBackground.png');
import { useAuth } from "./context/AuthContext";
import FormErrorText from "@/components/FormErrorText";
import Loading from "@/components/Loading";
import { sendSignUpEmailOtp } from "./Apiconfig/api";

export default function Signup() {

    const route = useRouter()
    const { onLogin, onRegister } = useAuth()
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [referralCode, setReferralCode] = useState<string>('');
    const [emailError, setEmailError] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [usernameError, setUsernameError] = useState<boolean>(false);
    const [referralCodeError, setReferralCodeError] = useState<boolean>(false);
    const [otpError, setOtpError] = useState<boolean>(false);
    const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
    const [isUsernameEmail, setIsUsernameEmail] = useState<boolean>(false);
    const [errorDescription, setErrorDescription] = useState("");
    const [buttonClicked, setButtonClicked] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
    const [isUsernameFocused, setIsUsernameFocused] = useState<boolean>(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
    const [isReferralCodeFocused, setIsReferralCodeFocused] = useState<boolean>(false);


    const handleContinueRegistration = async () => {
        if (!isEmailValid) {
            setEmailError(true)
            setErrorDescription("Incorrect email format")
            return;
        }
        else if(isUsernameEmail){
            setUsernameError(true)
            setErrorDescription("Username cannot be an email")
            return;
        }
        else if (!email) {
            setEmailError(true)
            setErrorDescription("Email empty")
            return;
        }
        else if (!username) {
            setUsernameError(true)
            setErrorDescription("Username empty")
            return;
        }
        else if (!password) {
            setPasswordError(true)
            setErrorDescription("Password empty")
            return;
        }
        else if(password.toString().length <= 8){
            setPasswordError(true)
            setErrorDescription("Password must be 8 characters or more")
            return;
        }

        else {
            try {
                setButtonClicked(true)
                const user = {
                    username,
                    password,
                    email,
                    code: referralCode,
                    source: 'signup',
                    textOnButton: 'Verify OTP',
                    loadingText: 'Verifying..',
                    title: 'Verify Email',
                    description: `Please enter the OTP sent to ${email} to finish setting up your account`
                }
                // console.log("user", user)
                const res = await sendSignUpEmailOtp(email)
                console.log("send email res", res.data)
                if (res.data.success) {
                    route.push({
                        pathname: '/otp',
                        params: {
                            user: JSON.stringify(user)
                        }
                    });
                    setButtonClicked(false)

                } else {
                    setEmailError(true)
                    setButtonClicked(false)
                    setErrorDescription("Failed to send OTP")
                }
            } catch (error: any) {
                setEmailError(true)
                console.log("Registration error:", error.response?.data?.message);

                setErrorDescription(error.response?.data?.message || "Please retry")
                setButtonClicked(false)
            }
        }
    }

    const handleWebview = (uri: string) =>{
        route.push({
            pathname: '/webview',
            params: {
                uri: uri
            }
        });
    }

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };
    const title = 'Create Account'
    const description = 'Enter the details below to create an account'
    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.scrollview}>
            <View style={styles.container}>
                <NavBar title='Sign Up' onBackPress={() => route.back()} />

                <ImageBackground style={styles.background} source={signupBackground}>
                    <FormDescription title={title} description={description} />
                    <View style={styles.formView}>

                        <View style={styles.formContainer}>
                            <PrimaryFontMedium style={styles.label}>Email Address</PrimaryFontMedium>
                            <TextInput
                                style={[styles.input, { borderColor: isEmailFocused ? '#B5BFB5' : '#C3C3C3', borderWidth: isEmailFocused ? 2 : 1 }]}
                                placeholder="user@example.com"
                                placeholderTextColor="#C3C2C2"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onChangeText={(text) => {
                                    setEmail(text.trim());
                                    setEmailError(false);
                                    setPasswordError(false);
                                    setUsernameError(false);
                                    setOtpError(false)
                                    setIsEmailValid(validator.isEmail(text))
                                }}
                                onFocus={() => setIsEmailFocused(true)}
                                onBlur={() => setIsEmailFocused(false)}
                                value={email}
                            />
                            <FormErrorText error={emailError} errorDescription={errorDescription} />


                            <PrimaryFontMedium style={styles.label}>Username</PrimaryFontMedium>
                            <TextInput
                                style={[styles.input, { borderColor: isUsernameFocused ? '#B5BFB5' : '#C3C3C3', borderWidth: isUsernameFocused ? 2 : 1 }]}
                                placeholder="Donnie"
                                placeholderTextColor="#C3C2C2"
                                keyboardType="default"
                                onChangeText={(text) => {
                                    setUsername(text);
                                    setPasswordError(false);
                                    setUsernameError(false);
                                    setOtpError(false)
                                    setIsUsernameEmail(validator.isEmail(text))
                                }}
                                onFocus={() => setIsUsernameFocused(true)}
                                onBlur={() => setIsUsernameFocused(false)}
                                value={username}
                            />
                            <FormErrorText error={usernameError} errorDescription={errorDescription} />

                            <PrimaryFontMedium style={styles.label}>Referral code(Optional)</PrimaryFontMedium>
                            <TextInput
                                style={[styles.input, { borderColor: isReferralCodeFocused ? '#B5BFB5' : '#C3C3C3', borderWidth: isReferralCodeFocused ? 2 : 1 }]}
                                placeholder="EXF6SD"
                                placeholderTextColor="#C3C2C2"
                                keyboardType="default"
                                onChangeText={(text) => {
                                    setReferralCode(text);
                                    setPasswordError(false);
                                    setUsernameError(false);
                                    setOtpError(false)
                                }}
                                onFocus={() => setIsReferralCodeFocused(true)}
                                onBlur={() => setIsReferralCodeFocused(false)}
                                value={referralCode}
                            />
                            <FormErrorText error={referralCodeError} errorDescription={errorDescription} />

                            <PrimaryFontMedium style={styles.label}>Password</PrimaryFontMedium>
                            <View style={[styles.passwordContainer, { borderColor: isPasswordFocused ? '#B5BFB5' : '#C3C3C3', borderWidth: isPasswordFocused ? 2 : 1 }]}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Password"
                                    placeholderTextColor="#C3C2C2"
                                    secureTextEntry={!passwordVisible}
                                    onChangeText={(text) => {
                                        setPassword(text.trim());
                                        setPasswordError(false);
                                        setUsernameError(false);
                                        setOtpError(false)
                                    }}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    value={password}
                                />
                                <TouchableOpacity onPress={togglePasswordVisibility}>
                                    <MaterialIcons
                                        name={passwordVisible ? "visibility-off" : "visibility"}
                                        size={24}
                                        color="#A5A5A5"
                                    />
                                </TouchableOpacity>
                            </View>
                            <FormErrorText error={passwordError} errorDescription={errorDescription} />

                            <View style={[reusableStyles.width100, { alignItems: 'center', marginBottom: 15, marginTop: 25 }]}>
                                <PrimaryFontText style={{ fontSize: 16, color: '#008662', textAlign: 'center' }}>By pressing continue you agree to our <PrimaryFontText style={{ textDecorationLine: 'underline' }} onPress={() => handleWebview('https://exion.finance/terms-of-use')}>terms of service</PrimaryFontText> and <PrimaryFontText style={{ textDecorationLine: 'underline' }} onPress={() => handleWebview('https://exion.finance/privacy-policy')}>privacy policy</PrimaryFontText></PrimaryFontText>
                            </View>
                            <PrimaryButton onPress={() => handleContinueRegistration()} textOnButton={buttonClicked ?
                                <Loading color='#fff' description='Please wait...' />
                                : "Continue"
                            } widthProp={reusableStyles.width100} />
                        </View>
                    </View>
                </ImageBackground>

                <StatusBar style={'dark'} />
            </View >
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    scrollview: {
        // height: '180%',
        backgroundColor: 'red',
        // borderWidth: 5,
        // borderColor: 'blue',
        flex: 1,
    },
    container: {
        flex: 1,
        // height: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        backgroundColor: '#fff',
        paddingBottom: 50
        // borderWidth: 3,
        // borderColor: 'blue'
    },
    formView: {
        // height: 590,
        // height: '90%',
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        // paddingBottom: 95,
        // borderWidth: 2,
        // borderColor: 'grey'
    },
    background: {
        height: '120%',
        // flex: 1,
        resizeMode: 'cover',
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    formContainer: {
        height: '60%',
        padding: 18,
        width: '100%',
        paddingTop: 28
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#79828E',
    },
    input: {
        height: 57,
        borderRadius: 5,
        paddingHorizontal: 15,
        fontSize: 18,
        color: '#000',
        backgroundColor: '#F8F8F8',
        fontFamily: 'DMSansRegular'
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 5,
        paddingHorizontal: 15,
        height: 57,
        backgroundColor: '#F8F8F8'
    },
    passwordInput: {
        flex: 1,
        fontSize: 18,
        color: '#000',
        fontFamily: 'DMSansRegular'
    },
})