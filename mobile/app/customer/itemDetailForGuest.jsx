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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import ItemImages from "./itemImages";
import Header from "../components/header";
import ScreenWrapper from "../components/screenwrapper";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BASE_WIDTH = 375;

const scale = (size) => {
  const scaled = (SCREEN_WIDTH / BASE_WIDTH) * size;
  return Math.round(Math.min(size * 1.4, Math.max(size * 0.7, scaled)));
};

const ms = (size, factor = 0.5) =>
  Math.round(size + (scale(size) - size) * factor);

export default function ItemDetailForGuest() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

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

  // --- UNCHANGED: original guest booking logic ---
  const handleBooking = () => {
    router.replace("/customer/loginInterface");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${API_URL}/api/item/${id}`);
      if (res.data.success && res.data.data) {
        setItem(res.data.data);
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
      <Header title="Gadget Detail" backgroundColor="#007F7F" />

      <View style={styles.outerWrapper}>
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007F7F"]}
              tintColor="#007F7F"
            />
          }
        >
          {/* Item Images */}
          <ItemImages images={item.itemImages} />

          {/* Price and Title Section */}
          <View style={[styles.detailLine, { borderTopColor: "#00000040", bottom: 6 }]} />
          <View style={styles.infoSection}>
            <View style={styles.priceRow}>
              <Text style={{ fontSize: 20, color: "#057474" }}>₱</Text>
              <Text style={styles.price}>{item.pricePerDay}</Text>
              <Text style={styles.priceUnit}>per hour</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>
                  {parseFloat(item.averageRating || 0).toFixed(1)}
                </Text>
                <Icon name="star" size={16} color="#FFD700" />
              </View>
            </View>

            <Text style={styles.title}>{item.title}</Text>

            {/* Owner Info */}
            <View style={styles.ownerContainer}>
              <Image
                source={{ uri: item.Owner?.profileImage || "https://via.placeholder.com/40" }}
                style={styles.avatar}
              />
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerText}>
                  {item.Owner?.firstName} {item.Owner?.lastName}{" "}
                  <Icon name="verified" size={16} color="#3498db" />
                </Text>
                <Text style={styles.ownerAddress}>{item.location}</Text>
              </View>
            </View>

            {/* Brand */}
            <Text style={styles.detailLabel}>Brand:</Text>
            <Text style={styles.detailValue}>{item.brand || "N/A"}</Text>
          </View>

          <View style={styles.detailLine2} />
          <View style={styles.detailLine4} />
          <View style={styles.detailLine} />

          {/* Specifications */}
          <View style={styles.section1}>
            <Text style={styles.sectionTitle1}>Specifications</Text>
            <Text style={styles.description}>
              {item.specification || "No specification provided"}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.detailLine} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (actual condition)</Text>
            <Text style={styles.description1}>{item.description}</Text>
          </View>

          {/* Reviews */}
          <View style={[styles.detailLine, { borderTopColor: "#00000040", bottom: scale(75) }]} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle2}>Review ({item.totalReviews || 0})</Text>
            {item.reviews && item.reviews.length > 0 ? (
              item.reviews.map((review) => (
                <Pressable
                  key={review.id}
                  style={({ pressed }) => [styles.reviewCard, pressed && { opacity: 0.85 }]}
                  onPress={() => router.replace("/customer/loginInterface")}
                >
                  <View style={styles.reviewHeader}>
                    <Image
                      source={{ uri: "https://via.placeholder.com/40" }}
                      style={styles.reviewAvatar}
                    />
                    <View style={styles.reviewHeaderText}>
                      <Text style={styles.reviewerName}>
                        {review.firstName} {review.lastName}
                      </Text>
                      <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Icon
                            key={star}
                            name={star <= review.starRating ? "star" : "star-border"}
                            size={scale(14)}
                            color="#FFD700"
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{review.description}</Text>
                </Pressable>
              ))
            ) : (
              <Text style={[styles.reviewText, { bottom: scale(60) }]}>No reviews yet.</Text>
            )}
          </View>
          <View style={[styles.detailLine, { borderTopColor: "#00000040", bottom: 72 }]} />
        </ScrollView>

        {/* UNCHANGED: original Chat Now / Book Now buttons with guest redirect logic */}
        <View style={[styles.actionContainer, { paddingBottom: scale(12) + insets.bottom }]}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => router.replace("/customer/loginInterface")}
            activeOpacity={0.8}
          >
            <Icon name="chat-bubble-outline" size={scale(20)} color="#057474" />
            <Text style={styles.chatButtonText}>Chat Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBooking}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: scale(20),
  },

  outerWrapper: {
    flex: 1,
  },

  scrollContent: {
    flex: 1,
  },

  scrollContainer: {
    paddingBottom: scale(20),
  },

  infoSection: {
    backgroundColor: "#FFF",
    padding: scale(16),
    bottom: scale(15),
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    bottom: scale(10),
  },

  price: {
    fontSize: ms(15),
    fontWeight: "700",
    color: "#057474",
    marginLeft: scale(4),
  },

  priceUnit: {
    fontSize: ms(14),
    color: "#666",
    marginLeft: scale(4),
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    backgroundColor: "#FFF",
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
  },

  rating: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#333",
    marginRight: scale(4),
  },

  title: {
    fontSize: ms(15),
    fontWeight: "700",
    color: "#333",
    bottom: scale(12),
  },

  ownerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: scale(12),
    top: scale(25),
  },

  avatar: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: "#E0E0E0",
    marginRight: scale(8),
    bottom: scale(10),
  },

  ownerInfo: {
    flex: 1,
    bottom: scale(15),
  },

  ownerText: {
    fontSize: ms(14),
    color: "#333",
    fontWeight: "500",
  },

  ownerAddress: {
    fontSize: ms(12),
    color: "#888",
    marginTop: scale(2),
  },

  detailLine: {
    paddingTop: scale(12),
    borderTopWidth: 0.3,
    borderTopColor: "#0574744D",
    bottom: scale(44),
  },

  detailLine2: {
    paddingTop: scale(12),
    borderTopWidth: 0.3,
    borderTopColor: "#0574744D",
    bottom: scale(125),
  },

  detailLine4: {
    paddingTop: scale(12),
    borderTopColor: "#0574744D",
    bottom: scale(70),
    borderTopWidth: 0.3,
  },

  detailLabel: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#333",
    top: scale(20),
  },

  detailValue: {
    fontSize: ms(14),
    color: "#666",
    top: scale(1),
    left: scale(50),
  },

  section1: {
    backgroundColor: "#FFF",
    padding: scale(16),
    bottom: scale(47),
  },

  section: {
    backgroundColor: "#FFF",
    padding: scale(16),
    marginBottom: scale(20),
  },

  sectionTitle: {
    fontSize: ms(16),
    fontWeight: "700",
    color: "#333",
    bottom: scale(55),
  },

  sectionTitle1: {
    fontSize: ms(16),
    fontWeight: "700",
    color: "#333",
    bottom: scale(12),
  },

  sectionTitle2: {
    fontSize: ms(16),
    fontWeight: "700",
    color: "#333",
    bottom: scale(78),
  },

  description: {
    fontSize: ms(14),
    color: "#666",
    lineHeight: ms(22),
    left: scale(10),
  },

  description1: {
    fontSize: ms(14),
    color: "#666",
    lineHeight: ms(22),
    left: scale(10),
    bottom: scale(45),
  },

  reviewCard: {
    backgroundColor: "#F9F9F9",
    padding: scale(12),
    borderRadius: scale(12),
    bottom: scale(60),
  },

  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(8),
  },

  reviewAvatar: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: "#E0E0E0",
    marginRight: scale(8),
  },

  reviewHeaderText: {
    flex: 1,
  },

  reviewerName: {
    fontSize: ms(14),
    fontWeight: "600",
    color: "#333",
    marginBottom: scale(2),
  },

  stars: {
    flexDirection: "row",
    gap: scale(2),
  },

  reviewText: {
    fontSize: ms(13),
    color: "#555",
    lineHeight: ms(20),
  },

  actionContainer: {
    flexDirection: "row",
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    gap: scale(12),
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },

  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(10),
    borderRadius: scale(12),
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#057474",
  },

  chatButtonText: {
    color: "#057474",
    fontSize: ms(15),
    fontWeight: "600",
    marginLeft: scale(6),
  },

  bookButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(12),
    borderRadius: scale(12),
    backgroundColor: "#057474",
  },

  bookButtonText: {
    color: "#FFF",
    fontSize: ms(15),
    fontWeight: "600",
    marginLeft: scale(6),
  },

  loadingText: {
    marginTop: scale(16),
    fontSize: ms(16),
    color: "#666",
    fontWeight: "500",
  },

  errorText: {
    fontSize: ms(18),
    color: "#666",
    fontWeight: "600",
    marginTop: scale(16),
    marginBottom: scale(20),
    textAlign: "center",
  },

  goBackButton: {
    backgroundColor: "#057474",
    paddingHorizontal: scale(24),
    paddingVertical: scale(12),
    borderRadius: scale(20),
  },

  goBackText: {
    color: "#FFF",
    fontSize: ms(16),
    fontWeight: "600",
  },
});
