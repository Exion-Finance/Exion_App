// GroupedTransactions.tsx
import React, { useRef } from 'react'
import { PrimaryFontText } from './PrimaryFontText';
import { PrimaryFontMedium } from './PrimaryFontMedium';
import { SectionList, View, TouchableOpacity, StyleSheet, Image, RefreshControl, ScrollView } from 'react-native'
import { MobileTransaction, Section } from '@/types/datatypes'
import Empty from '@/assets/images/Empty.png'
import reusableStyles from '@/constants/ReusableStyles';
import Feather from '@expo/vector-icons/Feather';
import TransactionTypeIcon from './TransactionTypeIcon';
import PendingBadge from './PendingCard';

interface Props {
    sections: Section[];
    refreshing: boolean;
    onRefresh: () => void;
    onSelectTransaction: (tx: MobileTransaction) => void;
}

export const MobileTransactions: React.FC<Props> = ({ sections, refreshing, onRefresh, onSelectTransaction }) => {

    // const formatTime = (s: string) => {
    //     const year = +s.slice(0, 4);
    //     const month = +s.slice(4, 6) - 1;
    //     const day = +s.slice(6, 8);
    //     const hour = +s.slice(8, 10);
    //     const min = +s.slice(10, 12);

    //     // Create the date in UTC
    //     const d = new Date(Date.UTC(year, month, day, hour, min));

    //     const localHour = d.getHours() % 12 || 12;
    //     const ampm = d.getHours() < 12 ? 'am' : 'pm';
    //     const minute = d.getMinutes().toString().padStart(2, '0');

    //     return `${localHour}:${minute}${ampm}`;
    // };

    const formatTime = (s?: string | null) => {
        try {
            // If s is invalid, use a fallback (current time)
            if (!s || s.length < 12) {
                const now = new Date();
                const hour = now.getHours() % 12 || 12;
                const minute = now.getMinutes().toString().padStart(2, '0');
                const ampm = now.getHours() < 12 ? 'am' : 'pm';
                return `${hour}:${minute}${ampm}`;
            }

            const year = +s.slice(0, 4);
            const month = +s.slice(4, 6) - 1;
            const day = +s.slice(6, 8);
            const hour = +s.slice(8, 10);
            const min = +s.slice(10, 12);

            const d = new Date(Date.UTC(year, month, day, hour, min));
            if (isNaN(d.getTime())) {
                // fallback if invalid date
                const now = new Date();
                const hour = now.getHours() % 12 || 12;
                const minute = now.getMinutes().toString().padStart(2, '0');
                const ampm = now.getHours() < 12 ? 'am' : 'pm';
                return `${hour}:${minute}${ampm}`;
            }

            const localHour = d.getHours() % 12 || 12;
            const ampm = d.getHours() < 12 ? 'am' : 'pm';
            const minute = d.getMinutes().toString().padStart(2, '0');

            return `${localHour}:${minute}${ampm}`;
        } catch (e) {
            // Catch any unexpected errors and safely fallback
            const now = new Date();
            const hour = now.getHours() % 12 || 12;
            const minute = now.getMinutes().toString().padStart(2, '0');
            const ampm = now.getHours() < 12 ? 'am' : 'pm';
            return `${hour}:${minute}${ampm}`;
        }
    };


    // console.log(JSON.stringify(sections, null, 2));
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
                    style={{ height: 125, width: 110, marginTop: 40 }}
                />
                <PrimaryFontMedium style={styles.emptyText}>
                    No transactions found
                </PrimaryFontMedium>
            </ScrollView>
        )
    }

    const formatTransaction = (item: any) => {
        let username = "";
        let transactionType = "";

        switch (item.type) {
            case "TILL":
                if (item.status === "PENDING" && !item.thirdPartyTransactionCode) {
                    username = "Mobile Money";
                }
                else {
                    username = item.recipientAccountNumber;
                }
                transactionType = "Buy Goods";
                break;

            case "MPESA":
                if (item.recipientName && typeof item.recipientName === 'string' && item.recipientName.trim() !== "") {
                    const nameParts = item.recipientName.trim().split(" ");
                    const first = nameParts[0]
                        ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase()
                        : "";
                    const last = nameParts.length > 1
                        ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].slice(1).toLowerCase()
                        : "";
                    username = `${first} ${last}`.trim();
                } else if (item.status === "PENDING" && !item.thirdPartyTransactionCode) {
                    username = "Mobile Money";
                }
                else {
                    username = item.recipientAccountNumber ?? "Unknown";
                }
                transactionType = "Send Money";
                break;


            case "PAYBILL":
                if (item.status === "PENDING" && !item.thirdPartyTransactionCode) {
                    username = "Mobile Money";
                }
                else {
                    username = item.recipientAccountNumber;
                }
                transactionType = "Paybill";
                break;

            case "OnRAMP":
                username = "Deposit";
                transactionType = "Received";
                break;

            default:
                if (item.type === null) {
                    if (item.recipientName && typeof item.recipientName === 'string' && item.recipientName.trim() !== "") {
                        const nameParts = item.recipientName.trim().split(" ");
                        const first = nameParts[0]
                            ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase()
                            : "";
                        const last = nameParts.length > 1
                            ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].slice(1).toLowerCase()
                            : "";
                        username = `${first} ${last}`.trim();
                        transactionType = "Send Money";
                    } else {
                        username = item.recipientAccountNumber ?? "Unknown";
                        transactionType = "Mpesa";
                    }
                }
                break;

        }

        return { username, transactionType };
    };

    const formatNumber = (value: string | number) => {
        const num = Number(value);
        if (isNaN(num)) return value;

        return new Intl.NumberFormat('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };


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
                const { username, transactionType } = formatTransaction(item);
                return (
                    <TouchableOpacity style={[reusableStyles.rowJustifyBetween, styles.row]} onPress={() => onSelectTransaction(item)}>
                        <View style={styles.flexRow}>
                            {item.type === "OnRAMP" ? (
                                <TransactionTypeIcon containerStyle={{ backgroundColor: '#Eee' }} icon={<Feather name="arrow-down" size={14} color="#1E8A5E" />} />
                            ) : (
                                <TransactionTypeIcon containerStyle={{ backgroundColor: '#FFE3E3' }} icon={<Feather name="arrow-up" size={13} color="#EA2604" />} />
                            )}
                            <View style={{ marginLeft: 10 }}>
                                <PrimaryFontText style={styles.name}>{username}</PrimaryFontText>
                                <PrimaryFontText style={styles.channel}>{transactionType}</PrimaryFontText>
                            </View>
                        </View>

                        <View style={styles.amountBlock}>
                            <PrimaryFontMedium style={[styles.amount, { color: item.type === "OnRAMP" ? '#5EAF5E' : '#343131' }]}>{item.type === "OnRAMP" ? `+ Ksh ${formatNumber(item.transactionAmount.toFixed(2))}` : `- Ksh ${formatNumber(item.transactionAmount.toFixed(2))}`}</PrimaryFontMedium>
                            <PrimaryFontText style={styles.time}>{item.status === "PENDING"  && !item.thirdPartyTransactionCode ? <PendingBadge textStyle={{ fontSize: 13, color: 'gray' }} dotColor='#b2b2b2' /> : formatTime(item.transactionDate)}</PrimaryFontText>
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
        backgroundColor: '#f8f8f8',
        paddingLeft: 18,
        paddingRight: 30,
    },
    header: {
        fontSize: 14.5,
        marginTop: 2,
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
        fontSize: 11.5,
        color: '#79828E',
        marginTop: 7.5,
    },
    amountBlock: {
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    amount: {
        fontSize: 16.5,
        // color: '#343131',
        // marginTop: 0
    },
    time: {
        fontSize: 11,
        color: '#6B6B6B',
        marginTop: 3,
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    empty: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    },
    emptyText: {
        fontSize: 18,
        color: '#79828E',
        marginTop: 10,
    }
})
