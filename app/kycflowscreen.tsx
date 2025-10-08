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
import { openCamera, openGallery } from '@/utils/imagePickerService';
// import { Asset } from 'react-native-image-picker';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import { PrimaryFontText } from '@/components/PrimaryFontText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';
import BottomSheetBackdrop from '@/components/BottomSheetBackdrop';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import confirm from '@/assets/icons/confirm.png'

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
    const [documentType, setDocumentType] = useState<'gov_id' | 'passport' | null>('gov_id');
    const [fullName, setFullName] = useState<string>('');
    const [identificationNumber, setIdentificationNumber] = useState<string>('');
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [selfie, setSelfie] = useState<string | null>(null);


    // const bottomSheetRef = useRef<BottomSheet | null>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const animatedIndex1 = useSharedValue(-1);
    const [activeSlot, setActiveSlot] = useState<'front' | 'back' | 'selfie' | null>(null);

    const totalSteps = documentType === 'passport' ? TOTAL_STEPS_FOR_PASSPORT : TOTAL_STEPS_FOR_GOV_ID;
    const progressPercent = Math.round((step / totalSteps) * 100);

    // Open bottom sheet to choose camera/gallery
    function openPickerFor(slot: 'front' | 'back' | 'selfie') {
        setActiveSlot(slot);
        bottomSheetRef.current?.expand();
    }

    async function onTakePicture() {
        try {
            bottomSheetRef.current?.close();
            const uri = await openCamera();
            if (!uri) return;
            setAssetForSlot(activeSlot, uri);
        } catch (err: any) {
            console.error('camera err', err);
            Alert.alert('Error', 'Could not take picture');
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
            Alert.alert('Error', 'Could not pick image');
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
            if (!documentType) return Alert.alert('Select document type');
            if (!fullName.trim()) return Alert.alert('Enter full name');
            if (!identificationNumber.trim()) return Alert.alert('Enter identification number');
        } else if (step === 2) {
            // front image required
            if (!frontImage) return Alert.alert('Please add the front image');
        } else if (step === 3) {
            // For gov id step 3 is back image; for passport step 3 might be selfie
            if (documentType === 'gov_id' && !backImage) return Alert.alert('Please add the back image');
            if (documentType === 'passport' && !selfie) return Alert.alert('Please take a selfie');
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
        // final validation
        if (!fullName || !identificationNumber || !frontImage || !selfie) {
            return Alert.alert('Please complete all steps');
        }
        // For gov_id ensure backImage exists
        if (documentType === 'gov_id' && !backImage) return Alert.alert('Please add back image');

        // Build payload
        const payload = {
            documentType,
            fullName,
            identificationNumber,
            frontImage,
            backImage,
            selfie,
        };

        // TODO: send payload to API
        console.log('KY C payload', payload);
        Alert.alert('Submitted', 'KYC submitted successfully');

        // navigate back or to index
        route.push('/(tabs)'); // adapt to your route
    }

    // UI for the center part based on step
    function renderStepContent() {
        if (step === 1) {
            return (
                <View>
                    <View style={[styles.circleImagePlaceholder, styles.alignCenter]} >
                        <Image source={confirm} style={styles.confirm} />
                    </View>
                    <PrimaryFontBold style={styles.heading}>Personal Info</PrimaryFontBold>
                    <PrimaryFontMedium style={styles.grayText}>Please fill the details below</PrimaryFontMedium>

                    <View style={styles.docRow}>
                        <TouchableOpacity
                            style={[styles.docCard, documentType === 'gov_id' && styles.docCardActive]}
                            onPress={() => setDocumentType('gov_id')}
                        >
                            <Text style={styles.cardTitle}>Government issued ID</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.docCard, documentType === 'passport' && styles.docCardActive]}
                            onPress={() => setDocumentType('passport')}
                        >
                            <Text style={styles.cardTitle}>Passport</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Inputs (replace with your InputField component) */}
                    <View style={{ marginTop: 16 }}>
                        <Text style={styles.inputLabel}>Full name</Text>
                        <TextInput
                            style={styles.inputBox}
                            value={fullName}
                            onChangeText={(text) => setFullName(text)}
                        // placeholder="Enter your full name"
                        />

                        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Identification number</Text>

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
                        <Image source={confirm} style={styles.confirm} />
                    </View>
                    <PrimaryFontBold style={styles.heading}>
                        {documentType === 'passport' ? 'Passport' : 'Front ID'}
                    </PrimaryFontBold>
                    <PrimaryFontMedium style={styles.grayText}>
                        {documentType === 'passport' ? 'Snap a clear photo of passport main page' : 'Take clear photo of front of ID'}
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
        if (step === 3 && documentType === 'gov_id') {
            // back id
            return (
                <View>
                    <View style={[styles.circleImagePlaceholder, styles.alignCenter]} >
                        <Image source={confirm} style={styles.confirm} />
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
        const selfieLabel = step === 3 && documentType === 'passport' ? 'Final Step' : 'Final Step';
        return (
            <View>
                <View style={[styles.circleImagePlaceholder, styles.alignCenter]} >
                    <Image source={confirm} style={styles.confirm} />
                </View>
                <PrimaryFontBold style={styles.heading}>{selfieLabel}</PrimaryFontBold>
                <PrimaryFontMedium style={styles.grayText}>Take a selfie and verify information</PrimaryFontMedium>

                <View style={{ marginTop: 12 }}>
                    {/* For selfie we include a "Take Picture" button that opens front camera with in-app overlay (optional) */}
                    <KYCImageBox
                        asset={selfie}
                        placeholder="No image selected"
                        onPress={() => openPickerFor('selfie')}
                        onRemove={() => removeAssetForSlot('selfie')}
                    />

                    <TouchableOpacity style={styles.takePicBtn} onPress={() => openPickerFor('selfie')}>
                        <PrimaryFontBold style={{ color: '#fff' }}>Take Picture</PrimaryFontBold>
                    </TouchableOpacity>

                    <View style={styles.confirmCard}>
                        <Text style={styles.confirmTitle}>Confirm details</Text>
                        <Text>Full name: {fullName}</Text>
                        <Text>Document: {documentType}</Text>
                        <Text>ID number: {identificationNumber}</Text>
                    </View>
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
                    <Text style={styles.stepLabel}>Step {step} of {totalSteps}</Text>
                    <Text style={styles.percentLabel}>{progressPercent}%</Text>
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
                        <PrimaryFontBold style={{ color: '#00C48F' }}>{step === 1 ? 'Cancel' : 'Back'}</PrimaryFontBold>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.bottomRight} onPress={goNext}>
                        <PrimaryFontBold style={{ color: '#fff' }}>{step === totalSteps ? 'Submit' : 'Next'}</PrimaryFontBold>
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
                        style={{ paddingBottom: 18 }}
                        onLayout={handleContentLayout}
                    >
                        <View style={{ padding: 16 }}>
                            <TouchableOpacity style={styles.optionRow} onPress={onTakePicture}>
                                <Text>Take picture</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.optionRow} onPress={onSelectFromGallery}>
                                <Text>Select from gallery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.optionRow} onPress={() => bottomSheetRef.current?.close()}>
                                <Text style={{ color: 'red' }}>Cancel</Text>
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
    circleImagePlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#F4F4F4', alignSelf: 'center' },
    heading: { textAlign: 'center', fontSize: 18, marginTop: 12 },
    grayText: { textAlign: 'center', color: '#888', marginTop: 6 },
    docRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
    docCard: { width: '48%', padding: 12, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, alignItems: 'center' },
    docCardActive: { borderColor: '#00C48F', backgroundColor: '#F2FFF7' },
    cardTitle: { fontSize: 14 },
    inputLabel: { color: '#777', marginBottom: 6 },
    inputBox: { borderWidth: 1, borderColor: '#EEE', padding: 10, borderRadius: 8, backgroundColor: '#FFF' },
    takePicBtn: { marginTop: 12, backgroundColor: '#00C48F', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    confirmCard: { marginTop: 16, padding: 14, backgroundColor: '#FAFAFA', borderRadius: 8, borderWidth: 1, borderColor: '#EEE' },
    confirmTitle: { fontWeight: '700', marginBottom: 6 },
    bottomRow: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderColor: '#F0F0F0', backgroundColor: '#fff' },
    bottomLeft: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    bottomRight: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#00C48F', borderRadius: 8 },
    optionRow: { paddingVertical: 12 },
    confirm: { width: 50, height: 50, },
    alignCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' }
});
