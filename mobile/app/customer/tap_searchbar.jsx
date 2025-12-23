import React, { useEffect, useState } from "react";
import { styles, filterStyles } from "./searchbar_styles";


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
  StyleSheet,
} from "react-native";
import axios from "axios";
import {useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";



export default function TapSearchBar() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  const [OWNER_ID, setOwnerId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);


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
    (item.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.description || "").toLowerCase().includes(search.toLowerCase());

  return matchCategory && matchSearch;
});

  const breakLongWords = (str, maxLen = 18) =>
  str ? str.replace(new RegExp(`(\\S{${maxLen}})`, "g"), "$1\u200B") : "";
  


  return (
    <>
      {/* ✅ StatusBar must be OUTSIDE the main View */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#057474" 
        translucent={false}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} nestedScrollEnabled={true} >
        <View style={styles.topBackground}>
    <View style={styles.searchRow}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Icon name="arrow-back" size={25} color="white" />
      </Pressable>

  {/* 🔍 Search Bar */}
  <View style={styles.searchContainer}>
    <Icon name="search" size={20} color="#cccccc" style={styles.searchIcon} />

    <TextInput
      placeholder="Search your devices.."
      value={search}
      onChangeText={setSearch}
      style={styles.searchInput}
      placeholderTextColor="#555"
    />

    <Pressable onPress={() => setShowFilter(true)} hitSlop={10}>
  <Icon
    name="tune"
    size={20}
    color="gray"
    style={styles.filterIcon}
  />
</Pressable>


  </View>
</View>

        </View>

          
          {/* 🔹 Recommendations */}
          <Text style={styles.sectionTitle}>Searched Result</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
          >
          </ScrollView>

          {/* 🔹 Items Grid */}
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id.toString()}
renderItem={({ item }) => (
  <Pressable
    onPress={() =>
      router.push({
        pathname: "/customer/itemDetail",
        params: { id: item.id },
      })
    }
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
                      url = url
                        .replace(/^http:\/\//, "https://")
                        .replace(/\\+$/, "");
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

        <View
          style={[
            styles.availabilityBadge,
            {
              backgroundColor:
                item.availability && item.availableQuantity > 0
                  ? "#4CAF50"
                  : "#FF5722",
            },
          ]}
        >
          <Text style={styles.availabilityText}>
            {item.availability && item.availableQuantity > 0
              ? "Available"
              : "Unavailable"}
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

        {/* 🔹 Bottom Nav */}
        <View style={styles.bottomNav}>
          {[
            { name: "Home", icon: "home", route: "customer/home" },
            { name: "Book", icon: "shopping-cart", route: "customer/book" },
            { name: "Message", icon: "mail", route: "customer/message" },
            { name: "Time", icon: "schedule", route: "customer/time" },
          ].map((navItem, index) => (
            <Pressable
              key={index}
              style={styles.navButton}
              hitSlop={10}
              onPress={() => handleNavigation(navItem.route)}
            >
              <Icon name={navItem.icon} style={styles.navIcon} />
              <Text style={styles.navText}>{navItem.name}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
       {showFilter && (
  <Filter onClose={() => setShowFilter(false)} />
)}

    </>
  );
}


function Filter({ onClose }) {
  const [price, setPrice] = useState(2000);

  return (
    <View style={filterStyles.overlay}>
      {/* Transparent backdrop */}
      <Pressable style={filterStyles.backdrop} onPress={onClose} />

      {/* Bottom modal */}
      <View style={filterStyles.modal}>
        <View style={filterStyles.header}>
          <Pressable onPress={onClose}>
            <Icon name="close" size={22} color="#333" />
          </Pressable>
          <Text style={filterStyles.headerTitle}>Filter</Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={filterStyles.label}>Category</Text>
        <View style={filterStyles.input}>
          <Text style={filterStyles.placeholder}>Select Category</Text>
        </View>

        <Text style={filterStyles.label}>Brand</Text>
        <View style={filterStyles.input}>
          <Text style={filterStyles.placeholder}>Select Brand</Text>
        </View>

        <Text style={filterStyles.label}>Price Range</Text>
        <Slider
          minimumValue={1000}
          maximumValue={3000}
          step={100}
          value={price}
          onValueChange={setPrice}
          minimumTrackTintColor="#007F7F"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#007F7F"
        />

        <View style={filterStyles.priceRow}>
          <Text>₱ 1000</Text>
          <Text>₱ {price}</Text>
        </View>

        <Text style={filterStyles.label}>Location</Text>
        <View style={filterStyles.input}>
          <Text style={filterStyles.placeholder}>Select Location</Text>
        </View>

        <Pressable style={filterStyles.doneButton} onPress={onClose}>
          <Text style={filterStyles.doneText}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}


