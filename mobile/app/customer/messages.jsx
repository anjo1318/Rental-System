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
  keyboardHeight,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import ChatContainer from "../components/chatContainer";
import ScreenWrapper from "../components/screenwrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";


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
   
  <ScreenWrapper>
    {/* Status Bar */}
    <StatusBar
      barStyle="dark-content"
      backgroundColor="#fff"
      translucent={false}
    />

<View style={styles.headerWrapper}>
  <View style={styles.headerContent}>
    {/* Back button */}
    <View style={styles.iconBox}>
      <Pressable
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/customer/home");
          }
        }}
        hitSlop={10}
      >
        <Icon name="arrow-back" size={ICON_SIZE} color="#000" />
      </Pressable>
    </View>

    {/* Avatar + Seller Name */}
    <View style={styles.userInfo}>
      <Image
        source={{
          uri: "https://i.pravatar.cc/150?img=5", // Random seller avatar
        }}
        style={styles.avatar}
      />
      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerTitle}>
        John Doe  {/* Random seller name */}
      </Text>
    </View>

    {/* Spacer */}
    <View style={styles.iconBox} />
  </View>
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
  keyboardHeight={keyboardHeight}
  insets={insets}
/>


    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    height: HEADER_HEIGHT,
    backgroundColor: "#fff",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1,
    borderColor: "#00000040",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,   // #40 ≈ 25% opacity
    shadowRadius: 4,
    elevation: 4,       
    overflow: "hidden",
    
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PADDING_H,
    marginTop: MARGIN_TOP,
    
  },
  iconBox: {
    width: ICON_BOX,
    alignItems: "center",
  },

  userInfo: {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
  marginLeft: 10, // space from back button
  
},

avatar: {
  width: 33,
  height: 33,
  borderRadius: 18,
  left: 20,
},

headerTitle: {
  flex: 1,
  color: "#000",
  fontSize: TITLE_FONT,
  fontWeight: "600",
  left: 30,
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