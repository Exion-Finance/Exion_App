import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';

export default function WebViewPage() {
    const { uri } = useLocalSearchParams();
  return (
    <View style={styles.container}>
      <WebView source={{ uri:  uri as string }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
