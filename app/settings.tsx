import React from 'react';
import { View, ScrollView, StyleSheet, ImageBackground, StatusBar as RNStatusBar, Platform, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import SettingOption from '@/components/SettingOption';
import AntDesign from '@expo/vector-icons/AntDesign';
import { PrimaryFontText } from '@/components/PrimaryFontText';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import { SecondaryFontText } from "@/components/SecondaryFontText";

const settingsBackground = require('@/assets/images/Edit Profile Bg.png');
const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 35 : 0;

const SettingsScreen: React.FC = () => {
    const router = useRouter();
    const year = new Date().getFullYear();

    return (
        <ScrollView style={styles.container}>
            <StatusBar style={'light'} />
            <View>
                <ImageBackground style={styles.editProfileHeader} source={settingsBackground}>
                    <TouchableOpacity onPress={() => router.navigate('/profile')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 18 }}>
                        <Ionicons name="arrow-back-outline" size={23} color="#000" />
                        <SecondaryFontText style={styles.title}>Settings</SecondaryFontText>
                    </TouchableOpacity>
                </ImageBackground>

                <View style={styles.optionsWrapper}>
                    <PrimaryFontMedium style={{ marginBottom: 10, fontSize: 15, color: '#888' }}>Legal</PrimaryFontMedium>
                    <SettingOption
                        icon={<Feather name="shield" size={18} color="#444" />}
                        description="Privacy Policy"
                        onPress={() => {
                            router.push({
                                pathname: '/webview',
                                params: {
                                    uri: 'https://exion.finance/privacy-policy'
                                }
                            });
                        }}
                    />
                    <SettingOption
                        icon={<Feather name="file-text" size={18} color="#444" />}
                        description="Terms and Conditions"
                        onPress={() => {
                            router.push({
                                pathname: '/webview',
                                params: {
                                    uri: 'https://exion.finance/terms-of-use'
                                }
                            });
                        }}
                    />

                    <PrimaryFontMedium style={{ marginBottom: 10, marginTop: 25, fontSize: 15, color: '#888' }}>Security</PrimaryFontMedium>
                    <SettingOption
                        icon={<Feather name="lock" size={18} color="#444" />}
                        description="Reset password"
                        onPress={() => {
                            router.push('/resetpasswordprofile')
                        }}
                    />

                    <PrimaryFontMedium style={{ marginBottom: 10, marginTop: 25, fontSize: 15, color: '#888' }}>About</PrimaryFontMedium>
                    <SettingOption
                        icon={<Feather name="mail" size={18} color="#444" />}
                        description="Contact Us"
                        onPress={() => {
                            Linking.openURL('mailto:info@exion.finance');
                        }}
                    />
                    <SettingOption
                        icon={<AntDesign name="addusergroup" size={19} color="#444" />}
                        description="Join Community"
                        onPress={() => {
                            Linking.openURL('https://t.me/+VIhzzPAgcFlhYTk0');
                        }}
                    />

                    <SettingOption
                        icon={<Feather name="tool" size={18} color="#444" />}
                        description="Report Issue"
                        onPress={() => {
                            Linking.openURL('https://t.me/+VIhzzPAgcFlhYTk0');
                        }}
                    />
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <PrimaryFontText style={styles.footerText}>© Copyright {year} - Exion Finance</PrimaryFontText>
            </View>
        </ScrollView>
    );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        // justifyContent: 'space-between',
        paddingBottom: 20,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 26,
        paddingLeft: 16,
    },
    optionsWrapper: {
        marginTop: -45,
        backgroundColor: '#f8f8f8',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: 50,
        paddingHorizontal: 17,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 12,
        marginVertical: 32
    },
    footerText: {
        fontSize: 12,
        color: '#888',
    },
    editProfileHeader: {
        height: 180,
        resizeMode: "cover",
        width: '100%',
        paddingTop: statusBarHeight,
    }
});
