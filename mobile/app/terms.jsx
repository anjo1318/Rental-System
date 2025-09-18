import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, Pressable } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function ProfileHeader() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.profileContainer}>
          {/* left: back button */}
          <Pressable onPress={() => router.push("/home")}>
            <Icon name="arrow-back" size={22} color="#000" style={{ marginTop: 25 }} />
          </Pressable>

          {/* center: page title */}
          <Text style={styles.pageName}>Terms and Conditions</Text>
        </View>
      </View>

      {/* Non-header Content */}
      <View style={styles.bodyWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent}></ScrollView>
        <Text>RENTAL AGREEMENT</Text>
        <Text>GENERAL TERMS AND CONDITION</Text>

      </View>
    </View>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E1D6",
  },

  headerWrapper: {
    width: "100%",
    backgroundColor: "#057474",
    paddingTop: 40,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
    height: "13%",
    
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  pageName: {
    fontSize: width * 0.043,
    color: "#FFF",
    textAlign: "center",
    flex: 1,
    marginTop: 24,
    marginRight: 30,
  },

 
  






});
