import React from 'react';
import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets, SafeAreaProvider  } from 'react-native-safe-area-context';
import HomeIcon from '@/assets/icons/HomeIcon';
import HomeIconActive from '@/assets/icons/HomIconActive';
import ProfileActive from '@/assets/icons/ProfileIconActive';
import Profile from '@/assets/icons/ProfileIcon';
import TransactionsIcon from '@/assets/icons/TransactionsIcon';
import TransactionsIconActive from '@/assets/icons/TransactionsIconActive';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#00C48F",
          tabBarInactiveTintColor: "#C9CACB",
          headerShown: false,
          tabBarStyle: {
            height: 65 + insets.bottom,
            paddingBottom: insets.bottom || 10,
            paddingTop: 10,
            backgroundColor: '#f8f8f8',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) =>
              focused ? <HomeIconActive width={30} height={30} /> : <HomeIcon width={30} height={30} />,
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Transactions',
            tabBarIcon: ({ focused }) =>
              focused
                ? <TransactionsIconActive width={26} height={22} />
                : <TransactionsIcon width={26} height={22} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) =>
              focused ? <ProfileActive width={30} height={30} /> : <Profile width={30} height={30} />,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
