import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./slices";

import {
  persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import AsyncStorage from '@react-native-async-storage/async-storage';

const balancePersitConfig = {
  key: "balance",
  storage: AsyncStorage,
  whitelist: ["value"]
}

const userTransactions = {
  key: "transactions",
  storage: AsyncStorage,
  whitelist: ["value"]
}

const mobileTransactions = {
  key: "mobileTransactions",
  storage: AsyncStorage,
  whitelist: ["value"]
}

const tokenBalances = {
  key: "tokenBalances",
  storage: AsyncStorage,
  whitelist: ["value"]
}

const persistedBalanceReducer = persistReducer(balancePersitConfig, rootReducer.balance)
const persistedUserTransactionsReducer = persistReducer(userTransactions, rootReducer.transactions)
const persistedMobileTransactionsReducer = persistReducer(mobileTransactions, rootReducer.mobileTransactions)
const persistedTokenBalancesReducer = persistReducer(tokenBalances, rootReducer.tokenBalances)

const store = configureStore({
  reducer: {
    balance: persistedBalanceReducer,
    transactions: persistedUserTransactionsReducer,
    mobileTransactions: persistedMobileTransactionsReducer,
    tokenBalances: persistedTokenBalancesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'], // Ignore non-serializable action for persist
      },
    }),
});
const persistor = persistStore(store);

export { store, persistor };