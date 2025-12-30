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
} from "react-native";
import axios from "axios";
import {useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname } from "expo-router";


const { width, height } = Dimensions.get("window");

const CARD_MARGIN = 16;
const CARD_WIDTH = (width - 16 * 2 - CARD_MARGIN) / 2;
const CARD_HEIGHT = height * 0.45;

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
          console.log('ℹ️ Guest user allowed on first.jsx');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
  };

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

      <ScrollView style={styles.container} 
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false} nestedScrollEnabled={true} >
        <View style={styles.topBackground}>
          {/* 🔹 Profile Section */}
          <View style={styles.profileContainer}>
           <Pressable onPress={() => router.push("customer/profile")}>
            <Image
              source={require("../assets/images/new_user.png")}
              style={styles.avatar}
            />
          </Pressable >
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
                            <Pressable 
                              key={item.id} 
                              onPress={() => handleProductClick(item)}
                            >
                              <View style={styles.featuredCard}>
                                <Image
                                  source={{ uri: imageUrl }}
                                  style={styles.featuredImage}
                                  resizeMode="cover"
                                  onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                                  onLoad={() => console.log('Image loaded:', imageUrl)}
                                />
                              </View>
                            </Pressable>
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
              onPress={() => handleProductClick(item)}
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

        {/* 🔹 Bottom Nav */}
<View style={styles.bottomNav}>
  {[
    { name: "Home", icon: "home", route: "/customer/home" },
    { name: "Book", icon: "shopping-cart", route: "/customer/book" },
    { name: "Message", icon: "mail", route: "/customer/message" },
    { name: "Time", icon: "schedule", route: "/customer/time" },
  ].map((navItem, index) => {
    const isActive = pathname === navItem.route;

    return (
      <Pressable
        key={index}
        style={styles.navButton}
        hitSlop={10}
        onPress={() => router.push(navItem.route)}
      >
        <Icon
          name={navItem.icon}
          size={24}
          color={isActive ? "#057474" : "#999"}   // ✅ green / gray
        />
        <Text
          style={[
            styles.navText,
            { color: isActive ? "#057474" : "#999" }, // ✅ text too
          ]}
        >
          {navItem.name}
        </Text>
      </Pressable>
    );
  })}
</View>
      </ScrollView>
    </>
  );
}


const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // avatar left, bell right
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
    marginHorizontal: 16,
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
    backgroundColor:"#007F7F",
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },


  sectionTitle: {
    fontWeight: "bold",
    fontSize: width * 0.045,
    marginLeft: width * 0.04,
    paddingVertical: height * 0.025,
  },

  featuredCard: {
    width: width * 0.65,
    height: height * 0.30,
    borderRadius: width * 0.03,
    marginLeft: width * 0.04,
    overflow: "hidden",
  },
  featuredImage: { 
    width: "100%", 
    height: "100%", 
    resizeMode: "cover" 
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#fff",
    borderRadius: width * 0.05,
    borderWidth: .1,
    overflow: "hidden",
    marginBottom: width * 0.04,
  },

  upperHalf: {
    flex: 0.9,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E6E1D6",
  },
  itemImage: {
    width: "100%",
    height: "95%",
    resizeMode: "cover",
  },
  lowerHalf: {
    flex: 1.1,
    flexDirection: "column",
    justifyContent: "space-between", // pushes elements apart
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
  },

  title: {
    fontWeight: "bold",
    fontSize: width * 0.04,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
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
    alignItems: "center",   // ✅ center icon with multi-line text
    marginLeft: -8,
    marginTop: 10,
  },

  iconContainer: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
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
    marginTop: 12,
  },
  availabilityBadge: {
    width: "100%",        // 🔥 makes it full width
    paddingVertical: 3,   // top & bottom spacing
    alignItems: "center", // center the text horizontally
    justifyContent: "center", // center vertically
    marginBottom: 6,
  },

  availabilityText: {
    color: "#fff",       // white text so it's readable on green/orange
    fontSize: 14,
    fontWeight: "400",
  },


  categoryButton: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderRadius: 20,
    backgroundColor: "transparent",
    marginLeft: width * 0.04,
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
  },

  navButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  navIcon: {
    fontSize: Math.min(width * 0.06, 26),
    color: "#fff",
  },

  navText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: Math.min(width * 0.03, 13),
    marginTop: height * 0.004,
  },

 
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});

