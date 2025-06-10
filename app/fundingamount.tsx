import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import InputField from '@/components/InputPaymentDetails';
//import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import reusableStyles from '@/constants/ReusableStyles';
import NavBar from '@/components/NavBar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AddFund } from './Apiconfig/api';
import Loading from '@/components/Loading';
import { useAuth } from "./context/AuthContext";

export default function FundingAmount() {
    const { refreshToken, authState } = useAuth()

    const [amount, setAmount] = useState('');
    const [error, setError] = useState(false);
    const [errorDescription, setErrorDescription] = useState('');
    const [token, setToken] = useState<string>("")
    const [makepayment, setMakePayment] = useState<boolean>(false)
    const params = useLocalSearchParams();
    const { id, phoneNumber } = params;

    const route = useRouter()


    const handleAccountNumberChange = (text: string) => {
        setAmount(text);
        setError(false)
    };

    const handleSubmit = async () => {
        // Trim any leading or trailing whitespace
        setMakePayment(true)
        try {
            let cleanedAmount = amount.trim();

            // Check if the input field is empty
            if (cleanedAmount === '' || id === "" || phoneNumber === "") {
                setErrorDescription('Field cannot be empty')
                setError(true)
                setMakePayment(false)
                return;
            }

            const res = await AddFund(token, parseInt(id as string), parseInt(cleanedAmount))
            console.log("the response is for Add is *********************************8", res)
            if (!res.errr) {
                //replace with a toast
                setMakePayment(false)
                // route.push({ pathname: "/(tabs)"});


            } else {
                setErrorDescription(res.msg)
                setError(true)
                setMakePayment(false)
            }

        } catch (err) {
            console.log(err)
            setMakePayment(false)

        }

    };
    useEffect(() => {
        const token = async () => {
            // const token = await SecureStore.getItemAsync(TOKEN_KEY);
            const token = authState?.token

            if (token) {
                // const parsedToken = JSON.parse(token);
                // setToken(parsedToken.token)
                setToken(token)
            }
        }
        token()

    }, [authState])

    return (
        <View style={styles.container}>
            <NavBar title='Amount' onBackPress={() => route.push('/fundingmethod')} />
            <View style={[reusableStyles.paddingContainer, styles.flexContainer]}>
                <InputField
                    label="Enter the amount to send"
                    placeholder="Ksh"
                    onInputChange={handleAccountNumberChange}
                    error={error}
                    errorDescription={errorDescription}
                />
                <Pressable style={styles.button} onPress={handleSubmit}>
                    <PrimaryFontBold style={styles.text}>
                        {makepayment ?
                            <Loading color='#fff' description='Processing' />
                            : "Make Payment"
                        }
                    </PrimaryFontBold>
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 19,
        fontFamily: 'DMSansMedium'
    },
    flexContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 40
    }
});
