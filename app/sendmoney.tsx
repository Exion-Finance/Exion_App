import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import InputField from '@/components/InputPaymentDetails';
import ContactsList from '@/components/Contacts';
import reusableStyles from '@/constants/ReusableStyles';
import Feather from '@expo/vector-icons/Feather';
import NavBar from '@/components/NavBar';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import { PrimaryFontText } from "@/components/PrimaryFontText";
import { useRouter } from 'expo-router';

export default function SendMoney() {
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [error, setError] = useState<boolean>(false);
    const [errorDescription, setErrorDescription] = useState<string>('');
    const [showContacts, setShowContacts] = useState<boolean>(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const route = useRouter()

    const handlePhoneNumberChange = (text: string) => {
        setPhoneNumber(text);
        setError(false)
    };

    const handleSubmit = () => {
        // Trim any leading or trailing whitespace
        let cleanedNumber = phoneNumber.trim();

        // Check if the input field is empty
        if (cleanedNumber === '') {
            setErrorDescription('Phone number cannot be empty')
            setError(true)
            return;
        }

        // Ensure the phone number has 10 digits or more
        if (cleanedNumber.length < 10) {
            setErrorDescription('Enter a valid phone number')
            setError(true)
            return;
        }

        // Ensure the phone number starts with 0, + or 2
        if (!cleanedNumber.startsWith('0') && !cleanedNumber.startsWith('+') && !cleanedNumber.startsWith('2')) {
            setErrorDescription('Enter a valid phone number');
            setError(true);
            return;
        }

        // Replace "07" with "+254" if the number starts with "07"
        if (cleanedNumber.startsWith('07')) {
            cleanedNumber = '254' + cleanedNumber.slice(1);
        }

        // console.log('Cleaned Phone Number:', cleanedNumber);

        route.push({
            pathname: '/keyboard',
            params: {
                phoneNumber: cleanedNumber,
                source: 'sendmoney'
            }
        });
    };

    const toggleContacts = () => {
        const toValue = showContacts ? 0 : 1;

        Animated.timing(rotateAnim, {
            toValue,
            duration: 200,
            useNativeDriver: true,
        }).start();

        Animated.timing(slideAnim, {
            toValue,
            duration: 250,
            useNativeDriver: true,
        }).start();

        setShowContacts(!showContacts);
    };

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });



    return (
        <View style={styles.container}>
            <NavBar title='Send money' onBackPress={() => route.push('/makepayment')} />
            <View style={[reusableStyles.paddingContainer, styles.flexContainer]}>
                <View>
                    <InputField
                        label="Please enter the phone number"
                        placeholder="0701234567"
                        onInputChange={handlePhoneNumberChange}
                        error={error}
                        errorDescription={errorDescription}
                        keyboardType='numeric'
                    />

                    <TouchableOpacity style={styles.chooseContainer} onPress={toggleContacts}>
                        <PrimaryFontMedium style={styles.chooseText}>Choose from contacts</PrimaryFontMedium>
                        <Animated.View style={{ transform: [{ rotate }] }}>
                            <Feather name="chevron-down" size={18} color="grey" style={{  marginTop: showContacts ? -2 : 3 }} />
                        </Animated.View>
                    </TouchableOpacity>

                    <Animated.View
                        style={{
                            transform: [
                                {
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [300, 0], // slide in from bottom
                                    }),
                                },
                            ],
                            opacity: slideAnim,
                            height: showContacts ? '100%' : 0,
                            overflow: 'hidden'
                        }}
                    >
                        <View style={{ backgroundColor: '#f0f0f0', marginTop: 10, flex: 1 }}>
                            <ContactsList from='sendmoney'/>
                        </View>
                    </Animated.View>
                </View>

               <TouchableOpacity style={[styles.button, { opacity: showContacts ? 0 : 1 }]} onPress={handleSubmit}>
                    <PrimaryFontBold style={styles.text}>Continue</PrimaryFontBold>
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
    },
    flexContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    chooseText: {
        color: 'gray',
        fontSize: 18,
        // marginTop: 20,
        // textDecorationLine: 'underline'
    },
    chooseContainer: {
        flexDirection: 'row',
        alignItems: "center",
        marginTop: 20,
        // borderWidth: 2
        // fontSize: 20,
    }
});
