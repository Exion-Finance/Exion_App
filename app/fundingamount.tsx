import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import InputField from '@/components/InputPaymentDetails';
import BottomSheet, { useBottomSheetDynamicSnapPoints, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSharedValue } from 'react-native-reanimated';
import BottomSheetBackdrop from '@/components/BottomSheetBackdrop';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import reusableStyle from '@/constants/ReusableStyles'
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import LottieAnimation from '@/components/LottieAnimation';
import reusableStyles from '@/constants/ReusableStyles';
import confirm from '@/assets/icons/confirm.png'
import NavBar from '@/components/NavBar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AddFund } from './Apiconfig/api';
import Loading from '@/components/Loading';
import { useAuth } from "./context/AuthContext";
import { refreshWalletData } from '@/utils/refreshWalletData';
import { useDispatch } from 'react-redux';

export default function FundingAmount() {
    const { authState } = useAuth()

    const [amount, setAmount] = useState<string>('');
    const [error, setError] = useState<boolean>(false);
    const [errorDescription, setErrorDescription] = useState<string>('');
    const [token, setToken] = useState<string>("")
    const [makepayment, setMakePayment] = useState<boolean>(false)
    const [processsing, setProcessing] = useState<boolean>(false)
    const [processedSuccessfully, setProcessedSuccessfully] = useState<boolean>(false)
    // const params = useLocalSearchParams();
    const { id, phoneNumber } = useLocalSearchParams();

    const route = useRouter()
    const dispatch = useDispatch();

    const initialSnapPoints = ['CONTENT_HEIGHT'];

    const {
        animatedHandleHeight,
        animatedSnapPoints,
        animatedContentHeight,
        handleContentLayout,
    } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

    const bottomSheetRef = useRef<BottomSheet>(null);
    const animatedBottomSheet = useSharedValue(-1);


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
            bottomSheetRef.current?.expand()

            // const res = await AddFund(token, parseInt(id as string), parseInt(cleanedAmount))
            // console.log("the response is for Add is *********************************8", res)
            // if (!res.errr) {
            //     //replace with a toast
            //     setMakePayment(false)
            //     // route.push({ pathname: "/(tabs)"});


            // } else {
            //     setErrorDescription(res.msg)
            //     setError(true)
            //     setMakePayment(false)
            // }

        } catch (err) {
            console.log(err)
            setMakePayment(false)
        }
        finally {
            setMakePayment(false)
        }

    };

    const processOnRamp = async () => {
        setTimeout(() => {
            setProcessing(true)
            // bottomSheetRef.current?.close()
        }, 1000)
        setTimeout(() => {
            setProcessedSuccessfully(true)
        }, 4000)
    }

    const handleDone = async() => {
        await refreshWalletData(dispatch)
        bottomSheetRef.current?.close();
        route.dismissAll();
        route.replace("/(tabs)")
    }

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
        <GestureHandlerRootView style={styles.container}>
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

            <BottomSheetBackdrop animatedIndex={animatedBottomSheet} />
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={animatedSnapPoints}
                handleHeight={animatedHandleHeight}
                contentHeight={animatedContentHeight}
                enablePanDownToClose={processedSuccessfully ? false : true}
                animatedIndex={animatedBottomSheet}
                backgroundStyle={{ backgroundColor: '#fff' }}
            >
                <BottomSheetView
                    style={{ paddingBottom: 18 }}
                    onLayout={handleContentLayout}
                >
                    {!processsing ?
                        <View style={[reusableStyle.paddingContainer]}>
                            <View style={styles.tokenListHeader}>
                                <Image source={confirm} style={styles.confirm} />
                                <PrimaryFontBold style={{ fontSize: 22, marginTop: 5 }}>
                                    Confirm payment
                                </PrimaryFontBold>

                                <PrimaryFontMedium style={styles.rate}>
                                    You will receive a prompt to complete your transaction
                                </PrimaryFontMedium>
                            </View>

                            <View style={styles.infoBox}>
                                <View style={styles.row}>
                                    <PrimaryFontMedium style={styles.label}>Phone number</PrimaryFontMedium>
                                    <PrimaryFontBold style={styles.value}>{phoneNumber}</PrimaryFontBold>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.row}>
                                    <PrimaryFontMedium style={styles.label}>Amount</PrimaryFontMedium>
                                    <PrimaryFontBold style={styles.value}>{amount}</PrimaryFontBold>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: makepayment ? "#36EFBD" : "#00C48F", marginBottom: 16 },]}
                                onPress={processOnRamp}
                                disabled={makepayment}
                            >
                                <PrimaryFontBold style={styles.text}>
                                    {makepayment ? (
                                        <Loading color="#fff" description="Processing" />
                                    ) : (
                                        "Confirm"
                                    )}
                                </PrimaryFontBold>
                            </TouchableOpacity>
                        </View>
                        :
                        processedSuccessfully ?
                            <View style={[reusableStyle.paddingContainer, styles.loadingHeader]}>
                                <LottieAnimation
                                    loop={true}
                                    animationSource={require('@/assets/animations/done.json')}
                                    animationStyle={{ width: "100%", height: 250, marginTop: -24 }}
                                />

                                <PrimaryFontBold style={{ fontSize: 22, marginTop: -58 }}>
                                    Success🎉
                                </PrimaryFontBold>

                                <PrimaryFontMedium style={[styles.rate, { fontSize: 18, marginTop: 4 }]}>
                                    Your transaction was processed successfully
                                </PrimaryFontMedium>

                                <View style={styles.amountRow}>
                                    <View style={styles.line} />
                                    <PrimaryFontBold style={styles.onrampAmount}>+ $177.35</PrimaryFontBold>
                                    <View style={styles.line} />
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: "#f8f8f8", marginBottom: -14 },]}
                                    onPress={handleDone}
                                    disabled={makepayment}
                                >
                                    <PrimaryFontBold style={[styles.text, { color: "#00C48F" }]}>
                                        Done
                                    </PrimaryFontBold>
                                </TouchableOpacity>
                            </View>
                            :
                            <View style={[reusableStyle.paddingContainer, styles.loadingHeader]}>
                                <LottieAnimation
                                    loop={true}
                                    animationSource={require('@/assets/animations/hourglass.json')}
                                    animationStyle={{ width: "100%", height: 160 }}
                                />

                                <PrimaryFontBold style={{ fontSize: 22, marginTop: -5 }}>
                                    Processing payment
                                </PrimaryFontBold>

                                <PrimaryFontMedium style={[styles.rate, { fontSize: 18, marginTop: 8 }]}>
                                    Please wait as we process your payment...
                                </PrimaryFontMedium>
                            </View>
                    }

                </BottomSheetView>
            </BottomSheet>
        </GestureHandlerRootView>
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
        color: "#444",
    },
    rate: {
        color: 'gray',
        fontSize: 16,
        marginTop: 4,
        width: '100%',
        textAlign: 'center'
    },
    onrampAmount: {
        color: '#333',
        fontSize: 30,
        marginTop: 28,
        marginBottom: 28,
        // width: '100%',
        textAlign: 'center',
        borderWidth: 0.6,
        borderColor: '#00C48F',
        backgroundColor: '#F4FFF6',
        borderRadius: 12,
        padding: 8,
        paddingHorizontal: 15,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#D3D3D3',
        marginHorizontal: 12,
    },
    tokenListHeader: {
        flexDirection: 'column',
        alignItems: 'center',
        // justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 15
    },
    loadingHeader: {
        flexDirection: 'column',
        alignItems: 'center',
        // justifyContent: 'space-between',
        marginTop: 4,
        marginBottom: 24
    },
    confirm: {
        width: 50,
        height: 50,
    },
    infoBox: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
        marginBottom: 16
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    label: {
        fontSize: 16,
        color: '#555',
    },
    value: {
        fontSize: 16,
        color: '#000',
    },
});
