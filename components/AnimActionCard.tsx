import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryFontBold } from './PrimaryFontBold';
import { PrimaryFontText } from './PrimaryFontText';
import LottieAnimation from './LottieAnimation';

interface ActionCardProps {
  title?: string;
  subtitle?: string;
  animationSource: any;
  animationStyle?: ViewStyle;
}

export default function AnimActionCard({
  animationSource,
  animationStyle,
  title = 'Wallet Address',
  subtitle = 'Send to an external wallet address',
}: ActionCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push('/enterwalletaddress');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.iconWrapper}>
        <LottieAnimation animationSource={animationSource} animationStyle={animationStyle}/>
      </View>
      <View style={styles.textWrapper}>
        <PrimaryFontBold style={styles.title}>{title}</PrimaryFontBold>
        <PrimaryFontText style={styles.subtitle}>{subtitle}</PrimaryFontText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1.4,
    borderColor: '#ddd',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#eef6ff',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#f8f8f8'
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 16.5,
    color: '#222',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});