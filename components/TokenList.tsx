import React from 'react';
import { View, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import reusableStyle from '@/constants/ReusableStyles'
import { PrimaryFontText } from '@/components/PrimaryFontText';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import { useRouter } from 'expo-router';
import { BalanceData, ResponseBalance } from '@/app/(tabs)';

//Logo sources for each token
const logoSources: Record<string, any> = {
    USDT: require('@/assets/logos/tether.png'),
    cUSD: require('@/assets/logos/cusd.png'),
    cKes: require('@/assets/logos/ckes.png'),
    USDC: require('@/assets/logos/usdc.png'),
    cEUR: require('@/assets/logos/ceur.png'),
};

//token ids
const tokenId: Record<string, number> = {
    USDT: 0,
    cUSD: 1,
    cKes: 2,
    USDC: 3,
    cEUR: 4,
};
interface TokenListProps {
    response: ResponseBalance;
    kycVerified: boolean | undefined;
    closeSheet?: () => void;
}



export default function TokenList({ response, closeSheet, kycVerified }: TokenListProps) {
    const route = useRouter()

    // const kycVerified: boolean = true

    const handleTokenSelect = (id: number, tokenName: string) => {
        if(!kycVerified){
            route.push('/kycstartscreen')
            setTimeout(() => closeSheet!(), 700)
            return;
        }
        route.push({ pathname: "/fundingmethod", params: { id, tokenName} });
        setTimeout(() => closeSheet!(), 700)
    }
    // console.log("Tokens from props-->", response)
    const tokens = Object.keys(response.balance).map((key) => {
        const tokenKey = key as keyof typeof response.balance;
        return {
            tokenName: key,
            fullName: key == 'USDT' ? 'Tether USD' : key == 'cUSD' ? 'Celo Dollar' : key == 'cKes' ? 'Celo Kenyan Shilling' : key == 'USDC' ? 'USDC' : 'Other Name',
            balance: response.balance[tokenKey].token,
            ksh: response.balance[tokenKey].kes,
            logo: logoSources[tokenKey],
            id: tokenId[tokenKey],
        };
    });
    // console.log("Tokens -->", tokens)

    const formatNumberToFixed = (value: string | number) => {
        const num = Number(value);
        if (isNaN(num)) return value;

        return new Intl.NumberFormat('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    return (
        <FlatList
            data={tokens}
            keyExtractor={(item) => item.tokenName}
            renderItem={({ item }) => (
                <TouchableOpacity style={[styles.container, reusableStyle.paddingContainer]} onPress={() => handleTokenSelect(item.id, item.tokenName)}>
                    <Image source={item.logo} style={styles.logo} />
                    <View style={styles.textContainer}>
                        <PrimaryFontMedium style={styles.tokenName}>{item.tokenName.toUpperCase()}</PrimaryFontMedium>
                        <PrimaryFontText style={styles.fullName}>{item.fullName}</PrimaryFontText>
                    </View>
                    <View style={styles.balanceContainer}>
                        <PrimaryFontMedium style={styles.balance}>{formatNumberToFixed(parseFloat(item.ksh).toFixed(2))} Ksh</PrimaryFontMedium>
                        <PrimaryFontText style={styles.ksh}> {(item.balance).toFixed(3)} {item.tokenName.toUpperCase()}</PrimaryFontText>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18.5,
        paddingHorizontal: 23,
        // backgroundColor: "#E0FFDD",
    },
    logo: {
        width: 38,
        height: 38,
    },
    textContainer: {
        flex: 1,
        marginLeft: 13,
    },
    tokenName: {
        fontSize: 17,
    },
    fullName: {
        fontSize: 16,
        color: '#79828E',
        marginTop: 6
    },
    balanceContainer: {
        alignItems: 'flex-end',
    },
    balance: {
        fontSize: 17,
        color: '#333'
    },
    ksh: {
        fontSize: 13,
        color: '#777',
        marginTop: 5
    },
});