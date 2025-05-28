import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    alignJustifyCenter: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    screenPaddingContainer: {
        paddingLeft: 18,
        width: '100%'
    },
    width100: {
        width: '100%'
    },
    paddingContainer: {
        width: '100%',
        paddingHorizontal: 18
    },
    rowJustifyBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
});

export default styles;