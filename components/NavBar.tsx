import React from 'react';
import { View, StyleSheet, Pressable, Platform, StatusBar } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { PrimaryFontMedium } from './PrimaryFontMedium';

type NavBarProps = {
    title: string;
    onBackPress: () => void;
};

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export default function NavBar({ title, onBackPress }: NavBarProps) {
    return (
        <View style={styles.headerContainer}>
            <Pressable onPress={onBackPress} style={styles.iconContainer} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                {({ pressed }) => (
                  <MaterialIcons
                    name="arrow-back-ios-new"
                    size={20}
                    color={'#79828E'}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            <PrimaryFontMedium style={styles.title}>{title}</PrimaryFontMedium>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        width:'100%',
        marginTop: statusBarHeight
    },
    iconContainer: {
        position: 'absolute',
        left: 0,
        width: 40,
        height: 40,
        // borderWidth: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        display: 'flex',
        marginLeft: 15,
    },
    title: {
        fontSize: 16,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
