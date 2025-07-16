import { Stack } from 'expo-router';
import { StyleSheet, Image, View } from 'react-native';
import spaceImage from '@/assets/images/space.png'
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { StatusBar } from 'expo-status-bar';

export default function Notifications() {
  return (
    <>
      <Stack.Screen options={{ title: 'Notifications', headerShown: true, headerTitleStyle: {
      fontFamily: 'DMSansMedium',
      fontSize: 19,
    } }} />
      <View style={styles.container}>
        <StatusBar style='dark'/>
        <Image source={spaceImage} style={{ height: 140, width: 140, marginTop: -100 }} />
        <PrimaryFontBold style={styles.title}>Nothing here🌵</PrimaryFontBold>
        <PrimaryFontMedium style={styles.linkText}>You have no new notifications</PrimaryFontMedium>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8'
  },
  title: {
    fontSize: 24,
    color: '#111',
    marginTop: 26,
    textAlign: 'center'
  },
  linkText: {
    fontSize: 15,
    marginTop: 10,
    color: 'grey',
  },
});
