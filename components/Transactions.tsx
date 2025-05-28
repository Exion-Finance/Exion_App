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
import { Transaction, TransactionData, Transactions } from '@/types/datatypes';


<StatusBar style={'dark'} />


interface Props {
    transactions?: TransactionData;
    refreshing: boolean;
    onRefresh: () => void;
}

export default function GroupedTransactions({ transactions, refreshing, onRefresh }: Props) {

    //const sections = groupTransactionsByDate(transactions);
    const sections = useMemo(() => {

        if (!transactions) {
            return [];
        }
        return Object.keys(transactions || {}).map((date: string) => ({
            title: date,
            data: transactions[date] || [],
        }));
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

    // if (transactions && sections.length === 0) {
    //     return (
    //         <View style={[styles.empty, reusableStyles.paddingContainer]}>
    //             <Image source={Empty} style={{ height: 160, width: 140, marginTop: -80 }} />
    //             <PrimaryFontMedium style={styles.emptyText}>
    //                 No transactions found
    //             </PrimaryFontMedium>
    //         </View>
    //     )
    // }

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
            keyExtractor={(item, index) => `${item.hash}-${index}`}
            style={[reusableStyles.paddingContainer, { backgroundColor: 'white' }]}
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
                                    {item.username
                                        ? item.username.startsWith('0x')
                                            ? `${item.username.slice(0, 5)} ...${item.username.slice(-4)}`
                                            : item.username
                                        : item.from
                                            ? `${item.from.slice(0, 5)} ...${item.from.slice(-4)}`
                                            : `${item.toAddress?.slice(0, 5)} ...${item.toAddress?.slice(-4)}`}
                                </PrimaryFontText>
                            </View>
                            <PrimaryFontText style={{ fontSize: 13, color: '#79828E', marginTop: 5 }}>
                                {item.transactionType === "Received" ? "Received" : "Sent"}
                            </PrimaryFontText>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                        <PrimaryFontMedium style={{ fontSize: 17, marginTop: 2, color: item.transactionType === "Received" ? "#5EAF5E" : "#343131" }}>
                            {item.transactionType === "Received" ? "+" : "-"} {"Ksh"}{`${!isNaN(Number(item.kes)) ? Number(item.kes).toFixed(2) : '0.00'}`}
                        </PrimaryFontMedium>

                        <PrimaryFontMedium style={{ fontSize: 12, marginTop: 4, color: item.transactionType === "Received" ? "#6B6B6B" : "#474545" }}>
                            {item.tokenSymbol.toUpperCase()} {(item.value ? (Number(item.value) / 10 ** parseInt(item.tokenDecimal)).toFixed(2) : (Number(item.amount)).toFixed(2))}
                        </PrimaryFontMedium>
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    emptyText: {
        fontSize: 18,
        color: '#79828E',
        marginTop: 10,
    },
    sectionHeader: {
        padding: 10,
        paddingLeft: 0,
        backgroundColor: '#fff',
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

