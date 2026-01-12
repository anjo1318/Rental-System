import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function SubHeader({ title }) {
  return (
    <View style={styles.container}>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,          // ✅ full width
    backgroundColor: "#007F7F",
    paddingVertical: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 10, // keeps it on top
    top: 61,
    right: 16,
  },
});

