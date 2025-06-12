import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import { PESACHAIN_URL } from "@/constants/urls";
import { TOKEN_KEY } from "../app/context/AuthContext";

export const handleTokenRefresh = async () => {
    console.log("Refreshing token...")
    const stored = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!stored) {
        console.log("No token found in local store")
        // await logout();
        return;
    };
    const parsed = JSON.parse(stored);
    const { refreshToken } = parsed;

    const refreshResp = await axios.post(`${PESACHAIN_URL}/auth/refresh-token-native`, {
        refreshToken,
    });
    console.log("New access token generated")

    const newAccessToken = refreshResp.data.accesstoken;
    const updated = { token: newAccessToken, refreshToken };

    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(updated));
    axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
    // authAPI.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    // setAuthState!({ token: newAccessToken, authenticated: true });

    return newAccessToken;
}