import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import axios from 'axios';

const { width } = Dimensions.get("window");

export default function ConfirmationScreen({ bookingData }) {
  const router = useRouter();

  const confirmRent = async() => {
    try{
        console.log("Payload data", bookingData);
        response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/book/book-item`,bookingData);

    }catch (error) {
        console.log(error);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.iconWrapper}>
          <Icon name="check-circle" size={80} color="#4CAF50" />
          <Text style={styles.successText}>Booking Confirmed!</Text>
        </View>

        {/* Product Image */}
        <View style={{ alignItems: "center", marginBottom: 15 }}>
          {bookingData?.itemDetails?.itemImage ? (
            <Image
              source={{ uri: bookingData.itemDetails.itemImage }}
              style={styles.productImage}
            />
          ) : (
            <Text style={{ color: "#888" }}>No image available</Text>
          )}
        </View>

        {/* Booking Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Booking Details</Text>

          <Text style={styles.detailItem}>
            <Text style={styles.label}>Product: </Text>
            {bookingData?.itemDetails?.title}
          </Text>

          <Text style={styles.detailItem}>
            <Text style={styles.label}>Category: </Text>
            {bookingData?.itemDetails?.category}
          </Text>

          <Text style={styles.detailItem}>
            <Text style={styles.label}>Location: </Text>
            {bookingData?.itemDetails?.location}
          </Text>

          <Text style={styles.detailItem}>
            <Text style={styles.label}>Price Per Day: ₱</Text>
            {bookingData?.itemDetails?.pricePerDay}
          </Text>

          <Text style={styles.detailItem}>
            <Text style={styles.label}>Payment Method: </Text>
            {bookingData?.paymentMethod || "Not selected"}
          </Text>

          <Text style={styles.detailItem}>
            <Text style={styles.label}>Name: </Text>
            {bookingData?.customerDetails?.fullName}
          </Text>

          <Text style={styles.detailItem}>
            <Text style={styles.label}>Email: </Text>
            {bookingData?.customerDetails?.email}
          </Text>

          <Text style={styles.detailItem}>
            <Text style={styles.label}>Phone: </Text>
            {bookingData?.customerDetails?.phone}
          </Text>

          <Text style={styles.detailItem}>
            <Text style={styles.label}>Address: </Text>
            {bookingData?.customerDetails?.location}
          </Text>

          <Text style={styles.detailItem}>
            <Text style={styles.label}>Gender: </Text>
            {bookingData?.customerDetails?.gender}
          </Text>

          <Text style={styles.detailItem}>
            <Text style={styles.label}>Rental Period: </Text>
            {bookingData?.rentalDetails?.period}
          </Text>

          <Text style={styles.detailItem}>
            <Text style={styles.label}>Pickup Date: </Text>
            {new Date(bookingData?.rentalDetails?.pickupDate).toLocaleDateString()}
          </Text>

          <Text style={styles.detailItem}>
            <Text style={styles.label}>Return Date: </Text>
            {new Date(bookingData?.rentalDetails?.returnDate).toLocaleDateString()}
          </Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { marginTop: 10 }]}
          onPress={() => 
            confirmRent()
          }
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Rent Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E1D6",
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  iconWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  successText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4CAF50",
    marginTop: 10,
  },
  productImage: {
    width: width * 0.9,
    height: 220,
    borderRadius: 12,
    resizeMode: "cover",
  },
  detailsContainer: {
    width: width * 0.9,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  detailItem: {
    fontSize: 14,
    marginBottom: 6,
    color: "#555",
  },
  label: {
    fontWeight: "600",
    color: "#000",
  },
  button: {
    backgroundColor: "#057474",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
