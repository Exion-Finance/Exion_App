import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import reusableStyles from '@/constants/ReusableStyles';
import NavBar from '@/components/NavBar';
import FormErrorText from "@/components/FormErrorText";
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { useRouter } from 'expo-router';
import Loading from '@/components/Loading';
import { TransactionData } from '@/types/datatypes';
import { PrimaryFontMedium } from "@/components/PrimaryFontMedium";
import Feather from '@expo/vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { PrimaryFontText } from "@/components/PrimaryFontText";
import { StatusBar } from 'expo-status-bar';
import { selectTransactions, selectFavorites, setFavorites, removeFavorite } from './state/slices';
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
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<'addUsername' | 'addAddress'>('addUsername');
    const [modalAddress, setModalAddress] = useState<string>('');
    const [modalUsername, setModalUsername] = useState<string>('');
    const [modalId, setModalId] = useState<string>('');
    const [doneButtonClicked, setDoneButtonClicked] = useState<boolean>(false);
    const [deleteButtonClicked, setDeleteButtonClicked] = useState<boolean>(false);

    const route = useRouter()
    const dispatch = useDispatch();

    let userTransactions = useSelector(selectTransactions)
    let db_favorites = useSelector(selectFavorites)
    // console.log("<---db_favorites tx in wallet-->", db_favorites)
    // console.log("user onchain Transactions straight", userTransactions)

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

    const handleFavoriteSelect = (address: string, userName?: string) => {
        try {
            // console.log("Selected address:", address);
            // console.log("Selected userName:", userName ?? "Not saved");
            route.push({
                pathname: '/keyboard',
                params: {
                    recipient_address: address,
                    source: 'sendcrypto',
                    savedUsername: userName ?? "Not saved"
                },
            });
        } catch (error) {
            console.log(error)
        }
    }

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
            // console.log(walletAddress)
            route.push({
                pathname: '/keyboard',
                params: {
                    recipient_address: walletAddress,
                    source: 'sendcrypto',
                    savedUsername: "Wallet Address"
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
        return userTransactions
    }, [userTransactions]);

    // console.log("allTxs after .flat", allTxs)


    // derive top-3 sent-to addresses
    const favorites = useMemo(() => {
        const sent = allTxs.filter(
            (tx) =>
                tx.transactionType === 'Sent' &&
                tx.toUsername?.startsWith('0x') &&
                tx.to.length >= 20
        );

        const counts: Record<string, { count: number; lastDate: Date }> = {};
        sent.forEach((tx) => {
            const addr = tx.to;
            const date = new Date(tx.date);

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

    // console.log("Favorites memo", favorites)

    // Open username modal for an existing favorite
    const openUsernameModal = (address: string) => {
        setModalMode('addUsername');
        setModalAddress(address);
        // Pre-fill if DB has name
        const existing = db_favorites.find((d) => d.walletAddress === address);
        setModalUsername(existing?.userName || '');
        setModalId(existing?.id || '')
        setModalVisible(true);
    };

    // Open address modal to add a completely new favorite
    const openAddressModal = () => {
        setModalMode('addAddress');
        setModalAddress('');
        setModalUsername('');
        setModalVisible(true);
    };

    const handleEditWalletUsername = async () => {
        try {
            setDoneButtonClicked(true)
            const res = await authAPI.put(`/user/favorite-addresses/${modalId}`, {
                address: modalAddress,
                name: modalUsername,
            });
            // console.log("edit wallet res", res.data)
            if (res.data.success) {
                await handleFetchFavourites()
                Toast.show({ type: 'success', text1: 'Saved successfully🎉' });
                setModalVisible(false);
            } else {
                setModalVisible(false);
                throw new Error(res.data.message);
            }
        } catch (error) {
            console.log(error)
        } finally {
            setDoneButtonClicked(false)
        }
    }

    const handleSaveNewAddress = async () => {
        try {
            setDoneButtonClicked(true)
            console.log("save new addy modalAddress", modalAddress)
            console.log("save new addy modalUsername", modalUsername)
            const address = modalAddress.trim();
            const name = modalUsername.trim();

            const res = await authAPI.post('/user/favorite-addresses', {
                address,
                name,
            });
            // console.log("save new wallet res", res.data)
            if (res.data.success) {
                await handleFetchFavourites();
                Toast.show({ type: 'success', text1: 'Saved successfully🎉' });
                setModalVisible(false);
            } else {
                setModalVisible(false);
                throw new Error(res.data.message);
            }
        } catch (e: any) {
            setModalVisible(false);
            Toast.show({ type: 'error', text1: 'Failed to save address' });
        }
        finally {
            setDoneButtonClicked(false)
        }
    }


    const handleFetchFavourites = async () => {
        try {
            const res = await authAPI.get('/user/favorite-addresses');
            // console.log("<--Fetch favorite addresses function-->", res.data);

            if (res.data.success && Array.isArray(res.data.data)) {
                const mapped = res.data.data
                    .filter((item: any) => item.id && item.id !== "")
                    .map((item: any) => ({
                        walletAddress: item.address,
                        userName: item.name,
                        id: item.id,
                    }));

                dispatch(setFavorites(mapped));
            }
        } catch (e) {
            console.error('Failed to fetch favorites:', e);
        }
    };


    // Handle Done press in modal
    const handleModalDone = async () => {
        if (!modalAddress || !modalUsername) {
            setModalVisible(false);
            return;
        }
        if (modalUsername && modalAddress) {
            const match = displayFavorites.find((fav) => fav.address === modalAddress);

            if (match?.userName === modalUsername) {
                console.log("They are the same");
                setModalVisible(false);
                return;
            }

            if (match?.userName && match.userName !== modalUsername) {
                console.log("Username edited");
                await handleEditWalletUsername()
                return;
            }

            if (!match?.userName && modalUsername) {
                console.log("Saving new address");
                await handleSaveNewAddress();
                return;
            }
        }
        try {
            setDoneButtonClicked(true)
            const res = await authAPI.post('/user/favorite-addresses', {
                address: modalAddress,
                name: modalUsername,
            });
            // console.log("save wallet res", res.data)
            if (res.data.success) {
                await handleFetchFavourites()
                Toast.show({ type: 'success', text1: 'Saved successfully🎉' });
                setModalVisible(false);
            } else {
                setModalVisible(false);
                throw new Error(res.data.message);
            }
        } catch (e: any) {
            setModalVisible(false);
            Toast.show({ type: 'error', text1: 'Failed to save address' });
        }
        finally {
            setDoneButtonClicked(false)
        }
    };

    // Fetch saved favorites from DB on mount
    useEffect(() => {
        (async () => {
            try {
                const res = await authAPI.get('/user/favorite-addresses');
                // console.log("Fetch favorite addresses", res.data)
                if (res.data.success && Array.isArray(res.data.data)) {
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

    // Only return db_favorites with their latest tx from favorites(transaction history)
    const displayFavorites = useMemo(() => {
        return db_favorites.map((db) => {
            // check if this db favorite has a matching transaction favorite
            const match = favorites.find((fav) => fav.address === db.walletAddress);

            return {
                address: db.walletAddress,
                lastDate: match?.lastDate ?? null,
                userName: db.userName,
                id: db.id,
            };
        });
    }, [favorites, db_favorites]);


    // console.log("db_favorites", db_favorites)
    // console.log("displayFavorites", displayFavorites)


    const handleDeleteFavorite = async () => {
        try {
            setDeleteButtonClicked(true)
            // console.log("modalAddress-->", modalAddress)
            // console.log("modalUsername-->", modalUsername)
            // console.log("modalId-->", modalId)
            const address = modalAddress.trim();
            const name = modalUsername.trim();

            const res = await authAPI.delete(`/user/favorite-addresses/${modalId}`);
            // console.log("delete wallet res", res.data)
            if (res.data.success) {
                dispatch(removeFavorite(modalId));
                Toast.show({ type: 'success', text1: 'Wallet address deleted' });
                setModalVisible(false);

            } else {
                setModalVisible(false);
                throw new Error(res.data.message);
            }
        } catch (e: any) {
            setModalVisible(false);
            Toast.show({ type: 'error', text1: 'Failed to delete address' });
        }
        finally {
            setDeleteButtonClicked(false)
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar style={'dark'} />
            <NavBar title='Wallet Address' onBackPress={() => route.back()} />

            <View style={[reusableStyles.paddingContainer, { flex: 1 }]}>
                {/* Top static section */}
                <View style={{ zIndex: 1 }}>
                    <PrimaryFontMedium style={styles.label}>Enter the wallet address</PrimaryFontMedium>
                    <View style={{ position: 'relative' }}>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    borderColor: isWalletFocused ? '#B5BFB5' : '#C3C3C3',
                                    borderWidth: isWalletFocused ? 2 : 1,
                                    paddingRight: 40, // give space for the X icon
                                },
                            ]}
                            placeholder="E.g OxOdbe52...223fa"
                            placeholderTextColor="#C3C2C2"
                            keyboardType="default"
                            autoCapitalize="none"
                            onChangeText={(text) => {
                                setWalletAddress(text);
                                setError(false);
                            }}
                            onFocus={() => setIsWalletAddressFocused(true)}
                            onBlur={() => setIsWalletAddressFocused(false)}
                            value={walletAddress}
                        />

                        {walletAddress.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setWalletAddress('')}
                                style={{
                                    position: 'absolute',
                                    right: 10,
                                    top: '50%',
                                    transform: [{ translateY: -12 }],
                                    backgroundColor: '#E0E0E0',
                                    borderRadius: 20,
                                    width: 24,
                                    height: 24,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ionicons name="close" size={16} color="#333" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {clipboardAddress && (
                        <TouchableOpacity style={styles.pasteBanner} activeOpacity={0.8} onPress={handlePaste}>
                            <View style={styles.pasteIcon}>
                                <MaterialIcons name="content-paste" size={18} color="#fff" />
                            </View>
                            <View style={styles.pasteTextWrapper}>
                                <PrimaryFontMedium style={styles.pasteTitle}>Paste from clipboard</PrimaryFontMedium>
                                <PrimaryFontText style={styles.pasteAddress}>
                                    {clipboardAddress}
                                </PrimaryFontText>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Middle flexible scrollable section */}
                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.favoritesContainer} showsVerticalScrollIndicator={false}>
                    <View>
                        {displayFavorites.length !== 0 ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 3 }}>
                                <PrimaryFontBold style={{ fontSize: 16.5, marginRight: 2 }}>Favourites</PrimaryFontBold>
                                <Favourites />
                            </View>
                        ) : null}

                        {displayFavorites.length === 0 ? (
                            <View style={styles.emptyFav}>
                                <LottieAnimation
                                    animationSource={require('@/assets/animations/wallet.json')}
                                    animationStyle={{ width: '80%', height: 100, marginTop: -10 }}
                                />
                                <PrimaryFontBold style={styles.emptyTitle}>Save wallet address</PrimaryFontBold>
                                <PrimaryFontText style={styles.emptySubtitle}>
                                    Save wallet addresses to make sending to external wallets simpler and faster
                                </PrimaryFontText>
                                <TouchableOpacity style={styles.addButton} onPress={openAddressModal}>
                                    <MaterialIcons name="add" size={20} color="#fff" />
                                    <PrimaryFontBold style={styles.addBtnText}>Add address</PrimaryFontBold>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            displayFavorites.slice(0, 3).map((fav) => (
                                <FavoriteAddressCard
                                    key={fav.address}
                                    address={fav.address}
                                    lastDate={fav.lastDate}
                                    userName={fav.userName}
                                    onAddUsername={(address) => openUsernameModal(address)}
                                    onSelect={() => handleFavoriteSelect(fav.address, fav.userName)}
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
                        ) : null}
                    </View>
                </ScrollView>

                {/* Footer static at bottom */}
                <View style={styles.stickyFooter}>
                    <View style={styles.warningRow}>
                        <MaterialIcons name="warning" size={18} color="#FFA500" />
                        <PrimaryFontText style={styles.warningText}>
                            To ensure you don’t lose your funds, ensure the wallet address entered supports the asset you’re sending
                        </PrimaryFontText>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleWalletAddressSubmit}>
                        <PrimaryFontBold style={styles.text}>
                            {buttonClicked ? <Loading color="#fff" description="Please wait..." /> : 'Continue'}
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
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <PrimaryFontBold style={styles.modalTitle}>
                                    {modalMode === 'addAddress' ? 'Save Address' : 'Add Username'}
                                </PrimaryFontBold>

                                {modalMode === 'addAddress' ? null :
                                    <TouchableOpacity onPress={handleDeleteFavorite} style={styles.deleteIcon}>
                                        {deleteButtonClicked ? <ActivityIndicator size="small" color='grey' /> : <Feather name="trash" size={15} color="red" />}
                                    </TouchableOpacity>}
                            </View>

                            {/* Address input */}
                            <PrimaryFontMedium style={styles.inputLabel}>Wallet Address</PrimaryFontMedium>
                            <TextInput
                                style={[styles.modalInput, { backgroundColor: modalAddress ? '#f0f0f0' : 'transparent' }]}
                                value={modalAddress}
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

                            <TouchableOpacity style={styles.modalBtn} onPress={handleModalDone} disabled={doneButtonClicked}>
                                <PrimaryFontBold style={styles.modalBtnText}>{doneButtonClicked ? <Loading color='#fff' description='' /> : "Done"}</PrimaryFontBold>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
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
        width: '100%',
        marginBottom: 20
    },
    text: {
        color: '#fff',
        fontSize: 19,
        fontFamily: 'DMSansMedium'
    },
    label: {
        fontSize: 19,
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
        marginTop: 7,
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
        fontSize: 12,
        color: '#555',
    },
    favoritesContainer: {
        borderWidth: 1.2,
        borderColor: '#eee',
        borderRadius: 6,
        padding: 12,
        marginTop: 10,
        zIndex: 0
        // paddingBottom: 12,
    },
    emptyFav: {
        alignItems: 'center',
        paddingBottom: 10,
    },
    emptyTitle: { fontSize: 16.5, marginTop: -10 },
    emptySubtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginVertical: 5 },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        marginTop: 10,
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
        paddingTop: 10,
        borderTopWidth: 1,
        borderColor: '#eee',
    },
    warningRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        // paddingHorizontal: 2
    },
    warningText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 12,
        color: 'grey',
        lineHeight: 16,
    },
    deleteIcon: {
        backgroundColor: '#f8f8f8',
        borderColor: '#ccc',
        borderRadius: 18,
        borderWidth: 1,
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
});
