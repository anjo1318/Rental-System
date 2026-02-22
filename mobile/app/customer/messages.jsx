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
import ScreenWrapper from "../components/screenwrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatContainer from "../components/chatContainer";


const { width, height } = Dimensions.get("window");

const HEADER_HEIGHT = Math.max(64, Math.round(height * 0.10));
const ICON_BOX = Math.round(width * 0.10);
const ICON_SIZE = Math.max(18, Math.round(width * 0.06));
const TITLE_FONT = Math.max(14, Math.round(width * 0.02));
const PADDING_H = Math.round(width * 0.02);
const MARGIN_TOP = Math.round(height * 0.04);

export default function Chat() {
  const router = useRouter();
  const { id: chatId, itemId } = useLocalSearchParams();
  const scrollViewRef = useRef();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // NEW: track auth state
  const [chatData, setChatData] = useState(null);
  const [otherUserName, setOtherUserName] = useState("Chat");
  const [chatDetails, setChatDetails] = useState(null);

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

      // NEW: If not logged in, mark as unauthenticated and stop
      if (!userData || !token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // NEW: Mark as authenticated
      setIsAuthenticated(true);

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
            `${API_URL}/api/chat/${parsedChatId}`,
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

  // NEW: Not logged in — show please login screen
  if (!isAuthenticated) {
    return (
      <ScreenWrapper>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#000" />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={styles.avatar}>
              <Icon name="person" size={24} color="#666" />
            </View>
            <Text style={styles.headerName}>Messages</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.unauthContainer}>
          <Icon name="lock-outline" size={64} color="#ccc" />
          <Text style={styles.unauthTitle}>Please Log In</Text>
          <Text style={styles.unauthSubtext}>
            You need to be logged in to view messages.
          </Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => router.push("/customer/loginInterface")}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  // Authenticated — show full chat
  return (
    <ScreenWrapper>
        <View style={styles.container}>
          
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#000" />
            </Pressable>
            
            <View style={styles.headerCenter}>
              {chatDetails?.otherUserImage ? (
                <Image
                  source={{ uri: chatDetails.otherUserImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Icon name="person" size={24} color="#666" />
                </View>
              )}
              <Text style={styles.headerName}>
                {chatDetails?.otherUserName || "Loading..."}
              </Text>
            </View>
            
            <View style={styles.headerRight} />
          </View>

       <ChatContainer
        messages={messages}
        currentUserId={currentUserId}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        sending={sending}
        scrollViewRef={scrollViewRef}
        formatTime={formatTime}
        insets={insets}
      />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#00000040",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  backButton: {
    padding: 4,
  },

  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: "#E0E0E0",
  },

  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  headerRight: {
    width: 24,
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

  // NEW: unauthenticated screen styles
  unauthContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#fff",
  },

  unauthTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },

  unauthSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },

  loginButton: {
    backgroundColor: "#057474",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },

  loginButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
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
});
