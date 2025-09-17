import React, { useEffect, useState } from "react";
import styles from "./home_styles";

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
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";


export default function Home() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Cellphone", "Projector", "Laptop", "Speaker"];

  const navigationItems = [
    { name: "Home", icon: "home", route: "home" },
    { name: "Book", icon: "shopping-cart", route: "book" },
    { name: "Message", icon: "mail", route: "message" },
    { name: "Time", icon: "schedule", route: "time" },
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
    router.push(`/${route}`);
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
    {/* Upper half for image */}
    <View style={styles.upperHalf}>
      <Image source={{ uri: item.itemImage }} style={styles.itemImage} />
    </View>

    {/* Lower half for text */}
    <View style={styles.lowerHalf}>
      {/* Title */}
      <Text style={styles.title}>{item.title}</Text>

      {/* Rating */}
      <View style={styles.ratingRow}>
        <Text style={styles.ratingValue}>5.0</Text>
        <Text style={styles.starIcon}>⭐</Text>
      </View>

      {/* Location */}
      <Text style={styles.location}>{item.location}</Text>

      {/* Price */}
      <Text style={styles.price}>₱{item.pricePerDay}</Text>
    </View>
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

          {/* Notification Icon with Badge */}
          <View style={styles.notificationWrapper}>
            <Icon name="notifications-none" size={24} color="#057474" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        {/* Left Search Icon */}
        <Icon name="search" size={20} color="#cccccc" style={styles.leftIcon} />

        {/* TextInput */}
        <TextInput
          placeholder="Search your devices.."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#555"
        />

        {/* Right Filter Icon */}
        <Icon name="tune" size={20} color="gray" style={styles.rightIcon} />
      </View>
      
        {/* Featured Devices */}
        <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Featured Devices</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {items.map((item) => (   // 🔄 use items instead of filteredItems
            <View key={item.id} style={styles.featuredCard}>
              <Image
                source={{ uri: item.itemImage }}
                style={styles.featuredImage}
              />
            </View>
          ))}
        </ScrollView>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>Our Recommendations</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10 }}
        >
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
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 16,
          }}
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


