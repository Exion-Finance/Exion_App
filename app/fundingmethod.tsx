import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import NavBar from '@/components/NavBar';
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
import { PrimaryFontText } from "@/components/PrimaryFontText";
import reusableStyles from '@/constants/ReusableStyles';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import PrimaryButton from '@/components/PrimaryButton';
import { useEffect, useState } from 'react';
import * as SecureStore from "expo-secure-store"
import { TOKEN_KEY } from './context/AuthContext';
import { useLocalSearchParams} from 'expo-router';
import { selectUserProfile } from './state/slices';
import { useSelector } from 'react-redux';


export default function FundingMethod() {
    const route = useRouter()
    const params = useLocalSearchParams();
    const { id  } = params;
    const user_profile = useSelector(selectUserProfile)
    const name = "Mpesa"
    //const phoneNumber = "+254792271915"
    const [phoneNumber,setPhoneNumber] = useState<string>("")
    
    const userInitial = name.slice(0, 1)

    const handlePress = () =>{
        //route.push('/fundingamount')
        route.push({ pathname: "/fundingamount", params: { id, phoneNumber} });
    }
    useEffect(()=>{
        const token = async () => {
        //   const token = await SecureStore.getItemAsync(TOKEN_KEY);
         
          if(user_profile){
            // const parsedToken = JSON.parse(token);
            // console.log("userdetails", user_profile)
            
            setPhoneNumber(user_profile?.phoneNumber)
    
          }
    
        }
        token()
    
      },[])

    return (
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
                            <PrimaryFontText style={{ fontSize: 15, color: '#79828E', marginTop: 5 }}>{phoneNumber}</PrimaryFontText>
                        </View>
                    </View>

                    <View>
                        <PrimaryFontMedium onPress={() => alert('pressed')} style={{ textAlign: 'right', fontSize: 15.5, color: '#00C48F' }}>Use different number?</PrimaryFontMedium>
                    </View>
                </View>

                <PrimaryButton textOnButton='Continue' widthProp={reusableStyles.width100} onPress={handlePress}/>

            </View>
        </View>
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
