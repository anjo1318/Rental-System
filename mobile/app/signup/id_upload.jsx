import React, { useState } from "react";
import {View,Image,Text,TextInput,Pressable,StyleSheet,Dimensions,StatusBar,KeyboardAvoidingView,Platform,} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";   // 👈 make sure axios is imported
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width, height } = Dimensions.get("window");

export default function IdUpload() {
  const router = useRouter();
  const { customerId } = useLocalSearchParams(); // 👈 get from Step 2

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [fullName1, setFullName1] = useState("");
  const [address1, setAddress1] = useState("");
  const [mobileNumber1, setMobileNumber1] = useState("");
  const [idNumber, setIdNumber] = useState("")
  const [photoId, setPhotoId] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [idType, setIdType] = useState("");
  const [focusField, setFocusField] = useState("");

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  

  const isTextMode = (fieldName, value) => {
    const hasValue = value !== null && value !== "" && value !== undefined;
    return focusField === fieldName || hasValue;
  };

  // Pick image from gallery
  const pickIdPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return alert("Permission denied!");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) setPhotoId(result.assets[0].uri);
  };

  // Take selfie using camera
  const takeSelfie = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) return alert("Permission denied!");
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) setSelfie(result.assets[0].uri);
  };

  const handleNext = async () => {

  };



  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#057474" />
      <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              >
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: height * 0.05 }}
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
          {/* Full Name */}
          <TextInput
            style={[styles.input, !isTextMode("fullName", fullName) && styles.placeholderInput]}
            placeholder={!isTextMode("fullName", fullName) ? "Full Name *" : ""}
            placeholderTextColor="#888"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="sentences"
            keyboardType="default"
            onFocus={() => setFocusField("fullName")}
            onBlur={() => setFocusField("")}
          />

          {/* Address */}
          <TextInput
            style={[styles.input, !isTextMode("address", address) && styles.placeholderInput]}
            placeholder={!isTextMode("address", address) ? "Address *" : ""}
            placeholderTextColor="#888"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="sentences"
            onFocus={() => setFocusField("address")}
            onBlur={() => setFocusField("")}
          />

          {/* Mobile Number */}
          <TextInput
            style={[styles.input, !isTextMode("mobileNumber", mobileNumber) && styles.placeholderInput]}
            placeholder={!isTextMode("mobileNumber", mobileNumber) ? "Mobile Number *" : ""}
            placeholderTextColor="#888"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            autoCapitalize="none"
            onFocus={() => setFocusField("mobileNumber")}
            onBlur={() => setFocusField("")}
          />

          {/* Guarantor 2 */}
          <Text style={styles.sub3Text}>Guarantor 2</Text>
          <Text style={styles.sub4Text}>
            People that can be contacted if renter is unavailable.
          </Text>

          <TextInput
            style={[styles.input, !isTextMode("fullName1", fullName1) && styles.placeholderInput]}
            placeholder={!isTextMode("fullName1", fullName1) ? "Full Name *" : ""}
            placeholderTextColor="#888"
            value={fullName1}
            onChangeText={setFullName1}
            autoCapitalize="sentences"
            keyboardType="default"
            onFocus={() => setFocusField("fullName1")}
            onBlur={() => setFocusField("")}
          />

          <TextInput
            style={[styles.input, !isTextMode("address1", address1) && styles.placeholderInput]}
            placeholder={!isTextMode("address1", address1) ? "Address *" : ""}
            placeholderTextColor="#888"
            value={address1}
            onChangeText={setAddress1}
            autoCapitalize="sentences"
            onFocus={() => setFocusField("address1")}
            onBlur={() => setFocusField("")}
          />

          <TextInput
            style={[styles.input, !isTextMode("mobileNumber1", mobileNumber1) && styles.placeholderInput]}
            placeholder={!isTextMode("mobileNumber1", mobileNumber1) ? "Mobile Number *" : ""}
            placeholderTextColor="#888"
            value={mobileNumber1}
            onChangeText={setMobileNumber1}
            keyboardType="phone-pad"
            autoCapitalize="none"
            onFocus={() => setFocusField("mobileNumber1")}
            onBlur={() => setFocusField("")}
          />

          {/* ID Verification Section */}
          <Text style={styles.sub5Text}>ID Verification</Text>
          <Text style={styles.sub6Text}>
            Only JPE, JPG and PNG files with max size of 4mb.
          </Text>

         <View style={styles.pickerContainer}>
            {/* Overlay placeholder text */}
            {!idType && (
              <Text style={styles.pickerOverlayText}>
                Select Type of ID *
              </Text>
            )}

            <Picker
              selectedValue={idType}
              onValueChange={(itemValue) => setIdType(itemValue)}
              style={{ color: idType ? "#000" : "transparent", width: "100%" }}
            >
              <Picker.Item label="Select Type of ID " value="" color="#888" /> 
              <Picker.Item label="Driver's ID" value="drivers" />
              <Picker.Item label="Postal ID" value="postal" />
              <Picker.Item label="SSS ID" value="sss" />
              <Picker.Item label="PhilHealth ID" value="philhealth" />
              <Picker.Item label="National ID" value="national" />
            </Picker>
          </View>



          <TextInput
            style={[styles.input, !isTextMode("idNumber", idNumber) && styles.placeholderInput]}
            placeholder={!isTextMode("idNumber", idNumber) ? "Id Number *" : ""}
            placeholderTextColor="#888"
            value={idNumber}
            onChangeText={setIdNumber}
            keyboardType="default"
            autoCapitalize="none"
            onFocus={() => setFocusField("idNumber")}
            onBlur={() => setFocusField("")}
          />


          {/* Photo of valid ID */}
          <Pressable style={styles.uploadBox} onPress={pickIdPhoto}>
            <Text style={styles.uploadText}>
              {photoId ? photoId.split("/").pop() : "Photo of Your Valid ID *"}
            </Text>
            <Image
              source={require("../../assets/images/upload.png")}
              style={styles.iconRight}
              resizeMode="contain"
            />
          </Pressable>

          {/* Selfie */}
          <Pressable style={styles.uploadBox} onPress={takeSelfie}>
            <Text style={styles.uploadText}>
              {selfie ? selfie.split("/").pop() : "Selfie *"}
            </Text>
            <Image
              source={require("../../assets/images/camera.png")}
              style={styles.iconRight}
              resizeMode="contain"
            />
          </Pressable>


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
            onPress={() => router.push("/signup/address")}
          >
            <Text style={styles.previousText}>Previous</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
    </View>
  );
}

