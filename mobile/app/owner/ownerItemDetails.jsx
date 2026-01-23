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
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import OwnerItemImages from "./ownerItemImages";
import Header from "../components/header";
import ScreenWrapper from "../components/screenwrapper";

export default function OwnerItemDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // get item id from params
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [owner, setOwner] = useState(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const loadOwner = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setOwner(user);
        }
      } catch (err) {
        console.error("Error loading owner:", err);
      }
    };

    loadOwner();
  }, []);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        console.log("Fetching item with ID:", id);
        const res = await axios.get(`${API_URL}/api/item/${id}`);
        
        if (res.data.success && res.data.data) {
          const itemData = res.data.data;
          
          // Parse itemImages - handle different formats
          if (itemData.itemImages && Array.isArray(itemData.itemImages)) {
            if (typeof itemData.itemImages[0] === 'string') {
              try {
                // Try to parse as JSON first
                const parsed = JSON.parse(itemData.itemImages[0]);
                itemData.itemImages = Array.isArray(parsed) ? parsed : [itemData.itemImages[0]];
              } catch (e) {
                // If parsing fails, it's already a URL string, keep as is
                console.log("ItemImages is already in URL format");
              }
            }
          }
          
          setItem(itemData);
          console.log("Item fetched successfully:", itemData);
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

  // Get owner name from item.Owner or fallback to stored owner data
  const ownerName = item.Owner?.firstName || owner?.firstName || owner?.name || 'Owner';

  return (
    <ScreenWrapper>
      <Header
        title="Item Details"
        backgroundColor="#007F7F"
      />

      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Item Images */}
        <OwnerItemImages images={Array.isArray(item.itemImages) ? item.itemImages : []} />

        {/* Price and Title Section */}
        <View style={[styles.detailLine, { borderTopColor: '#00000040', bottom: 6, }]}/>      
        <View style={styles.infoSection}>
          <View style={styles.priceRow}>
            <Text style={{ fontSize: 20, color: "#057474" }}>₱</Text>
            <Text style={styles.price}>{parseFloat(item.pricePerDay).toFixed(2)}</Text>
            <Text style={styles.priceUnit}>per hour</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>5.0</Text>
              <Icon name="star" size={16} color="#FFD700" />
            </View>
          </View>

          <Text style={styles.title}>{item.title}</Text>

        
          {/* Category/Brand */}
          <Text style={styles.detailLabel}>Category</Text>
          <Text style={styles.detailValue}>{item.category}</Text>
        </View>
        
        <View style={styles.detailLine2}></View>
        <View style={styles.detailLine4}></View>
        <View style={styles.detailLine}></View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.specItem}>
            <Icon name="place" size={16} color="#666" style={{ marginRight: 8 }} />
            <Text style={styles.specValue}>{item.location}</Text>
          </View>
        </View>

        {/* Availability */}
        <View style={styles.detailLine}></View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.specItem}>
            <Text style={styles.specKey}>Status:</Text>
            <Text style={[styles.specValue, { color: item.availability ? '#4CAF50' : '#F44336', fontWeight: '600' }]}>
              {item.availability ? 'Available' : 'Not Available'}
            </Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specKey}>Quantity:</Text>
            <Text style={styles.specValue}>{item.availableQuantity} / {item.quantity}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.detailLine}></View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        {/* Reviews */}
        <View style={[styles.detailLine, { borderTopColor: '#00000040' }]} />
        <View style={[styles.detailLine, { borderTopColor: '#00000040' }]} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Review (1)</Text>

          <Pressable
            style={({ pressed }) => [
              styles.reviewCard,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => router.push("/customer/review")}
          >
            <View style={styles.reviewHeader}>
              <Image
                source={{ uri: "https://via.placeholder.com/40" }}
                style={styles.reviewAvatar}
              />
              <View style={styles.reviewHeaderText}>
                <Text style={styles.reviewerName}>Mr. Kenneth</Text>

                <View style={styles.stars}>
                  <Icon name="star" size={14} color="#FFD700" />
                  <Icon name="star" size={14} color="#FFD700" />
                  <Icon name="star" size={14} color="#FFD700" />
                  <Icon name="star" size={14} color="#FFD700" />
                  <Icon name="star-border" size={14} color="#FFD700" />
                </View>
              </View>
            </View>
           
            <Text style={styles.reviewText}>
              Great item! Very well maintained and works perfectly. Highly recommended for anyone looking to rent quality equipment.
            </Text>
          </Pressable>
        </View>
        <View style={[styles.detailLine3, { borderTopColor: '#00000040' }]} />

        <View style={styles.actionContainer}>
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
              <Text style={styles.bookButtonText}>Edit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 150,
  },
  infoSection: {
    backgroundColor: '#FFF',
    padding: 16,
    bottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#057474',
    marginLeft: 4,
  },
  priceUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    top: 25,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  ownerText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  detailLine: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#0574744D',
  },
  detailLine2: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#0574744D',
    bottom: 105,
  },
  detailLine4: {
    paddingTop: 12,
    borderTopColor: '#0574744D',
    bottom: 50,
    borderTopWidth: 1,
  },
  detailLine3: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#0574744D',
    top: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    top: 45,
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    top: 45,
    left: 5,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  specItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  specKey: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    width: 130,
  },
  specValue: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  reviewCard: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  reviewHeaderText: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#fff",
    bottom: 50,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#057474',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '400',
    marginLeft: 6,
  },
  disabledButton: {
    backgroundColor: '#CCC',
    opacity: 0.6,
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