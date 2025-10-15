// src/screens/KYCFlowScreen.tsx
import React, { useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
    Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BottomSheet, { useBottomSheetDynamicSnapPoints, BottomSheetView } from '@gorhom/bottom-sheet';
import KYCImageBox from '@/components/KYCImageBox';
import SelfieCamera from '@/components/SelfieCamera';
import { openCamera, openGallery } from '@/utils/imagePickerService';
import { submitKYC } from './Apiconfig/api';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import { PrimaryFontText } from '@/components/PrimaryFontText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';
import BottomSheetBackdrop from '@/components/BottomSheetBackdrop';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import confirm from '@/assets/icons/confirm.png'
import personalInfo from '@/assets/images/personalInfo.png'
import idFront from '@/assets/images/idFront.png'
import camera from '@/assets/images/camera.png'

const TOTAL_STEPS_FOR_GOV_ID = 4; // Personal info, Front, Back, Selfie
const TOTAL_STEPS_FOR_PASSPORT = 3; // Personal info, Front (passport), Selfie

export default function KYCFlowScreen() {
    const route = useRouter();

    const initialSnapPoints = ['CONTENT_HEIGHT'];

    const {
        animatedHandleHeight,
        animatedSnapPoints,
        animatedContentHeight,
        handleContentLayout,
    } = useBottomSheetDynamicSnapPoints(initialSnapPoints);



    const [step, setStep] = useState<number>(1);
    const [documentType, setDocumentType] = useState<'NATIONAL_ID' | 'PASSPORT' | 'DRIVER_LICENSE'>('NATIONAL_ID');
    const [fullName, setFullName] = useState<string>('');
    const [identificationNumber, setIdentificationNumber] = useState<string>('');
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [selfie, setSelfie] = useState<string | null>(null);
    const [isSelfieMode, setIsSelfieMode] = useState<boolean>(false);
    const [submittingKyc, setSubmittingKyc] = useState<boolean>(false);
    // const [selfie, setSelfie] = useState<string | null>(null);



    // const bottomSheetRef = useRef<BottomSheet | null>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const animatedIndex1 = useSharedValue(-1);
    const [activeSlot, setActiveSlot] = useState<'front' | 'back' | 'selfie' | null>(null);

    const totalSteps = documentType === 'PASSPORT' ? TOTAL_STEPS_FOR_PASSPORT : TOTAL_STEPS_FOR_GOV_ID;
    const progressPercent = Math.round((step / totalSteps) * 100);

    // Open bottom sheet to choose camera/gallery
    function openPickerFor(slot: 'front' | 'back' | 'selfie') {
        setActiveSlot(slot);
        bottomSheetRef.current?.expand();
    }

    async function onTakePicture() {
        try {
            bottomSheetRef.current?.close();

            if (activeSlot === 'selfie') {
                setIsSelfieMode(true);
                return;
            }
            const uri = await openCamera();
            if (!uri) return;
            setAssetForSlot(activeSlot, uri);
        } catch (err: any) {
            console.error('camera err', err);
            Alert.alert('Error🌵', 'Could not take picture');
        }
    }

    async function onSelectFromGallery() {
        try {
            bottomSheetRef.current?.close();
            const uri = await openGallery();
            if (!uri) return;
            setAssetForSlot(activeSlot, uri);
        } catch (err: any) {
            console.error('gallery err', err);
            Alert.alert('Error🌵', 'Could not pick image');
        }
    }


    function setAssetForSlot(slot: 'front' | 'back' | 'selfie' | null, uri: string) {
        if (!slot) return;
        if (slot === 'front') setFrontImage(uri);
        if (slot === 'back') setBackImage(uri);
        if (slot === 'selfie') setSelfie(uri);
    }


    function removeAssetForSlot(slot: 'front' | 'back' | 'selfie') {
        if (slot === 'front') setFrontImage(null);
        if (slot === 'back') setBackImage(null);
        if (slot === 'selfie') setSelfie(null);
    }

    function goNext() {
        // step validation logic
        if (step === 1) {
            if (!documentType) return Alert.alert('Please select document type');
            if (!fullName.trim()) return Alert.alert('Enter full name');
            if (!identificationNumber.trim()) return Alert.alert('Enter identification number');
        } else if (step === 2) {
            // front image required
            if (!frontImage) return Alert.alert('Please add the front image');
        } else if (step === 3) {
            // For gov id step 3 is back image; for passport step 3 might be selfie
            if (documentType === 'NATIONAL_ID' && !backImage) return Alert.alert('Please add the back image');
            if (documentType === 'PASSPORT' && !selfie) return Alert.alert('Please take a selfie');
        }

        // move to next or submit
        if (step < totalSteps) setStep(s => s + 1);
        else submit();
    }

    function goBack() {
        if (step === 1) {
            // cancel
            return route.back();
        }
        setStep(s => s - 1);
    }

    async function submit() {

        if (!fullName || !identificationNumber || !selfie) {
            return Alert.alert('Please complete all steps');
        }

        setSubmittingKyc(true)

        const payload = {
            fullName,
            identityNumber: identificationNumber,
            documentType,
            selfie,
            id_front: documentType === 'NATIONAL_ID' ? frontImage || undefined : undefined,
            id_back: documentType === 'NATIONAL_ID' ? backImage || undefined : undefined,
            passport: documentType === 'PASSPORT' ? frontImage || undefined : undefined,
        };

        console.log('Submitting KYC payload...');complete

        const response = await submitKYC(payload);
        console.log('KYC API Response Success', response);
        if (response.success) {
            setSubmittingKyc(false)
            Alert.alert('Success🎉', 'KYC submitted successfully!');
            route.dismissAll();
            route.push('/(tabs)');
        }
        else {
            setSubmittingKyc(false)
            Alert.alert('Failed🌵', `${response.message || "Failed to submit KYC. Please try again."}`);
        }
    }

    // UI for the center part based on step
    function renderStepContent() {
        if (step === 1) {
            return (
                <View>
                    <View style={[styles.circleImagePlaceholder, styles.alignCenter]} >
                        <Image source={personalInfo} style={{ width: 64, height: 64 }} />
                    </View>
                    <PrimaryFontBold style={styles.heading}>Personal Info</PrimaryFontBold>
                    <PrimaryFontMedium style={styles.grayText}>Please fill the details below</PrimaryFontMedium>

                    <View style={styles.docRow}>
                        <TouchableOpacity
                            style={[styles.docCard, documentType === 'NATIONAL_ID' && styles.docCardActive, { flexGrow: 1, marginRight: 10 }]}
                            onPress={() => setDocumentType('NATIONAL_ID')}
                        >
                            <PrimaryFontMedium style={styles.cardTitle}>Government issued ID</PrimaryFontMedium>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.docCard, documentType === 'PASSPORT' && styles.docCardActive, { flexGrow: 1 }]}
                            onPress={() => setDocumentType('PASSPORT')}
                        >
                            <PrimaryFontMedium style={styles.cardTitle}>Passport</PrimaryFontMedium>
                        </TouchableOpacity>
                    </View>

                    {/* Inputs (replace with your InputField component) */}
                    <View style={{ marginTop: 16 }}>
                        <PrimaryFontMedium style={styles.inputLabel}>Full name</PrimaryFontMedium>
                        <TextInput
                            style={styles.inputBox}
                            value={fullName}
                            onChangeText={(text) => setFullName(text)}
                        // placeholder="Enter your full name"
                        />

                        <PrimaryFontMedium style={[styles.inputLabel, { marginTop: 14 }]}>Identification number</PrimaryFontMedium>

                        <TextInput
                            style={styles.inputBox}
                            value={identificationNumber}
                            onChangeText={(text) => setIdentificationNumber(text)}
                        // placeholder="Identification number"
                        />
                        {/* Replace with proper TextInputs wired to setFullName and setIdentificationNumber */}
                    </View>
                </View>
            );
        }

        if (step === 2) {
            return (
                <View>
                    <View style={[styles.circleImagePlaceholder, styles.alignCenter]} >
                        <Image source={idFront} style={{ width: 64, height: 64 }} />
                    </View>
                    <PrimaryFontBold style={styles.heading}>
                        {documentType === 'PASSPORT' ? 'Passport' : 'Front ID'}
                    </PrimaryFontBold>
                    <PrimaryFontMedium style={styles.grayText}>
                        {documentType === 'PASSPORT' ? 'Snap a clear photo of passport main page' : 'Take clear photo of front of ID'}
                    </PrimaryFontMedium>

                    <View style={{ marginTop: 12 }}>
                        <KYCImageBox
                            asset={frontImage}
                            placeholder="No image selected"
                            onPress={() => openPickerFor('front')}
                            onRemove={() => removeAssetForSlot('front')}
                        />
                    </View>
                </View>
            );
        }

        // step 3
        if (step === 3 && documentType === 'NATIONAL_ID') {
            // back id
            return (
                <View>
                    <View style={[styles.circleImagePlaceholder, styles.alignCenter]} >
                        <Image source={idFront} style={{ width: 64, height: 64 }} />
                    </View>
                    <PrimaryFontBold style={styles.heading}>Back of ID</PrimaryFontBold>
                    <PrimaryFontMedium style={styles.grayText}>Take clear photo of back of ID</PrimaryFontMedium>

                    <View style={{ marginTop: 12 }}>
                        <KYCImageBox
                            asset={backImage}
                            placeholder="No image selected"
                            onPress={() => openPickerFor('back')}
                            onRemove={() => removeAssetForSlot('back')}
                        />
                    </View>
                </View>
            );
        }

        // step 3 when passport OR step 4 for gov_id -> selfie step
        const selfieLabel = step === 3 && documentType === 'PASSPORT' ? 'Final Step' : 'Final Step';
        return (
            <View>
                <View style={[styles.circleImagePlaceholder, styles.alignCenter]} >
                    <Image source={camera} style={{ width: 64, height: 64 }} />
                </View>
                <PrimaryFontBold style={styles.heading}>{selfieLabel}</PrimaryFontBold>
                <PrimaryFontMedium style={styles.grayText}>Take a selfie and verify your information</PrimaryFontMedium>

                <View style={{ marginTop: 12 }}>
                    {/* For selfie we include a "Take Picture" button that opens front camera with in-app overlay (optional) */}
                    <KYCImageBox
                        asset={selfie}
                        placeholder="No image selected"
                        onPress={() => openPickerFor('selfie')}
                        onRemove={() => removeAssetForSlot('selfie')}
                    />
                    <TouchableOpacity style={styles.takePicBtn} onPress={() => setIsSelfieMode(true)}>
                        <PrimaryFontBold style={{ color: '#fff' }}>Take Picture</PrimaryFontBold>
                    </TouchableOpacity>

                    <View style={styles.confirmCard}>
                        <PrimaryFontBold style={styles.confirmTitle}>Confirm details</PrimaryFontBold>
                        <PrimaryFontMedium style={{ marginTop: 5 }}>Full name: <PrimaryFontBold>{fullName}</PrimaryFontBold></PrimaryFontMedium>
                        <PrimaryFontMedium style={{ marginTop: 5 }}>Document: <PrimaryFontBold>{documentType === 'NATIONAL_ID' ? "Government ID" : "Passport"}</PrimaryFontBold></PrimaryFontMedium>
                        <PrimaryFontMedium style={{ marginTop: 5 }}>ID number: <PrimaryFontBold>{identificationNumber}</PrimaryFontBold></PrimaryFontMedium>
                    </View>

                    <SelfieCamera
                        visible={isSelfieMode}
                        onCapture={(uri) => {
                            setSelfie(uri);
                            setIsSelfieMode(false);
                        }}
                        onCancel={() => setIsSelfieMode(false)}
                    />
                </View>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style={'dark'} />
            <View style={styles.screen}>
                {/* Header: Step X of Y, percent */}
                <View style={styles.header}>
                    <PrimaryFontText style={styles.stepLabel}>Step {step} of {totalSteps}</PrimaryFontText>
                    <PrimaryFontText style={styles.percentLabel}>{progressPercent}%</PrimaryFontText>
                </View>

                <View style={styles.progressBarOuter}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>

                <ScrollView style={styles.content} contentContainerStyle={{ padding: 16 }}>
                    {renderStepContent()}
                </ScrollView>

                {/* Bottom fixed buttons */}
                <View style={styles.bottomRow}>
                    <TouchableOpacity style={styles.bottomLeft} onPress={goBack}>
                        <PrimaryFontBold style={{ color: '#00C48F', fontSize: 16 }}>{step === 1 ? 'Cancel' : 'Back'}</PrimaryFontBold>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.bottomRight} onPress={goNext} disabled={submittingKyc}>
                        <PrimaryFontBold style={{ color: '#fff', fontSize: 16 }}>{step === totalSteps && submittingKyc ? 'Submitting...' : step === totalSteps ? 'Submit' : 'Next'}</PrimaryFontBold>
                    </TouchableOpacity>
                </View>



                {/* BottomSheet for choose camera/gallery */}
                <BottomSheetBackdrop animatedIndex={animatedIndex1} />

                <BottomSheet
                    ref={bottomSheetRef}
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
                        onLayout={handleContentLayout}
                    >
                        <View style={{ padding: 16 }}>
                            <TouchableOpacity style={styles.optionRow} onPress={onTakePicture}>
                                {/* <Ionicons name="camera-outline" size={26} color="#00C48F" style={styles.optionIcon} /> */}
                                <View style={styles.optionIconBox}>
                                    <Ionicons name="camera-outline" size={24} color="#00C48F" />
                                </View>
                                <View style={styles.optionTextContainer}>
                                    <PrimaryFontMedium style={styles.optionTitle}>Take picture</PrimaryFontMedium>
                                    <PrimaryFontText style={styles.optionSubtitle}>Use camera to capture image</PrimaryFontText>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.optionRow} onPress={onSelectFromGallery}>
                                <View style={styles.optionIconBox}>
                                    <Ionicons name="image-outline" size={24} color="#00C48F" />
                                </View>
                                <View style={styles.optionTextContainer}>
                                    <PrimaryFontMedium style={styles.optionTitle}>Select from gallery</PrimaryFontMedium>
                                    <PrimaryFontText style={styles.optionSubtitle}>Choose an existing image</PrimaryFontText>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.optionRow, { justifyContent: 'center' }]}
                                onPress={() => bottomSheetRef.current?.close()}
                            >
                                <PrimaryFontMedium style={{ color: 'red', fontSize: 16 }}>Cancel</PrimaryFontMedium>
                            </TouchableOpacity>
                        </View>

                    </BottomSheetView>
                </BottomSheet>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, alignItems: 'center' },
    stepLabel: { fontSize: 14 },
    percentLabel: { fontSize: 14 },
    progressBarOuter: { height: 6, backgroundColor: '#EEE', marginTop: 8, marginHorizontal: 16, borderRadius: 6 },
    progressFill: { height: '100%', backgroundColor: '#00C48F', borderRadius: 6 },
    content: { flex: 1 },
    circleImagePlaceholder: { width: 92, height: 92, borderRadius: 48, backgroundColor: '#ECF2CE', alignSelf: 'center', borderWidth: 1, borderColor: '#D5DBB1' },
    heading: { textAlign: 'center', fontSize: 19, marginTop: 12 },
    grayText: { textAlign: 'center', color: '#888', marginTop: 6 },
    docRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
    docCard: { paddingVertical: 16, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, alignItems: 'center' },
    docCardActive: { borderColor: '#00C48F', borderWidth: 1.1, backgroundColor: '#F2FFF7' },
    cardTitle: { fontSize: 14 },
    inputLabel: { color: '#777', marginBottom: 6 },
    inputBox: { borderWidth: 1, borderColor: '#E2E2E2', padding: 10, paddingLeft: 16, borderRadius: 8, backgroundColor: '#FFF', fontSize: 18, fontFamily: 'DMSansRegular' },
    takePicBtn: { marginTop: 12, backgroundColor: '#00C48F', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    confirmCard: { marginTop: 16, padding: 15, backgroundColor: '#FAFAFA', borderRadius: 8, borderWidth: 1, borderColor: '#EEE' },
    confirmTitle: { marginBottom: 6, fontSize: 16 },
    bottomRow: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderColor: '#F0F0F0', backgroundColor: '#fff' },
    bottomLeft: { flex: 1, paddingVertical: 14, alignItems: 'center' },
    bottomRight: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#00C48F', borderRadius: 8 },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    optionIcon: {
        marginRight: 14,
    },
    optionIconBox: {
        backgroundColor: '#eee',
        borderRadius: 10,
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    optionTextContainer: {
        flexDirection: 'column',
    },
    optionTitle: {
        fontSize: 17,
        color: '#000',
    },
    optionSubtitle: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    confirm: { width: 50, height: 50, },
    alignCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' }
});
