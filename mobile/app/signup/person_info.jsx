import React, { useState } from "react";
import {
  SafeAreaView,
  View,
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
  
  // Personal Info States
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [hidden, setHidden] = useState(true);
  const [date, setDate] = useState(null); 
  const [show, setShow] = useState(false);
  
  // Address Info States
  const [houseBuilding, setHouseBuilding] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [town, setTown] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");
  
  // ID Upload States
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [fullName1, setFullName1] = useState("");
  const [address1, setAddress1] = useState("");
  const [mobileNumber1, setMobileNumber1] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [photoId, setPhotoId] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [idType, setIdType] = useState("");
  
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
    return true;
  };

  const validateAddressInfo = () => {
    if (!houseBuilding || !street || !barangay || !town || !province || !country || !zipCode) {
      Alert.alert("Missing Info", "Please fill in all required address fields.");
      return false;
    }
    return true;
  };

  const validateIdInfo = () => {
    if (!fullName || !address || !mobileNumber || !fullName1 || !address1 || !mobileNumber1 || !idType || !idNumber || !photoId || !selfie) {
      Alert.alert("Missing Info", "Please fill in all required ID verification and guarantor fields.");
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
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add personal details (match backend field names exactly)
      formData.append('firstName', firstName);
      formData.append('middleName', middleName);
      formData.append('lastName', lastName);
      formData.append('emailAddress', email); // Backend expects 'emailAddress'
      formData.append('phoneNumber', phoneNumber);
      formData.append('gender', gender);
      formData.append('password', password);
      formData.append('birthday', date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
      
      // Add address details
      formData.append('houseNumber', houseBuilding); 
      formData.append('street', street);
      formData.append('barangay', barangay);
      formData.append('town', town);
      formData.append('province', province);
      formData.append('country', country);
      formData.append('zipCode', zipCode);
      
      // Add guarantor details
      formData.append('guarantor1FullName', fullName);
      formData.append('guarantor1Address', address);
      formData.append('guarantor1MobileNumber', mobileNumber);
      formData.append('guarantor2FullName', fullName1);
      formData.append('guarantor2Address', address1);
      formData.append('guarantor2MobileNumber', mobileNumber1);
      
      // Add ID details
      formData.append('idType', idType);
      formData.append('idNumber', idNumber);
      
      // Add files
      if (photoId) {
        formData.append('photoId', {
          uri: photoId,
          type: 'image/jpeg',
          name: 'photo_id.jpg',
        });
      }
      
      if (selfie) {
        formData.append('selfie', {
          uri: selfie,
          type: 'image/jpeg',
          name: 'selfie.jpg',
        });
      }

      console.log('📤 Sending signup data to:', `${API_URL}/api/customer/sign-up`);

      const res = await axios.post(`${API_URL}/api/customer/sign-up`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        Alert.alert("Success", "Registration completed successfully! Please wait for admin approval.", [
          {
            text: "OK",
            onPress: () => router.push("/login"),
          },
        ]);
      } else {
        Alert.alert("Error", res.data.message);
      }
    } catch (err) {
      console.error('❌ Error during signup:', err);
      
      let errorMessage = "Failed to complete signup";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        // Handle validation errors
        const errors = err.response.data.errors.map(error => error.message).join(", ");
        errorMessage = `Validation errors: ${errors}`;
      }
      
      Alert.alert("Error", errorMessage);
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

        <TextInput
          style={[
            styles.input,
            !isTextMode("gender", gender) && styles.placeholderInput,
          ]}
          placeholder={!isTextMode("gender", gender) ? "Gender *" : ""}
          placeholderTextColor="#888"
          value={gender}
          onChangeText={setGender}
          autoCapitalize="words"
          allowFontScaling={false}
          onFocus={() => setFocusField("gender")}
          onBlur={() => setFocusField("")}
        />

        <View style={styles.passwordWrapper}>
          <TextInput
            style={[
              styles.inputPassword,
              !isTextMode("password", password) && styles.placeholderInput,
            ]}
            placeholder={!isTextMode("password", password) ? "Password *" : ""}
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
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
      </View>
    </>
  );

  const renderIdUploadForm = () => (
    <>
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
          <Text style={styles.addressText}>Country: {country || 'N/A'}</Text>
          <Text style={styles.addressText}>Zip Code: {zipCode || 'N/A'}</Text>
          <View style={styles.divider1} />
        </View>

        {/* ID/Guarantor Section */}
        <View style={styles.address}>
          <Text style={styles.sectionTitle1}>ID Upload/Guarantor</Text>

          <Text style={styles.addressText1}>Guarantor 1:</Text>
          <Text style={styles.addressText}>Full Name: {fullName || 'N/A'}</Text>
          <Text style={styles.addressText}>Address: {address || 'N/A'}</Text>
          <Text style={styles.addressText}>Mobile Number: {mobileNumber || 'N/A'}</Text>

          <Text style={styles.addressText1}>Guarantor 2:</Text>
          <Text style={styles.addressText}>Full Name: {fullName1 || 'N/A'}</Text>
          <Text style={styles.addressText}>Address: {address1 || 'N/A'}</Text>
          <Text style={styles.addressText}>Mobile Number: {mobileNumber1 || 'N/A'}</Text>
          
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
});