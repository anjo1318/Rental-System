import React, { useState } from "react";
import {View,
  Image,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from "axios"; 
import { Alert } from "react-native";

const { width, height } = Dimensions.get("window");

export default function AddressInfo() {
  const router = useRouter();
  const { customerId } = useLocalSearchParams();


  const [houseBuilding, setHouseBuilding] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [town, setTown] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");

  // track focus
  const [focusField, setFocusField] = useState("");

  // 👇 add API URL
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  console.log("API_URL:", API_URL);


  const handleNext = async () => {
    if (!houseBuilding || !street || !barangay || !town || !province || !country || !zipCode) {
      Alert.alert("Missing Info", "Please fill in all required fields.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/customer/sign-up/address`, {
        customerId, // now correctly populated
        houseNumber: houseBuilding,
        street,
        barangay,
        town,
        province,
        country,
        zipCode,
      });


      if (res.data.success) {
        Alert.alert("Success", "Address saved!");
        router.push({
          pathname: "/signup/id_upload",
          params: { customerId: res.data.customerId },  // returned from backend
        });

      } else {
        Alert.alert("Error", res.data.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.message || "Server error");
    }
  };


  const isTextMode = (fieldName, value) => {
    const hasValue = value !== null && value !== "" && value !== undefined;
    return focusField === fieldName || hasValue;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#057474" />
      <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: height * 0.2 }}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
          enableAutomaticScroll={true} // scrolls input into view automatically
        >
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
          <Text style={styles.stepText}>Step 2</Text>
          <Text style={styles.personalText}>Address</Text>
        </View>

        <View style={styles.photoContainer}>
          <Image
            source={require("../../assets/images/address.png")}
            style={styles.photoImage}
            resizeMode="contain"
          />
          <Text style={styles.subText}>All Fields with * are required</Text>
        </View>

        <View style={styles.container}>
          {/* House No./Building No. */}
          <TextInput
            style={[
              styles.input,
              !isTextMode("houseBuilding", houseBuilding) && styles.placeholderInput,
            ]}
            placeholder={
              !isTextMode("houseBuilding", houseBuilding)
                ? "House No./Building No. *"
                : ""
            }
            placeholderTextColor="#888"
            value={houseBuilding}
            onChangeText={setHouseBuilding}
            autoCapitalize="sentences"
            keyboardType="default"
            onFocus={() => setFocusField("houseBuilding")}
            onBlur={() => setFocusField("")}
          />

          {/* Street */}
          <TextInput
            style={[
              styles.input,
              !isTextMode("street", street) && styles.placeholderInput,
            ]}
            placeholder={!isTextMode("street", street) ? "Street *" : ""}
            placeholderTextColor="#888"
            value={street}
            onChangeText={setStreet}
            autoCapitalize="sentences"
            onFocus={() => setFocusField("street")}
            onBlur={() => setFocusField("")}
          />

          {/* Barangay */}
          <TextInput
            style={[
              styles.input,
              !isTextMode("barangay", barangay) && styles.placeholderInput,
            ]}
            placeholder={!isTextMode("barangay", barangay) ? "Barangay *" : ""}
            placeholderTextColor="#888"
            value={barangay}
            onChangeText={setBarangay}
            autoCapitalize="sentences"
            onFocus={() => setFocusField("barangay")}
            onBlur={() => setFocusField("")}
          />

          {/* Town */}
          <TextInput
            style={[
              styles.input,
              !isTextMode("town", town) && styles.placeholderInput,
            ]}
            placeholder={!isTextMode("town", town) ? "Town *" : ""}
            placeholderTextColor="#888"
            value={town}
            onChangeText={setTown}
            autoCapitalize="sentences"
            onFocus={() => setFocusField("town")}
            onBlur={() => setFocusField("")}
          />

          {/* Province */}
          <TextInput
            style={[
              styles.input,
              !isTextMode("province", province) && styles.placeholderInput,
            ]}
            placeholder={!isTextMode("province", province) ? "Province *" : ""}
            placeholderTextColor="#888"
            value={province}
            onChangeText={setProvince}
            autoCapitalize="sentences"
            onFocus={() => setFocusField("province")}
            onBlur={() => setFocusField("")}
          />

          {/* Country */}
          <TextInput
            style={[
              styles.input,
              !isTextMode("country", country) && styles.placeholderInput,
            ]}
            placeholder={!isTextMode("country", country) ? "Country *" : ""}
            placeholderTextColor="#888"
            value={country}
            onChangeText={setCountry}
            autoCapitalize="sentences"
            onFocus={() => setFocusField("country")}
            onBlur={() => setFocusField("")}
          />

          {/* Zip Code */}
          <TextInput
            style={[
              styles.input,
              !isTextMode("zipCode", zipCode) && styles.placeholderInput,
            ]}
            placeholder={!isTextMode("zipCode", zipCode) ? "Zip Code *" : ""}
            placeholderTextColor="#888"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="numeric"
            onFocus={() => setFocusField("zipCode")}
            onBlur={() => setFocusField("")}
          />

          {/* Next Button */}
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>


          {/* Previous Button */}
          <Pressable
            style={({ pressed }) => [styles.previous, pressed && styles.previousPressed]}
            onPress={() => router.push("/signup/person_info")}
          >
            <Text style={styles.previousText}>Previous</Text>
          </Pressable>
          </View>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const inputFontSize = width * 0.04;
const inputPaddingVertical = height * 0.015;
const lockedHeight = inputPaddingVertical * 2 + inputFontSize + 10;

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
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    marginTop: height * 0.07,
  },
  input: {
    width: "100%",
    height: lockedHeight,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 15,
    fontSize: inputFontSize,
    color: "#000",
    borderColor: "#057474",
    backgroundColor: "#FFF6F6",
    textAlign: "left",
    textAlignVertical: "center", // keep text vertically centered
    includeFontPadding: false,
  },
  placeholderInput: {
    fontSize: inputFontSize * 0.8,
    textAlignVertical: "top",
    transform: [{ translateY: -2 }],
  },
  button: {
    width: "100%",
    backgroundColor: "#057474",
    paddingVertical: height * 0.018,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 11,
  },
  buttonText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  previous: {
    width: "100%",
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
