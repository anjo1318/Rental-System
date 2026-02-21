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
  Dimensions,
  Image,
  
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // chatId
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [userName, setUserName] = useState("");
  const [chatDetails, setChatDetails] = useState(null);
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();

  console.log("💬 ChatScreen - Chat ID:", id);

  // Get user ID and token from storage
  useEffect(() => {
    const getUserData = async () => {
      try {
        console.log("🔑 Getting user data from AsyncStorage");
        const userStr = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("token");
        
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log("👤 User data:", user);
          setUserId(user.id);
          setUserName(`${user.firstName} ${user.lastName}`);
        }
        if (storedToken) {
          console.log("✅ Token retrieved");
          setToken(storedToken);
        }
      } catch (err) {
        console.error("❌ Error getting user data:", err);
      }
    };
    getUserData();
  }, []);

  // Fetch chat details (to get other user's info)
  useEffect(() => {
    if (!userId || !token) return;

    const fetchChatDetails = async () => {
      try {
        console.log("📡 Fetching chat details for chat ID:", id);
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/api/chat/user-chats`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (res.data.success) {
          console.log("✅ Chat details fetched");
          // Find the specific chat
          const currentChat = res.data.data.find(chat => chat.id === parseInt(id));
          console.log("💬 Current chat details:", currentChat);
          setChatDetails(currentChat);
        }
      } catch (err) {
        console.error("❌ Error fetching chat details:", err);
      }
    };

    fetchChatDetails();
  }, [id, userId, token]);

  // Fetch messages
  useEffect(() => {
    if (!userId || !token) return;

    const fetchMessages = async () => {
      try {
        console.log("📡 Fetching messages for chat ID:", id);
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/api/message/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        console.log("✅ Messages fetched:", res.data.length, "messages");
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
        Alert.alert("Error", "Failed to fetch messages");
      }
    };
    fetchMessages();
  }, [id, userId, token]);

  const handleSend = async () => {
    if (!input.trim() || !userId || !token) return;
    
    console.log("📤 Sending message:", input);
    
    try {
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/message`,
        {
          chatId: id,
          senderId: userId,
          content: input,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (res.data.success) {
        console.log("✅ Message sent successfully");
        setMessages((prev) => [...prev, res.data.data]);
        setInput("");
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
      Alert.alert("Error", "Failed to send message");
    }
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.senderId === userId;
    
    return (
      <View style={[styles.messageWrapper, isOwnMessage && styles.ownMessageWrapper]}>
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessage : styles.otherMessage,
          ]}
        >
          <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

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
  currentUserId={userId}
  newMessage={input}
  setNewMessage={setInput}
  handleSendMessage={handleSend}
  sending={false}
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
});