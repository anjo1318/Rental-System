  import React, { useState } from "react";
  import {
    SafeAreaView,
    View,
    Image,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Dimensions,
    StatusBar,
  } from "react-native";
  import { useRouter } from "expo-router";
  import { Ionicons } from '@expo/vector-icons';

  const { width, height } = Dimensions.get("window");

  export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#007F7F" />

        {/* Header wrapper */}
        <View style={styles.headerWrapper}>
          <Image
            source={require("../assets/images/header.png")}
            style={styles.headerImage}
            resizeMode="cover"
            accessible
            accessibilityLabel="Top banner"
          />

          {/* Back button */}
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={width * 0.07} color="#fff" />
          </Pressable>

          {/* Login text on header */}
          <Text style={styles.loginText}>Login</Text>
        </View>

        <View style={styles.middle}>
          <Image
            source={require("../assets/images/logo2.png")}
            style={styles.logo}
            resizeMode="contain"
            accessible
            accessibilityLabel="App logo"
          />
        </View>

        <View style={styles.container}>
          <Text style={styles.title}></Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Row: Remember Me + Forgot Password */}
          <View style={styles.row}>
            <Pressable
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>Remember Me</Text>
            </Pressable>

            <Pressable onPress={() => router.push("/forgot-password")}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => router.push("/dashboard")}
          >
            <Text style={styles.buttonText}>Login</Text>
          </Pressable>

          {/* Bottom Sign Up link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Pressable onPress={() => router.push("/signup/person_info")}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: "#fff",
    },
    headerWrapper: {
      width: "100%",
      height: height * 0.22,
      position: "relative", // children can be absolute
    },
    headerImage: {
      width: "100%",
      height: "100%",
    },
    backButton: {
      position: "absolute",
      top: height * 0.04, // 3% from top of header
      left: width * 0.04, // 3% from left
      zIndex: 10,
    },
    loginText: {
      position: "absolute",
      top: height * 0.11, // 8% from top of header
      left: width * 0.12,  // 10% from left
      fontSize: width * 0.07,
      fontWeight: "700",
      color: "#fff",
    },
    middle: {
      alignItems: "center",
      marginTop: height * 0.04,
    },
    logo: {
      width: width * 0.35,
      height: width * 0.35,
      marginBottom: height * 0.08,
    },
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: width * 0.08,
    },
    title: {
      fontSize: width * 0.06,
      fontWeight: "700",
      marginBottom: height * -0.3,
      color: "#057474",
    },
    input: {
      width: "100%",
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 12,
      paddingVertical: height * 0.018,
      paddingHorizontal: 14,
      marginBottom: 15,
      fontSize: width * 0.04,
      color: "#000",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      alignItems: "center",
      marginBottom: 20,
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    checkbox: {
      width: 10,
      height: 10,
      borderWidth: 1,
      borderColor: "black",
      marginRight: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxChecked: {
      backgroundColor: "black",
    },
    checkboxText: {
      fontSize: width * 0.030,
      color: "#000",
    },
    checkmark: {
      color: "#fff",
      fontSize: 9,
      textAlign: "center",
      lineHeight: 7,
    },
    forgotText: {
      fontSize: width * 0.030,
      color: "black",
    },
    button: {
      width: "60%",
      backgroundColor: "#057474",
      paddingVertical: height * 0.015,
      borderRadius: 20,
      alignItems: "center",
      marginTop: 30,
    },
    buttonText: {
      color: "#fff",
      fontSize: width * 0.045,
      fontWeight: "600",
    },
    buttonPressed: {
      opacity: 0.85,
    },
    signupRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
    },
    signupText: {
      fontSize: width * 0.035,
      color: "#000",
    },
    signupLink: {
      fontSize: width * 0.035,
      color: "#000",
      fontWeight: "700",
    }
  });
