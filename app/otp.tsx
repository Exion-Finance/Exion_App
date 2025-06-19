import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { PrimaryFontBold } from "@/components/PrimaryFontBold";
import { PrimaryFontText } from "@/components/PrimaryFontText";
import { useRouter, useLocalSearchParams, Href } from 'expo-router';
import { FormDescription } from "@/components/FormDescription";
import NavBar from '@/components/NavBar';
import Loading from '@/components/Loading';
import reusableStyles from '@/constants/ReusableStyles';
import { useAuth } from "./context/AuthContext";
import { verifyEmailOTP } from "./Apiconfig/api";


interface User {
    username?: string;
    phoneNumber: string;
    password?: string;
    title: string;
    email?: string;
    description: string;
    source: string;
    textOnButton: string;
    loadingText: string;
}

export default function OTP({ }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [counter, setCounter] = useState(30);
    const [buttonClicked, setButtonClicked] = useState<boolean>(false)
    const [emptyOtpError, setEmptyOtpError] = useState<boolean>(false);
    const [errorDescription, setErrorDescription] = useState<string>("")
    const { onLogin, onRegister } = useAuth()

    const route = useRouter()

    const inputRefs = useRef<Array<TextInput | null>>([]);

    const { user } = useLocalSearchParams();
    let parsedUser: User | null = null;

    try {
        parsedUser = user ? JSON.parse(user as string) : null;
        // console.log("parsedUser-->", parsedUser)
    } catch (error) {
        console.error('Failed to parse user:', error);
    }


    const handleChange = (text: string, index: number) => {
        if (text.length > 1) return; // Only allow single-digit input
        setEmptyOtpError(false)
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Move to the next input if available
        if (text && index < 5) {
            setActiveIndex(index + 1);
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
            // Move to the previous input on backspace if current is empty
            setEmptyOtpError(false)
            setActiveIndex(index - 1);
            inputRefs.current[index - 1]?.focus();
        }
    };

    useEffect(() => {
        if (counter > 0) {
            const timer = setInterval(() => {
                setCounter((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [counter]);


    const filterOTP = (currentOtp: string[]) => {
        const isOtpComplete = currentOtp.every((digit) => digit.trim() !== "");
        if (!isOtpComplete) {
            setEmptyOtpError(true);
            setErrorDescription("Please enter a valid OTP.")
            setButtonClicked(false)
            return;
        }
        const filteredOtp = currentOtp.join("");
        return filteredOtp;
    };

    const handleOtpSubmit = async () => {
        if (parsedUser?.source === "verifyphonenumber") {
            setButtonClicked(true)
            const filteredOtp = filterOTP(otp) ?? ""
            if (!filteredOtp) {
                return;
            }

            if (!parsedUser?.username || !parsedUser.email || !parsedUser.password) {
                throw new Error("Missing required user fields");
            }

            const res = await onRegister!(
                parsedUser.phoneNumber,
                parsedUser.password,
                parsedUser.email,
                parsedUser.username,
                filteredOtp
            )
            if (res.error){
                setEmptyOtpError(true)
                setErrorDescription(res.message)
                setButtonClicked(false)
                return;
            }
            else if(res.status == 201){
                // console.log("Else called meaning no res.error")
                // console.log("Register user response->", res.data)
                const login = await onLogin!(parsedUser.email, parsedUser.password)
                if (login && login.data) {
                    setButtonClicked(false)
                    Alert.alert("Success🎉", "Your account has been created successfully")
                    setTimeout(() => route.push('/(tabs)'), 2000)
                }
            }
            setButtonClicked(false)
        }
        else if (parsedUser?.source === "emailaddress") {
            try {
                setButtonClicked(true)
                const filteredOtp = filterOTP(otp) ?? ""
                if (!filteredOtp) {
                    return;
                }
                const res = await verifyEmailOTP(filteredOtp);
                if (res.data.success) {
                    setButtonClicked(false)
                    route.push({
                        pathname: '/resetpassword',
                        params: {
                            email: parsedUser?.email,
                            otp: filteredOtp
                        }
                    })
                }
            } catch (error) {
                setButtonClicked(false)
                setEmptyOtpError(true);
                setErrorDescription("Please enter a valid OTP.")
            }
        }
        else if (parsedUser?.source === "signup") {
            try {
                setButtonClicked(true)
                const filteredOtp = filterOTP(otp) ?? ""
                if (!filteredOtp) {
                    return;
                }
                const res = await verifyEmailOTP(filteredOtp);
                if (res.data.success) {
                    setButtonClicked(false)
                    const user = {
                        email: parsedUser?.email,
                        username: parsedUser?.username,
                        password: parsedUser?.password,
                    }
                    route.push({
                        pathname: '/verifyphonenumber',
                        params: {
                            user: JSON.stringify(user)
                        }
                    })
                }
            } catch (error) {
                setButtonClicked(false)
                setEmptyOtpError(true);
                setErrorDescription("Please enter a valid OTP.")
            }
        }
    }


    return (
        <View style={styles.container}>
            <NavBar title='OTP' onBackPress={() => route.push(`/${parsedUser?.source}` as Href<string | object>)} />
            <FormDescription title={parsedUser && parsedUser.title || " "} description={parsedUser && parsedUser.description || " "} />

            <View style={styles.otpContainer}>
                {otp.map((value, index) => (
                    <TextInput
                        key={index}
                        ref={(ref: any) => (inputRefs.current[index] = ref)}
                        style={[
                            styles.inputBox,
                            activeIndex === index && styles.activeInputBox,
                        ]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={value}
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        onFocus={() => setActiveIndex(index)}
                    />
                ))}
            </View>

            {emptyOtpError ? <PrimaryFontText style={{ marginBottom: 10, color: 'red', fontSize: 16 }}>{errorDescription}</PrimaryFontText> : null}

            <PrimaryFontText style={styles.retryText}>
                {counter > 0 ? `Retry in ${counter} seconds` : "You can retry now"}
            </PrimaryFontText>

            <View style={reusableStyles.paddingContainer}>
                <TouchableOpacity style={styles.button} onPress={handleOtpSubmit}>
                    <PrimaryFontBold style={styles.text}>
                        {buttonClicked ?
                            <Loading color='#fff' description={parsedUser && parsedUser.loadingText || " "} />
                            : (
                                (parsedUser && parsedUser.textOnButton) || " "
                            )
                        }
                    </PrimaryFontBold>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    label: {
        fontSize: 20,
        marginBottom: 22,
        color: '#052330',
    },
    input: {
        height: 55,
        borderColor: '#C3C3C3',
        borderWidth: 1,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#F8F8F8',
        fontFamily: 'DMSansRegular',
        paddingLeft: 20,
        fontSize: 18,
        color: 'black'
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 24,
        paddingHorizontal: 20,
        // borderWidth: 1,
        width: '100%'
    },
    inputBox: {
        width: 50,
        height: 50,
        borderWidth: 2,
        borderColor: "#ccc",
        borderRadius: 5,
        textAlign: "center",
        fontSize: 20,
        color: "#000",
    },
    activeInputBox: {
        borderColor: "#00C48F",
    },
    retryText: {
        marginTop: 0,
        marginBottom: 20,
        fontSize: 15,
        color: "#888",
        textAlign: "center",
    },
    button: {
        backgroundColor: '#00C48F',
        padding: 10,
        borderRadius: 9,
        alignItems: 'center',
        paddingVertical: 18,
        width: '100%'
    },
    text: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 19,
    }
});
