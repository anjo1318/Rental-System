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
  Dimensions,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import axios from "axios";
import {useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname } from "expo-router";
import CustomerBottomNav from './components/CustomerBottomNav';
import ScreenWrapper from "./components/screenwrapper";


const { width, height } = Dimensions.get("window");

const CARD_MARGIN = 5;
const CARD_WIDTH = (width - 10 * 2 - CARD_MARGIN) / 2;
const CARD_HEIGHT = height * 0.29;

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
  const [categories, setCategories] = useState(["All"]);


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
          const itemsData = Array.isArray(response.data.data) ? response.data.data : [];
          setItems(itemsData);
          
          // ✅ Extract unique categories from API data
          const uniqueCategories = ["All", ...new Set(
            itemsData
              .map(item => item.category)
              .filter(Boolean) // Remove null/undefined
          )];
          setCategories(uniqueCategories);
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
      router.push({ pathname: '/customer/itemDetailForGuest', params: { id: item.id } });
    } else {
      // User is logged in, go to item detail
      router.push({ pathname: '/customer/itemDetailForGuest', params: { id: item.id } });
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
        <View style={styles.imageWrapper}>
         <Image source={{ uri:item.itemImages && item.itemImages.length > 0
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
      }} style={styles.featuredImage} />
        </View>
      </View>
    
      <View style={styles.lowerHalf}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>

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

        
        {/* Rating Row */}
        <View style={styles.ratingRow}>
          <Text style={styles.ratingValue}>5.0</Text>
          <Text style={styles.starIcon}>⭐</Text>
        </View>
    
        {/* Location */}
        <View style={styles.locationRow}>
          <View style={styles.iconContainer}>
            <Image
            source={require("../assets/images/location.png")}
            style={{ width: 14, height: 17 }}
            resizeMode="contain"
          />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.location} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>
    
        {/* Price */}
        <Text style={styles.price}>₱{item.pricePerDay}</Text>
    
        {/* <Text style={styles.quantity}>
          Qty: {item.availableQuantity} / {item.quantity}
        </Text> */}
        
      </View>
    </Pressable>
    );
  };

  return (
    
       <ScreenWrapper backgroundColor="#007F7F">

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
                 <Image
                  source={require("../assets/images/notification.png")}
                  style={{ width: 30, height: 30 }}
                  resizeMode="contain"
                />
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
          {categories.map((cat, index) => (
            <Pressable
              key={cat}
              style={[
                styles.categoryButton,
                index !== 9 && styles.notAllSpacing, 
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
            marginBottom: 7,
          }}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 16, }}
        />
      </ScrollView>
      <CustomerBottomNav/>
        </ScreenWrapper>
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
    top: 16,
  },

  avatar: { 
    width: width * 0.13, 
    height: width * 0.13, 
    borderRadius: width * 0.05,
    right: 10,
  },
  
  loginActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#057474',
    backgroundColor: '#ffffff',
    left: 5,
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
    marginRight: 5,
    marginTop: 7,
    position: "relative",
    borderRadius: (width * 0.12) / 2,
    justifyContent: "center",
    top: 9,
    },


  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007F7F",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: -3,
    marginVertical: 5,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 16,
    marginTop: 40,
  },

 featuredCard: {
    width: width * 0.65,
    height: height * 0.30,
    borderRadius: width * 0.03,
    marginLeft: width * 0.04,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#007F7F99",
    
  
  },
  imageWrapper: {
    width: "220",
    height: 180,          
    borderBottomWidth: 0,
    borderBottomColor: "transparent",
    overflow: "hidden",   
    top: -60,
    backgroundColor: "#EDEDED",
    
    

  },

  featuredImage: {
    width: "70%",
    height: "70%",
    resizeMode: "cover",
    top: 50,
    left: 30,
    
  },

   card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 0,
    borderColor: "transparent",
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: "#007F7F80",
    top: 8,
    right: 9,
  },

  upperHalf: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    top: 50,
  },
  itemImage: {
    width: "100%",
    height: "95%",
    resizeMode: "cover",
  },
  lowerHalf: {
    flex: 1.5,
    flexDirection: "column",
    paddingHorizontal: 5,
    paddingTop: 5,
    paddingBottom: 10,
    top: 47,
    
  },

  title: {
    fontWeight: "bold",
    fontSize: width * 0.04,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingValue: {
    fontSize: width * 0.035,
    color: "#555",
    marginRight: 4,
  },
  starIcon: {
    fontSize: width * 0.035,
    color: "#f5a623",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -5,
    top: 5,
  },

  iconContainer: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
  },

  location: {
    fontSize: width * 0.035,
    color: "#555",
    flexShrink: 1,
    flexWrap: "wrap",
  },

  price: {
    fontWeight: "bold",
    fontSize: width * 0.04,
    marginTop: 10,
  },
  quantity: {
    marginTop: 5,
  },
  availabilityBadge: {
    width: "45%",
    paddingVertical: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderRadius: 10,
    top: 5,
  },

  availabilityText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "400",
  },


  categoryButton: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    marginHorizontal: -10,
    borderRadius: 20,
    backgroundColor: "transparent",
    marginLeft: width * 0.02,
  },

  notAllSpacing: {
  marginLeft: 12,   // 👈 pushes everything EXCEPT "All" to the right
},
  activeCategory: { 
    backgroundColor: "#007F7F" 
  },
  categoryText: { 
    fontSize: width * 0.035, 
    color: "#555" 
  },
  activeCategoryText: { 
    color: "#fff", 
    fontWeight: "bold" 
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