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
import { sendOtpEmail } from "./Apiconfig/api";

export default function Signup() {

    const route = useRouter()
    const { onLogin, onRegister } = useAuth()
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [emailError, setEmailError] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [usernameError, setUsernameError] = useState<boolean>(false);
    const [otpError, setOtpError] = useState<boolean>(false);
    const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);

    const [errorDescription, setErrorDescription] = useState("");
    const [buttonClicked, setButtonClicked] = useState(false);

    const handleContinueRegistration = async () => {
        if (!isEmailValid) {
            setEmailError(true)
            setErrorDescription("Incorrect email format")
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

        else {
            try {
                setButtonClicked(true)
                const user = {
                    username,
                    password,
                    email,
                    source: 'verify-email',
                    textOnButton: 'Verify OTP',
                    loadingText: 'Verifying..',
                    title: 'Verify Email',
                    description: `Please enter the OTP sent to ${email} to finish setting up your account`
                }
                const res = await sendOtpEmail(email)
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

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };
    const title = 'Create Account'
    const description = 'Enter the details below to create an account'
    return (
        <ScrollView>
            <View style={styles.container}>
                <NavBar title='Sign Up' onBackPress={() => route.push('/login')} />

                <ImageBackground style={styles.background} source={signupBackground}>
                    <FormDescription title={title} description={description} />
                    <View style={styles.formView}>

                        <View style={styles.formContainer}>
                            <PrimaryFontMedium style={styles.label}>Email Address</PrimaryFontMedium>
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor="#D2D2D2"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setEmailError(false);
                                    setPasswordError(false);
                                    setUsernameError(false);
                                    setOtpError(false)
                                    setIsEmailValid(validator.isEmail(text))
                                }}
                                value={email}
                            />
                            <FormErrorText error={emailError} errorDescription={errorDescription} />


                            <PrimaryFontMedium style={styles.label}>Username</PrimaryFontMedium>
                            <TextInput
                                style={styles.input}
                                placeholder="Donnie"
                                placeholderTextColor="#D2D2D2"
                                keyboardType="default"
                                onChangeText={(text) => {
                                    setUsername(text);
                                    setPasswordError(false);
                                    setUsernameError(false);
                                    setOtpError(false)
                                }}
                                value={username}
                            />
                            <FormErrorText error={usernameError} errorDescription={errorDescription} />

                            <PrimaryFontMedium style={styles.label}>Password</PrimaryFontMedium>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Password"
                                    placeholderTextColor="#D2D2D2"
                                    secureTextEntry={!passwordVisible}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setPasswordError(false);
                                        setUsernameError(false);
                                        setOtpError(false)
                                    }}
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
                                <PrimaryFontText style={{ fontSize: 16, color: '#008662', textAlign: 'center' }}>By pressing continue you agree to our terms of service and privacy policy</PrimaryFontText>
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
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        backgroundColor: '#fff'
    },
    formView: {
        height: 590,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 55,
    },
    background: {
        height: '100%',
        resizeMode: 'cover',
        width: '100%',
    },
    formContainer: {
        height: '60%',
        padding: 18,
        width: '100%',
        paddingTop: 40
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#79828E',
    },
    input: {
        height: 55,
        borderColor: '#C3C3C3',
        borderWidth: 0.7,
        borderRadius: 5,
        paddingHorizontal: 10,
        // marginBottom: 20,
        fontSize: 17,
        color: '#000',
        backgroundColor: '#F8F8F8',
        fontFamily: 'DMSansRegular'
    },
    contactInput: {
        flex: 1,
        paddingHorizontal: 15,
        height: 55,
        fontSize: 17,
        color: '#000',
        backgroundColor: '#F8F8F8',
        borderColor: '#C3C3C3',
        borderWidth: 0.7,
        borderRadius: 5,
        fontFamily: 'DMSansRegular'
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#D4D4D4',
        borderWidth: 0.7,
        borderRadius: 5,
        // marginBottom: 14,
        paddingHorizontal: 10,
        height: 55,
        backgroundColor: '#F8F8F8'
    },
    passwordInput: {
        flex: 1,
        fontSize: 17,
        color: '#000',
        fontFamily: 'DMSansRegular'
    },



    // Changes
    phoneContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    dropdown: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F8F8",
        paddingHorizontal: 10,
        height: 55,
        fontSize: 16,
        color: '#000',
        borderColor: '#00C48F',
        borderWidth: 1,
        borderRadius: 5,
        marginRight: 7
    },
    flag: {
        width: 22,
        height: 14,
        marginRight: 8,
    },
    countryCode: {
        fontSize: 17,
        color: "#333",
        marginRight: 4
    }
})