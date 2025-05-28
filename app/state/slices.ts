import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TransactionData,Transaction } from "@/types/datatypes";


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


export const balanceSlice = createSlice({
    name:"userBalance",
   initialState,
    reducers:{
        //update userbalance
        updateBalance:(state,action)=>{
            state.value=action.payload;
            }

    }

})
//transaction slice
const transactionSlice = createSlice({
  name: 'transactions',
 initialState:initialTransactionState,
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



export const {updateBalance} = balanceSlice.actions;
//selector
export const selectUserBalance = (state: { balance: { value: TotalAmounts } }) => state.balance.value;

//transactions
export const {addTransaction} = transactionSlice.actions
export const selectTransactions = (state: { transactions: { value: TransactionData } }) => state.transactions.value
const rootReducer ={
  balance:balanceSlice.reducer,
  transactions:transactionSlice.reducer
}
export default rootReducer;
