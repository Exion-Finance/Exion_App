import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from "expo-router";
import { PrimaryFontText } from "@/components/PrimaryFontText";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { PrimaryFontBold } from "@/components/PrimaryFontBold";
import Loading from '@/components/Loading';
import FormErrorText from "@/components/FormErrorText";
import { resetPassword } from './Apiconfig/api';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [buttonClicked, setButtonClicked] = useState<boolean>(false)
    const [passwordError, setPasswordError] = useState(false);
    const [resetError, setResetPasswordError] = useState(false);
    const [errorDescription, setErrorDescription] = useState("");
    const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState<boolean>(false);

    const route = useRouter()
    const { email, otp, source } = useLocalSearchParams();

    const handleResetPassword = async () => {
        try {
            if (!newPassword || !confirmPassword) {
                setPasswordError(true);
                setErrorDescription('Both fields are required.');
                return;
            }

            if (newPassword !== confirmPassword) {
                setPasswordError(true);
                setErrorDescription('Passwords do not match.');
                return;
            }

            if (newPassword.length <= 8) {
                setPasswordError(true);
                setErrorDescription('Password must be 8 characters or more');
                return;
            }

            setButtonClicked(true);

            const res = await resetPassword(email as string, newPassword, otp as string);

            if (res.status === 200) {
                if(source === "emailaddress"){
                    Alert.alert('Success 🎊', 'Your password has been reset successfully.');
                    route.push('/login');
                }
                else if(source === "resetpasswordprofile"){
                    Alert.alert('Success 🎊', 'Your password has been reset successfully.');
                    route.push('/editprofile');
                }
            } else {
                setResetPasswordError(true)
                setErrorDescription('Failed to reset password');
            }
        } catch (err: any) {
            setResetPasswordError(true)

            if (err.response) {

                setErrorDescription(err.response.data?.message || `Error: ${err.response.status}`);
            } else if (err.request) {

                setErrorDescription(' Please check your internet connection.');
            } else {

                setErrorDescription(err.message || 'An unexpected error occurred.');
            }
        } finally {
            setButtonClicked(false);
        }
    };


    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    return (
        <View style={styles.container}>
            <PrimaryFontText style={styles.instructions}>Please enter the new password 🫣</PrimaryFontText>

            <View style={[styles.passwordContainer, { borderColor: isPasswordFocused ? '#B5BFB5' : '#C3C3C3', borderWidth: isPasswordFocused ? 2 : 1 }]}>
                <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor="gray"
                    secureTextEntry={!passwordVisible}
                    value={newPassword}
                    onChangeText={(text) => {
                        setNewPassword(text.trim());
                        setPasswordError(false);
                        setResetPasswordError(false)
                    }}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                />

                <TouchableOpacity onPress={togglePasswordVisibility}>
                    <MaterialIcons
                        name={passwordVisible ? "visibility-off" : "visibility"}
                        size={24}
                        color="lightgray"
                    />
                </TouchableOpacity>
            </View>

            <View style={[styles.passwordContainer, { borderColor: isConfirmPasswordFocused ? '#B5BFB5' : '#C3C3C3', borderWidth: isConfirmPasswordFocused ? 2 : 1 }]}>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="gray"
                    secureTextEntry={!confirmPasswordVisible}
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text.trim());
                        setPasswordError(false);
                    }}
                    onFocus={() => setIsConfirmPasswordFocused(true)}
                    onBlur={() => setIsConfirmPasswordFocused(false)}
                />

                <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
                    <MaterialIcons
                        name={confirmPasswordVisible ? "visibility-off" : "visibility"}
                        size={24}
                        color="lightgray"
                    />
                </TouchableOpacity>
            </View>

            <FormErrorText error={passwordError} errorDescription={errorDescription} />
            <FormErrorText error={resetError} errorDescription={errorDescription} />


            <TouchableOpacity style={[styles.button, { backgroundColor: buttonClicked ? "#36EFBD" : "#00C48F" }]} disabled={buttonClicked} onPress={handleResetPassword} >
                <PrimaryFontBold style={styles.text}>
                    {buttonClicked ?
                        <Loading color='#fff' description="Please wait.." />
                        : (
                            "Reset Password"
                        )
                    }
                </PrimaryFontBold>
            </TouchableOpacity>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 18,
        justifyContent: 'flex-start',
        width: '100%',
        backgroundColor: '#f8f8f8'
    },
    instructions: {
        fontSize: 19,
        marginTop: 30,
        marginBottom: 0,
        width: '100%',
    },
    input: {
        flex: 1,
        fontSize: 17,
        color: '#000',
        fontFamily: 'DMSansRegular'
    },
    button: {
        // backgroundColor: '#00C48F',
        padding: 10,
        borderRadius: 9,
        alignItems: 'center',
        paddingVertical: 18,
        width: '100%',
        marginTop: 25
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // borderColor: '#C3C3C3',
        // borderWidth: 0.7,
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 55,
        backgroundColor: '#F8F8F8',
        marginTop: 20,
    },
    text: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 19,
    }
});

export default ResetPassword;
