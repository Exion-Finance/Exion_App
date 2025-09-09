import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, StatusBar as RNStatusBar, Platform, Pressable, Alert, ToastAndroid } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
// import { BlurView } from 'expo-blur';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import { PrimaryFontText } from '@/components/PrimaryFontText';
import { SecondaryFontText } from '@/components/SecondaryFontText';
import BottomSheetBackdrop from '@/components/BottomSheetBackdrop';
import TransactionTypeIcon from '@/components/TransactionTypeIcon';
import { useSharedValue } from 'react-native-reanimated';
import LottieAnimation from '@/components/LottieAnimation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import Dropdown from '@/assets/icons/Dropdown';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { useBottomSheetDynamicSnapPoints, BottomSheetView } from '@gorhom/bottom-sheet';
import TokenListPayment, { Token } from '@/components/MakePaymentTokenList';
import reusableStyle from '@/constants/ReusableStyles'
import { getBalances } from './Apiconfig/api';
import { ResponseBalance, CurrencyData } from './(tabs)';
import { SendMoney, calculateFee, CheckTransactionStatus, BuyGoods, PayBill, getConversionRates } from './Apiconfig/api';
import { TotalFeeResponse } from '@/types/datatypes';
import { tokens as tkn } from '@/utill/tokens';
import { useFingerprintAuthentication } from '@/components/FingerPrint';
import { normalizePhoneNumber } from './hooks/normalizePhone';
import { useAuth } from "./context/AuthContext";
import Loading from "@/components/Loading";
import { selectTokenBalances, setTokenBalance, selectUserProfile } from './state/slices';
import { useDispatch, useSelector } from 'react-redux';
import PinAuth from '@/components/PinAuth';




const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 20 : 0;

type TokenType = {
  token: string;
  balance: number;
  ksh: number;
};


