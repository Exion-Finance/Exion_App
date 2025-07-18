import React, { useMemo, useEffect } from 'react';
import { SectionList, Image, View, StyleSheet, Alert, RefreshControl, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import reusableStyles from '@/constants/ReusableStyles';
import { PrimaryFontText } from './PrimaryFontText';
import { PrimaryFontMedium } from './PrimaryFontMedium';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import TransactionTypeIcon from './TransactionTypeIcon';
import Empty from '@/assets/images/Empty.png'
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Transaction, TransactionData, OnchainSection } from '@/types/datatypes';


<StatusBar style={'dark'} />


interface Props {
    transactions?: Transaction[] | null;
    refreshing: boolean;
    onRefresh: () => void;
}

export default function GroupedTransactions({ transactions, refreshing, onRefresh }: Props) {

    //const sections = groupTransactionsByDate(transactions);
    // const sections = useMemo(() => {

    //     if (!transactions) {
    //         return [];
    //     }
    //     return Object.keys(transactions || {}).map((date: string) => ({
    //         title: date,
    //         data: transactions[date] || [],
    //     }));
    // }, [transactions]);

    const sections = useMemo<OnchainSection[]>(() => {
        if (!transactions?.length) return [];
        return groupOnChainTransactions(transactions);
    }, [transactions]);

    // console.log("---Transactions---")
    // console.log(transactions)

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            if (!state.isConnected) {
                Alert.alert("No Internet Connection 🌵", "You are not connected to the internet.");
            }
        });

        return () => unsubscribe();
    }, []);

    if (transactions && sections.length === 0) {
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

    const formatNumber = (value: string | number) => {
        const num = Number(value);
        if (isNaN(num)) return value;

        return new Intl.NumberFormat('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };











    

    function isSameDay(a: Date, b: Date) {
        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        );
    }

    function groupOnChainTransactions(txs: Transaction[]): OnchainSection[] {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);

        // 1) filter out exclude address
        const EXCLUDE = "0xabdee117d9236cba1477fa48ec1a2d3f1a53561b";
        // console.log("The damn txsssss--->>>", txs)
        const filtered = txs.filter((tx) => tx.to !== EXCLUDE);

        // 2) sort descending by timestamp
        filtered.sort(
            (a, b) =>
                Number(b.timeStamp) * 1000 - Number(a.timeStamp) * 1000
        );

        // 3) group
        const buckets: Record<string, Transaction[]> = {};
        filtered.forEach((tx) => {
            const date = new Date(Number(tx.timeStamp) * 1000);
            let key: string;

            if (isSameDay(date, now)) {
                key = 'Today';
            } else if (isSameDay(date, yesterday)) {
                key = 'Yesterday';
            } else {
                key = date.toLocaleDateString('en-KE', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                });
            }

            ; (buckets[key] ||= []).push(tx);
        });

        // 4) build sections array
        return Object.entries(buckets).map(([title, data]) => ({
            title,
            data,
        }));
    }

    return (
        <SectionList
            sections={sections}
            keyExtractor={(item, index) => `${item.hash}-${index}`}
            style={[reusableStyles.paddingContainer, { backgroundColor: '#f8f8f8' }]}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
                <View style={[reusableStyles.rowJustifyBetween, styles.transactionItem, { alignItems: 'flex-start' }]}>
                    <View style={styles.flexRow}>
                        {item.transactionType === "Received" ? (
                            <TransactionTypeIcon containerStyle={{ backgroundColor: '#DDFFF1' }} icon={<Feather name="arrow-down" size={14} color="#1E8A5E" />} />
                        ) : (
                            <TransactionTypeIcon containerStyle={{ backgroundColor: '#FFE3E3' }} icon={<Feather name="arrow-up" size={13} color="#EA2604" />} />
                        )}
                        <View style={{ marginLeft: 10 }}>
                            <View style={styles.flexRow}>
                                <PrimaryFontText style={{ fontSize: 19 }}>
                                    {item.transactionType === "Received"
                                        ? item.from.startsWith('0x')
                                            ? `${item.from.slice(0, 7)}...${item.from.slice(-4)}`
                                            : item.from
                                        : item.transactionType === "Sent"
                                            ? item.to.startsWith('0x')
                                                ? `${item.to.slice(0, 7)}...${item.to.slice(-4)}`
                                                : item.to
                                            : null}

                                </PrimaryFontText>
                            </View>
                            <PrimaryFontText style={{ fontSize: 13, color: '#79828E', marginTop: 5 }}>
                                {item.transactionType === "Received" ? "Received" : "Sent"}
                            </PrimaryFontText>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                        <PrimaryFontMedium style={{ fontSize: 16, color: item.transactionType === "Received" ? "#5EAF5E" : "#343131" }}>
                            {item.transactionType === "Received" ? "+" : "-"} {"Ksh"}{`${!isNaN(Number(item.kes)) ? formatNumber(Number(item.kes).toFixed(2)) : '0.00'}`}
                        </PrimaryFontMedium>

                        <PrimaryFontText style={{ fontSize: 11, marginTop: 4, color: item.transactionType === "Received" ? "#6B6B6B" : "#474545" }}>
                            {item.tokenSymbol.toUpperCase()} {(item.value ? (Number(item.value) / 10 ** parseInt(item.tokenDecimal)).toFixed(2) : (Number(item.amount)).toFixed(2))}
                        </PrimaryFontText>
                    </View>
                </View>
            )}
            renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                    <PrimaryFontText style={styles.sectionHeaderText}>{title}</PrimaryFontText>
                </View>
            )}
            showsVerticalScrollIndicator={false}
        />
    );


}

const styles = StyleSheet.create({
    empty: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    },
    emptyText: {
        fontSize: 18,
        color: '#79828E',
        marginTop: 10,
    },
    sectionHeader: {
        padding: 10,
        paddingLeft: 0,
        backgroundColor: '#f8f8f8',
    },
    sectionHeaderText: {
        fontSize: 15,
        color: '#79828E'
    },
    transactionItem: {
        padding: 15,
        paddingLeft: 0,
        paddingRight: 10,
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center'
    }
});

