import axios, { AxiosResponse } from "axios";
import { PESACHAIN_URL } from "@/constants/urls";
import { SendTokenv1Type } from "@/types/datatypes";


export const getBalances = async (token: string) => {
    try {
        const response = await axios.get(`${PESACHAIN_URL}/tx/balances`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching balances:", error);
        throw error;
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
export const SendMoney = async (token: string, amount: number, tokenName: string, chainId: number, phoneNumber: string, channel: string) => {
    try {
        const response = await axios.post(`${PESACHAIN_URL}/payments/send-money`, { amount, tokenName, chainId, phoneNumber, channel }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (e: any) {
        return { error: true, msg: e.response.data.message }
    }
};

//Buy goods
export const BuyGoods = async (token: string, amount: number, tokenName: string, chainId: number, tillNumber: string, networkCode: string) => {
    try {
        const response = await axios.post(`${PESACHAIN_URL}/payments/till`, { amount, tokenName, chainId, tillNumber, networkCode }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (e: any) {
        return { error: true, msg: e.response.data.message }
    }
};

//Pay Bill
export const PayBill = async (token: string, amount: number, tokenName: string, chainId: number, businessNumber: string, accountNo: string, networkCode: string) => {
    try {
        const response = await axios.post(`${PESACHAIN_URL}/payments/paybill`, { amount, tokenName, chainId, businessNumber, accountNo, networkCode }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (e: any) {
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

export const SendMoneyV1 = async ({ token, tokenId, amount, chainId, recipient }: SendTokenv1Type) => {
    try {
        const response = await axios.post(`${PESACHAIN_URL}/tx/send`, { recipient, amount, tokenId, chainId }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (e: any) {
        return { error: true, msg: e.response.data.message }
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




export const transactionHistory = async (token: string, pagination?: number) => {
    try {
        // Pass pagination as a query parameter
        const response = await axios.get(`${PESACHAIN_URL}/tx/history`, {
            params: { pagination },  // pagination is now passed as a query parameter
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            timeout: 30000
        });
        return response.data;
    } catch (e: any) {
        console.log(e)
        return { error: true, msg: e.response?.data?.message || "An error occurred" };
    }
};

export const checkPhoneNumber = async (identifier: string) => {

    const response = await axios.get(`${PESACHAIN_URL}/auth/checkidentifier`, {
        params: { identifier },
    })
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
    return await axios.post(`${PESACHAIN_URL}/verification/sendotp`, { identifier });
};

export const verifyEmailOTP = async (otp: string): Promise<AxiosResponse> => {
    return await axios.post(`${PESACHAIN_URL}/verification/verifyOtp`, { otp });
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
    auth: string;
    recipient: string;
    amount: string;
    tokenId: number;
    chainId?: number;
}
export const calculateFee = async ({
    auth,
    recipient,
    amount,
    tokenId,
    chainId = 1,
}: FeeCalculation): Promise<AxiosResponse> => {
    return await axios.post(
        `${PESACHAIN_URL}/tx/fee`,
        {
            recipient,
            amount,
            tokenId,
            chainId,
        },
        {
            headers: {
                Authorization: `Bearer ${auth}`,
            },
        }
    );
};

export const fetchMobileTransactions = async(token: string, pageSize: number) => {
    try {
        const response = await axios.get(`${PESACHAIN_URL}/payments/history`, {
            params: { pageSize: pageSize }, 
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            timeout: 30000
        });
        return response.data;
    } catch (error: any) {
        console.log(error)
        return { error: true, msg: error.response?.data?.message || "An error occurred" };
    }
}

export const getConversionRates = async() => {
    try {
        const response = await axios.get(`${PESACHAIN_URL}/kes-usd`);
        return response.data;
    } catch (error: any) {
        console.log(error)
        return { error: true, msg: error.response?.data?.message || "An error occurred" };
    }
}