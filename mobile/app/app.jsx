import React from "react";
import {
  SafeAreaView,View,Image,Text,Pressable,StyleSheet,Dimensions,Platform,
} from "react-native";
import { useRouter } from "expo-router";

const { width: WINDOW_WIDTH } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <Image
        source={require("../assets/images/header.png")}
        style={styles.headerImage}
        resizeMode="cover"
        accessible
        accessibilityLabel="Top banner"
      />

      <View style={styles.middle}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
          accessible
          accessibilityLabel="App logo"
        />
      </View>

      <View style={styles.bottom}>
        <Text style={{ color: "black", fontSize: 13, marginBottom: 10 }}>How do you prefer to use this application</Text>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonLower,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/customer")}
          android_ripple={{ color: "#ddd" }}
          accessibilityRole="button"
          accessibilityLabel="Continue as Customer"
        >
          <Text style={[styles.buttonText, {color: "#057474"}]}>Customer</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonTop,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/owner")}
          android_ripple={{ color: "#ddd" }}
          accessibilityRole="button"
          accessibilityLabel="Continue as Owner"
        >
          <Text style={styles.buttonText}>Owner</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "space-between",
  },
  headerImage: {
    width: "100%",
    height: Math.round(WINDOW_WIDTH * 0.45),
  },
  middle: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 100,
  },
  bottom: {
  marginBottom: 100,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-end",
  paddingBottom: 32,
  marginBottom: 220,   
  gap: 12,

  },
  button: {
    width: 300,
    paddingVertical: 14,
    paddingHorizontal: 32, 
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    gap: 2-0,
    borderWidth: 1,        
    borderColor: "#057474"
  },

  buttonLower: {
    backgroundColor: "#FFFFFF",
  },
  buttonTop: {
    backgroundColor: "#057474",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
