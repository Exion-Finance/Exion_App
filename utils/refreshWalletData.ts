import { Alert } from 'react-native';
import { getBalances, fetchMobileTransactions, fetchExchangeRate, transactionHistory } from '@/app/Apiconfig/api';
import { MobileTransaction, Section, Transaction, TransactionData } from '@/types/datatypes';
import { useDispatch, useSelector } from 'react-redux';
import { updateBalance, addMobileTransactions, setTokenBalance } from '@/app/state/slices';
import type { AppDispatch } from '@/app/state/store';

interface TotalAmounts {
    usd: number;
    kes: number;
}

export type CurrencyData = {
    usd: string;
    kes: string;
    token: number;
};

export type BalanceData = {
    [key: string]: CurrencyData;
};


// const dispatch = useDispatch();

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

const fetchBalance = async (dispatch: AppDispatch) => {
    try {
        const response = await getBalances();
        if (response.balance) {
            dispatch(setTokenBalance(response));
            // dispatch(setTokenBalance(response));
            return response.balance;
        }
        else if (response.error) {
            console.log("errror in tx<<-->>", response.error)
            return;
        }
    } catch (error: any) {
        console.error("fetchBalance error:", error);
    }
}

export const refreshWalletData = async (dispatch: AppDispatch) => {
    try {
        console.log('Refreshing wallet data...');

        // 1️⃣ Fetch updated transactions
        const pageSize = 500;
        const tx = await fetchMobileTransactions(pageSize);

        if (tx?.data) {
            console.log('Transactions refreshed successfully.');

            const fullSections = makeSections(tx.data);
            // const firstThree = sliceSectionsToFirstNTransactions(fullSections, 3);

            // Update Redux with new transactions
            dispatch(addMobileTransactions(fullSections));

            // 2️⃣ Fetch updated balance
            const balance: BalanceData = await fetchBalance(dispatch);
            if (balance) {
                console.log('Balance refreshed successfully.');
                const totalBalance = Object.values(balance).reduce<TotalAmounts>(
                    (acc, currency) => {
                        acc.usd += parseFloat(currency.usd);
                        acc.kes += parseFloat(currency.kes);
                        return acc;
                    },
                    { usd: 0, kes: 0 }
                );

                // Update Redux with new balance
                dispatch(updateBalance(totalBalance));
            }

            return { success: true };
        } else if (tx?.error) {
            console.log('Error fetching transactions:', tx.error);
            Alert.alert('Oops😕', 'Failed to refresh transactions');
            return { success: false };
        }
    } catch (e: any) {
        console.error('Error in refreshWalletData:', e);
        Alert.alert('Oops😕', 'Something went wrong while refreshing wallet data.');
        return { success: false };
    }
};
