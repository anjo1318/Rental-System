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

export default function OwnerMessages() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState(null);
  const flatListRef = useRef();

  // Load owner ID from AsyncStorage
  const loadOwner = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setOwnerId(user.id);
      } else {
        router.replace("/ownerLogin");
      }
    } catch (err) {
      console.error("Error loading owner:", err);
      router.replace("/ownerLogin");
    }
  };

  // Fetch messages from API
  const fetchMessages = async () => {
    if (!ownerId) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/messages?ownerId=${ownerId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      } else {
        console.error("Fetch messages error:", data.error);
      }
    } catch (err) {
      console.error("Fetch messages failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwner();
  }, []);

  useEffect(() => {
    if (ownerId) fetchMessages();
  }, [ownerId]);

  // Send new message to API
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/messages/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ownerId,
            text: newMessage,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        flatListRef.current.scrollToEnd({ animated: true });
      } else {
        console.error("Send message error:", data.error);
      }
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  const renderMessage = ({ item }) => {
    const isOwner = item.sender === "owner"; 
    return (
      <View
        style={[
          styles.messageBubble,
          isOwner ? styles.ownerMessage : styles.userMessage,
        ]}
      >
        <Text style={[styles.messageText, isOwner && { color: "#FFF" }]}>
          {item.text}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#057474" />
        <Text style={{ marginTop: 10 }}>Loading messages...</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() =>
          flatListRef.current.scrollToEnd({ animated: true })
        }
      />

      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Pressable style={styles.sendButton} onPress={handleSendMessage}>
          <Icon name="send" size={24} color="#FFF" />
        </Pressable>
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
