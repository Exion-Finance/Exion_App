import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Text, Modal } from 'react-native';
import reusableStyles from '@/constants/ReusableStyles';
import NavBar from '@/components/NavBar';
import FormErrorText from "@/components/FormErrorText";
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { useRouter } from 'expo-router';
import Loading from '@/components/Loading';
import { TransactionData } from '@/types/datatypes';
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
import Feather from '@expo/vector-icons/Feather';
import { MaterialIcons } from '@expo/vector-icons';
import { PrimaryFontText } from "@/components/PrimaryFontText";
import { StatusBar } from 'expo-status-bar';
import { selectTransactions } from './state/slices';
import { useSelector, useDispatch } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import FavoriteAddressCard from '@/components/FavoriteAddressCard';
import { authAPI } from './context/AxiosProvider';
import Toast from 'react-native-toast-message';
import LottieAnimation from '@/components/LottieAnimation';
import Favourites from '@/assets/icons/Favourites';



export default function EnterWalletAddress() {
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [error, setError] = useState<boolean>(false);
    const [errorDescription, setErrorDescription] = useState<string>('');
    const [buttonClicked, setButtonClicked] = useState<boolean>(false);
    const [isWalletFocused, setIsWalletAddressFocused] = useState<boolean>(false);
    const [clipboardAddress, setClipboardAddress] = useState<string | null>(null);
    const [dbFavorites, setDbFavorites] = useState<
        { walletAddress: string; userName: string }[]
    >([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'addUsername' | 'addAddress'>('addUsername');
    const [modalAddress, setModalAddress] = useState('');
    const [modalUsername, setModalUsername] = useState('');

    const route = useRouter()
    let userTransactions = useSelector(selectTransactions)
    // console.log("Ochain tx in wallet", userTx)

    useEffect(() => {
        (async () => {
            const clip = await Clipboard.getStringAsync();
            if (clip.length > 30 && !clip.includes(' ')) {
                setClipboardAddress(clip);
            }
        })();
    }, []);

    const handlePaste = () => {
        if (clipboardAddress) {
            setWalletAddress(clipboardAddress);
            setClipboardAddress(null);
            setError(false);
        }
    };

    const handleWalletAddressSubmit = () => {
        try {
            if (!walletAddress) {
                setError(true)
                setErrorDescription('Wallet address cannot be empty')
                return;
            }
            if (walletAddress.length < 30) {
                setError(true)
                setErrorDescription('Invalid wallet address')
                return;
            }
            setButtonClicked(true)
            console.log(walletAddress)
            route.push({
                pathname: '/keyboard',
                params: {
                    recipient_address: walletAddress,
                    source: 'sendcrypto',
                },
            });
        } catch (error) {
            setError(true)
            setErrorDescription("Something went wrong")
            setButtonClicked(false)
        } finally {
            setButtonClicked(false)
        }
    }

    // flatten all txs:
    const allTxs = useMemo(() => {
        if (!userTransactions) return [];
        return Object.values(userTransactions).flat();
    }, [userTransactions]);

    // console.log("allTxs", allTxs)

    // derive top-3 sent-to addresses
    const favorites = useMemo(() => {
        //Exion wallet address
        const excludeAddress = '0xabdee117d9236cba1477fa48ec1a2d3f1a53561b';

        // Only keep “sent” TXs and skip the excluded address
        const sent = allTxs.filter(
            (tx) =>
                tx.transactionType.toLowerCase() === 'sent' &&
                tx.to !== excludeAddress
        );

        // Count occurrences and track lastDate
        const counts: Record<string, { count: number; lastDate: Date }> = {};
        sent.forEach((tx) => {
            const addr = tx.to;
            const date = new Date(Number(tx.timeStamp) * 1000);

            if (!counts[addr]) counts[addr] = { count: 0, lastDate: date };
            counts[addr].count++;
            if (date.getTime() > counts[addr].lastDate.getTime()) {
                counts[addr].lastDate = date;
            }
        });

        // Sort by count desc, take top 3
        return Object.entries(counts)
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 2)
            .map(([address, info]) => ({
                address,
                count: info.count,
                lastDate: info.lastDate,
            }));
    }, [allTxs]);



    // Open username modal for an existing favorite
    const openUsernameModal = (address: string) => {
        setModalMode('addUsername');
        setModalAddress(address);
        // Pre-fill if DB has name
        const existing = dbFavorites.find((d) => d.walletAddress === address);
        setModalUsername(existing?.userName || '');
        setModalVisible(true);
    };

    // Open address modal to add a completely new favorite
    const openAddressModal = () => {
        setModalMode('addAddress');
        setModalAddress('');
        setModalUsername('');
        setModalVisible(true);
    };

    // Handle Done press in modal
    const handleModalDone = async () => {
        if (!modalAddress || !modalUsername) {
            setModalVisible(false);
            Toast.show({ type: 'error', text1: 'Both fields are required' });
            return;
        }
        try {
            const res = await authAPI.post('/user/favorites', {
                walletAddress: modalAddress,
                userName: modalUsername,
            });
            if (res.data.success) {
                Toast.show({ type: 'success', text1: 'Saved!' });
                // Update local dbFavorites array
                setDbFavorites((prev) => {
                    // remove any existing for this address
                    const filtered = prev.filter((d) => d.walletAddress !== modalAddress);
                    return [{ walletAddress: modalAddress, userName: modalUsername }, ...filtered];
                });
                setModalVisible(false);
            } else {
                setModalVisible(false);
                throw new Error(res.data.message);
            }
        } catch (e: any) {
            setModalVisible(false);
            Toast.show({ type: 'error', text1: e.message || 'Failed to save' });
        }
    };



    // console.log("favorites", favorites)



    // Fetch saved favorites from DB on mount
    useEffect(() => {
        (async () => {
            try {
                // const res = await authAPI.get('/user/favorites');
                // if (res.data.success && Array.isArray(res.data.data)) {
                //     setDbFavorites(res.data.data);
                // }
                const fveee = [{ walletAddress: '0xdacaa99a379ca7fba5fea41c27497d7b6d4ade3a', userName: 'George Pretium' }]
                setDbFavorites(fveee);
            } catch (e) {
                console.error('Failed to fetch favorites:', e);
            }
        })();
    }, []);

    //Merge computed+DB into displayFavorites
    const displayFavorites = useMemo(() => {
        if (favorites.length > 0) {
            // Map computed favorites, overriding with DB info if present
            return favorites.map((fav) => {
                const db = dbFavorites.find((d) => d.walletAddress === fav.address);
                return {
                    address: fav.address,
                    lastDate: fav.lastDate,
                    userName: db?.userName,
                };
            });
        } else if (dbFavorites.length > 0) {
            // No computed ones, but DB has entries: show up to 3
            return dbFavorites.slice(0, 3).map((d) => ({
                address: d.walletAddress,
                lastDate: new Date(),       // no tx date → show “Today”
                userName: d.userName,
            }));
        }
        // neither: empty array
        return [];
    }, [favorites, dbFavorites]);

    // console.log("walletAddress-->", walletAddress)

    return (
        <View style={styles.container}>
            <StatusBar style={'dark'} />
            <NavBar title='Wallet Address' onBackPress={() => route.back()} />
            <View style={[reusableStyles.paddingContainer, styles.flexContainer]}>
                <View>
                    <PrimaryFontMedium style={styles.label}>Enter the wallet address</PrimaryFontMedium>
                    <TextInput
                        style={[styles.input, { borderColor: isWalletFocused ? '#B5BFB5' : '#C3C3C3', borderWidth: isWalletFocused ? 2 : 1 }]}
                        placeholder="E.g OxOdbe52...223fa"
                        placeholderTextColor="#C3C2C2"
                        keyboardType="default"
                        autoCapitalize="none"
                        onChangeText={(text) => {
                            setWalletAddress(text);
                            setError(false)
                        }}
                        onFocus={() => setIsWalletAddressFocused(true)}
                        onBlur={() => setIsWalletAddressFocused(false)}
                        value={walletAddress.startsWith("0x") && walletAddress.length > 30 ?
                            `${walletAddress.slice(0, 12)}….${walletAddress.slice(-6)}`
                            : walletAddress}
                    />
                    <FormErrorText error={error} errorDescription={errorDescription} />

                    <ScrollView>
                        {clipboardAddress && (
                            <TouchableOpacity
                                style={styles.pasteBanner}
                                activeOpacity={0.8}
                                onPress={handlePaste}
                            >
                                <View style={styles.pasteIcon}>
                                    <MaterialIcons name="content-paste" size={18} color="#fff" />
                                </View>
                                <View style={styles.pasteTextWrapper}>
                                    <PrimaryFontMedium style={styles.pasteTitle}>Paste from clipboard</PrimaryFontMedium>
                                    <PrimaryFontText style={styles.pasteAddress}>
                                        {`${clipboardAddress.slice(0, 12)}.…${clipboardAddress.slice(-6)}`}
                                    </PrimaryFontText>
                                </View>
                            </TouchableOpacity>
                        )}

                        <View style={styles.favoritesContainer}>
                            {displayFavorites.length !== 0 ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginVertical: 3 }}>
                                    <PrimaryFontBold style={{ fontSize: 16.5, marginRight: 2 }}>Favourites</PrimaryFontBold>
                                    <Favourites />
                                </View>

                            )
                                : null}

                            {displayFavorites.length === 0 ? (
                                <View style={styles.emptyFav}>
                                    {/* <MaterialIcons name="link" size={36} color="#888" /> */}
                                    <LottieAnimation animationSource={require('@/assets/animations/wallet.json')} animationStyle={{ width: "80%", height: 100 }} />
                                    <PrimaryFontBold style={styles.emptyTitle}>Save wallet address</PrimaryFontBold>
                                    <PrimaryFontText style={styles.emptySubtitle}>
                                        Save wallet addresses to make sending to external wallets faster and easier
                                    </PrimaryFontText>
                                    <TouchableOpacity style={styles.addButton} onPress={openAddressModal}>
                                        <MaterialIcons name="add" size={20} color="#fff" />
                                        <PrimaryFontBold style={styles.addBtnText}>Add address</PrimaryFontBold>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                // Map your favorites
                                displayFavorites.map((fav) => (
                                    <FavoriteAddressCard
                                        key={fav.address}
                                        address={fav.address}
                                        lastDate={fav.lastDate}
                                        userName={fav.userName}
                                        onAddUsername={(address) => openUsernameModal(address)}
                                    />
                                ))
                            )}


                            {displayFavorites.length !== 0 ? (
                                <View style={styles.addFavWrapper}>
                                    <TouchableOpacity style={styles.addSmallButton} onPress={openAddressModal}>
                                        <MaterialIcons name="add" size={20} color="#007AFF" />
                                        <PrimaryFontBold style={styles.addSmallText}>Save Address</PrimaryFontBold>
                                    </TouchableOpacity>
                                </View>
                            )
                                : null}

                        </View>
                    </ScrollView>

                </View>

                <View style={styles.stickyFooter}>
                    <View style={styles.warningRow}>
                        <MaterialIcons name="warning" size={18} color="#FFA500" />
                        <PrimaryFontText style={styles.warningText}>
                            To ensure you don’t lose your funds, ensure the wallet address entered supports the asset you’re sending
                        </PrimaryFontText>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleWalletAddressSubmit}>
                        <PrimaryFontBold style={styles.text}>
                            {buttonClicked ? <Loading color='#fff' description="Please wait..." /> : "Continue"}
                        </PrimaryFontBold>
                    </TouchableOpacity>
                </View>


                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContent}>
                            <PrimaryFontBold style={styles.modalTitle}>
                                {modalMode === 'addAddress' ? 'Save Address' : 'Add Username'}
                            </PrimaryFontBold>

                            {/* Address input */}
                            <PrimaryFontMedium style={styles.inputLabel}>Wallet Address</PrimaryFontMedium>
                            <TextInput
                                style={[styles.modalInput, { backgroundColor: modalAddress ? '#f0f0f0' : 'transparent' }]}
                                value={modalAddress.startsWith("0x") ? `${modalAddress.slice(0, 12)}.…${modalAddress.slice(-6)}` : modalAddress}
                                onChangeText={setModalAddress}
                                placeholder="OxOdbe52...223fa"
                                placeholderTextColor="#C3C2C2"
                                editable={modalMode === 'addAddress'}
                            />

                            {/* Username input */}
                            <PrimaryFontMedium style={styles.inputLabel}>Username</PrimaryFontMedium>
                            <TextInput
                                style={styles.modalInput}
                                value={modalUsername}
                                onChangeText={setModalUsername}
                                placeholder="E.g John Valora"
                                placeholderTextColor="#C3C2C2"
                                autoCapitalize='words'
                            />

                            <TouchableOpacity style={styles.modalBtn} onPress={handleModalDone}>
                                <PrimaryFontBold style={styles.modalBtnText}>Done</PrimaryFontBold>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Toast position="top" />
            </View>

        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#f8f8f8'
    },
    input: {
        height: 57,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 18,
        color: '#000',
        backgroundColor: '#F8F8F8',
        fontFamily: 'DMSansRegular'
    },
    button: {
        backgroundColor: '#00C48F',
        padding: 10,
        borderRadius: 9,
        alignItems: 'center',
        paddingVertical: 18,
        width: '100%'
    },
    text: {
        color: '#fff',
        fontSize: 19,
        fontFamily: 'DMSansMedium'
    },
    label: {
        fontSize: 20,
        marginBottom: 15,
        color: '#052330',
    },
    flexContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 40
    },
    pasteBanner: {
        flexDirection: 'row',
        backgroundColor: '#eef6ff',
        borderRadius: 6,
        marginTop: 0,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    pasteIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#4781D9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    pasteTextWrapper: {
        flex: 1,
    },
    pasteTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: 'grey',
        marginBottom: 4.5,
    },
    pasteAddress: {
        fontSize: 13,
        color: '#333',
    }, favoritesContainer: {
        borderWidth: 1.2,
        borderColor: '#eee',
        borderRadius: 6,
        padding: 12,
        marginTop: 10,
    },
    emptyFav: {
        alignItems: 'center',
        paddingBottom: 24,
    },
    emptyTitle: { fontSize: 16.5, marginTop: 0 },
    emptySubtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginVertical: 8 },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        marginTop: 12,
    },
    addBtnText: { color: '#fff', marginLeft: 6, fontSize: 14 },
    addFavWrapper: {
        alignItems: 'flex-end',
        marginTop: 12,
    },
    addSmallButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addSmallText: {
        marginLeft: 4,
        color: '#007AFF',
        fontSize: 14,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: '#00000066',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
    },
    modalTitle: {
        fontSize: 18.5,
        fontWeight: '600',
        marginBottom: 10,
    },
    modalInput: {
        borderRadius: 6,
        padding: 10,
        fontSize: 16,
        marginBottom: 10,
        color: '#000',
        fontFamily: 'DMSansRegular',
        borderColor: '#C3C3C3',
        borderWidth: 1
    },
    inputLabel: {
        fontSize: 13,
        marginBottom: 5,
        color: '#79828E',
    },
    modalBtn: {
        backgroundColor: '#007AFF',
        padding: 14,
        borderRadius: 6,
        alignItems: 'center',
        marginVertical: 5
    },
    modalBtnText: {
        color: '#fff',
        fontSize: 17
    },
    stickyFooter: {
        paddingTop: 18,
        borderTopWidth: 1,
        borderColor: '#eee',
    },
    warningRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        paddingHorizontal: 10
    },
    warningText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 13,
        color: 'grey',
        lineHeight: 20,
    },
});
