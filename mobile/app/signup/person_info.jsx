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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

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
  const [hidden, setHidden] = useState(true); // password toggle
  const [date, setDate] = useState(null);
  const [show, setShow] = useState(false);
  const formattedDate = date
    ? `${String(date.getDate()).padStart(2, "0")}/${
        String(date.getMonth() + 1).padStart(2, "0")}/${
        date.getFullYear()}`
    : "";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#057474" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: height * 0.1}}>
        
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
          <TextInput
            style={styles.input}
            placeholder="First Name *"
            placeholderTextColor="#888"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="sentences"
          />
          <TextInput
            style={styles.input}
            placeholder="Middle Name *"
            placeholderTextColor="#888"
            value={middleName}
            onChangeText={setMiddleName}
            autoCapitalize="sentences"
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name *"
            placeholderTextColor="#888"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="sentences"
          />
          <TextInput
            style={styles.input}
            placeholder="Email *"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number *"
            placeholderTextColor="#888"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          {/* Birthday picker */}
          <Pressable
            style={styles.input}
            onPress={() => setShow(true)}
          >
            <Text style={{ color: date ? "#000" : "#888" }}>
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
                const currentDate = selectedDate || date;
                setShow(false);
                setDate(currentDate);
              }}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Gender *"
            placeholderTextColor="#888"
            value={gender}
            onChangeText={setGender}
            autoCapitalize="words"
          />
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Password *"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              secureTextEntry={hidden}/>
            <Pressable onPress={() => setHidden(!hidden)} style={styles.eyeIcon}>
              <Ionicons
                name={hidden ? "eye-off" : "eye"}
                size={24}
                color="#888"
              />
            </Pressable>
          </View>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => router.push("/signup/address")}
          >
            <Text style={styles.buttonText}>Next</Text>
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
    top: height * 0.10,
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
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: height * 0.015,
    paddingHorizontal: 14,
    marginBottom: 15,
    fontSize: width * 0.04,
    color: "#000",
    borderColor: '#057474',
    backgroundColor: "#FFF6F6",
  },
  passwordWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 15,
    borderColor: '#057474',
    backgroundColor: "#FFF6F6",
  },
  inputPassword: {
    flex: 1,
    paddingVertical: height * 0.018,
    fontSize: width * 0.04,
    color: "#000",
    
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
