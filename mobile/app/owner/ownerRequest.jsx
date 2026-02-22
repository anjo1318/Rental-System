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
  const [bookRequest, setBookRequest] = useState([]);
  const [bookedItem, setBookedItem] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOwnerData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchBookedItems();
    }
  }, [userId]);

  const loadOwnerData = async () => {
    try {
      const ownerData = await AsyncStorage.getItem("user");
      if (ownerData) {
        const user = JSON.parse(ownerData);
        console.log("Owner data From local storage", ownerData);
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
      } else {
        console.error("No owner data found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchBookedItems = async () => {
    if (
      !userId ||
      userId === "N/A" ||
      userId === "null" ||
      userId === "undefined"
    ) {
      console.error("Cannot fetch booked items: Invalid user ID:", userId);
      return;
    }
    try {
      setLoading(true);
      console.log("Fetching booked items for owner ID:", userId);
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/book/book-request/${userId}`
      );
      if (response.data.success) {
        console.log("Booked items response:", response.data.data);
        setBookedItem(response.data.data || []);
      } else {
        console.log("API returned success: false", response.data);
        setBookedItem([]);
      }
    } catch (error) {
      console.error("Error fetching booked items:", error);
      setBookedItem([]);
    } finally {
      setLoading(false);
    }
  };

  // Only show ongoing and approved
  const getFilteredBookedItems = () => {
    return bookedItem.filter((item) => {
      const status = item.status?.toLowerCase();
      return status === "ongoing" || status === "approved";
    });
  };

  const handleItemPress = (item) => {
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

  // Group items: today vs previous based on pickUpDate
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
            ]}
            onPress={() => handleItemPress(item)}
          >
            {/* Left: circular icon */}
            {renderIcon(item.status?.toLowerCase())}

            {/* Center: title + message */}
            <View style={styles.detailsWrapper}>
              <Text style={styles.notifTitle} numberOfLines={1}>
                {getNotificationTitle(item)}
              </Text>
              <Text style={styles.notifMessage} numberOfLines={2}>
                {getNotificationMessage(item)}
              </Text>
            </View>

            {/* Right: date */}
            <Text style={styles.timeText}>{formatDate(item.pickUpDate)}</Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const filteredItems = getFilteredBookedItems();
  const { todayItems, previousItems } = groupByDate(filteredItems);
  const hasAnyItems = filteredItems.length > 0;

  console.log(
    "Fetching booked items from:",
    `${process.env.EXPO_PUBLIC_API_URL}/api/book/book-request/${userId}`
  );

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
            </>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  section: {
    marginBottom: 6,
  },

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

  pressedCard: {
    backgroundColor: "#F5F5F5",
  },

  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },

  detailsWrapper: {
    flex: 1,
    paddingRight: 8,
  },

  notifTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#1A1A1A",
    marginBottom: 4,
  },

  notifMessage: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  timeText: {
    fontSize: 12,
    color: "#999",
    flexShrink: 0,
    textAlign: "right",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },

  emptyText: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
  },
});
