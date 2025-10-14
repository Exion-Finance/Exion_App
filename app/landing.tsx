import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { PrimaryFontText } from '@/components/PrimaryFontText';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
import { PrimaryFontBold } from '@/components/PrimaryFontBold';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        image: require('@/assets/images/landing2.png'),
        title: 'Crypto Payments',
        description: 'Make payments for your day to day utilities directly from your wallet.'
    },
    {
        id: '2',
        image: require('@/assets/images/landing1.png'),
        title: 'Simple Spending',
        description: 'Complete your payments in three simple steps or less and continue your day.'
    },
    {
        id: '3',
        image: require('@/assets/images/landing3.png'),
        title: 'Send Across Africa',
        description: 'Send & receive money instantly with the speed of stablecoins at close to no cost.'
    }
];

export default function LandingPage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const router = useRouter();

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            router.push('/login');
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    return (
        <View style={styles.container}>
            <StatusBar style={'light'} />
            {currentIndex < slides.length - 1 && (
                <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/login')}>
                    <PrimaryFontMedium style={{ color: '#00C48F', fontSize: 19 }}>Skip</PrimaryFontMedium>
                </TouchableOpacity>
            )}

            <View style={{ flex: 1 }}>
                <FlatList
                    data={slides}
                    ref={flatListRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <View style={[styles.slide, { width }]}>
                            <Image source={item.image} style={styles.image} />
                            <PrimaryFontBold style={styles.title}>{item.title}</PrimaryFontBold>
                            <PrimaryFontText style={styles.description}>{item.description}</PrimaryFontText>

                            <View style={styles.dotsContainer}>
                                {slides.map((_, dotIndex) => (
                                    <View
                                        key={dotIndex}
                                        style={[
                                            styles.dot,
                                            currentIndex === dotIndex ? styles.activeDot : styles.inactiveDot,
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                />
            </View>


            <View style={{ width: '90%', marginBottom: 28 }}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor:
                                currentIndex === slides.length - 1 ? '#00C48F' : '#FFE62C'
                        }
                    ]}
                    onPress={handleNext}
                >
                    <PrimaryFontBold style={[styles.buttonText, { color: currentIndex === slides.length - 1 ? '#fff' : '#333' }]}>
                        {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                    </PrimaryFontBold>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#18313F',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    skipButton: {
        position: 'absolute',
        top: 50,
        right: 25,
        zIndex: 10
    },
    slide: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    image: {
        width: '80%',
        height: 220,
        resizeMode: 'contain',
        marginBottom: 20
    },
    title: {
        fontSize: 28,
        marginBottom: 4,
        textAlign: 'center',
        color: '#F8F8F8',
    },
    description: {
        fontSize: 17,
        color: '#BAB6B6',
        textAlign: 'center',
        lineHeight: 24,
        width: '100%',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 5,
        marginHorizontal: 2
    },
    activeDot: {
        backgroundColor: '#00C48F',
        width: 20
    },
    inactiveDot: {
        backgroundColor: '#D9D9D9'
    },
    button: {
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 19,
    }
});
