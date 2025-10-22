import React, { useState, useEffect, useId } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
  Image
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import axios from 'axios';
import { Protected } from "expo-router/build/views/Protected";
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width, height } = Dimensions.get("window");

// ✅ Responsive constants derived from screen size
const HEADER_HEIGHT = Math.max(64, Math.round(height * 0.09)); // at least 64px
const ICON_BOX = Math.round(width * 0.10); // 12% of width for icon slots
const ICON_SIZE = Math.max(20, Math.round(width * 0.06)); // icons scale with width
const TITLE_FONT = Math.max(16, Math.round(width * 0.045)); // title font adapts to width
const PADDING_H = Math.round(width * 0.02); // horizontal padding scales
const MARGIN_TOP = Math.round(height * 0.02); // top margin scales

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState("");

    useEffect(() => {
    loadUserData(); // run only once on mount
    }, []);

    useEffect(() => {
    if (userId) {
        fetchNotifications(); // run only when userId is available
    }
    }, [userId]);


  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        console.log("From local storgae", userData);
        setUserId(user.id || "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

    const fetchNotifications = async () => {
    try {
        console.log("Fetching notifications for userId:", userId);

        const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/book/notification/${userId}`
        );

        if (response.data.success) {
        console.log("Notifications:", response.data.data);
        setNotifications(response.data.data);
        } else {
        console.log("No notifications found");
        }
    } catch (error) {
        console.error("Error fetching notifications:", error);
    }
    };

    const handleNavigation = (route) => {
        router.push(`/${route}`);
    };



  return (
    <View style={styles.container}>
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
            Notifications
          </Text>

          {/* Right: placeholder (keeps title centered) */}
          <View style={[styles.iconBox, { width: ICON_BOX }]} />
        </View>
      </View>

      {/* Body */}
      <View style={styles.bodyWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.length === 0 ? (
            <Text style={styles.noNotif}>No notifications yet.</Text>
        ) : (
            notifications.map((notif, index) => (
                            
            // Inside notifications.map
            <Pressable
            key={notif.id}
            style={styles.messageRow}
            onPress={() =>
                router.push({
                pathname: "/customer/notificationDetails",
                params: { ...notif }, // pass everything including itemImage
                })
            }
            >
            {/* Avatar / Image */}
            {notif.itemImage ? (
                <Image
                source={{ uri: notif.itemImage }}
                style={styles.avatarImage}
                resizeMode="cover"
                />
            ) : (
                <View style={styles.avatar}>
                <Icon name="photo-camera" size={28} color="#666" />
                </View>
            )}

            {/* Message content */}
            <View style={styles.messageContent}>
                <Text style={styles.messageName} numberOfLines={1}>
                {notif.product || "Unknown Product"}
                </Text>
                <Text style={styles.messagePreview} numberOfLines={1}>
                {notif.status} • Pickup: {notif.pickUpDate}
                </Text>
            </View>

             <View style={styles.horizontalLine} />

            {/* Date */}
            <Text style={styles.messageDate}>
                {new Date(notif.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                })}
            </Text>
            </Pressable>

            ))
        )}
        </ScrollView>

        </View>

      {/* 🔹 Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { name: "Home", icon: "home", route: "customer/home" },
          { name: "Book", icon: "shopping-cart", route: "customer/book" },
          { name: "Message", icon: "mail", route: "customer/message" },
          { name: "Time", icon: "schedule", route: "customer/time" },
        ].map((navItem, index) => (
          <Pressable
            key={index}
            style={styles.navButton}
            hitSlop={10}
            onPress={() => handleNavigation(navItem.route)}
          >
            <Icon name={navItem.icon} size={24} color="#fff" />
            <Text style={styles.navText}>{navItem.name}</Text>
          </Pressable>
        ))}
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
    padding: width * 0.02, // tap area scales with width
    borderRadius: 6,
  },

  pageName: {
    color: "#FFF",
    textAlign: "center",
    flex: 1,
    paddingHorizontal: width * 0.015, // keeps spacing consistent
    fontWeight: "600",
  },

  bodyWrapper: {
    flex: 1,
    paddingHorizontal: width * 0.04, // responsive padding
    paddingBottom: height * 0.04, // scales bottom padding
    justifyContent: "space-between",

  },

  scrollContent: {
    flexGrow: 1,
    marginTop: 5,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: height * 0.015,
    backgroundColor: "#057474",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: { 
    alignItems: "center", 
    flex: 1,
    zIndex: 10, 
  },
    
  navText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.03,
    marginTop: height * 0.005,
  },

  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },

  messageRow: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#ddd",
},

avatar: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: "#ccc",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
},

messageContent: {
  flex: 1,
},

messageName: {
  fontSize: 16,
  fontWeight: "600",
  color: "#000",
},

messagePreview: {
  fontSize: 14,
  color: "#666",
  marginTop: 2,
},
horizontalLine: {
    position: "absolute",
    height: 1.5,
    backgroundColor: "#05747480",
    width: "80%", 
    left: "18%",
    top: 80,                    
    zIndex: 1,       
  },

messageDate: {
  fontSize: 12,
  color: "#666",
  marginLeft: 8,
},

noNotif: {
  textAlign: "center",
  marginTop: 20,
  fontSize: 14,
  color: "#666",
},
avatarImage: {
  width: 48,
  height: 48,
  borderRadius: 24,
  marginRight: 12,
  backgroundColor: "#ddd",
  marginTop: 10,
},


});


