import React from 'react';
import { Pressable, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { PrimaryFontMedium } from './PrimaryFontMedium';
import { PrimaryFontText } from './PrimaryFontText';
import reusableStyle from '@/constants/ReusableStyles';
import TransactionTypeIcon from './TransactionTypeIcon';


type OptionProps = {
    route: Href<string | object>;
    option: string;
    description: string;
    icon: React.ReactNode;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
};

export default function MakePaymentOption({
    route,
    option,
    description,
    icon,
    containerStyle,
    textStyle,
}: OptionProps) {
    const router = useRouter();

    const handlePress = () => {
        router.push(route);
    };

    return (
        <Pressable style={[styles.container, containerStyle]} onPress={handlePress}>
            <View style={[styles.flexRow, reusableStyle.paddingContainer, { marginTop: 30 }]}>
                <TransactionTypeIcon containerStyle={{ borderColor: '#D9D9D9', borderWidth: 1, marginRight: 10, backgroundColor: 'white', height: 40, width: 40, borderRadius: 20 }} icon={icon}/>
                <View>
                    <PrimaryFontMedium style={{ fontSize: 19 }}>{option}</PrimaryFontMedium>
                    <PrimaryFontText style={{ fontSize: 15, color: '#79828E', marginTop: 5 }}>{description}</PrimaryFontText>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 1,
        backgroundColor: 'white',
    },
    text: {
        color: '#79828E',
        fontSize: 16,
        marginLeft: 10,
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center'
    }
});