const CustomKeyboard = () => {
  const dispatch = useDispatch()
  const token_balance = useSelector(selectTokenBalances)
  const user_profile = useSelector(selectUserProfile)
  // console.log("user_profile from redux...>", user_profile)

  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState(false);
  const [errorDescription, setErrorDescription] = useState('');
  const route = useRouter();
  const [activeToken, setActiveToken] = useState<TokenType>({
    token: '',
    balance: 0,
    ksh: 0
  });
  const { source, name, phoneNumber, tillNumber, paybillNumber, businessNumber, recipient_address, savedUsername } = useLocalSearchParams();
  const [tokens, setTokens] = useState<ResponseBalance>({ balance: {}, message: "" })
  const [selectedTokenId, setSelectedTokenId] = useState<number>(0);
  const [jwtTokens, setJwtToken] = useState<string>("")
  const [send, setSend] = useState<boolean>(false)
  const [fees, setFees] = useState<TotalFeeResponse>()
  const [transactionCode, setTransactionCode] = useState<string>("Qwerty")
  const [transactionState, setTransactionState] = useState<string>("Initiating transaction...")
  const [transactionLoading, setTransactionLoading] = useState<boolean>()
  const [userName, seUserName] = useState<string>("")
  const [txCode, setTxCode] = useState<string>("")
  const [txChannel, setTxChannel] = useState<string>("")
  const [amount, setAmount] = useState<number>(0)
  const [showPinAuth, setShowPinAuth] = useState<boolean>(false);
  const [hasPin, setHasPin] = useState<boolean>(false);

  const initialSnapPoints = ['CONTENT_HEIGHT'];

  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

  const {
    animatedHandleHeight: animatedHandleHeight2,
    animatedSnapPoints: animatedSnapPoints2,
    animatedContentHeight: animatedContentHeight2,
    handleContentLayout: handleContentLayout2,
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

  let textOnButton
  if (source === 'contacts' || source === "sendcrypto") {
    textOnButton = "NEXT"
  } else textOnButton = "SEND"

  const handlePress = (value: string) => {
    // Update the input value when a number or dot is pressed
    setInputValue(prev => prev + value);
    setError(false)
  };

  const { handleFingerprintScan } = useFingerprintAuthentication();

  const calculateTransactionFee = async (amount: string) => {
    setSend(true)
    try {
      const tokenId = activeToken.token ? tkn[activeToken.token.toUpperCase()]?.id : undefined;
      const response = await calculateFee({
        recipient: phoneNumber ? phoneNumber as string : recipient_address as string,
        amount,
        tokenId: tokenId as number,
        chainId: 1,
      });

      if (response.status === 200) {
        setFees(response.data)
        return response.data
      }

    } catch (error: any) {
      Alert.alert("Oops😕", "Couldn't calculate transaction fees, please try again")
    }
    finally {
      setSend(false)
    }

  }

  const formatNumber = (value: string | number) => {
    const num = Number(value);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('en-KE').format(num);
  };

  const formatNumberToFixed = (value: string | number) => {
    const num = Number(value);
    if (isNaN(num)) return value;

    return new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const closePin = () => {
    setShowPinAuth(false);
    bottomSheetRef2.current?.expand();
  };

  // on mount, check if PIN exists in flag storage
  useEffect(() => {
    (async () => {
      if(user_profile){
        setHasPin(user_profile.pin);
      }
    })();
  }, []);
  // console.log("hasPin", hasPin)

  const handleSendMoney = async () => {
    console.log("Send Moneyy.....")
    setSend(true)

    try {
      bottomSheetRef2.current?.expand();

      const chainId = 1
      const tokenName = activeToken.token
      const channel = "Mpesa"
      const phonenumber = normalizePhoneNumber(phoneNumber as string)
      const res = await SendMoney(parseFloat(inputValue), tokenName, chainId, phonenumber, channel)
      // console.log('send money response is', res)

      if (res.message === "Processing" && !res.error) {
        setTransactionState("Processing...")
        const merchantRequestID: string = res.response.OriginatorConversationID;

        const checkStatus = async (retryCount = 0) => {
          const checkTx = await CheckTransactionStatus(merchantRequestID);
          // console.log("checkTx--->", checkTx);

          if (checkTx.data.txHash) {
            // console.log("Check response data", checkTx.data)
            const rawName = checkTx.data.recipientName ?? 'Mobile';
            const [first = '', second = ''] = rawName.split(' ')
            const fullName = first as string + " " + second as string
            seUserName(fullName)
            setTxCode(checkTx.data.thirdPartyTransactionCode)
            setTxChannel(checkTx.data.destinationChannel)
            setAmount(checkTx.data.transactionAmount)
            setTransactionState("Transaction sent🎉")
          } else if (!checkTx.data.success && retryCount < 2) {
            console.log("Not found, going for second retry")
            setTimeout(() => checkStatus(retryCount + 1), 2000);
          } else if (!checkTx.data.success) {
            bottomSheetRef2.current?.close();
            Alert.alert("Oops😕", `${checkTx.data.message}`)
          }
        };

        setTimeout(() => checkStatus(), 2500);
      }
      else if (res.error) {
        console.log("errror in send<<-->>", res.error)
        bottomSheetRef2.current?.close();
        setError(true)
        setErrorDescription(res.msg)
        console.log(res.msg)
        return;
      }
      else console.log("send else in res", res)

    } catch (err) {
      console.log('error is', err)
      setSend(false)
      bottomSheetRef2.current?.close();
      Alert.alert("Oops😕", `Something went wrong, please try again`)
    }
    finally {
      setSend(false)
    }
  }


  const handleBuyGoods = async () => {
    console.log("Buy goods.....")
    setSend(true)
    try {
      bottomSheetRef2.current?.expand();

      const chainId = 1
      const tokenName = activeToken.token.toUpperCase()
      const networkCode = "Mpesa"
      const res = await BuyGoods(parseFloat(inputValue), tokenName, chainId, tillNumber as string, networkCode)
      // console.log('<---Buy goods response is--->', res)
      if (res.error) {
        bottomSheetRef2.current?.close();
        setError(true)
        setErrorDescription(res.msg)
        // console.log(res.msg)
        return;
      }
      if (!res.response.status) {
        bottomSheetRef2.current?.close();
        setError(true)
        setErrorDescription(res.response.detail)
        return;
      }

      if (res.message === "Processing" && res.response.status) {
        setTransactionState("Processing...");
        const merchantRequestID: string = res.response.OriginatorConversationID;

        const checkStatus = async (retryCount = 0) => {
          const checkTx = await CheckTransactionStatus(merchantRequestID);
          // console.log("checkTx--->", checkTx);

          if (checkTx.data.txHash) {
            // console.log("Check payment success status data-->", checkTx.data);
            seUserName(checkTx.data.recipientAccountNumber)
            setTxCode(checkTx.data.thirdPartyTransactionCode);
            setTxChannel("Buy Goods");
            setAmount(checkTx.data.transactionAmount);
            setTransactionState("Transaction sent🎉");
          } else if (!checkTx.data.success && retryCount < 2) {
            console.log("Not found, going for second retry")
            setTimeout(() => checkStatus(retryCount + 1), 2000);
          } else if (!checkTx.data.success) {
            bottomSheetRef2.current?.close();
            Alert.alert("Oops😕", `${checkTx.data.message}`);
          }
        };

        setTimeout(() => checkStatus(), 3000);
      }
    }
    catch (err) {
      console.log('error is', err)
      setSend(false)
      bottomSheetRef2.current?.close();
      Alert.alert("Oops😕", `Something went wrong, please try again`)
    }
    finally {
      setSend(false)
    }
  }

  const handlePayBill = async () => {
    console.log("Paybill.....")
    setSend(true)
    try {
      bottomSheetRef2.current?.expand();

      const chainId = 1
      const tokenName = activeToken.token.toUpperCase()
      const networkCode = "Mpesa"
      const res = await PayBill(parseFloat(inputValue), tokenName, chainId, paybillNumber as string, businessNumber as string, networkCode)

      if (res.error) {
        bottomSheetRef2.current?.close();
        setError(true)
        setErrorDescription(res.msg)
        // console.log(res.msg)
        return;
      }
      if (!res.response.status) {
        bottomSheetRef2.current?.close();
        setError(true)
        setErrorDescription(res.response.detail)
        return;
      }

      if (res.message === "Processing" && res.response.status) {
        setTransactionState("Processing...");
        const merchantRequestID: string = res.response.OriginatorConversationID;

        const checkStatus = async (retryCount = 0) => {
          const checkTx = await CheckTransactionStatus(merchantRequestID);
          // console.log("checkTx--->", checkTx);

          if (checkTx.data.txHash) {
            // console.log("Check payment success status data-->", checkTx.data);
            seUserName(checkTx.data.recipientAccountNumber)
            setTxCode(checkTx.data.thirdPartyTransactionCode);
            setTxChannel("Paybill");
            setAmount(checkTx.data.transactionAmount);
            setTransactionState("Transaction sent🎉");
          } else if (!checkTx.data.success && retryCount < 2) {
            console.log("Not found, going for second retry")
            setTimeout(() => checkStatus(retryCount + 1), 2000);
          } else if (!checkTx.data.success) {
            bottomSheetRef2.current?.close();
            Alert.alert("Oops😕", `${checkTx.data.message}`);
          }
        };

        setTimeout(() => checkStatus(), 3000);
      }

    }
    catch (err) {
      console.log('error is', err)
      setSend(false)
      bottomSheetRef2.current?.close();
      Alert.alert("Oops😕", `Something went wrong, please try again`)
    }
    finally {
      setSend(false)
    }
  }



  const handleDone = () => {
    bottomSheetRef2.current?.close();
    route.replace("/(tabs)")
  }

  const handleButtonClick = async () => {
    try {
      setSend(true)
      if (inputValue === "") {
        setError(true)
        setErrorDescription('Enter a valid amount')
        return;
      }
      if (Number(inputValue) <= 0) {
        setError(true)
        setErrorDescription('Enter a valid amount')
        return;
      }

      if (activeToken.ksh - parseFloat(inputValue) < 0) {
        setError(true)
        setErrorDescription('Insufficient funds')
        return;
      }


      if (source === 'contacts' || source === "sendcrypto") {
        const conversionRate = await getConversionRates()
        const inputValueFloat = parseFloat(inputValue)
        let conversionToUsd: number
        if (activeToken.token === "CKES") {
          conversionToUsd = inputValueFloat
        }
        else {
          conversionToUsd = inputValueFloat * conversionRate.data.usd
        }
        const txFees = await calculateTransactionFee(inputValue)
        if (!txFees || !conversionRate.data.usd) {
          setError(true)
          setErrorDescription('Something went wrong, try again')
          return;
        }
        // const inputValueFloat = parseFloat(inputValue)
        const totalDeductables = txFees.totalFee.gasFeeinKes + txFees.totalFee.serviceFeeinKes
        const remainingAmount = Number(activeToken.ksh) - (inputValueFloat + totalDeductables);

        if (remainingAmount < 0) {
          setError(true)
          setErrorDescription(`Not enough balance left for Ksh ${totalDeductables.toFixed(2)} fee`)
          return;
        }

        route.push({
          pathname: '/optionalmessage',
          params: {
            name: name || recipient_address,
            phoneNumber,
            amount: inputValueFloat,
            conversionToUsd,
            token: activeToken.token,
            recipient_address,
            savedUsername,
            gasFees: txFees.totalFee.gasFeeinKes,
            serviceFees: txFees.totalFee.serviceFeeinKes
          }
        });
      }


      else if (source === 'sendmoney') {
        if (Number(inputValue) < 10) {
          setError(true)
          setErrorDescription("Minimum amount is Ksh 10")
          return;
        }
        if (Number(inputValue) > 10000) {
          setError(true)
          setErrorDescription('Maximum amount is Ksh 10,000')
          return;
        }
        const success = await handleFingerprintScan()
        if (!success) {
          bottomSheetRef2.current?.close();
          // Alert.alert("Oops😕", "Couldn't authenticate, please try again")
          return;
        }
        else if (success === "success") {
          await handleSendMoney()
        }

        else if (success === "noHardware" || success === "notEnrolled") {
          setShowPinAuth(true)
          return;
        }
      }


      else if (source === 'tillnumber') {

        if (Number(inputValue) < 10) {
          setError(true)
          setErrorDescription("Minimum amount is Ksh 10")
          return;
        }
        if (Number(inputValue) > 10000) {
          setError(true)
          setErrorDescription('Maximum amount is Ksh 10,000')
          return;
        }
        const success = await handleFingerprintScan()
        if (!success) {
          bottomSheetRef2.current?.close();
          // Alert.alert("Oops😕", "Couldn't authenticate, please try again")
          return;
        }
        else if (success === "success") {
          await handleBuyGoods()
        }
        else if (success === "noHardware" || success === "notEnrolled") {
          setShowPinAuth(true)
          return;
        }
      }


      else if (source === 'paybillaccountnumber') {

        if (Number(inputValue) < 10) {
          setError(true)
          setErrorDescription("Minimum amount is Ksh 10")
          return;
        }
        if (Number(inputValue) > 10000) {
          setError(true)
          setErrorDescription('Maximum amount is Ksh 10,000')
          return;
        }
        const success = await handleFingerprintScan()
        if (!success) {
          bottomSheetRef2.current?.close();
          // Alert.alert("Oops😕", "Couldn't authenticate, please try again")
          return;
        }
        else if (success === "success") {
          await handlePayBill()
        }
        else if (success === "noHardware" || success === "notEnrolled") {
          setShowPinAuth(true)
          return;
        }
      }


    } catch (error: any) {
      console.log("paybill error>", error)
    }
    finally {
      setSend(false)
    }
  }

  const handleBackspace = () => {
    // Remove the last character from the input value
    setInputValue(prev => prev.slice(0, -1));
    setError(false)
  };



  const bottomSheetRef1 = useRef<BottomSheet>(null);
  const bottomSheetRef2 = useRef<BottomSheet>(null);
  const animatedIndex1 = useSharedValue(-1);
  const animatedIndex2 = useSharedValue(-1);
  // console.log("bottomSheetRef2-->", bottomSheetRef2)

  const copyToClipboard = () => {
    Clipboard.setStringAsync(transactionCode as string);

    if (Platform.OS === 'android') {
      ToastAndroid.show('Text copied to clipboard!',
        ToastAndroid.SHORT);
    } else if (Platform.OS === 'ios') {
      alert('Text copied to clipboard!');
    }

  };

  const handleTokenSelect = (id: number, token: Token) => {
    setSelectedTokenId(id);
    setActiveToken({
      token: token.tokenName.toUpperCase(),
      balance: token.balance,
      ksh: parseFloat(token.ksh),
    });
    // console.log(activeToken)
    bottomSheetRef1.current?.close();
  };

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await getBalances();
        // console.log("response",response)
        if (response && response.balance) {
          setTokens(response);
          dispatch(setTokenBalance(response));

          // Set active token to the first token with a valid balance
          const tokenEntries = Object.entries(response.balance) as [string, { token: string; kes: string }][];
          const tokenWithHighestBalance = tokenEntries.reduce((prev, curr) => {
            const prevBalance = Number(prev[1].kes);
            const currBalance = Number(curr[1].kes);
            return currBalance > prevBalance ? curr : prev;
          });
          // Destructure selected token
          const [selectedKey, selectedData] = tokenWithHighestBalance;
          if (selectedTokenId === 0) {
            setActiveToken({
              token: selectedKey.toUpperCase(),
              balance: Number(selectedData.token),
              ksh: Number(selectedData.kes),
            });
          }

        } else console.log("Fetch nothing")
      }

      catch (error: any) {
        console.log("Fetch balances error", error)
      }
    };

    fetchBalances();
  }, [])


  useEffect(() => {
    if (token_balance) {
      // console.log("token_balance", token_balance)
      const cachedTokens: ResponseBalance = {
        balance: token_balance,
        message: "success"
      };

      setTokens(cachedTokens)

      // Set active token to the first token with a valid balance
      const tokenEntries = Object.entries(token_balance) as [string, CurrencyData][];
      const tokenWithHighestBalance = tokenEntries.reduce((prev, curr) => {
        const prevBalance = Number(prev[1].kes);
        const currBalance = Number(curr[1].kes);
        return currBalance > prevBalance ? curr : prev;
      });
      // Destructure selected token
      const [selectedKey, selectedData] = tokenWithHighestBalance;
      if (selectedTokenId === 0) {
        setActiveToken({
          token: selectedKey.toUpperCase(),
          balance: Number(selectedData.token),
          ksh: Number(selectedData.kes),
        });
      }
    }

    else console.log("Redux empty of tokens")
  }, [token_balance])

  useEffect(() => {
    const updateTransactionState = () => {
      if (
        transactionState === "Initiating transaction..." ||
        transactionState === "Processing..."
      ) {
        setTransactionLoading(true);
      } else if (
        transactionState === "Transaction sent🎉" ||
        transactionState === "Oops, transaction failed"
      ) {
        // bottomSheetRef2.current?.snapToIndex(1);
        setTransactionLoading(false);
      } else {
        setTransactionLoading(false);
      }
    }
    updateTransactionState()
  }, [transactionState])

  // console.log("active token-->", activeToken)
  // console.log("transactionLoading-->", transactionLoading)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar style={'light'} />
        <View style={styles.balanceContainer}>
          <Pressable style={styles.closeContainer} onPress={() => route.back()}>
            <Feather name='x' color={'grey'} size={28} />
          </Pressable>

          <TouchableOpacity style={styles.balanceView} onPress={() => { bottomSheetRef1.current?.expand(); setError(false) }}>
            <PrimaryFontMedium style={{ color: '#FFFFFF6D', fontSize: 12 }}>BALANCE</PrimaryFontMedium>
            {activeToken.token ? <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <PrimaryFontBold style={{ color: '#FFFFFF', fontSize: 18 }}>Ksh {formatNumberToFixed(Number(activeToken.ksh).toFixed(2))} </PrimaryFontBold>
              <Dropdown />
            </View> : <Loading color='#fff' description='' />}
            {activeToken.token ? <PrimaryFontMedium style={{ color: '#FFFFFF6D', fontSize: 11 }}>≈ {activeToken.balance.toFixed(2)} {activeToken.token}</PrimaryFontMedium> : null}
          </TouchableOpacity>

          <PrimaryFontMedium style={{ fontSize: 19, marginTop: 15, color: '#E9E9E9' }}>How much would you like to send?</PrimaryFontMedium>
          {error ? <PrimaryFontText style={{ marginTop: 10, marginBottom: -27, color: 'red', fontSize: 15, textAlign: 'center' }}>{errorDescription}</PrimaryFontText> : null}
        </View>

        <View style={styles.inputValue}>
          <PrimaryFontBold style={styles.inputText}>
            {inputValue ? formatNumber(inputValue) : 0}
            <PrimaryFontMedium style={{ color: '#F8F8F8', fontSize: 16 }}>
              {""}Ksh
            </PrimaryFontMedium>
          </PrimaryFontBold>
        </View>

        <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <View style={styles.row}>
            {['1', '2', '3'].map((num) => (
              <KeyButton key={num} label={num} onPress={() => handlePress(num)} />
            ))}
          </View>
          <View style={styles.row}>
            {['4', '5', '6'].map((num) => (
              <KeyButton key={num} label={num} onPress={() => handlePress(num)} />
            ))}
          </View>
          <View style={styles.row}>
            {['7', '8', '9'].map((num) => (
              <KeyButton key={num} label={num} onPress={() => handlePress(num)} />
            ))}
          </View>
          <View style={styles.row}>
            <KeyButton label="." onPress={() => handlePress('.')} />
            <KeyButton label="0" onPress={() => handlePress('0')} />
            <TouchableOpacity onPress={handleBackspace} style={styles.keyButton}>
              <Feather name="delete" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => handleButtonClick()} style={[styles.button, { backgroundColor: send ? "#36EFBD" : "#00C48F" }]} disabled={send}>
            <PrimaryFontBold style={{ color: 'white', fontSize: 19 }}>{send ? (
              <Loading color='#fff' description='Verifying' />
            ) :
              textOnButton
            }
            </PrimaryFontBold>
          </TouchableOpacity>
        </View>

        <BottomSheetBackdrop animatedIndex={animatedIndex1} />

        <BottomSheet
          ref={bottomSheetRef1}
          index={-1}
          // snapPoints={['50%']}
          snapPoints={animatedSnapPoints}
          handleHeight={animatedHandleHeight}
          contentHeight={animatedContentHeight}
          enablePanDownToClose={true}
          animatedIndex={animatedIndex1}
          backgroundStyle={{ backgroundColor: '#f8f8f8' }}
        >
          <BottomSheetView
          style={{ paddingBottom: 18 }}
          onLayout={handleContentLayout}
        >
          <PrimaryFontBold
            style={[reusableStyle.paddingContainer,
            { fontSize: 22, marginTop: 25, marginBottom: 15, paddingHorizontal: 23 }]}
          >
            Select token to send
          </PrimaryFontBold>

          <TokenListPayment response={tokens} onSelectToken={handleTokenSelect} />
          </BottomSheetView>
        </BottomSheet>



        <BottomSheetBackdrop animatedIndex={animatedIndex2} />
        <BottomSheet
          ref={bottomSheetRef2}
          index={-1}
          snapPoints={animatedSnapPoints2}
          handleHeight={animatedHandleHeight2}
          contentHeight={animatedContentHeight2}
          // enablePanDownToClose={true}
          animatedIndex={animatedIndex2}
        >
          <BottomSheetView
            style={{ paddingBottom: 18, alignItems: 'center' }}
            onLayout={handleContentLayout2}
          >
            <LottieAnimation
              loop={transactionLoading ? true : false}
              animationSource={transactionLoading ? require('@/assets/animations/loading.json') : require('@/assets/animations/done.json')}
              animationStyle={{ width: transactionLoading ? "60%" : "94%", height: transactionLoading ? 160 : 250, marginTop: transactionLoading ? 0 : -30 }}
            />

            <SecondaryFontText
              style={[reusableStyle.paddingContainer,
              { fontSize: 22, marginTop: transactionLoading ? 7 : -70, marginBottom: 15, textAlign: 'center', color: '#00563E' }]}
            >
              {transactionState}
            </SecondaryFontText>

            {transactionLoading ? null :
              <View style={[reusableStyle.rowJustifyBetween, styles.txRow]}>
                <View style={styles.flexRow}>
                  <View style={{ marginLeft: 10 }}>

                    <PrimaryFontText style={styles.name}>{txChannel == "Buy Goods" ? "TILL:" : txChannel == "Paybill" ? "PAYBILL:" : null} {userName.toUpperCase()}</PrimaryFontText>

                    <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                      <PrimaryFontMedium style={styles.confirmationCode}>{txCode} </PrimaryFontMedium>
                      <MaterialIcons name="content-copy" size={16} color="#00C48F" />
                    </TouchableOpacity>

                  </View>
                </View>

                <View style={styles.amountBlock}>
                  <PrimaryFontMedium style={styles.amount}>Ksh {amount.toFixed(2)}</PrimaryFontMedium>
                  <PrimaryFontMedium style={styles.time}>{txChannel}</PrimaryFontMedium>
                </View>
              </View>}

            {transactionLoading ? null :
              <View style={reusableStyle.paddingContainer}>
                <TouchableOpacity style={[styles.button, { width: '100%' }]} onPress={handleDone}>
                  <PrimaryFontBold style={styles.text}>Done</PrimaryFontBold>
                </TouchableOpacity>
              </View>}
          </BottomSheetView>
        </BottomSheet>
      </View>

      {showPinAuth && (
        <Modal animationType="none">
          <PinAuth
            hasPin={hasPin}
            onClose={() => setShowPinAuth(false)}
            onSuccess={() => {
              closePin()
              source === "sendmoney" ?
                handleSendMoney()
                :
                source === "tillnumber" ?
                  handleBuyGoods()
                  :
                  source === "paybillaccountnumber" ?
                    handlePayBill()
                    :
                    () => console.log("Nothing bruh")
            }}
          />
        </Modal>
      )}
    </GestureHandlerRootView>
  );
};

