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
  StyleSheet,
  Dimensions,
  RefreshControl,
  BackHandler,
} from "react-native";
import axios from "axios";
import {useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { usePathname } from "expo-router";
import CustomerBottomNav from '../components/CustomerBottomNav';
import { useFocusEffect } from '@react-navigation/native';
import SubHeader from "../components/subheader";
import ScreenWrapper from "../components/screenwrapper";


const { width, height } = Dimensions.get("window");

const CARD_MARGIN = 5;
const CARD_WIDTH = (width - 10 * 2 - CARD_MARGIN) / 2;
const CARD_HEIGHT = height * 0.34;


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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [categories, setCategories] = useState(["All"]);
  const [refreshing, setRefreshing] = useState(false);
  const pathname = usePathname();

  const [filterCategory, setFilterCategory] = useState("All");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterPrice, setFilterPrice] = useState(3000);
  const [filterLocation, setFilterLocation] = useState("");
  const [brands, setBrands] = useState([]);
  const [locations, setLocations] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);


  // Fetch notification count function
  const fetchNotificationCount = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/book/notification/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        // Count only unread notifications
        const unreadCount = response.data.data.filter(notification => !notification.isRead).length;
        setNotificationCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Add this function after fetchNotificationCount
const markNotificationAsRead = async (notificationId) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    await axios.put(
      `${process.env.EXPO_PUBLIC_API_URL}/api/book/notification/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // Refresh notification count after marking as read
    await fetchNotificationCount();
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    await fetchNotificationCount(); // Add this line
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      checkAuth();
    }, [])
  );

  
  
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };
  
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
      return () => subscription.remove();
    }, [])
  );

  // Add this NEW useFocusEffect to refresh notification count when screen is focused
useFocusEffect(
  React.useCallback(() => {
    if (isAuthenticated) {
      fetchNotificationCount();
    }
  }, [isAuthenticated])
);

  const checkAuth = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      if (!userData || !token) {
        console.log('❌ No authentication found, redirecting to login');
        router.replace('/login');
        return;
      }

      const user = JSON.parse(userData);
      
      // 🚫 Block if role is owner (this is customer home)
      if (user.role === 'owner') {
        console.log('Owner trying to access customer home, clearing and redirecting');
        await AsyncStorage.multiRemove(['token', 'user', 'isLoggedIn']);
        router.replace('/login');
        return;
      }

      setCurrentUser(user);
      setOwnerId(user.id);
      setIsAuthenticated(true);
      console.log('User authenticated:', user);
    } catch (error) {
      console.error('Error checking authentication:', error);
      router.replace('/login');
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/item`
      );
      if (response.data.success) {
        const itemsData = Array.isArray(response.data.data) 
          ? response.data.data.filter(item => item.isVerified === true) 
          : [];
        setItems(itemsData);
        
        // Extract unique categories, brands, and locations
        const uniqueCategories = ["All", ...new Set(itemsData.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        const uniqueBrands = [...new Set(itemsData.map(item => item.brand).filter(Boolean))];
        setBrands(uniqueBrands);
        
        const uniqueLocations = [...new Set(itemsData.map(item => item.location).filter(Boolean))];
        setLocations(uniqueLocations);
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

  

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems();
      fetchNotificationCount(); // Add this line
    }
  }, [isAuthenticated]);

  const handleNavigation = (route) => {
    if (route === "customer/home") return;
    router.push(`/${route}`);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007F7F" />
      </View>
    );
  }

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
    
    // Additional filter criteria
    const matchFilterCategory = 
      filterCategory === "All" || item.category === filterCategory;
    const matchBrand = 
      !filterBrand || item.brand === filterBrand;
    const matchPrice = 
      parseFloat(item.pricePerDay) <= filterPrice;
    const matchLocation = 
      !filterLocation || item.location === filterLocation;
    
    return matchCategory && matchSearch && matchFilterCategory && matchBrand && matchPrice && matchLocation;
  });

  const applyFilter = (category, brand, price, location) => {
    setFilterCategory(category);
    setFilterBrand(brand);
    setFilterPrice(price);
    setFilterLocation(location);
  };
  
  const resetFilter = () => {
    setFilterCategory("All");
    setFilterBrand("");
    setFilterPrice(3000);
    setFilterLocation("");
  };

  const breakLongWords = (str, maxLen = 18) =>
  str ? str.replace(new RegExp(`(\\S{${maxLen}})`, "g"), "$1\u200B") : "";

  return (
    <>
      <ScreenWrapper backgroundColor="#007F7F">
             <View style={styles.header}>
          {/* 🔹 Profile Section */}
          <View style={styles.profileContainer}>
           <Pressable onPress={() => router.push("customer/profile")}>
           <Image
                source={{
                  uri:
                    currentUser?.profileImage && currentUser.profileImage !== "N/A"
                      ? currentUser.profileImage
                      : "https://i.pravatar.cc/150?img=3",
                }}
                style={styles.avatar}
              />
          </Pressable >
          <View style={styles.userInfo}>
              <Text style={styles.username}>
                {currentUser?.firstName} {currentUser?.lastName}
              </Text>

              <Text style={styles.email}>
                {currentUser?.email || currentUser?.emailAddress}
              </Text>
          </View>

 <View style={styles.notificationWrapper}>
              <Pressable onPress={() => router.push("/customer/notifications")}>
                <Image
                  source={require("../../assets/images/notification.png")}
                  style={{ width: 30, height: 30 }}
                  resizeMode="contain"
                />
                {/* Badge - Only show if there are unread notifications */}
                {notificationCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{notificationCount}</Text>
                  </View>
                )}
  </Pressable>
  </View>

  </View>

  <SubHeader/>
         {/* 🔹 Search Bar (Clickable) */}
  

    <View style={styles.searchContainer}>
      <Icon name="search" size={20} color="#cccccc" style={styles.leftIcon} />
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

          

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false} 
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007F7F"]}      // Android
            tintColor="#007F7F"       // iOS
          />
        }
      >

        
          {/* 🔹 Recommendations */}
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
                  <View style={styles.imageWrapper}>
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
                  <View style={styles.locationRow}>
                  <View style={styles.iconContainer}>
                    <Image
  source={require("../../assets/images/location.png")}
  style={{ width: 14, height: 17 }}
  resizeMode="contain"
