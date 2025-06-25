import React from 'react';
import { StyleSheet, ViewStyle, TextStyle, TouchableOpacity, View } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { PrimaryFontMedium } from './PrimaryFontMedium';
import Feather from '@expo/vector-icons/Feather';

type OptionProps = {
    route?: Href<string | object>;
    option: string;
    icon: React.ReactNode;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
};

export default function ProfileOption({
    route,
    option,
    icon,
    containerStyle,
    textStyle,
}: OptionProps) {
    const router = useRouter();

    const handlePress = () => {
        if (route) {
            router.push(route);
        }
    };

    return (
        <TouchableOpacity style={[styles.container, containerStyle]} onPress={handlePress}>
            <View style={styles.optionLeft}>
                {icon}
                <PrimaryFontMedium style={[styles.text, textStyle]}>{option}</PrimaryFontMedium>
            </View>
            <Feather name="chevron-right" size={20} color="#00C48F" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: '#f8f8f8',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    text: {
        color: '#79828E',
        fontSize: 16,
        marginLeft: 10,
    },
});
