import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import InputField from '@/components/InputPaymentDetails';
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
import reusableStyles from '@/constants/ReusableStyles';
import NavBar from '@/components/NavBar';
import { useRouter } from 'expo-router';

export default function TillNumber() {
    const [tillNumber, setTillNumber] = useState('');
    const [error, setError] = useState(false);
    const [errorDescription, setErrorDescription] = useState('');
    const route = useRouter()

    const handleTillNumberChange = (text: string) => {
        setTillNumber(text);
        setError(false)
    };

    const handleSubmit = () => {
        // Trim any leading or trailing whitespace
        let cleanedTillNumber = tillNumber.trim();

        // Check if the input field is empty
        if (cleanedTillNumber === '') {
            setErrorDescription('Till number cannot be empty')
            setError(true)
            return;
        }

        route.push({
            pathname: '/keyboard',
            params: {
                tillNumber: cleanedTillNumber,
                source: 'tillnumber'
            }
        });
    };

    return (
        <View style={styles.container}>
            <NavBar title='Buy goods' onBackPress={() => route.push('/makepayment')} />
            <View style={[reusableStyles.paddingContainer, styles.flexContainer]}>
                <InputField
                    label="Enter the till number"
                    placeholder="Till number"
                    onInputChange={handleTillNumberChange}
                    error={error}
                    errorDescription={errorDescription}
                />
                <Pressable style={styles.button} onPress={handleSubmit}>
                    <PrimaryFontMedium style={styles.text}>Continue</PrimaryFontMedium>
                </Pressable>
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
        fontSize: 17,
        fontFamily: 'DMSansMedium'
    },
    flexContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 40
    }
});
