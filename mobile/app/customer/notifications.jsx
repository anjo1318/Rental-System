import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from "../components/header";

const { height } = Dimensions.get("window");


export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
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
        // Group by date
        const grouped = groupNotificationsByDate(response.data.data);
        setNotifications(grouped);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };

  // Group notifications by Today, Previous
  const groupNotificationsByDate = (notifs) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayNotifs = [];
    const previousNotifs = [];

    notifs.forEach(notif => {
      const notifDate = new Date(notif.created_at);
      notifDate.setHours(0, 0, 0, 0);

      if (notifDate.getTime() === today.getTime()) {
        todayNotifs.push(notif);
      } else {
        previousNotifs.push(notif);
      }
    });

    const result = [];
    if (todayNotifs.length > 0) {
      result.push({ section: 'Today', data: todayNotifs });
    }
    if (previousNotifs.length > 0) {
      result.push({ section: 'Previous', data: previousNotifs });
    }

    return result;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleNavigation = (route) => {
    router.push(`/${route}`);
  };

  // Format time (e.g., "09:41 AM")
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get notification icon based on type/status
  const getNotificationIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'ongoing': return { name: 'check-circle', color: '#4CAF50', bg: '#E8F5E9' };
      case 'pending': return { name: 'schedule', color: '#FF9800', bg: '#FFF3E0' };
      case 'cancelled': return { name: 'cancel', color: '#F44336', bg: '#FFEBEE' };
      case 'completed': return { name: 'done-all', color: '#2196F3', bg: '#E3F2FD' };
      default: return { name: 'notifications', color: '#057474', bg: '#E0F2F1' };
    }
  };

  // Generate notification title
  const getNotificationTitle = (notif) => {
    switch(notif.status?.toLowerCase()) {
      case 'ongoing':
        return 'Renting Successful';
      case 'pending':
        return 'Payment Being Processed';
      case 'cancelled':
        return 'Booking Cancelled';
      case 'completed':
        return 'Rental Completed';
      default:
        return 'Booking Update';
    }
  };

  // Generate notification message
  const getNotificationMessage = (notif) => {
    switch(notif.status?.toLowerCase()) {
      case 'confongoingirmed':
        return `Your rental for "${notif.product}" has been confirmed. Check your email for details and instructions. Safe travels!`;
      case 'pending':
        return `Your payment was processed successfully! Keep using the app.`;
      case 'cancelled':
        return `Your booking for "${notif.product}" has been cancelled. If you need help, contact us.`;
      case 'completed':
        return `Thank you for returning "${notif.product}" on time. We hope to serve you again!`;
      default:
        return `Update for your "${notif.product}" rental. Pickup: ${new Date(notif.pickUpDate).toLocaleDateString()}`;
    }
  };

  return (
      <View style={styles.container}>
    <Header title="Notification" />

      {/* Body */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#057474"]}
            tintColor="#057474"
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="notifications-none" size={64} color="#D0D0D0" />
            <Text style={styles.noNotif}>No notifications yet</Text>
            <Text style={styles.pullToRefresh}>Pull down to refresh</Text>
          </View>
        ) : (
          notifications.map((section, sectionIdx) => (
            <View key={sectionIdx} style={styles.section}>
              {/* Section Header */}
              <Text style={styles.sectionHeader}>{section.section}</Text>

              {/* Notification Cards */}
              {section.data.map((notif) => {
                const iconData = getNotificationIcon(notif.status);
                return (
                  <Pressable
                    key={notif.id}
                    style={styles.notificationCard}
                    onPress={() =>
                      router.push({
                        pathname: "/customer/notificationDetails",
                        params: { ...notif },
                      })
                    }
                  >
                    {/* Icon */}
                    <View style={[styles.iconCircle, { backgroundColor: iconData.bg }]}>
                      <Icon name={iconData.name} size={24} color={iconData.color} />
                    </View>

                    {/* Content */}
                    <View style={styles.notifContent}>
                      <View style={styles.notifHeader}>
                        <Text style={styles.notifTitle}>
                          {getNotificationTitle(notif)}
                        </Text>
                        <Text style={styles.notifTime}>
                          {formatTime(notif.created_at)}
                        </Text>
                      </View>
                      <Text style={styles.notifMessage} numberOfLines={2}>
                        {getNotificationMessage(notif)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
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
            <Icon name={navItem.icon} size={24} color="#656565" />
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
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  notifTime: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
  notifMessage: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: height * 0.25,
  },
  noNotif: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  pullToRefresh: {
    fontSize: 13,
    color: "#CCC",
    marginTop: 8,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#00000040",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    color: "#656565",
    fontSize: 12,
    marginTop: 2,
  },
  activeNavText: {
    color: "#057474",
    fontWeight: "600",
  },
});