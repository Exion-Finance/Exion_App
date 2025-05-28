import React, { useState, useEffect } from "react";
import PrimaryButton from "@/components/PrimaryButton";
import NavBar from "@/components/NavBar";
import validator from "validator";
import { StyleSheet, ScrollView, View, ImageBackground, TextInput, Text, TouchableOpacity, Image, FlatList, Modal, Animated } from "react-native";
import { useRouter } from "expo-router";
import { FormDescription } from "@/components/FormDescription";
import { StatusBar } from "expo-status-bar";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import reusableStyles from '@/constants/ReusableStyles';
import { PrimaryFontText } from "@/components/PrimaryFontText";
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
import * as SecureStore from "expo-secure-store"
import { TOKEN_KEY } from './context/AuthContext';
import { sendOtpWhatsapp } from "./Apiconfig/api";
const loginBackground = require('@/assets/images/LoginBackground.png');
import { useAuth } from "./context/AuthContext";
import FormErrorText from "@/components/FormErrorText";
import Loading from "@/components/Loading";

export default function Login() {

    const countries = [
        { country: "Kenya", countryCode: "+254", flag: "https://flagsapi.com/KE/flat/64.png" },
        // { country: "Uganda", countryCode: "+256", flag: "https://flagsapi.com/UG/flat/64.png" },
        // { country: "Tanzania", countryCode: "+255", flag: "https://flagsapi.com/TZ/flat/64.png" },
    ];

    const route = useRouter()
    const { onLogin } = useAuth()
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
    const [emailError, setEmailError] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState(false);
    const [errorDescription, setErrorDescription] = useState<string>("");
    const [buttonClicked, setButtonClicked] = useState<boolean>(false);
    const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
    const [userPhoneNumber, setUserPhoneNumber] = useState<string>("")

    const handleSelectCountry = (country: typeof countries[0]) => {
        setSelectedCountry(country);
        setDropdownVisible(false);
    };

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
            if (res && res.data) {
                setButtonClicked(false)
                route.push({
                    pathname: '/(tabs)',
                    params: {
                        userName: JSON.stringify(res.data.data.userName)
                    }
                });
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
            alert("Something went wrong")
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
                            {/* <PrimaryFontMedium style={styles.label}>Phone Number</PrimaryFontMedium>
                            <View style={styles.phoneContainer}>
                                <TouchableOpacity
                                    style={styles.dropdown}
                                    onPress={() => setDropdownVisible(true)}
                                >
                                    <Image source={{ uri: selectedCountry.flag }} style={styles.flag} />
                                    <PrimaryFontMedium style={styles.countryCode}>{selectedCountry.countryCode}</PrimaryFontMedium>
                                </TouchableOpacity>

                                <TextInput
                                    style={styles.contactInput}
                                    placeholder="701234567"
                                    placeholderTextColor="#D2D2D2"
                                    keyboardType="phone-pad"
                                    onChangeText={(text) => {
                                        setPhoneNumber(text);
                                        setPhoneNumberError(false);
                                        setPasswordError(false);
                                    }}
                                />
                            </View>
                            <FormErrorText error={phoneNumberError} errorDescription={errorDescription} /> */}


                            <PrimaryFontMedium style={styles.label}>Email</PrimaryFontMedium>
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor="#D2D2D2"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setPasswordError(false);
                                    setEmailError(false)
                                    setIsEmailValid(validator.isEmail(text))
                                }}
                                value={email}
                            />
                            <FormErrorText error={emailError} errorDescription={errorDescription} />

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
                                        setEmailError(false);
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

                        <Modal visible={dropdownVisible} transparent={true} animationType="slide">
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContainer}>
                                    <FlatList
                                        data={countries}
                                        keyExtractor={(item) => item.countryCode}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.modalItem}
                                                onPress={() => handleSelectCountry(item)}
                                            >
                                                <Image source={{ uri: item.flag }} style={styles.flag} />
                                                <PrimaryFontText style={styles.countryName}>{item.country}</PrimaryFontText>
                                            </TouchableOpacity>
                                        )}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setDropdownVisible(false)}
                                        style={styles.closeButton}
                                    >
                                        <PrimaryFontMedium style={styles.closeText}>Close</PrimaryFontMedium>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>

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


const formatPhoneNumber = (phoneNumber: string, countryCode: string): string => {
    // Remove whitespace and ensure phone number is a string
    const cleanedNumber = phoneNumber.trim();

    // Check for empty phone number
    if (!cleanedNumber || cleanedNumber.trim() === "") {
        return "Phone number required";
    }

    // Check for valid length
    if (cleanedNumber.length < 9 || cleanedNumber.length > 10) {
        return "Invalid phone number format";
    }

    // Handle cases starting with "07"
    if (cleanedNumber.startsWith("07") && cleanedNumber.length === 10) {
        return `${countryCode}${cleanedNumber.slice(1)}`;
    }

    // Handle cases starting with "7"
    if (cleanedNumber.startsWith("7")) {
        return `${countryCode}${cleanedNumber}`;
    }

    // Handle cases not starting with either 0, 7, 254, +254
    if (
        !cleanedNumber.startsWith("0") &&
        !cleanedNumber.startsWith("7") &&
        !cleanedNumber.startsWith("254") &&
        !cleanedNumber.startsWith("+254") &&
        !cleanedNumber.startsWith("011")
    ) {
        return "Invalid phone number";
    }

    // Handle cases starting with "011"
    if (cleanedNumber.startsWith("011") && cleanedNumber.length === 10) {
        return `${countryCode}${cleanedNumber}`;
    }

    // Default case for unsupported formats
    return "Invalid phone number format";
};


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
        borderColor: '#C3C3C3',
        borderWidth: 0.7,
        borderRadius: 5,
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
    input: {
        height: 55,
        borderColor: '#C3C3C3',
        borderWidth: 0.7,
        borderRadius: 5,
        paddingHorizontal: 10,
        fontSize: 17,
        color: '#000',
        backgroundColor: '#F8F8F8',
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "white",
        width: "86%",
        borderRadius: 10,
        padding: 16,
    },
    modalItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },
    countryName: {
        fontSize: 18,
        marginLeft: 10,
    },
    closeButton: {
        marginTop: 20,
        alignSelf: "center",
    },
    closeText: {
        fontSize: 18,
        color: "#00C48F",
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
    }
})