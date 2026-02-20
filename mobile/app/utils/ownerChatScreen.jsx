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

const { width, height } = Dimensions.get("window");

export default function OwnerChatScreen({ BottomNav }) {
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

  console.log("💬 Owner ChatScreen - Chat ID:", id);

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

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        style={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      
      {/* Input */}
           <KeyboardAvoidingView
       behavior={Platform.OS === "ios" ? "padding" : "height"}
       keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0} >
         <View style={[
          styles.inputContainer,
          { paddingBottom: insets.bottom || 10 }
        ]}>
          <Pressable style={styles.addButton}>
            <Icon name="add-circle-outline" size={28} color="#666" />
          </Pressable>
          
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
            multiline
          />
          
          <Pressable onPress={handleSend} style={styles.sendButton}>
            <Icon name="send" size={24} color="#03A3A3" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,   // #40 ≈ 25% opacity
    shadowRadius: 4,
    elevation: 4,       
    overflow: "hidden",
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

  messagesContainer: {
    flex: 1,
  },

  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 80,
  },

  messageWrapper: {
    marginBottom: 12,
    alignItems: "flex-start",
  },

  ownMessageWrapper: {
    alignItems: "flex-end",
  },

  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },

  ownMessage: {
    backgroundColor: "#03A3A3",
    borderBottomRightRadius: 4,
  },

  otherMessage: {
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  messageText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },

  ownMessageText: {
    color: "#FFF",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },

  addButton: {
    padding: 4,
    marginRight: 4,
  },

  input: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    maxHeight: 100,
    color: "#000",
  },

  sendButton: {
    padding: 8,
    marginLeft: 4,
  },
});