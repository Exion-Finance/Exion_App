import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Share,
    Linking,
    Alert,
    ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectUserProfile } from './state/slices';
import * as Clipboard from 'expo-clipboard';
import { PrimaryFontBold } from "@/components/PrimaryFontBold";
import { PrimaryFontText } from "@/components/PrimaryFontText";
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';

const { width } = Dimensions.get('window');

export default function Invite() {

    const user_profile = useSelector(selectUserProfile)
    const playStoreLink = 'https://play.google.com/store/apps/details?id=com.exion';
    const message = `Hi, join me on Exion! Use my referral code ${user_profile?.customId} and download here: ${playStoreLink}`;

    const handleCopy = async () => {
        try {
            await Clipboard.setStringAsync(user_profile?.customId || "");
        } catch (err) {
            Alert.alert('Error', 'Failed to copy referral code.');
        }
    };
    const handleSocialShare = async (platform: string) => {
        let url = '';

        switch (platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(message)}`;
                break;
            case 'whatsapp':
                url = `whatsapp://send?text=${encodeURIComponent(message)}`;
                break;
            case 'telegram':
                url = `https://t.me/share/url?url=${encodeURIComponent(message)}`;
                break;
        }

        try {
            await Linking.openURL(url);
        } catch {
            alert(`Unable to open ${platform}. Make sure it's installed.`);
        }
    };

    const handleInviteNow = async () => {
        await Share.share({ message });
    };

    return (
        <ScrollView style={styles.container}>
            {/* Top Section */}
            <View style={styles.topSection}>
                <Image
                    source={require('@/assets/images/friends.png')}
                    style={styles.friendsImage}
                    resizeMode="contain"
                />
                <View style={styles.inviteRow}>
                    <Image
                        source={require('@/assets/icons/dollars.png')}
                        style={styles.coinsImage}
                        resizeMode="contain"
                    />
                    <PrimaryFontBold style={styles.inviteText}>Invite friends & earn</PrimaryFontBold>
                </View>
            </View>

            {/* Content Section */}
            <View style={styles.content}>
                <PrimaryFontMedium style={styles.heading}>How it works</PrimaryFontMedium>
                <PrimaryFontText style={styles.description}>
                    Get rewarded instantly whenever your friends use your referral code to sign up.
                </PrimaryFontText>

                <View style={styles.codeBox}>
                    <View style={styles.codeContainer}>
                        <PrimaryFontBold style={styles.codeText}>{user_profile?.customId}</PrimaryFontBold>
                    </View>
                    <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                        <Ionicons name="copy-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
                <PrimaryFontText style={styles.socialLabel}>Tap to copy</PrimaryFontText>

                <View style={styles.socialRow}>
                    <View style={styles.socialItem}>
                        <TouchableOpacity onPress={() => handleSocialShare('facebook')} style={styles.socialIcon}>
                            <FontAwesome5 name="facebook-f" size={20} color="#1877F2" />
                        </TouchableOpacity>
                        <PrimaryFontText style={styles.socialLabel}>Facebook</PrimaryFontText>
                    </View>

                    <View style={styles.socialItem}>
                        <TouchableOpacity onPress={() => handleSocialShare('whatsapp')} style={styles.socialIcon}>
                            <FontAwesome5 name="whatsapp" size={20} color="#25D366" />
                        </TouchableOpacity>
                        <PrimaryFontText style={styles.socialLabel}>WhatsApp</PrimaryFontText>
                    </View>

                    <View style={styles.socialItem}>
                        <TouchableOpacity onPress={() => handleSocialShare('telegram')} style={styles.socialIcon}>
                            <FontAwesome5 name="telegram-plane" size={20} color="#0088cc" />
                        </TouchableOpacity>
                        <PrimaryFontText style={styles.socialLabel}>Telegram</PrimaryFontText>
                    </View>
                </View>


                {/* Invite Now Button */}
                <TouchableOpacity style={styles.inviteButton} onPress={handleInviteNow}>
                    <Ionicons name="share-social-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <PrimaryFontBold style={styles.inviteButtonText}>Share Now</PrimaryFontBold>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topSection: {
        backgroundColor: '#FFFACD',
        alignItems: 'center',
        paddingVertical: 24,
    },
    friendsImage: {
        width: width * 0.6,
        height: 140,
    },
    inviteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    coinsImage: {
        width: 32,
        height: 32,
        marginRight: 8,
    },
    inviteText: {
        fontSize: 22,
        color: '#333',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    heading: {
        fontSize: 17,
        marginBottom: 8,
        marginTop: 8,
        color: '#000',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        color: '#555',
        marginBottom: 24,
    },
    codeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        backgroundColor: '#FAFAFA',
        paddingHorizontal: 8,
        paddingLeft: 14,
        paddingVertical: 8,
        marginTop: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },

    codeContainer: {
        flex: 0.4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    codeText: {
        fontSize: 18,
        color: '#333',
        letterSpacing: 1,
    },
    copyButton: {
        // borderRadius: 8,
        // padding: 6,
        // backgroundColor: '#F4FFF6',
        // borderWidth: 1,
        // borderColor: '#00C48F',
        backgroundColor: '#00C48F',
        borderRadius: 10,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        // marginLeft: 10,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginVertical: 28,
        gap: 35,
    },
    socialItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialIcon: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        borderWidth: 1.5,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    socialLabel: {
        marginTop: 8,
        fontSize: 14,
        color: '#444',
        textAlign: 'center',
    },
    inviteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00C48F',
        borderRadius: 12,
        paddingVertical: 15,
        justifyContent: 'center',
        width: '100%',
        marginBottom: 30
    },
    inviteButtonText: {
        color: '#fff',
        fontSize: 17,
    },
});
