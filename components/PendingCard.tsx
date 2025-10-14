import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { PrimaryFontMedium } from '@/components/PrimaryFontMedium';
// If you prefer an icon package, uncomment below:
// import { Ionicons } from '@expo/vector-icons';

type Props = {
  text?: string;
  dotColor?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function PendingBadge({
  text = 'Pending',
  dotColor = '#F59E0B',
  backgroundColor = '#FFF7ED',
  style,
  textStyle,
}: Props) {
  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />

      {/* Or use an icon instead:
          <Ionicons name="ellipse" size={10} color={dotColor} style={{ marginRight: 8 }} />
      */}

      <PrimaryFontMedium style={[styles.text, textStyle]}>
        {text}
      </PrimaryFontMedium>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    // alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    marginRight: 6,
  },
  text: {
    fontSize: 14,
    color: '#92400E',
  },
});
