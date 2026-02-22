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
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import OwnerItemImages from "./ownerItemImages";
import Header from "../components/header4";
import ScreenWrapper from "../components/screenwrapper";

// ─── Responsive helpers ──────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BASE_WIDTH = 375;
const scale = (size) =>
  Math.round(Math.min(size * 1.4, Math.max(size * 0.7, (SCREEN_WIDTH / BASE_WIDTH) * size)));
const ms = (size, factor = 0.5) =>
  Math.round(size + (scale(size) - size) * factor);
// ─────────────────────────────────────────────────────────────────────────────

export default function OwnerItemDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
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

          if (itemData.itemImages && Array.isArray(itemData.itemImages)) {
            if (typeof itemData.itemImages[0] === 'string') {
              try {
                const parsed = JSON.parse(itemData.itemImages[0]);
                itemData.itemImages = Array.isArray(parsed) ? parsed : [itemData.itemImages[0]];
              } catch (e) {
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

      const fullAddress = [
        customer.houseNumber,
        customer.street,
        customer.barangay,
        customer.town,
        customer.province,
        customer.country,
        customer.zipCode
      ].filter(Boolean).join(", ");

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
      router.push("/customer/book");

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
    console.log("Navigating to edit item:", item.id);
    router.push(`owner/ownerEditItem?id=${item.id}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#057474" />
        <Text style={styles.loadingText}>Loading item details...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Icon name="error-outline" size={scale(64)} color="#ccc" />
        <Text style={styles.errorText}>Item not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackButton}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

        {/* ── Price / Title / Owner / Category ── */}
        <View style={styles.dividerBold} />
        <View style={styles.infoSection}>

          <View style={styles.priceRow}>
            <Text style={{ fontSize: ms(20), color: "#057474" }}>₱</Text>
            <Text style={styles.price}>{parseFloat(item.pricePerDay).toFixed(2)}</Text>
            <Text style={styles.priceUnit}>per hour</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>5.0</Text>
              <Icon name="star" size={scale(16)} color="#FFD700" />
            </View>
          </View>

          <Text style={styles.title}>{item.title}</Text>

          {/* thin full-width line after title */}
          <View style={styles.dividerThinFull} />

          <View style={styles.ownerContainer}>
            <Image
              source={{ uri: "https://via.placeholder.com/40" }}
              style={styles.avatar}
            />
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerText}>
                Kenneth Senorin{" "}
                <Icon name="verified" size={16} color="#3498db" />
              </Text>
              <Text style={styles.ownerAddress}>
                Wawa, Pinamalayan, Mindoro
              </Text>
            </View>
          </View>

          {/* thin full-width line after owner */}
          <View style={styles.dividerThinFull} />

          <View style={styles.categoryRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{item.category}</Text>
          </View>

        </View>

        {/* ── Location ── */}
        <View style={styles.dividerBold} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.specItem}>
            <Icon name="place" size={scale(16)} color="#666" style={{ marginRight: scale(8) }} />
            <Text style={styles.specValue}>{item.location}</Text>
          </View>
        </View>
             <View style={styles.dividerBold} />

        {/* ── Availability ── */}
        <View style={styles.dividerBold} />
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

        {/* ── Specifications ── */}
        <View style={styles.dividerBold} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <Text style={styles.description}>{item.specification || "No specification provided"}</Text>
        </View>

        {/* ── Description ── */}
        <View style={styles.dividerBold} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        

        <View style={styles.dividerBold} />

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
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: scale(20),
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: scale(150),
  },

  // ── Dividers ─────────────────────────────────────────────────────────────
  // Bold teal line — separates major sections
  dividerBold: {
    borderTopWidth: .3,
    borderTopColor: '#0574744D',
  },
  // Thin line inside infoSection — negative margin bleeds to screen edges
  dividerThinFull: {
    borderTopWidth: .3,
    borderTopColor: '#00000025',
    marginHorizontal: -scale(16),
    marginVertical: scale(8),
  },
  // Thin line inside reviewCard — negative margin bleeds to card edges
  dividerThinInCard: {
    borderTopWidth: .3,
    borderTopColor: '#00000025',
    marginHorizontal: -scale(12),
    marginBottom: scale(8),
  },
  // ─────────────────────────────────────────────────────────────────────────

  infoSection: {
    backgroundColor: '#FFF',
    padding: scale(16),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(6),
  },
  price: {
    fontSize: ms(15),
    fontWeight: '700',
    color: '#057474',
    marginLeft: scale(4),
  },
  priceUnit: {
    fontSize: ms(14),
    color: '#666',
    marginLeft: scale(4),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    backgroundColor: '#FFF',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
  },
  rating: {
    fontSize: ms(14),
    fontWeight: '600',
    color: '#333',
    marginRight: scale(4),
  },
  title: {
    fontSize: ms(15),
    fontWeight: '700',
    color: '#333',
    marginBottom: scale(4),
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: scale(4),
    marginBottom: scale(4),
  },
  avatar: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#E0E0E0',
    marginRight: scale(8),
    top: 4,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerText: {
    fontSize: ms(14),
    color: '#333',
    fontWeight: '500',
  },
  ownerAddress: {
    fontSize: ms(12),
    color: '#888',
    marginTop: scale(2),
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(4),
  },
  detailLabel: {
    fontSize: ms(14),
    fontWeight: '800',
    color: '#333',
  },
  detailValue: {
    fontSize: ms(14),
    color: '#666',
    marginLeft: scale(8),
  },
  section: {
    backgroundColor: '#FFF',
    padding: scale(16),
  },
  sectionTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#333',
    marginBottom: scale(10),
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(4),
  },
  specKey: {
    fontSize: ms(13),
    fontWeight: '600',
    color: '#555',
    width: scale(130),
  },
  specValue: {
    flex: 1,
    fontSize: ms(13),
    color: '#666',
    lineHeight: ms(18),
  },
  description: {
    fontSize: ms(14),
    color: '#666',
    lineHeight: ms(22),
  },
  reviewCard: {
    backgroundColor: '#F9F9F9',
    padding: scale(12),
    borderRadius: scale(12),
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  reviewAvatar: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#E0E0E0',
    marginRight: scale(8),
  },
  reviewHeaderText: {
    flex: 1,
  },
  reviewerName: {
    fontSize: ms(14),
    fontWeight: '600',
    color: '#333',
    marginBottom: scale(2),
  },
  stars: {
    flexDirection: 'row',
    gap: scale(2),
  },
  reviewText: {
    fontSize: ms(13),
    color: '#555',
    lineHeight: ms(20),
  },
  actionContainer: {
    position: 'absolute',
    bottom: scale(50),
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    gap: scale(12),
    backgroundColor: "#fff",
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(12),
    borderRadius: scale(12),
    backgroundColor: '#057474',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: ms(15),
    fontWeight: '400',
    marginLeft: scale(6),
  },
  disabledButton: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  loadingText: {
    marginTop: scale(16),
    fontSize: ms(16),
    color: '#666',
    fontWeight: '500',
  },
  errorText: {
    fontSize: ms(18),
    color: '#666',
    fontWeight: '600',
    marginTop: scale(16),
    marginBottom: scale(20),
    textAlign: 'center',
  },
  goBackButton: {
    backgroundColor: '#057474',
    paddingHorizontal: scale(24),
    paddingVertical: scale(12),
    borderRadius: scale(20),
  },
  goBackText: {
    color: '#FFF',
    fontSize: ms(16),
    fontWeight: '600',
  },
});
