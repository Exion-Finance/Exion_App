import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function WebViewPage() {
    const { uri } = useLocalSearchParams();
  return (
    <View style={styles.container}>
      <StatusBar style={'dark'} />
      <WebView source={{ uri:  uri as string }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
