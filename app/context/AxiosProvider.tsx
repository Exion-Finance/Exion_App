import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import * as SecureStore from 'expo-secure-store';
import { PESACHAIN_URL } from '@/constants/urls';

export const publicAPI = axios.create({
    baseURL: PESACHAIN_URL,
});

export const authAPI = axios.create({
    baseURL: PESACHAIN_URL,
});

authAPI.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const stored = await SecureStore.getItemAsync("ExionTokenKey");
        if (stored) {
            const { token } = JSON.parse(stored);
            if (token && config.headers) {
                // console.log("Config and headers then token is>>>", token)
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error),
);


const refreshAuthLogic = async (failedRequest: any) => {
    console.log("Refreshing auth..")
    const stored = await SecureStore.getItemAsync("ExionTokenKey");
    if (!stored) return Promise.reject();
    const { refreshToken } = JSON.parse(stored);
    // console.log("refreshToken after rom ls in refresh", refreshToken)
    // call refresh endpoint
    const response = await axios.post(
        `${PESACHAIN_URL}/auth/refresh-token-native`,
        { refreshToken },
    );
    // console.log("refresh-token-native response", response.data)

    const newAccessToken = response.data.accesstoken;
    // persist both tokens
    await SecureStore.setItemAsync(
        "ExionTokenKey",
        JSON.stringify({ token: newAccessToken, refreshToken }),
    );

    // patch the failed request & retry
    failedRequest.response.config.headers['Authorization'] =
        `Bearer ${newAccessToken}`;
    return Promise.resolve();
};

// install the refresh interceptor
createAuthRefreshInterceptor(authAPI, refreshAuthLogic, {
    statusCodes: [401, 403],
});