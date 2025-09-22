import React, { useState } from "react";
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
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

// Responsive constants
const HEADER_HEIGHT = Math.max(64, Math.round(height * 0.08));
const ICON_BOX = Math.round(width * 0.1);
const ICON_SIZE = Math.max(20, Math.round(width * 0.06));
const TITLE_FONT = Math.max(16, Math.round(width * 0.045));
const PADDING_H = Math.round(width * 0.02);
const MARGIN_TOP = Math.round(height * 0.025);
const PADDING_V = Math.min(Math.round(height * 0.0), 8);

export default function EditProfile() {
  const router = useRouter();
  const [avatar, setAvatar] = useState(null);

  // Input states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // placeholder image picker
  const pickImage = () => {
    Alert.alert("Image picker", "pickImage not implemented in this snippet.");
  };

  // Save button
  const handleSave = () => {
    Alert.alert(
      "Profile Updated",
      `First Name: ${firstName}\nLast Name: ${lastName}\nEmail: ${email}\nPhone: ${phoneNumber}`
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View
            style={[
              styles.headerWrapper,
              { height: HEADER_HEIGHT, paddingHorizontal: PADDING_H, paddingVertical: PADDING_V },
            ]}
          >
            <View style={[styles.profileContainer, { marginTop: MARGIN_TOP }]}>
              <View style={[styles.iconBox, { width: ICON_BOX }]}>
                <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconPress}>
                  <Icon name="arrow-back" size={ICON_SIZE} color="#000" />
                </Pressable>
              </View>

              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.pageName, { fontSize: TITLE_FONT }]}
              >
                Edit Profile
              </Text>

              <View style={[styles.iconBox, { width: ICON_BOX }]} />
            </View>
          </View>

          {/* Avatar */}
          <View style={styles.userContainer}>
            <View style={styles.userRow}>
              <Pressable onPress={pickImage} style={styles.userPressable}>
                <View style={styles.avatarWrapper}>
                  <Image
                    source={avatar ? { uri: avatar } : require("../../assets/images/avatar.png")}
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
                  <Text style={styles.username}>Marco Polo</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Inputs */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#888"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="sentences"
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#888"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="sentences"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#888"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />

            {/* Save Button */}
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save Changes</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  headerWrapper: {
    width: "100%",
    backgroundColor: "#FFF",
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
    justifyContent: "center",
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconBox: {
    alignItems: "center",
    justifyContent: "center",
  },

  iconPress: {
    padding: width * 0.015,
    borderRadius: 6,
  },

  pageName: {
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    flex: 1,
    paddingHorizontal: 6,
  },

  userContainer: {
    padding: 13,
    marginTop: 20,
  },

  userRow: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },

  userPressable: {
    flexDirection: "column",
    alignItems: "center",
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

  inputContainer: {
    paddingHorizontal: width * 0.08,
    paddingBottom: height * 0.06,
    marginTop: 20,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D7D7D7",
    borderRadius: 12,
    paddingVertical: height * 0.018,
    backgroundColor: "transparent",
    paddingHorizontal: 14,
    marginBottom: 15,
    fontSize: width * 0.04,
    color: "#D7D7D7",
  },

  saveButton: {
    backgroundColor: "#057474",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 170,
  },

  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.045,
  },
});
