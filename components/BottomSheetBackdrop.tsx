import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolation,
    SharedValue,
} from 'react-native-reanimated';

interface BottomSheetBackdropProps {
    animatedIndex: SharedValue<number>;
    blurIntensity?: number;
    blurTint?: 'light' | 'dark' | 'default';
}

const BottomSheetBackdrop: React.FC<BottomSheetBackdropProps> = ({
    animatedIndex,
    blurIntensity = 80,
    blurTint = 'dark',
}) => {
    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            animatedIndex.value,
            [-1, 0],
            [0, 1],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    return (
        <Animated.View pointerEvents="box-none" style={[StyleSheet.absoluteFill, animatedStyle]}>
            <BlurView pointerEvents="none" intensity={blurIntensity} tint={blurTint} style={StyleSheet.absoluteFill} />
        </Animated.View>
    );
};

export default BottomSheetBackdrop;
