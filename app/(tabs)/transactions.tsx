import { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, View, StatusBar as RNStatusBar, Platform, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import GroupedTransactions from '@/components/Transactions';
import { MobileTransactions } from '@/components/MobileTransactions';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import SecondaryButton from '@/components/SecondaryButton';
import reusableStyle from '@/constants/ReusableStyles'
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet from '@gorhom/bottom-sheet';
import MobileTxReceipt from '@/components/MobileTxReceipt';
import { useSharedValue } from 'react-native-reanimated';
import BottomSheetBackdrop from '@/components/BottomSheetBackdrop';
import { Transactions as Trans, MobileTransaction, Section, Transaction, OnchainSection, TransactionData } from '@/types/datatypes';
import { fetchMobileTransactions, transactionHistory } from '../Apiconfig/api';
import { selectTransactions, setOnchainTx, addMobileTransactions, selectMobileTransactions, selectFavorites } from '../state/slices';
import { useSelector, useDispatch } from 'react-redux';


const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 25 : 0;

export default function Transactions() {

    const [refreshing, setRefreshing] = useState<boolean>(false)
    const [onChainReceived, setonChainReceived] = useState<boolean>(false)
    const [activeTab, setActiveTab] = useState<'wallet' | 'mobile'>('mobile')
    const [isMobileTxLoading, setIsMobileTxLoading] = useState<boolean>(true)
    const [selectedTx, setSelectedTx] = useState<MobileTransaction | null>(null);
    const dispatch = useDispatch();
    let userTx = useSelector(selectTransactions)
    let mobileTx = useSelector(selectMobileTransactions)
    // let db_favorites = useSelector(selectFavorites)
    // console.log("<---userTx onchain in wallet-->", userTx)

    const bottomSheetTxRef = useRef<BottomSheet>(null);
    const animatedTxIndex = useSharedValue(-1);

    const fetchOnchainTx = async () => {
        try {
            console.log("Refetching onchain tx...")
            const onchainTx: TransactionData = await transactionHistory()
            // console.log("Onchain tx", onchainTx)
            if (onchainTx) {
                const flattenedTransactions: Transaction[] = Object.values(onchainTx.data).flat();
                dispatch(setOnchainTx(flattenedTransactions))
                console.log("Refetched")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleRefresh = useCallback(async () => {
        setRefreshing(true)
        await Promise.all([
            fetchOnchainTx()
        ]);
        setRefreshing(false)
    }, [])

    // useEffect(() => {
    //     fetchOnchainTx()
    // }, [])

    useEffect(() => {
        if (userTx) {
            setonChainReceived(true)
            // console.log("Onchain received from redux")
        }
    }, [userTx])

    useEffect(() => {
        if (mobileTx.length > 0) {
            setIsMobileTxLoading(false)
        }
    }, [])

    useEffect(() => {
        setTimeout(() => {
            if (mobileTx.length === 0) {
                setIsMobileTxLoading(false)
            }
        }, 1000)
    }, [])

    //Helpers to parse & group mobile transactions by date
    const parseTxDate = (s: string): Date => {
        const year = +s.slice(0, 4)
        const month = +s.slice(4, 6) - 1
        const day = +s.slice(6, 8)
        const hour = +s.slice(8, 10)
        const min = +s.slice(10, 12)
        const sec = +s.slice(12, 14)
        return new Date(year, month, day, hour, min, sec)
    }

    const makeSections = (txs: MobileTransaction[]): Section[] => {
        const sorted = [...txs].sort(
            (a, b) =>
                parseTxDate(b.transactionDate).getTime() - parseTxDate(a.transactionDate).getTime()
        );

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const isSameDay = (d1: Date, d2: Date) =>
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();

        const groups: Record<string, MobileTransaction[]> = {};

        for (const tx of sorted) {
            const d = parseTxDate(tx.transactionDate);
            const key = isSameDay(d, today)
                ? 'Today'
                : isSameDay(d, yesterday)
                    ? 'Yesterday'
                    : d.toLocaleDateString('en-KE', {
                        weekday: 'short', // Mon
                        day: 'numeric',   // 8
                        month: 'short',   // Jul
                        year: 'numeric',  // 2025
                    });

            (groups[key] ||= []).push(tx);
        }

        return Object.entries(groups).map(([title, data]) => ({ title, data }));
    };

    const refetchMobileTx = async () => {
        try {
            console.log("Refetching..")
            const pageSize: number = 500;
            const tx = await fetchMobileTransactions(pageSize)
            if (tx.data) {
                console.log("Received..")
                const fullSections = makeSections(tx.data)
                dispatch(addMobileTransactions(fullSections))
            }
        } catch (e: any) {
            Alert.alert("Oops😕", 'Failed to load transactions')

        } finally {
            setIsMobileTxLoading(false)
        }
    }

    const handleMobileTransactionsRefresh = useCallback(async () => {
        setRefreshing(true)
        await Promise.all([
            refetchMobileTx()
        ]);
        setRefreshing(false)
    }, [])

    const handleSelectTransaction = (tx: MobileTransaction) => {
        setSelectedTx(tx);
        bottomSheetTxRef.current?.expand();
    };


    return (
        <View style={styles.container}>
            <StatusBar style={'dark'} />
            <View style={[reusableStyle.paddingContainer, reusableStyle.rowJustifyBetween, { paddingVertical: 10, backgroundColor: '#f8f8f8' }]}>
                <PrimaryFontBold style={{ fontSize: 28 }}>Transactions</PrimaryFontBold>
                <SecondaryButton
                    // route="/modal"
                    textOnButton="Filter"
                    icon={<Ionicons name="filter-outline" size={15} color="black" />}
                    containerStyle={{ backgroundColor: '#f8f8f8', borderWidth: 0.8, borderColor: '#DFE4E5' }}
                    textStyle={{ fontSize: 16, color: "#074A4F" }}
                />
            </View>



            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'mobile' && styles.tabButtonActive,
                    ]}
                    onPress={() => setActiveTab('mobile')}
                >
                    <PrimaryFontMedium
                        style={[
                            styles.tabText,
                            activeTab === 'mobile' && styles.tabTextActive,
                        ]}
                    >
                        Mobile Payments
                    </PrimaryFontMedium>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'wallet' && styles.tabButtonActive,
                    ]}
                    onPress={() => setActiveTab('wallet')}
                >
                    <PrimaryFontMedium
                        style={[
                            styles.tabText,
                            activeTab === 'wallet' && styles.tabTextActive,
                        ]}
                    >
                        Wallet Transfers
                    </PrimaryFontMedium>
                </TouchableOpacity>
            </View>


            {activeTab == 'wallet' && onChainReceived ?
                <View style={{ width: '100%', flex: 1 }}>
                    <GroupedTransactions
                        transactions={userTx}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                </View>
                :
                activeTab == 'mobile' && !isMobileTxLoading ?
                    <View style={{ width: '100%', flex: 1 }}>
                        <MobileTransactions
                            sections={mobileTx}
                            refreshing={refreshing}
                            onRefresh={handleMobileTransactionsRefresh}
                            onSelectTransaction={handleSelectTransaction}
                        />


                    </View>
                    :
                    <View style={[reusableStyle.paddingContainer, { flex: 1, paddingVertical: 30, backgroundColor: '#f8f8f8' }]}>
                        <ActivityIndicator size="small" color='#00C48F' />
                    </View>}


            <BottomSheetBackdrop animatedIndex={animatedTxIndex} />
            <MobileTxReceipt
                sheetRef={bottomSheetTxRef}
                transaction={selectedTx}
                animatedIndex={animatedTxIndex}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: statusBarHeight,
        backgroundColor: '#f8f8f8'
    },
    title: {
        fontSize: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 5,
        marginBottom: 10,
        backgroundColor: '#EBEDF2',
        borderRadius: 12,
        overflow: 'hidden',
        // padding: 10
    },
    tabButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#EBEDF2',
        alignItems: 'center',
    },
    tabButtonActive: {
        backgroundColor: '#00C48F',
        borderRadius: 12,
    },
    tabText: {
        fontSize: 16.5,
        color: '#79828E',
    },
    tabTextActive: {
        color: 'white',
    }
});

