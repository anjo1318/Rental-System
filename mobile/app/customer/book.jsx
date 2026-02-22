import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, Pressable, Image, RefreshControl } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from "../components/header2";
import CustomerBottomNav from '../components/CustomerBottomNav';
import ScreenWrapper from "../components/screenwrapper";

const { width, height } = Dimensions.get("window");


export default function BookedItem() {
  const router = useRouter();
  const [bookedItem, setBookedItem] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookedItems();
    setRefreshing(false);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchBookedItems();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        const userIdValue = user.id || user.userId || user._id || "";
        
        if (userIdValue && userIdValue !== "N/A" && userIdValue !== "null" && userIdValue !== "undefined") {
          setUserId(userIdValue);
        }
      }
    } catch (error) {
    console.error("Error loading user data:", error);
    }
  };

  const fetchBookedItems = async () => {
    if (!userId || userId === "N/A" || userId === "null" || userId === "undefined") {
      console.log("walang user id");
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/book/booked-items/${userId}`);
      
      if (response.data.success) {
        // FIX: Change back to "pending" status
        const bookedItems = (response.data.data || []).filter(
          item => item.status?.toLowerCase() === "pending"
        );
        setBookedItem(bookedItems);
        console.log("Fetch booked items in book.jsx", bookedItems);
      } else {
        setBookedItem([]);
      }
    } catch (error) {
      console.error("Error fetching booked items:", error);
      setBookedItem([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItemId) {
      alert("Please select an item to delete");
      return;
    }
    
    try {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_API_URL}/api/book/delete/${selectedItemId}`
      );
      
      if (response.data.success) {
        alert("Booking deleted successfully!");
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

    if (selectedItem.status?.toLowerCase() === "booked") {
      alert("Cannot proceed. Item is still in Booked status. Please request for rent first.");
      return;
    }

    router.push({
      pathname: "customer/rentingDetails",
      params: {
        itemId: selectedItem.itemId || selectedItem.id,
        fromBookedItems: "true"
      }
    });
  };

  const handleRadioSelect = (itemId) => {
    setSelectedItemId(itemId);
  };

  const getImageUrl = (imageString) => {
    try {
      if (typeof imageString === "string" && imageString.startsWith("http")) {
        return imageString.replace(/^http:\/\//, "https://");
      }
      const imageArray = JSON.parse(imageString);
      if (Array.isArray(imageArray) && imageArray.length > 0) {
        return imageArray[0].replace(/^http:\/\//, "https://");
      }
      return "https://via.placeholder.com/80x80?text=No+Image";
    } catch (error) {
      return "https://via.placeholder.com/80x80?text=No+Image";
    }
  };

  return (
    <ScreenWrapper>
      <Header
          title="Booked Item"
          backgroundColor="#007F7F"
        />

      <View style={styles.bodyWrapper}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007F7F"]}      // Android
              tintColor="#007F7F"       // iOS
            />
          }
        >
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
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.ownerInfo}>
                    <Image
                      source={{ uri: getImageUrl(item.ownerSelfie) }}
                      style={styles.ownerAvatar}
                      resizeMode="cover"
                    />
                    <Text style={styles.ownerName}>{item.ownerFirstName || "Owner"} {item.ownerLastName || "Owner"}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Pressable
                    style={styles.checkboxContainer}
                    onPress={() => handleRadioSelect(item.id)}
                  >
                    <View style={[
                      styles.checkbox,
                      selectedItemId === item.id && styles.checkboxSelected
                    ]}>
                      {selectedItemId === item.id && (
                        <Icon name="check" size={14} color="#007F7F" />
                      )}
                    </View>
                  </Pressable>

                  <Image
                    source={{ uri: getImageUrl(item.itemImage) }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />

                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.product || 'Unknown Product'}
                    </Text>
                    <Text style={styles.productPrice}>
                      ₱ {item.pricePerDay || '0'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        
       

        {bookedItem.length > 0 && (
          <View style={styles.bottomContainer}>
            <Pressable 
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteText}>Remove</Text>
            </Pressable>

            <Pressable 
              style={[
                styles.proceedButton,
                !selectedItemId && styles.disabledButton
              ]}
              onPress={handleProceed}
              disabled={!selectedItemId}
            >
              <Text style={styles.proceedText}>Proceed to Renting</Text>
            </Pressable>
          </View>
          
        )}
        </ScrollView>
         <CustomerBottomNav />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8E8E8",
  },

  bodyWrapper: {
    flex: 1,
    paddingHorizontal: 7,
    paddingTop: 16,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
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

  card: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D0D0D0', 
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },

  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 38,
    top: 10,
  },

  ownerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#E0E0E0",
  },

  ownerName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },

  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },

  checkboxContainer: {
    marginRight: 12,
    padding: 4,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#CCC",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxSelected: {
    borderColor: "#007F7F",
    backgroundColor: "#E8F5F5",
  },

  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#F0F0F0",
    right: 8,
  },

  productInfo: {
    flex: 1,
    justifyContent: "center",
  },

  productName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000",
    marginBottom: 4,
  },

  productPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007F7F",
  },

  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    marginBottom: 25,
  },

  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#D40004",
    borderWidth: 1.5,
    borderColor: "#FFF",
  },

  proceedButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#007F7F",
  },

  disabledButton: {
    backgroundColor: "#B0B0B0",
    opacity: 0.6,
  },

  deleteText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  proceedText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});