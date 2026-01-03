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
import OwnerBottomNav from '../components/OwnerBottomNav';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

// ✅ Responsive constants derived from screen size
const HEADER_HEIGHT = Math.max(64, Math.round(height * 0.12));
const ICON_BOX = Math.round(width * 0.10);
const ICON_SIZE = Math.max(20, Math.round(width * 0.06));
const TITLE_FONT = Math.max(16, Math.round(width * 0.045));
const PADDING_H = Math.round(width * 0.04);
const MARGIN_TOP = Math.round(height * 0.045);

export default function ProfileHeader() {
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        
        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/api/chat/user-chats`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (res.data.success) {
          setChats(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time parts for comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
      return "Today";
    } else if (compareDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  return (
    <View style={styles.container}>
      <OwnerBottomNav/>

      {/* Status bar */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="#057474"
        translucent={false}
      />

      {/* Header */}
      <View style={[styles.headerWrapper, { height: HEADER_HEIGHT }]}>
        <View style={[styles.profileContainer, { paddingHorizontal: PADDING_H, marginTop: MARGIN_TOP }]}>
          {/* Left: back button */}
          <View style={[styles.iconBox, { width: ICON_BOX }]}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={styles.iconPress}
            >
              <Icon name="arrow-back" size={ICON_SIZE} color="#FFF" />
            </Pressable>
          </View>

          {/* Center: page title */}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.pageName, { fontSize: TITLE_FONT }]}
          >
            Messages
          </Text>

          {/* Right: placeholder (keeps title centered) */}
          <View style={[styles.iconBox, { width: ICON_BOX }]} />
        </View>
      </View>

      {/* Body */}
      <View style={styles.bodyWrapper}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#057474" />
          </View>
        ) : chats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {chats.map((chat) => (
              <Pressable
                key={chat.id}
                style={styles.messageItem}
                onPress={() => router.push(`/owner/ownerChat?id=${chat.id}&itemId=${chat.itemId}`)}
              >
                <View style={styles.bottomDivider} />
                <Image
                  source={{ uri: "https://i.pravatar.cc/150?img=3" }}
                  style={styles.avatar}
                />
                <View style={styles.messageContent}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.sender}>Chat #{chat.id}</Text>
                    <Text style={styles.date}>{formatDate(chat.updatedAt)}</Text>
                  </View>
                  <Text style={styles.preview} numberOfLines={1}>
                    Item ID: {chat.itemId}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E1D6",
  },

  headerWrapper: {
    width: "100%",
    backgroundColor: "#057474",
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
    justifyContent: "center",
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconBox: {
    alignItems: "center",
    justifyContent: "center",
  },

  iconPress: {
    padding: width * 0.02,
    borderRadius: 6,
  },

  pageName: {
    color: "#FFF",
    textAlign: "center",
    flex: 1,
    paddingHorizontal: width * 0.015,
    fontWeight: "600",
  },

  bodyWrapper: {
    flex: 1,
    paddingBottom: height * 0.04,
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

  scrollContent: {
    flexGrow: 1,
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
});