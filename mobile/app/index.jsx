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
const CARD_HEIGHT = height * 0.34;

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
        resizeMode="cover"
              {/* Unavailable overlay - dark overlay covering the whole image with centered text */}
                          {item.availableQuantity <= 0 && (
                            <View style={styles.unavailableOverlay}>
                              <Text style={styles.unavailableOverlayText}>Unavailable</Text>
                            </View>
                          )}
                          {/* Available badge - small pill badge on top-right corner */}
                          {item.availableQuantity > 0 && (
                            <View style={styles.availableBadge}>
                              <Text style={styles.availableBadgeText}>Available</Text>
                            </View>
                          )}
                          </View>
                        </View>
    
      <View style={styles.lowerHalf}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>

      
        {/* <View style={styles.ratingRow}>
                    <Text style={styles.ratingValue}>5.0</Text>
                    <Text style={styles.starIcon}>⭐</Text> 
                  </View> */}
    
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
      <View style={{ marginTop: 140}}>
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
              justifyContent:
              "flex-start",
              marginBottom: 7, right: 9,
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
    left: 5,
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
    height: 37,
    backgroundColor: "#fff",
    top: 12,
  },

  leftIcon: { 
    marginRight: 8 
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
    top: 2,
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
  width: "100%",
  height: "100%",
  overflow: "hidden",
  backgroundColor: "#EDEDED",
},

featuredImage: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},

   card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#fff",
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 0,
    borderColor: "transparent",
    marginHorizontal: 3,
     shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 2,
    top: 3,

  },

  upperHalf: {
  height: CARD_HEIGHT * 0.70,   // fixed image area
  width: "100%",
  backgroundColor: "#fff",
},

  itemImage: {
    width: "100%",
    height: "95%",
    resizeMode: "cover",
  },
  lowerHalf: {
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: 5,
    paddingTop: 5,
    paddingBottom: 10,
    overflow: "hidden",
    
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
    marginTop: 5,
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
    marginTop: 2,
  },
  quantity: {
    marginTop: 5,
  },
    // Dark overlay covering the full image area for unavailable items
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  unavailableOverlayText: {
    color: "#fff",
    fontSize: width * 0.033,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  availableBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  availableBadgeText: {
    color: "#fff",
    fontSize: width * 0.028,
    fontWeight: "500",
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


  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});