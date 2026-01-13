// components/ScreenWrapper.jsx
import React from "react";
import { SafeAreaView, StyleSheet, View, Platform } from "react-native";

export default function ScreenWrapper({
  children,
  style,
  backgroundColor = "#fff",
}) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.container, { backgroundColor }, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
