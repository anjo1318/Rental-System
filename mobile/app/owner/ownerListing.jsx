import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = require("react-native").Dimensions.get("window");

export default function OwnerListing() {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Load owner ID from storage
  const loadOwner = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setOwnerId(user.id);
        fetchOwnerItems(user.id);
      } else {
        router.replace("owner/ownerLogin");
      }
    } catch (err) {
      console.error(err);
      router.replace("owner/ownerLogin");
    }
  };

  // Fetch items
  const fetchOwnerItems = async (id) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/owner/items?ownerId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setItems(
          data.data.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            pricePerDay: item.pricePerDay.toString(),
            itemImage: item.itemImage || "https://via.placeholder.com/150",
            isAvailable: item.availability,
          }))
        );
      } else {
        setItems([]);
        Alert.alert("Error", data.error || "Failed to fetch items");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/owner/items/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
              Alert.alert("Deleted", "Item deleted successfully");
              fetchOwnerItems(ownerId);
            } else {
              Alert.alert("Error", data.error || "Failed to delete");
            }
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "Server not reachable");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    loadOwner();
  }, []);

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.itemImage }} style={styles.itemImage} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.price}>₱{item.pricePerDay}</Text>

      <View style={styles.actions}>
        <Pressable onPress={() => router.push(`/editItem?id=${item.id}`)} style={styles.actionButton}>
          <Icon name="edit" size={20} color="#057474" />
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>

        <Pressable onPress={() => deleteItem(item.id)} style={styles.actionButton}>
          <Icon name="delete" size={20} color="#FF5722" />
          <Text style={styles.actionText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#057474" />
        <Text style={{ marginTop: 10 }}>Loading items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("owner/ownerHome")} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Owner Listing</Text>
        <Pressable onPress={() => router.push("/addItem")}>
          <Icon name="add" size={28} color="#FFF" />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 50 }}>No items found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6E1D6" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: "#057474" },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#FFF" },
  searchContainer: { flexDirection: "row", backgroundColor: "#FFF", margin: 16, borderRadius: 25, paddingHorizontal: 12, alignItems: "center" },
  searchInput: { flex: 1, height: 40 },
  card: { backgroundColor: "#FFF", borderRadius: 12, padding: 12, marginBottom: 16 },
  itemImage: { width: "100%", height: 120, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: "600", marginTop: 8, color: "#333" },
  category: { fontSize: 14, color: "#666", marginTop: 2 },
  price: { fontSize: 16, fontWeight: "bold", color: "#057474", marginTop: 4 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  actionButton: { flexDirection: "row", alignItems: "center" },
  actionText: { marginLeft: 4, fontSize: 14, color: "#333" },
});
