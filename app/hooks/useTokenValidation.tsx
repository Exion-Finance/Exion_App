import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../context/AxiosProvider';
import { useDispatch } from 'react-redux';
import { setUserProfile } from '../state/slices';
import { useAuth, TOKEN_KEY } from "../context/AuthContext";

export function useTokenValidation() {
    const dispatch = useDispatch();
    const { setAuthState } = useAuth()
    const [isValid, setIsValid] = useState<boolean | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            // console.log('useTokenValidation called');
            const stored = await SecureStore.getItemAsync(TOKEN_KEY);
            // const stored = false
            if (!stored) {
                if (mounted){
                    console.log('No token found');
                    setIsValid(false);
                }
                return;
            }
            const { token } = JSON.parse(stored);
            try {
                const res = await authAPI.get('/user/profile');
                // console.log("tokenvalid response", res.data)
                if (res.data.success) {
                    console.log(res.data.data)
                    dispatch(setUserProfile(res.data.data));
                    setAuthState!({ token, authenticated: true})
                    if (mounted) setIsValid(true);
                    return;
                }
            } catch(error) {
                console.log("Caught error in useTokenValidation", error)
            }
            if (mounted) setIsValid(false);
        })();
        return () => { mounted = false; };
    }, [dispatch]);

    return isValid;
}
