import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { PrimaryFontText } from "@/components/PrimaryFontText";
import { Feather } from "@expo/vector-icons";

interface RadioOptionProps {
  selected: boolean;
  onToggle: (newValue: boolean) => void;
}

export default function RadioOption({ selected, onToggle }: RadioOptionProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onToggle(!selected)} activeOpacity={0.7}>
      <View
        style={[styles.radioBox, selected && styles.radioSelected]}
      >
        {selected && <Feather name="check" size={14} color="#fff" />}
      </View>

      <PrimaryFontText style={styles.label}>Send OTP via SMS</PrimaryFontText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  radioBox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#00C48F",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#f8f8f8",
  },
  radioSelected: {
    backgroundColor: "#00C48F",
    borderColor: "#00C48F",
  },
  label: {
    color: "grey",
    fontSize: 16,
  },
});
