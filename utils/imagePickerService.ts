// src/utils/imagePickerService.ts
import * as ImagePicker from 'expo-image-picker';

/**
 * Open the device camera to capture a photo
 */
export async function openCamera(): Promise<string | null> {
  try {
    // Request permission first
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      console.warn('Camera permission not granted');
      return null;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      // aspect: [4, 3],
    });

    if (result.canceled) return null;

    // Return the image URI
    return result.assets[0].uri;
  } catch (e) {
    console.log('openCamera error', e);
    return null;
  }
}

/**
 * Open the device gallery to select a photo
 */
export async function openGallery(): Promise<string | null> {
  try {
    // Request permission first
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      console.warn('Media library permission not granted');
      return null;
    }

    // Launch gallery picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      // aspect: [4, 3],
    });

    if (result.canceled) return null;

    // Return the image URI
    return result.assets[0].uri;
  } catch (e) {
    console.log('openGallery error', e);
    return null;
  }
}
