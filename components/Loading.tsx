import React from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { PrimaryFontBold } from './PrimaryFontBold';

export default function Loading({ color, description }: { color: string, description: string }) {
    return (
        <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color={color} />
            <PrimaryFontBold style={styles.text}>{description}</PrimaryFontBold>
        </View>
    )
}

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 40
    },
    processingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 19,
        fontFamily: 'DMSansMedium',
        marginLeft: 5
    }
})