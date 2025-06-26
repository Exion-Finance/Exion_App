import { StyleSheet, Pressable, Text, StyleProp, ViewStyle, Button, PressableProps, GestureResponderEvent, TouchableOpacity } from "react-native";
import { useRouter, Href } from 'expo-router';
import { PrimaryFontBold } from "./PrimaryFontBold";

interface ButtonProps extends PressableProps  {
    route?: Href<string | object>;
    textOnButton: any,
    widthProp?: StyleProp<ViewStyle>;
    disabled?: boolean;
}
export default function PrimaryButton({ route, textOnButton, widthProp,onPress, disabled }: ButtonProps) {
    const router = useRouter();
    const handlePress = async(event: GestureResponderEvent) => {
        if (onPress) {
            onPress(event); // Execute the custom onPress function if provided
        }
        if (route) {
            router.push(route); // Navigate if a route is provided
        }
    };
    return (
        <TouchableOpacity style={[styles.container, widthProp, { backgroundColor: disabled ? "#36EFBD" : "#00C48F" }]} onPress={handlePress} disabled={disabled}>
            <PrimaryFontBold style={styles.text}>{textOnButton}</PrimaryFontBold>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        // backgroundColor: '#00C48F',
        padding: 10,
        borderRadius: 9,
        alignItems: 'center',
        paddingVertical: 18,
        width: '92%'
    },
    text: {
        color: '#fff',
        fontSize: 19,
        fontFamily: 'DMSansRegular'
    }
});