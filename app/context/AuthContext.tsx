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

export const TOKEN_KEY = "ExionTokenKey";
const AuthContext = createContext<AuthProps>({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [authState, setAuthState] = useState<{
        token: string | null;
        authenticated: boolean | null;
    }>({
        token: null,
        authenticated: null,
    });

    // const loadToken = useCallback(async () => {
    //     const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
    //     if (storedToken) {
    //         const parsedToken = JSON.parse(storedToken);
    //         axios.defaults.headers.common["Authorization"] = `Bearer ${parsedToken.token}`;
    //         setAuthState({
    //             token: parsedToken.token,
    //             authenticated: true,
    //             // data: parsedToken.data,
    //         });
    //     }
    // }, []);

    const loadToken = useCallback(async () => {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!stored) {
            console.log("No token found in local store")
            return;
        };

        const parsed = JSON.parse(stored);
        const { accesstoken, refreshToken } = parsed;

        try {
            // Try using access token
            axios.defaults.headers.common["Authorization"] = `Bearer ${accesstoken}`;
            const checkIfValid = await axios.get(`${PESACHAIN_URL}/tx/balances`); // some endpoint that needs auth
            console.log("Check if user is authenticated res", checkIfValid.data)

            setAuthState({ token: accesstoken, authenticated: true });
            if (!checkIfValid?.data.balance && refreshToken) {
                // Refresh the token
                try {
                    const refreshResp = await axios.post(`${PESACHAIN_URL}/auth/refresh-token-native`, {
                        refreshToken,
                    });
                    console.log("New access token res", refreshResp.data)

                    const newAccessToken = refreshResp.data.accesstoken;
                    const updated = { token: newAccessToken, refreshToken };

                    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(updated));
                    axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

                    setAuthState({ token: newAccessToken, authenticated: true });
                } catch (refreshError) {
                    await logout();
                }
            } else {
                await logout();
            }
        } catch (error) {
            console.log(error)
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

        // const responseInterceptor = axios.interceptors.response.use(
        //     (response) => response,
        //     async (error) => {
        //         const originalRequest = error.config;
        //         if (error.response?.status === 401 && !originalRequest._retry) {
        //             originalRequest._retry = true;
        //             try {
        //                 const refreshResponse = await axios.post(
        //                     `${PESACHAIN_URL}/authtoken/refresh`,
        //                     {},
        //                     { withCredentials: true }
        //                 );
        //                 const newToken = refreshResponse.data.token;

        //                 await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify({ token: newToken, data: authState.data }));
        //                 axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        //                 originalRequest.headers.Authorization = `Bearer ${newToken}`;
        //                 return axios(originalRequest);
        //             } catch (refreshError) {
        //                 await logout();
        //                 return Promise.reject(refreshError);
        //             }
        //         }
        //         return Promise.reject(error);
        //     }
        // );


        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    const stored = await SecureStore.getItemAsync(TOKEN_KEY);
                    if (!stored) return Promise.reject(error);

                    const { refreshToken } = JSON.parse(stored);

                    try {
                        const res = await axios.post(`${PESACHAIN_URL}/auth/refresh-token-native`, { refreshToken });
                        const newAccessToken = res.data.accesstoken;

                        await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify({ token: newAccessToken, refreshToken }));
                        axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                        return axios(originalRequest);
                    } catch (err) {
                        await logout();
                        return Promise.reject(err);
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

    // const login = async (email: string, password: string) => {
    //     try {
    //         const result = await axios.post(`${PESACHAIN_URL}/auth/signin`, { email, pass: password });
    //         const userData: UserData = result.data;

    //         setAuthState({
    //             token: userData.token,
    //             authenticated: true,
    //             data: userData,
    //         });
    //         axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
    //         await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(userData));

    //         return result;
    //     } catch (error: any) {
    //         return { error: true, message: error.response?.data?.message || "Login failed" };
    //     }
    // };

    const login = async (email: string, password: string) => {
        const response = await axios.post(`${PESACHAIN_URL}/auth/signin`, { email, pass: password });
        console.log("Login response", response.data)

        const { accesstoken, refreshToken } = response.data;
        const tokenObject = { token: accesstoken, refreshToken };

        await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokenObject));
        // axios.defaults.headers.common["Authorization"] = `Bearer ${accesstoken}`;

        setAuthState({ token: accesstoken, authenticated: true });

        return response;
    };




    const logout = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setAuthState({
            token: null,
            authenticated: false,
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
