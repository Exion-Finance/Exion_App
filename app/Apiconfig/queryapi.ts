
import {  TransactionData } from "@/types/datatypes";
import { getBalances, transactionHistory } from "./api";

// This function can be used to fetch transactions based on a JWT token
export const fetchTransactions = async (): Promise<TransactionData> => {
    try {
      const response = await transactionHistory();
     
      return response.data || {}; 
    } catch (error) {
      
      throw error;  
    }
  };