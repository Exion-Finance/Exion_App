
import { useQuery } from '@tanstack/react-query';
import { fetchBalance, fetchTransactions,fetchTokensWithAmount } from '@/app/Apiconfig/queryapi';
import { TransactionData } from '@/types/datatypes';  // Adjust this import based on your types file

export const userTransactions = (authToken: string) => {
  return useQuery<TransactionData>({
    queryKey: ['transactions', authToken],
    queryFn: () => fetchTransactions(authToken),
    enabled: !!authToken,
  });
};


export const userBalance = (authToken:string)=>{
    return useQuery({
        queryKey: ['balance',authToken],
        queryFn: ()=>fetchBalance(authToken),
        enabled: !!authToken
        });
        

}

export const userTokensWithAmount = (authToken:string)=>{
    return useQuery({
        queryKey: ['balance',authToken],
        queryFn: ()=>fetchTokensWithAmount(authToken),
        enabled: !!authToken
        });
        

}