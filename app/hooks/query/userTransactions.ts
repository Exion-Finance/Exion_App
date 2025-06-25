
import { useQuery } from '@tanstack/react-query';
import { fetchTransactions } from '@/app/Apiconfig/queryapi';
import { TransactionData } from '@/types/datatypes';  // Adjust this import based on your types file

export const userTransactions = () => {
  return useQuery<TransactionData>({
    queryKey: ['transactions'],
    queryFn: () => fetchTransactions(),
  });
};