/>
                  </View>

                  <View style={styles.textContainer}>
                    <Text
                      style={styles.location}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.location}
                    </Text>
                  </View>
                </View>

                <Text style={styles.price}>₱{item.pricePerDay}</Text>
                </View>
              </View>
            </Pressable>

            )}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{
              justifyContent:
              "flex-start",
              marginBottom: 7, right: 12,
            }}
           contentContainerStyle={{
    paddingHorizontal:
      filteredItems.length === 1 ? 7 : 20,
  }}
/>
      </ScrollView>
        <CustomerBottomNav/>
       </ScreenWrapper>
      {showFilter && (
  <Filter 
    onClose={() => setShowFilter(false)}
    categories={categories}
    brands={brands}
    locations={locations}
    onApply={applyFilter}
    onReset={resetFilter}
    initialCategory={filterCategory}
    initialBrand={filterBrand}
    initialPrice={filterPrice}
    initialLocation={filterLocation}
  />
)}
    </>
  );
}

function Filter({ 
  onClose, 
  categories, 
  brands, 
  locations, 
  onApply, 
  onReset,
  initialCategory,
  initialBrand,
  initialPrice,
  initialLocation
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [price, setPrice] = useState(initialPrice);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleDone = () => {
    onApply(selectedCategory, selectedBrand, price, selectedLocation);
    onClose();
  };

  const handleReset = () => {
    setSelectedCategory("All");
    setSelectedBrand("");
    setPrice(3000);
    setSelectedLocation("");
    onReset();
  };

  return (
    <View style={filterStyles.overlay}>
      <Pressable style={filterStyles.backdrop} onPress={onClose} />

      <View style={filterStyles.modal}>
        <View style={filterStyles.header}>
          <Pressable onPress={onClose}>
            <Icon name="close" size={22} color="#333" />
          </Pressable>
          <Text style={filterStyles.headerTitle}>Filter</Text>
          <Pressable onPress={handleReset}>
            <Text style={{ color: "#007F7F", fontSize: 14 }}>Reset</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Category */}
          <Text style={filterStyles.label}>Category</Text>
          <Pressable 
            style={filterStyles.input}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Text style={selectedCategory === "All" ? filterStyles.placeholder : { color: "#000" }}>
              {selectedCategory === "All" ? "Select Category" : selectedCategory}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </Pressable>
          
          {showCategoryPicker && (
  <View style={filterStyles.picker}>
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator={true}
    >
      {categories.map((cat) => (
        <Pressable
          key={cat}
          style={filterStyles.pickerItem}
          onPress={() => {
            setSelectedCategory(cat);
            setShowCategoryPicker(false);
          }}
        >
          <Text
            style={
              selectedCategory === cat
                ? filterStyles.selectedPickerText
                : filterStyles.pickerText
            }
          >
            {cat}
          </Text>
          {selectedCategory === cat && (
            <Icon name="check" size={20} color="#007F7F" />
          )}
        </Pressable>
      ))}
    </ScrollView>
  </View>
)}


          {/* Brand */}
          <Text style={filterStyles.label}>Brand</Text>
          <Pressable 
            style={filterStyles.input}
            onPress={() => setShowBrandPicker(!showBrandPicker)}
          >
            <Text style={!selectedBrand ? filterStyles.placeholder : { color: "#000" }}>
              {selectedBrand || "Select Brand"}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </Pressable>

          {showBrandPicker && (
            <View style={filterStyles.picker}>
              <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator={true}
    >
              <Pressable
                style={filterStyles.pickerItem}
                onPress={() => {
                  setSelectedBrand("");
                  setShowBrandPicker(false);
                }}
              >
                <Text style={!selectedBrand ? filterStyles.selectedPickerText : filterStyles.pickerText}>
                  All Brands
                </Text>
                {!selectedBrand && (
                  <Icon name="check" size={20} color="#007F7F" />
                )}
              </Pressable>
              {brands.map((brand) => (
                <Pressable
                  key={brand}
                  style={filterStyles.pickerItem}
                  onPress={() => {
                    setSelectedBrand(brand);
                    setShowBrandPicker(false);
                  }}
                >
                  <Text style={selectedBrand === brand ? filterStyles.selectedPickerText : filterStyles.pickerText}>
                    {brand}
                  </Text>
                  {selectedBrand === brand && (
                    <Icon name="check" size={20} color="#007F7F" />
                  )}
                </Pressable>
              ))}
              </ScrollView>
            </View>
          )}
          

          {/* Price Range */}
          <Text style={filterStyles.label}>Price Range</Text>
          <Slider
            minimumValue={0}
            maximumValue={3000}
            step={100}
            value={price}
            onValueChange={setPrice}
            minimumTrackTintColor="#007F7F"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#007F7F"
          />

          <View style={filterStyles.priceRow}>
            <Text>₱ 0</Text>
            <Text style={{ fontWeight: "600", color: "#007F7F" }}>₱ {price}</Text>
          </View>

          {/* Location */}
          <Text style={filterStyles.label}>Location</Text>
          <Pressable 
            style={filterStyles.input}
            onPress={() => setShowLocationPicker(!showLocationPicker)}
          >
            <Text style={!selectedLocation ? filterStyles.placeholder : { color: "#000" }}>
              {selectedLocation || "Select Location"}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#666" />
          </Pressable>

          {showLocationPicker && (
            <View style={filterStyles.picker}>
              <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator={true}
    >
              <Pressable
                style={filterStyles.pickerItem}
                onPress={() => {
                  setSelectedLocation("");
                  setShowLocationPicker(false);
                }}
              >
                <Text style={!selectedLocation ? filterStyles.selectedPickerText : filterStyles.pickerText}>
                  All Locations
                </Text>
                {!selectedLocation && (
                  <Icon name="check" size={20} color="#007F7F" />
                )}
              </Pressable>
              {locations.map((loc) => (
                <Pressable
                  key={loc}
                  style={filterStyles.pickerItem}
                  onPress={() => {
                    setSelectedLocation(loc);
                    setShowLocationPicker(false);
                  }}
                >
                  <Text style={selectedLocation === loc ? filterStyles.selectedPickerText : filterStyles.pickerText}>
                    {loc}
                  </Text>
                  {selectedLocation === loc && (
                    <Icon name="check" size={20} color="#007F7F" />
                  )}
                </Pressable>
              ))}
              </ScrollView>
            </View>
          )}
          <Pressable style={filterStyles.doneButton} onPress={handleDone}>
          <Text style={filterStyles.doneText}>Apply Filter</Text>
        </Pressable>
        </ScrollView>

        
      </View>
    </View>
  );
}


