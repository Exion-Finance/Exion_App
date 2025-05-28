
import {  TransactionData } from "@/types/datatypes";
import { getBalances, transactionHistory } from "./api";
import { BalanceData, ResponseBalance } from "../(tabs)";

// This function can be used to fetch transactions based on a JWT token
export const fetchTransactions = async (jwttoken: string): Promise<TransactionData> => {
    try {
      const response = await transactionHistory(jwttoken);
     
      return response.data || {}; 
    } catch (error) {
      
      throw error;  
    }
  };
  
  export const fetchBalance = async (jwttoken:string):Promise<BalanceData>=>{
    try{
        const response = await getBalances(jwttoken)
    
    
        return response.balance 

    }catch(error){
        throw error;
    }
   
    }

    //todo->change data type
    export const fetchTokensWithAmount = async (jwttoken:string)=>{
        try{
            const response = await getBalances(jwttoken)
        
        return response  

        }catch(error){
            throw error;
        }
        
        }