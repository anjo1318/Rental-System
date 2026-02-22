import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/header";
import ScreenWrapper from "../components/screenwrapper";

const { width, height } = Dimensions.get("window");

export default function ownerItem() {
  const router = useRouter();
  const [bookedItem, setBookedItem] = useState([]);
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailLogs, setEmailLogs] = useState([]);

  useEffect(() => {
    loadOwnerData();
  }, []);

  // ✅ Keep only this one, remove the other
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const loadOwnerData = async () => {
    try {
      const ownerData = await AsyncStorage.getItem("user");
      const storedToken = await AsyncStorage.getItem("token");
      if (ownerData) {
        const user = JSON.parse(ownerData);
        const ownerIdValue = user.id || user.userId || user._id || "";
        if (
          ownerIdValue &&
          ownerIdValue !== "N/A" &&
          ownerIdValue !== "null" &&
          ownerIdValue !== "undefined"
        ) {
          setUserId(ownerIdValue);
        } else {
          console.error("Invalid user ID found:", ownerIdValue);
        }
      }
      if (storedToken) setToken(storedToken);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/notifications/owner-notifications/${userId}`,
      );
      if (response.data.success) {
        // ✅ Parse itemImage JSON string for each booking
        const parsed = (response.data.data || []).map((item) => {
          let images = [];
          try {
            images = JSON.parse(item.itemImage || "[]");
          } catch {
            images = [];
          }
          return { ...item, itemImage: images[0] || "" }; // use first image
        });
        setBookedItem(parsed);
        setEmailLogs(response.data.emailLogs || []);
      } else {
        setBookedItem([]);
        setEmailLogs([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setBookedItem([]);
      setEmailLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (bookingId) => {
    try {
      await axios.patch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/notifications/mark-as-read`,
        { bookingId, ownerId: userId },
      );
      setBookedItem((prev) =>
        prev.map((item) =>
          item.id === bookingId
            ? { ...item, isRead: true, readAt: new Date() }
            : item,
        ),
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleItemPress = (item) => {
    // Mark as read when tapped
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }
    try {
      router.push({
        pathname: "owner/ownerRequestDetail",
        params: {
          id: item.id,
          product: item.product || "",
          category: item.category || "",
          status: item.status || "",
          pricePerDay: item.pricePerDay || "",
          rentalPeriod: item.rentalPeriod || "",
          paymentMethod: item.paymentMethod || "",
          pickUpDate: item.pickUpDate || "",
          returnDate: item.returnDate || "",
          itemImage: item.itemImage || "",
          name: item.customerName || item.name || "",
          email: item.customerEmail || item.email || "",
          phone: item.customerPhone || item.phone || "",
          address: item.customerAddress || item.address || "",
          gender: item.customerGender || item.gender || "",
        },
      });
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getNotificationTitle = (item) => {
    const status = item.status?.toLowerCase();
    if (status === "ongoing") return "Rental Ongoing";
    if (status === "approved") return "Renting Successful";
    return item.status || "Notification";
  };

  const getNotificationMessage = (item) => {
    const status = item.status?.toLowerCase();
    if (status === "ongoing") {
      return `Your rental for "${item.product || "item"}" is currently ongoing. Monitor the rental period carefully.`;
    }
    if (status === "approved") {
      return `Your rental for "${item.product || "item"}" has been confirmed. Check your details for pickup info and i...`;
    }
    return "";
  };

  const renderIcon = (status) => {
    if (status === "ongoing") {
      return (
        <View style={[styles.iconCircle, { backgroundColor: "#FFF3E0" }]}>
          <Icon name="access-time" size={26} color="#F5A623" />
        </View>
      );
    }
    if (status === "approved") {
      return (
        <View style={[styles.iconCircle, { backgroundColor: "#E8F5E9" }]}>
          <Icon name="check-circle" size={26} color="#057474" />
        </View>
      );
    }
    return (
      <View style={[styles.iconCircle, { backgroundColor: "#E0F2F1" }]}>
        <Icon name="notifications" size={26} color="#007F7F" />
      </View>
    );
  };

  const groupByDate = (items) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayItems = [];
    const previousItems = [];
    items.forEach((item) => {
      try {
        const itemDate = new Date(item.pickUpDate);
        itemDate.setHours(0, 0, 0, 0);
        if (itemDate.getTime() === today.getTime()) {
          todayItems.push(item);
        } else {
          previousItems.push(item);
        }
      } catch {
        previousItems.push(item);
      }
    });
    return { todayItems, previousItems };
  };

  const renderSection = (label, items) => {
    if (items.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{label}</Text>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.notificationCard,
              pressed && styles.pressedCard,
              // Subtle unread indicator — background only, no layout change
              !item.isRead && { backgroundColor: "#F0FAFA" },
            ]}
            onPress={() => handleItemPress(item)}
          >
            {renderIcon(item.status?.toLowerCase())}
            <View style={styles.detailsWrapper}>
              <Text style={styles.notifTitle} numberOfLines={1}>
                {getNotificationTitle(item)}
              </Text>
              <Text style={styles.notifMessage} numberOfLines={2}>
                {getNotificationMessage(item)}
              </Text>
            </View>
            <Text style={styles.timeText}>{formatDate(item.pickUpDate)}</Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const { todayItems, previousItems } = groupByDate(bookedItem);
  const hasAnyItems = bookedItem.length > 0;

  const renderEmailLogs = () => {
    if (emailLogs.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Email Notifications</Text>
        {emailLogs.map((log) => (
          <Pressable
            key={log.id}
            style={({ pressed }) => [
              styles.notificationCard,
              pressed && styles.pressedCard,
            ]}
            onPress={() =>
              router.push({
                pathname: "owner/ownerEmailDetail",
                params: {
                  product: log.product || "",
                  renterName: log.renterName || "",
                  ownerEmail: log.ownerEmail?.trim() || "",
                  rentalPrice: log.rentalPrice || "0",
                  totalAmount: log.totalAmount || "0",
                  productImage: log.productImage || "",
                  bookingDate: log.bookingDate || "",
                  sentAt: log.sentAt || "",
                  status: log.status || "",
                  bookingId: log.bookingId || "",
                },
              })
            }
          >
            <View style={[styles.iconCircle, { backgroundColor: "#E8F0FE" }]}>
              <Icon name="email" size={26} color="#4A90D9" />
            </View>
            <View style={styles.detailsWrapper}>
              <Text style={styles.notifTitle} numberOfLines={1}>
                {log.product || "Payment Notification"}
              </Text>
              <Text style={styles.notifMessage} numberOfLines={2}>
                {log.status === "sent"
                  ? `Email sent to ${log.ownerEmail?.trim()} for renter ${log.renterName}`
                  : `Failed to notify: ${log.errorMessage || "Unknown error"}`}
              </Text>
            </View>
            <Text style={styles.timeText}>
              {formatDate(log.sentAt || log.createdAt)}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <Header title="Notifications" backgroundColor="#007F7F" />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Loading...</Text>
            </View>
          ) : !hasAnyItems ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {userId
                  ? "No notifications found"
                  : "Please log in to view notifications"}
              </Text>
            </View>
          ) : (
            <>
              {renderSection("Today", todayItems)}
              {renderSection("Previous", previousItems)}
              {renderEmailLogs()}
            </>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },
  scrollContent: { flexGrow: 1, paddingBottom: 30 },
  section: { marginBottom: 6 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#EBEBEB",
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E8E8E8",
  },
  pressedCard: { backgroundColor: "#F5F5F5" },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  detailsWrapper: { flex: 1, paddingRight: 8 },
  notifTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  notifMessage: { fontSize: 13, color: "#666", lineHeight: 18 },
  timeText: { fontSize: 12, color: "#999", flexShrink: 0, textAlign: "right" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyText: { fontSize: 15, color: "#999", textAlign: "center" },
});
