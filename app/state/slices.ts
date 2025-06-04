import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { TransactionData, Section, MobileTransaction, MobileTransactionData } from "@/types/datatypes";


type TotalAmounts = {
  usd: number;
  kes: number;
};

const initialState = {
  value: {
    usd: 0,
    kes: 0,
  } as TotalAmounts,
};
const initialTransactionState: TransactionData = {};
const initialMobileTransactionState: Section[] = [];

export const balanceSlice = createSlice({
  name: "userBalance",
  initialState,
  reducers: {
    //update userbalance
    updateBalance: (state, action) => {
      state.value = action.payload;
    }

  }

})
//transaction slice
const transactionSlice = createSlice({
  name: 'transactions',
  initialState: initialTransactionState,
  reducers: {
    // Example of an action that could add a transaction for a specific date
    addTransaction(state, action: PayloadAction<TransactionData>) {
      state.value = {
        ...state.value,
        ...action.payload,
      };

    },
  },
});

//mobile transaction slice
const mobileTransactionSlice = createSlice({
  name: 'mobileTransactions',
  initialState: initialMobileTransactionState,
  reducers: {
    // Example of an action that could add a transaction for a specific date
    // addMobileTransactions(state, action: PayloadAction<MobileTransactionData>) {
    //   // Merges all date→array entries into state
    //   Object.assign(state, action.payload);
    // },
    addMobileTransactions(state, action: PayloadAction<Section[]>) {
      // console.log("Received")
      // console.log("action.payload", action.payload)
      return action.payload
    },
    mergeMobileTransactions(state, action: PayloadAction<Section[]>) {
      return action.payload
    },
    clearMobileTransactions(state) {
      console.log("Deleted from redux")
      return []
    },
  },
});



export const { updateBalance } = balanceSlice.actions;
export const { addTransaction } = transactionSlice.actions;
export const { addMobileTransactions, clearMobileTransactions, mergeMobileTransactions } = mobileTransactionSlice.actions;

export const selectUserBalance = (state: { balance: { value: TotalAmounts } }) => state.balance.value;
export const selectTransactions = (state: { transactions: { value: TransactionData } }) => state.transactions.value
// export const selectMobileTransactions = (state: { mobileTransactions:  Section[] }) => state.mobileTransactions

// export const selectMobileTransactions = (state: { mobileTransactions: Section[] }) => {
//   const maybePersisted = state.mobileTransactions as Record<string, any>
//   // Extract only numeric keys (0, 1, 2, …) and convert them to an array:
//   const rawSections = Object.keys(maybePersisted)
//     .filter((k) => /^\d+$/.test(k))         // keep only numeric keys
//     .sort((a, b) => Number(a) - Number(b))   // ensure correct order
//     .map((idx) => maybePersisted[idx])

//   return rawSections as Section[]
// }

const rawMobileTx = (state: { mobileTransactions: Section[] }) => state.mobileTransactions

// export const selectMobileTransactions = createSelector(
//   rawMobileTx,
//   (slice): Section[] => {
//     // If slice is not an object (e.g. undefined), return empty array
//     if (!slice || typeof slice !== 'object') return []

//     // Extract numeric keys, sort, and map to an array of Section
//     const result: Section[] = Object.keys(slice)
//       .filter((key) => /^\d+$/.test(key))       // keep only "0", "1", …
//       .sort((a, b) => Number(a) - Number(b))     // ensure correct order
//       .map((idx) => (slice as any)[idx] as Section)

//     return result
//   }
// )

export const selectMobileTransactions = createSelector(
  [rawMobileTx],
  (slice): Section[] => {
    if (!slice || typeof slice !== 'object') return []
    return Object.keys(slice)
      .filter((key) => /^\d+$/.test(key)) // keep numeric indices only
      .sort((a, b) => Number(a) - Number(b))
      .map((idx) => (slice as any)[idx] as Section)
  }
)


const rootReducer = {
  balance: balanceSlice.reducer,
  transactions: transactionSlice.reducer,
  mobileTransactions: mobileTransactionSlice.reducer,
}
export default rootReducer;
