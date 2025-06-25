import { Stack } from 'expo-router';
import { StyleSheet, Image, View } from 'react-native';
import spaceImage from '@/assets/images/space.png'
import { SecondaryFontText } from "@/components/SecondaryFontText";
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!', headerShown: true }} />
      <View style={styles.container}>
        <Image source={spaceImage} style={{ height: 200, width: 200, marginTop: -60 }} />
        <SecondaryFontText style={styles.title}>This screen doesn't exist.</SecondaryFontText>
        <PrimaryFontMedium style={styles.linkText}>Looks like you lost your way</PrimaryFontMedium>
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
    fontSize: 25,
    color: 'black',
    marginTop: 26,
    textAlign: 'center'
  },
  linkText: {
    fontSize: 16,
    marginTop: 15,
    color: 'grey',
  },
});
