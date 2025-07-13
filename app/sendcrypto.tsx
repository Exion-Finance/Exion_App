import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Button, TextInput, Alert, Platform, ToastAndroid, StatusBar } from "react-native";
import { StatusBar as StatBar } from 'expo-status-bar';
import { CameraView, Camera } from "expo-camera";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
import { PrimaryFontBold } from "@/components/PrimaryFontBold";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet from '@gorhom/bottom-sheet';
import reusableStyle from '@/constants/ReusableStyles'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import InputField from '@/components/InputPaymentDetails';
import { SecondaryFontText } from '@/components/SecondaryFontText';
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store"
import { TOKEN_KEY } from './context/AuthContext';
import LottieAnimation from '@/components/LottieAnimation';
import { SendMoneyV1 } from "./Apiconfig/api";
import { selectUserProfile } from './state/slices';
import { useSelector } from 'react-redux';

const statusBarHeight = StatusBar.currentHeight || 0;

const CryptoScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"myCode" | "scan">("scan");
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [errorDescription, setErrorDescription] = useState<string>('');
    const [recipientAddress, setRecipientAddress] = useState<string>('');
    const [walletAddress, setWalletAddress] = useState<string>("")
    const [userName, setUserName] = useState<string>("")

    const route = useRouter()
    const bottomSheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(() => ['72%'], []);
    const user_profile = useSelector(selectUserProfile)

    //bottomSheetRef.current?.close();  // Close the BottomSheet after selection

    const handleEnterWalletAddress = () => {
        // bottomSheetRef.current?.expand()
        route.push('/enterwalletaddress')
    }


    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");

            // const token = await SecureStore.getItemAsync(TOKEN_KEY);

            if (user_profile) {
                // const parsedToken = JSON.parse(token);
                setWalletAddress(user_profile?.wallet.publicKey)
                setUserName(user_profile?.userName)
            }
        };
        getCameraPermissions();
    }, []);

    const handleBarcodeScanned = ({ type, data }: any) => {
        try {
            setScanned(true);
            if (data.length === 42) {
                route.push({
                    pathname: '/keyboard',
                    params: {
                        recipient_address: data,
                        source: 'sendcrypto',
                    },
                });
            }
            else Alert.alert("Oops😕", 'Could not scan this Qr Code');
        } catch (error) {
            Alert.alert("Oops😕", 'Could not scan Qr Code');
        }
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        // getCameraPermissions();
        // return Alert.alert("Oops😕", 'Permission required to access camera, please change it in settings');
    }

    const copyToClipboard = () => {
        Clipboard.setStringAsync(walletAddress as string);

        if (Platform.OS === 'android') {
            ToastAndroid.show('Text copied to clipboard!', ToastAndroid.SHORT);
        } else if (Platform.OS === 'ios') {
            alert('Text copied to clipboard!');
        }
    };

    const handleWalletAddressChange = (text: string) => {
        setRecipientAddress(text);
        setError(false)
    };

    const handleWalletAddressSubmit = () => {
        if (!recipientAddress) {
            setError(true)
            setErrorDescription('Wallet address cannot be empty')
            return;
        }
        // alert(recipientAddress)
        route.push({
            pathname: '/keyboard',
            params: {
                recipient_address: recipientAddress,
                source: 'sendcrypto',
            },
        });
    }

    return (
        <GestureHandlerRootView>
            <StatBar style={'dark'} />
            <View style={styles.container}>
                {/* Top Navigation */}
                <View style={styles.topNav}>
                    <TouchableOpacity style={styles.closeIcon} onPress={() => route.back()}>
                        <Feather name='x' color={'gray'} size={25} />
                    </TouchableOpacity>

                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "myCode" && styles.activeTab]}
                            onPress={() => setActiveTab("myCode")}
                        >
                            <PrimaryFontMedium style={[styles.tabText, activeTab === "myCode" && styles.activeTabText]}>My QR</PrimaryFontMedium>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "scan" && styles.activeTab]}
                            onPress={() => {
                                setActiveTab("scan");
                            }}
                        >
                            <PrimaryFontMedium style={[styles.tabText, activeTab === "scan" && styles.activeTabText]}>Scan</PrimaryFontMedium>
                        </TouchableOpacity>
                    </View>
                </View>

                {activeTab === "myCode" ? (
                    <View style={styles.myCodeContainer}>
                        <QRCode value={walletAddress} size={225} />
                        <PrimaryFontBold style={styles.username}>{userName}</PrimaryFontBold>
                        <PrimaryFontMedium style={styles.walletAddress}>{walletAddress}</PrimaryFontMedium>
                        <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                            <MaterialIcons name="content-copy" size={18} color="#fff" />
                            <PrimaryFontBold style={styles.copyButtonText}>Copy Address</PrimaryFontBold>
                        </TouchableOpacity>
                    </View>
                ) : !hasPermission ? (
                    <PrimaryFontMedium style={styles.permissionText}>Camera permission is required to scan QR codes.</PrimaryFontMedium>
                ) : (
                    <View style={styles.scanContainer}>
                        <CameraView
                            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                            barcodeScannerSettings={{
                                barcodeTypes: ["qr", "pdf417"],
                            }}
                            style={StyleSheet.absoluteFillObject}
                        />

                        <TouchableOpacity onPress={handleEnterWalletAddress}>
                            <PrimaryFontBold style={styles.scanText}>Enter wallet address</PrimaryFontBold>
                        </TouchableOpacity>


                        <BottomSheet
                            ref={bottomSheetRef}
                            index={-1}
                            snapPoints={snapPoints}
                            enablePanDownToClose={true}
                        >
                            <View>
                                <LottieAnimation animationSource={require('@/assets/animations/wallet.json')} animationStyle={{ width: "100%", height: "40%", marginTop: -5 }} />
                                <SecondaryFontText
                                    style={[reusableStyle.paddingContainer,
                                    { fontSize: 22, marginTop: -25, marginBottom: 30, textAlign: 'center' }]}
                                >
                                    Wallet Address
                                </SecondaryFontText>

                                <View style={reusableStyle.paddingContainer}>
                                    <InputField
                                        label="Enter the wallet address"
                                        placeholder="0x1234f..."
                                        onInputChange={handleWalletAddressChange}
                                        error={error}
                                        errorDescription={errorDescription}
                                    />
                                    <TouchableOpacity style={styles.button} onPress={handleWalletAddressSubmit}>
                                        <PrimaryFontBold style={styles.text}>Continue</PrimaryFontBold>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </BottomSheet>

                    </View>

                )}

            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f8f8",
    },
    topNav: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "transparent",
        marginTop: statusBarHeight + 10
    },
    closeIcon: {
        fontSize: 20,
        fontWeight: "bold",
        marginRight: 5,
    },
    tabContainer: {
        flexDirection: "row",
        flex: 1,
        justifyContent: "center",
    },
    tab: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 9,
        borderRadius: 20,
        marginHorizontal: 5,
        backgroundColor: "#e0e0e0",
    },
    activeTab: {
        backgroundColor: "#00C48F",
    },
    tabText: {
        fontSize: 16,
        color: "#000",
    },
    activeTabText: {
        color: "#fff",
    },
    myCodeContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        marginTop: -50
    },
    username: {
        fontSize: 20,
        marginVertical: 20,
    },
    walletAddress: {
        fontSize: 20,
        marginBottom: 15,
        textAlign: "center",
        color: 'gray'
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#00C48F",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
    },
    copyButtonText: {
        color: "#fff",
        fontSize: 17,
        marginLeft: 5
    },
    permissionText: {
        fontSize: 16,
        textAlign: "center",
        margin: 20,
    },
    scanContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end",
        padding: 20,
    },
    scanText: {
        fontSize: 19,
        color: "#fff",
        marginBottom: 25,
        backgroundColor: "#00C48F",
        paddingVertical: 16,
        paddingHorizontal: 25,
        borderRadius: 10,
    },
    button: {
        backgroundColor: '#00C48F',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        paddingVertical: 18,
        width: '100%',
        marginTop: 25
    },
    text: {
        color: '#fff',
        fontSize: 19,
        fontFamily: 'DMSansMedium'
    }
});

export default CryptoScreen;
