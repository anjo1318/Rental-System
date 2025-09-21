import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");

export default function ownerHome() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    rented: 0,
    monthlyEarnings: 0
  });

  // You'll need to get the actual owner ID from AsyncStorage
  const [currentUser, setCurrentUser] = useState(null);
  const [OWNER_ID, setOwnerId] = useState(null);

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setOwnerId(user.id);
        console.log('✅ User loaded from storage:', user);
        return user.id;
      } else {
        console.log('❌ No user data found, redirecting to login');
        router.replace('/ownerLogin'); // Redirect to login if no user data
        return null;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      router.replace('/ownerLogin');
      return null;
    }
  };

  const categories = ["All", "Cellphone", "Projector", "Laptop", "Speaker"];

  const navigationItems = [
    { name: "Dashboard", icon: "home", route: "owner/ownerDashboard", isImage: false },
    { name: "Listing", icon: "list-alt", route: "owner/ownerListing", isImage: false },
    { name: "Request", icon: require("../../assets/images/request.png"), route: "owner/ownerRequest", isImage: true },
    { name: "Time", icon: "schedule", route: "owner/ownerTime", isImage: false },
  ];

  // Fetch owner's items from API
  // Update the fetchOwnerItems function in your ownerHome.js

  const fetchOwnerItems = async (userId) => {
    if (!userId) {
      console.log('❌ No user ID provided');
      return;
    }

    try {
      setLoading(true);
      
      // Get the token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found, redirecting to login');
        router.replace('/ownerLogin');
        return;
      }

      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/owner/items?ownerId=${userId}`;
      console.log('🔍 Fetching from URL:', apiUrl);
      console.log('🔍 Using token:', token.substring(0, 20) + '...');
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('🔍 API Response:', data);
      console.log('🔍 Response status:', response.status);
      
      if (response.status === 401) {
        // Token expired or invalid
        console.log('❌ Token expired, clearing storage and redirecting to login');
        await AsyncStorage.multiRemove(['token', 'user', 'isLoggedIn']);
        router.replace('/ownerLogin');
        return;
      }
      
      if (data.success) {
        const fetchedItems = data.data.map(item => ({
          id: item.id,
          title: item.title,
          itemImage: item.itemImage || "https://via.placeholder.com/150",
          location: item.location || "Your Location",
          pricePerDay: item.pricePerDay.toString(),
          category: item.category,
          isAvailable: item.availability,
        }));
        
        console.log('🔍 Processed items:', fetchedItems);
        setItems(fetchedItems);
        
        // Calculate stats
        const totalItems = fetchedItems.length;
        const availableItems = fetchedItems.filter(item => item.isAvailable).length;
        const rentedItems = totalItems - availableItems;
        
        setStats({
          total: totalItems,
          available: availableItems,
          rented: rentedItems,
          monthlyEarnings: 2450 // Calculate this from actual rental data
        });
      } else {
        Alert.alert("Error", data.error || "Failed to fetch items");
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching owner items:", error);
      Alert.alert("Error", "Failed to connect to server");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      const userId = await loadUserData();
      if (userId) {
        await fetchOwnerItems(userId);
      }
    };

    initializeApp();
  }, []);

  const handleLogout = async () => {
    console.log('🚪 Logout button pressed');
    
    try {
      // First, try to show the alert
      console.log('📱 Attempting to show logout alert...');
      
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              console.log('❌ Logout cancelled');
            },
          },
          {
            text: "Logout",
            style: "destructive", 
            onPress: () => {
              console.log('✅ User confirmed logout, executing...');
              performLogout();
            },
          },
        ],
        { 
          cancelable: true,
          onDismiss: () => console.log('📱 Alert dismissed')
        }
      );
      
      console.log('📱 Alert.alert called successfully');
      
    } catch (alertError) {
      console.error('❌ Alert error:', alertError);
      // If Alert fails, perform logout directly
      console.log('🔄 Alert failed, performing direct logout...');
      performLogout();
    }
  };

const performLogout = async () => {
  try {
    console.log('🔄 Starting logout process...');
    
    // Clear all stored data
    const keysToRemove = [
      'token', 
      'user', 
      'isLoggedIn',
      'savedEmail',
      'savedPassword', 
      'rememberMe'
    ];
    
    console.log('🗑️ Clearing storage keys:', keysToRemove);
    await AsyncStorage.multiRemove(keysToRemove);
    console.log('🗑️ All storage data cleared');
    
    // Verify data was cleared (for debugging)
    const remainingData = await AsyncStorage.multiGet(keysToRemove);
    console.log('🔍 Remaining data after clear:', remainingData);
    
    // Navigate to login screen
    console.log('🔄 Navigating to login...');
    router.replace('owner/ownerLogin');
    
    console.log('✅ Logout completed successfully');
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    // Try alternative navigation methods
    try {
      console.log('🔄 Trying alternative navigation...');
      router.push('owner/ownerLogin');
    } catch (navError) {
      console.error('❌ Navigation error:', navError);
    }
  }
};

  const handleNavigation = (route) => {
    router.push(`/${route}`);
  };

  // Filter items based on search and category
  const filteredItems = items.filter((item) => {
    const matchCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  console.log('🔍 Items state:', items);
  console.log('🔍 Filtered items:', filteredItems);
  console.log('🔍 Active category:', activeCategory);
  console.log('🔍 Search term:', search);

  const renderItem = ({ item }) => {
    console.log('🔍 Rendering item:', item);
    return (
      <View style={styles.card}>
        {/* Upper half for image */}
        <View style={styles.upperHalf}>
          <Image source={{ uri: item.itemImage }} style={styles.itemImage} />
        </View>

        {/* Lower half for text */}
        <View style={styles.lowerHalf}>
          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Status Badge */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: item.isAvailable ? "#4CAF50" : "#FF5722" },
              ]}
            >
              <Text style={styles.statusText}>
                {item.isAvailable ? "Available" : "Rented"}
              </Text>
            </View>
          </View>

          {/* Location */}
          <Text style={styles.location}>{item.location}</Text>

          {/* Price */}
          <Text style={styles.price}>₱{item.pricePerDay}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#057474" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading your items...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header with Back Button and Title */}
        <View style={styles.headerWrapper}>
          <View style={styles.profileContainer}>
            <Pressable 
              onPress={() => {
                console.log('⬅️ Back button pressed');
                router.back();
              }}
              hitSlop={10}
              style={{ zIndex: 10 }} 
            >
              <Icon name="arrow-back" size={24} color="#FFF" />
            </Pressable>
            
            <Text style={styles.pageName}>
              {currentUser ? `${currentUser.firstName}'s Dashboard` : 'Owner Dashboard'}
            </Text>

            {/* Notification and Logout Icons */}
            <View style={styles.notificationWrapper}>
              <Pressable 
                onPress={() => {
                  console.log('🚪 Logout icon pressed');
                  performLogout(); // vince
                }} 
                style={{ 
                  marginRight: 15,
                  padding: 4, // Add padding for better touch area
                  borderRadius: 4,
                }}
                hitSlop={8} // Increase touch area
              >
                <Icon name="logout" size={24} color="#FFF" />
              </Pressable>
              
              <Pressable
                onPress={() => {
                  console.log('🔔 Notification pressed');
                  router.replace('owner/ownerMessages');
                  // Add your notification handler here
                }}
                style={{ position: 'relative' }}
                hitSlop={8}
              >
                <Icon name="notifications-none" size={24} color="#FFF" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Quick Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.available}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.rented}</Text>
            <Text style={styles.statLabel}>Rented</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>₱{stats.monthlyEarnings.toLocaleString()}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#cccccc"
            style={styles.leftIcon}
          />
          <TextInput
            placeholder="Search your items.."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#555"
          />
          <Icon name="tune" size={20} color="gray" style={styles.rightIcon} />
        </View>

        {/* Featured Items */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Your Featured Items</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {items.slice(0, 5).map((item) => (
            <View key={item.id} style={styles.featuredCard}>
              <Image
                source={{ uri: item.itemImage }}
                style={styles.featuredImage}
              />
            </View>
          ))}
        </ScrollView>

        {/* Item Categories */}
        <Text style={styles.sectionTitle}>Manage Your Items</Text>
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

        {/* DEBUG INFO - Remove this after fixing */}
        <View style={{ padding: 16, backgroundColor: '#f0f0f0', margin: 16 }}>
          <Text>🔍 Debug Info:</Text>
          <Text>Items loaded: {items.length}</Text>
          <Text>Filtered items: {filteredItems.length}</Text>
          <Text>Loading: {loading.toString()}</Text>
          <Text>Active category: {activeCategory}</Text>
          <Text>Search: '{search}'</Text>
        </View>

        {/* Item List */}
        {items.length > 0 ? (
          <FlatList
            data={items} // Use items directly instead of filteredItems for testing
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
        ) : (
          <View style={styles.noItemsContainer}>
            <Icon name="inventory" size={64} color="#ccc" />
            <Text style={styles.noItemsText}>
              {search || activeCategory !== "All" 
                ? "No items match your search" 
                : "You haven't added any items yet"
              }
            </Text>
            <Pressable
              style={styles.addItemButton}
              onPress={() => router.push("/addItem")}
            >
              <Text style={styles.addItemButtonText}>Add Your First Item</Text>
            </Pressable>
          </View>
        )}

        {/* Add Item Button */}
        <View style={styles.addButtonContainer}>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/addItem")}
          >
            <Icon name="add" size={24} color="#FFF" />
            <Text style={styles.addButtonText}>Add New Item</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {navigationItems.map((navItem, index) => (
          <Pressable
            key={index}
            style={styles.navButton}
            onPress={() => handleNavigation(navItem.route)}
          >
            {navItem.isImage ? (
              <Image
                source={navItem.icon}
                style={{ width: 24, height: 24 }}
                tintColor="#fff"
                resizeMode="contain"
              />
            ) : (
              <Icon name={navItem.icon} size={24} color="#fff" />
            )}
            <Text style={styles.navText}>{navItem.name}</Text>
          </Pressable>
        ))}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E1D6",
  },
  headerWrapper: {
    width: "100%",
    backgroundColor: "#057474",
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  pageName: {
    fontSize: width * 0.045,
    color: "#FFF",
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginLeft: -24,
  },
  notificationWrapper: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF5722",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#057474",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 25,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leftIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  rightIcon: {
    marginLeft: 10,
  },
  featuredSection: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featuredCard: {
    width: 120,
    height: 80,
    marginRight: 12,
    marginLeft: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginRight: 10,
    marginLeft: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  activeCategory: {
    backgroundColor: "#057474",
    borderColor: "#057474",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  activeCategoryText: {
    color: "#FFF",
    fontWeight: "500",
  },
  card: {
    width: (width - 48) / 2,
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upperHalf: {
    height: 120,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
  statusRow: {
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "500",
  },
  location: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#057474",
  },
  noItemsContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noItemsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  addItemButton: {
    backgroundColor: "#057474",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  addItemButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#057474",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#057474",
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  navButton: {
    alignItems: "center",
    flex: 1,
  },
  navText: {
    color: "#FFF",
    fontSize: 10,
    marginTop: 4,
  },
});