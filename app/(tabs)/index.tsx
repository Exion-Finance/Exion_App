
import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, ImageBackground, Image, Platform, StatusBar as RNStatusBar, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import reusableStyle from '@/constants/ReusableStyles'
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import userIcon from '@/assets/images/user.png'
import morning from '@/assets/icons/morning.png'
import noon from '@/assets/icons/noon.png'
import moon from '@/assets/icons/moon.png'
import { PrimaryFontText } from '@/components/PrimaryFontText';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import SecondaryButton from '@/components/SecondaryButton';
import MobileTxReceipt from '@/components/MobileTxReceipt';
import { MobileTransactions } from '@/components/MobileTransactions';
import { Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import TokenList from '@/components/TokenList';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSharedValue } from 'react-native-reanimated';
import BottomSheetBackdrop from '@/components/BottomSheetBackdrop';
import { MobileTransaction, Section } from '@/types/datatypes';
import { getBalances, fetchMobileTransactions, fetchExchangeRate } from '../Apiconfig/api';
import { useAuth } from "../context/AuthContext";
import {
  updateBalance,
  selectUserBalance,
  selectMobileTransactions,
  addMobileTransactions,
  setTokenBalance,
  selectTokenBalances,
  selectUserProfile
} from '../state/slices';
import { useDispatch, useSelector } from 'react-redux';


export type CurrencyData = {
  usd: string;
  kes: string;
  token: number;
};

export type BalanceData = {
  [key: string]: CurrencyData;
};

export interface ResponseBalance {
  balance: BalanceData
  message: string
}
type TotalAmounts = {
  usd: number;
  kes: number;
};

const dashboardBackground = require('@/assets/images/dashboardBackground.png');

const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 35 : 0;