// Styles (untouched except adding uploadBox and uploadText)
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
    marginBottom: 16,
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
  pickerContainer: { 
    width: "100%",
    height: lockedHeight,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#057474",
    backgroundColor: "#FFF6F6",
    justifyContent: "center",
    marginBottom: 17,
  },

pickerOverlayText: {
  position: "absolute",
  top: 9,
  left: 14,
  fontSize: width * 0.03, // 👈 you control font size here
  color: "#888",
  zIndex: 2,
},

  uploadBox: {
  width: "100%",
  minHeight: lockedHeight, // ensures minimum size
  borderWidth: 1,
  borderColor: "#057474",
  borderRadius: 12,
  backgroundColor: "#FFF6F6",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  paddingHorizontal: 14,
  paddingVertical: 10,
  marginBottom: 16,
},

uploadText: {
  fontSize: Math.min(width * 0.031, 18), // responsive but max 18
  color: "#888",
  flexShrink: 1, // allows text to shrink instead of overflow
},

iconRight: {
  width: 24,
  height: 24,
  marginLeft: 10,
  tintColor: "#057474",
},

  cameraContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: height * 0.02,
  },
  cameraImage: {
    width: "90%",
    height: height * 0.05,
  },

  iconRight: {
  position: "absolute",
  right: 14,       
  width: 20,      
  tintColor: "#057474", 
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
