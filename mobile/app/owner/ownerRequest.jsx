import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, Pressable, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    return bookedItem.filter(item => {
      const status = item.status?.toLowerCase();
      return status !== "cart" && status !== "ongoing";
    });
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
  
 <ScreenWrapper>
         <Header
           title="Request"
           backgroundColor="#007F7F"
         />
  <View style={styles.container}>
      {/* Body */}
      <View style={styles.bodyWrapper}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) :(() => {
          const filteredItems = getFilteredBookedItems();
          return filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {userId ? "No items found" : "Please log in to view your items"}
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E1D6",
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