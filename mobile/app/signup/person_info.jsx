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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";

const { width, height } = Dimensions.get("window");

export default function PersonalInfo() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [hidden, setHidden] = useState(true);
  const [date, setDate] = useState(new Date()); // default = today
  //const [date, setDate] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  

  const [focusField, setFocusField] = useState("");

  const formattedDate = date
    ? `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}/${date.getFullYear()}`
    : "";

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // helper function (add this before return)
  const isTextMode = (field, value) => {
    if (focusField === field) return true;
    return value !== "" && value !== null && value !== undefined;
  };


  // 👉 Handle backend call
  const handleNext = async () => {
    if (!firstName || !lastName || !email || !phoneNumber || !gender || !password || !date) {
      Alert.alert("Missing Info", "Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/api/customer/sign-up/personal-info`, {
        firstName,
        middleName,
        lastName,
        emailAddress: email, // must match backend field name
        phoneNumber,
        birthday: date ? date.toISOString().split("T")[0] : "2000-01-01",
        gender,
        password,
      });

      if (res.data.success) {
        Alert.alert("Success", "Step 1 completed!");
        // 👉 Pass customerId to the next step
        router.push({
          pathname: "/signup/address",
          params: { customerId: res.data.customerId },
        });
      } else {
        Alert.alert("Error", res.data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#057474" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: height * 0.1 }}
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
          {/* First Name */}
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

          {/* Middle Name */}
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

          {/* Last Name */}
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

          {/* Email */}
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

          {/* Phone Number */}
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

          {/* Birthday picker (Pressable) */}
          <Pressable
            style={[styles.input /* container style */]}
            onPress={() => {
              setShow(true);
              setFocusField("birthday");
            }}
          >
            <Text
              style={{
                color: date ? "#000" : "#888",
                fontSize: isTextMode("birthday", date) ? inputFontSize : inputFontSize * 0.8,
                textAlignVertical: isTextMode("birthday", date) ? "center" : "top",
                transform: [{ translateY: isTextMode("birthday", date) ? 0 : 7 }],
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
                // selectedDate is undefined on dismiss in Android
                if (selectedDate) {
                  setDate(selectedDate);
                }
                setShow(false);
                setFocusField(""); // clear focus after picker closes
              }}
            />
          )}

          {/* Gender */}
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

          {/* Password */}
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

        <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={handleNext}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Saving..." : "Next"}
                </Text>
        </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const inputFontSize = width * 0.04;
const inputPaddingVertical = height * 0.015;
const lockedHeight = inputPaddingVertical * 2 + inputFontSize + 10; // locked height

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
    paddingHorizontal: 16,
    marginBottom: 15,
    fontSize: inputFontSize,
    lineHeight: Math.round(inputFontSize * 1.2),
    color: "#000",
    borderColor: "#057474",
    backgroundColor: "#FFF6F6",
    textAlign: "left",
    textAlignVertical: "center", // typed text centered
    includeFontPadding: false,
  },
  placeholderInput: {
    fontSize: inputFontSize * 0.8, // smaller placeholder
    textAlignVertical: "top", // sits higher
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
});
