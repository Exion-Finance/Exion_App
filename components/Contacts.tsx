import React, { useEffect, useState } from 'react';
import { SectionList, Alert, View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Contacts from 'expo-contacts';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import reusableStyle from '@/constants/ReusableStyles'
import { PrimaryFontText } from './PrimaryFontText';
import { PrimaryFontMedium } from './PrimaryFontMedium';
import { useRouter } from 'expo-router';
import { checkPhoneNumber } from '@/app/Apiconfig/api';

type Contact = {
    name: string;
    phoneNumbers?: { label: string; number: string | undefined }[];
};

type ContactSection = {
    title: string;
    data: { name: string; phoneNumber: string }[];
};

type Props = {
    from: string
}

export default function ContactsList({ from }: Props) {
    const [sections, setSections] = useState<ContactSection[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filteredSections, setFilteredSections] = useState<ContactSection[]>([]);
    const [contactClicked, setContactClicked] = useState<string | false>(false);
    const route = useRouter()

    useEffect(() => {
        (async () => {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
                const { data } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.PhoneNumbers],
                });

                if (data.length > 0) {
                    const processedContacts = processContacts(data);
                    setSections(processedContacts);
                    setFilteredSections(processedContacts);
                } else {
                    Alert.alert("Oops😕", 'No contacts found');
                }
            } else {
                Alert.alert("Oops😕", 'Permission denied');
            }
        })();
    }, []);


    const processContacts = (contacts: Contacts.Contact[]): ContactSection[] => {
        const groupedContacts: { [key: string]: { name: string; phoneNumber: string }[] } = {};

        contacts.forEach((contact) => {
            if (!contact.name) return; // Skip contacts without a name

            const firstLetter = contact.name.charAt(0).toUpperCase();
            if (!groupedContacts[firstLetter]) {
                groupedContacts[firstLetter] = [];
            }

            const phoneNumber = contact.phoneNumbers && contact.phoneNumbers.length > 0 && contact.phoneNumbers[0].number
                ? contact.phoneNumbers[0].number
                : 'No number';

            groupedContacts[firstLetter].push({ name: contact.name, phoneNumber });
        });

        const sortedSections = Object.keys(groupedContacts)
            .sort()
            .map((letter) => ({
                title: letter,
                data: groupedContacts[letter].sort((a, b) => a.name.localeCompare(b.name)),
            }));

        return sortedSections;
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);

        // If the query is a number (e.g., starts with a digit), try to match it with phone numbers
        const filtered = sections.map(section => ({
            ...section,
            data: section.data.filter(contact =>
                contact.name.toLowerCase().includes(query.toLowerCase()) ||
                contact.phoneNumber.includes(query)
            ),
        })).filter(section => section.data.length > 0);

        setFilteredSections(filtered);

        // If no matches found and query is a phone number, allow manual entry
        if (filtered.length === 0 && query.length >= 10) {
            setFilteredSections([{
                title: '',
                data: [{ name: query, phoneNumber: query }]
            }]);
        }
    };

    const handlePhoneNumberCleanup = (phoneNumber: string) => {
        const cleanedNumber = phoneNumber.replace(/\s+/g, '');
        return cleanedNumber;
    };

    const handlePhoneNumberPrefix = (phoneNumber: string) => {
        if (phoneNumber.startsWith('07')) {
            return phoneNumber.replace(/^0/, '+254');
        }
        if (phoneNumber.startsWith('01')) {
            return phoneNumber;
        }
        if (phoneNumber.startsWith('+254')) {
            return phoneNumber;
        }
        if (phoneNumber.startsWith('254')) {
            return "+" + phoneNumber;
        }
        return phoneNumber;
    };

    const handleSendMoneyPhoneNumberPrefix = (phoneNumber: string) => {
        if (phoneNumber.startsWith('07')) {
            return phoneNumber.replace(/^0/, '254');
        }
        if (phoneNumber.startsWith('01')) {
            return phoneNumber.replace(/^0/, '254');
        }
        if (phoneNumber.startsWith('+254')) {
            return phoneNumber.slice(1);
        }
        if (phoneNumber.startsWith('254')) {
            return phoneNumber;
        }
        return phoneNumber;
    };
    //to be removed the function "removeCountryCode when phone number get updated to country code format"
    const removeCountryCode = (phoneNumber: string): string => {
        return phoneNumber.replace(/^\+254/, '0'); // Removes the +254 and replaces with 0
    };

    const handleSelectContact = async ({ name, phoneNumber }: { name: string, phoneNumber: string }) => {
        setContactClicked(phoneNumber);
        const formattedNumber = handlePhoneNumberCleanup(phoneNumber);
        const cleanNumber = handlePhoneNumberPrefix(formattedNumber);
        const sendMoneyNumber = handleSendMoneyPhoneNumberPrefix(formattedNumber)
        try {
            if(from === 'sendmoney'){
                console.log(sendMoneyNumber)
                route.push({
                    pathname: '/keyboard',
                    params: {
                        phoneNumber: sendMoneyNumber,
                        source: 'sendmoney'
                    }
                });
                return;
            }

            const res = await checkPhoneNumber(cleanNumber);
            if (res.status === 200) {
                route.push({
                    pathname: '/keyboard',
                    params: {
                        name,
                        phoneNumber: cleanNumber,
                        source: 'contacts',
                    },
                });
            }
            else {
                Alert.alert("Oops😕", res.data.message || "Something went wrong.");
            }
        } catch (error: any) {
            if (error.response) {
                // The server responded with a status other than 2xx
                Alert.alert("Invite 📩", "This contact isn't a regitered Exion user. Try sending using their wallet address instead by clicking on the top right icon");
            } else if (error.request) {
                // No response received

                Alert.alert("Error", "Unable to connect to the server. Please try again later.");
            } else {
                // Something else caused the error

                Alert.alert("Error", "An unexpected error occurred. Please try again.");
            }
        } finally {
            setContactClicked(false);
        }

    };

    return (
        <View style={[styles.container, from === "contacts" ? reusableStyle.paddingContainer : reusableStyle.width100]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.searchContainer, { width: from === "contacts" ? "83%" : "100%"}]}>
                    <Ionicons name="search" size={20} color="#DADADA" style={styles.searchIcon} />
                    <TextInput
                        style={[styles.input, { fontFamily: 'DMSansRegular' }]}
                        placeholder="Name or phone"
                        placeholderTextColor="#79828E"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
                <TouchableOpacity style={[styles.qrButton, { display: from === "contacts" ? "flex" : "none"}]} onPress={() => route.push('/sendcrypto')}>
                    <MaterialCommunityIcons name="qrcode-scan" size={20} color="white" />
                </TouchableOpacity>
            </View>

            <PrimaryFontMedium style={styles.chooseText}>Choose from your contacts</PrimaryFontMedium>

            <SectionList
                sections={filteredSections}
                initialNumToRender={20}
                maxToRenderPerBatch={10}
                style={{ backgroundColor: 'white' }}
                keyExtractor={(item, index) => item.name + index}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.contactContainer} onPress={() => handleSelectContact(item)}>
                        <View>
                            <PrimaryFontText style={styles.name}>{item.name}</PrimaryFontText>
                            <PrimaryFontText style={styles.phoneNumber}>{item.phoneNumber}</PrimaryFontText>
                        </View>
                        {contactClicked === item.phoneNumber && (
                            <ActivityIndicator size="small" color="#00C48F" />
                        )}
                    </TouchableOpacity>
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={styles.sectionHeader}>
                        <PrimaryFontMedium style={styles.sectionHeaderText}>{title}</PrimaryFontMedium>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F5F9',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        position: 'relative',
    },
    searchIcon: {
        marginRight: 10,
        position: 'absolute',
        left: 15,
        zIndex: 1,
    },
    input: {
        flex: 1,
        height: 40,
        paddingLeft: 40,
        paddingRight: 10,
        fontSize: 17,
        color: '#000',
    },
    qrButton: {
        width: 50,
        height: 50,
        marginLeft: 10,
        backgroundColor: '#00C48F',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chooseText: {
        paddingVertical: 10,
        fontSize: 20,
        color: '#052330',
        marginTop: 10
    },
    sectionHeader: {
        padding: 10,
        backgroundColor: 'white'
    },
    sectionHeaderText: {
        fontSize: 20,
        color: '#79828E'
    },
    contactContainer: {
        padding: 10,
        paddingVertical: 18,
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center"
    },
    name: {
        fontSize: 18,
        color: 'black'
    },
    phoneNumber: {
        color: '#79828E',
        marginTop: 9,
        fontSize: 15
    },
});
