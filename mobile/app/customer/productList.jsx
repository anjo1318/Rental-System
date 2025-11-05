import React, { useEffect, useState } from "react";
import styles from "./home_styles";

import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  Pressable,
  TextInput,
  ScrollView,
  StatusBar,
} from "react-native";
import axios from "axios";
import {useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function ProductList() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  const [OWNER_ID, setOwnerId] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/api/item`
        );
        if (response.data.success) {
          setItems(Array.isArray(response.data.data) ? response.data.data : []);
        }
        else {
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

  useEffect(()=>{
    loadUserData();
  },[]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setOwnerId(user.id);
        console.log('✅ User loaded from storage in home.jsx:', user);
        return user.id;
      } else {
        console.log('❌ No user data found, redirecting to login');
        router.replace('/login'); // Redirect to login if no user data
        return null;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      router.replace('/login');
      return null;
    }
  };

  const handleNavigation = (route) => {
    // 🚫 Prevent navigating to the same "home"
    if (route === "customer/home") return;
    router.push(`/${route}`);
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (error)
    return (
      <View style={styles.center}>
        <Text>Error: {error}</Text>
      </View>
    );

  // Filtering items
  const filteredItems = items.filter((item) => {
    const matchCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const breakLongWords = (str, maxLen = 18) =>
  str ? str.replace(new RegExp(`(\\S{${maxLen}})`, "g"), "$1\u200B") : "";
  


  return (
    <>
      {/* ✅ StatusBar must be OUTSIDE the main View */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f2f2f2"
        translucent={false}
      />

      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* 🔹 Profile Section */}
          <View style={styles.profileContainer}>
           <Pressable onPress={() => router.push("customer/profile")}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=3" }}
              style={styles.avatar}
            />
          </Pressable >
            <Text style={styles.username}>{currentUser.firstName} {currentUser.lastName}</Text>
            <View style={styles.notificationWrapper}>
            <Pressable onPress={() => router.push("customer/notifications")}>
              <Icon name="notifications-none" size={24} color="#057474" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </Pressable>


            </View>
          </View>

          {/* 🔹 Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#cccccc" style={styles.leftIcon} />
            <TextInput
              placeholder="Search your devices.."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              placeholderTextColor="#555"
            />
            <Icon name="tune" size={20} color="gray" style={styles.rightIcon} />
          </View>

          {/* 🔹 Featured Devices */}
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>Featured Devices</Text>
          </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {items.map((item) => {
                          let imageUrl = "https://via.placeholder.com/150";
                          
                          if (item.itemImages && item.itemImages.length > 0) {
                            try {
                              const parsedImages = JSON.parse(item.itemImages[0]);
                              if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                                imageUrl = parsedImages[0].replace(/^http:/, "https:");
                              }
                            } catch (e) {
                              console.error('Image parse error for item', item.id, ':', e);
                            }
                          }

                          return (
                            <View key={item.id} style={styles.featuredCard}>
                              <Image
                                source={{ uri: imageUrl }}
                                style={styles.featuredImage}
                                resizeMode="cover"
                                onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                                onLoad={() => console.log('Image loaded:', imageUrl)}
                              />
                            </View>
                          );
                        })}
          </ScrollView>

          {/* 🔹 Recommendations */}
          <Text style={styles.sectionTitle}>Our Recommendations</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
          >
            {["All", "Cellphone", "Projector", "Laptop", "Speaker"].map((cat) => (
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

          {/* 🔹 Items Grid */}
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
            <Pressable 
              onPress={() => router.push({ pathname: '/customer/itemDetail', params: { id: item.id } })}
            >
              <View style={styles.card}>
                <View style={styles.upperHalf}>
                  <Image
                    source={{
                      uri:
                        item.itemImages && item.itemImages.length > 0
                          ? (() => {
                              try {
                                const imgs = JSON.parse(item.itemImages[0]);
                                let url =
                                  Array.isArray(imgs) && imgs.length > 0
                                    ? imgs[0]
                                    : "https://via.placeholder.com/150";
                                url = url.replace(/^http:\/\//, "https://").replace(/\\+$/, "");
                                return url;
                              } catch {
                                return "https://via.placeholder.com/150";
                              }
                            })()
                          : "https://via.placeholder.com/150",
                    }}
                    style={styles.featuredImage}
                    resizeMode="cover"
                  />


                  {/* Availability Badge */}
                  <View style={[
                    styles.availabilityBadge,
                    { backgroundColor: item.availability && item.availableQuantity > 0 ? "#4CAF50" : "#FF5722" }
                  ]}>
                    <Text style={styles.availabilityText}>
                      {item.availability && item.availableQuantity > 0 ? "Available" : "Unavailable"}
                    </Text>
                  </View>
                </View>

                <View style={styles.lowerHalf}>
                  <Text style={styles.title}>{item.title}</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingValue}>5.0</Text>
                    <Text style={styles.starIcon}>⭐</Text>
                  </View>
                  <View style={styles.locationRow}>
                  <View style={styles.iconContainer}>
                    <Icon name="location-on" size={20} color="#666" />
                  </View>

                  <View style={styles.textContainer}>
                    <Text
                      style={styles.location}
                      numberOfLines={0}          // ✅ allow unlimited lines
                      ellipsizeMode="clip"       // ✅ no "..." truncation
                    >
                      {item.location}
                    </Text>
                  </View>
                </View>

                <Text style={styles.price}>₱{item.pricePerDay}</Text>



                  {/* Quantity */}
                  <Text style={styles.quantity}>
                    Quantity: {item.availableQuantity} / {item.quantity}
                  </Text>
                </View>
              </View>
            </Pressable>

            )}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 16,
            }}
            scrollEnabled={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />

        </ScrollView>

       
      </View>
    </>
  );
}
