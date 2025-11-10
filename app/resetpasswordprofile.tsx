import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
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
import { selectUserProfile } from './state/slices';
import { useSelector } from 'react-redux';


export default function ResetPwdProfile() {
    const [error, setError] = useState<boolean>(false);
    const [errorDescription, setErrorDescription] = useState<string>('');
    const [buttonClicked, setButtonClicked] = useState<boolean>(false);

    const route = useRouter()
    const user_profile = useSelector(selectUserProfile)

    const handleSubmit = async () => {
        try {
            if (!user_profile?.email) {
                setError(true)
                setErrorDescription("Enter a valid email address")
                return;
            }

            setButtonClicked(true)

            const user = {
                email: user_profile?.email,
                source: 'resetpasswordprofile',
                textOnButton: 'Continue',
                loadingText: 'Please wait..',
                title: 'Verify identity',
                description: 'To ensure account security, we\'ve sent a secure OTP to your email. Enter it here to reset your password.'
            }

            const res = await sendEmailOtpForPasswordReset(user_profile?.email)

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
            setErrorDescription("Email already registered")
            setButtonClicked(false)
        } finally {
            setButtonClicked(false)
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style={'dark'} />
            <NavBar title='Reset password' onBackPress={() => route.back()} />
            <View style={[reusableStyles.paddingContainer, styles.flexContainer]}>
                <View>
                    <PrimaryFontMedium style={styles.label}>To ensure account security, we'll send a secure OTP to your email address</PrimaryFontMedium>
                    <TextInput
                        style={styles.input}
                        placeholder="user@example.com"
                        editable={false}
                        defaultValue={user_profile?.email}
                    />
                    <FormErrorText error={error} errorDescription={errorDescription} />

                    <View style={styles.disclaimerContainer}>
                        <Feather name="info" size={15} color="grey" />
                        <PrimaryFontText style={{ color: "grey" }}>  You will receive an OTP via email</PrimaryFontText>
                    </View>
                </View>


                <TouchableOpacity style={[styles.button, { backgroundColor: buttonClicked ? "#36EFBD" : "#00C48F" }]} disabled={buttonClicked} onPress={handleSubmit}>
                    <PrimaryFontBold style={styles.text}>
                        {buttonClicked ? <Loading color='#fff' description="Sending..." /> : "Send OTP"}
                    </PrimaryFontBold>
                </TouchableOpacity>
            </View>

        </View>
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
        color: '#473F3F',
        backgroundColor: '#F8F8F8',
        fontFamily: 'DMSansRegular',
        borderColor: '#C3C3C3',
        borderWidth: 1
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
        color: '#fff',
        fontSize: 19,
        fontFamily: 'DMSansMedium'
    },
    label: {
        fontSize: 19,
        marginBottom: 16,
        color: '#052330',
    },
    flexContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 30
    },
    disclaimerContainer: {
        flexDirection: 'row',
        alignItems: "center",
        marginTop: 2
    }
});
