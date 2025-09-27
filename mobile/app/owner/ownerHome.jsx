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
  StatusBar,
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

      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/owner/owner/items?ownerId=${userId}`;
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


  const handleNavigation = (route) => {
    router.push(`/${route}`);
  };


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
            <Text style={styles.username}>Marco Polo</Text>
            <View style={styles.notificationWrapper}>
            <Pressable onPress={() => router.push("owner/ownerRequest")}>
              <Image
                source={require("../../assets/images/message_chat.png")}
                style={{ width: 24, height: 24, tintColor: "#057474" }}
                resizeMode="contain"
              />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </Pressable>
        </View>
        </View> 
        {/* Quick Stats Section */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.withBorder, { borderWidth: 1, borderColor: "#3D7BFF"}]}>
            <Text style={[styles.statLabel, { color: "#3D7BFF" }]}>Total Unit</Text>
            <View style={styles.numberContainer}>
              <Text style={[styles.statNumber, { color: "#3D7BFF" }]}>{stats.total}</Text>
              <Image source={require("../../assets/images/total.png")} style={styles.lowerLeftIcon} />
            </View>
          </View>

          <View style={[styles.statCard, { borderWidth: 1, borderColor: "#007F7F"}]}>
            <Text style={[styles.statLabel, styles.withBorder, { color: "#007F7F" }]}>Occupied Unit</Text>
            <View style={styles.numberContainer}>
              <Text style={[styles.statNumber, { color: "#007F7F" }]}>{stats.available}</Text>
              <Image source={require("../../assets/images/occupied.png")} style={[styles.lowerLeftIcon, { height: 20, width: 20 }]}/>
            </View>
          </View>

          <View style={[styles.statCard, { borderWidth: 1, borderColor: "#FF521D"}]}>
            <Text style={[styles.statLabel, { color: "#FF521D" }]}>Vacant Unit</Text>
            <View style={styles.numberContainer}>
              <Text style={[styles.statNumber, { color: "#FF521D" }]}>{stats.rented}</Text>
              <Image source={require("../../assets/images/vacant.png")} style={styles.lowerLeftIcon} />
            </View>
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
              onPress={() => router.push("owner/ownerAddItem")}
            >
              <Text style={styles.addItemButtonText}>Add Your First Item</Text>
            </Pressable>
          </View>
        )}

        {/* Add Item Button */}
        <View style={styles.addButtonContainer}>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("owner/ownerAddItem")}
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
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    right: -8,
    top: -3,
    backgroundColor: "#057474",
    borderRadius: 10,
    width: 15,
    height: 15,
    justifyContent: "center",
    alignItemscd : "center",
  },
  badgeText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
  },
  
statsContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginHorizontal: 16,
  marginTop: 20,
},

statCard: {
  flex: 1,
  alignItems: "center",
  paddingVertical: 40,
  marginHorizontal: 4,           
  backgroundColor: "#FFF",     
  borderRadius: 4,
},

statNumber: {
  fontSize: 30,
  fontWeight: "bold",
  color: "#057474",
  marginBottom: 4,
},

statLabel: {
  fontSize: 12,
  color: "#666",
  textAlign: "center",
},
numberRow: {
  position: "relative",
  alignItems: "flex-start",
},
statIcon: {
  width: 20,
  height: 20,
  marginLeft: 4,
},
numberContainer: {
  position: "relative",
  alignItems: "flex-start",
},

lowerLeftIcon: {
  position: "absolute",
  bottom: 5, // pushes icon slightly below the number
  left: -25,   // moves icon slightly to the left
  width: 20,
  height: 17,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    paddingHorizontal: 16,
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