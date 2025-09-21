import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Image,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const { width, height } = Dimensions.get("window");

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function PersonalInfo() {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false); // Add loading state for finalization

  const customerId = 1; // ✅ replace with logged-in user ID or pass via params

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/customer/sign-up/progress/${customerId}`
        );
        console.log("📊 Customer data received:", res.data); // Debug log
        setCustomer(res.data.customer);
      } catch (error) {
        console.error("❌ Error fetching customer:", error);
        Alert.alert("Error", "Failed to load customer data");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, []);

  // ✅ ADD THIS - Function to finalize signup
  const handleFinalize = async () => {
    if (!isChecked) {
      Alert.alert("Error", "Please accept the terms and conditions");
      return;
    }

    setFinalizing(true);
    try {
      const response = await axios.post(`${API_URL}/api/customer/sign-up/finalize`, {
        customerId: customerId
      });

      if (response.data.success) {
        Alert.alert("Success", "Signup completed successfully!", [
          {
            text: "OK",
            onPress: () => router.push("/home")
          }
        ]);
      }
    } catch (error) {
      console.error("❌ Error finalizing signup:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to complete signup");
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color="#057474" />
      </SafeAreaView>
    );
  }

  if (!customer) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          No customer data found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#057474" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: height * 0.1 }}
      >
        {/* Header section remains the same */}
        <View style={styles.headerWrapper}>
          <Image
            source={require("../../assets/images/header.png")}
            style={styles.headerImage}
            resizeMode="cover"
            accessible
            accessibilityLabel="Top banner"
          />

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={width * 0.07} color="#fff" />
          </Pressable>

          <Text style={styles.titleText}>Sign up</Text>
        </View>

        <View style={styles.headerTextRow}>
          <Text style={styles.stepText}>Step 4</Text>
          <Text style={styles.personalText}>Review</Text>
        </View>

        <View style={styles.photoContainer}>
          <Image
            source={require("../../assets/images/review.png")}
            style={styles.photoImage}
            resizeMode="contain"
          />
          <Text style={styles.subText}>Check all your provided details</Text>
        </View>

        {/* Personal Info Section */}
        <View style={styles.info}>
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <Text style={styles.infoText}>First Name: {customer.firstName || 'N/A'}</Text>
          <Text style={styles.infoText}>Second Name: {customer.middleName || 'N/A'}</Text>
          <Text style={styles.infoText}>Last Name: {customer.lastName || 'N/A'}</Text>
          <Text style={styles.infoText}>Email Address: {customer.emailAddress || 'N/A'}</Text>
          <Text style={styles.infoText}>Phone Number: {customer.phoneNumber || 'N/A'}</Text>
          <Text style={styles.infoText}>Birthday: {customer.birthday || 'N/A'}</Text>
          <Text style={styles.infoText}>Gender: {customer.gender || 'N/A'}</Text>
          <Text style={styles.infoText}>Password: ******</Text>
          <View style={styles.divider} />
        </View>

        {/* Address Section */}
        <View style={styles.address}>
          <Text style={styles.sectionTitle1}>Address</Text>
          <Text style={styles.addressText}>House No./Building No.: {customer.houseNumber || 'N/A'}</Text>
          <Text style={styles.addressText}>Street: {customer.street || 'N/A'}</Text>
          <Text style={styles.addressText}>Barangay: {customer.barangay || 'N/A'}</Text>
          <Text style={styles.addressText}>Town: {customer.town || 'N/A'}</Text>
          <Text style={styles.addressText}>Province: {customer.province || 'N/A'}</Text>
          <Text style={styles.addressText}>Country: {customer.country || 'N/A'}</Text>
          <Text style={styles.addressText}>Zip Code: {customer.zipCode || 'N/A'}</Text>
          <View style={styles.divider1} />
        </View>

        {/* ID/Guarantor Section */}
        <View style={styles.address}>
          <Text style={styles.sectionTitle1}>ID Upload/Guarantor</Text>

          <Text style={styles.addressText1}>Guarantor 1:</Text>
          <Text style={styles.addressText}>Full Name: {customer.guarantor1FullName || 'N/A'}</Text>
          <Text style={styles.addressText}>Address: {customer.guarantor1Address || 'N/A'}</Text>
          <Text style={styles.addressText}>Mobile Number: {customer.guarantor1MobileNumber || 'N/A'}</Text>

          <Text style={styles.addressText1}>Guarantor 2:</Text>
          <Text style={styles.addressText}>Full Name: {customer.guarantor2FullName || 'N/A'}</Text>
          <Text style={styles.addressText}>Address: {customer.guarantor2Address || 'N/A'}</Text>
          <Text style={styles.addressText}>Mobile Number: {customer.guarantor2MobileNumber || 'N/A'}</Text>
          
          <Text style={styles.addressText1}>ID Upload:</Text>
          <Text style={styles.addressText}>Type of ID: {customer.idType || 'N/A'}</Text>
          <Text style={styles.addressText}>ID Number: {customer.idNumber || 'N/A'}</Text>

          {/* ✅ FIXED IMAGE DISPLAY */}
          {customer.idPhotoUrl ? (
            <View>
              <Text style={styles.imageLabel}>ID Photo:</Text>
              <Image
                source={{ uri: customer.idPhotoUrl }}
                style={styles.uploadedImage}
                resizeMode="contain"
                onError={(error) => console.log("❌ ID photo load error:", error.nativeEvent.error)}
                onLoad={() => console.log("✅ ID photo loaded successfully")}
              />
            </View>
          ) : (
            <Text style={styles.noImageText}>No ID photo uploaded</Text>
          )}

          {customer.selfieUrl ? (
            <View>
              <Text style={styles.imageLabel}>Selfie:</Text>
              <Image
                source={{ uri: customer.selfieUrl }}
                style={styles.uploadedImage}
                resizeMode="contain"
                onError={(error) => console.log("❌ Selfie load error:", error.nativeEvent.error)}
                onLoad={() => console.log("✅ Selfie loaded successfully")}
              />
            </View>
          ) : (
            <Text style={styles.noImageText}>No selfie uploaded</Text>
          )}
        </View>

        {/* Terms Checkbox */}
          <View style={styles.checkboxContainer}>
            <Pressable
              style={[styles.checkbox, isChecked && styles.checkboxChecked]}
              onPress={() => setIsChecked(!isChecked)}
              hitSlop={10}
            >
              {isChecked && (
                <Ionicons name="checkmark" size={width * 0.04} color="#fff" />
              )}
            </Pressable>

            {/* Inline text with nested Text link so it stays on the same line */}
            <View style={styles.checkboxRow}>
              <Text style={styles.checkboxText}>
                I confirm that I have read, understood, and agree to be bound by{" "}
                <Text
                  style={styles.checkboxLink}
                  onPress={() => router.push("/terms")}
                >
                  Terms and Conditions.
                </Text>
              </Text>
            </View>
          </View>

        

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.button, 
              pressed && styles.buttonPressed,
              (!isChecked || finalizing) && styles.buttonDisabled // Disable if not checked or finalizing
            ]}
            onPress={handleFinalize} // ✅ CHANGED: Call handleFinalize instead of router.push
            disabled={!isChecked || finalizing}
          >
            {finalizing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Complete Signup</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.previous, pressed && styles.previousPressed]}
            onPress={() => router.push("/signup/id_upload")}
            disabled={finalizing}
          >
            <Text style={styles.previousText}>Previous</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: height * 0.04,
    left: width * 0.03,
    zIndex: 10,
  },
  titleText: {
    position: "absolute",
    top: height * 0.1,
    left: width * 0.1,
    fontSize: width * 0.07,
    fontWeight: "700",
    color: "#fff",
  },
  headerTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: width * 0.08,
    marginTop: height * 0.01,
  },
  stepText: {
    color: "#000",
    fontSize: width * 0.035,
    fontWeight: "900",
  },
  personalText: {
    color: "#000",
    fontSize: width * 0.035,
    fontWeight: "600",
  },
  photoContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: height * 0.02,
  },
  photoImage: {
    width: "90%",
    height: height * 0.05,
  },
  subText: {
    position: "absolute",
    top: height * 0.08,
    left: width * 0.1,
    fontSize: width * 0.04,
    fontWeight: "200",
    color: "#A95E09",
  },
  info: {
    width: "100%",
    paddingHorizontal: width * 0.08,
    marginTop: height * 0.06,
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: "700",
    color: "#000",
    marginBottom: height * 0.015,
  },
  infoText: {
    fontSize: width * 0.038,
    fontWeight: "400",
    color: "#333",
    marginBottom: height * 0.01,
  },
  divider: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1.5,
    marginTop: height * 0.015,
    borderColor: "#057474",
  },
  address: {
    width: "100%",
    paddingHorizontal: width * 0.08,
    marginTop: height * 0.03
  },
  sectionTitle1: {
    fontSize: width * 0.05,
    fontWeight: "700",
    color: "#000",
    marginBottom: height * 0.02,
  },
  addressText: {
    fontSize: width * 0.038,
    fontWeight: "400",
    color: "#333",
    marginBottom: height * 0.01, 
  },
  addressText1: {
    fontSize: width * 0.042,
    fontWeight: "600",
    color: "#333",
    paddingVertical: height * 0.002,
    marginBottom: 6, 
  },
  divider1: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1.5,
    marginTop: height * 0.015,
    borderColor: "#057474",
  },

  uploadedImage: {
    width: width * 0.6,
    height: height * 0.25,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  imageLabel: {
    fontSize: width * 0.038,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
  },
  noImageText: {
    fontSize: width * 0.035,
    fontStyle: "italic",
    color: "#999",
    paddingVertical: 40,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start", // top-align so checkbox sits next to first line of multi-line text
    marginTop: height * 0.2,  // adjust as needed
    paddingHorizontal: width * 0.04,

  },
  checkbox: {
    width: width * 0.045,
    height: width * 0.045,
    borderWidth: 1.5,
    borderColor: "#057474",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: width * 0.03,
    backgroundColor: "#FFF",
    marginTop: 5,
  },
  checkboxChecked: {
    backgroundColor: "#057474",
  },
  checkboxRow: {
    flex: 1,             // use remaining width
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginTop: 0,        // optional: remove extra gap
  },

  checkboxText: {
    fontSize: width * 0.030,
    color: "#333",
    flexShrink: 1,
  },

  checkboxLink: {
    fontSize: width * 0.030,
    color: "#000",
    fontWeight: "700",
  },
  button: {
    width: "85%",
    backgroundColor: "#057474",
    paddingVertical: height * 0.018,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 11,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonContainer: {
    alignItems: "center",   
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  // ✅ NEW STYLE FOR DISABLED BUTTON
  buttonDisabled: {
    opacity: 0.5,
  },
  previous: {
    width: "85%",
    backgroundColor: "#FFF",
    paddingVertical: height * 0.018,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 11,
    borderWidth: 1,
    borderColor: "#057474",
  },
  previousText: {
    color: "#057474",
    fontSize: width * 0.045,
    fontWeight: "600",
  },
  previousPressed: {
    opacity: 0.85,
  },
});