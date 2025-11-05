import React, { useEffect, useState } from "react";
import styles from "./customer/home_styles";

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


export default function Index() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  useEffect(() => {
    if (!checkingAuth) {
      fetchItems();
    }
  }, [checkingAuth]);

  const checkAuthAndRedirect = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        // User is logged in, redirect to home
        router.replace('/customer/home');
      } else {
        // User is not logged in, stay on this page
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsLoggedIn(false);
    } finally {
      setCheckingAuth(false);
    }
  };

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

  const handleItemPress = async (itemId) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        // User is logged in, navigate to item detail
        router.push({ pathname: '/customer/itemDetail', params: { id: itemId } });
      } else {
        // User is not logged in, redirect to login
        router.push('/customer/loginInterface');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/customer/loginInterface');
    }
  };

  if (checkingAuth) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  
  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  // Filtering items
  const filteredItems = items.filter((item) => {
    const matchCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f2f2f2"
        translucent={false}
      />

      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

          {/* 🔹 Items Grid */}
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
            <Pressable 
              onPress={() => handleItemPress(item.id)}
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
                      numberOfLines={0}
                      ellipsizeMode="clip"
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