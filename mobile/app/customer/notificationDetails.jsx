import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, StatusBar, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import Header from "../components/header";

const { width, height } = Dimensions.get("window");

export default function NotificationDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
        <Header
          title="Notifications Details"
          backgroundColor="#007F7F"
        />
      <ScrollView style={styles.bodyWrapper} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Product Info */}
        <View style={styles.card}>

             {params.itemImage ? (
                <Image
                source={{ uri: params.itemImage }}
                style={styles.detailImage}
                resizeMode="cover"
                />
            ) : (
                <View style={[styles.detailImage, { justifyContent: "center", alignItems: "center", backgroundColor: "#eee" }]}>
                <Icon name="photo-camera" size={40} color="#999" />
                </View>
            )}


          <Text style={styles.productName}>{params.product}</Text>
          <Text style={styles.category}>{params.category}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text
              style={[
                styles.status,
                params.status === "pending" ? styles.pending : styles.approved,
              ]}
            >
              {params.status}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Price/Day:</Text>
            <Text style={styles.value}>₱{params.pricePerDay}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Rental Period:</Text>
            <Text style={styles.value}>{params.rentalPeriod}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>{params.paymentMethod}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Pickup Date:</Text>
            <Text style={styles.value}>{params.pickUpDate}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Return Date:</Text>
            <Text style={styles.value}>{params.returnDate}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Information</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{params.name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{params.email}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{params.phone}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{params.address}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{params.gender}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E1D6",
  },
  bodyWrapper: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingTop: 16,
  },
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
  productName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#057474",
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  value: {
    fontSize: 14,
    color: "#444",
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  pending: {
    color: "#D40004",
  },
  approved: {
    color: "#057474",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#057474",
    marginBottom: 10,
  },
});
