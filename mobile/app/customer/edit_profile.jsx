import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Alert,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import Header from "../components/header";
import * as ImagePicker from 'expo-image-picker';

const API_URL = process.env.EXPO_PUBLIC_API_URL;


const { width, height } = Dimensions.get("window");


export default function EditProfile() {
  const router = useRouter();
  const [avatar, setAvatar] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [OWNER_ID, setOwnerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // ✅ NEW: Loading state for save button

  // Input states - properly initialized
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [town, setTown] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");

  useEffect(() => {
    loadUserData();
    console.log("This is the url", process.env.EXPO_PUBLIC_API_URL);
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setOwnerId(user.id);
        
        // ✅ Load profile image
        if (user.profileImage && user.profileImage !== "N/A") {
          setAvatar(`${API_URL}/uploads/images/${user.profileImage}`);
        }

        setFirstName(user.firstName || '');
        setMiddleName(user.middleName || '');
        setLastName(user.lastName || '');
        setEmail(user.email || '');
        setPhoneNumber(user.phone || '');
        setBirthday(user.birthday || '');
        setGender(user.gender || '');
        setHouseNumber(user.houseNumber || '');
        setStreet(user.street || '');
        setBarangay(user.barangay || '');
        setTown(user.town || '');
        setProvince(user.province || '');
        setCountry(user.country || '');
        setZipCode(user.zipCode || '');
        
        console.log('✅ User loaded from storage in EditProfile:', user);
        setIsLoading(false);
        return user.id;
      } else {
        console.log('❌ No user data found, redirecting to login');
        router.replace('/login');
        return null;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      router.replace('/login');
      return null;
    }
  };

  const handleUpdateCustomerDetails = async () => {
    // ✅ Add safety check
    if (!currentUser || !currentUser.id) {
      Alert.alert("Error", "User data not loaded. Please try again.");
      return;
    }

    console.log("Saving na yung data");

    // ✅ Prevent multiple clicks
    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true); // ✅ Start loading

      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/customer/update/${currentUser.id}`,
        {
          firstName,
          middleName,
          lastName,
          emailAddress: email,      // ✅ Fixed field name
          phoneNumber: phoneNumber, // ✅ Fixed field name
          birthday,
          gender,
          houseNumber,
          street,
          barangay,
          town,
          province,
          country,
          zipCode,
        }
      );

      console.log("✅ Update success:", response.data);

      const updatedUser = response.data.updatedCustomer;

      // Save the updated user in AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      // Update state immediately so UI refreshes
      setCurrentUser(updatedUser);

      // ✅ Show success alert and navigate back after user dismisses it
      Alert.alert(
        "Success", 
        "Profile updated successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              setIsSaving(false); // ✅ Stop loading
              router.push("customer/profile"); // ✅ Navigate back
            }
          }
        ]
      );

    } catch (error) {
      console.error("❌ Update failed:", error.response?.data || error.message);
      setIsSaving(false); // ✅ Stop loading on error
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please allow access to your photo library to change your profile picture.");
        return;
      }

      // ✅ FIXED: Use MediaType instead of deprecated MediaTypeOptions
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // ✅ Updated to use array of strings
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setAvatar(imageUri);
        
        // Upload to server
        await uploadImage(imageUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `profile_${currentUser.id}.jpg`,
      });

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/customer/upload-photo/${currentUser.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("✅ Image uploaded:", response.data);
      
      // Update user data in AsyncStorage
      const filename = response.data.photoUrl.split("/").pop();

      const updatedUser = {
        ...currentUser,
        profileImage: filename
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      // Update avatar immediately
      setAvatar(`${API_URL}/uploads/images/${filename}`);

      
      Alert.alert("Success", "Profile photo updated successfully!");
      
    } catch (error) {
      console.error("❌ Image upload failed:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    }
  };


  // Show loading or redirect if no user data
  if (isLoading || !currentUser) {
    return (
      <View style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#057474" />
          <Text style={{ marginTop: 10 }}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      {/* Header */}
      <Header title="Edit Profile" backgroundColor="#007F7F" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={styles.mainContainer}>
            <View style={styles.userContainer}>
              <View style={styles.userRow}>
                <Pressable onPress={pickImage} style={styles.userPressable}>
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={
                        avatar && avatar !== "N/A"
                          ? { uri: avatar }
                          : require("../../assets/images/avatar.png")
                      }
                      style={styles.avatar}
                    />
                    <Pressable style={styles.cameraButton} onPress={pickImage}>
                      <Image
                        source={require("../../assets/images/edit.png")}
                        style={styles.cameraImage}
                        resizeMode="contain"
                      />
                    </Pressable>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Inputs */}
            <View style={styles.inputContainer}>
              <View>
                <Text style={styles.username}>First Name</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#888"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                editable={!isSaving}
              />
              <View>
                <Text style={styles.username}>Middle Name</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Middle Name"
                placeholderTextColor="#888"
                value={middleName}
                onChangeText={setMiddleName}
                autoCapitalize="words"
                editable={!isSaving}
              />
              <View>
                <Text style={styles.username}>Last Name</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#888"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                editable={!isSaving}
              />
              <View>
                <Text style={styles.username}>Email</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSaving}
              />
              <View>
                <Text style={styles.username}>Phone Number</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#888"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
                editable={!isSaving}
              />
              <View>
                <Text style={styles.username}>Birthday</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Birthday"
                placeholderTextColor="#888"
                value={birthday}
                onChangeText={setBirthday}
                keyboardType="phone-pad"
                autoCapitalize="none"
                editable={!isSaving}
              />
              <View>
                <Text style={styles.username}>Gender</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Gender"
                placeholderTextColor="#888"
                value={gender}
                onChangeText={setGender}
                autoCapitalize="words"
                editable={!isSaving}
              />
              <View>
                <Text style={styles.username}>House Number</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="House Number"
                placeholderTextColor="#888"
                value={houseNumber}
                onChangeText={setHouseNumber}
                autoCapitalize="words"
                editable={!isSaving}
              />
              <View>
                <Text style={styles.username}>Street</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Street"
                placeholderTextColor="#888"
                value={street}
                onChangeText={setStreet}
                autoCapitalize="words"
                editable={!isSaving}
              />
              <View>
                <Text style={styles.username}>Barangay</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Barangay"
                placeholderTextColor="#888"
                value={barangay}
                onChangeText={setBarangay}
                autoCapitalize="words"
                editable={!isSaving}
              />
              <View>
                <Text style={styles.username}>Town</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Town"
                placeholderTextColor="#888"
                value={town}
                onChangeText={setTown}
                autoCapitalize="words"
                editable={!isSaving}
              />
              <View>
                <Text style={styles.username}>Province</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Province"
                placeholderTextColor="#888"
                value={province}
                onChangeText={setProvince}
                autoCapitalize="words"
                editable={!isSaving}
              />
              <View>
                <Text style={styles.username}>Country</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Country"
                placeholderTextColor="#888"
                value={country}
                onChangeText={setCountry}
                autoCapitalize="words"
                editable={!isSaving}
              />
              <View>
                <Text style={styles.username}>Zip code</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Zip code"
                placeholderTextColor="#888"
                value={zipCode}
                onChangeText={setZipCode}
                autoCapitalize="words"
                editable={!isSaving}
              />

              {/* Save Button */}
              <Pressable 
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
                onPress={handleUpdateCustomerDetails}
                disabled={isSaving}
              >
                {isSaving ? (
                  <View style={styles.savingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={[styles.saveText, { marginLeft: 10 }]}>Saving Changes...</Text>
                  </View>
                ) : (
                  <Text style={styles.saveText}>Save Changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  userContainer: {
    padding: 13,
    marginBottom: 10,
  },

  userRow: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    bottom: 50,
  },

  userPressable: {
    flexDirection: "column",
    alignItems: "center",
  },

  mainContainer: {
    borderWidth: 1,
    borderColor: "#05747480", 
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
    borderRadius: 20,
    marginHorizontal: 10,
    marginTop: 50,
    backgroundColor: "#FFF",
    marginBottom: 80,
  },

  avatarWrapper: {
    position: "relative",
    width: width * 0.20,
    height: width * 0.20,
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: (width * 0.20) / 2,
    borderWidth: 2,
    borderColor: "#057474BF", 
  },

  cameraButton: {
    position: "absolute",
    bottom: -(width * 0.001),
    right: -(width * 0.001),
    width: width * 0.06,
    height: width * 0.06,
    backgroundColor: "#fff",
    borderRadius: (width * 0.07) / 2,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 6,
  },

  cameraImage: {
    width: "110%",
    height: "110%",
    resizeMode: "cover",
  },

  username: {
    fontWeight: "bold",
    fontSize: width * 0.04,
    bottom: 5,
  },

  inputContainer: {
    paddingHorizontal: width * 0.08,
    paddingBottom: height * 0.06,
    bottom: 40,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#0574744D", 
    borderRadius: 12,
    paddingVertical: height * 0.018,
    backgroundColor: "transparent",
    paddingHorizontal: 14,
    marginBottom: 15,
    fontSize: width * 0.04,
    color: "#000", 
  },

  saveButton: {
    backgroundColor: "#057474",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 30,
    top: 20,
  },

  saveButtonDisabled: {
    backgroundColor: "#057474aa", // ✅ Slightly transparent when disabled
  },

  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.045,
  },
});