import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, Pressable, StatusBar, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get("window");

// ✅ Responsive constants (bounded so they don't blow up on tablets or collapse on small screens)
const HEADER_HEIGHT = Math.min(Math.max(60, height * 0.09), 110); // min 60, max 110
const ICON_BOX = Math.max(40, width * 0.1); // Fixed: was width * 0.00, now width * 0.1
const ICON_SIZE = Math.max(20, width * 0.07); // min 20px
const TITLE_FONT = Math.max(16, Math.round(width * 0.045)); // adaptive title font
const BADGE_SIZE = Math.max(12, Math.round(width * 0.045)); // badge scales with width
const PADDING_H = Math.min(Math.max(12, width * 0.02), 28); // Fixed: was min 7, now min 12
const MARGIN_TOP = Math.min(Math.round(height * 0.02), 20); // Fixed: was height * 0.1, now height * 0.02

export default function ownerItem() {
  const router = useRouter();
  const [bookRequest, setBookRequest] = useState([]);
  const [bookedItem, setBookedItem] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOwnerData(); // run only once on mount
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
        
        // Ensure we have a valid user ID
        const ownerIdValue = user.id || user.userId || user._id || "";
        
        if (ownerIdValue && ownerIdValue !== "N/A" && ownerIdValue !== "null" && ownerIdValue !== "undefined") {
          setUserId(ownerIdValue);
        } else {
          console.error("Invalid user ID found:", ownerIdValue);
          // You might want to redirect to login screen here
          // router.replace('/login');
        }
      } else {
        console.error("No owner data found in AsyncStorage");
        // You might want to redirect to login screen here
        // router.replace('/login');
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchBookedItems = async () => {
    // Don't make API call if userId is invalid
    if (!userId || userId === "N/A" || userId === "null" || userId === "undefined") {
      console.error("Cannot fetch booked items: Invalid user ID:", userId);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching booked items for owner ID:", userId);
      
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/book/book-request/${userId}`);

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

  const getFilteredBookedItems = () => {
  return bookedItem.filter(item => item.status?.toLowerCase() === "booked");
  };

  // Function to handle item press and navigate to detail screen
  const handleItemPress = (item) => {
    try {
      // Option 1: If using simple file-based routing
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
          // Customer information - adjust these field names based on your API response
          name: item.customerName || item.name || "",
          email: item.customerEmail || item.email || "",
          phone: item.customerPhone || item.phone || "",
          address: item.customerAddress || item.address || "",
          gender: item.customerGender || item.gender || "",
        }
      });

      // Option 2: If using dynamic routing, use this instead:
      // router.push(`/booked-product-detail/${item.id}`);
      
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
      return dateString; // Return original string if parsing fails
    }
  };


  console.log("Fetching booked items from:", `${process.env.EXPO_PUBLIC_API_URL}/api/book/book-request/${userId}`);

  return (
    <View style={styles.container}>
      {/* Status bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

      {/* Header */}
      <View style={[styles.headerWrapper, { height: HEADER_HEIGHT, paddingTop: MARGIN_TOP }]}>
        <View style={[styles.profileContainer, { paddingHorizontal: PADDING_H }]}>
          {/* Left: back button */}
          <View style={[styles.iconBox, { width: ICON_BOX }]}>
            <Pressable
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                      } else {
                    router.replace("/customer/home"); // fallback screen
                      }}}
                      hitSlop={10}
                      style={styles.iconPress}
                      >
                <Icon name="arrow-back" size={24} color="#000" />
              </Pressable>
          </View>

          {/* Center: page title */}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.pageName, { fontSize: TITLE_FONT }]}
          >
            Request
          </Text>

          {/* Right: notification */}
          <View style={[styles.iconBox, { width: ICON_BOX }]}>
            <View
              style={[
                styles.notificationWrapper,
                {
                  width: ICON_BOX * 0.8,
                  height: ICON_BOX * 0.8,
                  borderRadius: (ICON_BOX * 0.8) / 2,
                },
              ]}
            >
              <Icon name="notifications-none" size={Math.round(ICON_SIZE * 0.9)} color="#057474" />
              <View
                style={[
                  styles.badge,
                  {
                    width: BADGE_SIZE,
                    height: BADGE_SIZE,
                    borderRadius: BADGE_SIZE / 2,
                    right: -BADGE_SIZE * 0.25,
                    top: -BADGE_SIZE * 0.25,
                  },
                ]}
              >
                <Text style={[styles.badgeText, { fontSize: BADGE_SIZE * 0.45 }]}>2</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Body */}
      <View style={styles.bodyWrapper}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (() => {
          const filteredItems = getFilteredBookedItems();
          return filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {userId ? "No booked items found" : "Please log in to view booked items"}
              </Text>
            </View>
          ) : (
            filteredItems.map((item) => (
              <Pressable 
                key={item.id} 
                style={({ pressed }) => [
                  styles.notificationCard,
                  pressed && styles.pressedCard
                ]}
                onPress={() => handleItemPress(item)}
              >
                {/* Left: item image */}
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ 
                      uri: item.itemImage || 'https://via.placeholder.com/50x50?text=No+Image'
                    }}
                    style={styles.itemImage}
                    defaultSource={{ uri: 'https://via.placeholder.com/50x50?text=No+Image' }}
                  />
                </View>

                {/* Center: details */}
                <View style={styles.detailsWrapper}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.product || 'Unknown Product'}
                  </Text>
                  
                  <Text>
                    • Pickup: {formatDate(item.pickUpDate)}
                  </Text>

                  <Text 
                    style={[
                      styles.statusText,
                      item.status?.toLowerCase() === "pending" && { color: "#D4A017" },
                      (item.status?.toLowerCase() === "approved" || item.status?.toLowerCase() === "ongoing") && { color: "#057474" },
                      (item.status?.toLowerCase() === "rejected" || item.status?.toLowerCase() === "terminated" || item.status?.toLowerCase() === "cancelled") && { color: "#D40004" },
                    ]}
                    numberOfLines={1}
                  >
                    {item.status || 'Unknown'} 
                  </Text>
                </View>

                {/* Right: date and chevron */}
                <View style={styles.dateWrapper}>
                  <Text style={styles.dateText}>
                    {formatDate(item.pickUpDate)}
                  </Text>
                  <Icon name="chevron-right" size={20} color="#666" style={styles.chevronIcon} />
                </View>
              </Pressable>
            ))
          );
        })()}
      </ScrollView>

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
    backgroundColor: "#FFF",
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
    justifyContent: "center",
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // keeps title centered
    height: "100%",
  },

  iconBox: {
    alignItems: "center",
    justifyContent: "center",
  },

  iconPress: {
    padding: width * 0.015,
    borderRadius: 6,
  },

  pageName: {
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    flex: 1,
    paddingHorizontal: 6,
  },

  notificationWrapper: {
    position: "relative",
    borderWidth: 1.5,
    borderColor: "#057474",
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    position: "absolute",
    backgroundColor: "#057474",
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "white",
    fontWeight: "bold",
  },

  bodyWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 30,
    justifyContent: "space-between",
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },

  loadingText: {
    fontSize: 16,
    color: "#666",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },

  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
  },

  deleteButton: {
    backgroundColor: "#FFF",
    borderColor: "#D40004",
    borderWidth: 0.7,
    borderRadius: 10,
  },

  proceedButton: {
    backgroundColor: "#057474",
    borderRadius: 10,
  },

  deleteText: {
    color: "#D40004",
    fontSize: 13,
  },

  proceedText: {
    color: "#FFF",
    fontSize: 13,
  },

  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DAD6C7",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  pressedCard: {
    backgroundColor: "#C5C0B1", // Slightly darker when pressed
    transform: [{ scale: 0.98 }],
  },

  imageWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginRight: 10,
  },

  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  detailsWrapper: {
    flex: 1,
  },

  productName: {
    fontWeight: "600",
    fontSize: 16,
    color: "#000",
  },

  statusText: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },

  dateWrapper: {
    width: 80, // Made slightly wider to accommodate chevron
    alignItems: "flex-end",
  },

  dateText: {
    fontSize: 12,
    color: "#333",
  },

  chevronIcon: {
    marginTop: 2,
  },

  detailImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
});