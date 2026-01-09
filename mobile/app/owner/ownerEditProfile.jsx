import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
  Alert,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import * as ImagePicker from "expo-image-picker";
import Header from "../components/header";


const { width, height } = Dimensions.get("window");



export default function EditProfile() {
  const router = useRouter();
  const [avatar, setAvatar] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [OWNER_ID, setOwnerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
  const [gcashQR, setGcashQR] = useState("");

    useEffect(() => {
    loadUserData();
    // ❌ REMOVE THIS - Don't auto-update on mount!
    // handleUpdateCustomerDetails();
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
        
        // The user object from storage has 'address' not individual address fields
        setFirstName(user.firstName || '');
        setMiddleName(user.middleName || '');
        setLastName(user.lastName || '');
        setEmail(user.email || '');
        setPhoneNumber(user.phone || '');
        setBirthday(user.birthday || '');
        setGender(user.gender || '');
        
        // Parse address if it exists as a single string
        // For now, leave these empty since the storage doesn't have them
        setHouseNumber('');
        setStreet('');
        setBarangay('');
        setTown('');
        setProvince('');
        setCountry('');
        setZipCode('');
        
        console.log('✅ User loaded from storage in EditProfile:', user);
        setIsLoading(false);
        return user.id;
        } else {
        console.log('❌ No user data found, redirecting to login');
        router.replace('/ownerLogin'); // Changed to ownerLogin since role is 'owner'
        return null;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        router.replace('/ownerLogin');
        return null;
    }
    };

    const pickGcashQR = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setGcashQR(result.assets[0].uri); // store local URI
      }
    };

    const handleUpdateOwnerDetails = async () => {
      if (!currentUser?.id) {
        Alert.alert("Error", "User not loaded yet");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("email", email);
        formData.append("phone", phoneNumber);

        if (gcashQR && !gcashQR.startsWith("http")) {
          const filename = gcashQR.split("/").pop();
          const filetype = filename.split(".").pop();
          formData.append("gcashQR", {
            uri: gcashQR,
            name: filename,
            type: `image/${filetype}`,
          });
        }

        const response = await axios.put(
          `${process.env.EXPO_PUBLIC_API_URL}/api/owner/update/${currentUser.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        console.log("✅ Update success:", response.data);

        const updatedUser = response.data.updatedOwner;
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);

        Alert.alert("Success", "Profile updated successfully!");
        router.back();
      } catch (error) {
        console.error("❌ Update failed:", error.response?.data || error.message);
        Alert.alert("Error", "Failed to update profile. Please try again.");
      }
    };



  // placeholder image picker
  const pickImage = () => {
    Alert.alert("Image picker", "pickImage not implemented in this snippet.");
  };


  // Show loading or redirect if no user data
  if (isLoading || !currentUser) {
    return (
      <View style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
    <Header
      title="Edit Profile"
      backgroundColor="#007F7F"
    />
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
                    source={{ 
                        uri: currentUser?.profileImage && currentUser.profileImage !== "N/A" 
                        ? currentUser.profileImage 
                        : "https://i.pravatar.cc/150?img=3" 
                    }}
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

                <View style={styles.nameContainer}>
                  <Text style={styles.username}>{currentUser?.firstName || 'Loading...'} {currentUser?.lastName || 'Loading...'}</Text>
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
              />

              <View>
              <Text style={styles.username}>Gcash QR</Text>
            </View>
            <Pressable onPress={pickGcashQR} style={{ marginBottom: 15 }}>
              {gcashQR ? (
                <Image source={{ uri: gcashQR }} style={{ width: 100, height: 100, borderRadius: 8 }} />
              ) : (
                <View style={{ width: 100, height: 100, borderWidth: 1, borderColor:  "#05747480", justifyContent: "center", alignItems: "center",  }}>
                  <Text>Select QR</Text>
                </View>
              )}
            </Pressable>
            {/* Save Button */}
            <Pressable style={styles.saveButton} onPress={handleUpdateOwnerDetails}>
              <Text style={styles.saveText}>Save Changes</Text>
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


  nameContainer: {
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  username: {
    fontWeight: "bold",
    fontSize: width * 0.04,
    marginTop: 10,
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
    borderWidth: 1,            // visible line
    borderColor: "#05747480", 
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
    borderRadius: 20  ,          
    marginHorizontal: 20,      // shrink from screen edges
    marginTop: 60,             // optional vertical spacing
    backgroundColor: "#FFF",
    top: 50,   // optional to make border visible
    marginBottom: 200,
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
    borderWidth: 2,            // visible line
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
    borderWidth: 1,            // visible line
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

  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.045,
  },
  
});