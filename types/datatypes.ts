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

export interface WalletAddress {
  publicKey: string;
}

export interface UserProfile {
  accountStatus: string;
  createdAt: string;
  customId: string;
  email: string;
  id: string;
  phoneNumber: string;
  role: string;
  userName: string;
  wallet: WalletAddress;
  pin: boolean;
  isKYCVerified: boolean;
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

export interface ResponseBalance {
  balance: TokenBalanceData;
  message: string;
}

export type CurrencyData = {
  usd: string;
  kes: string;
  token: number;
};

export type TokenBalanceData = {
  [key: string]: CurrencyData;
};


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

export interface FavoriteAddress {
  walletAddress: string;
  userName: string;
  id: string;
}

export interface Transaction {
  asset: string;
  category: string;
  date: string;
  from: string;
  fromUsername: string;
  hash: string;
  kes: number;
  to: string;
  toUsername: string;
  transactionType: "Sent" | "Received" | string;
  usd: number;
  value: number;
}


export interface OnchainSection {
  title: string;
  data: Transaction[];
}

export type TransactionData = {
  [date: string]: Transaction[];
};

type Response = {
  message: string;
  data: Transaction;
};

//v1 send

export interface SendTokenv1Type {
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
  type: string | null
  recipientName: string
  destinationChannel?: string
  transactionDate: string
  transactionAmount: number
  txHash: string
  thirdPartyTransactionCode: string
  recipientAccountNumber: string
  sasaPayTransactionCode: string
  status: string
}

export interface Section {
  title: string
  data: MobileTransaction[]
}

export type MobileTransactionData = {
  [date: string]: MobileTransaction[];
};

export interface KycPayload {
  documentType: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVER_LICENSE';
  fullName: string;
  identityNumber: string;
  selfie: string;
  id_front?: string;
  id_back?: string;
  passport?: string;
  driver_license?: string;
}