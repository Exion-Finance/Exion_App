import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import { PrimaryFontText } from '@/components/PrimaryFontText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import verifyIcon from '@/assets/icons/verified.png';
import avatarPlaceholder from '@/assets/images/identityAvatar.png';

export default function KYCStartScreen() {
    const route = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar style={'dark'} />
            <View style={{ flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <View style={[styles.avatarWrap, styles.alignCenter]}>
                    <Image source={avatarPlaceholder} style={styles.avatar} />
                    <Image source={verifyIcon} style={styles.verifyIcon} />
                </View>

                <PrimaryFontBold style={styles.title}>Verify Identity</PrimaryFontBold>
                <PrimaryFontMedium style={styles.subtitle}>
                    Please complete the simple KYC to start using this service
                </PrimaryFontMedium>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => route.push('/kycflowscreen')}>
                <PrimaryFontBold style={styles.buttonText}>Get Started</PrimaryFontBold>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        width: '100%',
        paddingHorizontal: 18,
        justifyContent: 'space-between'
    },
    avatarWrap: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginTop: 70,
        position: 'relative',
        borderWidth: 1,
        borderColor: '#BAC38B',
        backgroundColor: '#E4EDB5',

    },
    avatar: { width: '84%', height: '84%' },
    verifyIcon: { width: 32, height: 32, position: 'absolute', right: 2, bottom: -1 },
    title: { fontSize: 24, marginTop: 18 },
    subtitle: { color: '#888', textAlign: 'center', marginTop: 8, fontSize: 18 },
    button: {
        marginTop: 40,
        width: '100%',
        backgroundColor: '#00C48F',
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 24
    },
    buttonText: { color: '#fff', fontSize: 19 },
    alignCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' }
});
