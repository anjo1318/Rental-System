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
  ActivityIndicator,
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ✅ Check if user is already logged in
  useEffect(() => {
    checkAuthAndRoute();
  }, []);

  const checkAuthAndRoute = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        console.log('✅ User already logged in, redirecting:', user);
        
        // Route based on user role
        if (user.role === 'customer') {
          router.replace('/customer/home');
        } else if (user.role === 'owner') {
          router.replace('/owner/ownerHome');
        } else {
          // Unknown role, stay on login page
          setIsCheckingAuth(false);
        }
      } else {
        // No user data, show login form
        console.log('ℹ️ No user data found, showing login form');
        setIsCheckingAuth(false);
      }
    } catch (error) {
      console.error('❌ Error checking auth:', error);
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    async function setupPush() {
      try {
        const token = await registerPushToken();
        if (token) {
          setPushToken(token);
          console.log('✅ Push token registered:', token);
        }
      } catch (error) {
        console.log('⚠️ Push token registration failed (non-critical):', error);
      }
    }
    
    if (!isCheckingAuth) {
      setupPush();
    }
  }, [isCheckingAuth]);

  const translateY = useRef(new Animated.Value(0)).current;
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Attempting login for:', email);
      console.log('📡 API URL:', process.env.EXPO_PUBLIC_API_URL);

      const loginPayload = {
        email: email.trim().toLowerCase(),
        password: password,
      };

      if (pushToken) {
        loginPayload.pushToken = pushToken;
        loginPayload.platform = Platform.OS;
      }

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/mobile/user-login`,
        loginPayload,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('✅ Login response:', response.data);

      if (response.data.success) {
        const { token, user } = response.data;

        const userData = {
          id: user.id,
          firstName: user.firstName || user.firstname,
          middleName: user.middleName || user.middlename || "",
          lastName: user.lastName || user.lastname,
          email: user.emailAddress || user.email,
          phone: user.phoneNumber || user.phone,
          birthday: user.birthday || "",
          gender: user.gender || "",
          houseNumber: user.houseNumber || user.housenumber || "",
          street: user.street || "",
          barangay: user.barangay || "",
          town: user.town || "",
          province: user.province || "",
          country: user.country || "",
          zipCode: user.zipCode || user.zipcode || "",
          role: user.role,
          address: user.address || "",
          bio: user.bio || null,
          gcashQR: user.gcashQR || "N/A",
          isVerified: user.isVerified || false,
          profileImage: user.profileImage || null,
          loginTime: new Date().toISOString(),
        };

        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        
        console.log('✅ User data saved to AsyncStorage:', userData);

        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Login Successful",
              body: `Welcome back, ${userData.firstName}!`,
              data: { userId: user.id },
            },
            trigger: null,
          });
        } catch (notifError) {
          console.log('⚠️ Notification error (non-critical):', notifError);
        }

        // Navigate based on role using replace to prevent back navigation
        if (userData.role === 'customer') {
          router.replace("/customer/home");
        } else if (userData.role === 'owner') {
          router.replace("/owner/ownerHome");
        } else {
          router.replace("/customer/home");
        }
      } else {
        Alert.alert("Error", response.data.error || "Login failed.");
      }
    } catch (error) {
      console.error("❌ Login error:", error);

      if (error.response) {
        console.error("Server error:", error.response.data);
        
        if (error.response.status === 403) {
          setShowVerificationModal(true);
        } else if (error.response.status === 401) {
          Alert.alert("Error", "Invalid email or password.");
        } else {
          Alert.alert(
            "Login Failed",
            error.response.data?.error || "Please check your credentials and try again."
          );
        }
      } else if (error.request) {
        console.error("Network error - no response:", error.request);
        Alert.alert(
          "Network Error",
          "Cannot connect to server. Please check:\n\n" +
          "1. Your internet connection\n" +
          "2. The server is running\n" +
          "3. API URL is correct\n\n" +
          `API URL: ${process.env.EXPO_PUBLIC_API_URL}`
        );
      } else {
        console.error("Error:", error.message);
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#057474" />
        <ActivityIndicator size="large" color="#057474" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#057474" />
      
      <Animated.View style={[styles.animatedWrap, { transform: [{ translateY }] }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerWrapper}>
            <Animated.Image
              source={require("../assets/images/header.png")}
              style={styles.headerImage}
              resizeMode="cover"
              accessible
              accessibilityLabel="Top banner"
            />
            <Pressable onPress={() => router.push("/")} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </Pressable>
            <Text style={styles.loginText}>Login</Text>
          </View>

          {/* Logo */}
          <View style={styles.middle}>
            <Animated.Image
              source={require("../assets/images/app_logo.png")}
              style={[
                styles.logo,
                { transform: [{ scale: logoScale }] },
              ]}
              resizeMode="contain"
              accessible
              accessibilityLabel="App logo"
            />
          </View>

          {/* Form */}
          <View style={styles.container}>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#999"
            />

            <View style={styles.passwordWrapper}>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={hidden}
                style={styles.inputPassword}
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
              <Pressable onPress={() => setHidden(!hidden)} style={styles.eyeIcon}>
                <Ionicons 
                  name={hidden ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
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

            {/* <View style={styles.termsRow}>
              <Pressable onPress={() => router.push("/terms")}>
                <Text style={styles.termsLink}>Terms</Text>
              </Pressable>
            </View> */}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Verification Modal */}
      <Modal
        visible={showVerificationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVerificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Account Not Verified</Text>
            </View>
            <Text style={styles.modalMessage}>
              Your account is not yet verified. Please wait for the approval.
              Thank you for your patience.
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setShowVerificationModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#057474",
    fontWeight: "500",
  },
  scrollContent: {
    flexGrow: 1,
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
    marginLeft: 10,
    padding: 5,
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
    shadowOffset: { width: 0, height: 2 },
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