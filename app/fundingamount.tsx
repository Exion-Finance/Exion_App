import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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
    const { authState } = useAuth()

    const [amount, setAmount] = useState('');
    const [error, setError] = useState(false);
    const [errorDescription, setErrorDescription] = useState('');
    const [token, setToken] = useState<string>("")
    const [makepayment, setMakePayment] = useState<boolean>(false)
    const params = useLocalSearchParams();
    const { id, phoneNumber } = params;

    const route = useRouter()


    const handleFundAmountChange = (text: string) => {
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
                setErrorDescription('Amount cannot be empty')
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
            <NavBar title="Amount" onBackPress={() => route.back()} />

            <View style={[reusableStyles.paddingContainer, styles.flexContainer]}>
                <View>
                    <InputField
                        label="Enter the amount to send"
                        placeholder="Ksh"
                        keyboardType="numeric"
                        onInputChange={handleFundAmountChange}
                        error={error}
                        errorDescription={errorDescription}
                        passedValue={amount}
                        source={"fundingAmount"}
                    />

                    
                    <View style={styles.gridContainer}>
                        {["100", "500", "1000", "2000", "5000", "10000"].map((val) => (
                            <TouchableOpacity
                                key={val}
                                style={styles.amountBox}
                                onPress={() => { setAmount(val); setError(false) }}
                            >
                                <PrimaryFontBold style={styles.amountText}>Ksh {val}</PrimaryFontBold>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: makepayment ? "#36EFBD" : "#00C48F" },]}
                    onPress={handleSubmit}
                    disabled={makepayment}
                >
                    <PrimaryFontBold style={styles.text}>
                        {makepayment ? (
                            <Loading color="#fff" description="Processing" />
                        ) : (
                            "Make Payment"
                        )}
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
    button: {
        padding: 10,
        borderRadius: 10,
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
        paddingBottom: 24
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 20,
    },
    amountBox: {
        width: "30%",
        backgroundColor: "#F5F5F5",
        paddingVertical: 14,
        marginBottom: 12,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    amountText: {
        fontSize: 16,
        color: "#555",
    },
});
