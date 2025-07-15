import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ContactsList from '@/components/Contacts';
import AnimActionCard from '@/components/AnimActionCard';
import NavBar from '@/components/NavBar';
import { useRouter } from 'expo-router';

export default function Contacts() {
  const router = useRouter()
  return (
    <View style={{ backgroundColor: '#f8f8f8', flex: 1, alignItems: 'center' }}>
      <StatusBar style={'dark'} />
      <NavBar title='Who are you sending to?' onBackPress={() => router.back()} />
      <View style={{ width: '100%', paddingHorizontal: 17, alignItems: 'center', marginBottom: 12, marginTop: -3 }}>
        <AnimActionCard
          animationSource={require('@/assets/animations/walletaddress.json')}
          animationStyle={{ width: "100%", height: 100 }}
        />
      </View>

      <ContactsList from='contacts' />
    </View>
  );
}
