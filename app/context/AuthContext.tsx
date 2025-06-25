import { createContext, useCallback, useState, useEffect, useContext } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { PESACHAIN_URL } from "@/constants/urls";
import { UserData, UserProfile } from "@/types/datatypes";
import { fetchUser } from '../Apiconfig/api';
import { setUserProfile } from '../state/slices';
import { useDispatch, useSelector } from 'react-redux';
import { authAPI } from "./AxiosProvider";
// import { useAxios } from "./AxiosProvider";


interface AuthProps {
    setAuthState?: React.Dispatch<React.SetStateAction<{ token: string | null; authenticated: boolean | null; }>>
    authState?: { token: string | null; authenticated: boolean | null };
    onLogin?: (email: string, password: string) => Promise<any>;
    onLogout?: (refreshToken: string) => Promise<void>;
    onClearData?: () => Promise<void>;
    onLoadToken?: () => Promise<boolean>;
    onRegister?: (phoneNumber: string, password: string, email: string, username: string, otp: string) => Promise<any>;
    getAccessToken?: () => string | null;
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
            return false;
        };

        const parsed = JSON.parse(stored);
        const { token, refreshToken } = parsed;
        // console.log("<---Parsed token object loadtoken---->", parsed)

        try {
            // axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            const checkIfValid = await axios.get(`${PESACHAIN_URL}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // console.log("Check if user is authenticated res", checkIfValid.data)

            if (checkIfValid.data.success) {
                dispatch(setUserProfile(checkIfValid.data.data))
                setAuthState({ token, authenticated: true });
                console.log("Authenticated")
                return true;
            }

        } catch (error: any) {
            console.log(error)
            // console.log("Check isAuthenticated catch error=-->", error.status)
            if (error.status === 403 && refreshToken) {
                // Refresh token
                try {
                    console.log("Refreshing token...")
                    const stored = await SecureStore.getItemAsync(TOKEN_KEY);
                    if (!stored) {
                        console.log("No token found in local store")
                        return false;
                    };
                    const parsed = JSON.parse(stored);
                    const { refreshToken } = parsed;

                    const refreshResp = await axios.post(`${PESACHAIN_URL}/auth/refresh-token-native`, {
                        refreshToken,
                    });
                    console.log("<<New access token generated>>")

                    const newAccessToken = refreshResp.data.accesstoken;
                    const updated = { token: newAccessToken, refreshToken };

                    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(updated));
                    const user = await fetchUser(newAccessToken)

                    if (user.data.success) {
                        dispatch(setUserProfile(user.data.data))
                    }

                    setAuthState({ token: newAccessToken, authenticated: true });

                    return true;
                } catch (refreshError) {
                    // await logout();
                    console.log("Refresh token error", refreshError)
                    return false;
                }
            }
            else {
                console.log("Testing token authenticity error", error)
                return false;
            }

        }
        return false;
    }, []);


    const getAccessToken = () => {
        return authState?.token ?? null;
    };

    // useEffect(() => console.log("getAccessToken straight from authState", getAccessToken()),[authState])


    // useEffect(() => {
    //     loadToken();
    // }, [loadToken]);


    const register = async (phoneNumber: string, password: string, email: string, username: string, otp: string) => {
        try {
            return await axios.post(`${PESACHAIN_URL}/auth/create`, { phoneNumber, username, email, password, otp });
        } catch (error: any) {
            return { error: true, message: error.response?.data?.message || "Registration failed" };
        }
    };

    const login = async (email: string, password: string) => {
        const response = await axios.post(`${PESACHAIN_URL}/auth/signin`, { email, pass: password });

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

    const logout = async (refreshToken: string) => {
        // console.log("Logout called-->")
        const response = await authAPI.post(`/auth/logout`, { refreshToken });
        // console.log("Logout responseeee-->", response.data)
        if (response.data.success) {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            setAuthState({
                token: null,
                authenticated: false,
            });
            console.log("Successfully logged out")
        }
    };

    const clearData = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setAuthState({
            token: null,
            authenticated: false,
        });
        console.log("Successfully logged out")
    };

    const value: AuthProps = {
        setAuthState,
        authState,
        onRegister: register,
        onLogin: login,
        onLogout: logout,
        onClearData: clearData,
        onLoadToken: loadToken,
        getAccessToken,
    };
    // console.log("Auth value:", {
    //     getAccessToken,
    //   });

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
