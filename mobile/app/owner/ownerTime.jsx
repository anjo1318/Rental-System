import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function ownerTime() {
  const router = useRouter();
  const [ongoingItems, setOngoingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState(null);

  /* LOAD OWNER */
  useEffect(() => {
    loadOwner();
  }, []);

  /* FETCH ONGOING BOOKINGS */
  useEffect(() => {
    if (ownerId) fetchOngoingBookings();
  }, [ownerId]);

  const loadOwner = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return router.replace("owner/ownerLogin");

      const user = JSON.parse(userData);
      setOwnerId(user.id);
    } catch (err) {
      console.error(err);
      router.replace("owner/ownerLogin");
    }
  };

  const fetchOngoingBookings = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/book/ongoing-book/${ownerId}`
      );

      setOngoingItems(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* PARSE IMAGE */
  const getImage = (itemImage) => {
    try {
      const parsed = JSON.parse(itemImage);
      return parsed[0];
    } catch {
      return "https://via.placeholder.com/60";
    }
  };

  /* RENDER ITEM */
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: getImage(item.itemImage) }} style={styles.image} />

      <View style={styles.details}>
        <Text style={styles.title}>{item.product}</Text>
        <Text style={styles.sub}>Pickup: {item.pickUpDate.slice(0, 10)}</Text>
        <Text style={styles.sub}>Return: {item.returnDate.slice(0, 10)}</Text>

        <Text style={styles.status}>ONGOING</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("owner/ownerHome")}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Ongoing Rentals</Text>
      </View>

      {/* BODY */}
      {loading ? (
        <ActivityIndicator size="large" color="#057474" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={ongoingItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 40 }}>
              No ongoing rentals
            </Text>
          }
        />
      )}
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E1D6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#007F7F",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "600",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  sub: {
    fontSize: 12,
    color: "#555",
  },
  status: {
    marginTop: 6,
    color: "#057474",
    fontWeight: "700",
  },
});
