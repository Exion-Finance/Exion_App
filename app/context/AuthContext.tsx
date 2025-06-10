import { createContext, useCallback, useState, useEffect, useContext } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { PESACHAIN_URL } from "@/constants/urls";
import { UserData, UserProfile } from "@/types/datatypes";
import { fetchUser } from '../Apiconfig/api';
import { setUserProfile } from '../state/slices';
import { useDispatch, useSelector } from 'react-redux';


interface AuthProps {
    authState?: { token: string | null; authenticated: boolean | null };
    onLogin?: (email: string, password: string) => Promise<any>;
    onLogout?: () => Promise<void>;
    onRegister?: (phoneNumber: string, password: string, email: string, username: string, otp: string) => Promise<any>;
    refreshToken?: () => Promise<string | undefined>;
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

    const dispatch = useDispatch();

    const loadToken = useCallback(async () => {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!stored) {
            console.log("No token found in local store")
            return;
        };

        const parsed = JSON.parse(stored);
        const { token, refreshToken } = parsed;
        // console.log("<---Parsed token object loadtoken---->", parsed)

        try {
            // Try using access token
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            const checkIfValid = await axios.get(`${PESACHAIN_URL}/user/profile`);
            // console.log("Check if user is authenticated res", checkIfValid.data)

            if (checkIfValid.data.success) {
                dispatch(setUserProfile(checkIfValid.data.data))
                setAuthState({ token, authenticated: true });
                console.log("Authenticated")
            }

        } catch (error: any) {
            console.log(error)
            console.log("Check isAuthenticated catch error=-->", error.status)
            if (error.status === 403 && refreshToken) {
                // Refresh token
                try {
                    await handleTokenRefresh()
                } catch (refreshError) {
                    await logout();
                    console.log("Refresh token error", refreshError)
                }
            }
            else {
                await logout();
            }
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
        // console.log("Login response", response.data)

        const { accesstoken, refreshToken } = response.data;
        const tokenObject = { token: accesstoken, refreshToken };

        await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokenObject));
        const user = await fetchUser(accesstoken)

        if (user.data.success) {
            // console.log("User profile res", user.data)
            dispatch(setUserProfile(user.data.data))
        }

        setAuthState({ token: accesstoken, authenticated: true });

        return response;
    };


    //Error fetching balances: [AxiosError: Request failed with status code 403]
    const handleTokenRefresh = async() =>{
        console.log("Refreshing token...")
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!stored) {
            console.log("No token found in local store")
            await logout();
            return;
        };
        const parsed = JSON.parse(stored);
        const { refreshToken } = parsed;

        const refreshResp = await axios.post(`${PESACHAIN_URL}/auth/refresh-token-native`, {
            refreshToken,
        });
        console.log("<-----New access token ressssssss--->", refreshResp.data)

        const newAccessToken = refreshResp.data.accesstoken;
        const updated = { token: newAccessToken, refreshToken };

        await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(updated));
        axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        const user = await fetchUser(newAccessToken)

        if (user.data.success) {
            // console.log("User profile res", user.data)
            dispatch(setUserProfile(user.data.data))
        }

        setAuthState({ token: newAccessToken, authenticated: true });
        // setAuthState(prev => ({ ...prev, token: newAccessToken }));

        return newAccessToken;
    }
// useEffect(() => {
//      handleTokenRefresh()
// }, [])




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
        refreshToken: handleTokenRefresh
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
