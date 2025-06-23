import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PrimaryFontMedium } from './PrimaryFontMedium';

interface ProfileOptionProps {
    icon: React.ReactNode;
    description: string;
    onPress: () => void;
}

export default function ProfileOption({ icon, description, onPress }: ProfileOptionProps) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.optionContainer}>
            <View style={styles.optionLeft}>
                {icon}
                <PrimaryFontMedium style={styles.optionText}>{description}</PrimaryFontMedium>
            </View>
            <Feather name="chevron-right" size={20} color="#79828E" />
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 25,
        paddingHorizontal: 16,
        borderTopWidth: 0.7,
        borderBottomWidth: 0.7,
        borderColor: '#e0e0e0',
        marginTop: -1.5
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        marginLeft: 12,
        fontSize: 18,
        color: '#79828E',
    },
});