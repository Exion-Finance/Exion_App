import { createContext, useCallback, useState, useEffect, useContext } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { PESACHAIN_URL } from "@/constants/urls";
import { UserData } from "@/types/datatypes";

interface AuthProps {
    authState?: { token: string | null; authenticated: boolean | null };
    onLogin?: (email: string, password: string) => Promise<any>;
    onLogout?: () => Promise<void>;
    onRegister?: (phoneNumber: string, password: string, email: string, username: string, otp: string) => Promise<any>;
}

export const TOKEN_KEY = "PesaChain"; // Secure storage key for token
const AuthContext = createContext<AuthProps>({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [authState, setAuthState] = useState<{
        token: string | null;
        authenticated: boolean | null;
        data: UserData | null;
    }>({
        token: null,
        authenticated: null,
        data: null,
    });

    const loadToken = useCallback(async () => {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) {
            const parsedToken = JSON.parse(storedToken);
            axios.defaults.headers.common["Authorization"] = `Bearer ${parsedToken.token}`;
            setAuthState({
                token: parsedToken.token,
                authenticated: true,
                data: parsedToken.data,
            });
        }
    }, []);

    useEffect(() => {
        loadToken();

        const requestInterceptor = axios.interceptors.request.use(
            async (config) => {
                const token = await SecureStore.getItemAsync(TOKEN_KEY);
                if (token) {
                    const parsedToken = JSON.parse(token);
                    config.headers.Authorization = `Bearer ${parsedToken.token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const refreshResponse = await axios.post(
                            `${PESACHAIN_URL}/authtoken/refresh`,
                            {},
                            { withCredentials: true }
                        );
                        const newToken = refreshResponse.data.token;

                        await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify({ token: newToken, data: authState.data }));
                        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        await logout();
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [loadToken]);

    const register = async (phoneNumber: string, password: string, email: string, username: string, otp: string) => {
        try {
            return await axios.post(`${PESACHAIN_URL}/auth/create`, { phoneNumber, username, email, password, otp });
        } catch (error: any) {
            return { error: true, message: error.response?.data?.message || "Registration failed" };
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const result = await axios.post(`${PESACHAIN_URL}/auth/signin`, { email, pass: password });
            const userData: UserData = result.data;

            setAuthState({
                token: userData.token,
                authenticated: true,
                data: userData,
            });
            axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
            await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(userData));

            return result;
        } catch (error: any) {
            return { error: true, message: error.response?.data?.message || "Login failed" };
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setAuthState({
            token: null,
            authenticated: false,
            data: null,
        });
        delete axios.defaults.headers.common["Authorization"];
    };

    const value: AuthProps = {
        authState,
        onRegister: register,
        onLogin: login,
        onLogout: logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
