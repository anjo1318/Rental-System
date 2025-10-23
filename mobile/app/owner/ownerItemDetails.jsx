import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import OwnerItemImages from "./ownerItemImages";
export default function OwnerItemDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // get item id from params
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchItem = async () => {
      try {
        console.log("Fetching item with ID:", id);
        const res = await axios.get(`${API_URL}/api/item/${id}`);
        
        if (res.data.success && res.data.data) {
          setItem(res.data.data);
          console.log("Item fetched successfully:", res.data.data.title);
        } else {
          Alert.alert("Error", "Item not found");
          router.back();
        }
      } catch (err) {
        console.error("❌ Error fetching item:", err.response?.data || err.message);
        Alert.alert("Error", "Failed to fetch item");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    } else {
      console.error("No item ID provided");
      Alert.alert("Error", "No item ID provided");
      router.back();
    }
  }, [id]);

  const handleBooking = async () => {
    try {
      setIsBooking(true);

      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        Alert.alert("Error", "Please login first");
        router.push("/auth/login");
        return;
      }

      const customer = JSON.parse(userData);

      // Build full address
      const fullAddress = [
        customer.houseNumber,
        customer.street,
        customer.barangay,
        customer.town,
        customer.province,
        customer.country,
        customer.zipCode
      ].filter(Boolean).join(", ");

      // Calculate dates
      const pickupDate = new Date().toISOString().split('T')[0];
      const returnDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const bookingData = {
        itemId: item.id,
        customerId: customer.id,
        ownerId: item.ownerId,
        itemDetails: {
          title: item.title,
          category: item.category,
          location: item.location,
          pricePerDay: item.pricePerDay,
          ownerId: item.ownerId,
          itemImage: item.itemImages?.[0] || "",
        },
        customerDetails: {
          customerId: customer.id,
          fullName: customer.name,
          email: customer.email,
          phone: customer.phone,
          location: fullAddress,
          gender: customer.gender || "Not specified",
        },
        rentalDetails: {
          pickupDate: pickupDate,
          returnDate: returnDate,
          period: "To be updated",
        },
        paymentMethod: "pending",
      };

      console.log("Sending booking:", bookingData);

      const response = await axios.post(
        `${API_URL}/api/book/book-item`,
        bookingData
      );

      console.log("Response data:", response.data);
      router.push("/customer/book") 

     

    } catch (error) {
      console.error("❌ Booking error:", error.message);
      
      if (error.response?.data?.success) {
        Alert.alert("Success", "Item booked successfully!", [
          { 
            text: "View Bookings", 
            onPress: () => router.push("/customer/book") 
          }
        ]);
      } else {
        Alert.alert(
          "Booking Error", 
          error.response?.data?.message || error.message || "Failed to book item"
        );
      }
    } finally {
      setIsBooking(false);
    }
  };

  const editItem = (id) => {
    console.log("Navigating to edit item:",item.id);
    router.push(`owner/ownerEditItem?id=${item.id}`);
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#057474" />
        <Text style={styles.loadingText}>Loading item details...</Text>
      </View>
    );
  }

  // Item not found
  if (!item) {
    return (
      <View style={styles.center}>
        <Icon name="error-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Item not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackButton}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Item Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Item Images */}
      <OwnerItemImages images={item.itemImages} />

      {/* Item Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        
        <View style={styles.categoryRow}>
          <Icon name="category" size={16} color="#666" />
          <Text style={styles.category}>{item.category}</Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>₱{item.pricePerDay}</Text>
          <Text style={styles.priceUnit}>/ day</Text>
        </View>
        
        <Text style={styles.description}>{item.description}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {/* Book Now Button */}
        <TouchableOpacity 
          style={[styles.bookButton, !item.availability && styles.disabledButton, isBooking && styles.disabledButton]} 
          onPress={editItem}
          disabled={!item.availability || isBooking}
          activeOpacity={0.8}
        >
          {isBooking ? (
            <>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.bookButtonText}>Processing...</Text>
            </>
          ) : (
            <>
              <Icon name="book" size={20} color="#FFF" />
              <Text style={styles.bookButtonText}>Edit</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Chat Button - Commented Out */}
        {/* <TouchableOpacity
          style={[styles.bookButton, styles.chatButton]}
          onPress={async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              
              if (!token) {
                Alert.alert("Authentication Required", "Please login to chat", [
                  { text: "OK", onPress: () => router.push("/auth/login") }
                ]);
                return;
              }

              let existingChatId = null;

              // Check if chat already exists for this item and user
              const res = await axios.get(
                `${API_URL}/api/chat/check/${item.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (res.data.success && res.data.chatId) {
                existingChatId = res.data.chatId;
              }

              // Generate chatId if none exists
              const chatId = existingChatId || uuidv4();

              console.log("Navigating to chat with:", {
                chatId,
                itemId: item.id,
                ownerId: item.ownerId
              });

              // Navigate to ChatScreen with chatId
              router.push(`/customer/chat?id=${chatId}&itemId=${item.id}`);
            } catch (err) {
              console.error("❌ Chat error:", err.response?.data || err.message);
              Alert.alert("Error", "Failed to start chat");
            }
          }}
          activeOpacity={0.8}
        >
          <Icon name="chat" size={20} color="#FFF" />
          <Text style={styles.bookButtonText}>Chat with Owner</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#E6E1D6" 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#E6E1D6",
    padding: 20
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#057474",
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "600",
    flex: 1,
    textAlign: 'center'
  },
  headerSpacer: {
    width: 40
  },
  imageContainer: {
    position: 'relative',
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: { 
    width: "100%", 
    height: 280, 
    resizeMode: 'cover'
  },
  availabilityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  availabilityText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600'
  },
  infoContainer: { 
    backgroundColor: '#FFF',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  title: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#333",
    marginBottom: 12
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  category: { 
    fontSize: 14, 
    color: "#666",
    marginLeft: 6,
    textTransform: 'capitalize'
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16
  },
  price: { 
    fontSize: 28, 
    fontWeight: "800", 
    color: "#057474"
  },
  priceUnit: {
    fontSize: 16,
    color: "#666",
    marginLeft: 4,
    fontWeight: '500'
  },
  description: { 
    fontSize: 16, 
    color: "#333",
    lineHeight: 24
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 25,
    backgroundColor: "#057474",
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minHeight: 52
  },
  chatButton: {
    backgroundColor: "#FF6B6B"
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.6
  },
  bookButtonText: { 
    color: "#FFF", 
    fontSize: 16, 
    fontWeight: "600",
    marginLeft: 8
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500'
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center'
  },
  goBackButton: {
    backgroundColor: '#057474',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20
  },
  goBackText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  }
});