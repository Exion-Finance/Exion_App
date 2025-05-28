import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PrimaryFontText } from './PrimaryFontText';

interface InputFieldProps {
    error: boolean;
    errorDescription?: string;
}

const FormErrorText: React.FC<InputFieldProps> = ({ error, errorDescription }) => {
    return (
        <View style={styles.container}>
            <PrimaryFontText
                style={[
                    styles.errorText,
                    { opacity: error ? 1 : 0 },
                ]}
            >
                {errorDescription}
            </PrimaryFontText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 16,
        marginBottom: 3,
        marginTop: 3
    },
    errorText: {
        color: 'red',
        fontSize: 14,
    },
});

export default FormErrorText;
