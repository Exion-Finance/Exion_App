import { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, StatusBar as RNStatusBar, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import GroupedTransactions from '@/components/Transactions';
import { MobileTransactions } from '@/components/MobileTransactions';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import SecondaryButton from '@/components/SecondaryButton';
import reusableStyle from '@/constants/ReusableStyles'
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SecureStore from "expo-secure-store"
import { Transactions as Trans, TransactionData, MobileTransaction, Section } from '@/types/datatypes';
import { TOKEN_KEY } from '../context/AuthContext';
import { getBalances, Transactionss, transactionHistory, fetchMobileTransactions } from '../Apiconfig/api';
import { userTransactions } from '../hooks/query/userTransactions';
import { selectTransactions } from '../state/slices';
import { useSelector } from 'react-redux';


const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 25 : 0;

export default function Transactions() {
    const [transactions, setTransactions] = useState(useSelector(selectTransactions))
    const [newTransaction, setNewTransaction] = useState<TransactionData>({})
    const [authToken, setAuthToken] = useState<string>("");
    const [refreshing, setRefreshing] = useState<boolean>(false)
    // const { data, isLoading, isError, error } = userTransactions(authToken);
    const [activeTab, setActiveTab] = useState<'wallet' | 'mobile'>('mobile')
    const [isLoading, setIsLoading] = useState(false)
    // const [refreshing, setRefreshing] = useState<boolean>(false)
    const [mobileTransactions, setMobileTransactions] = useState<MobileTransaction[]>([])
    const [isMobileTxLoading, setIsMobileTxLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const [transactionsReceived, setTransactionsReceived] = useState(false)
    const user_transactions = useSelector(selectTransactions)

    useEffect(() => {
        const token = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);

            if (token) {
                const parsedToken = JSON.parse(token);
                setAuthToken(parsedToken.token)
            }
        }
        token()
    }, [authToken])

    const handleRefresh = useCallback(async () => {
        setRefreshing(true)
        setTransactions(user_transactions)
        setRefreshing(false)
    }, [])



    //Fetch Mobile Transactions
    useEffect(() => {
        let isMounted = true

        const loadTx = async () => {
            if (!authToken) return
            try {
                const tx = await fetchMobileTransactions(authToken)
                if (isMounted) {
                    setMobileTransactions(tx.data)
                }
            } catch (e: any) {
                if (isMounted) {
                    setError(e.message || 'Failed to load transactions')
                }
            } finally {
                if (isMounted) {
                    setIsMobileTxLoading(false)
                }
            }
        }

        loadTx()

        return () => {
            isMounted = false
        }
    }, [authToken])

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
        const sorted = [...txs].sort((a, b) =>
            parseTxDate(b.transactionDate).getTime() -
            parseTxDate(a.transactionDate).getTime()
        )
        const today = new Date()
        const isSameDay = (d1: Date, d2: Date) =>
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()

        const groups: Record<string, MobileTransaction[]> = {}
        for (const tx of sorted) {
            const d = parseTxDate(tx.transactionDate)
            const key = isSameDay(d, today)
                ? 'Today'
                : `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
                ; (groups[key] ||= []).push(tx)
        }

        return Object.entries(groups).map(([title, data]) => ({ title, data }))
    }

    //Memoize sections so they only recompute when mobileTransactions changes
    const sections = useMemo(() => makeSections(mobileTransactions), [mobileTransactions])
    // console.log("sections-->", sections.length)

    const refetchMobileTx = async () => {
        try {
            const tx = await fetchMobileTransactions(authToken)
            setMobileTransactions(tx.data)

        } catch (e: any) {
            setError(e.message || 'Failed to load transactions')

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

    // console.log("crypto ransactions-->", transactions)


    return (
        <View style={styles.container}>
            <StatusBar style={'dark'} />
            <View style={[reusableStyle.paddingContainer, reusableStyle.rowJustifyBetween, { paddingVertical: 20, backgroundColor: 'white' }]}>
                <PrimaryFontBold style={{ fontSize: 28 }}>Transactions</PrimaryFontBold>
                <SecondaryButton
                    // route="/modal"
                    textOnButton="Filter"
                    icon={<Ionicons name="filter-outline" size={15} color="black" />}
                    containerStyle={{ backgroundColor: 'white', borderWidth: 0.8, borderColor: '#DFE4E5' }}
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


            {activeTab == 'wallet' && transactions ?
                <View style={{ width: '100%', flex: 1 }}>
                    <GroupedTransactions
                        transactions={transactions}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                </View>
                :
                activeTab == 'mobile' && !isMobileTxLoading ?
                    <View style={{ width: '100%', flex: 1 }}>
                        <MobileTransactions
                            sections={sections}
                            refreshing={refreshing}
                            onRefresh={handleMobileTransactionsRefresh}
                        />
                    </View>
                :
            <View style={[reusableStyle.paddingContainer, { flex: 1, paddingVertical: 30, backgroundColor: 'white' }]}>
                <ActivityIndicator size="small" color='#00C48F' />
            </View>}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: statusBarHeight,
        backgroundColor: 'white'
    },
    title: {
        fontSize: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 5,
        marginBottom: 10,
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        overflow: 'hidden',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 15,
        backgroundColor: '#F3F5F9',
        alignItems: 'center',
    },
    tabButtonActive: {
        backgroundColor: '#00C48F',
    },
    tabText: {
        fontSize: 16.5,
        color: '#00C48F',
    },
    tabTextActive: {
        color: 'white',
    }
});

