import axios, { AxiosResponse } from "axios";
import { PESACHAIN_URL, baseURL } from "@/constants/urls";
import { SendTokenv1Type } from "@/types/datatypes"
import { publicAPI, authAPI } from "../context/AxiosProvider";

export const getBalances = async () => {
    try {
        const response = await authAPI.get(`/tx/balances`);
        return response.data;
    } catch (error: any) {
        console.error("Error fetching balances:", error);
        return { error: true }
    }
};

//fetch transactions
export const Transactionss = async (token: string) => {
    try {
        const response = await axios.get(`${PESACHAIN_URL}/transaction/recent`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw error;
    }
};


//create transaction
//{"amount":"1","tokenId":2}
export const AddFund = async (token: string, tokenId: number, amount: number) => {
    try {
        const response = await axios.post(`${PESACHAIN_URL}/tx/fund`, { amount, tokenId }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (e: any) {
        return { error: true, msg: e.response.data.message }
    }
};

//send Money
export const SendMoney = async (amount: number, tokenName: string, chainId: number, phoneNumber: string, channel: string) => {
    try {
        const response = await authAPI.post(`${PESACHAIN_URL}/payments/send-money`, { amount, tokenName, chainId, phoneNumber, channel });
        return response.data;
    } catch (error: any) {
        console.log("send money error-->", error)
        return { error: true, msg: error.response.data.message }
    }
};

//Buy goods
export const BuyGoods = async (amount: number, tokenName: string, chainId: number, tillNumber: string, networkCode: string) => {
    try {
        const response = await authAPI.post(`/payments/till`, { amount, tokenName, chainId, tillNumber, networkCode });
        return response.data;
    } catch (e: any) {
        console.log("buy goods error-->", e)
        return { error: true, msg: e.response.data.message }
    }
};

//Pay Bill
export const PayBill = async (amount: number, tokenName: string, chainId: number, businessNumber: string, accountNo: string, networkCode: string) => {
    try {
        const response = await authAPI.post(`/payments/paybill`, { amount, tokenName, chainId, businessNumber, accountNo, networkCode });
        return response.data;
    } catch (e: any) {
        console.log("paybill error-->", e)
        return { error: true, msg: e.response.data.message }
    }
};

export const CheckTransactionStatus = async (merchantRequestID: string) => {
    try {
        const response = await axios.post(`${PESACHAIN_URL}/payments/transaction-details`, { merchantRequestID });
        return response.data;
    } catch (e: any) {
        return { error: true, msg: e.response.data.message }
    }
};

export const SendMoneyV1 = async ({ tokenId, amount, chainId, recipient }: SendTokenv1Type) => {
    try {
        const response = await authAPI.post(`/tx/send`, { recipient, amount, tokenId, chainId });
        return response.data;
    } catch (error: any) {
        console.log("send crypto error-->", error)
        return { error: true, msg: error.response.data.message }
    }
};

export const RedeemPromo = async (token: string, tokenId: number = 1, promoCode: string) => {
    try {
        const response = await axios.post(`${PESACHAIN_URL}/promo/apply-discount`, { promoCode, tokenId }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (e: any) {

        return { error: true, msg: e.response.data.message }
    }
};




export const transactionHistory = async ( pagination?: number) => {
    try {
        // Pass pagination as a query parameter
        const response = await authAPI.get(`/tx/history`, {
            params: { pagination },
            timeout: 30000
        });
        return response.data;
    } catch (e: any) {
        console.log(e)
        return { error: true, msg: e.response?.data?.message || "An error occurred" };
    }
};

export const checkPhoneNumber = async (identifier: string) => {

    const response = await authAPI.get(`/auth/checkidentifier`, {
        params: { identifier },
    })
    return response;
}

export const fetchUser = async (token: string) => {

    const response = await axios.get(`${PESACHAIN_URL}/user/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    return response;
}

export const fetchExchangeRate = async (currencyCode: string) => {
    const response = await authAPI.get(`/exchange-rate/${currencyCode}` )
    return response;
}

export const updateUser = async ({ email, otp, username, phoneNumber }: {
    email?: string;
    otp?: string;
    username?: string;
    phoneNumber?: string;
}) => {

    const payload = { email, otp, username, phoneNumber };

    const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => value !== undefined)
    );
    const response = await authAPI.put(`/user/profile`, cleanPayload)
    return response;
}

//send otp
export const sendOtpWhatsapp = async (phoneNumber: string): Promise<AxiosResponse> => {
    return await axios.post(`${PESACHAIN_URL}/verification/sendotp`, { identifier: phoneNumber });
};
export const sendEmailOtpForPasswordReset = async (email: string): Promise<AxiosResponse> => {
    return await axios.post(`${PESACHAIN_URL}/verification/passwordResetOTP`, { identifier: email });
};

export const sendOtpEmail = async (identifier: string): Promise<AxiosResponse> => {
    return await authAPI.post(`/verification/sendotp`, { identifier });
};

export const sendSignUpEmailOtp = async (email: string): Promise<AxiosResponse> => {
    return await axios.post(`${PESACHAIN_URL}/verification/sendEmailotp`, { email });
};

export const sendUpdateEmailOTP = async (email: string): Promise<AxiosResponse> => {
    return await authAPI.post(`/verification/sendProfileOtp`, { identifier: email });
};

export const sendUpdatePhoneNumberOTP = async (phoneNumber: string): Promise<AxiosResponse> => {
    return await authAPI.post(`/verification/sendProfileOtp`, { identifier: phoneNumber });
};


export const verifyEmailOTP = async (otp: string): Promise<AxiosResponse> => {
    return await axios.post(`${PESACHAIN_URL}/verification/verifyOtp`, { otp });
};

export const verifyEditProfileOTP = async (otp: string): Promise<AxiosResponse> => {
    return await authAPI.post(`/verification/verifyProlieOtp`, { otp });
};


export const resetPassword = async (email: string, password: string, otp: string): Promise<AxiosResponse> => {
    return await axios.post(`${PESACHAIN_URL}/auth/passwordreset`, { email, password, otp });
}

//calculate fee
//   //{
//   "recipient":"0745699966",
//   "amount":"100000",
//   "tokenId":2,
//   "chainId":1

// }
export interface FeeCalculation {
    recipient: string;
    amount: string;
    tokenId: number;
    chainId?: number;
}
export const calculateFee = async ({ recipient, amount, tokenId, chainId = 1 }: FeeCalculation): Promise<AxiosResponse> => {
    return await authAPI.post(`/tx/fee`, { recipient, amount, tokenId, chainId, });
};

export const verifyAccount = async (channel: string, account_number: string): Promise<AxiosResponse> => {
    return await authAPI.post(`/payments/verify-account`, { channel, account_number });
};

export const fetchMobileTransactions = async (pageSize: number) => {
    try {
        const response = await authAPI.get(`/payments/history`, {
            params: { pageSize }
        });
        return response.data;
    } catch (error: any) {
        console.log("fetch mobile tx-->", error)
        return { error: true, msg: error.response?.data?.message || "An error occurred" };
    }
}

export const getConversionRates = async () => {
    try {
        const response = await axios.get(`${PESACHAIN_URL}/kes-usd`);
        return response.data;
    } catch (error: any) {
        console.log(error)
        return { error: true, msg: error.response?.data?.message || "An error occurred" };
    }
}