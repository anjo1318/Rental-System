import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { usePathname } from "expo-router";
import CustomerBottomNav from '../components/CustomerBottomNav';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

// ✅ Responsive constants derived from screen size
const HEADER_HEIGHT = Math.max(64, Math.round(height * 0.09));
const ICON_BOX = Math.round(width * 0.10);
const ICON_SIZE = Math.max(20, Math.round(width * 0.06));
const TITLE_FONT = Math.max(16, Math.round(width * 0.045));
const PADDING_H = Math.round(width * 0.02);
const MARGIN_TOP = Math.round(height * 0.02);

export default function Messages() {
  const router = useRouter();
  const pathname = usePathname();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("📱 Messages Component Rendered");
  console.log("📍 Current pathname:", pathname);

  useEffect(() => {
    console.log("🔄 useEffect triggered - Starting to fetch chats");

    const fetchChats = async () => {
      try {
        console.log("🔑 Attempting to retrieve token from AsyncStorage");
        const token = await AsyncStorage.getItem("token");
        
        if (!token) {
          console.error("❌ No token found in AsyncStorage");
          setLoading(false);
          return;
        }

        console.log("✅ Token retrieved successfully");
        console.log("🔗 API URL:", process.env.EXPO_PUBLIC_API_URL);
        
        const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/chat/user-chats`;
        console.log("📡 Making API request to:", apiUrl);

        const res = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log("📥 API Response status:", res.status);
        console.log("📦 API Response data:", JSON.stringify(res.data, null, 2));

        if (res.data.success) {
          console.log("✅ Chats fetched successfully");
          console.log("💬 Number of chats:", res.data.data.length);
          setChats(res.data.data);
        } else {
          console.warn("⚠️ API returned success: false");
        }
      } catch (err) {
        console.error("❌ Error fetching chats:", err);
        console.error("❌ Error message:", err.message);
        if (err.response) {
          console.error("❌ Response status:", err.response.status);
          console.error("❌ Response data:", err.response.data);
        }
      } finally {
        console.log("🏁 Fetch complete, setting loading to false");
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const formatDate = (dateString) => {
    console.log("📅 Formatting date:", dateString);
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time parts for comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    let formattedDate;
    if (compareDate.getTime() === today.getTime()) {
      formattedDate = "Today";
    } else if (compareDate.getTime() === yesterday.getTime()) {
      formattedDate = "Yesterday";
    } else {
      formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
    }
    
    console.log("📅 Formatted date result:", formattedDate);
    return formattedDate;
  };

  const handleChatPress = (chat) => {
    console.log("💬 Chat pressed:", {
      chatId: chat.id,
      itemId: chat.itemId,
      otherUser: chat.otherUserName,
    });
    console.log("🔗 Navigating to:", `/customer/chat?id=${chat.id}&itemId=${chat.itemId}`);
    router.push(`/customer/chat?id=${chat.id}&itemId=${chat.itemId}`);
  };

  const handleBackPress = () => {
    console.log("⬅️ Back button pressed");
    router.back();
  };

  console.log("🎨 Rendering UI with:", {
    loading,
    chatsCount: chats.length,
  });

  return (
    <View style={styles.container}>
      <CustomerBottomNav/>

      {/* Status bar */}
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
              <Pressable onPress={handleBackPress} hitSlop={10} style={styles.iconPress}>
                <Icon name="arrow-back" size={ICON_SIZE} color="#FFF" />
              </Pressable>
            </View>

            <Text style={[styles.pageName, { fontSize: TITLE_FONT }]}>Messages</Text>

            <View style={[styles.iconBox, { width: ICON_BOX }]} />
          </View>
        </View>
      </View>

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#057474" />
          {console.log("⏳ Showing loading indicator")}
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages yet</Text>
          {console.log("📭 Showing empty state")}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.messageList}>
          {console.log("📜 Rendering chat list")}
          {chats.map((chat) => {
            console.log("💬 Rendering chat item:", {
              id: chat.id,
              otherUser: chat.otherUserName,
              hasLastMessage: !!chat.lastMessage
            });
            
            return (
              <Pressable
                key={chat.id}
                style={styles.messageItem}
                onPress={() => handleChatPress(chat)}
              >
                <View style={styles.bottomDivider} />
                <Image
                  source={{ uri: "https://i.pravatar.cc/150?img=3" }}
                  style={styles.avatar}
                />
                <View style={styles.messageContent}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.sender}>
                      {chat.otherUserName || `Chat #${chat.id}`}
                    </Text>
                    <Text style={styles.date}>
                      {chat.lastMessage 
                        ? formatDate(chat.lastMessage.createdAt)
                        : formatDate(chat.updatedAt)
                      }
                    </Text>
                  </View>
                  <Text style={styles.preview} numberOfLines={1}>
                    {chat.lastMessage 
                      ? chat.lastMessage.text 
                      : `Item ID: ${chat.itemId}`
                    }
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#E6E1D6" 
  },

  headerWrapper: {
    width: "100%",
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
    left: 10,
  },

  iconPress: { 
    padding: width * 0.02 
  },

  topBackground: {
    backgroundColor: "#007F7F",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  pageName: {
    color: "#FFF",
    textAlign: "center",
    flex: 1,
    fontWeight: "600",
    top: 10,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    color: "#888",
    fontSize: 16,
  },

  messageList: {
    paddingBottom: height * 0.12,
  },

  messageItem: {
    flexDirection: "row",
    backgroundColor: "#E6E1D6",
    padding: 20,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },

  bottomDivider: {
    position: "absolute",
    bottom: 0,
    left: 68,
    right: 0,
    height: 1,
    backgroundColor: "#05747480",
  },

  messageContent: {
    flex: 1,
  },

  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sender: {
    fontWeight: "600",
    color: "#000",
  },

  date: {
    fontSize: 12,
    color: "#888",
  },

  preview: {
    color: "#666",
    marginTop: 4,
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: height * 0.015,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#00000040",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  navButton: { alignItems: "center", flex: 1 },

  navText: {
    fontWeight: "bold",
    fontSize: width * 0.03,
    marginTop: height * 0.005,
  },
});