import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { TransactionData, Section, FavoriteAddress, UserProfile, ResponseBalance, TokenBalanceData  } from "@/types/datatypes";


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

interface FavoritesState {
  addresses: FavoriteAddress[];
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
const initialFavoritesState: FavoritesState = {
  addresses: [],
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
    },
    clearTokenBalance(state, action: PayloadAction<ResponseBalance>) {
      console.log("Balance cleared")
      state.data = null;
    },
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

//Favorite wallet addresses slice
export const favoritesSlice = createSlice({
  name: "favorites",
  initialState: initialFavoritesState,
  reducers: {
    // Replace the entire list
    setFavorites(state, action: PayloadAction<FavoriteAddress[]>) {
      state.addresses = action.payload;
    },
    // Add one favorite
    addFavorite(state, action: PayloadAction<FavoriteAddress>) {
      // avoid duplicates
      state.addresses = state.addresses.filter(
        (f) => f.id !== action.payload.id
      );
      state.addresses.unshift(action.payload);
    },
    // Remove by id
    removeFavorite(state, action: PayloadAction<string>) {
      state.addresses = state.addresses.filter(
        (f) => f.id !== action.payload
      );
    },
  },
});


export const { updateBalance } = balanceSlice.actions;
export const { addTransaction } = transactionSlice.actions;
export const { addMobileTransactions, clearMobileTransactions, mergeMobileTransactions } = mobileTransactionSlice.actions;
export const { setTokenBalance, clearTokenBalance } = tokenBalanceSlice.actions;
export const { setUserProfile, clearUserProfile } = userSlice.actions;
export const { setFavorites, addFavorite, removeFavorite } = favoritesSlice.actions;

export const selectUserBalance = (state: { balance: { value: TotalAmounts } }) => state.balance.value;
export const selectTransactions = (state: { transactions: { value: TransactionData } }) => state.transactions.value
export const selectUserProfile = (state: { user: UserState }) => state.user.profile;
export const selectTokenBalances = (state: { tokenBalances: BalanceState; }): TokenBalanceData | null => {
  return state.tokenBalances.data ? state.tokenBalances.data.balance : null;
};
export const selectFavorites = (state: {
  favorites: FavoritesState;
}) => state.favorites.addresses;

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
  favorites: favoritesSlice.reducer,
}
export default rootReducer;
