import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
// Import React Native Vector Icons
import Icon from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function Review() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Cellphone", "Projector", "Laptop", "Speaker"];

  // Navigation items with their respective icons and routes
  const navigationItems = [
    { name: "Home", icon: "home", route: "Home" },
    { name: "Book", icon: "book", route: "Book" },
    { name: "Message", icon: "message", route: "Message" },
    { name: "Time", icon: "schedule", route: "Time" }
  ];

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

  const handleNavigation = (route) => {
    navigation.navigate(route);
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (error)
    return (
      <View style={styles.center}>
        <Text>Error: {error}</Text>
      </View>
    );

  // Filter items based on search and category
  const filteredItems = items.filter((item) => {
    const matchCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.itemImage }} style={styles.itemImage} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.price}>₱{item.pricePerDay}</Text>
      <Text style={styles.location}>
        {item.Owner.firstName}, {item.Owner.lastName}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Top Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=3" }}
            style={styles.avatar}
          />
          <Text style={styles.username}>Marco Polo</Text>
          <View style={styles.notification}>
            <Text style={styles.notificationText}>2</Text>
          </View>
        </View>

        {/* Search Bar */}
        <TextInput
          placeholder="Search your devices..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchBar}
        />

        {/* Featured Devices */}
        <Text style={styles.sectionTitle}>Featured Devices</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredItems.slice(0, 5).map((item) => (
            <View key={item.id} style={styles.featuredCard}>
              <Image source={{ uri: item.itemImage }} style={styles.featuredImage} />
            </View>
          ))}
        </ScrollView>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>Our Recommendations</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.categoryButton,
                activeCategory === cat && styles.activeCategory,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat && styles.activeCategoryText,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Item List */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
          scrollEnabled={false} // since inside ScrollView
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {navigationItems.map((navItem, index) => (
          <Pressable 
            key={index} 
            style={styles.navButton}
            onPress={() => handleNavigation(navItem.route)}
          >
            <Icon name={navItem.icon} size={24} color="#fff" />
            <Text style={styles.navText}>{navItem.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    position: "relative",
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  username: { marginLeft: 12, fontWeight: "bold", fontSize: 16 },
  notification: {
    backgroundColor: "#057474",
    width: 20,
    height: 20,
    borderRadius: 10,
    position: "absolute",
    right: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  searchBar: {
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginLeft: 16, marginBottom: 8 },
  featuredCard: {
    width: 150,
    height: 120,
    borderRadius: 12,
    marginLeft: 16,
    overflow: "hidden",
  },
  featuredImage: { width: "100%", height: "100%" },
  card: {
    width: (width - 48) / 2,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: { width: "100%", height: 120, borderRadius: 8, marginBottom: 8 },
  title: { fontWeight: "bold", fontSize: 14 },
  price: { fontWeight: "bold", fontSize: 14, marginBottom: 4 },
  location: { fontSize: 12, color: "#555" },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginLeft: 16,
  },
  activeCategory: { backgroundColor: "#057474" },
  categoryText: { fontSize: 12, color: "#555" },
  activeCategoryText: { color: "#fff", fontWeight: "bold" },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#057474",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: { 
    alignItems: "center",
    flex: 1,
  },
  navText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 12,
    marginTop: 4,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});