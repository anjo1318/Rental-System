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
  RefreshControl,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import ItemImages from "./itemImages";
import Header from "../components/header4";
import ScreenWrapper from "../components/screenwrapper";

// ─── Responsive helpers ──────────────────────────────────────────────────────
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Base width used when the styles were originally designed (typical ~375 pt phone)
const BASE_WIDTH = 375;

/**
 * Scale a size linearly relative to screen width.
 * Clamps so extreme tablets/phones don't go wild.
 */
const scale = (size) => {
  const scaled = (SCREEN_WIDTH / BASE_WIDTH) * size;
  // Allow ±40 % from original value
  return Math.round(Math.min(size * 1.4, Math.max(size * 0.7, scaled)));
};

/**
 * Moderate scale – less aggressive than full linear scale.
 * Good for font sizes and padding.
 */
const ms = (size, factor = 0.5) =>
  Math.round(size + (scale(size) - size) * factor);

// Convenience shorthands
const vw = (pct) => (SCREEN_WIDTH * pct) / 100;
const vh = (pct) => (SCREEN_HEIGHT * pct) / 100;



export default function ItemDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [refreshing, setRefreshing] = useState(false);


  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setCustomer(user);
        }
      } catch (err) {
        console.error("Error loading customer:", err);
      }
    };

    loadCustomer();
  }, []);

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
          fullName: customer.firstName + customer.lastName,
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

  const onRefresh = async () => {
  setRefreshing(true);
  try {
    const res = await axios.get(`${API_URL}/api/item/${id}`);
    if (res.data.success && res.data.data) {
      setItem(res.data.data);
      console.log("Item refreshed successfully");
    }
  } catch (err) {
    console.error("Error refreshing item:", err);
    Alert.alert("Error", "Failed to refresh item");
  } finally {
    setRefreshing(false);
  }
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

  return (
      <ScreenWrapper>
        <Header
          title="Gadget Detail"
          backgroundColor="#007F7F"
        />


      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#007F7F"]}      // Android
          tintColor="#007F7F"       // iOS
        />
      }
      >
  {/* Item Images */}
        <ItemImages images={item.itemImages} />

        {/* Price and Title Section */}
        <View style={[styles.detailLine, { borderTopColor: '#00000040', bottom: 6, }]}/>      
        <View style={styles.infoSection}>
          <View style={styles.priceRow}>
            <Text style={{ fontSize: 20, color: "#057474" }}>₱</Text>
            <Text style={styles.price}>{item.pricePerDay}</Text>
            <Text style={styles.priceUnit}>per day</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>5.0</Text>
              <Icon name="star" size={16} color="#FFD700" />
            </View>
          </View>

          <Text style={styles.title}>{item.title}</Text>

    {/* Owner Info */}
          
           
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
        

          {/* Brand */}   
            
            <Text style={styles.detailLabel}>Brand:</Text>
            <Text style={styles.detailValue}>{item.brand || "N/A"}</Text>
          </View>
        
        <View style={styles.detailLine2}></View>
        <View style={styles.detailLine4}></View>
        <View style={styles.detailLine}></View>
        {/* Specifications */}
        <View style={styles.section1}>
          <Text style={styles.sectionTitle1}>Specifications</Text>
          <Text style={styles.description}>{item.specification || "No specification provided"}</Text>
        </View>


        {/* Description */}
        <View style={styles.detailLine}></View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description (actual condition)</Text>
          <Text style={styles.description1}>{item.description}</Text>
        </View>

        {/* Reviews */}
        <View style={[styles.detailLine, { borderTopColor: '#00000040', bottom: scale(75) }]}
        />

 <View style={styles.section}>
  <Text style={styles.sectionTitle2}>Review (1)</Text>

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
          <Icon name="star" size={scale(14)} color="#FFD700" />
          <Icon name="star" size={scale(14)} color="#FFD700" />
          <Icon name="star" size={scale(14)} color="#FFD700" />
          <Icon name="star" size={scale(14)} color="#FFD700" />
          <Icon name="star-border" size={scale(14)} color="#FFD700" />
        </View>
      </View>
    </View>
   
    <Text style={styles.reviewText}>
      Okay naman sya maganda at maayos ang takbo ng Acer Predator Helios 300 mabilis,
      malinis, at parang brand new pa rin gamitin; walang lag at perfect para sa gaming
      at school works, highly recommended!
    </Text>

  </Pressable>
</View> 
       <View style={[styles.detailLine, { borderTopColor: '#00000040', bottom: 72 }]} />


        
      
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const userData = await AsyncStorage.getItem("user");
              
              if (!token || !userData) {
                Alert.alert("Authentication Required", "Please login to chat", [
                  { text: "OK", onPress: () => router.push("/auth/login") }
                ]);
                return;
              }

              const user = JSON.parse(userData);

              console.log("🔍 Starting chat flow for item:", item.id);
              console.log("👤 Current user ID:", user.id);
              console.log("🏠 Item owner ID:", item.ownerId);

              let chatIdToUse = null;

              try {
                const checkUrl = `${API_URL}/api/chat/check/${item.id}`;
                console.log("🔍 Checking URL:", checkUrl);
                
                const checkRes = await axios.get(checkUrl, {
                  headers: { Authorization: `Bearer ${token}` }
                });

                console.log("📝 Check response:", checkRes.data);

                if (checkRes.data.success && checkRes.data.exists && checkRes.data.chatId) {
                  chatIdToUse = checkRes.data.chatId;
                  console.log("✅ Found existing chat ID:", chatIdToUse);
                }
              } catch (checkError) {
                console.log("ℹ️ No existing chat found:", checkError.message);
              }

              if (!chatIdToUse) {
                console.log("📝 Creating new chat...");
                
                try {
                  const createUrl = `${API_URL}/api/chat/get-or-create`;
                  console.log("📝 Create URL:", createUrl);
                  
                  const createPayload = {
                    itemId: item.id,
                    customerId: user.id,
                    ownerId: item.ownerId,
                  };
                  console.log("📝 Create payload:", JSON.stringify(createPayload));

                  const createRes = await axios.post(
                    createUrl,
                    createPayload,
                    {
                      headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    }
                  );

                  console.log("✅ Create response:", createRes.data);

                  if (createRes.data && createRes.data.id) {
                    chatIdToUse = createRes.data.id;
                    console.log("✅ New chat created with ID:", chatIdToUse);
                  } else {
                    throw new Error("No chat ID in response");
                  }
                } catch (createError) {
                  console.error("❌ Create error:", createError.response?.data || createError.message);
                  console.error("❌ Create error status:", createError.response?.status);
                  console.error("❌ Create error URL:", createError.config?.url);
                  
                  Alert.alert(
                    "Error", 
                    createError.response?.data?.message || "Failed to create chat. Please try again."
                  );
                  return;
                }
              }

              if (chatIdToUse && chatIdToUse !== 'undefined') {
                const navUrl = `/customer/messages?id=${chatIdToUse}&itemId=${item.id}`;
                console.log("🔗 Navigating to:", navUrl);
                router.push(navUrl);
              } else {
                console.error("❌ Invalid chatId:", chatIdToUse);
                Alert.alert("Error", "Failed to initialize chat");
              }
            } catch (err) {
              console.error("❌ Unexpected chat error:", err);
              Alert.alert("Error", "An unexpected error occurred. Please try again.");
            }
          }}
          activeOpacity={0.8}
        >
          <Icon name="chat-bubble-outline" size={scale(20)} color="#057474" />
          <Text style={styles.chatButtonText}>Chat Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bookButton, !item.availability && styles.disabledButton, isBooking && styles.disabledButton]}
          onPress={handleBooking}
          disabled={!item.availability || isBooking}
          activeOpacity={0.8}
        >
          {isBooking ? (
            <>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.bookButtonText}>Processing...</Text>
            </>
          ) : (
            <Text style={styles.bookButtonText}>Book Now</Text>
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
    padding: scale(20),
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: scale(40),
  },
  infoSection: {
    backgroundColor: '#FFF',
    padding: scale(16),
    bottom: scale(15),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    bottom: scale(10),
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
    bottom: scale(12),
  },
ownerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: scale(12),
    top: scale(25),
  },
  avatar: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#E0E0E0',
    marginRight: scale(8),
    bottom: scale(15),
  },
  ownerInfo: {
    flex: 1,
    bottom: scale(15),
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
  detailLine: {
    paddingTop: scale(12),
    borderTopWidth: 0.3,
    borderTopColor: '#0574744D',
    bottom: scale(44),
  },
  detailLine2: {
    paddingTop: scale(12),
    borderTopWidth: 0.3,
    borderTopColor: '#0574744D',
    bottom: scale(112),
  },
  detailLine4: {
    paddingTop: scale(12),
    borderTopColor: '#0574744D',
    bottom: scale(70),
    borderTopWidth: 0.3,
  },
  detailLine3: {
    paddingTop: scale(12),
    borderTopWidth: 0.3,
    borderTopColor: '#0574744D',
    top: scale(15),
  },
  detailLabel: {
    fontSize: ms(14),
    fontWeight: '600',
    color: '#333',
    top: scale(20),
  },
  detailValue: {
    fontSize: ms(14),
    color: '#666',
    top: scale(1),
    left: scale(50),
  },
  section1: {
    backgroundColor: '#FFF',
    padding: scale(16),
    bottom: scale(47),
  },
  section: {
    backgroundColor: '#FFF',
    padding: scale(16),
    marginBottom: scale(20),
  },
  sectionTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#333',
    bottom: scale(55),
  },
  sectionTitle1: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#333',
    bottom: scale(12),
  },
  sectionTitle2: {
    fontSize: ms(16),
    fontWeight: '700',
    color: '#333',
    bottom: scale(78),
  },
  specItem: {
    flexDirection: 'row',
    marginBottom: scale(8),
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
    left: scale(10),
  },
  description1: {
    fontSize: ms(14),
    color: '#666',
    lineHeight: ms(22),
    left: scale(10),
    bottom: scale(45),
  },
  reviewCard: {
    backgroundColor: '#F9F9F9',
    padding: scale(12),
    borderRadius: scale(12),
    bottom: scale(60),
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
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(10),
    borderRadius: scale(12),
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#057474',
  },
  chatButtonText: {
    color: '#057474',
    fontSize: ms(15),
    fontWeight: '400',
    marginLeft: scale(6),
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
