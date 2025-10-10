import axios, { AxiosResponse } from "axios";
import { PESACHAIN_URL, baseURL } from "@/constants/urls";
import { SendTokenv1Type, KycPayload } from "@/types/datatypes"
import { publicAPI, authAPI, authAPIV2 } from "../context/AxiosProvider";
import * as FileSystem from 'expo-file-system';

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




export const transactionHistory = async (pagination?: number) => {
    try {
        // Pass pagination as a query parameter
        const response = await authAPI.get(`/tx/txhistory`, {
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
    const response = await authAPI.get(`/exchange-rate/${currencyCode}`)
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
    // console.log("VErifying contact", channel, account_number)
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

export const initiateOnRamp = async (amount: string, tokenName: string, chainId: number, networkCode: string, phoneNumber: string, Currency: string) => {
    try {
        const response = await authAPIV2.post('/payments/onramp', { amount, tokenName, chainId, networkCode, phoneNumber, Currency })
        return response.data;
    } catch (error: any) {
        console.log(error)
        return { error: true, msg: error.response?.data?.message || "Onramp error occurred" };
    }
}


async function uriToBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    return await response.blob();
}

const getFileType = (uri: string) => {
    if (uri.endsWith('.png')) return 'image/png';
    if (uri.endsWith('.jpg') || uri.endsWith('.jpeg')) return 'image/jpeg';
    if (uri.endsWith('.heic')) return 'image/heic';
    return 'application/octet-stream';
};


// export async function submitKYC(payload: KycPayload) {
//     const formData = new FormData();

//     formData.append('fullName', payload.fullName);
//     formData.append('identityNumber', payload.identityNumber);
//     formData.append('documentType', payload.documentType);
//     // formData.append('selfie', {
//     //     uri: payload.selfie,
//     //     type: 'image/jpeg',
//     //     name: 'selfie.jpg',
//     // } as any);
//     formData.append('selfie', {
//         uri: payload.selfie,
//         type: getFileType(payload.selfie),
//         name: 'selfie.jpg',
//     } as any);

//     if (payload.documentType === 'gov_id') {
//         if (payload.id_front)
//             // formData.append('id_front', {
//             //     uri: payload.id_front,
//             //     type: 'image/jpeg',
//             //     name: 'id_front.jpg',
//             // } as any);
//             formData.append('id_front', {
//                 uri: payload.id_front,
//                 type: getFileType(payload.id_front),
//                 name: 'id_front.jpg',
//             } as any);
//         if (payload.id_back)
//             // formData.append('id_back', {
//             //     uri: payload.id_back,
//             //     type: 'image/jpeg',
//             //     name: 'id_back.jpg',
//             // } as any);
//             formData.append('id_back', {
//                 uri: payload.id_back,
//                 type: getFileType(payload.id_back),
//                 name: 'id_back.jpg',
//             } as any);
//     }

//     if (payload.documentType === 'passport' && payload.passport) {
//         // formData.append('passport', {
//         //     uri: payload.passport,
//         //     type: 'image/jpeg',
//         //     name: 'passport.jpg',
//         // } as any);
//         formData.append('passport', {
//             uri: payload.passport,
//             type: getFileType(payload.passport),
//             name: 'passport.jpg',
//         } as any);
//     }

//     if (payload.documentType === 'driver_license' && payload.driver_license) {
//         // formData.append('driver_license', {
//         //     uri: payload.driver_license,
//         //     type: 'image/jpeg',
//         //     name: 'driver_license.jpg',
//         // } as any);
//         formData.append('driver_license', {
//             uri: payload.driver_license,
//             type: getFileType(payload.driver_license),
//             name: 'driver_license.jpg',
//         } as any);
//     }

//     console.log('FormData fields:');
//     (formData as any)._parts?.forEach((p: any) => console.log(p[0], p[1]));

//     const response = await authAPIV2.post('/kyc/submit', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     console.log('/kyc/submit', response)

//     return response.data;
// }

// export async function submitKYC(payload: KycPayload) {
//     const formData = new FormData();
  
//     formData.append('fullName', payload.fullName.trim());
//     formData.append('identityNumber', payload.identityNumber.trim());
//     formData.append('documentType', payload.documentType);
  
//     const selfieBlob = await uriToBlob(payload.selfie);
//     formData.append('selfie', selfieBlob, 'selfie.jpg');
  
//     if (payload.documentType === 'gov_id') {
//       if (payload.id_front) {
//         const frontBlob = await uriToBlob(payload.id_front);
//         formData.append('id_front', frontBlob, 'id_front.jpg');
//       }
//       if (payload.id_back) {
//         const backBlob = await uriToBlob(payload.id_back);
//         formData.append('id_back', backBlob, 'id_back.jpg');
//       }
//     }
  
//     if (payload.documentType === 'passport' && payload.passport) {
//       const passportBlob = await uriToBlob(payload.passport);
//       formData.append('passport', passportBlob, 'passport.jpg');
//     }
  
//     if (payload.documentType === 'driver_license' && payload.driver_license) {
//       const licenseBlob = await uriToBlob(payload.driver_license);
//       formData.append('driver_license', licenseBlob, 'driver_license.jpg');
//     }
//     console.log('FormData fields:');
//     (formData as any)._parts?.forEach((p: any) => console.log(p[0], p[1]));
  
//     console.log('Submitting multipart form...');
//     const response = await authAPIV2.post('/kyc/submit', formData);
//     return response.data;
//   }

// export async function submitKYC(payload: KycPayload) {
//     const base64Selfie = await FileSystem.readAsStringAsync(payload.selfie, { encoding: FileSystem.EncodingType.Base64 });
  
//     const data: any = {
//       fullName: payload.fullName,
//       identityNumber: payload.identityNumber,
//       documentType: payload.documentType,
//       selfie: `data:image/jpeg;base64,${base64Selfie}`,
//     };
  
//     if (payload.documentType === 'gov_id') {
//       if (payload.id_front) {
//         const front = await FileSystem.readAsStringAsync(payload.id_front, { encoding: FileSystem.EncodingType.Base64 });
//         data.id_front = `data:image/jpeg;base64,${front}`;
//       }
//       if (payload.id_back) {
//         const back = await FileSystem.readAsStringAsync(payload.id_back, { encoding: FileSystem.EncodingType.Base64 });
//         data.id_back = `data:image/jpeg;base64,${back}`;
//       }
//     }
  
//     if (payload.documentType === 'passport' && payload.passport) {
//       const pass = await FileSystem.readAsStringAsync(payload.passport, { encoding: FileSystem.EncodingType.Base64 });
//       data.passport = `data:image/jpeg;base64,${pass}`;
//     }
  
//     console.log('Submitting Base64 payload...', data);
//     const response = await authAPIV2.post('/kyc/submit', data);
//     return response.data;
//   }

async function toBase64FromUri(uri: string) {
    try {
      // move to a safe readable path
      const fileName = uri.split('/').pop() || 'temp.jpg';
      const dest = `${FileSystem.documentDirectory}${fileName}`;
  
      // ensure file exists and copy it into the app’s documentDirectory
      await FileSystem.copyAsync({ from: uri, to: dest });
  
      // now safely read it as base64
      return await FileSystem.readAsStringAsync(dest, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (err) {
      console.error('Error converting image to Base64:', err);
      throw err;
    }
  }
  
  export async function submitKYC(payload: KycPayload) {
    const base64Selfie = await toBase64FromUri(payload.selfie);
  
    const data: any = {
      fullName: payload.fullName,
      identityNumber: payload.identityNumber,
      documentType: payload.documentType,
      selfie: `data:image/jpeg;base64,${base64Selfie}`,
    };
  
    if (payload.documentType === 'gov_id') {
      if (payload.id_front) {
        const front = await toBase64FromUri(payload.id_front);
        data.id_front = `data:image/jpeg;base64,${front}`;
      }
      if (payload.id_back) {
        const back = await toBase64FromUri(payload.id_back);
        data.id_back = `data:image/jpeg;base64,${back}`;
      }
    }
  
    if (payload.documentType === 'passport' && payload.passport) {
      const pass = await toBase64FromUri(payload.passport);
      data.passport = `data:image/jpeg;base64,${pass}`;
    }
  
    console.log('Submitting Base64 payload...');
    const response = await authAPIV2.post('/kyc/submit', data);
    return response.data;
  }