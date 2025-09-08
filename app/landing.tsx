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
            <Image source={landingBackground} alt='landing' style={[styles.image, { zIndex: 1 }]} />
            <View style={styles.bottomContainer}>
                <View style={[reusableStyles.screenPaddingContainer, { marginTop: 0 }]}>
                    <SecondaryFontText style={styles.title}>Crypto Payments</SecondaryFontText>
                    <SecondaryFontText style={styles.title}>made Easy</SecondaryFontText>
                    <PrimaryFontText style={styles.introductionText}>Make payments for your day to day utilities directly from your wallet</PrimaryFontText>
                </View>
                <View style={[reusableStyles.alignJustifyCenter, { width: '100%' }]}>
                    <PrimaryButton route='/login' textOnButton='Get started'/>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: "#f8f8f8",
        // backgroundColor: 'purple',
        paddingBottom: 30
    },
    bottomContainer: {
        // borderColor: 'black',
        // borderWidth: 1,
        width: '100%',
        zIndex: 0,
    },
    title: {
        fontSize: 28,
        marginBottom: 0,
    },
    image: {
        width: '100%',
        // height: '60%',
        flex: 1
    },
    introductionText: {
        fontSize: 20,
        // marginTop: 15,
        // marginBottom: 20,
        lineHeight: 25,
        width: '96%',
        marginVertical: 15
    }
});
