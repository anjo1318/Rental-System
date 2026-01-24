import React, { useState } from "react";
import {View,
  Image,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width, height } = Dimensions.get("window");

export default function PersonalInfo() {
  const router = useRouter();
  
  // Personal Info States in order
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [date, setDate] = useState(null); 
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");


  //to determine kung para saan
  const [hidden, setHidden] = useState(true);
  const [show, setShow] = useState(false);
  
  // Address Info States in order
  const [country, setCountry] = useState("Philippines");
  const [province, setProvince] = useState("Oriental Mindoro");
  const [town, setTown] = useState("");
  const [barangay, setBarangay] = useState("");
  const [street, setStreet] = useState("");
  const [houseBuilding, setHouseBuilding] = useState("");
  const [zipCode, setZipCode] = useState("");
  
  // ID Upload States
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [photoId, setPhotoId] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [role, setRole] = useState("");
  
  // Review States
  const [isChecked, setIsChecked] = useState(false);
  
  // UI States
  const [currentStep, setCurrentStep] = useState(1); // 1, 2, 3, or 4
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState("");

  const formattedDate = date
    ? `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}/${date.getFullYear()}`
    : "";

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Helper function
  const isTextMode = (field, value) => {
    if (focusField === field) return true;
    return value !== "" && value !== null && value !== undefined;
  };

  // Validation functions
  const validatePersonalInfo = () => {
    if (!firstName || !middleName || !lastName || !email || !phoneNumber || !gender || !password || !date) {
      Alert.alert("Missing Info", "Please fill in all required personal information fields.");
      return false;
    }
    
    const passError = validatePassword(password);
    if (passError) {
      Alert.alert("Invalid Password", passError);
      return false;
    }
    
    return true;
  };

  const validatePassword = (pass) => {
  if (pass.length < 8) {
    return "Password must be at least 8 characters";
  }
  
  const hasUpperCase = /[A-Z]/.test(pass);
  const hasLowerCase = /[a-z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
  
  if (!hasUpperCase) {
    return "Password must contain at least 1 uppercase letter";
  }
  if (!hasLowerCase) {
    return "Password must contain at least 1 lowercase letter";
  }
  if (!hasNumber) {
    return "Password must contain at least 1 number";
  }
  if (!hasSymbol) {
    return "Password must contain at least 1 symbol";
  }
  
  return "";
};

  const validateAddressInfo = () => {
    if (!street || !barangay || !town || !province || !country || !zipCode) {
      Alert.alert("Missing Info", "Please fill in all required address fields.");
      return false;
    }
    return true;
  };

  const validateIdInfo = () => {

  if (!idType || !idNumber || !photoId || !selfie) {
    Alert.alert("Missing Info", "Please complete ID verification (type, number, photo, and selfie).");
    return false;
  }
  return true;
};


  const validateReview = () => {
    if (!isChecked) {
      Alert.alert("Error", "Please accept the terms and conditions");
      return false;
    }
    return true;
  };

  // Image picker functions
  const pickIdPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return Alert.alert("Permission denied!", "Please allow access to photo library.");
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    
    if (!result.canceled) setPhotoId(result.assets[0].uri);
  };

  const takeSelfie = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) return Alert.alert("Permission denied!", "Please allow camera access.");
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    
    if (!result.canceled) setSelfie(result.assets[0].uri);
  };

  // Handle moving to next step or submitting
  const handleNext = async () => {
    if (currentStep === 1) {
      if (validatePersonalInfo()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateAddressInfo()) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (validateIdInfo()) {
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      if (validateReview()) {
        await handleSubmit();
      }
    }
  };

  // Helper function to convert image URI to base64
  const uriToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };


  // Handle API submission with FormData for file uploads
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Personal details
      formData.append("firstName", firstName);
      formData.append("middleName", middleName);
      formData.append("lastName", lastName);
      formData.append("emailAddress", email);
      formData.append("phoneNumber", phoneNumber);
      formData.append("gender", gender);
      formData.append("password", password);
      formData.append("birthday", date.toISOString().split("T")[0]);

      // Address
      formData.append("houseNumber", houseBuilding);
      formData.append("street", street);
      formData.append("barangay", barangay);
      formData.append("town", town);
      formData.append("province", province);
      formData.append("country", country);
      formData.append("zipCode", zipCode);

      // ID details
      formData.append("idType", idType);
      formData.append("idNumber", idNumber);

      // 📸 Attach files
      if (photoId) {
        formData.append("photoId", {
          uri: photoId,              // e.g. "file:///..."
          type: "image/jpeg",        // adjust if png
          name: "photo_id.jpg",
        });
      }

      if (selfie) {
        formData.append("selfie", {
          uri: selfie,
          type: "image/jpeg",
          name: "selfie.jpg",
        });
      }

      console.log("📤 Uploading to:", `${API_URL}/api/customer/sign-up`);

      const response = await fetch(`${API_URL}/api/customer/sign-up`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert("✅ Success", "Registration completed successfully! Please wait for admin approval.", [
          { text: "OK", onPress: () => router.push("/login") },
        ]);
      } else {
        Alert.alert("❌ Error", data.message || "Something went wrong");
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      Alert.alert("Error", "Failed to complete signup");
    } finally {
      setLoading(false);
    }
  };



  const handlePrevious = () => {
    if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      router.back();
    }
  };

  const renderPersonalInfoForm = () => (
    <>
      <View style={styles.headerTextRow}>
        <Text style={styles.stepText}>Step 1</Text>
        <Text style={styles.personalText}>Personal Info</Text>
      </View>

      <View style={styles.photoContainer}>
        <Image
          source={require("../../assets/images/personal_info.png")}
          style={styles.photoImage}
          resizeMode="contain"
        />
        <Text style={styles.subText}>All Fields with * are required</Text>
      </View>

      <View style={styles.container}>
        <TextInput
          style={[
            styles.input,
            !isTextMode("firstName", firstName) && styles.placeholderInput,
          ]}
          placeholder={!isTextMode("firstName", firstName) ? "First Name *" : ""}
          placeholderTextColor="#888"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="sentences"
          allowFontScaling={false}
          onFocus={() => setFocusField("firstName")}
          onBlur={() => setFocusField("")}
        />

        <TextInput
          style={[
            styles.input,
            !isTextMode("middleName", middleName) && styles.placeholderInput,
          ]}
          placeholder={!isTextMode("middleName", middleName) ? "Middle Name *" : ""}
          placeholderTextColor="#888"
          value={middleName}
          onChangeText={setMiddleName}
          autoCapitalize="sentences"
          allowFontScaling={false}
          onFocus={() => setFocusField("middleName")}
          onBlur={() => setFocusField("")}
        />

        <TextInput
          style={[
            styles.input,
            !isTextMode("lastName", lastName) && styles.placeholderInput,
          ]}
          placeholder={!isTextMode("lastName", lastName) ? "Last Name *" : ""}
          placeholderTextColor="#888"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="sentences"
          allowFontScaling={false}
          onFocus={() => setFocusField("lastName")}
          onBlur={() => setFocusField("")}
        />

        <TextInput
          style={[
            styles.input,
            !isTextMode("email", email) && styles.placeholderInput,
          ]}
          placeholder={!isTextMode("email", email) ? "Email *" : ""}
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          allowFontScaling={false}
          onFocus={() => setFocusField("email")}
          onBlur={() => setFocusField("")}
        />

        <TextInput
          style={[
            styles.input,
            !isTextMode("phoneNumber", phoneNumber) && styles.placeholderInput,
          ]}
          placeholder={!isTextMode("phoneNumber", phoneNumber) ? "Phone Number *" : ""}
          placeholderTextColor="#888"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          allowFontScaling={false}
          onFocus={() => setFocusField("phoneNumber")}
          onBlur={() => setFocusField("")}
        />

        <Pressable
          style={[
            styles.input,
            { justifyContent: date ? "center" : "flex-start" }
          ]}
          onPress={() => {
            setShow(true);
            setFocusField("birthday");
          }}
        >
          <Text
            style={{
              color: date ? "#000" : "#888",
              fontSize: date ? inputFontSize : inputFontSize * 0.8,
              marginTop: date ? 0 : 8,
            }}
          >
            {date ? formattedDate : "Birthday *"}
          </Text>
        </Pressable>

        {show && (
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setDate(selectedDate);
              }
              setShow(false);
              setFocusField("");
            }}
          />
        )}

      <View style={styles.pickerContainer}>
        {!gender && (
          <Text style={styles.pickerOverlayText}>
            Select Gender *
          </Text>
        )}

        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
          style={{ color: gender ? "#000" : "transparent", width: "100%" }}
        >
          <Picker.Item label="Select Gender " value="" color="#888" /> 
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>

    <View style={styles.passwordWrapper}>
      <TextInput
        style={[
          styles.inputPassword,
          !isTextMode("password", password) && styles.placeholderInput,
        ]}
        placeholder={!isTextMode("password", password) ? "Password *" : ""}
        placeholderTextColor="#888"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (text) {
            setPasswordError(validatePassword(text));
          } else {
            setPasswordError("");
          }
        }}
        autoCapitalize="none"
        secureTextEntry={hidden}
        allowFontScaling={false}
        onFocus={() => setFocusField("password")}
        onBlur={() => setFocusField("")}
      />
      <Pressable onPress={() => setHidden(!hidden)} style={styles.eyeIcon}>
        <Ionicons name={hidden ? "eye-off" : "eye"} size={24} color="#888" />
      </Pressable>
    </View>
{passwordError ? (
  <Text style={styles.errorText}>{passwordError}</Text>
) : null}
      </View>
    </>
  );

  const renderAddressForm = () => (
    <>
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

        <TextInput
          style={[
            styles.input,
            !isTextMode("country", country) && styles.placeholderInput,
          ]}
          placeholder={!isTextMode("country", country) ? "Country *" : ""}
          placeholderTextColor="#888"
          value={"Philippines"}
          onChangeText={setCountry}
          autoCapitalize="sentences"
          onFocus={() => setFocusField("country")}
          onBlur={() => setFocusField("")}
          disabled
        />

        <TextInput
          style={[
            styles.input,
            !isTextMode("province", province) && styles.placeholderInput,
          ]}
          placeholder={!isTextMode("province", province) ? "Province *" : ""}
          placeholderTextColor="#888"
          value={"Oriental Mindoro"}
          onChangeText={setProvince}
          autoCapitalize="sentences"
          onFocus={() => setFocusField("province")}
          onBlur={() => setFocusField("")}
          disabled
        />
                
      <View style={styles.pickerContainer}>
        {!town && (
          <Text style={styles.pickerOverlayText}>
            Select Town *
          </Text>
        )}

        <Picker
          selectedValue={town}
          onValueChange={(itemValue) => setTown(itemValue)}
          style={{ color: town ? "#000" : "transparent", width: "100%" }}
        >
          <Picker.Item label="Select Town " value="" color="#888" /> 
          <Picker.Item label="Pinamalayan" value="Pinamalayan" />
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        {!barangay && (
          <Text style={styles.pickerOverlayText}>
            Select Barangay *
          </Text>
        )}

        <Picker
          selectedValue={barangay}
          onValueChange={(itemValue) => setBarangay(itemValue)}
          style={{ color: barangay ? "#000" : "transparent", width: "100%" }}
        >
         <Picker.Item label="Select Barangay" value="" color="#888" />
          <Picker.Item label="Anoling" value="Anoling" />
          <Picker.Item label="Bacungan" value="Bacungan" />
          <Picker.Item label="Bangbang" value="Bangbang" />
          <Picker.Item label="Banilad" value="Banilad" />
          <Picker.Item label="Buli" value="Buli" />
          <Picker.Item label="Cacawan" value="Cacawan" />
          <Picker.Item label="Calingag" value="Calingag" />
          <Picker.Item label="Del Razon" value="Del Razon" />
          <Picker.Item label="Guinhawa" value="Guinhawa" />
          <Picker.Item label="Inclanay" value="Inclanay" />
          <Picker.Item label="Lumambayan" value="Lumambayan" />
          <Picker.Item label="Malaya" value="Malaya" />
          <Picker.Item label="Maliancog" value="Maliancog" />
          <Picker.Item label="Maningcol" value="Maningcol" />
          <Picker.Item label="Marayos" value="Marayos" />
          <Picker.Item label="Marfrancisco" value="Marfrancisco" />
          <Picker.Item label="Nabuslot" value="Nabuslot" />
          <Picker.Item label="Pagalagala" value="Pagalagala" />
          <Picker.Item label="Palayan" value="Palayan" />
          <Picker.Item label="Pambisan Malaki" value="Pambisan Malaki" />
          <Picker.Item label="Pambisan Munti" value="Pambisan Munti" />
          <Picker.Item label="Panggulayan" value="Panggulayan" />
          <Picker.Item label="Papandayan" value="Papandayan" />
          <Picker.Item label="Pili" value="Pili" />
          <Picker.Item label="Quinabigan" value="Quinabigan" />
          <Picker.Item label="Ranzo" value="Ranzo" />
          <Picker.Item label="Rosario" value="Rosario" />
          <Picker.Item label="Sabang" value="Sabang" />
          <Picker.Item label="Sta. Isabel" value="Sta. Isabel" />
          <Picker.Item label="Sta. Maria" value="Sta. Maria" />
          <Picker.Item label="Sta. Rita" value="Sta. Rita" />
          <Picker.Item label="Sto. Nino (Santo Niño)" value="Sto. Nino (Santo Niño)" />
          <Picker.Item label="Wawa" value="Wawa" />
          <Picker.Item label="Zone I (Pob.)" value="Zone I (Pob.)" />
          <Picker.Item label="Zone II (Pob.)" value="Zone II (Pob.)" />
          <Picker.Item label="Zone III (Pob.)" value="Zone III (Pob.)" />
          <Picker.Item label="Zone IV (Pob.)" value="Zone IV (Pob.)" />
        </Picker>
      </View>

        <TextInput
          style={[
            styles.input,
            !isTextMode("street", street) && styles.placeholderInput,
          ]}
          placeholder={
            !isTextMode("street", street)
              ? "Street *"
              : ""
          }
          placeholderTextColor="#888"
          value={street}
          onChangeText={setStreet}
          autoCapitalize="sentences"
          keyboardType="default"
          onFocus={() => setFocusField("street")}
          onBlur={() => setFocusField("")}
        />


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

      <View style={styles.pickerContainer}>
        {!zipCode && (
          <Text style={styles.pickerOverlayText}>
            Select zip code *
          </Text>
        )}

        <Picker
          selectedValue={zipCode}
          onValueChange={(itemValue) => setZipCode(itemValue)}
          style={{ color: zipCode ? "#000" : "transparent", width: "100%" }}
        >
          <Picker.Item label="Select ZIP code " value="" color="#888" /> 
          <Picker.Item label="5208" value="5208" />

        </Picker>
      </View>
      </View>
    </>
  );

  const renderIdUploadForm = () => (
    <>
      <View style={styles.headerTextRow}>
        <Text style={styles.stepText}>Step 3</Text>
        <Text style={styles.personalText}>Role/ID Upload</Text>
      </View>

      <View style={styles.photoContainer}>
        <Image
          source={require("../../assets/images/id_upload.png")}
          style={styles.photoImage}
          resizeMode="contain"
        />
        <Text style={styles.subText}>All Fields with * are required</Text>

        

      </View>

      <View style={[styles.pickerContainer, { top: 50, width: "84%", alignSelf: "center"  }]}>
        {!role && (
          <Text style={styles.pickerOverlayText}>
            Registration Role *
          </Text>
        )}

        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
          style={{ color: role ? "#000" : "transparent", width: "100%" }}
        >
          <Picker.Item label="Select Type of ID " value="" color="#888" /> 
          <Picker.Item label="Customer" value="customer" />
          <Picker.Item label="Owner" value="owner" />

        </Picker>
      </View>

      <View style={styles.container}>




        <Text style={styles.sub5Text}>ID Verification</Text>
        <Text style={styles.sub6Text}>
          Only JPEG, JPG and PNG files with max size of 4mb.
        </Text>

        <View style={styles.pickerContainer}>
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
          placeholder={!isTextMode("idNumber", idNumber) ? "ID Number *" : ""}
          placeholderTextColor="#888"
          value={idNumber}
          onChangeText={setIdNumber}
          keyboardType="phone-pad"
          autoCapitalize="none"
          onFocus={() => setFocusField("idNumber")}
          onBlur={() => setFocusField("")}
        />

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
      </View>
    </>
  );

  const renderReviewForm = () => (
    <>
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

      <ScrollView style={styles.reviewContainer}>
        {/* Personal Info Section */}
        <View style={styles.info}>
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <Text style={styles.infoText}>First Name: {firstName || 'N/A'}</Text>
          <Text style={styles.infoText}>Middle Name: {middleName || 'N/A'}</Text>
          <Text style={styles.infoText}>Last Name: {lastName || 'N/A'}</Text>
          <Text style={styles.infoText}>Email Address: {email || 'N/A'}</Text>
          <Text style={styles.infoText}>Phone Number: {phoneNumber || 'N/A'}</Text>
          <Text style={styles.infoText}>Birthday: {formattedDate || 'N/A'}</Text>
          <Text style={styles.infoText}>Gender: {gender || 'N/A'}</Text>
          <Text style={styles.infoText}>Password: ******</Text>
          <View style={styles.divider} />
        </View>

        {/* Address Section */}
        <View style={styles.address}>
          <Text style={styles.sectionTitle1}>Address</Text>
          <Text style={styles.addressText}>House No./Building No.: {houseBuilding || 'N/A'}</Text>
          <Text style={styles.addressText}>Street: {street || 'N/A'}</Text>
          <Text style={styles.addressText}>Barangay: {barangay || 'N/A'}</Text>
          <Text style={styles.addressText}>Town: {town || 'N/A'}</Text>
          <Text style={styles.addressText}>Province: {province || 'N/A'}</Text>
          <Text style={styles.addressText}>Country: {"Philippines" || 'N/A'}</Text>
          <Text style={styles.addressText}>Zip Code: {zipCode || 'N/A'}</Text>
          <View style={styles.divider1} />
        </View>

        {/* ID/Guarantor Section */}
        <View style={styles.address}>
          <Text style={styles.sectionTitle1}>ID Upload/Guarantor</Text>
          
          <Text style={styles.addressText1}>ID Upload:</Text>
          <Text style={styles.addressText}>Type of ID: {idType || 'N/A'}</Text>
          <Text style={styles.addressText}>ID Number: {idNumber || 'N/A'}</Text>

          {photoId ? (
            <View>
              <Text style={styles.imageLabel}>ID Photo:</Text>
              <Image
                source={{ uri: photoId }}
                style={styles.uploadedImage}
                resizeMode="contain"
              />
            </View>
          ) : (
            <Text style={styles.noImageText}>No ID photo uploaded</Text>
          )}

          {selfie ? (
            <View>
              <Text style={styles.imageLabel}>Selfie:</Text>
              <Image
                source={{ uri: selfie }}
                style={styles.uploadedImage}
                resizeMode="contain"
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
      </ScrollView>
    </>
  );

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
          enableAutomaticScroll={true}
        >
          <View style={styles.headerWrapper}>
            <Image
              source={require("../../assets/images/header.png")}
              style={styles.headerImage}
              resizeMode="cover"
              accessible
              accessibilityLabel="Top banner"
            />

            <Pressable style={styles.backButton} onPress={handlePrevious}>
              <Ionicons name="arrow-back" size={width * 0.07} color="#fff" />
            </Pressable>

            <Text style={styles.titleText}>Sign up</Text>
          </View>

          {currentStep === 1 && renderPersonalInfoForm()}
          {currentStep === 2 && renderAddressForm()}
          {currentStep === 3 && renderIdUploadForm()}
          {currentStep === 4 && renderReviewForm()}

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button, 
                pressed && styles.buttonPressed,
                (currentStep === 4 && (!isChecked || loading)) && styles.buttonDisabled
              ]}
              onPress={handleNext}
              disabled={(currentStep === 4 && (!isChecked || loading)) || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {currentStep === 4 ? "Complete Registration" : "Next"}
                </Text>
              )}
            </Pressable>

            {currentStep > 1 && (
              <Pressable
                style={({ pressed }) => [styles.previous, pressed && styles.previousPressed]}
                onPress={handlePrevious}
                disabled={loading}
              >
                <Text style={styles.previousText}>Previous</Text>
              </Pressable>
            )}
          </View>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </View>
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
    top: height * 0.06,
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
    marginTop: height * 0.07,
  },
  reviewContainer: {
    flex: 1,
    paddingHorizontal: width * 0.08,
    marginTop: height * 0.02,
  },
  buttonContainer: {
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingBottom: height * 0.02,
  },
  input: {
    width: "100%",
    height: lockedHeight,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    fontSize: inputFontSize,
    lineHeight: Math.round(inputFontSize * 1.2),
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
  passwordWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 15,
    borderColor: "#057474",
    backgroundColor: "#FFF6F6",
    height: lockedHeight,
  },
  inputPassword: {
    flex: 1,
    fontSize: inputFontSize,
    lineHeight: Math.round(inputFontSize * 1.5),
    color: "#000",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  eyeIcon: {
    marginLeft: 10,
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
    fontSize: width * 0.03,
    color: "#888",
    zIndex: 2,
  },
  uploadBox: {
    width: "100%",
    minHeight: lockedHeight,
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
    fontSize: Math.min(width * 0.031, 18),
    color: "#888",
    flexShrink: 1,
  },
  iconRight: {
    width: 24,
    height: 24,
    marginLeft: 10,
    tintColor: "#057474",
  },
  // Review styles
  info: {
    width: "100%",
    marginBottom: height * 0.02,
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
    borderBottomColor: "#057474",
    borderBottomWidth: 1.5,
    marginTop: height * 0.015,
  },
  address: {
    width: "100%",
    marginBottom: height * 0.02,
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
    borderBottomColor: "#057474",
    borderBottomWidth: 1.5,
    marginTop: height * 0.015,
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
    alignItems: "flex-start",
    marginTop: height * 0.03,
    marginBottom: height * 0.02,
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
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
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
    width: "100%",
    backgroundColor: "#057474",
    paddingVertical: height * 0.018,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 11,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.5,
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
  errorText: {
  fontSize: width * 0.03,
  color: "#d32f2f",
  marginTop: -10,
  marginBottom: 10,
  width: "100%",
},
});