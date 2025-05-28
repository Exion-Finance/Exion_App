import { useState } from 'react';
import { Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export const useFingerprintAuthentication = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleFingerprintScan = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return Alert.alert('Oops😕', 'Biometric authentication is not available on this device.');
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return Alert.alert('Oops😕', 'No fingerprints or biometrics are registered on this device.');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to send money',
        fallbackLabel: 'Use PIN',
      });

      // if (result.success) {
      //   setIsAuthenticated(true);
      // } else {
      //   setIsAuthenticated(false);
      //   Alert.alert('Oops😕', 'Authentication failed. Try again.');
      //   return;
      // }
      setIsAuthenticated(result.success);
      return result.success;
    } catch (error) {
      Alert.alert('Oops😕', 'Something went wrong. Try again.');
    }
  };

  return { isAuthenticated, handleFingerprintScan };
};
