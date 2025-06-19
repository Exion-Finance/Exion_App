import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import validator from "validator";
import reusableStyles from '@/constants/ReusableStyles';
import NavBar from '@/components/NavBar';
import FormErrorText from "@/components/FormErrorText";
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { useRouter } from 'expo-router';
import Loading from '@/components/Loading';
import { sendEmailOtpForPasswordReset } from "./Apiconfig/api";
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";

export default function Email() {
    const [email, setEmail] = useState<string>('');
    const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
    const [error, setError] = useState<boolean>(false);
    const [errorDescription, setErrorDescription] = useState<string>('');
    const [buttonClicked, setButtonClicked] = useState<boolean>(false);

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
        <View style={styles.container}>
            <NavBar title='Email Address' onBackPress={() => route.push('/login')} />
            <View style={[reusableStyles.paddingContainer, styles.flexContainer]}>
                <View>
                    <PrimaryFontMedium style={styles.label}>To verify your identity, please enter your registered email</PrimaryFontMedium>
                    <TextInput
                        style={styles.input}
                        placeholder="you@example.com"
                        placeholderTextColor="#D2D2D2"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={(text) => {
                            setEmail(text);
                            setError(false)
                            setIsEmailValid(validator.isEmail(text))
                        }}
                        value={email}
                    />
                    <FormErrorText error={error} errorDescription={errorDescription} />
                </View>


                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <PrimaryFontBold style={styles.text}>
                        {buttonClicked ? <Loading color='#fff' description="Please wait..." /> : "Continue"}
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
        backgroundColor: 'white'
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
        fontSize: 20,
        marginBottom: 22,
        color: '#052330',
    },
    flexContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 40
    }
});
