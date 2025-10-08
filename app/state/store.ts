import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./slices";

import {
  persistStore, persistReducer } from "redux-persist";
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

const userProfile = {
  key: "user",
  storage: AsyncStorage,
  whitelist: ["value"]
}

const favoriteAddresses = {
  key: "favorites",
  storage: AsyncStorage,
  whitelist: ["value"]
}

const exchangeRate = {
  key: "exchange",
  storage: AsyncStorage,
  whitelist: ["value"]
}

const persistedBalanceReducer = persistReducer(balancePersitConfig, rootReducer.balance)
const persistedUserTransactionsReducer = persistReducer(userTransactions, rootReducer.transactions)
const persistedMobileTransactionsReducer = persistReducer(mobileTransactions, rootReducer.mobileTransactions)
const persistedTokenBalancesReducer = persistReducer(tokenBalances, rootReducer.tokenBalances)
const persistedUserProfileReducer = persistReducer(userProfile, rootReducer.user)
const persistedFavoriteAddressesReducer = persistReducer(favoriteAddresses, rootReducer.favorites)
const persistedExchangeRateReducer = persistReducer(exchangeRate, rootReducer.exchange)

const store = configureStore({
  reducer: {
    balance: persistedBalanceReducer,
    transactions: persistedUserTransactionsReducer,
    mobileTransactions: persistedMobileTransactionsReducer,
    tokenBalances: persistedTokenBalancesReducer,
    user: persistedUserProfileReducer,
    favorites: persistedFavoriteAddressesReducer,
    exchange: persistedExchangeRateReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'], // Ignore non-serializable action for persist
      },
    }),
});
const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, persistor };