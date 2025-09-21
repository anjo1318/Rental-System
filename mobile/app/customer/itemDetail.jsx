import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";


export default function ItemDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // get item id from params
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/api/item/${id}`
        );
        if (res.data.success && res.data.data) {
          setItem(res.data.data);
        } else {
          Alert.alert("Error", "Item not found");
          router.back();
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to fetch item");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleBooking = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/book`,
        { itemId: item.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        Alert.alert("Success", "Item booked successfully!");
        router.back();
      } else {
        Alert.alert("Error", res.data.error || "Booking failed");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to book item");
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#057474" />
      </View>
    );
  }

  // Item not found
  if (!item) {
    return (
      <View style={styles.center}>
        <Text>Item not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: "#057474", fontWeight: "600" }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Icon name="arrow-back" size={28} color="#057474" />
      </Pressable>

      {/* Item Image */}
      <Image source={{ uri: item.itemImage }} style={styles.image} />

      {/* Item Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.price}>₱{item.pricePerDay} / day</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>

      {/* Book Button */}
      <Pressable style={styles.bookButton} onPress={handleBooking}>
        <Text style={styles.bookButtonText}>Book Now</Text>
      </Pressable>

      {/* Chat Button */}
        <Pressable
          style={[styles.bookButton, { backgroundColor: "#FF6B6B" }]}
          onPress={async () => {
            try {
              // 1. Check if chat already exists for this item and user
              const token = await AsyncStorage.getItem("token");
              let existingChatId = null;

              const res = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/api/chat/check/${item.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (res.data.success && res.data.chatId) {
                existingChatId = res.data.chatId;
              }

              // 2. Generate chatId if none exists
              const chatId = existingChatId || uuidv4();

              // 3. Navigate to ChatScreen with chatId
              router.push(`/customer/chat?id=${chatId}&itemId=${item.id}`);
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to start chat");
            }
          }}
        >
          <Text style={styles.bookButtonText}>Chat</Text>
        </Pressable>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6E1D6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  backButton: { margin: 16 },
  image: { width: "90%", height: 250, alignSelf: "center", borderRadius: 12 },
  infoContainer: { padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  category: { fontSize: 14, color: "#666", marginBottom: 4 },
  price: { fontSize: 18, fontWeight: "bold", color: "#057474", marginBottom: 12 },
  description: { fontSize: 14, color: "#333" },
  bookButton: {
    margin: 16,
    padding: 16,
    borderRadius: 25,
    backgroundColor: "#057474",
    alignItems: "center",
  },
  bookButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
