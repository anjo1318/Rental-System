import React, { useEffect, useState } from "react";

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
  Dimensions,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import axios from "axios";
import {useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname } from "expo-router";


const { width, height } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  const [OWNER_ID, setOwnerId] = useState(null);
  const pathname = usePathname();

  // ✅ Check for existing user and auto-route on mount
  useEffect(() => {
    checkUserAndRoute();
  }, []);

  const checkUserAndRoute = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        console.log('✅ User found in home.jsx:', user);
        
        // Auto-route based on user role
        if (user.role === 'customer') {
          console.log('🔄 Customer detected, staying on customer/home');

          setCurrentUser(user);
          setOwnerId(user.id);
          router.replace('/customer/home');

        } else if (user.role === 'owner') {
          console.log('🔄 Owner detected, routing to owner/ownerHome');
          router.replace('/owner/ownerHome');
          return; // Exit early
        } else {
          console.log('⚠️ Unknown user role:', user.role);
        }
      } else {
        console.log('ℹ️ No user data found, showing guest interface');
      }
    } catch (error) {
      console.error('❌ Error checking user data:', error);
    }
  };

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

  const handleNavigation = (route) => {
    // 🚫 Prevent navigating to the same "home"
    if (route === "customer/home") return;
    router.push(`/${route}`);
  };

  // ✅ Handle product click with login check
  const handleProductClick = (item) => {
    if (!currentUser) {
      // User is not logged in, redirect to login
      router.push('/login');
    } else {
      // User is logged in, go to item detail
      router.push({ pathname: '/customer/itemDetail', params: { id: item.id } });
    }
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

  // ✅ Render item matching ownerHome style
  const renderItem = ({ item }) => {
    let imageUrl = "https://via.placeholder.com/150";
    
    if (item.itemImages && item.itemImages.length > 0) {
      try {
        const imgs = JSON.parse(item.itemImages[0]);
        if (Array.isArray(imgs) && imgs.length > 0) {
          imageUrl = imgs[0].replace(/^http:\/\//, "https://").replace(/\\+$/, "");
        }
      } catch (e) {
        console.warn("⚠️ Could not parse itemImages for item:", item.id);
      }
    }

    return (
      <Pressable
      style={styles.card}
      onPress={() => handleProductClick(item)}
    >
      <View style={styles.upperHalf}>
        <Image source={{ uri: imageUrl }} style={styles.itemImage} />
        
        {/* Availability Badge - positioned at bottom of image */}
        <View
          style={[
            styles.availabilityBadge,
            { backgroundColor: item.availability && item.availableQuantity > 0 ? "#4CAF50" : "#FF5722" }
          ]}
        >
          <Text style={styles.availabilityText}>
            {item.availability && item.availableQuantity > 0 ? "Available" : "Unavailable"}
          </Text>
        </View>
      </View>
    
      <View style={styles.lowerHalf}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        
        {/* Rating Row */}
        <View style={styles.ratingRow}>
          <Text style={styles.ratingValue}>5.0</Text>
          <Text style={styles.starIcon}>⭐</Text>
        </View>
    
        {/* Location */}
        <View style={styles.locationRow}>
          <View style={styles.iconContainer}>
            <Icon name="location-on" size={16} color="#666" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.location} numberOfLines={2}>
              {item.location}
            </Text>
          </View>
        </View>
    
        {/* Price */}
        <Text style={styles.price}>₱{item.pricePerDay}</Text>
    
        {/* Quantity */}
        <Text style={styles.quantity}>
          Qty: {item.availableQuantity} / {item.quantity}
        </Text>
      </View>
    </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#057474" 
        translucent={false}
      />



        <View style={styles.topBackground}>
          {/* 🔹 Profile Section */}
          <View style={styles.profileContainer}>
            <Pressable onPress={() => router.push("customer/profile")}>
              <Image
                source={require("../assets/images/new_user.png")}
                style={styles.avatar}
              />
            </Pressable>
            
            <View style={styles.loginActions}>
              <Pressable
                style={styles.loginButton}
                onPress={() => router.push('/first')}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </Pressable>

              <Pressable
                style={[styles.loginButton, styles.signupButton]}
                onPress={() => router.push('/signup/person_info')}
              >
                <Text style={[styles.loginButtonText, styles.signupText]}>
                  Sign Up
                </Text>
              </Pressable>
            </View>

            <View style={styles.notificationWrapper}>
              <Pressable onPress={() => router.push("customer/notifications")}>
                <Icon name="notifications-none" size={24} color="#007F7F" />
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
        </View>
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false} 
        nestedScrollEnabled={true}
      >
 

        {/* 🔹 Recommendations */}
        <View style={{ marginTop: 170 }}>
          <Text style={styles.sectionTitle}>Our Recommendations</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 20 }}
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
        </View>


        {/* 🔹 Items Grid */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 16,
          }}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </ScrollView>

      {/* 🔹 Bottom Nav - Fixed at bottom */}
      <View style={styles.bottomNav}>
        {[
          { name: "Home", icon: "home", route: "/customer/home" },
          { name: "Book", icon: "shopping-cart", route: "/customer/loginInterface" },
          { name: "Message", icon: "mail", route: "/customer/loginInterface" },
          { name: "Time", icon: "schedule", route: "/customer/loginInterface" },
        ].map((navItem, index) => {
          // Compare with current pathname
          const isActive = pathname === navItem.route || (pathname === "/" && navItem.route === "/customer/home");

          return (
            <Pressable
              key={index}
              style={styles.navButton}
              hitSlop={10}
              onPress={() => {
                // Prevent navigation if already on the same page
                if (pathname === navItem.route) return;
                
                // Use push instead of replace to maintain navigation stack
                router.push(navItem.route);
              }}
            >
              <Icon
                name={navItem.icon}
                size={24}
                color={isActive ? "#057474" : "#999"}
              />
              <Text
                style={[
                  styles.navText,
                  { color: isActive ? "#057474" : "#999" },
                ]}
              >
                {navItem.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginTop: 16,
  },

  avatar: { 
    width: width * 0.1, 
    height: width * 0.1, 
    borderRadius: width * 0.05 
  },
  
  loginActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  loginButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#057474',
    backgroundColor: '#ffffff',
    left: 10,
  },

  loginButtonText: {
    fontSize: 12,
    color: '#057474',
    fontWeight: '600',
  },

  signupButton: {
    backgroundColor: '#057474',
    borderWidth: 1,
    borderColor: 'white',
  },

  signupText: {
    color: '#ffffff',
  },

  notificationWrapper: {
    marginLeft: "auto", 
    marginRight: 16,
    position: "relative",
    width: width * 0.10,
    height: width * 0.10,
    borderRadius: (width * 0.12) / 2,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ccc",
  },

  badge: {
    position: "absolute",
    right: -8,
    top: -8,
    backgroundColor: "#ccc",
    borderRadius: 10,
    width: 17,
    height: 17,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#007F7F",
    fontSize: 8,
    fontWeight: "bold",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007F7F",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: -3,
    marginVertical: 10,
    height: 45,
    backgroundColor: "#fff",
  },

  leftIcon: { 
    marginRight: 8 
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },

  rightIcon: { 
    marginLeft: 8 
  },

  topBackground: {
    backgroundColor: "#007F7F",
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  
    zIndex: 1000,
    elevation: 10,
  },
  

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 16,
    marginTop: 20,
  },

  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginLeft: 16,
    marginBottom: 20,
  },

  activeCategory: {
    backgroundColor: "#057474",
    borderColor: "#057474",
  },

  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  activeCategoryText: {
    color: "#FFF",
    fontWeight: "500",
  },

  card: {
    width: (width - 39) / 2,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor:"#057474",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },

  upperHalf: {
    height: 120,
  },

  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  // ✅ Oblong badge at bottom of image
  availabilityBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 1,
    paddingVertical: 1,
    alignItems: "center",
  },

  availabilityText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },

  lowerHalf: {
    padding: 12,
  },

  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  ratingValue: {
    fontSize: 12,
    color: "#666",
    marginRight: 4,
  },

  starIcon: {
    fontSize: 12,
    color: "#f5a623",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  iconContainer: {
    width: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    marginRight: 4,
    paddingTop: 2,
  },

  textContainer: {
    flex: 1,
  },

  location: {
    fontSize: 12,
    color: "#666",
    flexWrap: "wrap",
  },

  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#057474",
    marginBottom: 4,
  },

  quantity: {
    fontSize: 12,
    color: "#666",
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#00000040",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },

  navButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  navText: {
    fontWeight: "600",
    fontSize: 13,
    marginTop: 4,
  },

  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});