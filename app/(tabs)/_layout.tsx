import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import HomeIcon from '@/assets/icons/HomeIcon';
import HomeIconActive from '@/assets/icons/HomIconActive';
import ProfileActive from '@/assets/icons/ProfileIconActive';
import Profile from '@/assets/icons/ProfileIcon';
//import More from '@/assets/icons/More';
import TransactionsIcon from '@/assets/icons/TransactionsIcon';
import TransactionsIconActive from '@/assets/icons/TransactionsIconActive';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#00C48F",
          tabBarInactiveTintColor: "#C9CACB",
          headerTitleAlign: 'center',
          headerShown: false,
          tabBarStyle: {
            height: 65,
            paddingTop: 10
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 10,
          }
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) =>
              focused
                ? <HomeIconActive width={30} height={30} />
                : <HomeIcon width={30} height={30} />,
          }}
        />

        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Transactions',
            tabBarIcon: ({ focused }) =>
              focused
                ? <TransactionsIconActive width={26} height={22} marginBottom={-5} />
                : <TransactionsIcon width={26} height={22} marginBottom={-5} />,
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) =>
              focused
                ? <ProfileActive width={30} height={30} />
                : <Profile width={30} height={30} />,
            headerShown: false
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
