import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import NavBar from '@/components/NavBar';
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
import { PrimaryFontText } from "@/components/PrimaryFontText";
import reusableStyles from '@/constants/ReusableStyles';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import PrimaryButton from '@/components/PrimaryButton';
import BottomSheetBackdrop from '@/components/BottomSheetBackdrop';
import { useSharedValue } from 'react-native-reanimated';
import { useFingerprintAuthentication } from '@/components/FingerPrint';
import { tokens } from '@/utill/tokens';
import * as SecureStore from "expo-secure-store"
import { TOKEN_KEY, useAuth } from './context/AuthContext';
import BottomSheet from '@gorhom/bottom-sheet';
import { SecondaryFontText } from '@/components/SecondaryFontText';
import LottieAnimation from '@/components/LottieAnimation';
import reusableStyle from '@/constants/ReusableStyles'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { calculateFee, SendMoneyV1 } from './Apiconfig/api';
import PinAuth from '@/components/PinAuth';

export default function OptionalMessage() {

    const { authState } = useAuth()

    const route = useRouter()
    const [message, setMessage] = useState<string>('');
    const [responseReceived, setResponseReceived] = useState<boolean>(false);
    const [transactionDescription, setTransactionDescription] = useState<string>("Please wait...");
    const [totalAmountSent, seTotalAmountSent] = useState<number>()
    const [sending, setSending] = useState<boolean>(false);
    const [hasPin, setHasPin] = useState<boolean>(false);
    const [showPinAuth, setShowPinAuth] = useState<boolean>(false);

    const { name, phoneNumber, amount, token, recipient_address, gasFees, serviceFees, conversionToUsd, savedUsername } = useLocalSearchParams();
    const { handleFingerprintScan } = useFingerprintAuthentication();

    const bottomSheetRef = useRef<BottomSheet>(null);
    const animatedIndex = useSharedValue(-1);

    // Define the snap points (height) for the Bottom Sheet
    const snapPoints = useMemo(() => ['40%', '50%'], []);

    const maxLength = 70;
    const userInitial = name.slice(0, 1)

    const id = typeof token === 'string' ? tokens[token.toUpperCase()]?.id : undefined;

    // on mount, check if PIN exists in flag storage
    useEffect(() => {
        (async () => {
            const flag = await SecureStore.getItemAsync('user_has_pin');
            setHasPin(flag === 'true');
        })();
    }, []);

    const closePin = () => {
        setShowPinAuth(false);
        bottomSheetRef.current?.snapToIndex(0);
    };

    const sendCrypto = async () => {
        try {
            bottomSheetRef.current?.snapToIndex(0)
            const amountFloat = parseFloat(conversionToUsd?.toString() || "0").toFixed(4);

            console.log("recipient", phoneNumber ? phoneNumber as string : recipient_address as string)
            console.log("amountFloat", amountFloat)
            console.log("token id", id as number)
            // console.log("recipient_address", recipient_address)

            const response = await SendMoneyV1({
                chainId: 1,
                tokenId: id as number,
                recipient: phoneNumber ? phoneNumber as string : recipient_address as string,
                amount: Number(amountFloat)
            });
            // console.log("<---send money--->", response)

            if (response.hash && !response.error) {
                setResponseReceived(true);
                bottomSheetRef.current?.snapToIndex(1)
                setTransactionDescription("Transaction sent successfully🎉")
            }
            else if (response.error) {
                console.log("errror in send<<-->>", response.error)
                bottomSheetRef.current?.close();
                Alert.alert("Oops😕", "Something went wrong, please try again");
                return;
            }
        } catch (error) {
            bottomSheetRef.current?.close();
            Alert.alert("Oops😕", "An error occurred while sending money, please try again");
        }
    }

    const handleSend = async () => {
        try {
            setSending(true)
            const success = await handleFingerprintScan()
            if (!success) {
                bottomSheetRef.current?.close();
                Alert.alert("Oops😕", "Couldn't authenticate, please try again")
                return;
            }
            else if (success === "success") {
                await sendCrypto()
            }
            else if (success === "noHardware" || success === "notEnrolled") {
                setShowPinAuth(true)
                return;
            }
        }
        catch (error) {
            console.log(error)
        }
        finally {
            setSending(false)
        }
    };

    const handleButtonClick = () => {
        bottomSheetRef.current?.close();
        route.replace("/(tabs)")
    }


    useEffect(() => {
        const calculateTotalSent = () => {
            if (gasFees && serviceFees && amount) {
                const totalAmount = Number(amount) + Number(gasFees) + Number(serviceFees);
                seTotalAmountSent(totalAmount)
            }
        }
        calculateTotalSent()
    }, []);

    const formatNumber = (value: string | number) => {
        const num = Number(value);
        if (isNaN(num)) return value;
        return new Intl.NumberFormat('en-KE').format(num);
    };

    const formatNumberToFixed = (value: string | number) => {
        const num = Number(value);
        if (isNaN(num)) return value;

        return new Intl.NumberFormat('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };
      
    // const digit: number = 10000.54;
    return (
        <GestureHandlerRootView>
            <View style={styles.container}>
                <StatusBar style={'dark'} />
                <NavBar title={`Sending ${formatNumber(amount as string)} Ksh`} onBackPress={() => route.back()} />

                <View style={reusableStyles.paddingContainer}>
                    <View style={[styles.flexRow, reusableStyles.paddingContainer, { marginTop: 10 }]}>
                        <View style={styles.initialContainer}>
                            <PrimaryFontBold style={{ fontSize: 23 }}>{userInitial}</PrimaryFontBold>
                        </View>
                        <View>
                            <PrimaryFontMedium style={{ fontSize: 19 }}>{name.length < 15 ? name : `${recipient_address.slice(0, 8)}...${recipient_address.slice(-8)}`}
                            </PrimaryFontMedium>
                            <PrimaryFontText style={{ fontSize: 15, color: '#79828E', marginTop: 5 }}>{phoneNumber ? phoneNumber : savedUsername}</PrimaryFontText>
                        </View>
                    </View>

                    <View style={styles.ratesContainer}>
                        <View style={styles.row}>
                            <PrimaryFontMedium style={styles.description}>Transaction cost</PrimaryFontMedium>
                            <PrimaryFontMedium style={styles.value}>{Number(gasFees).toFixed(2) || "---"} {`Ksh`}</PrimaryFontMedium>
                        </View>
                        {/* <View style={styles.row}>
                            <PrimaryFontMedium style={styles.description}>Service fees</PrimaryFontMedium>
                            <PrimaryFontMedium style={styles.value}>{Number(serviceFees).toFixed(2) || "---"} {`Ksh`}</PrimaryFontMedium>
                        </View> */}
                        <View style={styles.row}>
                            <PrimaryFontMedium style={styles.description}>They receive</PrimaryFontMedium>
                            <PrimaryFontMedium style={styles.value}>{formatNumberToFixed(Number(amount).toFixed(2)) || "---"} {`Ksh`}</PrimaryFontMedium>
                        </View>
                    </View>

                    <View style={{ marginTop: 35, marginBottom: 35 }}>
                        <View style={styles.labelContainer}>
                            <PrimaryFontText style={styles.label}>Add a message (Optional)</PrimaryFontText>
                            <PrimaryFontText style={styles.charCount}>{`${message.length}/${maxLength}`}</PrimaryFontText>
                        </View>
                        <TextInput
                            style={styles.textArea}
                            multiline
                            numberOfLines={4}
                            maxLength={maxLength}
                            placeholder="Type your message..."
                            placeholderTextColor="#D2D2D2"
                            value={message}
                            onChangeText={setMessage}
                        />
                    </View>
                    {gasFees ? (
                        <PrimaryButton
                            onPress={() => handleSend()}
                            textOnButton={`Send (${totalAmountSent ? formatNumberToFixed(Number(totalAmountSent).toFixed(2)) : 0} Ksh)`}
                            widthProp={reusableStyles.width100}
                            disabled={sending}
                        />
                    ) : (
                        <PrimaryButton
                            onPress={() => console.log("Please wait for rates")}
                            disabled={true}
                            textOnButton="Please wait..."
                            widthProp={reusableStyles.width100}
                        />
                    )}


                </View>


                <BottomSheetBackdrop animatedIndex={animatedIndex} />
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    enablePanDownToClose={true}
                    animatedIndex={animatedIndex}
                    backgroundStyle={{ backgroundColor: '#052330' }}
                    handleIndicatorStyle={{ backgroundColor: 'white' }}
                >
                    <View>
                        <LottieAnimation animationSource={responseReceived ?
                            require('@/assets/animations/done.json')
                            :
                            require('@/assets/animations/loading.json')}
                            animationStyle={{ width: "100%", height: responseReceived ? "80%" : "40%", marginTop: responseReceived ? -28 : 15 }}
                            loop={responseReceived ? false : true}
                        />
                        <SecondaryFontText
                            style={[reusableStyle.paddingContainer,
                            { fontSize: 22, marginTop: responseReceived ? -80 : 20, marginBottom: 30, textAlign: 'center', color: 'white' }]}
                        >
                            {responseReceived ? "Sent" : "Sending"}
                        </SecondaryFontText>

                        <PrimaryFontMedium style={styles.actionDescription}>{transactionDescription}</PrimaryFontMedium>

                        <View style={reusableStyle.paddingContainer}>
                            <TouchableOpacity style={[styles.button, { opacity: responseReceived ? 1 : 0 }]} onPress={handleButtonClick}>
                                <PrimaryFontBold style={styles.text}>Done</PrimaryFontBold>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BottomSheet>

            </View>


            {showPinAuth && (
                <Modal animationType="none">
                    <PinAuth
                        hasPin={hasPin}
                        onClose={() => setShowPinAuth(false)}
                        onSuccess={() => {
                            closePin();
                            sendCrypto();
                        }}
                    />
                </Modal>
            )}

        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'white'
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.6,
        borderColor: '#00C48F',
        paddingVertical: 15,
        borderRadius: 12,
        backgroundColor: '#F4FFF6'
    },
    initialContainer: {
        borderColor: '#D9D9D9',
        borderWidth: 1,
        marginRight: 10,
        backgroundColor: '#CDFFCA',
        height: 48,
        width: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    label: {
        fontSize: 18,
        color: '#79828E',
    },
    charCount: {
        fontSize: 15,
        color: '#79828E',
    },
    textArea: {
        height: 120,
        borderRadius: 10,
        padding: 12,
        fontSize: 19,
        textAlignVertical: 'top',
        backgroundColor: '#F3F5F9',
        color: '#000',
        fontFamily: 'DMSansRegular'
    },
    ratesContainer: {
        width: '100%',
        marginTop: 30
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4.5,
    },
    description: {
        fontSize: 17,
        color: '#333',
    },
    value: {
        fontSize: 16,
        color: '#00C48F',
    },
    button: {
        backgroundColor: '#00C48F',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        paddingVertical: 18,
        width: '100%',
        marginTop: 20
    },
    text: {
        color: '#fff',
        fontSize: 19,
        fontFamily: 'DMSansMedium'
    },
    actionDescription: {
        fontSize: 19,
        marginBottom: 15,
        color: '#E0E0E0',
        textAlign: 'center',
        marginTop: -13
    }
});