// Button Component for each key
const KeyButton = ({ label, onPress }: { label: string; onPress: () => void }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.keyButton}>
      <PrimaryFontBold style={styles.keyText}>{label}</PrimaryFontBold>
    </TouchableOpacity>
  );
};


const white = '#ffffff'
const background = '#052330'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 10,
    paddingTop: statusBarHeight,
    paddingBottom: 40,
    backgroundColor: background
  },
  balanceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 12,
    // borderColor: 'white',
    // borderWidth: 1
  },
  balanceView: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF3D',
    padding: 5,
    paddingHorizontal: 23,
    borderRadius: 10
  },
  closeContainer: {
    width: '100%',
    paddingHorizontal: 18,
    alignItems: 'flex-end'
  },
  inputValue: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    // borderColor: 'white',
    // borderWidth: 1
  },
  inputText: {
    fontSize: 60,
    color: white,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: 2,
    marginTop: 10,
    paddingHorizontal: 10,
    width: '90%',
    // borderWidth: 1,
    // borderColor: 'grey'
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 23,
    marginTop: 20,
    paddingHorizontal: 18,
    width: '100%',
  },
  keyButton: {
    width: '30%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: background,
    // borderColor: 'white',
    // borderWidth: 1,
  },
  keyText: {
    fontSize: 26,
    color: white
  },
  button: {
    backgroundColor: '#00C48F',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 18,
    width: '60%',
    marginTop: 5,
    marginBottom: 10,
    // opacity: 0
  },
  text: {
    color: '#fff',
    fontSize: 19,
    fontFamily: 'DMSansMedium'
  },
  name: {
    fontSize: 18,
    marginLeft: 10
  },
  channel: {
    fontSize: 15,
    color: '#79828E',
    marginTop: 7,
  },
  amountBlock: {
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  amount: {
    fontSize: 20,
    color: '#5EAF5E',
    marginTop: -15
  },
  time: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 10,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  confirmationCode: {
    fontSize: 17,
    color: '#00C48F',
    // marginTop: 7,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#EEFFEF",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 25,
    marginTop: 5,
    // marginBottom: 20
  },
  // contentContainer: {
  //   flex: 1,
  //   width: '100%',
  //   alignItems: 'center'
  // }
});

export default CustomKeyboard;
