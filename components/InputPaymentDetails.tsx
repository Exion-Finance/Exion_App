import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { PrimaryFontMedium } from "./PrimaryFontMedium";
import { PrimaryFontText } from "./PrimaryFontText";

interface InputFieldProps {
    label: string;
    placeholder: string;
    onInputChange: (text: string) => void;
    error: boolean;
    errorDescription?: string;
    keyboardType?: KeyboardTypeOptions;
}

const InputField: React.FC<InputFieldProps> = ({ label, placeholder, onInputChange, error, errorDescription, keyboardType }) => {
    const [value, setValue] = useState('');
    const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

    const handleChange = (text: string) => {
        setValue(text);
        onInputChange(text);
    };
    return (
        <View style={styles.container}>
            <PrimaryFontMedium style={styles.label}>{label}</PrimaryFontMedium>
            <TextInput
                style={[styles.input, { borderColor: isInputFocused ? '#B5BFB5' : '#C3C3C3', borderWidth: isInputFocused ? 2 : 1 }]}
                placeholder={placeholder}
                placeholderTextColor={'#C3C2C2'}
                value={value}
                onChangeText={handleChange}
                keyboardType={keyboardType}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
            />
            {error ? <PrimaryFontText style={{ marginTop: 10, color: 'red', fontSize: 15 }}>{errorDescription}</PrimaryFontText> : null}
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
});

export default InputField;
