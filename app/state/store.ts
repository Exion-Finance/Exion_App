import { configureStore} from "@reduxjs/toolkit";
import rootReducer from "./slices";

import {persistStore,persistReducer } from "redux-persist";
import AsyncStorage from '@react-native-async-storage/async-storage';

const balancePersitConfig={
    key:"balance",
    storage:AsyncStorage,
    whitelist: ["value"]
}

const userTransactions={
    key:"transactions",
    storage:AsyncStorage,
    whitelist: ["value"]
}
const persistedBalanceReducer = persistReducer(balancePersitConfig,rootReducer.balance)
const persistedUserTransactionsReducer = persistReducer(userTransactions,rootReducer.transactions)

const store = configureStore({
    reducer: {
      balance: persistedBalanceReducer,
      transactions: persistedUserTransactionsReducer
      
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