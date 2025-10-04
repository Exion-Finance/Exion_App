import React, { useRef, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ImageBackground, Image, Platform, StatusBar as RNStatusBar, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import reusableStyle from '@/constants/ReusableStyles'
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
// import { useRouter } from 'expo-router';
import BottomSheet, { useBottomSheetDynamicSnapPoints, BottomSheetView } from '@gorhom/bottom-sheet';
import TokenList from '@/components/TokenList';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSharedValue } from 'react-native-reanimated';
import BottomSheetBackdrop from '@/components/BottomSheetBackdrop';
import { MobileTransaction, Section, Transaction, TransactionData } from '@/types/datatypes';
import { getBalances, fetchMobileTransactions, fetchExchangeRate, transactionHistory } from '../Apiconfig/api';
import { useAuth } from "../context/AuthContext";
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../context/AxiosProvider';
import {
  updateBalance,
  selectUserBalance,
  selectMobileTransactions,
  addMobileTransactions,
  setTokenBalance,
  selectTokenBalances,
  selectUserProfile,
  setFavorites,
  setOnchainTx,
  setExchangeRate,
  selectExchangeRate
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
  const route = useRouter()
  const { authState } = useAuth()
  const { refresh } = useLocalSearchParams();
  const [tokens, setTokens] = useState<ResponseBalance>({ balance: {}, message: "" })
  const [authToken, setAuthToken] = useState<string>("");
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [mobileTransactions, setMobileTransactions] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedTx, setSelectedTx] = useState<MobileTransaction | null>(null);
  const [tokensBalance, setTokensBalance] = useState<BalanceData>();
  // const [buyingRate, setBuyingRate] = useState<string | null>(null)

  const toggleVisibility = async () => {
    const newValue = !isHidden;
    setIsHidden(newValue);
    await SecureStore.setItemAsync('BalanceVisibility', newValue.toString());
  };


  const dispatch = useDispatch();
  const user_balance = useSelector(selectUserBalance)
  const mobile_transactions = useSelector(selectMobileTransactions)
  const token_balance = useSelector(selectTokenBalances)
  const user_profile = useSelector(selectUserProfile)
  const exchange_rate = useSelector(selectExchangeRate)
  // console.log("exchange_rate from redux...>", exchange_rate)

  // const initialSnapPoints = useMemo(() => ['25%', 'CONTENT_HEIGHT'], []);
  const initialSnapPoints = ['CONTENT_HEIGHT'];

  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

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

        //Fetch buying rate
        const currencyCode: string = "USD"
        const rates = await fetchExchangeRate(currencyCode)
        if (rates.data.success) {
          // console.log("rates-->", rates.data)
          // setBuyingRate(rates.data.data.buyingRate)
          dispatch(setExchangeRate(rates.data.data))
        }

        //Update balance after payment
        // if (refresh === 'true'){
        //   updateWalletBalance(response.balance)
        // }
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

  const updateWalletBalance = (data: BalanceData) => {
    if (data) {
      console.log("Updating wallet balance...")
      const totalBalance = Object.values(data).reduce<TotalAmounts>((acc, currency) => {
        acc.usd += parseFloat(currency.usd);
        acc.kes += parseFloat(currency.kes);
        return acc;
      }, { usd: 0, kes: 0 });
      dispatch(updateBalance(totalBalance))
    }
  }

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

  function sliceSectionsToFirstNTransactions(sections: Section[], limit: number = 3): Section[] {
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
      const firstThree = sliceSectionsToFirstNTransactions(mobile_transactions, 3);
      setMobileTransactions(firstThree)
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
    (async () => {
      const stored = await SecureStore.getItemAsync('BalanceVisibility');
      if (stored !== null) {
        setIsHidden(stored === 'true');
      } else {
        setIsHidden(false);
      }
    })();
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

  // useEffect(() => {
  //   const exchangeRate = async () => {
  //     if (!isLoading) {
  //       const currencyCode: string = "USD"
  //       const rates = await fetchExchangeRate(currencyCode)
  //       if (rates.data.success) {
  //         // console.log(rates.data)
  //         setBuyingRate(rates.data.data.buyingRate)
  //         return;
  //       }
  //     }
  //   }
  //   exchangeRate()
  // }, [isLoading])

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


  const formatNumber = (value: string | number) => {
    const num = Number(value);
    if (isNaN(num)) return value;

    return new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };



  //Fetch Mobile Transactions
  useEffect(() => {
    const loadTx = async () => {
      if (!authToken) return
      try {
        const pageSize: number = 500;
        const tx = await fetchMobileTransactions(pageSize)

        if (tx.data) {
          console.log("Mobile transactions received")
          const fullSections = makeSections(tx.data)
          const firstThree = sliceSectionsToFirstNTransactions(fullSections, 3);
          setMobileTransactions(firstThree)
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

  //Refresh transactions after payment
  useEffect(() => {
    const loadTx = async () => {
      console.log("Refresh mobile tx...")
      try {
        const pageSize: number = 500;
        const tx = await fetchMobileTransactions(pageSize)
        if (tx.data) {
          console.log("Refresh mobile transactions received")
          const fullSections = makeSections(tx.data)
          const firstThree = sliceSectionsToFirstNTransactions(fullSections, 3);
          setMobileTransactions(firstThree)
          dispatch(addMobileTransactions(fullSections))
          const balance = await fetchBalance()
          if (balance) {
            updateWalletBalance(balance)
          }
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

    if (refresh === "true") {
      loadTx();
    }
  }, [refresh]);

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
          : d.toLocaleDateString('en-KE', {
            weekday: 'short', // Mon
            day: 'numeric',   // 8
            month: 'short',   // Jul
            year: 'numeric',  // 2025
          });

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

  // Fetch saved favorites from DB on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await authAPI.get('/user/favorite-addresses');
        // console.log("Fetch favorite addresses", res.data)
        if (res.data.success && Array.isArray(res.data.data)) {
          console.log("Favorites received")
          const mapped = res.data.data.map((item: any) => ({
            walletAddress: item.address,
            userName: item.name,
            id: item.id
          }));
          dispatch(setFavorites(mapped));
        }
      } catch (e) {
        console.error('Failed to fetch favorites:', e);
      }
    })();
  }, []);

  // Fetch onchain transactions from DB on mount
  const fetchOnchainTx = async () => {
    try {
      console.log("Fetching onchain tx from index...")
      const onchainTx: TransactionData = await transactionHistory()
      if (onchainTx) {
        console.log("Onchain transactions received")
        const flattenedTransactions: Transaction[] = Object.values(onchainTx.data).flat();
        dispatch(setOnchainTx(flattenedTransactions))
        // console.log("flattenedTransactions-->", flattenedTransactions)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchOnchainTx()
  }, [])

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
                    <Image source={image} style={{ height: 19, width: 19 }} />
                  </View>
                  <PrimaryFontBold style={{ color: '#FEFEFE', fontSize: 17.5 }}>{user_profile?.userName || ""}</PrimaryFontBold>
                </View>
              </View>
              <View style={{ display: 'flex', alignItems: "center", justifyContent: 'center', flexDirection: 'row' }}>
                <TouchableOpacity style={styles.qrButton} onPress={() => route.push('/sendcrypto')}>
                  <MaterialCommunityIcons name="qrcode-scan" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.notificationButton} onPress={() => route.push('/notifications')}>
                  <Ionicons name="notifications" size={23} color="white" />
                </TouchableOpacity>

              </View>
            </View>

            <View style={[reusableStyle.rowJustifyBetween, { height: '32%', alignItems: 'flex-start' }]}>
              <View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <PrimaryFontMedium style={{ color: '#ffffff', fontSize: 15.5 }}>Balance (Ksh)</PrimaryFontMedium>
                  <TouchableOpacity onPress={toggleVisibility} style={{ marginLeft: 7 }} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
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
                    {isHidden ? "\u2022\u2022\u2022\u2022\u2022" : `${formatNumber(user_balance.kes.toFixed(2)) || "---"}`}
                  </PrimaryFontMedium>
                </View>

              </View>
              <SecondaryButton
                textOnButton="Fund"
                icon={<Feather name="plus" size={15} color="#052330" />}
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
                containerStyle={{
                  backgroundColor: '#4781D9',
                  flex: 0.8,
                  marginRight: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 17,
                }}
                textStyle={{ fontSize: 17, color: "white" }}
              />

              <SecondaryButton
                route={"/makepayment" as Href<string | object>}
                textOnButton="Make Payment"
                icon={<Feather name="arrow-down" size={18} color="white" />}
                containerStyle={{
                  backgroundColor: '#00C48F',
                  flex: 1.2,
                  marginLeft: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 17,
                }}
                textStyle={{ fontSize: 17, color: "white" }}
              />
            </View>

          </View>
        </View>
      </ImageBackground>

      <View style={[reusableStyle.paddingContainer, reusableStyle.rowJustifyBetween, { paddingVertical: 20, backgroundColor: '#f8f8f8' }]}>
        <PrimaryFontMedium style={{ fontSize: 25 }}>Recent activity</PrimaryFontMedium>
        <TouchableOpacity onPress={() => route.push('/transactions')} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
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
        // snapPoints={['50%']}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        enablePanDownToClose={true}
        animatedIndex={animatedTokenIndex}
        backgroundStyle={{ backgroundColor: '#fff' }}
      >
        <BottomSheetView
          style={{ paddingBottom: 18 }}
          onLayout={handleContentLayout}
        >
          <View style={[reusableStyle.paddingContainer, styles.tokenListHeader]}>
            <PrimaryFontBold style={{ fontSize: 22 }}>
              Select token to buy
            </PrimaryFontBold>

            <PrimaryFontMedium style={styles.rate}>
              {exchange_rate?.sellingRate ? `$1 ≈ ${exchange_rate.sellingRate} KSh` : "Loading.."}
            </PrimaryFontMedium>
          </View>


          <TokenList response={tokens} />
          {/* <TokenList routeProp='/fundingmethod'/> */}
        </BottomSheetView>
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
    height: 320,
    resizeMode: 'cover',
    width: '100%',
  },
  dashBackground: {
    height: 310,
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
    fontSize: 12
  },
  tokenListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 15
  },
  qrButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 45,
    height: 50,
    // backgroundColor: '#00C48F',
  },
  notificationButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 45,
    height: 50,
    // backgroundColor: '#00C48F',
  }
});