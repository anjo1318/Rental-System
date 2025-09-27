import React, { useState, useEffect, useRef } from "react";
import {View,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function ResetPass() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/mobile/user-login`,
        { email, password }
      );

      if (response.data.success) {
        const { token, user } = response.data;
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify(user));
        router.push("/home");
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
                source={require("../assets/images/header.png")}
                style={styles.headerImage}
                resizeMode="cover"
                accessible
                accessibilityLabel="Top banner"
              />
            </View>

             <View>
               <Text style={styles.sectionTitle}>Reset your Password</Text>
                <Text style={styles.subText}>
                  Enter your email address to reset your password. We'll send you a link to reset your password. Just enter your email below.
                </Text>
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

              <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? "Logging in..." : "Continue"}</Text>
              </Pressable>

              <View style={styles.returnLoginRow}>
                <Pressable onPress={() => router.push("/login")}>
                  <Text style={styles.returnLink}>Return to Login</Text>
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
  safe: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },

  // IMPORTANT: animated wrapper must at least fill the screen so translateY moves everything
  animatedWrap: { flex: 1, minHeight: height },

  headerWrapper: { 
    width: "100%", 
    height: height * 0.22, 
    position: "relative" 
  },
  headerImage: { 
    width: "100%", 
    height: "100%" 
  },
  sectionTitle: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: 22,
    marginTop: 100,
  },
  subText: {
    width: "80%",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 12,
    marginLeft: 30,
    paddingVertical: 7,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start", // keep inputs nearer to top by default
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingBottom: height * 0.06, // space for bottom row
    marginTop: height * 0.03  , 
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

  button: {
    width: "60%",
    backgroundColor: "#057474",
    paddingVertical: height * 0.015,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { 
    color: "#fff", 
    fontSize: width * 0.040, 
    fontWeight: "600" 
  },
  buttonPressed: { 
    opacity: 0.85 
  },

  returnLoginRow: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 15,
  },
  returnLink: { 
    fontSize: width * 0.035, 
    color: "#7B7878",
    
  },
});

