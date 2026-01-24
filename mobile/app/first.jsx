import React from "react";
import {View,Image,Text,Pressable,StyleSheet,Dimensions,StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";


const { width, height } = Dimensions.get("window");

export default function LoginInterface() {
  const router = useRouter();

  return (
    <>
      {/* Status bar settings */}
      <StatusBar
        barStyle="light-content"        // White icons/text
        backgroundColor="#007F7F"       // Android status bar color
        translucent={false}             // Keep layout unaffected
      />

      <View style={styles.safe}>
        {/* Header image */}
        <View style={styles.headerContainer}>
        <Image
          source={require("../assets/images/header.png")}
          style={styles.headerImage}
          resizeMode="cover"
          accessible
          accessibilityLabel="Top banner"
        />
        {/* Back Button */}
  <Pressable
    style={styles.backButton}
    onPress={() => router.back()}
    hitSlop={10}
  >
    <MaterialIcons name="arrow-back-ios" size={22} color="#fff" />
  </Pressable>
      </View>
        {/* Logo section */}
        <View style={styles.middle}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
            accessible
            accessibilityLabel="App logo"
          />
        </View>

        {/* Buttons section */}
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
            onPress={() => router.push("/login")}
            android_ripple={{ color: "#ddd" }}
          >
            <Text style={[styles.buttonText, { color: "#057474" }]}>
              Customer
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.buttonTop,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push("/owner/ownerLogin")}
            android_ripple={{ color: "#ddd" }}
          >
            <Text style={styles.buttonText}>Owner</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerImage: {
    width: "100%",
    height: height * 0.22,
  },
  headerContainer: {
  width: "100%",
  height: height * 0.22,
},

backButton: {
  position: "absolute",
  left: 16,
  top: StatusBar.currentHeight
    ? StatusBar.currentHeight + 10
    : 40,
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: "center",
  alignItems: "center",
},

  middle: {
    alignItems: "center",
    marginTop: height * 0.13,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: height * 0.08,
  },
  bottom: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: height * 0.12,
    gap: 12,
  },
  prompt: {
    color: "black",
    fontSize: width * 0.035,
    marginBottom: 10,
  },
  button: {
    width: width * 0.8,
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