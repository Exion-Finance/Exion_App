import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, Platform, ToastAndroid, StatusBar, ImageBackground, Image, Linking, ScrollView, RefreshControl } from "react-native";
import { StatusBar as StatBar } from 'expo-status-bar';
import { CameraView, Camera } from "expo-camera";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from 'expo-clipboard';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Application from 'expo-application';
import { Feather } from '@expo/vector-icons';
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
import { PrimaryFontBold } from "@/components/PrimaryFontBold";
import { PrimaryFontText } from "@/components/PrimaryFontText";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import InputField from '@/components/InputPaymentDetails';
import { SecondaryFontText } from '@/components/SecondaryFontText';
import { useRouter } from "expo-router";
import { selectUserProfile } from './state/slices';
import { useSelector } from 'react-redux';

const statusBarHeight = StatusBar.currentHeight || 0;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SCAN_WINDOW_SIZE = SCREEN_W * 0.75;

const HEADER_HEIGHT = statusBarHeight - 30
const SCAN_AREA_HEIGHT = SCREEN_H - HEADER_HEIGHT;

const settingsBackground = require('@/assets/images/Edit Profile Bg.png');

const CryptoScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"myCode" | "scan">("scan");
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [errorDescription, setErrorDescription] = useState<string>('');
    const [recipientAddress, setRecipientAddress] = useState<string>('');
    const [walletAddress, setWalletAddress] = useState<string>("")
    const [userName, setUserName] = useState<string>("")
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const route = useRouter()
    const bottomSheetRef = useRef<BottomSheet>(null);
    const windowX = (SCREEN_W - SCAN_WINDOW_SIZE) / 2;
    const windowY = HEADER_HEIGHT + (SCAN_AREA_HEIGHT - SCAN_WINDOW_SIZE) / 3;

    const snapPoints = useMemo(() => ['72%'], []);
    const user_profile = useSelector(selectUserProfile)

    //bottomSheetRef.current?.close();  // Close the BottomSheet after selection

    const handleRefresh = async () => {
        setRefreshing(true);
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");

        if (user_profile) {
            // const parsedToken = JSON.parse(token);
            setWalletAddress(user_profile?.wallet.publicKey)
            setUserName(user_profile?.userName)
        }
        setRefreshing(false);
    };


    const openSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else {
            IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS, {
                data: 'package:' + Application.applicationId,
            });
        }
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
                <ImageBackground style={styles.topNav} source={settingsBackground}>
                    <TouchableOpacity style={styles.closeIcon} onPress={() => route.back()}>
                        <Feather name='x' color={'#f8f8f8'} size={25} />
                    </TouchableOpacity>

                    <View style={styles.tabContainer}>
                        <View style={styles.tabBackground}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === "myCode" && styles.activeTab]}
                                onPress={() => setActiveTab("myCode")}
                            >
                                <PrimaryFontMedium
                                    style={[
                                        styles.tabText,
                                        activeTab === "myCode" && styles.activeTabText,
                                    ]}
                                >
                                    My QR
                                </PrimaryFontMedium>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tab, activeTab === "scan" && styles.activeTab]}
                                onPress={() => setActiveTab("scan")}
                            >
                                <PrimaryFontMedium
                                    style={[
                                        styles.tabText,
                                        activeTab === "scan" && styles.activeTabText,
                                    ]}
                                >
                                    Scan
                                </PrimaryFontMedium>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>

                {hasPermission === null ?
                    <View style={styles.myCodeContainer}>
                        <Text>Requesting camera permission⏳</Text>
                    </View>
                    :
                    activeTab === "myCode" ? (
                        <View style={styles.myCodeContainer}>
                            <QRCode value={walletAddress} size={215} />
                            <PrimaryFontBold style={styles.username}>{userName}</PrimaryFontBold>
                            <PrimaryFontMedium style={styles.walletAddress}>{walletAddress}</PrimaryFontMedium>
                            <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                                <MaterialIcons name="content-copy" size={18} color="#fff" />
                                <PrimaryFontBold style={styles.copyButtonText}>Copy Address</PrimaryFontBold>
                            </TouchableOpacity>
                        </View>
                    ) : !hasPermission ? (
                        <ScrollView
                            contentContainerStyle={{ flex: 1 }}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                            }
                        >
                            <View style={styles.permissionContainer}>
                                <Image source={require('@/assets/images/sad.png')} style={styles.permissionImage} resizeMode="contain" />
                                <PrimaryFontBold style={styles.permissionTitle}>Permission required</PrimaryFontBold>
                                <PrimaryFontText style={styles.permissionDescription}>
                                    We need access to your camera so you can easily scan QR codes.
                                </PrimaryFontText>

                                <TouchableOpacity style={styles.permissionButton} onPress={openSettings}>
                                    <PrimaryFontMedium style={styles.permissionButtonText}>Open Settings</PrimaryFontMedium>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    ) : (
                        <View style={styles.scanContainer}>
                            <CameraView
                                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                                barcodeScannerSettings={{
                                    barcodeTypes: ["qr", "pdf417"],
                                }}
                                style={StyleSheet.absoluteFillObject}
                            />

                            <BlurView intensity={80}
                                style={[styles.blur, {
                                    top: HEADER_HEIGHT,
                                    left: 0,
                                    right: 0,
                                    height: windowY - HEADER_HEIGHT
                                }]}
                            />
                            {/* Bottom blur */}
                            <BlurView intensity={80}
                                style={[styles.blur, {
                                    top: windowY + SCAN_WINDOW_SIZE,
                                    left: 0,
                                    right: 0,
                                    bottom: 0
                                }]}
                            />
                            {/* Left blur */}
                            <BlurView intensity={80}
                                style={[styles.blur, {
                                    top: windowY,
                                    left: 0,
                                    width: windowX,
                                    height: SCAN_WINDOW_SIZE
                                }]}
                            />
                            {/* Right blur */}
                            <BlurView intensity={80}
                                style={[styles.blur, {
                                    top: windowY,
                                    left: windowX + SCAN_WINDOW_SIZE,
                                    right: 0,
                                    height: SCAN_WINDOW_SIZE
                                }]}
                            />

                            {/* Clear window border */}
                            <View
                                pointerEvents="none"
                                style={[
                                    styles.scanWindow,
                                    {
                                        width: SCAN_WINDOW_SIZE,
                                        height: SCAN_WINDOW_SIZE,
                                        top: windowY,
                                        left: windowX,
                                    },
                                ]}
                            />

                            {/* <TouchableOpacity onPress={handleEnterWalletAddress}>
                            <PrimaryFontBold style={styles.scanText}>Enter wallet address</PrimaryFontBold>
                        </TouchableOpacity> */}
                            <View style={styles.scanButton}>
                                <PrimaryFontBold style={styles.scanQrText}>Scan QR code</PrimaryFontBold>
                            </View>
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
        padding: 15,
        backgroundColor: "transparent",
        paddingTop: statusBarHeight + 10,
        zIndex: 10,
        // resizeMode: "cover",
        // borderWidth: 1,
        // borderColor: 'black'
    },
    closeIcon: {
        fontSize: 20,
        fontWeight: "bold",
        marginRight: 5,
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "center",
        flex: 1,
        elevation: 35,
    },
    tabBackground: {
        flexDirection: "row",
        backgroundColor: "#e0e0e0",
        borderRadius: 30,
        padding: 5,
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 9,
        borderRadius: 25,
    },
    activeTab: {
        backgroundColor: "#00C48F",
    },
    tabText: {
        fontSize: 15,
        color: "#333",
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
        marginBottom: 10,
        marginTop: 25
    },
    walletAddress: {
        fontSize: 19,
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
    blur: {
        position: 'absolute',
        backgroundColor: 'transparent',
    },
    scanWindow: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 8,
    },
    scanButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    scanQrText: {
        color: '#fff',
        fontSize: 16,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingTop: -30,
        backgroundColor: '#f8f8f8',
        // borderWidth: 1,
        // borderColor: 'black'
    },
    permissionImage: {
        width: 80,
        height: 80,
        marginBottom: 25,
    },
    permissionTitle: {
        fontSize: 20,
        marginBottom: 10,
        color: '#052330'
    },
    permissionDescription: {
        fontSize: 16,
        color: '#79828E',
        textAlign: 'center',
        marginBottom: 20
    },
    permissionButton: {
        backgroundColor: '#00C48F',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 17,
    }
});

export default CryptoScreen;
