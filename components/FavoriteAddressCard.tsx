// components/FavoriteAddressCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FavoriteAddressCardProps {
  address: string;
  lastDate: Date;
  userName?: string;               // from DB if present
  onAddUsername: (address: string) => void;
}

export default function FavoriteAddressCard({
  address,
  lastDate,
  userName,
  onAddUsername,
}: FavoriteAddressCardProps) {
  // Formatting date for display
  const isToday = (d: Date) => {
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    lastDate.getFullYear() === yesterday.getFullYear() &&
    lastDate.getMonth() === yesterday.getMonth() &&
    lastDate.getDate() === yesterday.getDate();

  const displayDate = isToday(lastDate)
    ? 'Today'
    : isYesterday
    ? 'Yesterday'
    : lastDate.toLocaleDateString('en-KE', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  // Clip address
  const clipped = `${address.slice(0, 6)}…${address.slice(-6)}`;
  // Initials
  const initials = address.slice(2, 4).toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.initialsCircle}>
          <Text style={styles.initialsText}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.addressText}>{userName || clipped}</Text>
          <TouchableOpacity onPress={() => onAddUsername(address)}>
            <View style={styles.addRow}>
              <MaterialIcons name="badge" size={14} color="#007AFF" />
              <Text style={styles.addText}>
                {userName ? clipped : 'Add username'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.recentLabel}>Most recent</Text>
        <Text style={styles.dateText}>{displayDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  initialsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  initialsText: { fontSize: 14, fontWeight: '600', color: '#007AFF' },
  info: { },
  addressText: { fontSize: 16, color: '#333' },
  addRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  addText: { marginLeft: 4, fontSize: 12, color: '#007AFF' },
  right: { alignItems: 'flex-end' },
  recentLabel: { fontSize: 10, color: '#888' },
  dateText: { fontSize: 12, color: '#333' },
});
