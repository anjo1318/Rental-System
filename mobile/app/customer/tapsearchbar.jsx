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
  StyleSheet,
  Dimensions,
} from "react-native";
import axios from "axios";
import {useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { usePathname } from "expo-router";
import CustomerBottomNav from '../components/CustomerBottomNav';

const { width, height } = Dimensions.get("window");

const CARD_MARGIN = 16;
const CARD_WIDTH = (width - 16 * 2 - CARD_MARGIN) / 2;
const CARD_HEIGHT = height * 0.45;


export default function Home() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  const [OWNER_ID, setOwnerId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterPrice, setFilterPrice] = useState(3000);
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
        console.log('❌ No user data found, redirecting to login');
        router.replace('/login');
        return null;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      router.replace('/login');
      return null;
    }
  };

  const handleNavigation = (route) => {
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
    
    // Filter conditions
    const matchFilterCategory = !filterCategory || item.category === filterCategory;
    const matchFilterPrice = parseFloat(item.pricePerDay) <= filterPrice;
    const matchFilterLocation = !filterLocation || item.location.toLowerCase().includes(filterLocation.toLowerCase());
    
    return matchCategory && matchSearch && matchFilterCategory && matchFilterPrice && matchFilterLocation;
  });

  const breakLongWords = (str, maxLen = 18) =>
  str ? str.replace(new RegExp(`(\\S{${maxLen}})`, "g"), "$1\u200B") : "";
  


  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#057474" 
        translucent={false}
      />
              <View style={styles.topBackground}>
  <View style={styles.profileContainer}></View>

  <View style={styles.searchRow}>
    <Pressable onPress={() => router.back()} hitSlop={10}>
      <Icon
        name="arrow-back"
        size={25}
        color="white"
        style={styles.backIcon}
      />
    </Pressable>

    {/* ✅ REMOVED Pressable wrapper - Now fully editable */}
    <View style={styles.searchContainer}>
      <Icon name="search" size={20} color="#cccccc" style={styles.leftIcon} />

      <TextInput
        placeholder="Search devices.."
        value={search}
        onChangeText={setSearch}  // ✅ Now updates search state
        style={styles.searchInput}
        placeholderTextColor="#555"
      />

      {/* ✅ Clear button when there's text */}
      {search.length > 0 && (
        <Pressable onPress={() => setSearch("")} hitSlop={10}>
          <Icon
            name="close"
            size={20}
            color="gray"
            style={styles.clearIcon}
          />
        </Pressable>
      )}

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

      <ScrollView style={styles.container} 
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false} nestedScrollEnabled={true} >



          {/* 🔹 Results header with count */}
          <View style={styles.resultsHeader}>
            <Text style={styles.sectionTitle}>
              {search ? `Search Results (${filteredItems.length})` : 'All Items'}
            </Text>
            {search && filteredItems.length === 0 && (
              <Text style={styles.noResults}>No items found for "{search}"</Text>
            )}
          </View>

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
      <CustomerBottomNav/>
      {showFilter && (
  <Filter 
    onClose={() => setShowFilter(false)}
    onApplyFilters={(filters) => {
      setFilterCategory(filters.category);
      setFilterBrand(filters.brand);
      setFilterLocation(filters.location);
      setFilterPrice(filters.price);
      setShowFilter(false);
    }}
    initialFilters={{
      category: filterCategory,
      brand: filterBrand,
      location: filterLocation,
      price: filterPrice,
    }}
    items={items}
  />
)}
    </>
  );
}

