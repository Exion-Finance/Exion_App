import { StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import NavBar from '@/components/NavBar';
import SendMoney from '@/assets/icons/SendMoney';
import BuyGoods from '@/assets/icons/BuyGoods';
import Paybill from '@/assets/icons/Paybill';
import MakePaymentOption from '@/components/MakePaymentOption';
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
import reusableStyles from '@/constants/ReusableStyles';


export default function MakePayments() {
  const route = useRouter()

  return (
    <View style={styles.container}>
      <StatusBar style={'dark'} />
      <NavBar title='Make payment' onBackPress={() => route.back()} />

      <ScrollView>
        <View style={{ flex: 1 }}>
          <View style={reusableStyles.paddingContainer}>
            <PrimaryFontMedium style={{ fontSize: 20, marginBottom: 10 }}>What kind of payment are you making?</PrimaryFontMedium>
          </View>

          <MakePaymentOption
            option='Send Money'
            description='Send money directly to mpesa number'
            route={'/sendmoney'}
            icon={<SendMoney />}
          />

          <MakePaymentOption
            option='Buy goods'
            description='Send money to a business till number '
            route={'/tillnumber'}
            icon={<BuyGoods />}
          />

          <MakePaymentOption
            option='Paybill'
            description='Send money to a paybill number'
            route={'/paybillbusinessnumber'}
            icon={<Paybill />}
          />

          {/* <View style={styles.couponContainer}>
            <Image source={couponBackground} style={styles.backgroundImage} />

            <View style={styles.contentContainer}>
              <SecondaryFontText style={styles.text}>Redeem Coupon 🎉🎊</SecondaryFontText>
              <View style={styles.inputRow}>
                <TextInput onChangeText={(text) => setCoupon(text)} style={styles.input} placeholder="COUPON CODE" placeholderTextColor={'#D2D2D2'} />
                <Pressable onPress={handleRedeemPress} style={styles.button}><PrimaryFontMedium style={styles.buttonText}>Redeem</PrimaryFontMedium></Pressable>
              </View>
            </View>
          </View> */}

        </View>
      </ScrollView>
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
  couponContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    marginTop: 60,
    marginBottom: 60
  },
  backgroundImage: {
    position: 'absolute',
    width: '94%',
    height: 200,
    resizeMode: 'contain',
  },
  contentContainer: {
    zIndex: 1,
    alignItems: 'center',
    width: '82%'
  },
  text: {
    fontSize: 23,
    color: '#ffffff',
    marginBottom: 20,
    marginTop: -10,
    width: '100%',
    textAlign: 'left'
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    borderColor: '#D4D4D4',
    borderWidth: 1,
    marginRight: 10,
    padding: 9,
    paddingHorizontal: 15,
    fontSize: 17,
    color: '#000',
    fontFamily: 'DMSansRegular',
    backgroundColor: '#F8F8F8',
    borderRadius: 3
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 11,
    paddingHorizontal: 17,
    paddingRight: 21,
    backgroundColor: '#00C48F',
    borderRadius: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  }
});
