import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "expo-router";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/header";
import ScreenWrapper from "../components/screenwrapper";
import CustomerBottomNav from '../components/CustomerBottomNav';

const { width, height } = Dimensions.get("window");

export default function Messages() {
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // NEW

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChats();
    setRefreshing(false);
  };

  console.log("📱 Messages Component Rendered");
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

  const pathname = usePathname();

  useEffect(() => {
    console.log("🔁 Route changed — checking auth then refreshing data");
    const checkAuthAndFetch = async () => {
      const userData = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (!userData || !token) {
        // Not logged in — show login prompt immediately
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Logged in — fetch chats
      setIsAuthenticated(true);
      setLoading(true);
      await fetchChats();
    };

    checkAuthAndFetch();
  }, [pathname]);

  console.log("📍 Current pathname:", pathname);

  const formatDate = (dateString) => {
    console.log("📅 Formatting date:", dateString);
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

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
    isAuthenticated,
    chatsCount: chats.length,
  });

  return (
    <ScreenWrapper>
      <Header
        title="Messages"
        backgroundColor="#007F7F"
      />

      {/* NOT LOGGED IN — show login prompt */}
      {!isAuthenticated && !loading ? (
        <View style={styles.unauthContainer}>
          <Text style={styles.unauthTitle}>Please log in to view messages</Text>
        </View>

      /* LOADING */
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#057474" />
          {console.log("⏳ Showing loading indicator")}
        </View>

      /* EMPTY */
      ) : chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages yet</Text>
          {console.log("📭 Showing empty state")}
        </View>

      /* CHAT LIST */
      ) : (
        <ScrollView
          contentContainerStyle={styles.messageList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007F7F"]}
              tintColor="#007F7F"
            />
          }
        >
          {console.log("📜 Rendering chat list")}
          {chats.map((chat) => {
            console.log("💬 Rendering chat item:", {
              id: chat.id,
              otherUser: chat.otherUserName,
              hasLastMessage: !!chat.lastMessage,
              hasImage: !!chat.otherUserImage
            });
            
            return (
              <Pressable
                key={chat.id}
                style={styles.messageItem}
                onPress={() => handleChatPress(chat)}
              >
                <Image
                  source={{ 
                    uri: chat.otherUserImage 
                      ? chat.otherUserImage 
                      : "https://i.pravatar.cc/150?img=3" 
                  }}
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
                    {chat.lastMessage ? chat.lastMessage.text : ""}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <CustomerBottomNav />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#ffffff" 
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
    color: "#666",
    fontSize: 16,
  },

  messageList: {
    paddingBottom: height * 0.12,
  },

  messageItem: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 20,
    paddingBottom: 2,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 21,
    marginRight: 12,
  },

  messageContent: {
    flex: 1,
    top: 4,
  },

  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sender: {
    fontWeight: "600",
    color: "#000",
    fontSize: 14,
  },

  date: {
    fontSize: 12,
    color: "#888",
  },

  preview: {
    color: "#666",
    fontSize: 12,
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
    fontSize: 16,
    fontWeight: "400",
    color: "#333",
    marginBottom: 50,
    alignItems: 'center',
    justifyContent: 'center',


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
});