export default function TabOneScreen() {
  // const { publicAPI, authAPI } = useAxios();
  const route = useRouter()
  const { authState } = useAuth()
  // const { api } = useAxios()
  const [tokens, setTokens] = useState<ResponseBalance>({ balance: {}, message: "" })
  const [authToken, setAuthToken] = useState<string>("");
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [mobileTransactions, setMobileTransactions] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTx, setSelectedTx] = useState<MobileTransaction | null>(null);
  const [tokensBalance, setTokensBalance] = useState<BalanceData>();
  const [sellingRate, setSellingRate] = useState<string | null>(null)

  const toggleVisibility = () => {
    setIsHidden((prev) => !prev);
  };

  const dispatch = useDispatch();
  const user_balance = useSelector(selectUserBalance)
  const mobile_transactions = useSelector(selectMobileTransactions)
  const token_balance = useSelector(selectTokenBalances)
  const user_profile = useSelector(selectUserProfile)
  // console.log("user_balance from redux...>", user_balance)

  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetTxRef = useRef<BottomSheet>(null);
  const animatedTxIndex = useSharedValue(-1);
  const animatedTokenIndex = useSharedValue(-1);

  const handleSelectTransaction = (tx: MobileTransaction) => {
    setSelectedTx(tx);
    bottomSheetTxRef.current?.expand();
  };

  //fetch user balance
  const fetchBalance = useCallback(async (): Promise<any> => {
    try {
      const response = await getBalances();
      if (response.balance) {
        setTokensBalance(response.balance)
        setTokens(response);
        dispatch(setTokenBalance(response));
        return response.balance;
      }
      else if (response.error) {
        console.log("errror in tx<<-->>", response.error)
        return;
      }
    } catch (error: any) {
      console.error("fetchBalance error:", error);
    }
  }, []);

  useEffect(() => {
    if (authToken) {
      fetchBalance();
    }
  }, [authToken]);

  // console.log("AuthToken in indexxxxxx<<<<<<<<<<<", authToken)

  useEffect(() => {
    if (tokensBalance) {
      const totalBalance = Object.values(tokensBalance).reduce<TotalAmounts>((acc, currency) => {
        acc.usd += parseFloat(currency.usd);
        acc.kes += parseFloat(currency.kes);
        return acc;
      }, { usd: 0, kes: 0 });
      dispatch(updateBalance(totalBalance))
    }
  }, [tokensBalance]);

  function sliceSectionsToFirstNTransactions(sections: Section[], limit: number = 5): Section[] {
    const result: Section[] = [];
    let count = 0;

    for (const section of sections) {
      if (count >= limit) break;

      const remaining = limit - count;
      const slicedData = section.data.slice(0, remaining);

      if (slicedData.length > 0) {
        result.push({
          title: section.title,
          data: slicedData,
        });
        count += slicedData.length;
      }
    }

    return result;
  }

  useEffect(() => {
    if (mobile_transactions.length > 0) {
      // console.log("mobile_transactions from cache--->", mobile_transactions)
      const firstFive = sliceSectionsToFirstNTransactions(mobile_transactions, 5);
      setMobileTransactions(firstFive)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token_balance) {
      // console.log("token_balance from cache--->", token_balance)
      const cachedTokens: ResponseBalance = {
        balance: token_balance,
        message: "success"
      };
      setTokens(cachedTokens);
    }
  }, []);



  useEffect(() => {
    const token = async () => {
      const token = authState?.token
      if (token) {
        setAuthToken(token)
      }
    }
    token()
  }, [authState])

  useEffect(() => {
    const exchangeRate = async () => {
      if (!isLoading) {
        const currencyCode: string = "USD"
        const rates = await fetchExchangeRate(currencyCode)
        if (rates.data.success){
          // console.log(rates.data)
          setSellingRate(rates.data.data.sellingRate)
          return;
        }
      }
    }
    exchangeRate()
  }, [isLoading])

  // console.log("<---Parsed authtoken object index---->", authToken)

  const getGreetingAndImage = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 0 && currentHour < 12) {
      return { greeting: 'Good morning', image: morning };
    } else if (currentHour >= 12 && currentHour < 18) {
      return { greeting: 'Good afternoon', image: noon };
    } else {
      return { greeting: 'Good evening', image: moon };
    }
  };

  const { greeting, image } = getGreetingAndImage();


  //Fetch Mobile Transactions
  useEffect(() => {
    const loadTx = async () => {
      if (!authToken) return
      try {
        const pageSize: number = 500;
        const tx = await fetchMobileTransactions(pageSize)

        if (tx.data) {
          // console.log("mobile txdata fetch found<<..>>")
          const fullSections = makeSections(tx.data)
          const firstFive = sliceSectionsToFirstNTransactions(fullSections, 5);
          setMobileTransactions(firstFive)
          dispatch(addMobileTransactions(fullSections))
          return;
        }
        else if (tx.error) {
          console.log("errror in tx<<-->>", tx.error)
          return;
        }
        // else console.log("tx else in refetch res", tx)/
      } catch (e: any) {
        Alert.alert("Oops😕", 'Failed to load transactions')
      } finally {
        setIsLoading(false)
      }
    }

    loadTx()
  }, [authToken])

  //Helpers to parse & group mobile transactions by date
  const parseTxDate = (s: string): Date => {
    const year = +s.slice(0, 4)
    const month = +s.slice(4, 6) - 1
    const day = +s.slice(6, 8)
    const hour = +s.slice(8, 10)
    const min = +s.slice(10, 12)
    const sec = +s.slice(12, 14)
    return new Date(year, month, day, hour, min, sec)
  }

  const makeSections = (txs: MobileTransaction[]): Section[] => {
    const sorted = [...txs].sort(
      (a, b) =>
        parseTxDate(b.transactionDate).getTime() - parseTxDate(a.transactionDate).getTime()
    );

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const groups: Record<string, MobileTransaction[]> = {};

    for (const tx of sorted) {
      const d = parseTxDate(tx.transactionDate);
      const key = isSameDay(d, today)
        ? 'Today'
        : isSameDay(d, yesterday)
          ? 'Yesterday'
          : `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

      (groups[key] ||= []).push(tx);
    }

    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  };


  const refetchMobileTx = async () => {
    try {
      const pageSize: number = 500;
      const tx = await fetchMobileTransactions(pageSize)
      if (tx.data) {
        const fullSections = makeSections(tx.data)
        dispatch(addMobileTransactions(fullSections))
        await fetchBalance()
        console.log("Refreshed")
        return;
      }
      else if (tx.error) {
        // console.log("errror in fetch tx<<-->>", tx.error)
        return;
      }

    } catch (e: any) {
      console.log("CAtch in catch boy..", e)
      Alert.alert("Oops😕", 'Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMobileTransactionsRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([
      refetchMobileTx()
    ]);
    setRefreshing(false)
  }, [])

  // console.log(data)
  // console.log(JSON.stringify(sections, null, 2));


  return (
    <View style={styles.container}>
      <ImageBackground style={styles.background} source={dashboardBackground}>
        <StatusBar style={'light'} />
        <View style={styles.dashBackground}>
          <View style={reusableStyle.paddingContainer}>

            <View style={[reusableStyle.rowJustifyBetween, { height: '30%', alignItems: 'flex-start' }]}>
              <View style={styles.flexRow}>
                <TouchableOpacity onPress={() => route.push('/profile')}>
                  <Image source={userIcon} style={styles.userIcon} />
                </TouchableOpacity>

                <View>
                  <View style={styles.flexRow}>
                    <PrimaryFontText style={{ color: '#FEFEFE', fontSize: 15 }}>{greeting}{'  '}</PrimaryFontText>
                    <Image source={image} style={{ height: 20, width: 20 }} />
                  </View>
                  <PrimaryFontBold style={{ color: '#FEFEFE', fontSize: 18 }}>{user_profile?.userName || ""}</PrimaryFontBold>
                </View>
              </View>
              <View>
                <Ionicons name="notifications" size={28} color="white" />
              </View>
            </View>

            <View style={[reusableStyle.rowJustifyBetween, { height: '32%', alignItems: 'flex-start' }]}>
              <View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <PrimaryFontMedium style={{ color: '#ffffff', fontSize: 15.5 }}>Balance (Ksh)</PrimaryFontMedium>
                  <TouchableOpacity onPress={toggleVisibility} style={{ marginLeft: 7 }}>
                    <MaterialIcons
                      name={isHidden ? "visibility" : "visibility-off"}
                      size={20}
                      color="#A5A5A5"
                    />
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'flex-start', flexDirection: 'row' }}>
                  {/* <PrimaryFontMedium style={{ color: '#ffffff', fontSize: 15, marginBottom: 5 }}>Ksh</PrimaryFontMedium> */}
                  <PrimaryFontMedium style={{ color: '#ffffff', fontSize: 35, marginBottom: 15 }}>
                    {isHidden ? "\u2022\u2022\u2022\u2022\u2022" : `${user_balance.kes.toFixed(2) || "---"}`}
                  </PrimaryFontMedium>
                </View>

              </View>
              <SecondaryButton
                textOnButton="Tokens"
                icon={<FontAwesome6 name="coins" size={17} color="#052330" />}
                containerStyle={{ backgroundColor: 'white', marginTop: 15 }}
                textStyle={{ fontSize: 16, color: "#052330" }}
                onPress={() => bottomSheetRef.current?.expand()}
              />
            </View>

            <View style={[styles.flexRow, { height: '38%', marginTop: 0 }]}>
              <SecondaryButton
                route={"/contacts" as Href<string | object>}
                textOnButton="Transfer"
                icon={<Feather name="arrow-up" size={18} color="white" />}
                containerStyle={{ backgroundColor: '#4781D9', padding: 17, paddingHorizontal: 15, paddingRight: 25 }}
                textStyle={{ fontSize: 17, color: "white" }}
              />

              <SecondaryButton
                route={"/makepayment" as Href<string | object>}
                textOnButton="Make Payment"
                icon={<Feather name="arrow-down" size={18} color="white" />}
                containerStyle={{ backgroundColor: '#00C48F', padding: 17, paddingHorizontal: 19, paddingRight: 24, marginLeft: 17 }}
                textStyle={{ fontSize: 17, color: "white" }}
              />
            </View>
          </View>
        </View>
      </ImageBackground>

      <View style={[reusableStyle.paddingContainer, reusableStyle.rowJustifyBetween, { paddingVertical: 20, backgroundColor: '#f8f8f8' }]}>
        <PrimaryFontMedium style={{ fontSize: 25 }}>Recent activity</PrimaryFontMedium>
        <TouchableOpacity onPress={() => route.push('/transactions')}>
          <PrimaryFontMedium style={{ fontSize: 18, color: '#00C48F' }}>See all</PrimaryFontMedium>
        </TouchableOpacity>
      </View>


      {!isLoading ?
        <View style={{ width: '100%', flex: 1 }}>
          <MobileTransactions
            sections={mobileTransactions}
            refreshing={refreshing}
            onRefresh={handleMobileTransactionsRefresh}
            onSelectTransaction={handleSelectTransaction}
          />
        </View>

        :
        <View style={[reusableStyle.paddingContainer, { flex: 1, paddingVertical: 30, backgroundColor: '#f8f8f8' }]}>
          <ActivityIndicator size="small" color='#00C48F' />
        </View>}

      <BottomSheetBackdrop animatedIndex={animatedTxIndex} />
      <MobileTxReceipt
        sheetRef={bottomSheetTxRef}
        transaction={selectedTx}
        animatedIndex={animatedTxIndex}
      />

      <BottomSheetBackdrop animatedIndex={animatedTokenIndex} />
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['50%']}
        enablePanDownToClose={true}
        animatedIndex={animatedTokenIndex}
        backgroundStyle={{ backgroundColor: '#fff' }}
      >
        {/* <PrimaryFontBold
            style={[reusableStyle.paddingContainer,
            { fontSize: 22, marginTop: 30, marginBottom: 15, paddingHorizontal: 23 }]}
          >
            Please choose a token
          </PrimaryFontBold> */}
        <View style={[reusableStyle.paddingContainer, styles.tokenListHeader]}>
          <PrimaryFontBold style={{ fontSize: 22 }}>
            Tokens
          </PrimaryFontBold>

          <PrimaryFontMedium style={styles.rate}>
            {sellingRate ? `$1 ≈ ${sellingRate} KSh` : "Loading.."}
          </PrimaryFontMedium>
        </View>


        <TokenList response={tokens} />
        {/* <TokenList routeProp='/fundingmethod'/> */}
      </BottomSheet>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    // backgroundColor: "#E0FFDD",
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  background: {
    height: 330,
    resizeMode: 'cover',
    width: '100%',
  },
  dashBackground: {
    height: 320,
    paddingTop: statusBarHeight
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  userIcon: {
    width: 36,
    height: 35,
    marginRight: 10
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rate: {
    backgroundColor: '#f3f5f9',
    padding: 7,
    color: '#79828E',
    borderRadius: 15,
    paddingHorizontal: 13,
    fontSize: 13
  },
  tokenListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 15
  }
});
