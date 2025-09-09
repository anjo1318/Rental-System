import React, { useState } from "react";
import {SafeAreaView,View,Image,Text,TextInput,Pressable,StyleSheet,Dimensions,StatusBar,ScrollView,} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function PersonalInfo() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [iD, setID] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [photoId, setPhotoId] = useState("");
  const [selfie, setSelfie] = useState("");
  const [focusField, setFocusField] = useState("");
  const isTextMode = (fieldName, value) => {
    const hasValue = value !== null && value !== "" && value !== undefined;
    return focusField === fieldName || hasValue;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#057474" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: height * 0.1 }}>
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
          <Text style={styles.stepText}>Step 3</Text>
          <Text style={styles.personalText}>ID Upload/Guarantor</Text>
        </View>

        <View style={styles.photoContainer}>
          <Image
            source={require("../../assets/images/id_upload.png")}
            style={styles.photoImage}
            resizeMode="contain"
          />
          <Text style={styles.subText}>All Fields with * are required</Text>
          <Text style={styles.sub1Text}>Guarantor 1</Text>
          <Text style={styles.sub2Text}>
            People that can be contacted if renter is unavailable.
          </Text>
        </View>

        <View style={styles.container}>
          <TextInput
            style={[
              styles.input,
              !isTextMode("fullName", fullName) && styles.placeholderInput,
            ]}
            placeholder={
              !isTextMode("fullName", fullName)
                ? "Full Name *"
                : ""
            }
            placeholderTextColor="#888"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="sentences"
            keyboardType="default"
            onFocus={() => setFocusField("fullName")}
            onBlur={() => setFocusField("")}
          />

          <TextInput
            style={[
              styles.input,
              !isTextMode("address", address) && styles.placeholderInput,
            ]}
            placeholder={!isTextMode("address", address) ? "Address *" : ""}
            placeholderTextColor="#888"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="sentences"
            onFocus={() => setFocusField("address")}
            onBlur={() => setFocusField("")}
          />

          <TextInput
            style={[
              styles.input,
              !isTextMode("mobileNumber",mobileNumber) && styles.placeholderInput,
            ]}
            placeholder={!isTextMode("mobileNumber", mobileNumber) ? "Mobile Number *" : ""}
            placeholderTextColor="#888"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            autoCapitalize="phone-pad"
            onFocus={() => setFocusField("phoneNumber")}
            onBlur={() => setFocusField("")}
          />

          <Text style={styles.sub3Text}>Guarantor 2</Text>
          <Text style={styles.sub4Text}>
            People that can be contacted if renter is unavailable.
          </Text>
          
          <TextInput
            style={[
              styles.input,
              !isTextMode("fullName", fullName) && styles.placeholderInput,
            ]}
            placeholder={
              !isTextMode("fullName", fullName)
                ? "Full Name *"
                : ""
            }
            placeholderTextColor="#888"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="sentences"
            keyboardType="default"
            onFocus={() => setFocusField("fullName")}
            onBlur={() => setFocusField("")}
          />

          <TextInput
            style={[
              styles.input,
              !isTextMode("address", address) && styles.placeholderInput,
            ]}
            placeholder={!isTextMode("address", address) ? "Address *" : ""}
            placeholderTextColor="#888"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="sentences"
            onFocus={() => setFocusField("address")}
            onBlur={() => setFocusField("")}
          />

          <TextInput
            style={[
              styles.input,
              !isTextMode("mobileNumber",mobileNumber) && styles.placeholderInput,
            ]}
            placeholder={!isTextMode("mobileNumber", mobileNumber) ? "Mobile Number *" : ""}
            placeholderTextColor="#888"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            autoCapitalize="phone-pad"
            onFocus={() => setFocusField("phoneNumber")}
            onBlur={() => setFocusField("")}
          />


          <Text style={styles.sub5Text}>ID Verification</Text>
          <Text style={styles.sub6Text}>
            Only JPEG, JPG and PNG files with max size of 4mb.
          </Text>

          <TextInput
            style={[
              styles.input,
              !isTextMode("address", address) && styles.placeholderInput,
            ]}
            placeholder={!isTextMode("address", address) ? "Address *" : ""}
            placeholderTextColor="#888"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="sentences"
            onFocus={() => setFocusField("address")}
            onBlur={() => setFocusField("")}
          />
          
          
          


          {/* Next Button */}
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => router.push("/signup/address")}
          >
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>

          {/* Previous Button */}
          <Pressable
            style={({ pressed }) => [styles.previous, pressed && styles.previousPressed]}
            onPress={() => router.push("/signup/review")}
          >
            <Text style={styles.previousText}>Previous</Text>
          </Pressable>
        </View>
      </ScrollView>
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
  sub1Text: {
    position: "absolute",
    top: height * 0.13,
    left: width * 0.06,
    fontSize: width * 0.04,
    fontWeight: "600",
    color: "#000",
  },
  sub2Text: {
    position: "absolute",
    top: height * 0.16,
    left: width * 0.06,
    fontSize: width * 0.03,
    fontWeight: "200",
    color: "#000",
  },
   sub3Text: {
    right: width * 0.34,
    fontSize: width * 0.04,
    fontWeight: "600",
    color: "#000",
    marginBottom: height * 0.008,
  },
  sub4Text: {
    right: width * 0.105,
    fontSize: width * 0.03,
    fontWeight: "200",
    color: "#000",
    marginBottom: height * 0.02,
    
  },
  sub5Text: {
    right: width * 0.310,
    fontSize: width * 0.04,
    fontWeight: "600",
    color: "#000",
    marginBottom: height * 0.008,
  },
  sub6Text: {
    right: width * 0.097,
    fontSize: width * 0.03,
    fontWeight: "200",
    color: "#000",
    marginBottom: height * 0.02,
    
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    marginTop: height * 0.13,
    
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
    textAlignVertical: "center",
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
