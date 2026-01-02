import React, { useState, useEffect, useRef } from "react";
import {
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
  Modal,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerPushToken } from "./utils/registerPushToken";
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const { width, height } = Dimensions.get("window");

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pushToken, setPushToken] = useState("");
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    async function setupPush() {
      const token = await registerPushToken();
      if (token) {
        setPushToken(token);
        setPlatform(Platform.OS);
      }
    }
    setupPush();
  }, []);

  // animated value for moving the whole screen up/down
  const translateY = useRef(new Animated.Value(0)).current;

  // derived animated value for logo scale (smaller when moved up)
  const logoScale = translateY.interpolate({
    inputRange: [-height, 0],
    outputRange: [0.75, 1],
    extrapolate: "clamp",
  });

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onKeyboardShow = (e) => {
      const kbHeight = e?.endCoordinates?.height ?? 300;
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
        {
          email,
          password,
          pushToken,
          platform: Platform.OS,
        }
      );

      if (response.data.success) {
        const { token, user } = response.data;
        const userData = {
          id: user.id,
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          email: user.emailAddress,
          phone: user.phoneNumber,
          birthday: user.birthday,
          gender: user.gender,
          houseNumber: user.houseNumber,
          street: user.street,
          barangay: user.barangay,
          town: user.town,
          province: user.province,
          country: user.country,
          zipCode: user.zipCode,
          role: user.role,
        };

        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify(userData));

        // await Notifications.scheduleNotificationAsync({
        //   content: {
        //     title: "Login Successful",
        //     body: `Welcome back, ${user.firstName}!`,
        //     data: { userId: user.id },
        //   },
        //   trigger: null,
        // });

        router.push("customer/home");
      } else {
        Alert.alert("Error", response.data.error || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 403) {
        setShowVerificationModal(true);
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.error || "Something went wrong."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" />
      
      <Animated.View style={[styles.animatedWrap, { transform: [{ translateY }] }]}>
        {/* Header wrapper */}
        <View style={styles.headerWrapper}>
          <Image
            source={require("../assets/images/header.png")}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <Pressable
            onPress={() => router.push("/")}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </Pressable>
          <Text style={styles.loginText}>Login</Text>
        </View>

        {/* Logo (Animated scale) */}
        <View style={styles.middle}>
          <Animated.Image
            source={require("../assets/images/logo.png")}
            style={[styles.logo, { transform: [{ scale: logoScale }] }]}
            resizeMode="contain"
          />
        </View>

        {/* Form container */}
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={hidden}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setHidden(!hidden)} style={styles.eyeIcon}>
              <Ionicons
                name={hidden ? "eye-off" : "eye"}
                size={24}
                color="#666"
              />
            </Pressable>
          </View>

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

            <Pressable onPress={() => router.push("/reset_pass")}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Logging in..." : "Login"}
            </Text>
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
        </ScrollView>
      </Animated.View>

      {/* Verification Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showVerificationModal}
        onRequestClose={() => setShowVerificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Account Not Verified</Text>
              <Text style={styles.modalMessage}>
                Your account is not yet verified. Please wait for the approval.
                Thank you for your patience.
              </Text>
            </View>
            <Pressable
              style={styles.modalButton}
              onPress={() => setShowVerificationModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff"
  },
  animatedWrap: {
    flex: 1,
    minHeight: height
  },
  headerWrapper: {
    width: "100%",
    height: height * 0.22,
    position: "relative"
  },
  headerImage: {
    width: "100%",
    height: "100%"
  },
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
  middle: {
    alignItems: "center",
    marginTop: height * 0.02
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    marginBottom: height * 0.04,
  },
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingBottom: height * 0.06,
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
  inputPassword: {
    flex: 1,
    fontSize: 16,
    color: "#000"
  },
  eyeIcon: {
    marginLeft: 10
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
    alignItems: "center"
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "black",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "black"
  },
  checkboxText: {
    fontSize: width * 0.035,
    color: "#000"
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 12
  },
  forgotText: {
    fontSize: width * 0.035,
    color: "black"
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
    fontSize: width * 0.045,
    fontWeight: "600"
  },
  buttonPressed: {
    opacity: 0.85
  },
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
  termsLink: {
    fontSize: width * 0.035,
    color: "#000",
    fontWeight: "700"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.85,
    maxWidth: 400,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: width * 0.055,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: width * 0.04,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: "#057474",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    minWidth: 100,
  },
  modalButtonText: {
    color: "white",
    fontSize: width * 0.042,
    fontWeight: "600",
    textAlign: "center",
  },
});