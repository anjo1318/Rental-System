import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Dimensions, 
  StatusBar, 
  Image, 
  Alert 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";

const { width, height } = Dimensions.get("window");

export default function BookedProductDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCancelBooking = () => {
    console.log("Sending request to:", `${process.env.EXPO_PUBLIC_API_URL}/api/book/cancel/${params.id}`);

    console.log("handleCancelBooking called"); 
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.put(
                `${process.env.EXPO_PUBLIC_API_URL}/api/book/cancel/${params.id}`
              );

              if (response.data.success) {
                Alert.alert("Booking Cancelled", "Your booking has been successfully cancelled.");
                router.back();
              } else {
                Alert.alert("Error", response.data.message || "Failed to cancel booking.");
              }
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Status bar */}
      <StatusBar barStyle="light-content" backgroundColor="#057474" translucent={false} />

      {/* Header */}
      <View style={[styles.headerWrapper, { height: Math.max(64, Math.round(height * 0.09)) }]}>
        <View style={styles.profileContainer}>
          <View style={styles.iconBox}>
            <Pressable
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/customer/book"); // fallback screen
                }
              }}
              hitSlop={10}
              style={styles.iconPress}
            >
              <Icon name="arrow-back" size={24} color="#FFF" />
            </Pressable>
          </View>
          <Text style={styles.pageName}>Booking Details</Text>
          <View style={styles.iconBox} />
        </View>
      </View>

      {/* Body */}
      <ScrollView
        style={styles.bodyWrapper}
        contentContainerStyle={{ paddingBottom: 120 }} // 👈 extra space so footer doesn't overlap
      >
        {/* Product Info */}
        <View style={styles.card}>
          {params.itemImage ? (
            <Image source={{ uri: params.itemImage }} style={styles.detailImage} resizeMode="cover" />
          ) : (
            <View style={[styles.detailImage, { justifyContent: "center", alignItems: "center", backgroundColor: "#eee" }]}>
              <Icon name="photo-camera" size={40} color="#999" />
            </View>
          )}

          <Text style={styles.productName}>{params.product || "Unknown Product"}</Text>
          <Text style={styles.category}>{params.category || "No Category"}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text
              style={[
                styles.statusText,
                params.status?.toLowerCase() === "pending" && { color: "#D4A017" },
                (params.status?.toLowerCase() === "approved" || params.status?.toLowerCase() === "ongoing") && { color: "#057474" },
                (params.status?.toLowerCase() === "rejected" || params.status?.toLowerCase() === "terminated") && { color: "#D40004" },
              ]}
              numberOfLines={1}
            >
              {params.status || "Unknown"}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Price/Day:</Text>
            <Text style={styles.value}>₱{params.pricePerDay || "N/A"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Rental Period:</Text>
            <Text style={styles.value}>{params.rentalPeriod || "N/A"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>{params.paymentMethod || "N/A"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Pickup Date:</Text>
            <Text style={styles.value}>{formatDate(params.pickUpDate)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Return Date:</Text>
            <Text style={styles.value}>{formatDate(params.returnDate)}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Information</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{params.name || "N/A"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{params.email || "N/A"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{params.phone || "N/A"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{params.address || "N/A"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{params.gender || "N/A"}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Cancel Button */}
      {(params.status?.toLowerCase() === "pending" || params.status?.toLowerCase() === "approved") && (
        <View style={styles.footer}>
          <Pressable
            style={styles.cancelButton}
            onPress={() => {
                console.log("Cancel button pressed"); // ✅ Debug log
                handleCancelBooking();
            }}
            >
            <Text style={styles.cancelText}>Cancel Booking</Text>
            </Pressable>

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6E1D6" },
  headerWrapper: {
    width: "100%",
    backgroundColor: "#057474",
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
    justifyContent: "center",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.04,
    marginTop: height * 0.02,
  },
  iconBox: { width: width * 0.1, alignItems: "center", justifyContent: "center" },
  iconPress: { padding: width * 0.02, borderRadius: 6 },
  pageName: { color: "#FFF", textAlign: "center", flex: 1, fontWeight: "600", fontSize: Math.max(16, Math.round(width * 0.045)) },
  bodyWrapper: { flex: 1, paddingHorizontal: width * 0.04, paddingTop: 16 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailImage: { width: "100%", height: 200, borderRadius: 8, marginBottom: 16 },
  productName: { fontSize: 20, fontWeight: "700", color: "#057474", marginBottom: 4 },
  category: { fontSize: 14, color: "#666", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 6, alignItems: "flex-start" },
  label: { fontSize: 14, fontWeight: "600", color: "#333", flex: 1 },
  value: { fontSize: 14, color: "#444", flex: 2, textAlign: "right" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#057474", marginBottom: 10 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10,       // ensures button stays on top
    elevation: 10,    // Android shadow
  },
  cancelButton: {
    backgroundColor: "#D40004",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
