import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ContactsList from '@/components/Contacts';
import NavBar from '@/components/NavBar';
import { useRouter } from 'expo-router';

export default function Contacts() {
const router = useRouter()
  return (
    <View style={{backgroundColor: '#f8f8f8', flex: 1}}>
        <StatusBar style={'dark'}/>
        <NavBar title='Who are you sending to?' onBackPress={() => router.back()} />
        <ContactsList from='contacts'/>
    </View>
  );
}
