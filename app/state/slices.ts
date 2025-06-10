import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { TransactionData, Section, MobileTransaction, UserProfile, ResponseBalance, TokenBalanceData  } from "@/types/datatypes";


type TotalAmounts = {
  usd: number;
  kes: number;
};

interface BalanceState {
  data: ResponseBalance | null;
}

interface UserState {
  profile: UserProfile | null;
}



const initialState = {
  value: {
    usd: 0,
    kes: 0,
  } as TotalAmounts,
};
const initialTransactionState: TransactionData = {};
const initialMobileTransactionState: Section[] = [];
const initialTokenState: BalanceState = {
  data: null,
};
const initialProfileState: UserState = {
  profile: null,
};

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
    addMobileTransactions(state, action: PayloadAction<Section[]>) {
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

//Available tokens balances slice
const tokenBalanceSlice = createSlice({
  name: 'tokenBalances',
  initialState: initialTokenState,
  reducers: {
    setTokenBalance(state, action: PayloadAction<ResponseBalance>) {
      state.data = action.payload;
    }
  },
});

//User profile slice
const userSlice = createSlice({
  name: 'user',
  initialState: initialProfileState,
  reducers: {
    setUserProfile(state, action: PayloadAction<UserProfile>) {
      // console.log("Data sent to redux", action.payload)
      state.profile = action.payload;
    },
    clearUserProfile(state) {
      state.profile = null;
    },
  },
});


export const { updateBalance } = balanceSlice.actions;
export const { addTransaction } = transactionSlice.actions;
export const { addMobileTransactions, clearMobileTransactions, mergeMobileTransactions } = mobileTransactionSlice.actions;
export const { setTokenBalance } = tokenBalanceSlice.actions;
export const { setUserProfile, clearUserProfile } = userSlice.actions;


export const selectUserBalance = (state: { balance: { value: TotalAmounts } }) => state.balance.value;
export const selectTransactions = (state: { transactions: { value: TransactionData } }) => state.transactions.value
export const selectUserProfile = (state: { user: UserState }) => state.user.profile;
export const selectTokenBalances = (state: { tokenBalances: BalanceState; }): TokenBalanceData | null => {
  return state.tokenBalances.data ? state.tokenBalances.data.balance : null;
};

const rawMobileTx = (state: { mobileTransactions: Section[] }) => state.mobileTransactions

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
  tokenBalances: tokenBalanceSlice.reducer,
  user: userSlice.reducer,
}
export default rootReducer;