function Filter({ onClose, onApplyFilters, initialFilters, items = [] }) {
  const [price, setPrice] = useState(initialFilters.price || 3000);
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || "");
  const [selectedBrand, setSelectedBrand] = useState(initialFilters.brand || "");
  const [selectedLocation, setSelectedLocation] = useState(initialFilters.location || "");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Extract unique values from API data with safety checks
  const categories = items && items.length > 0 
    ? [...new Set(items.map(item => item.category).filter(Boolean))]
    : [];
  
  const locations = items && items.length > 0
    ? [...new Set(items.map(item => item.location).filter(Boolean))]
    : [];
  
  // Extract brands from item titles or descriptions (you can modify this logic based on your data structure)
  // For now, we'll use a placeholder since brand isn't in the API data
  const brands = ["Apple", "Samsung", "HP", "Dell", "Asus", "Lenovo", "Sony", "LG"];

  const handleApplyFilters = () => {
    onApplyFilters({
      category: selectedCategory,
      brand: selectedBrand,
      location: selectedLocation,
      price: price,
    });
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedLocation("");
    setPrice(3000);
  };

  const Dropdown = ({ label, value, options, isOpen, setIsOpen, onSelect }) => (
    <>
      <Text style={filterStyles.label}>{label}</Text>
      <Pressable 
        style={filterStyles.input}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={value ? filterStyles.selectedText : filterStyles.placeholder}>
          {value || `Select ${label}`}
        </Text>
        <Icon 
          name={isOpen ? "expand-less" : "expand-more"} 
          size={20} 
          color="#666"
          style={filterStyles.dropdownIcon}
        />
      </Pressable>
      
      {isOpen && (
        <View style={filterStyles.dropdownList}>
          <ScrollView style={filterStyles.dropdownScroll} nestedScrollEnabled>
            {options.length > 0 ? (
              options.map((option, index) => (
                <Pressable
                  key={index}
                  style={filterStyles.dropdownItem}
                  onPress={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                >
                  <Text style={filterStyles.dropdownItemText}>{option}</Text>
                </Pressable>
              ))
            ) : (
              <View style={filterStyles.dropdownItem}>
                <Text style={filterStyles.dropdownItemText}>No options available</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </>
  );

  return (
    <View style={filterStyles.overlay}>
      <Pressable style={filterStyles.backdrop} onPress={onClose} />

      <View style={filterStyles.modal}>
        <View style={filterStyles.header}>
          <Pressable onPress={onClose}>
            <Icon name="close" size={22} color="#333" />
          </Pressable>
          <Text style={filterStyles.headerTitle}>Filter</Text>
          <Pressable onPress={handleClearFilters}>
            <Text style={filterStyles.clearText}>Clear</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Dropdown
            label="Category"
            value={selectedCategory}
            options={categories}
            isOpen={showCategoryDropdown}
            setIsOpen={setShowCategoryDropdown}
            onSelect={setSelectedCategory}
          />

          <Dropdown
            label="Brand"
            value={selectedBrand}
            options={brands}
            isOpen={showBrandDropdown}
            setIsOpen={setShowBrandDropdown}
            onSelect={setSelectedBrand}
          />

          <Text style={filterStyles.label}>Price Range (Max)</Text>
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

          <Dropdown
            label="Location"
            value={selectedLocation}
            options={locations}
            isOpen={showLocationDropdown}
            setIsOpen={setShowLocationDropdown}
            onSelect={setSelectedLocation}
          />

          <Pressable style={filterStyles.doneButton} onPress={handleApplyFilters}>
            <Text style={filterStyles.doneText}>Apply Filters</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginTop: 16,
  },

  topBackground: {
    backgroundColor:"#007F7F",
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  avatar: { 
    width: width * 0.1, 
    height: width * 0.1, 
    borderRadius: width * 0.05 
  },
  
  username: { 
    marginLeft: width * 0.03, 
    fontWeight: "bold", 
    fontSize: width * 0.04 
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

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  backIcon: {
    padding: 6,
  },

  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007F7F",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: 10,
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
  clearIcon: {
    marginRight: 4,
  },
  filterIcon: {
    marginLeft: 4,
  },

  resultsHeader: {
    paddingHorizontal: 16,
    marginTop: 10,
  },

  sectionTitle: {
    fontWeight: "bold",
    fontSize: width * 0.045,
    paddingVertical: height * 0.015,
  },

  noResults: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 10,
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
    overflow: "hidden",
    marginBottom: width * 0.04,
    borderWidth: 1,
    borderColor: "#007F7F99",
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
    justifyContent: "space-between",
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
    alignItems: "center",
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
    width: "100%",
    paddingVertical: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  availabilityText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "400",
  },

  quantity: {
    fontSize: width * 0.035,
    color: "#666",
    marginTop: 4,
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
    color: "#057474",
  },

  navText: {
    color: "#057474",
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
    height: "75%",
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
  clearText: {
    fontSize: 14,
    color: "#007F7F",
    fontWeight: "500",
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  placeholder: {
    color: "#999",
  },
  selectedText: {
    color: "#333",
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  dropdownList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: "#fff",
  },
  dropdownScroll: {
    maxHeight: 150,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#333",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  doneButton: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "#007F7F",
    paddingVertical: 12,
    borderRadius: 10,
    width: "70%",
    alignItems: "center",
    alignSelf: "center",
  },
  doneText: {
    color: "#fff",
    fontWeight: "600",
  },
});