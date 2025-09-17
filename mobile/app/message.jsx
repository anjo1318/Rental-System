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
          <Text style={styles.pageName}>Messages</Text>
        </View>
      </View>

          {/* Non-header Content */}
    <View style={styles.bodyWrapper}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      </ScrollView>

      {/* Buttons pinned at bottom */}
        <View style={styles.bottomContainer}>
          <Pressable style={[styles.button, styles.deleteButton, { flex: 0, width: "30%" }]}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>

          <Pressable style={[styles.button, styles.proceedButton, { flex: 0, width: "60%" }]}>
            <Text style={styles.proceedText}>Proceed to Renting</Text>
          </Pressable>
        </View>

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

 
  bodyWrapper: {
  flex: 1,
  paddingHorizontal: 16,
  paddingBottom: 30,
  justifyContent: "space-between", // pushes buttons to bottom
},

scrollContent: {
  flexGrow: 1, // makes scrollview expand
},

bottomContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 20,
},

button: {
  flex: 1,
  paddingVertical: 12,
  marginHorizontal: 5,
  borderRadius: 8,
  alignItems: "center",
},

deleteButton: {
  backgroundColor: "#FFF",
  borderColor: "#D40004",
  borderWidth: .7,
  borderRadius: 10,
},

proceedButton: {
  backgroundColor: "#057474",
  borderRadius: 10,
},

deleteText: {
  color: "#D40004",
  fontSize: 13,
},

proceedText: {
  color: "#FFF",
  fontSize: 13,
},

});
