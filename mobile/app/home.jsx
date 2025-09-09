import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import axios from "axios";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // 16px padding + 16px between cards

export default function Review() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/api/item`
        );
        if (response.data.success) {
          setItems(response.data.message);
        } else {
          setError("Failed to fetch items");
        }
      } catch (err) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (error)
    return (
      <View style={styles.center}>
        <Text>Error: {error}</Text>
      </View>
    );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.itemImage }} style={styles.itemImage} />
      <Text style={styles.title}>{item.category}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.price}>{item.description}</Text>
      <Text style={styles.location}>
        {item.Owner.firstName}, {item.Owner.lastName}
      </Text>
      <Text style={styles.price}>₱{item.pricePerDay}</Text>
    </View>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      numColumns={2}
      contentContainerStyle={styles.container}
      columnWrapperStyle={{ justifyContent: "space-between" }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
