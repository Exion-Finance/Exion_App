import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import reusableStyles from '@/constants/ReusableStyles';
import NavBar from '@/components/NavBar';
import FormErrorText from "@/components/FormErrorText";
import Feather from '@expo/vector-icons/Feather';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Loading from '@/components/Loading';
import { sendOtpWhatsapp } from "./Apiconfig/api";
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
import { PrimaryFontText } from "@/components/PrimaryFontText";
import { Country, countryData } from '@/assets/countrycodes';


interface User {
    username: string;
    phoneNumber: string;
    password: string;
    email: string;
}

export default function VerifyPhone() {

    const countries: Country[] = countryData

    const [error, setError] = useState<boolean>(false);
    const [errorDescription, setErrorDescription] = useState<string>('');
    const [buttonClicked, setButtonClicked] = useState<boolean>(false);
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
    const [selectedCountry, setSelectedCountry] = useState(countries[24]);
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [isPhoneFocused, setIsPhoneFocused] = useState<boolean>(false);

    const route = useRouter()

    const { user } = useLocalSearchParams();
    let parsedUser: User | null = null;

    try {
        parsedUser = user ? JSON.parse(user as string) : null;
        // console.log("parsedUser-->", parsedUser)
    } catch (error) {
        console.error('Failed to parse user:', error);
    }


    const handleSelectCountry = (country: typeof countries[0]) => {
        setSelectedCountry(country);
        setDropdownVisible(false);
    };

    const formatPhoneNumber = (phoneNumber: string, countryCode: string) => {
        // Remove whitespace and ensure phone number is a string
        const cleanedNumber = phoneNumber.trim();

        // Check for empty phone number
        if (!cleanedNumber || cleanedNumber.trim() === "") {
            setError(true)
            setErrorDescription("Phone number required")
            return false;
        }

        // Check for valid length
        if (cleanedNumber.length < 9 || cleanedNumber.length > 13) {
            setError(true)
            setErrorDescription("Invalid phone number format")
            return false;
        }

        // Handle cases starting with "07"
        if (cleanedNumber.startsWith("07") && cleanedNumber.length === 10) {
            return `${countryCode}${cleanedNumber.slice(1)}`;
        }

        // Handle cases starting with "7"
        if (cleanedNumber.startsWith("7") && cleanedNumber.length === 9) {
            return `${countryCode}${cleanedNumber}`;
        }

        // Handle cases starting with "011"
        if (cleanedNumber.startsWith("011") && cleanedNumber.length === 10) {
            return `${countryCode}${cleanedNumber}`;
        }

        // Default case for other formats
        return `${countryCode}${cleanedNumber}`;
    };


    const handleSubmit = async () => {
        try {
            if (!phoneNumber) {
                setError(true)
                setErrorDescription("Phone number cannot be empty")
                return;
            }

            setButtonClicked(true)
            const phone_number = formatPhoneNumber(phoneNumber, selectedCountry.countryCode)

            if (phone_number) {
                const masked = phone_number.slice(0, 4) + '***' + phone_number.slice(-3);
                const user = {
                    ...parsedUser,
                    phoneNumber: phone_number,
                    source: 'verifyphonenumber',
                    textOnButton: 'Create Account',
                    loadingText: 'Creating Account',
                    title: 'Verify contact',
                    description: `To ensure your account\'s security, we\'ve sent a secure OTP to ${masked}. Please enter it here to create your account.`
                }

                const res = await sendOtpWhatsapp(phone_number)
                // console.log(res.data)

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
            }
            else setButtonClicked(false)

        } catch (error: any) {
            setError(true)
            setErrorDescription("User already exists")

            setButtonClicked(false)
        }
    };

    return (
        <View style={styles.container}>
            <NavBar title='One final step!' onBackPress={() => route.push('/emailaddress')} />
            <View style={[reusableStyles.paddingContainer, styles.flexContainer]}>
                <View>
                    <PrimaryFontMedium style={styles.label}>Add a phone number to make it easier for contacts to send you money without a wallet address.</PrimaryFontMedium>

                    <View style={styles.phoneContainer}>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setDropdownVisible(true)}
                        >
                            <PrimaryFontMedium style={styles.flag}>{selectedCountry.flag}</PrimaryFontMedium>
                            <PrimaryFontMedium style={styles.countryCode}>{selectedCountry.countryCode}</PrimaryFontMedium>
                        </TouchableOpacity>

                        <TextInput
                            style={[styles.contactInput, { borderColor: isPhoneFocused ? '#B5BFB5' : '#C3C3C3', borderWidth: isPhoneFocused ? 2 : 1 }]}
                            placeholder="701234567"
                            placeholderTextColor="#C3C2C2"
                            keyboardType="phone-pad"
                            onChangeText={(text) => {
                                setPhoneNumber(text);
                                setError(false);
                            }}
                            onFocus={() => setIsPhoneFocused(true)}
                            onBlur={() => setIsPhoneFocused(false)}
                            value={phoneNumber}
                        />
                    </View>
                    <FormErrorText error={error} errorDescription={errorDescription} />

                    <View style={styles.disclaimerContainer}>
                        <Feather name="info" size={15} color="grey" />
                        <PrimaryFontText style={{ color: "grey" }}>  You will receive an OTP via WhatsApp</PrimaryFontText>
                    </View>
                </View>


                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <PrimaryFontBold style={styles.text}>
                        {buttonClicked ? <Loading color='#fff' description="Please wait..." /> : "Continue"}
                    </PrimaryFontBold>
                </TouchableOpacity>
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
                                    <PrimaryFontMedium style={styles.flag}>{item.flag}</PrimaryFontMedium>
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
        fontFamily: 'DMSansMedium'
    },
    label: {
        fontSize: 18.5,
        marginBottom: 22,
        color: '#052330',
    },
    flexContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 40
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
        height: 57,
        fontSize: 16,
        color: '#000',
        borderColor: '#00C48F',
        borderWidth: 1,
        borderRadius: 5,
        marginRight: 7
    },
    countryCode: {
        fontSize: 17,
        color: "#333",
        marginRight: 4
    },
    contactInput: {
        flex: 1,
        paddingHorizontal: 15,
        height: 57,
        fontSize: 18,
        color: '#000',
        backgroundColor: '#F8F8F8',
        borderRadius: 5,
        fontFamily: 'DMSansRegular'
    },
    flag: {
        marginRight: 8,
        fontSize: 25
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center"
    },
    modalContainer: {
        backgroundColor: "white",
        width: "90%",
        borderRadius: 10,
        padding: 16,
        height: '90%'
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
    disclaimerContainer: {
        flexDirection: 'row',
        alignItems: "center",
        marginTop: 5
    }
});
