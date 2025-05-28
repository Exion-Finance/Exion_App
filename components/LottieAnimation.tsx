import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import LottieView from 'lottie-react-native';

type LottieAnimationProps = {
    animationSource: any;
    animationStyle?: ViewStyle;
    loop?: boolean;
};

const LottieAnimation: React.FC<LottieAnimationProps> = ({
    animationSource,
    animationStyle,
    loop
}) => {
    return (
        <View style={[styles.container, animationStyle]}>
            <LottieView
                source={animationSource}
                autoPlay
                loop={loop}
                style={[animationStyle, styles.animation]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        width: "100%",
        // borderWidth: 1
    },
    animation: {
        flex: 1
    }
});

export default LottieAnimation;
