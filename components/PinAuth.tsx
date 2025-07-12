import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { authAPI } from '@/app/context/AxiosProvider';
import Toast from 'react-native-toast-message';
import { SecondaryFontText } from './SecondaryFontText';
import { PrimaryFontText } from './PrimaryFontText';
import { PrimaryFontBold } from './PrimaryFontBold';
import { PrimaryFontMedium } from './PrimaryFontMedium';

type Mode = 'create' | 'confirm' | 'verify';

export default function PinAuth({
  onSuccess,
  onCancel,
  onClose,
  hasPin
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
  onClose: () => void;
  hasPin: boolean
}) {
  const [mode, setMode] = useState<Mode>('create');
  const [firstPin, setFirstPin] = useState<string>('');
  const [pin, setPin] = useState<string>('');

  // Hold a reference to the looping animation
  const loopAnim = useRef<Animated.CompositeAnimation | null>(null);

  // Create one Animated.Value per dot
  const scales = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(1))
  ).current;

  // on mount, check if PIN exists in flag storage
  useEffect(() => {
    (async () => {
      // const flag = await SecureStore.getItemAsync('user_has_pin');
      setMode(hasPin ? 'verify' : 'create');
    })();
  }, []);

  useEffect(() => {
    if (pin.length === 4) {
      switch (mode) {
        case 'create':
          setFirstPin(pin);
          setPin('');
          setMode('confirm');
          break;

        case 'confirm':
          if (pin !== firstPin) {
            Toast.show({ type: 'error', text1: 'Pins do not match' });
            setPin('');
          } else {
            createPin(pin);
          }
          break;

        case 'verify':
          verifyPin(pin);
          break;
      }
    }
  }, [pin]);

  useEffect(() => {
    // Whenever PIN length hits 4, start looping pulse
    if (pin.length === 4) {
      // Build the individual dot sequences
      const sequences = scales.map((scale) =>
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.4,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ])
      );
      // Stagger them left→right
      const staggered = Animated.stagger(100, sequences);
      // Loop forever
      loopAnim.current = Animated.loop(staggered);
      loopAnim.current.start();
    } else {
      // If PIN length changes (backspace or reset), stop the loop
      loopAnim.current?.stop();
      // Reset scales to original state
      scales.forEach((scale) => scale.setValue(1));
    }

    // Cleanup on unmount
    return () => {
      loopAnim.current?.stop();
    };
  }, [pin]);

  const createPin = async (newPin: string) => {
    try {
      const res = await authAPI.post('/user/pin/create', { pin: newPin });
      // console.log('<<<<---->>>>', res.data)
      if (res.data.success) {
        await SecureStore.setItemAsync('user_has_pin', 'true');
        Toast.show({ type: 'success', text1: 'Pin created successfully' });
        setFirstPin('');
        setPin('');
        setMode('verify');
      } else {
        throw new Error(res.data.message);
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to create PIN' });
      setPin('');
      setMode('create');
    }
  };

  const verifyPin = async (entered: string) => {
    try {
      const res = await authAPI.post('/user/pin/verify', { pin: entered });
      // console.log('<<<<---->>>>', res.data)
      if (res.data.success) {
        onSuccess && onSuccess();
      } else {
        throw new Error('Invalid pin');
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: "Invalid pin" });
      setPin('');
    }
  };

  // handle numeric keypad press
  const onKeyPress = (digit: string) => {
    setPin((p) => (p.length < 4 ? p + digit : p));
  };

  // backspace
  const onBackspace = () => {
    setPin((p) => p.slice(0, -1));
  };

  // fingerprint fallback
  const onFingerprint = async () => {
    // call your fingerprint logic here
    // if success: onSuccess()
    console.log('Fingerprinttttt')
  };

  const titleMap = {
    create: 'Create Pin',
    confirm: 'Confirm Pin',
    verify: 'Verify Pin',
  };

  const subtitleMap = {
    create: 'Enter a 4‑digit pin.',
    confirm: 'Confirm your 4‑digit pin.',
    verify: 'Enter your pin to send money.',
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Pressable style={styles.closeContainer} onPress={onClose}>
        <Feather name='x' color={'grey'} size={28} />
      </Pressable>

      <SecondaryFontText style={styles.title}>{titleMap[mode]}</SecondaryFontText>
      <Feather name="lock" size={38} color="#333" style={{ marginVertical: 16, marginBottom: 20 }} />
      <PrimaryFontText style={styles.subtitle}>{subtitleMap[mode]}</PrimaryFontText>

      {/* PIN dots */}
      <View style={styles.dotsRow}>
        {scales.map((scale, i) => (
          <View key={i} style={styles.dotContainer}>
            <Animated.View
              style={[
                styles.dot,
                pin.length > i && styles.dotFilled,
                { transform: [{ scale }] },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''].map((k, i) => {
          if (i === 9) {
            return (
              <TouchableOpacity key={'finger'} onPress={onFingerprint} style={styles.key}>
                <Ionicons name="finger-print-sharp" size={24} color="#555" />
              </TouchableOpacity>
            );
          }
          if (i === 11) {
            return (
              <TouchableOpacity key={'back'} onPress={onBackspace} style={styles.key}>
                <Feather name="delete" size={24} color="#555" />
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity key={k} onPress={() => onKeyPress(k)} style={styles.key}>
              <PrimaryFontBold style={styles.keyText}>{k}</PrimaryFontBold>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Forgot Pin link only in verify mode */}
      {mode === 'verify' && (
        <TouchableOpacity onPress={() => setMode('create')}>
          <PrimaryFontMedium style={styles.forgot}>Forgot Pin?</PrimaryFontMedium>
        </TouchableOpacity>
      )}

      <Toast position="top" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, color: '#222' },
  subtitle: { fontSize: 17, color: '#555', marginBottom: 24, textAlign: 'center' },
  // 
  dotsRow: { flexDirection: 'row', marginBottom: 32 },
  dotContainer: { marginHorizontal: 12 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#888',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#00C48F',
  },


  keypad: {
    width: '80%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20
  },
  key: {
    width: '30%',
    // aspectRatio: 0.8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  keyText: { fontSize: 24, color: '#333' },
  forgot: { color: '#007AFF', marginTop: 30, fontSize: 16 },
  closeContainer: {
    width: '100%',
    paddingHorizontal: 18,
    alignItems: 'flex-end'
  }
});
