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
import ItemImages from "./itemImages";

export default function ItemDetail() {
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
          <Icon name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gadget Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Item Images */}
      <ItemImages images={item.itemImages} />

      {/* Item Info */}
      <View style={styles.titleContainer}>
        <Text style={styles.price}>₱{item.pricePerDay}</Text>
        <Text style={styles.titleLabel}> per hour</Text>
      </View>
        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.container}>
      
      {/* Text + Verified */}
      <View style={styles.textContainer}>
        {/* Avatar */}
      <Image
        source={{ uri: "https://via.placeholder.com/50" }} // replace with your profile image URL
        style={styles.avatar}
      />

        <Text style={styles.greetingText}>
          Hello kenneth{" "}
          <Icon name="check-circle" size={18} color="#3498db" />
        </Text>
      </View>
    </View>
        
        <View style={styles.categoryRow}>
          <Icon name="category" size={16} color="#666" />
          <Text style={styles.category}>{item.category}</Text>
        </View>
        
     {/* Specifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specification</Text>
        <View style={styles.specItem}>
          <Text style={styles.specKey}>Processor:</Text>
          <Text style={styles.specValue}>Intel Core i7 (10th Gen)</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specKey}>Graphics:</Text>
          <Text style={styles.specValue}>NVIDIA GeForce RTX 3060 6GB GDDR6</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specKey}>Memory:</Text>
          <Text style={styles.specValue}>16GB DDR4 RAM</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specKey}>Storage:</Text>
          <Text style={styles.specValue}>512GB SSD</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specKey}>Display:</Text>
          <Text style={styles.specValue}>15.6" Full HD (1920x1080) IPS, 144Hz refresh rate</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specKey}>Operating System:</Text>
          <Text style={styles.specValue}>Windows 11 Home (Activated)</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specKey}>Keyboard:</Text>
          <Text style={styles.specValue}>RGB backlit gaming keyboard</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specKey}>Connectivity:</Text>
          <Text style={styles.specValue}>Wi-Fi 6, Bluetooth 5.0, HDMI, USB 3.2 ports</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specKey}>Battery:</Text>
          <Text style={styles.specValue}>Good battery health, lasts 3–5 hours</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description (actual condition)</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>

      {/* Review */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Review(1)</Text>
        <View style={styles.reviewContainer}>
          <Text style={styles.reviewerName}>Mr.Kennth</Text>
          <View style={styles.stars}>
            <Icon name="star" size={16} color="#FFD700" />
            <Icon name="star" size={16} color="#FFD700" />
            <Icon name="star" size={16} color="#FFD700" />
            <Icon name="star" size={16} color="#FFD700" />
            <Icon name="star-border" size={16} color="#FFD700" />
          </View>
          <Text style={styles.reviewText}>
            Okay naman sya maganda at maayos ang takbo ng Acer Predator Helios 300 mabilis, malinis, at parang brand new pa rin gamitin; walang lag at perfect para sa gaming at school works, highly recommended!
          </Text>
        </View>
      </View>
        
        
      

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.chatButton, !item.availability && styles.disabledButton, isBooking && styles.disabledButton]} 
          onPress={handleBooking}
          disabled={!item.availability || isBooking}
          activeOpacity={0.8}
        >
          {isBooking ? (
            <>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.chatButtonText}>Processing...</Text>
            </>
          ) : (
            <>
              <Icon name="chat" size={20} color="#057474" />
              <Text style={styles.chatButtonText}>Chat Now</Text>
            </>
          )}
        </TouchableOpacity>

       <TouchableOpacity
            style={[styles.bookButton, styles.chatButton, { backgroundColor: "#057474" }]}

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

              // Step 1: Check if chat already exists
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

              // Step 2: Create new chat if needed
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

              // Step 3: Navigate with valid chatId
              if (chatIdToUse && chatIdToUse !== 'undefined') {
                const navUrl = `/customer/chat?id=${chatIdToUse}&itemId=${item.id}`;
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

          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    top: 7,
  },
  headerTitle: {
    fontSize: 17,
    color: "#FFF",
    fontWeight: "600",
    flex: 1,
    textAlign: 'center',
    top: 7,
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
    flexDirection: "row",
    fontSize: 24, 
    fontWeight: "700", 
    color: "#333",
    marginBottom: 12
  },
  titleContainer: {
  flexDirection: "row", // makes children side by side
  alignItems: "center", // vertical alignment
  marginBottom: 12,
},
titleLabel: {
  fontSize: 24,
  fontWeight: "700",
  color: "#333",
},
avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginLeft: 10,
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

  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  specItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  specKey: {
    fontWeight: "600",
    width: 130,
    color: "#555",
  },
  specValue: {
    flex: 1,
    color: "#333",
  },
  reviewContainer: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
  },
  reviewerName: {
    fontWeight: "700",
    marginBottom: 4,
    color: "#333",
  },
  stars: {
    flexDirection: "row",
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 14,
    color: "#444",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    bottom: 0,
    top: 100,          // ⬅ stick to very bottom
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,  // safe spacing from edge
    gap: 12,
  },

  bookButton: {
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 25,
    backgroundColor: "#000",
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minHeight: 52
  },
    bookButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600",
    marginLeft: 8
  },

    chatButton: {
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 25,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minHeight: 52
  },

 
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.6
  },

   chatButtonText: { 
    color: "#057474", 
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