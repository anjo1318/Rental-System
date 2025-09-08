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

  const [houseBuilding, setHouseBuilding] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [town, setTown] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");

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
            style={styles.input}
            placeholder="House No./Building No. *"
            placeholderTextColor="#888"
            value={houseBuilding}
            onChangeText={setHouseBuilding}
            autoCapitalize="sentences"
            keyboardType="default"
          />
          <TextInput
            style={styles.input}
            placeholder="Street *"
            placeholderTextColor="#888"
            value={street}
            onChangeText={setStreet}
            autoCapitalize="sentences"
          />
          <TextInput
            style={styles.input}
            placeholder="Barangay *"
            placeholderTextColor="#888"
            value={barangay}
            onChangeText={setBarangay}
            autoCapitalize="sentences"
          />
          <TextInput
            style={styles.input}
            placeholder="Town *"
            placeholderTextColor="#888"
            value={town}
            onChangeText={setTown}
            autoCapitalize="sentences"
          />
          <TextInput
            style={styles.input}
            placeholder="Province *"
            placeholderTextColor="#888"
            value={province}
            onChangeText={setProvince}
            keyboardType="default"
            autoCapitalize="sentences"       
          />
          <TextInput
            style={styles.input}
            placeholder="Country *"
            placeholderTextColor="#888"
            value={country}
            onChangeText={setCountry}
            autoCapitalize="sentences"
          />
          <TextInput
            style={styles.input}
            placeholder="Zip Code *"
            placeholderTextColor="#888"
            value={zipCode}
            onChangeText={setZipCode}
            autoCapitalize="sentences"
          />
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => router.push("/signup/id_upload")}
          >
            <Text style={styles.buttonText}>Next</Text>
            
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.previous, pressed && styles.previousPressed]}
            onPress={() => router.push("/signup/person_info")}
          >
            <Text style={styles.previousText}>Previous</Text>
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
