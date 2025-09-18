import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function ownerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hidden, setHidden] = useState(true);

  // animated value for moving the whole screen up/down
  const translateY = useRef(new Animated.Value(0)).current;

  // derived animated value for logo scale (smaller when moved up)
  const logoScale = translateY.interpolate({
    inputRange: [-height, 0],
    outputRange: [0.75, 1],
    extrapolate: "clamp",
  });

  useEffect(() => {
    // events differ on iOS vs Android for smoother animation
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onKeyboardShow = (e) => {
      // keyboard height from event; fallback to 300 if missing
      const kbHeight = e?.endCoordinates?.height ?? 300;

      // compute how much to shift the whole screen up.
      // use a fraction so screen doesn't go too far. tweak multiplier (0.6) if needed.
      const shift = Math.min(kbHeight * 0.5, height * 0.4);

      Animated.timing(translateY, {
        toValue: -shift,
        duration: Platform.OS === "ios" ? 250 : 200,
        useNativeDriver: true,
      }).start();
    };

    const onKeyboardHide = () => {
      Animated.timing(translateY, {
        toValue: 0,
        duration: Platform.OS === "ios" ? 200 : 180,
        useNativeDriver: true,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [translateY]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/mobile/owner-login`,   
        { email, password }
      );

      if (response.data.success) {
        const { token, user } = response.data;
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify(user));
        router.push("/owner/ownerHome");
      } else {
        Alert.alert("Error", response.data.error || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", error.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#007F7F" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Animated wrapper - moves everything up/down */}
          <Animated.View style={[styles.animatedWrap, { transform: [{ translateY }] }]}>
            {/* Header wrapper */}
            <View style={styles.headerWrapper}>
              <Animated.Image
                // header graphic (keeps in place relative to the wrapper)
                source={require("../../assets/images/header.png")}
                style={styles.headerImage}
                resizeMode="cover"
                accessible
                accessibilityLabel="Top banner"
              />
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={width * 0.07} color="#fff" />
              </Pressable>
              <Text style={styles.loginText}>Owner Login</Text>
            </View>

            {/* Logo (Animated scale) */}
            <View style={styles.middle}>
              <Animated.Image
                source={require("../../assets/images/header.png")}
                style={[
                  styles.logo,
                  { transform: [{ scale: logoScale }] }, // scale down while moving up
                ]}
                resizeMode="contain"
                accessible
                accessibilityLabel="App logo"
              />
            </View>

            {/* Form container */}
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />

              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.inputPassword}
                  placeholder="Password"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={hidden}
                  autoCapitalize="none"
                  returnKeyType="done"
                />
                <Pressable onPress={() => setHidden(!hidden)} style={styles.eyeIcon}>
                  <Ionicons name={hidden ? "eye-off" : "eye"} size={24} color="#888" />
                </Pressable>
              </View>

              <View style={styles.row}>
                <Pressable style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
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
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
              </Pressable>

              <View style={styles.signupRow}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <Pressable onPress={() => router.push("/signup/person_info")}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </Pressable>
              </View>
              
              <View style={styles.termsRow}>
                <Pressable onPress={() => router.push("/terms")}>
                  <Text style={styles.termsLink}>Terms</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  // IMPORTANT: animated wrapper must at least fill the screen so translateY moves everything
  animatedWrap: { flex: 1, minHeight: height },

  headerWrapper: { width: "100%", height: height * 0.22, position: "relative" },
  headerImage: { width: "100%", height: "100%" },
  backButton: {
    position: "absolute",
    top: height * 0.04,
    left: width * 0.04,
    zIndex: 10,
  },
  loginText: {
    position: "absolute",
    top: height * 0.11,
    left: width * 0.12,
    fontSize: width * 0.07,
    fontWeight: "700",
    color: "#fff",
  },

  middle: { alignItems: "center", marginTop: height * 0.02 },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    marginBottom: height * 0.04,
  },

  container: {
    flex: 1,
    justifyContent: "flex-start", // keep inputs nearer to top by default
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingBottom: height * 0.06, // space for bottom row
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#057474",
    borderRadius: 12,
    paddingVertical: height * 0.018,
    backgroundColor: "#FFF6F6",
    paddingHorizontal: 14,
    marginBottom: 15,
    fontSize: width * 0.04,
    color: "#000",
  },

  passwordWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#057474",
    borderRadius: 12,
    backgroundColor: "#FFF6F6",
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 15,
  },

  inputPassword: { flex: 1, fontSize: 16, color: "#000" },
  eyeIcon: { marginLeft: 10 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },

  checkboxContainer: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "black",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "black" },
  checkboxText: { fontSize: width * 0.035, color: "#000" },

  checkmark: { color: "#fff", fontSize: 12, textAlign: "center", lineHeight: 12 },

  forgotText: { fontSize: width * 0.035, color: "black" },

  button: {
    width: "60%",
    backgroundColor: "#057474",
    paddingVertical: height * 0.015,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: width * 0.045, fontWeight: "600" },
  buttonPressed: { opacity: 0.85 },

  signupRow: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 24 
  },
  signupText: { 
    fontSize: width * 0.035, 
    color: "#000" 
  },
  signupLink: { 
    fontSize: width * 0.035, 
    color: "#000", 
    fontWeight: "700",
  },
    termsRow: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 24 
  },
  termsText: { 
    fontSize: width * 0.035, 
    color: "#000" 
  },
  termsLink: { 
    fontSize: width * 0.035, 
    color: "#000", 
    fontWeight: "700" 
  },
});

