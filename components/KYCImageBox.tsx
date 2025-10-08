// src/components/KYCImageBox.tsx
import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
// import { Asset } from 'react-native-image-picker';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  asset?: string | null;
  placeholder?: string;
  onPress: () => void;
  onRemove?: () => void;
};

export default function KYCImageBox({ asset, placeholder = 'No image selected', onPress, onRemove }: Props) {
  return (
    <TouchableOpacity style={styles.box} onPress={onPress} activeOpacity={0.8}>
      {asset ? (
        <>
          <Image source={{ uri: asset }} style={styles.image} resizeMode="cover" />
          {onRemove ? (
            <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          ) : null}
        </>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{placeholder}</Text>
          <Text style={styles.tapText}>Tap to take or select image</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    height: 190,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: '#777', marginBottom: 8 },
  tapText: { color: '#AAA', fontSize: 13 },
  image: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
