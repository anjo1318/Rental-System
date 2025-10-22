import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ownerTime() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState(null);
  const flatListRef = useRef();

  const loadOwner = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setOwnerId(user.id);
      } else {
        router.replace("owner/ownerLogin");
      }
    } catch (err) {
      console.error("Error loading owner:", err);
      router.replace("owner/ownerLogin");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("owner/ownerHome")} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Owner Listing</Text>
      </View>


    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E1D6",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#057474",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "600",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    maxWidth: "80%",
  },
  ownerMessage: {
    backgroundColor: "#057474",
    alignSelf: "flex-end",
  },
  userMessage: {
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 14,
    color: "#333",
  },
  timestamp: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#FFF",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
    fontSize: 14,
    backgroundColor: "#F5F5F5",
  },
  sendButton: {
    backgroundColor: "#057474",
    padding: 10,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
