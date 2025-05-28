import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

type IconProps = {
    icon: React.ReactNode;
    containerStyle?: ViewStyle;
};

export default function TransactionTypeIcon({ icon, containerStyle }: IconProps) {
    return (
        <View style={[styles.container, containerStyle]}>
            {icon}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 13,
        height: 26,
        width: 26
    }
});
