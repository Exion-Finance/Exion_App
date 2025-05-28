import { Text as DefaultText, TextProps as DefaultTextProps } from 'react-native';

type TextProps = DefaultTextProps

export function PrimaryFontMedium(props: TextProps) {
    const { style, ...otherProps } = props;
    return <DefaultText style={[style, { fontFamily: 'DMSansMedium' }]} {...otherProps} />;
}