const styles = StyleSheet.create({

header: {
  backgroundColor: "#007F7F",
  paddingHorizontal: 16,
      borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
},



  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 4,
    top: 10,
    marginTop: 35,
    

  },
  subHeader: {
    position: "relative",
    backgroundColor: "#007F7F",
    padding: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
      zIndex: 1000,
  width: "100%",
   marginTop: -90,
  },

  container: {
  flex: 1,
  backgroundColor: "#fff", // ✅ everything below header is white
},
  email: {
    fontSize: 10,
    color: "#e0f2f2",
    marginLeft: 13,
  },

  avatar: { 
    width: width * 0.16, 
    height: width * 0.16, 
    borderRadius: width * 0.1,
    borderColor:"#e0f2f2",
    borderWidth: 2,      
  },
  
  username: { 
    marginLeft: width * 0.03, 
    fontWeight: "bold", 
    fontSize: width * 0.035,
    color: "#e0f2f2",
  },

 notificationWrapper: {
    marginLeft: "auto", 
    marginRight: 5,
    marginBottom: 13,
    position: "relative",
    borderRadius: (width * 0.12) / 2,
    justifyContent: "center",
    top: 9,
    },

  badge: {
  position: "relative",
  bottom: 38,
  left: 13,
  backgroundColor: "#fff",
  height: 20,
  width: 20,
  borderRadius: 20,
  justifyContent: "center",
  alignItems: "center",
},

badgeText: {
  color: "#000",
  fontSize: 11,
  fontWeight: "bold",
},

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal:  5,
    height: 37,
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


  sectionTitle: {
    fontWeight: "bold",
    fontSize: width * 0.040,
    marginLeft: width * 0.04,
    paddingVertical: height * 0.020,
    marginTop: 25,

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

  // Small pill badge shown on top-right for available items
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

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#fff",
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderColor: "transparent",
    marginHorizontal: 3,
    
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
    bottom: 2,
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
    top: 3,
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
    top: 7,
    color: "#007F7F",
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

 
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});

const filterStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backdrop: {
    flex: 1,
  },
  modal: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "70%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  placeholder: {
    color: "#999",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  doneButton: {
    backgroundColor: "#007F7F",
    paddingVertical: 12,
    borderRadius: 10,
    width: "70%",
    alignItems: "center",
    alignSelf: "center",
    top: 40,
  },
  doneText: {
    color: "#fff",
    fontWeight: "600",
    
  },
  picker: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 10,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  pickerText: {
    fontSize: 14,
    color: "#333",
  },
  selectedPickerText: {
    fontSize: 14,
    color: "#007F7F",
    fontWeight: "600",
  },
});