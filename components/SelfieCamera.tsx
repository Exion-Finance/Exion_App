import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onCapture: (uri: string) => void;
  onCancel: () => void;
};

export default function SelfieCamera({ visible, onCapture, onCancel }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });
      onCapture(photo.uri);
    } catch (err) {
      console.error('takePicture error:', err);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      transparent={false}
      onRequestClose={onCancel}
    >
      <View style={styles.fullScreen}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="front"
        />

        {/* Overlay */}
        <View style={styles.overlay}>
          <View style={styles.circleBorder} />
          <Text style={styles.instruction}>Align your face in the circle</Text>

          {/* Capture */}
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <Ionicons name="camera" size={32} color="#fff" />
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBorder: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    borderWidth: 3,
    borderColor: '#00C48F',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  instruction: {
    color: '#fff',
    fontSize: 18,
    marginTop: 24,
  },
  captureButton: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: '#00C48F',
    borderRadius: 45,
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
});
