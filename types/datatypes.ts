// Define the Wallet type
interface Wallet {
  currency: string;
  encryptedPrivateKey: string;
  id: string;
  mpesaNumber: string;
  publicKey: string;
  userId: string;
}

// Define the UserDetails type
export interface UserDetails {
  id: string;
  email: string;
  userName: string;
  wallet?: Wallet;
}

// Define the UserData interface
export interface UserData {
  data: UserDetails;
  token: string;
}

interface Balance {
  [key: string]: string;
}

export interface BalanceData {
  balance: Balance;
}



export interface Transactions {
  id: string;
  type: string;
  hash: string;
  amount: string;
  userId: string;
  walletType: string;
  date: string;
  recipient: string;
}

// toAddress:string;
//           fromAddress: string;
//           amount:string;
//           tokenSymbol:string;
//           userid:string;
//           network:string;
//           username?:string;
//           time: Date,
//           date?:string
export interface Transaction {
  value: string;
  amount?: string;
  blockHash: string;
  blockNumber: string;
  confirmations: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  from: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  hash: string;
  input: string;
  logIndex: string;
  nonce: string;
  timeStamp: string;
  to: string;
  toAddress?: string;
  tokenDecimal: string;
  tokenName: string;
  tokenSymbol: string;
  transactionIndex: string;
  transactionType: string;
  date: string | null;
  username?: string;
  usd: string | number;
  kes: number
};

export type TransactionData = {
  [date: string]: Transaction[];
};

type Response = {
  message: string;
  data: Transaction;
};

//v1 send

export interface SendTokenv1Type {
  token: string;
  recipient?: string;
  amount: number;
  tokenId: number;
  chainId: number;
  recipientPhoneNumber?: string
}

interface TotalFee {
  amountinDollar: number;
  amountinKes: number;
  serviceFeeinDollar: number;
  serviceFeeinKes: number;
  gasFeeinDollar: number;
  gasFeeinKes: number;
  sendAmountInDollar: number;
  sendAmountInKes: number;
}

export interface TotalFeeResponse {
  totalFee: TotalFee;
}

export interface MobileTransaction {
  id: string
  recipientName: string       // e.g. "RONEX MOGAKA ONDIMU"
  destinationChannel: string  // e.g. "M-PESA"
  transactionDate: string     // "YYYYMMDDHHmmss"
  transactionAmount: number
  // …other fields…
}

export interface Section {
  title: string               // "Today" or "DD/MM/YYYY"
  data: MobileTransaction[]
}