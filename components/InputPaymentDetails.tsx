import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { PrimaryFontMedium } from "./PrimaryFontMedium";
import { PrimaryFontText } from "./PrimaryFontText";
import { setExchangeRate, selectExchangeRate } from '@/app/state/slices';
import { useSelector } from 'react-redux';

interface InputFieldProps {
    label: string;
    placeholder: string;
    onInputChange: (text: string) => void;
    error: boolean;
    passedValue?: string;
    errorDescription?: string;
    source?: string;
    keyboardType?: KeyboardTypeOptions;
}

const InputField: React.FC<InputFieldProps> = ({ label, placeholder, onInputChange, error, errorDescription, keyboardType, passedValue, source }) => {
    const [value, setValue] = useState<string>('');
    const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

    const exchange_rate = useSelector(selectExchangeRate)
    // console.log("exchange_rate from redux...>", exchange_rate)

    const handleChange = (text: string) => {
        setValue(text);
        onInputChange(text);
    };

    function convertKshToUsd(amountKsh: number): number {
        if (!amountKsh || amountKsh <= 0) return 0;

        const sellingRate = exchange_rate ? parseFloat(exchange_rate.sellingRate) : NaN;

        if (!sellingRate || isNaN(sellingRate)) return 0;

        return parseFloat((amountKsh / sellingRate).toFixed(2));
    }


    return (
        <View style={styles.container}>
            <PrimaryFontMedium style={styles.label}>{label}</PrimaryFontMedium>
            <TextInput
                style={[styles.input, { borderColor: isInputFocused ? '#B5BFB5' : '#C3C3C3', borderWidth: isInputFocused ? 2 : 1 }]}
                placeholder={placeholder}
                placeholderTextColor={'#C3C2C2'}
                value={passedValue ? passedValue : value}
                onChangeText={handleChange}
                keyboardType={keyboardType}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
            />
            {error ?
                <PrimaryFontText style={{ marginTop: 10, color: 'red', fontSize: 15 }}>{errorDescription}</PrimaryFontText>
                : source === "fundingAmount" && value || source === "fundingAmount" && passedValue ?
                    <View style={styles.conversionContainer}>
                        <PrimaryFontText style={{ color: 'gray', fontSize: 15 }}>You receive ${convertKshToUsd(passedValue ? Number(passedValue) : Number(value))}</PrimaryFontText>
                        <PrimaryFontText style={{ color: 'gray', fontSize: 15 }}>$1 = {exchange_rate?.sellingRate}Ksh</PrimaryFontText>
                    </View>
                    : null}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        fontSize: 20,
        marginBottom: 22,
        color: '#052330',
    },
    input: {
        height: 57,
        paddingHorizontal: 15,
        borderRadius: 5,
        backgroundColor: '#F8F8F8',
        fontFamily: 'DMSansRegular',
        paddingLeft: 20,
        fontSize: 19,
        color: 'black'
    },
    conversionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        borderWidth: 0.8,
        borderColor: '#ddd',
        backgroundColor: '#eef6ff',
        padding: 8,
        borderRadius: 6,
    }
});

export default InputField;
