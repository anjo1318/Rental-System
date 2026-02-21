import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width, height } = Dimensions.get("window");

const HEADER_HEIGHT = Math.max(64, Math.round(height * 0.09));
const ICON_BOX = Math.round(width * 0.10);
const ICON_SIZE = Math.max(20, Math.round(width * 0.06));
const TITLE_FONT = Math.max(16, Math.round(width * 0.045));
const PADDING_H = Math.round(width * 0.02);
const MARGIN_TOP = Math.round(height * 0.02);

export default function Chat() {
  const router = useRouter();
  const { id: chatId, itemId } = useLocalSearchParams();
  const scrollViewRef = useRef();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [otherUserName, setOtherUserName] = useState("Chat");

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    console.log("🌐 API_URL from env:", API_URL);
    initializeChat();
  }, [chatId, itemId]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (chatData && chatData.id && chatData.id !== 'undefined') {
      console.log("🔄 Starting message polling for chat:", chatData.id);
      const interval = setInterval(() => {
        fetchMessages();
      }, 3000);

      return () => {
        console.log("🛑 Stopping message polling");
        clearInterval(interval);
      };
    } else {
      console.log("⏸️ Message polling not started - no valid chatData yet");
    }
  }, [chatData]);

  const initializeChat = async () => {
    try {
      setLoading(true);

      // Get current user
      const userData = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (!userData || !token) {
        Alert.alert("Error", "Please login first");
        router.back();
        return;
      }

      const user = JSON.parse(userData);
      setCurrentUserId(user.id);
      console.log("👤 Current user ID:", user.id);

      // Parse chatId from params
      const parsedChatId = chatId && chatId !== 'undefined' && chatId !== 'null' ? parseInt(chatId) : null;
      
      if (parsedChatId && !isNaN(parsedChatId)) {
        console.log("✅ Using existing chatId:", parsedChatId);
        
        // Fetch the chat details from backend
        try {
          const chatResponse = await axios.get(
            `${API_URL}/api/chat/${parsedChatId}`,  // ✅ FIXED: Correct URL with slash
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (chatResponse.data.success) {
            setChatData(chatResponse.data.data);
            console.log("✅ Chat data loaded:", chatResponse.data.data);
            
            // Fetch messages for this chat
            await fetchMessages(parsedChatId);
            
            // Set chat name if available
            setOtherUserName("Chat");
          } else {
            throw new Error("Failed to load chat data");
          }
        } catch (chatError) {
          console.error("❌ Error loading chat:", chatError);
          Alert.alert(
            "Error", 
            "Failed to load chat. Please try again.",
            [{ text: "OK", onPress: () => router.back() }]
          );
          return;
        }
      } else {
        console.error("❌ No valid chatId provided");
        Alert.alert(
          "Error", 
          "Chat session not initialized properly. Please try again.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }

    } catch (error) {
      console.error("❌ Chat initialization error:", error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || error.message || "Failed to initialize chat",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatIdParam) => {
    try {
      const id = chatIdParam || chatData?.id;
      
      console.log("📨 Fetching messages for chatId:", id);
      
      if (!id || id === 'undefined' || id === 'null') {
        console.log("⚠️ Invalid chatId, skipping message fetch");
        return;
      }

      const token = await AsyncStorage.getItem("token");
      
      const response = await axios.get(
        `${API_URL}/api/message/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log("✅ Messages fetched:", response.data.length, "messages");
      setMessages(response.data);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("❌ Error fetching messages:", error.response?.data || error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/api/message`,
        {
          chatId: chatData.id,
          senderId: currentUserId,
          content: messageText,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log("✅ Message sent:", response.data);

      // Fetch updated messages
      await fetchMessages();
    } catch (error) {
      console.error("❌ Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
      setNewMessage(messageText); // Restore message
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#057474" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#057474" />

      {/* Header */}
      <View style={[styles.headerWrapper, { height: HEADER_HEIGHT }]}>
        <View style={styles.topBackground}>
          <View
            style={[
              styles.profileContainer,
              { paddingHorizontal: PADDING_H, marginTop: MARGIN_TOP },
            ]}
          >
            <View style={[styles.iconBox, { width: ICON_BOX }]}>
              <Pressable
                onPress={() => router.back()}
                hitSlop={10}
                style={styles.iconPress}
              >
                <Icon name="arrow-back" size={ICON_SIZE} color="#FFF" />
              </Pressable>
            </View>

            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.pageName, { fontSize: TITLE_FONT }]}
            >
              {otherUserName}
            </Text>

            <View style={[styles.iconBox, { width: ICON_BOX }]} />
          </View>
        </View>
      </View>

      {/* Chat Body */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.chatBody}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="chat-bubble-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start the conversation by sending a message
            </Text>
          </View>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <View
                key={message.id}
                style={[
                  styles.bubble,
                  isOwn ? styles.buyerBubble : styles.sellerBubble,
                ]}
              >
                <Text style={isOwn ? styles.buyerText : styles.sellerText}>
                  {message.content}
                </Text>
                <Text style={styles.timestamp}>
                  {formatTime(message.createdAt)}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputWrapper}>
        <Pressable disabled>
          <Icon 
            name="add-circle-outline" 
            size={26} 
            color="#ccc" 
          />
        </Pressable>

        <TextInput
          placeholder="Type a message..."
          style={styles.input}
          placeholderTextColor="#999"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
          editable={!sending}
        />

        <Pressable 
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#057474" />
          ) : (
            <Icon 
              name="send" 
              size={24} 
              color={newMessage.trim() ? "#057474" : "#ccc"} 
            />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ... keep your existing styles
  container: {
    flex: 1,
    backgroundColor: "#E6E1D6",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E6E1D6",
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },

  headerWrapper: {
    width: "100%",
    backgroundColor: "#007F7F",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  topBackground: {
    backgroundColor: "#007F7F",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconBox: {
    alignItems: "center",
    justifyContent: "center",
    top: 10,
  },

  iconPress: {
    padding: width * 0.02,
  },

  pageName: {
    color: "#FFF",
    textAlign: "center",
    flex: 1,
    fontWeight: "600",
    top: 10,
  },

  chatBody: {
    padding: 16,
    paddingBottom: 90,
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },

  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },

  bubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  buyerBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#78CFCB",
  },

  sellerBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  buyerText: {
    color: "#000",
    fontSize: 15,
  },

  sellerText: {
    color: "#000",
    fontSize: 15,
  },

  timestamp: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  input: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    fontSize: 14,
    maxHeight: 100,
  },
});