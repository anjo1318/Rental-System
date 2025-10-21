import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, Pressable, StatusBar, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get("window");

// ✅ Responsive constants (bounded so they don't blow up on tablets or collapse on small screens)
const HEADER_HEIGHT = Math.min(Math.max(60, height * 0.09), 110);
const ICON_BOX = Math.max(40, width * 0.1);
const ICON_SIZE = Math.max(20, width * 0.07);
const TITLE_FONT = Math.max(16, Math.round(width * 0.045));
const BADGE_SIZE = Math.max(12, Math.round(width * 0.045));
const PADDING_H = Math.min(Math.max(12, width * 0.02), 28);
const MARGIN_TOP = Math.min(Math.round(height * 0.02), 20);

export default function BookedItem() {
  const router = useRouter();
  const [bookRequest, setBookRequest] = useState([]);
  const [bookedItem, setBookedItem] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null); // Track selected item

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchBookedItems();
      console.log("ownerRequest.jsx to");
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        console.log("From local storage", userData);
        
        const userIdValue = user.id || user.userId || user._id || "";
        
        if (userIdValue && userIdValue !== "N/A" && userIdValue !== "null" && userIdValue !== "undefined") {
          setUserId(userIdValue);
        } else {
          console.error("Invalid user ID found:", userIdValue);
        }
      } else {
        console.error("No user data found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchBookedItems = async () => {
    if (!userId || userId === "N/A" || userId === "null" || userId === "undefined") {
      console.error("Cannot fetch booked items: Invalid user ID:", userId);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching booked items for user ID:", userId);
      
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/book/booked-items/${userId}`);

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

  const handleItemPress = (item) => {
    try {
      router.push({
        pathname: "customer/bookedProductDetail",
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
        }
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

  const handleDelete = async () => {
    if (!selectedItemId) {
      alert("Please select an item to delete");
      return;
    }

    console.log("Delete button pressed for item ID:", selectedItemId);
    
    try {
      // Use DELETE method and pass only the ID
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_API_URL}/api/book/delete/${selectedItemId}`
      );
      
      if (response.data.success) {
        alert("Booking deleted successfully!");
        
        // Clear selection and refresh the list
        setSelectedItemId(null);
        fetchBookedItems();
      } else {
        alert("Failed to delete booking: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Error deleting booking: " + (error.response?.data?.message || error.message));
    }
  };

  // ✅ Handle proceed to renting - redirect to rentingDetails with selected item
  const handleProceed = () => {
    if (!selectedItemId) {
      alert("Please select an item first");
      return;
    }

    const selectedItem = bookedItem.find(item => item.id === selectedItemId);
    
    if (!selectedItem) {
      alert("Selected item not found");
      return;
    }

    // Navigate to rentingDetails with the item ID
    router.push({
      pathname: "customer/rentingDetails",
      params: {
        itemId: selectedItem.itemId || selectedItem.id,
        // You can pass additional params if needed
        fromBookedItems: "true"
      }
    });
  };

  const handleRequestRent = async (itemId) => {
    try {
      console.log("Requesting rent for item ID:", itemId);
      
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/book/request/${itemId}`
      );
      
      console.log("Request successful:", response.data);
      
      if (response.data.success) {
        alert("Rental request sent successfully!");
        fetchBookedItems();
      } else {
        alert("Failed to send rental request: " + response.data.message);
      }
    } catch (error) {
      console.error("Error in handleRequestRent:", error);
      alert("Error sending rental request: " + (error.response?.data?.message || error.message));
    }
  };

  // ✅ Handle radio button selection
  const handleRadioSelect = (itemId) => {
    setSelectedItemId(itemId);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

      {/* Header */}
      <View style={[styles.headerWrapper, { height: HEADER_HEIGHT, paddingTop: MARGIN_TOP }]}>
        <View style={[styles.profileContainer, { paddingHorizontal: PADDING_H }]}>
          <View style={[styles.iconBox, { width: ICON_BOX }]}>
            <Pressable
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/customer/home");
                }
              }}
              hitSlop={10}
              style={styles.iconPress}
            >
              <Icon name="arrow-back" size={24} color="#000"/>
            </Pressable>
          </View>

          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.pageName, { fontSize: TITLE_FONT }]}
          >
            Booked Item
          </Text>

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
          ) : bookedItem.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {userId ? "No booked items found" : "Please log in to view booked items"}
              </Text>
            </View>
          ) : (
            bookedItem.map((item) => (
              <Pressable 
                key={item.id} 
                style={({ pressed }) => [
                  styles.notificationCard,
                  pressed && styles.pressedCard
                ]}
                onPress={() => handleItemPress(item)}
              >
                {/* ✅ Radio Button */}
                <Pressable
                  style={styles.radioContainer}
                  onPress={(e) => {
                    e.stopPropagation(); // Prevent card press
                    handleRadioSelect(item.id);
                  }}
                >
                  <View style={[
                    styles.radioOuter,
                    selectedItemId === item.id && styles.radioOuterSelected
                  ]}>
                    {selectedItemId === item.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </Pressable>

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
                  
                  <Pressable
                    onPress={() => handleRequestRent(item.id)}
                    style={styles.requestButton}
                  >
                    <Text style={styles.requestButtonText}>Request for Rent</Text>
                  </Pressable>
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
          )}
        </ScrollView>

        {/* Bottom buttons - only show if there are items */}
        {bookedItem.length > 0 && (
          <View style={styles.bottomContainer}>
            <Pressable 
              style={[styles.button, styles.deleteButton, { flex: 0, width: "30%" }]}
              onPress={handleDelete}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>

            <Pressable 
              style={[
                styles.button, 
                styles.proceedButton, 
                { flex: 0, width: "60%" },
                !selectedItemId && styles.disabledButton
              ]}
              onPress={handleProceed}
              disabled={!selectedItemId}
            >
              <Text style={styles.proceedText}>Proceed to Renting</Text>
            </Pressable>
          </View>
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
    backgroundColor: "#FFF",
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
    justifyContent: "center",
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  disabledButton: {
    backgroundColor: "#888",
    opacity: 0.5,
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
    backgroundColor: "#C5C0B1",
    transform: [{ scale: 0.98 }],
  },

  // ✅ Radio button styles
  radioContainer: {
    marginRight: 10,
    padding: 5,
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#666",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },

  radioOuterSelected: {
    borderColor: "#057474",
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#057474",
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
    width: 80,
    alignItems: "flex-end",
  },

  dateText: {
    fontSize: 12,
    color: "#333",
  },

  chevronIcon: {
    marginTop: 2,
  },

  requestButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#057474",
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  requestButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  }
});