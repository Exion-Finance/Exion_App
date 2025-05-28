import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View, StatusBar } from 'react-native';
import LottieView from 'lottie-react-native';
import { PrimaryFontBold } from './PrimaryFontBold';

const { width } = Dimensions.get('window');

type CustomToastProps = {
  animationSource: any;
  statusText: string;
  visible: boolean;
};

const CustomToast: React.FC<CustomToastProps> = ({ animationSource, statusText, visible }) => {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: -100,
        useNativeDriver: true,
      }).start();

      // Optional: Hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.spring(translateY, {
          toValue: -100,
          useNativeDriver: true,
        }).start();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.toastContainer, { transform: [{ translateY }] }]}>
      <LottieView source={animationSource} autoPlay loop style={styles.animation} />
      <PrimaryFontBold style={styles.statusText}>{statusText}</PrimaryFontBold>
    </Animated.View>
  );
};

export default CustomToast;

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: -(StatusBar.currentHeight || 0), 
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 20,
    backgroundColor: '#00C48F',
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  animation: {
    width: 40,
    height: 40,
  },
  statusText: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 10,
  },
});
