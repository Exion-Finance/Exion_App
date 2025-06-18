import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import { SecondaryFontText } from '@/components/SecondaryFontText';
import { PrimaryFontText } from '@/components/PrimaryFontText';
import reusableStyles from '@/constants/ReusableStyles';
const landingBackground = require('@/assets/images/landingBackground.png');

export default function LandingPage() {

    return (
        <View style={styles.container}>
            <Image source={landingBackground} alt='landing' style={styles.image} />
            <View style={[reusableStyles.screenPaddingContainer, { marginTop: -40 }]}>
                <SecondaryFontText style={styles.title}>Crypto Payments</SecondaryFontText>
                <SecondaryFontText style={styles.title}>made Easy</SecondaryFontText>
                <PrimaryFontText style={styles.introductionText}>Make payments for your day to day utilities directly from your wallet</PrimaryFontText>
            </View>
            <View style={[reusableStyles.alignJustifyCenter, { marginTop: -10 }]}>
                <PrimaryButton route='/login' textOnButton='Get started'/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
        // backgroundColor: "#E0FFDD",
        // paddingBottom: 50
    },
    title: {
        fontSize: 28,
        marginBottom: 0,
    },
    image: {
        width: '100%',
        height: '68%'
    },
    introductionText: {
        fontSize: 20,
        marginTop: 18,
        marginBottom: 55,
        lineHeight: 30,
        width: '96%'
    }
});
