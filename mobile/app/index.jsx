import React from "react";
import {
  SafeAreaView,View,Image,Text,Pressable,StyleSheet,Dimensions,
} from "react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

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
        <Text style={styles.prompt}>
          How do you prefer to use this application
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonLower,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/customer")}
          android_ripple={{ color: "#ddd" }}
        >
          <Text style={[styles.buttonText, { color: "#057474" }]}>Customer</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonTop,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/owner")}
          android_ripple={{ color: "#ddd" }}
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
  },
  headerImage: {
    width: "100%",
    height: height * 0.22, // 25% of screen height
  },
  middle: {
    alignItems: "center",
    marginTop: height * 0.13, // 5% of screen height
  },
  logo: {
    width: width * 0.3, // 30% of screen width
    height: width * 0.3,
    marginBottom: height * 0.08,
  },
  bottom: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: height * 0.12, // 8% of screen height
    gap: 12,
  },
  prompt: {
    color: "black",
    fontSize: width * 0.035, // scalable text
    marginBottom: 10,
  },
  button: {
    width: width * 0.8, // 80% of screen width
    paddingVertical: height * 0.018,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#057474",
  },
  buttonLower: {
    backgroundColor: "#FFFFFF",
  },
  buttonTop: {
    backgroundColor: "#057474",
  },
  buttonText: {
    color: "#fff",
    fontSize: width * 0.04,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
