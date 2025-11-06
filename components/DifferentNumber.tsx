import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import { PrimaryFontText } from '@/components/PrimaryFontText';

export default function PhoneNumberSheet({ onContinue, disabled }: { onContinue: (phone: string) => void, disabled: boolean }) {
  const [phone, setPhone] = useState<string>('');
  const [error, setError] = useState<string>('');


const handleContinue = () => {
    const cleaned = phone.replace(/\s|-/g, '');
    const trimmed = cleaned.trim();
  
    if (!trimmed) {
      setError('Please enter a valid phone number');
      return;
    }
  
    if (trimmed.length < 10) {
      setError('Enter a valid number');
      return;
    }
  
    if (trimmed.length === 10) {
      if (trimmed.startsWith('07')) {
        const formatted = `254${trimmed.slice(1)}`;
        setError('');
        onContinue(formatted);
        return;
      }
      if (trimmed.startsWith('011')) {
        const formatted = `254${trimmed.slice(1)}`;
        setError('');
        onContinue(formatted);
        return;
      }
      setError('Enter a valid number');
      return;
    }
  
    if (trimmed.length === 13 && (trimmed.startsWith('+2547') || trimmed.startsWith('+2541'))) {
      const formatted = trimmed.slice(1);
      setError('');
      onContinue(formatted);
      return;
    }
  
    if (trimmed.length === 12 && (trimmed.startsWith('2547') || trimmed.startsWith('2541'))) {
      setError('');
      onContinue(trimmed);
      return;
    }
  
    setError('Enter a valid number');
  };
  

  const handleInputChange = (e: string) => {
    setError('');
    setPhone(e)
  }

  return (
    <View style={styles.container}>
      <PrimaryFontBold style={styles.title}>Phone Number</PrimaryFontBold>

      <View style={styles.descRow}>
        <View style={styles.iconWrapper}>
          <Ionicons name="information-outline" size={18} color="#C29E00" />
        </View>
        <PrimaryFontMedium style={styles.descText}>
          Make sure the contact is a registered mobile money user
        </PrimaryFontMedium>
      </View>

      <PrimaryFontMedium style={styles.label}>Phone number</PrimaryFontMedium>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder="0701234567"
        placeholderTextColor="#C3C2C2"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(e) => handleInputChange(e)}
      />

      {error ? (
        <PrimaryFontText style={styles.errorText}>{error}</PrimaryFontText>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={disabled}>
        <PrimaryFontBold style={styles.buttonText}>Continue</PrimaryFontBold>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#fff',
    width: '100%'
  },
  title: {
    fontSize: 22,
    color: '#111',
    marginBottom: 10,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 24,
  },
  iconWrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFE62C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  descText: {
    color: '#5C5B5B',
    flex: 1,
    fontSize: 14,
  },
  label: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#C3C3C3',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 18,
    color: '#000',
    marginBottom: 6,
    fontFamily: "DMSansMedium"
  },
  inputError: {
    borderColor: '#FF4D4D',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 14,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#00C48F',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 17,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 19,
  },
});
