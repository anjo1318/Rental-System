import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";

export default function ChatScreen({ sender }) {
  const { id } = useLocalSearchParams(); // chatId or itemId
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/api/chat/${id}`
        );
        if (res.data.success) setMessages(res.data.data);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to fetch messages");
      }
    };
    fetchMessages();
  }, [id]);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/chat`, {
        chatId: id,
        sender, // 'user' or 'owner'
        text: input,
      });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setInput("");
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to send message");
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === sender ? styles.userMessage : styles.ownerMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Icon name="arrow-back" size={28} color="#057474" />
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
        />
        <Pressable onPress={handleSend} style={styles.sendButton}>
          <Icon name="send" size={24} color="#FFF" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6E1D6" },
  backButton: { margin: 16 },
  messagesList: { padding: 16, paddingBottom: 80 },
  messageContainer: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
  },
  userMessage: { backgroundColor: "#057474", alignSelf: "flex-end", borderBottomRightRadius: 0 },
  ownerMessage: { backgroundColor: "#ccc", alignSelf: "flex-start", borderBottomLeftRadius: 0 },
  messageText: { color: "#FFF" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#FFF",
  },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 25, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, backgroundColor: "#FFF" },
  sendButton: { backgroundColor: "#057474", padding: 12, borderRadius: 25 },
});
