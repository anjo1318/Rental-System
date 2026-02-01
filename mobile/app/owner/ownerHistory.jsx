import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  RefreshControl,
  Alert
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { RFValue } from "react-native-responsive-fontsize";
import CustomerBottomNav from '../components/CustomerBottomNav';
import Header from "../components/header3";
import ScreenWrapper from "../components/screenwrapper";

export default function OwnerHistory({ title = "Time Duration", backgroundColor = "#fff" }) {
  const router = useRouter();
  const [bookedItems, setBookedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load owner ID and fetch history
  useEffect(() => {
    loadOwnerAndFetchHistory();
  }, []);

  const loadOwnerAndFetchHistory = async () => {
    try {
      console.log("=== Loading Owner ID ===");
      
      // Try to get ownerId first
      let ownerId = await AsyncStorage.getItem("ownerId");
      console.log("ownerId from storage:", ownerId);
      
      // If not found, try to get from user object
      if (!ownerId) {
        console.log("ownerId not found, checking user object...");
        const userStr = await AsyncStorage.getItem("user");
        console.log("User string from storage:", userStr);
        
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            console.log("Parsed user:", user);
            console.log("User ID:", user.id);
            ownerId = user.id?.toString();
            console.log("Extracted ownerId:", ownerId);
          } catch (parseError) {
            console.error("Error parsing user JSON:", parseError);
          }
        } else {
          console.log("No user string found in AsyncStorage");
        }
      }
      
      console.log("Final Owner ID:", ownerId);
      
      if (ownerId) {
        await fetchHistory(ownerId);
      } else {
        console.log("No owner ID found in AsyncStorage");
        setError("Owner ID not found. Please login again.");
        Alert.alert("Error", "Owner ID not found. Please login again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error loading owner ID:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchHistory = async (ownerId) => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const fullUrl = `${apiUrl}/api/history/owner/${ownerId}`;
      
      console.log("=== Fetching Owner History ===");
      console.log("API URL:", apiUrl);
      console.log("Full URL:", fullUrl);
      console.log("Owner ID:", ownerId);
      
      const response = await axios.get(fullUrl);
      
      console.log("Response Status:", response.status);
      console.log("Response Data:", JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        console.log("Number of items:", response.data.data?.length || 0);
        setBookedItems(response.data.data || []);
      } else {
        console.error("API returned success: false");
        console.error("Response:", response.data);
        setError("Failed to fetch history");
      }
    } catch (error) {
      console.error("=== Error Fetching History ===");
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      setError(error.message);
      Alert.alert(
        "Error", 
        `Failed to load rental history: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    
    // Try to get ownerId first
    let ownerId = await AsyncStorage.getItem("ownerId");
    
    // If not found, try to get from user object
    if (!ownerId) {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        ownerId = user.id?.toString();
      }
    }
    
    console.log("Refreshing with Owner ID:", ownerId);
    if (ownerId) {
      await fetchHistory(ownerId);
    }
    setRefreshing(false);
  };

  const getImageUrl = (itemImage) => {
    try {
      if (!itemImage) return "https://via.placeholder.com/150";
      
      // If it's already a URL
      if (typeof itemImage === 'string' && itemImage.startsWith('http')) {
        return itemImage;
      }
      
      // If it's a JSON array
      const parsed = JSON.parse(itemImage);
      return parsed[0] || "https://via.placeholder.com/150";
    } catch (error) {
      console.log("Error parsing image URL:", error);
      return "https://via.placeholder.com/150";
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.log("Error formatting date:", error);
      return dateString;
    }
  };

  const renderBookingCard = (item) => (
    <View key={item.id} style={styles.card}>
      {/* Device Row */}
      <View style={styles.deviceRow}>
        <Image
          source={{ uri: getImageUrl(item.itemImage) }}
          style={styles.deviceImage}
          onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
        />
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.product || "Unknown Product"}</Text>
          <Text style={styles.categoryText}>{item.category || "Unknown Category"}</Text>

        </View>
      </View>

      {/* Rental Period */}
      <View style={styles.dateRow}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Pick-up Date</Text>
          <Text style={styles.dateText}>{formatDate(item.pickUpDate)}</Text>
        </View>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Return Date</Text>
          <Text style={styles.dateText}>{formatDate(item.returnDate)}</Text>
        </View>
      </View>

      {/* Details Row */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>{item.rentalDuration || 0} day(s)</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Total Amount</Text>
          <Text style={styles.detailValue}>₱{item.grandTotal || 0}</Text>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.paymentRow}>
        <MaterialIcons name="payment" size={16} color="#666" />
        <Text style={styles.paymentText}>{item.paymentMethod || "N/A"}</Text>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <Header
        title="Rental History"
        backgroundColor="#fff"
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentWrapper}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007F7F"]}
            tintColor="#007F7F"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#057474" />
            <Text style={styles.loadingText}>Loading your history...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="error-outline" size={60} color="#ff6b6b" />
            <Text style={styles.emptyText}>Error Loading History</Text>
            <Text style={styles.emptySubtext}>{error}</Text>
            <Pressable 
              style={styles.retryButton}
              onPress={loadOwnerAndFetchHistory}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : bookedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No rental history</Text>
            <Text style={styles.emptySubtext}>Your terminated rentals will appear here</Text>
          </View>
        ) : (
          bookedItems.map(renderBookingCard)
        )}
      </ScrollView>
      <CustomerBottomNav/>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff", 
  },

  contentWrapper: {
    padding: 16,
    paddingBottom: 80
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },

  loadingText: {
    marginTop: 12,
    fontSize: RFValue(12),
    color: "#666",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },

  emptyText: {
    fontSize: RFValue(16),
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },

  emptySubtext: {
    fontSize: RFValue(12),
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: "#057474",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryButtonText: {
    color: "#fff",
    fontSize: RFValue(14),
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },

  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  deviceImage: {
    width: 70,
    height: 70,
    resizeMode: "cover",
    marginRight: 12,
    borderRadius: 8,
  },

  deviceInfo: {
    flex: 1,
  },

  deviceName: {
    fontSize: RFValue(14),
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },

  categoryText: {
    fontSize: RFValue(11),
    color: "#666",
    marginBottom: 6,
  },

  statusTerminated: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    backgroundColor: "#9E9E9E",
  },

  statusText: {
    fontSize: RFValue(10),
    fontWeight: "600",
    color: "#fff",
  },

  dateRow: {
    marginBottom: 12,
  },

  dateItem: {
    marginBottom: 8,
  },

  dateLabel: {
    fontSize: RFValue(10),
    color: "#999",
    marginBottom: 2,
  },

  dateText: {
    fontSize: RFValue(12),
    color: "#333",
    fontWeight: "500",
  },

  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginBottom: 8,
  },

  detailItem: {
    flex: 1,
  },

  detailLabel: {
    fontSize: RFValue(10),
    color: "#999",
    marginBottom: 4,
  },

  detailValue: {
    fontSize: RFValue(13),
    fontWeight: "600",
    color: "#000",
  },

  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },

  paymentText: {
    fontSize: RFValue(11),
    color: "#666",
    marginLeft: 6,
  },
});