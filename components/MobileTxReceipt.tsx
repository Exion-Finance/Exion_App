import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Platform } from 'react-native';
import BottomSheet, { useBottomSheetDynamicSnapPoints, BottomSheetView } from '@gorhom/bottom-sheet';
import BottomSheetBackdrop from '@/components/BottomSheetBackdrop';
import { SharedValue } from 'react-native-reanimated';
import { MobileTransaction } from '@/types/datatypes';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { PrimaryFontText } from './PrimaryFontText';
import { PrimaryFontMedium } from './PrimaryFontMedium';
import { PrimaryFontBold } from './PrimaryFontBold';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface BottomSheetComponentProps {
    sheetRef: React.RefObject<BottomSheet>;
    transaction?: MobileTransaction | null;
    animatedIndex: SharedValue<number>;
}

const BottomSheetComponent: React.FC<BottomSheetComponentProps> = ({
    sheetRef,
    transaction,
    animatedIndex
}) => {
    // const snapPoints = ['80%'];
    const initialSnapPoints = ['CONTENT_HEIGHT'];

    const {
        animatedHandleHeight,
        animatedSnapPoints,
        animatedContentHeight,
        handleContentLayout,
    } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

    const handleClose = useCallback(() => {
        sheetRef.current?.close();
    }, [sheetRef]);
    // console.log(transaction)

    // Helper to format time from "YYYYMMDDHHmmss" → "h:mm a"
    const formatTime = (s: string) => {
        const year = +s.slice(0, 4);
        const month = +s.slice(4, 6) - 1;
        const day = +s.slice(6, 8);
        const hour = +s.slice(8, 10);
        const min = +s.slice(10, 12);
        const d = new Date(Date.UTC(year, month, day, hour, min));
        const h = d.getHours() % 12 || 12;
        const ampm = d.getHours() < 12 ? 'am' : 'pm';
        const m = d.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}${ampm}`;
    };


    // Format the transaction details into an HTML string
    const generateHTML = () => {
        if (!transaction) return '';

        const {
            transactionAmount,
            recipientName,
            recipientAccountNumber,
            destinationChannel,
            thirdPartyTransactionCode,
            txHash,
            transactionDate,
            type,
        } = transaction;

        const formattedDate = `${transactionDate.slice(6, 8)}/${transactionDate.slice(4, 6)
            }/${transactionDate.slice(0, 4)}`;
        const formattedTime = (() => {
            const d = new Date(Date.UTC
                (+transactionDate.slice(0, 4),
                    +transactionDate.slice(4, 6) - 1,
                    +transactionDate.slice(6, 8),
                    +transactionDate.slice(8, 10),
                    +transactionDate.slice(10, 12))
            );
            const h = d.getHours() % 12 || 12;
            const ampm = d.getHours() < 12 ? 'am' : 'pm';
            const m = d.getMinutes().toString().padStart(2, '0');
            return `${h}:${m}${ampm}`;
        })();

        // Display name logic
        let displayName = recipientName
            ? (() => {
                const parts = recipientName.trim().split(' ');
                const first = parts[0]
                    .charAt(0)
                    .toUpperCase() + parts[0].slice(1).toLowerCase();
                const last = parts[parts.length - 1]
                    .charAt(0)
                    .toUpperCase() + parts[parts.length - 1].slice(1).toLowerCase();
                return `${first} ${last}`;
            })()
            : recipientAccountNumber;

        const transactionTypeLabel =
            type === 'MPESA'
                ? 'Send Money'
                : type === 'TILL'
                    ? 'Buy Goods'
                    : type === 'PAYBILL'
                        ? 'Pay Bill'
                        : 'Mpesa';

        return `
      <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 16px; }
          .header { text-align: center; margin-bottom: 24px; }
          .header img { width: 100px; }
          .header h1 { margin: 8px 0; font-size: 24px; color: #00C48F; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; }
          .label { font-weight: bold; }
          .value { text-align: right; }
          .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Transaction Receipt</h1>
        </div>

        <div class="row">
          <span class="label">Amount:</span>
          <span class="value">Ksh ${transactionAmount.toFixed(2)}</span>
        </div>

        <div class="row">
          <span class="label">Sent To:</span>
          <span class="value">${displayName}</span>
        </div>

        ${type !== 'TILL' && type !== 'PAYBILL'
                ? `<div class="row">
                <span class="label">${type === 'MPESA' ? 'Phone Number:' : 'Short Code:'}</span>
                <span class="value">${recipientAccountNumber}</span>
              </div>`
                : ''
            }

        <div class="row">
          <span class="label">Transaction Type:</span>
          <span class="value">${transactionTypeLabel}</span>
        </div>

        <div class="row">
          <span class="label">Transaction Code:</span>
          <span class="value">${thirdPartyTransactionCode}</span>
        </div>

        <div class="row">
          <span class="label">Transaction Hash:</span>
          <span class="value">${txHash.slice(0, 5)} ...${txHash.slice(-4)}</span>
        </div>

        <div class="row">
          <span class="label">Date / Time:</span>
          <span class="value">${formattedDate} ${formattedTime}</span>
        </div>

        <div class="row">
          <span class="label">Channel:</span>
          <span class="value">${destinationChannel}</span>
        </div>

        <div class="footer">
          Generated by Exion Pay
        </div>
      </body>
      </html>
    `;
    };

    // 1) Generate PDF and share immediately
    const handleShare = useCallback(async () => {
        try {
            const html = generateHTML();
            // Create a PDF in cache directory
            const { uri } = await Print.printToFileAsync({ html });
            // Call share sheet
            await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
        } catch (e: any) {
            Alert.alert('Error', 'Could not share PDF: ' + e.message);
        }
    }, [transaction]);

    // 2) Generate PDF and save to local "Download" folder
    const handleDownload = () => {
        Alert.alert('Failed 😕', "Couldn't download, try again later")
    }


    if (!transaction) {
        return (
            <BottomSheet ref={sheetRef} index={-1} snapPoints={animatedSnapPoints} handleHeight={animatedHandleHeight} contentHeight={animatedContentHeight} >
                <BottomSheetView onLayout={handleContentLayout}>
                    <View style={styles.emptyContainer}>
                    <Text>No transaction selected</Text>
                    </View>
                </BottomSheetView>
            </BottomSheet>
        );
    }

    const formatNumber = (value: string | number) => {
        const num = Number(value);
        if (isNaN(num)) return value;
        return new Intl.NumberFormat('en-KE').format(num);
    };


    return (
        <BottomSheet
            ref={sheetRef}
            index={-1}
            // snapPoints={snapPoints}
            snapPoints={animatedSnapPoints}
            handleHeight={animatedHandleHeight}
            contentHeight={animatedContentHeight}
            animatedIndex={animatedIndex}
            enablePanDownToClose={true}
            backgroundStyle={{ backgroundColor: '#f8f8f8' }}
        >
            <BottomSheetView onLayout={handleContentLayout}>
            <View style={styles.contentContainer}>
                <View style={styles.dataTable}>
                    <View style={styles.headerContainer}>
                        <Image
                            source={require('@/assets/logos/exion-logo-dark.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />

                        <PrimaryFontText style={styles.headerTitle}>Receipt</PrimaryFontText>

                        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Feather name="x" size={24} color="#00C48F" />
                        </TouchableOpacity>
                    </View>


                    <View style={styles.status}>
                        <MaterialIcons name="check-circle" size={47} color="#00C48F" />
                        <PrimaryFontBold style={styles.amount}>Ksh {formatNumber(transaction.transactionAmount.toFixed(0))}</PrimaryFontBold>
                        <PrimaryFontMedium style={styles.complete}>COMPLETED</PrimaryFontMedium>
                    </View>

                    <View style={styles.row}>
                        <PrimaryFontMedium style={styles.label}>Sent To:</PrimaryFontMedium>
                        <PrimaryFontMedium style={styles.value}>{transaction.recipientName.toUpperCase() || transaction.recipientAccountNumber}</PrimaryFontMedium>
                    </View>

                    <View style={[styles.row, { display: transaction.type === 'TILL' || transaction.type === 'PAYBILL' ? 'none' : 'flex' }]}>
                        <PrimaryFontMedium style={styles.label}>{transaction.type === 'MPESA' ? "Phone Number:" : "Short Code:"}</PrimaryFontMedium>
                        <PrimaryFontMedium style={styles.value}>{transaction.recipientAccountNumber}</PrimaryFontMedium>
                    </View>

                    <View style={styles.row}>
                        <PrimaryFontMedium style={styles.label}>Transaction Type:</PrimaryFontMedium>
                        <PrimaryFontMedium style={styles.value}>{transaction.type === 'MPESA' ? "Send Money" :
                            transaction.type === 'TILL' ? "Buy Goods" : transaction.type === 'PAYBILL' ? "Pay Bill" : "Mpesa"}
                        </PrimaryFontMedium>
                    </View>

                    <View style={styles.row}>
                        <PrimaryFontMedium style={styles.label}>Transaction Code:</PrimaryFontMedium>
                        <PrimaryFontMedium style={styles.value}>{transaction.thirdPartyTransactionCode}</PrimaryFontMedium>
                    </View>

                    <View style={styles.row}>
                        <PrimaryFontMedium style={styles.label}>Transaction Hash:</PrimaryFontMedium>
                        <PrimaryFontMedium style={styles.value}>{transaction.txHash.slice(0, 5)} ...{transaction.txHash.slice(-4)}</PrimaryFontMedium>
                    </View>

                    <View style={styles.row}>
                        <PrimaryFontMedium style={styles.label}>Date:</PrimaryFontMedium>
                        <PrimaryFontMedium style={styles.value}>
                            {transaction.transactionDate.slice(6, 8)}/
                            {transaction.transactionDate.slice(4, 6)}/
                            {transaction.transactionDate.slice(0, 4)}  {formatTime(transaction.transactionDate)}
                        </PrimaryFontMedium>
                    </View>
                </View>


                <View style={styles.container}>
                    <TouchableOpacity style={[styles.button, styles.downloadButton]} onPress={handleDownload}>
                        <Feather name="download" size={16} color="#00C48F" style={styles.icon} />
                        <PrimaryFontBold style={[styles.buttonText, styles.downloadText]}>Download</PrimaryFontBold>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.shareButton]} onPress={handleShare}>
                        <Feather name="share" size={16} color="#FFFFFF" style={styles.icon} />
                        <PrimaryFontBold style={[styles.buttonText, styles.shareText]}>Share</PrimaryFontBold>
                    </TouchableOpacity>
                </View>
                </View>
            </BottomSheetView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    emptyContainer: {
        // height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        paddingHorizontal: 19,
        // flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 35
    },
    dataTable: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    label: {
        // fontWeight: '600',
        // marginTop: 8,
        fontSize: 15,
        color: '#86797A'
    },
    amount: {
        // fontWeight: '600',
        marginTop: 7,
        fontSize: 30,
        color: '#2F3836'
    },
    complete: {
        // fontWeight: '600',
        marginTop: 3,
        fontSize: 11,
        color: '#0BD39D'
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        width: '100%',
        // borderWidth: 1,
    },
    status: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 45,
        marginBottom: 45,
    },
    value: {
        // marginTop: 4,
        fontSize: 16.5,
    },
    closeButton: {
        marginTop: 24,
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#DDDDDD',
        borderRadius: 4,
    },
    closeText: {
        fontWeight: '600',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        backgroundColor: '#f8f8f8',
        width: '100%'
    },
    logo: {
        width: 75,
        height: 25,
    },
    headerTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 17,
    },


    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // marginBottom: 2
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
    },
    shareButton: {
        backgroundColor: '#00C48F',
        borderWidth: 1,
        borderColor: '#00C48F',
    },
    downloadButton: {
        backgroundColor: 'transparent',
        marginLeft: 8,
        borderColor: '#00C48F',
        borderWidth: 1,
        marginRight: 8,
    },
    icon: {
        marginRight: 6,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    shareText: {
        color: '#FFFFFF',
    },
    downloadText: {
        color: '#00C48F',
    },
});

export default BottomSheetComponent;
