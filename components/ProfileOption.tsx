import React from 'react';
import { Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { PrimaryFontMedium } from './PrimaryFontMedium';

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
        if(route){
            router.push(route);
        }
    };

    return (
        <Pressable style={[styles.container, containerStyle]} onPress={handlePress}>
            {icon}
            <PrimaryFontMedium style={[styles.text, textStyle]}>{option}</PrimaryFontMedium>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 8,
        backgroundColor: 'white',
    },
    text: {
        color: '#79828E',
        fontSize: 16,
        marginLeft: 10,
    },
});
