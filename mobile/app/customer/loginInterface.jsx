import React, { useEffect } from "react";
import {
  View,
  Image,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function LoginInterface() {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = React.useState(true);

  useEffect(() => {
    // Check on mount for ANY pathname
    checkUserAndRoute();
  }, []);

  const checkUserAndRoute = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        console.log('✅ User found in LoginInterface:', user);
        
        // Route based on user role - use replace to prevent back navigation
        if (user.role === 'customer') {
          console.log('🔄 Routing customer to customer/home...');
          // Check if not already on customer home to avoid loop
          if (pathname !== '/customer/home') {
            router.replace('/customer/home');
          }
        } else if (user.role === 'owner') {
          console.log('🔄 Routing owner to owner/ownerHome...');
          // Check if not already on owner home to avoid loop
          if (pathname !== '/owner/ownerHome') {
            router.replace('/owner/ownerHome');
          }
        } else {
          // Unknown role, stay on this page
          console.log('⚠️ Unknown user role:', user.role);
          setIsChecking(false);
        }
      } else {
        // No user data, show login interface
        console.log('ℹ️ No user data found, showing login options');
        setIsChecking(false);
      }
    } catch (error) {
      console.error('❌ Error checking user data:', error);
      setIsChecking(false);
    }
  };

  // Show loading indicator while checking
  if (isChecking) {
    return (
      <View style={[styles.safe, styles.centerContent]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#007F7F"
          translucent={false}
        />
        <ActivityIndicator size="large" color="#057474" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#007F7F"
        translucent={false}
      />
      <View style={styles.safe}>
        <Image
          source={require("../../assets/images/header.png")}
          style={styles.headerImage}
          resizeMode="cover"
          accessible
          accessibilityLabel="Top banner"
        />
        
        <View style={styles.middle}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
            accessible
            accessibilityLabel="App logo"
          />
        </View>
        
        <View style={styles.bottom}>
          <Pressable onPress={() => router.push('/first')}>
            <Text style={styles.prompt}>
              How do you prefer to use this application
            </Text>
          </Pressable>
          
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
    backgroundColor: "#ffffff",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#057474",
    fontWeight: "500",
  },
  headerImage: {
    width: "100%",
    height: height * 0.22,
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