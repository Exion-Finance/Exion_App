import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import NavBar from '@/components/NavBar';
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
import { PrimaryFontText } from "@/components/PrimaryFontText";
import reusableStyles from '@/constants/ReusableStyles';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import PrimaryButton from '@/components/PrimaryButton';
import { useEffect, useState, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams } from 'expo-router';
import { selectUserProfile } from './state/slices';
import { useSelector } from 'react-redux';
import PhoneNumberSheet from '@/components/DifferentNumber';
import BottomSheet, { useBottomSheetDynamicSnapPoints, BottomSheetView } from '@gorhom/bottom-sheet';
import BottomSheetBackdrop from '@/components/BottomSheetBackdrop';
import { useSharedValue } from 'react-native-reanimated';


export default function FundingMethod() {
    const route = useRouter()
    const params = useLocalSearchParams();
    const { id, tokenName } = params;
    console.log("tokenName in funding", tokenName)
    const user_profile = useSelector(selectUserProfile)
    const name = "Mpesa"
    //const phoneNumber = "+254792271915"
    const [phoneNumber, setPhoneNumber] = useState<string>("")
    const [clicked, setClicked] = useState<boolean>(false)

    const bottomSheetRef = useRef<BottomSheet>(null);
    const animatedIndex = useSharedValue(-1);

    const initialSnapPoints = ['CONTENT_HEIGHT'];

    const {
        animatedHandleHeight,
        animatedSnapPoints,
        animatedContentHeight,
        handleContentLayout,
    } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

    const userInitial = name.slice(0, 1)

    const handlePress = (phoneNumber: string) => {
        console.log("phoneNumber-->", phoneNumber)
        try {
            setClicked(true)
            route.push({ pathname: "/fundingamount", params: { id, phoneNumber, tokenName } });
        } catch (error) {
            console.log(error)
        } finally {
            setTimeout(() => setClicked(false), 1500)
        }
    }

    useEffect(() => {
        const token = async () => {
            //   const token = await SecureStore.getItemAsync(TOKEN_KEY);

            if (user_profile) {
                // const parsedToken = JSON.parse(token);
                // console.log("userdetails", user_profile)

                setPhoneNumber(user_profile?.phoneNumber)

            }

        }
        token()

    }, [])

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <StatusBar style={'dark'} />
                <NavBar title={'Choose payment method'} onBackPress={() => route.back()} />

                <View style={[reusableStyles.paddingContainer, { flex: 1, justifyContent: 'space-between', paddingBottom: 24 }]}>
                    <View>
                        <View style={[styles.flexRow, reusableStyles.paddingContainer, { marginTop: 15, marginBottom: 12 }]}>
                            <View style={styles.initialContainer}>
                                <PrimaryFontBold style={{ fontSize: 23 }}>{userInitial}</PrimaryFontBold>
                            </View>

                            <View>
                                <PrimaryFontMedium style={{ fontSize: 19 }}>{name}</PrimaryFontMedium>
                                <PrimaryFontText style={{ fontSize: 15, color: '#79828E', marginTop: 5 }}>{phoneNumber || "No contact"}</PrimaryFontText>
                            </View>
                        </View>

                        <TouchableOpacity onPress={() => bottomSheetRef.current?.expand()}>
                            <PrimaryFontMedium style={{ textAlign: 'right', fontSize: 16, color: '#00C48F' }}>Use different number?</PrimaryFontMedium>
                        </TouchableOpacity>
                    </View>

                    <PrimaryButton textOnButton='Continue' widthProp={reusableStyles.width100} onPress={() => handlePress(phoneNumber)} disabled={clicked} />

                </View>



                <BottomSheetBackdrop animatedIndex={animatedIndex} />
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={animatedSnapPoints}
                    handleHeight={animatedHandleHeight}
                    contentHeight={animatedContentHeight}
                    enablePanDownToClose={true}
                    animatedIndex={animatedIndex}
                >
                    <BottomSheetView
                        style={{ paddingBottom: 18, alignItems: 'center', width: '100%' }}
                        onLayout={handleContentLayout}
                    >
                        <PhoneNumberSheet onContinue={(num) => handlePress(num)} disabled = {clicked}/>
                    </BottomSheetView>
                </BottomSheet>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'white'
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.6,
        borderColor: '#00C48F',
        paddingVertical: 15,
        borderRadius: 12,
        backgroundColor: '#F4FFF6'
    },
    initialContainer: {
        borderColor: '#D9D9D9',
        borderWidth: 1,
        marginRight: 10,
        backgroundColor: '#CDFFCA',
        height: 48,
        width: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
