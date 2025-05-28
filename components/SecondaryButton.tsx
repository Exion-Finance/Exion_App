import React from 'react';
import { StyleSheet, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { PrimaryFontMedium } from './PrimaryFontMedium';

type ButtonProps = {
    route?: Href<string | object>;
    textOnButton: string;
    icon: React.ReactNode;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
    onPress? : () => void;
};

export default function SecondaryButton({
    route,
    textOnButton,
    icon,
    containerStyle,
    textStyle,
    onPress
}: ButtonProps) {
    const router = useRouter();

    const handlePress = () => {
        if (route) {
            router.push(route);
        }
        if (onPress) {
            onPress();
        }
    };

    return (
        <TouchableOpacity style={[styles.container, containerStyle]} onPress={handlePress}>
            {icon}
            <PrimaryFontMedium style={[styles.text, textStyle]}>{textOnButton}</PrimaryFontMedium>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 11,
        paddingHorizontal: 16,
        paddingRight: 21,
        backgroundColor: '#00C48F',
        borderRadius: 10,
    },
    text: {
        color: 'white',
        fontSize: 16,
        marginLeft: 5,
    },
});
