import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function RentingPaymentMethod({ bookingData, onBack, onContinue }) {
  const [selectedMethod, setSelectedMethod] = useState(null);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={styles.sectionTitle}>Payment Method</Text>

      {["Cash on Delivery", "Gcash"].map((method) => (
        <TouchableOpacity
          key={method}
          style={[styles.option, selectedMethod === method && styles.optionSelected]}
          onPress={() => setSelectedMethod(method)}
        >
          <Text>{method}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.actions}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
        onPress={() => {
            if (!selectedMethod) return;
            onContinue({ ...bookingData, paymentMethod: selectedMethod });
        }}
        style={styles.continueBtn}
        >
        <Text style={{ color: "#FFF" }}>Continue</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  option: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: "#ccc",
  },
  optionSelected: {
    borderColor: "#057474",
    backgroundColor: "#E0F7F7",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  backBtn: {
    padding: 14,
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
  continueBtn: {
    padding: 14,
    backgroundColor: "#057474",
    borderRadius: 8,
  },
});
