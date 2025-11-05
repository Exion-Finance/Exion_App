import React, { useState } from 'react';
import { View, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import InputField from '@/components/InputPaymentDetails';
import { PrimaryFontBold } from "@/components/PrimaryFontBold";
import reusableStyles from '@/constants/ReusableStyles';
import NavBar from '@/components/NavBar';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function PaybillAccountNumber() {
    const [accountNumber, setAccountNumber] = useState('');
    const [error, setError] = useState(false);
    const [errorDescription, setErrorDescription] = useState('');

    const route = useRouter()
    const { paybillNumber } = useLocalSearchParams();

    const handleAccountNumberChange = (text: string) => {
        setAccountNumber(text);
        setError(false)
    };

    const handleSubmit = () => {
        // Trim any leading or trailing whitespace
        let cleanedAccountNumber = accountNumber.trim();

        // Check if the input field is empty
        if (cleanedAccountNumber === '') {
            setErrorDescription('Account number cannot be empty')
            setError(true)
            return;
        }

        route.push({
            pathname: '/keyboard',
            params: {
                paybillNumber,
                businessNumber: cleanedAccountNumber,
                source: 'paybillaccountnumber'
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <NavBar title='Pay bill' onBackPress={() => route.back()} />
            <View style={[reusableStyles.paddingContainer, styles.flexContainer]}>
                <InputField
                    label="Enter the account number"
                    placeholder="Account Number"
                    onInputChange={handleAccountNumberChange}
                    error={error}
                    errorDescription={errorDescription}
                />
                <Pressable style={styles.button} onPress={handleSubmit}>
                    <PrimaryFontBold style={styles.text}>Continue</PrimaryFontBold>
                </Pressable>
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
    flexContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 24
    }
});
