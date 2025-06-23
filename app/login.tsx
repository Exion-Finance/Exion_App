import React, { useState, useEffect } from "react";
import PrimaryButton from "@/components/PrimaryButton";
import NavBar from "@/components/NavBar";
import validator from "validator";
import { StyleSheet, ScrollView, View, ImageBackground, TextInput, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FormDescription } from "@/components/FormDescription";
import { StatusBar } from "expo-status-bar";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import reusableStyles from '@/constants/ReusableStyles';
import { PrimaryFontText } from "@/components/PrimaryFontText";
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
const loginBackground = require('@/assets/images/LoginBackground.png');
import { useAuth } from "./context/AuthContext";
import FormErrorText from "@/components/FormErrorText";
import Loading from "@/components/Loading";

export default function Login() {
    const route = useRouter()
    const { onLogin } = useAuth()
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState(false);
    const [errorDescription, setErrorDescription] = useState<string>("");
    const [buttonClicked, setButtonClicked] = useState<boolean>(false);
    const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
    const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);

    const handleLogin = async () => {
        if (!isEmailValid) {
            setEmailError(true)
            setErrorDescription("Incorrect email format")
            return;
        }
        else if (!password) {
            setPasswordError(true)
            setErrorDescription("Password required")
            return;
        }
        if (!email) {
            setEmailError(true)
            setErrorDescription("Email required")
            return;
        }

        try {
            setButtonClicked(true)
            const res = await onLogin!(email, password);
            if (res && res.data.accesstoken) {
                setButtonClicked(false)
                route.push('/(tabs)');
            } else if (!res.data) {
                setButtonClicked(false)
                if (res.message === "Invalid credentials") {
                    setPasswordError(true)
                    setErrorDescription("Invalid email or password")
                }
                else {
                    setPasswordError(true)
                    setErrorDescription("Something went wrong")
                }
            }
        } catch (error) {
            setButtonClicked(false)
            setPasswordError(true)
            setErrorDescription("Invalid email or password")
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleForgotPassword = async () => {
        route.push('/emailaddress')
    };

    const title = 'Welcome Back!'
    const description = 'Please enter your phone number and password to continue'
    return (
        <ScrollView>
            <View style={styles.container}>
                <NavBar title='Login' onBackPress={() => route.push('/landing')} />
                <FormDescription title={title} description={description} />
                <ImageBackground style={styles.background} source={loginBackground}>

                    <View style={styles.formView}>
                        <View style={styles.formContainer}>

                            <PrimaryFontMedium style={styles.label}>Email</PrimaryFontMedium>
                            <TextInput
                                style={[styles.input, { borderColor: isEmailFocused ? '#B5BFB5' : '#C3C3C3', borderWidth: isEmailFocused ? 2 : 1 }]}
                                placeholder="you@example.com"
                                placeholderTextColor="#C3C2C2"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onChangeText={(text) => {
                                    setEmail(text.trim());
                                    setPasswordError(false);
                                    setEmailError(false)
                                    setIsEmailValid(validator.isEmail(text))
                                }}
                                onFocus={() => setIsEmailFocused(true)}
                                onBlur={() => setIsEmailFocused(false)}
                                value={email}
                            />
                            <FormErrorText error={emailError} errorDescription={errorDescription} />

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
                                        setEmailError(false);
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

                            <View style={[reusableStyles.width100, { alignItems: 'flex-end', marginBottom: 15 }]}>
                                <TouchableOpacity onPress={handleForgotPassword}>
                                    <PrimaryFontMedium style={{ fontSize: 17, color: '#008662' }}>Forgot password?</PrimaryFontMedium>
                                </TouchableOpacity>
                            </View>
                            <PrimaryButton onPress={() => handleLogin()} textOnButton={buttonClicked ?
                                <Loading color='#fff' description='Authenticating' />
                                : "Login"
                            } widthProp={reusableStyles.width100} />
                        </View>

                        <PrimaryFontText style={{ fontSize: 18, justifyContent: 'center', display: 'flex' }}>
                            Don't have an account?{' '}
                            <Text style={{ fontSize: 18, color: '#008662', fontFamily: 'DMSansRegular' }} onPress={() => route.push('/signup')}>Sign Up</Text>
                        </PrimaryFontText>
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
        height: 650,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 50,
    },
    background: {
        height: '100%',
        resizeMode: 'cover',
        width: '100%',
        marginTop: -60
    },
    formContainer: {
        height: '60%',
        padding: 18,
        width: '100%',
        paddingTop: 95
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#79828E',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 5,
        paddingHorizontal: 10,
        height: 57,
        backgroundColor: '#F8F8F8'
    },
    passwordInput: {
        flex: 1,
        fontSize: 18,
        color: '#000',
        fontFamily: 'DMSansRegular'
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
})