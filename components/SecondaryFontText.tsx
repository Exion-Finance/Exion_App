import { Text as DefaultText, TextProps as DefaultTextProps } from 'react-native';

type TextProps = DefaultTextProps

export function SecondaryFontText(props: TextProps) {
    const { style, ...otherProps } = props;
    return <DefaultText style={[style, { fontFamily: 'SpaceGrotesk' }]} {...otherProps} />;
}