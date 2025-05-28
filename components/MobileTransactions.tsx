// GroupedTransactions.tsx
import React from 'react'
import { PrimaryFontText } from './PrimaryFontText';
import { PrimaryFontMedium } from './PrimaryFontMedium';
import { SectionList, View, TouchableOpacity, StyleSheet, Image, RefreshControl, ScrollView } from 'react-native'
import { MobileTransaction, Section } from '@/types/datatypes'
import Empty from '@/assets/images/Empty.png'
import reusableStyles from '@/constants/ReusableStyles';
import Feather from '@expo/vector-icons/Feather';
import TransactionTypeIcon from './TransactionTypeIcon';

interface Props {
    sections: Section[];
    refreshing: boolean;
    onRefresh: () => void;
}

export const MobileTransactions: React.FC<Props> = ({ sections, refreshing, onRefresh }) => {
    const formatTime = (s: string) => {
        const d = new Date(
            +s.slice(0, 4),
            +s.slice(4, 6) - 1,
            +s.slice(6, 8),
            +s.slice(8, 10),
            +s.slice(10, 12)
        )
        const hour = d.getHours() % 12 || 12
        const ampm = d.getHours() < 12 ? 'am' : 'pm'
        const min = d.getMinutes().toString().padStart(2, '0')
        return `${hour}:${min}${ampm}`
    }

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

    if (sections && sections.length === 0) {
        return (
            <ScrollView
                contentContainerStyle={[styles.empty, reusableStyles.paddingContainer]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <Image
                    source={Empty}
                    style={{ height: 150, width: 130, marginTop: -80 }}
                />
                <PrimaryFontMedium style={styles.emptyText}>
                    No transactions found
                </PrimaryFontMedium>
            </ScrollView>
        )
    }

    return (
        <SectionList
            sections={sections}
            keyExtractor={(item, index) =>
                item.id
                  ? item.id
                  : `missing-id-${index}`
              }
            renderSectionHeader={({ section: { title } }) => (
                <PrimaryFontText style={styles.header}>{title}</PrimaryFontText>
            )}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            style={styles.section}
            renderItem={({ item }) => {
                const [first, second] = item.recipientName.split(' ')
                return (
                    <TouchableOpacity style={[reusableStyles.rowJustifyBetween, styles.row]}>
                        <View style={styles.flexRow}>
                            <TransactionTypeIcon containerStyle={{ backgroundColor: '#FFE3E3' }} icon={<Feather name="arrow-up" size={13} color="#EA2604" />} />
                            <View style={{ marginLeft: 10 }}>
                                <PrimaryFontText style={styles.name}>{capitalize(first)} {capitalize(second)}</PrimaryFontText>
                                <PrimaryFontText style={styles.channel}>{item.destinationChannel}</PrimaryFontText>
                            </View>
                        </View>

                        <View style={styles.amountBlock}>
                            <PrimaryFontMedium style={styles.amount}>Ksh {item.transactionAmount.toFixed(2)}</PrimaryFontMedium>
                            <PrimaryFontMedium style={styles.time}>{formatTime(item.transactionDate)}</PrimaryFontMedium>
                        </View>
                    </TouchableOpacity>
                )
            }}
            // contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
        />
    )
}

const styles = StyleSheet.create({
    section: {
        backgroundColor: 'white',
        paddingLeft: 18,
        paddingRight: 30,
    },
    header: {
        fontSize: 15,
        marginTop: 13,
        marginBottom: 15,
        color: '#79828E'
    },
    row: {
        width: '100%',
        paddingBottom: 25,
        paddingTop: 0,
    },
    name: {
        fontSize: 18,
    },
    channel: {
        fontSize: 11,
        color: '#79828E',
        marginTop: 7,
    },
    amountBlock: {
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    amount: {
        fontSize: 16.5,
        color: '#5EAF5E',
        marginTop: 0
    },
    time: {
        fontSize: 12,
        color: '#6B6B6B',
        marginTop: 4,
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    empty: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    emptyText: {
        fontSize: 18,
        color: '#79828E',
        marginTop: 10,
    }
})
