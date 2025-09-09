import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { sendUpdateEmailOTP } from "./Apiconfig/api";
import { StatusBar } from 'expo-status-bar';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { PrimaryFontText } from '@/components/PrimaryFontText';
import Loading from '@/components/Loading';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { selectUserProfile } from './state/slices';
import { authAPI } from './context/AxiosProvider';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';

type Step = 'prompt' | 'enterOtp' | 'create' | 'confirm' | 'done';

export default function ResetPinOtp() {
  const route = useRouter();
  const user_profile = useSelector(selectUserProfile);

  const [step, setStep] = useState<Step>('prompt');
  const [buttonClicked, setButtonClicked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP and pin states
  const [otp, setOtp] = useState<string>('');
  const [pin, setPin] = useState<string>(''); // used while typing
  const [firstPin, setFirstPin] = useState<string>('');
  const [confirming, setConfirming] = useState<boolean>(false);

  // send OTP to user's email
  const handleSendOtp = async () => {
    if (!user_profile?.email) {
      setError('No email found on profile');
      return;
    }
    setError(null);
    setButtonClicked(true);
    try {
      // === REPLACE this endpoint with your real "send otp for reset" endpoint if needed ===
      const res = await authAPI.post('/verification/sendProfileOtp', { identifier: user_profile.email });

      // Accept success if status 200 or res.data.success.
      if (res?.status === 200 || res?.data?.success) {
        Toast.show({ type: 'success', text1: 'OTP sent to your email' });
        setStep('enterOtp');
      } else {
        setError(res?.data?.message || 'Failed to send OTP');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setButtonClicked(false);
    }
  };

  // user enters otp (we don't verify now), proceed to create pin
  const handleOtpNext = () => {
    if (!otp || otp.length < 4) {
      setError('Enter the OTP you received');
      return;
    }
    setError(null);
    setStep('create');
  };

  // keypad handlers used for create & confirm steps
  const onKeyPress = (digit: string) => {
    if (pin.length >= 4) return;
    setPin((p) => p + digit);
  };
  const onBackspace = () => {
    setPin((p) => p.slice(0, -1));
  };

  // watch pin length to progress through create/confirm flow
  useEffect(() => {
    if (pin.length === 4) {
      if (step === 'create') {
        // move to confirm
        setFirstPin(pin);
        setPin('');
        setStep('confirm');
      } else if (step === 'confirm') {
        // check match
        if (pin !== firstPin) {
          Toast.show({ type: 'error', text1: 'Pins do not match' });
          // reset to create to try again
          setPin('');
          setFirstPin('');
          setStep('create');
        } else {
          // pins match -> submit reset to backend
          submitResetPin(pin);
        }
      }
    }
  }, [pin]);

  const submitResetPin = async (finalPin: string) => {
    setConfirming(true);
    try {
      const res = await authAPI.post('/user/pin/reset', {
        otp,
        pin: finalPin,
      });

      if (res?.status === 200 || res?.data?.success) {
        // set flag locally
        await SecureStore.setItemAsync('user_has_pin', 'true');
        Toast.show({ type: 'success', text1: 'Pin reset successful' });
        route.back();
      } else {
        const msg = res?.data?.message || 'Failed to reset PIN';
        Toast.show({ type: 'error', text1: msg });
        // Allow user to try again: reset flow to create
        setStep('create');
        setPin('');
        setFirstPin('');
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Reset failed';
      Toast.show({ type: 'error', text1: msg });
      setStep('create');
      setPin('');
      setFirstPin('');
    } finally {
      setConfirming(false);
    }
  };

  // small helper to render the 4-dot visual for PIN states
  const renderPinDots = (value: string) => {
    const dots = [];
    for (let i = 0; i < 4; i++) {
      const filled = i < value.length;
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            filled ? styles.dotFilled : undefined,
          ]}
        />,
      );
    }
    return <View style={styles.dotsRow}>{dots}</View>;
  };

  // keypad UI reused from PinAuth: numbers + fingerprint/back icons replaced with back only.
  const Keypad = () => {
    const keys = ['1','2','3','4','5','6','7','8','9','','0',''];
    return (
      <View style={styles.keypad}>
        {keys.map((k, i) => {
          if (i === 9) {
            // placeholder blank
            return <View key={'blank'+i} style={styles.key} />;
          }
          if (i === 11) {
            // backspace
            return (
              <TouchableOpacity key={'back'} onPress={onBackspace} style={styles.key}>
                <MaterialIcons name="keyboard-backspace" size={24} color="#555" />
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity key={k + i} onPress={() => onKeyPress(k)} style={styles.key}>
              <PrimaryFontBold style={styles.keyText}>{k}</PrimaryFontBold>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <StatusBar style={'dark'} />
      <PrimaryFontMedium style={styles.label}>Reset pin</PrimaryFontMedium>

      {/* STEP: PROMPT -> SEND OTP */}
      {step === 'prompt' && (
        <View style={{ width: '100%', flex: 1, justifyContent: 'space-between' }}>
          <View>
            <PrimaryFontMedium style={styles.infoText}>
              To ensure account security, we'll send a secure OTP to your email address
            </PrimaryFontMedium>

            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="user@example.com"
              editable={false}
              defaultValue={user_profile?.email || ''}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
              <Feather name="info" size={15} color="grey" />
              <PrimaryFontText style={{ color: 'grey', marginLeft: 8 }}>
                You will receive an OTP via email
              </PrimaryFontText>
            </View>
            {error ? <PrimaryFontText style={{ color: 'red', marginTop: 8 }}>{error}</PrimaryFontText> : null}
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: buttonClicked ? '#36EFBD' : '#00C48F' }]}
            onPress={handleSendOtp}
            disabled={buttonClicked}
          >
            <PrimaryFontBold style={styles.buttonText}>
              {buttonClicked ? <Loading color="#fff" description="Sending..." /> : 'Send OTP'}
            </PrimaryFontBold>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP: ENTER OTP */}
      {step === 'enterOtp' && (
        <View style={{ width: '100%', flex: 1, justifyContent: 'space-between' }}>
          <View>
            <PrimaryFontMedium style={styles.infoText}>
              Enter the OTP sent to your email
            </PrimaryFontMedium>

            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="Enter OTP"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
            />

            <PrimaryFontText style={{ color: 'grey', marginTop: 8 }}>
              Don’t close this screen. If you didn’t get an OTP, go back and resend.
            </PrimaryFontText>
            {error ? <PrimaryFontText style={{ color: 'red', marginTop: 8 }}>{error}</PrimaryFontText> : null}
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#00C48F' }]}
            onPress={handleOtpNext}
            disabled={!otp || otp.length < 4}
          >
            <PrimaryFontBold style={styles.buttonText}>Next</PrimaryFontBold>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP: CREATE PIN */}
      {step === 'create' && (
        <View style={{ width: '100%', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
          <PrimaryFontMedium style={{ fontSize: 20, marginBottom: -10, marginTop: 10 }}>Create Pin</PrimaryFontMedium>
          <PrimaryFontText style={{ color: '#666', textAlign: 'center', marginBottom: 10 }}>
            Enter a 4-digit pin.
          </PrimaryFontText>

          {renderPinDots(pin)}

          <Keypad />

          <TouchableOpacity style={[styles.smallCancel]} onPress={() => { setPin(''); setFirstPin(''); setStep('prompt'); }}>
            <PrimaryFontText style={{ color: '#007AFF' }}>Cancel</PrimaryFontText>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP: CONFIRM PIN */}
      {step === 'confirm' && (
        <View style={{ width: '100%', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
          <PrimaryFontMedium style={{ fontSize: 20, marginBottom: 8 }}>Confirm Pin</PrimaryFontMedium>
          <PrimaryFontText style={{ color: '#666', textAlign: 'center', marginBottom: 10 }}>
            Confirm your 4-digit pin.
          </PrimaryFontText>

          {renderPinDots(pin)}

          <Keypad />

          {confirming ? (
            <TouchableOpacity style={[styles.button, { opacity: 0.9 }]} disabled>
              <PrimaryFontBold style={styles.buttonText}><Loading color="#fff" description="Saving..." /></PrimaryFontBold>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <Toast />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 20, marginBottom: 12, marginTop: 20 },
  infoText: { fontSize: 18, color: '#333' },
  input: {
    height: 56,
    borderRadius: 8,
    paddingLeft: 15,
    fontSize: 18,
    color: '#473F3F',
    marginTop: 8,
    backgroundColor: '#F8F8F8',
    borderColor: '#C3C3C3',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#00C48F',
    padding: 10,
    borderRadius: 9,
    alignItems: 'center',
    paddingVertical: 18,
    width: '100%'
  },
  buttonText: {
    color: '#fff',
    fontSize: 19,
    fontFamily: 'DMSansMedium'
},
  // PIN dots / keypad
  dotsRow: { flexDirection: 'row', marginBottom: 18, justifyContent: 'center' },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#888',
    marginHorizontal: 10,
    backgroundColor: 'transparent',
  },
  dotFilled: { backgroundColor: '#00C48F', borderColor: '#00C48F' },

  keypad: {
    width: '80%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  key: {
    width: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  keyText: { fontSize: 24 },
  smallCancel: { marginTop: -5, marginBottom: 20 },
});
