import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import validator from "validator";
import reusableStyles from '@/constants/ReusableStyles';
import NavBar from '@/components/NavBar';
import FormErrorText from "@/components/FormErrorText";
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { useRouter } from 'expo-router';
import Loading from '@/components/Loading';
import { sendEmailOtpForPasswordReset } from "./Apiconfig/api";
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
import Feather from '@expo/vector-icons/Feather';
import { PrimaryFontText } from "@/components/PrimaryFontText";

export default function Email() {
    const [email, setEmail] = useState<string>('');
    const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
    const [error, setError] = useState<boolean>(false);
    const [errorDescription, setErrorDescription] = useState<string>('');
    const [buttonClicked, setButtonClicked] = useState<boolean>(false);
    const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);

    const route = useRouter()

    const handleSubmit = async () => {
        try {
            if (!isEmailValid) {
                setError(true)
                setErrorDescription("Enter a valid email address")
                return;
            }
            if (!email) {
                setError(true)
                setErrorDescription("Email cannot be empty")
                return;
            }

            setButtonClicked(true)

            const user = {
                email,
                source: 'emailaddress',
                textOnButton: 'Continue',
                loadingText: 'Verifying..',
                title: 'Verify identity',
                description: 'To ensure your account\'s security, we\'ve sent a secure OTP to your email. Please enter it here to reset your password.'
            }

            const res = await sendEmailOtpForPasswordReset(email)

            if (res.status === 200) {
                route.push({
                    pathname: '/otp',
                    params: {
                        user: JSON.stringify(user)
                    }
                });
                setButtonClicked(false)

            }
            else {
                setButtonClicked(false)
                setError(true)
                setErrorDescription("Something went wrong, try again")
            }
        } catch (error: any) {
            setError(true)
            setErrorDescription("User does not exist")
            setButtonClicked(false)
        } finally {
            setButtonClicked(false)
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <NavBar title='Email Address' onBackPress={() => route.back()} />
            <View style={[reusableStyles.paddingContainer, styles.flexContainer]}>
                <View>
                    <PrimaryFontMedium style={styles.label}>To verify your identity, please enter your registered email</PrimaryFontMedium>
                    <TextInput
                        style={[styles.input, { borderColor: isEmailFocused ? '#B5BFB5' : '#C3C3C3', borderWidth: isEmailFocused ? 2 : 1 }]}
                        placeholder="user@example.com"
                        placeholderTextColor="#C3C2C2"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={(text) => {
                            setEmail(text);
                            setError(false)
                            setIsEmailValid(validator.isEmail(text))
                        }}
                        onFocus={() => setIsEmailFocused(true)}
                        onBlur={() => setIsEmailFocused(false)}
                        value={email}
                    />
                    <FormErrorText error={error} errorDescription={errorDescription} />

                    <View style={styles.disclaimerContainer}>
                        <Feather name="info" size={15} color="grey" />
                        <PrimaryFontText style={{ color: "grey" }}>  You will receive an OTP via email</PrimaryFontText>
                    </View>
                </View>


                <TouchableOpacity style={[styles.button, { backgroundColor: buttonClicked ? "#36EFBD" : "#00C48F" }]} disabled={buttonClicked} onPress={handleSubmit}>
                    <PrimaryFontBold style={styles.text}>
                        {buttonClicked ? <Loading color='#fff' description="Please wait..." /> : "Continue"}
                    </PrimaryFontBold>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#f8f8f8'
    },
    input: {
        height: 57,
        borderRadius: 8,
        paddingLeft: 15,
        fontSize: 18,
        color: '#000',
        backgroundColor: '#F8F8F8',
        fontFamily: 'DMSansRegular'
    },
    button: {
        // backgroundColor: '#00C48F',
        padding: 10,
        borderRadius: 9,
        alignItems: 'center',
        paddingVertical: 18,
        width: '100%'
    },
    text: {
        color: '#fff',
        fontSize: 19,
        fontFamily: 'DMSansMedium'
    },
    label: {
        fontSize: 20,
        marginBottom: 15,
        color: '#052330',
    },
    flexContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 40
    },
    disclaimerContainer: {
        flexDirection: 'row',
        alignItems: "center",
        marginTop: 2
    }
});
