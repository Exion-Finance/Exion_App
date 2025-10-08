import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import { PrimaryFontText } from '@/components/PrimaryFontText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import verifyIcon from '@/assets/images/space.png';
import avatarPlaceholder from '@/assets/images/user.png';
import NavBar from '@/components/NavBar';

export default function KYCStartScreen() {
    const route = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar style={'dark'} />
            <NavBar title={'Verify Identity'} onBackPress={() => route.back()} />
            <View style={styles.avatarWrap}>
                <Image source={avatarPlaceholder} style={styles.avatar} />
                <Image source={verifyIcon} style={styles.verifyIcon} />
            </View>

            <PrimaryFontBold style={styles.title}>Verify Identity</PrimaryFontBold>
            <PrimaryFontMedium style={styles.subtitle}>
                Please complete the simple KYC to start using this service
            </PrimaryFontMedium>

            <TouchableOpacity style={styles.button} onPress={() => route.push('/kycflowscreen')}>
                <PrimaryFontBold style={styles.buttonText}>Get Started</PrimaryFontBold>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', backgroundColor: '#f8f8f8', width: '100%' },
    avatarWrap: { width: 120, height: 120, borderRadius: 60, marginTop: 60, position: 'relative' },
    avatar: { width: '100%', height: '100%', borderRadius: 60 },
    verifyIcon: { width: 36, height: 36, position: 'absolute', right: -6, bottom: -6 },
    title: { fontSize: 20, marginTop: 14 },
    subtitle: { color: '#888', textAlign: 'center', marginTop: 8, fontSize: 16, width: '92%' },
    button: {
        marginTop: 40,
        width: '92%',
        backgroundColor: '#00C48F',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: { color: '#fff', fontSize: 16 },
});
