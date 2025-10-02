import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PrimaryFontMedium } from "./PrimaryFontMedium";
import { PrimaryFontText } from "./PrimaryFontText";
import { SecondaryFontText } from './SecondaryFontText';
// import Feather from '@expo/vector-icons/Feather';

interface FavoriteAddressCardProps {
    address: string;
    lastDate: Date | null;
    userName?: string;
    onAddUsername: (address: string) => void;
    onSelect: () => void;
}

export default function FavoriteAddressCard({
    address,
    lastDate,
    userName,
    onAddUsername,
    onSelect
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
        lastDate?.getFullYear() === yesterday.getFullYear() &&
        lastDate?.getMonth() === yesterday.getMonth() &&
        lastDate?.getDate() === yesterday.getDate();

    const displayDate = lastDate == null ?
        'No transactions' :
        isToday(lastDate)
            ? 'Today'
            : isYesterday
                ? 'Yesterday'
                : lastDate?.toLocaleDateString('en-KE', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                });

    // Clip address
    const clipped = address.startsWith("0x") ? `${address.slice(0, 10)}…${address.slice(-5)}` : address;
    // Initials
    const initials = userName ? userName.slice(0, 2) : address.slice(0, 2);

    return (
        <TouchableOpacity onPress={onSelect} style={styles.card}>
            <View style={styles.left}>
                <View style={styles.initialsCircle}>
                    <SecondaryFontText style={styles.initialsText}>{initials}</SecondaryFontText>
                </View>
                <View style={styles.info}>
                    <PrimaryFontMedium style={styles.addressText}>{userName || clipped}</PrimaryFontMedium>
                    <TouchableOpacity onPress={() => onAddUsername(address)}>
                        <View style={styles.addRow}>
                            <MaterialIcons name="badge" size={14} color="#007AFF" style={{ display: userName ? 'none' : 'flex', marginRight: 4 }} />
                            <PrimaryFontMedium style={styles.addText}>
                                {userName ? clipped : 'Add username'}
                            </PrimaryFontMedium>
                            {/* {userName ? <Feather name="edit-3" size={8} color="grey" style={{marginLeft: 1, marginTop: 1}}/> : null} */}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.right}>
                <PrimaryFontText style={styles.recentLabel}>Most recent</PrimaryFontText>
                <PrimaryFontMedium style={styles.dateText}>{displayDate}</PrimaryFontMedium>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#eee',
        paddingVertical: 13,
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
    info: {},
    addressText: { fontSize: 16.5, color: '#333', marginBottom: 3 },
    addRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    addText: { fontSize: 13, color: 'grey' },
    right: { alignItems: 'flex-end' },
    recentLabel: { fontSize: 10.5, color: '#888', marginBottom: 3 },
    dateText: { fontSize: 12.5, color: '#333' },
});
