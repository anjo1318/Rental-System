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
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    monthlyEarnings: 0,
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [OWNER_ID, setOwnerId] = useState(null);

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setOwnerId(user.id);
        console.log("✅ User loaded from storage:", user);
        return user.id;
      } else {
        console.log("❌ No user data found, redirecting to login");
        router.replace("/ownerLogin");
        return null;
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      router.replace("/ownerLogin");
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

  // Fetch owner's items
  const fetchOwnerItems = async (userId) => {
    if (!userId) {
      console.log("❌ No user ID provided");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("❌ No token found, redirecting to login");
        router.replace("/ownerLogin");
        return;
      }

      const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/owner/owner/items?ownerId=${userId}`;
      console.log("🔍 Fetching from URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("🔍 API Response:", data);

      if (response.status === 401) {
        console.log("❌ Token expired, clearing storage and redirecting to login");
        await AsyncStorage.multiRemove(["token", "user", "isLoggedIn"]);
        router.replace("/ownerLogin");
        return;
      }

      if (data.success) {
        const fetchedItems = data.data.map((item) => {
          let imageUrl = "https://via.placeholder.com/150";
          if (item.itemImages) {
            try {
              const parsedImages = JSON.parse(item.itemImages);
              if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                imageUrl = parsedImages[0];
              }
            } catch (e) {
              console.warn("⚠️ Could not parse itemImages for item:", item.id, e);
            }
          }

          return {
            id: item.id,
            title: item.title,
            itemImage: imageUrl,
            location: item.location || "Your Location",
            pricePerDay: item.pricePerDay.toString(),
            category: item.category,
            isAvailable: item.availability,
          };
        });

        setItems(fetchedItems);

        const totalItems = fetchedItems.length;
        const availableItems = fetchedItems.filter((item) => item.isAvailable).length;
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

  // ✅ Make each item card clickable
  const renderItem = ({ item }) => {
    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: "owner/ownerItemDetails", params: { id: item.id } })}
      >
        <View style={styles.upperHalf}>
          <Image source={{ uri: item.itemImage }} style={styles.itemImage} />
        </View>
        <View style={styles.lowerHalf}>
          <Text style={styles.title}>{item.title}</Text>
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
          <Text style={styles.location}>{item.location}</Text>
          <Text style={styles.price}>₱{item.pricePerDay}</Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#057474" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading your items...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content"backgroundColor="#007F7F"
        translucent={false}/>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} nestedScrollEnabled={true} >
          {/* Profile Section */}
          <View style={styles.topBackground}>
          <View style={styles.profileContainer}>
            <Pressable onPress={() => router.push("owner/ownerProfile")}>
              <Image
                source={{
                  uri:
                    currentUser?.profileImage && currentUser.profileImage !== "N/A"
                      ? currentUser.profileImage
                      : "https://i.pravatar.cc/150?img=3",
                }}
                style={styles.avatar}
              />
            </Pressable>
            <Text style={styles.username}>
              {currentUser
                ? `${currentUser.firstName} ${currentUser.lastName}`
                : "Loading..."}
            </Text>
            <View style={styles.notificationWrapper}>
              <Pressable onPress={() => router.push("owner/ownerRequest")}>
                <Icon name="notifications-none" size={24} color="#007F7F" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: "#3D7BFF", borderWidth: 1, borderColor: "white", right: -5 }]}>
              <Text style={[styles.statLabel, { color: "white" }]}>Total Unit</Text>
              <View style={styles.numberContainer}>
                <Text style={[styles.statNumber, { color: "white" }]}>{stats.total}</Text>
                <Image
                  source={require("../../assets/images/total.png")}
                  style={styles.lowerLeftIcon}
                />
              </View>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#00CA2C",borderWidth: 1, borderColor: "white", }]}>
              <Text style={[styles.statLabel, { color: "white", }]}>Vacant Unit</Text>
              <View style={styles.numberContainer}>
                <Text style={[styles.statNumber, { color: "white" }]}>{stats.available}</Text>
                <Image
                  source={require("../../assets/images/occupied.png")}
                  style={[styles.lowerLeftIcon, { height: 20, width: 20 }]}
                />
              </View>
            </View>

            <View style={[styles.statCard, {backgroundColor: "#FF2125",borderWidth: 1, borderColor: "white", right: 5  }]}>
              <Text style={[styles.statLabel, { color: "white" }]}>Occupied Unit</Text>
              <View style={styles.numberContainer}>
                <Text style={[styles.statNumber, { color: "white" }]}>{stats.rented}</Text>
                <Image
                  source={require("../../assets/images/vacant.png")}
                  style={styles.lowerLeftIcon}
                />
              </View>
            </View>
        </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#cccccc" style={styles.leftIcon} />
            <TextInput
              placeholder="Search your items.."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              placeholderTextColor="#555"
            />
            <Icon name="tune" size={20} color="gray" style={styles.rightIcon} />
          </View>

          {/* Categories */}
          <Text style={styles.sectionTitle}>Manage Your Items</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.categoryButton, activeCategory === cat && styles.activeCategory]}
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

          {/* Items List */}
          {items.length > 0 ? (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
              scrollEnabled={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          ) : (
            <View style={styles.noItemsContainer}>
              <Icon name="inventory" size={64} color="#ccc" />
              <Text style={styles.noItemsText}>
                {search || activeCategory !== "All"
                  ? "No items match your search"
                  : "You haven't added any items yet"}
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

        {/* Bottom Nav */}
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
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",  // everything under the top header/status bar = white
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
    statusBarSpacer: {
    height: StatusBar.currentHeight || 0,
    backgroundColor: "#007F7F",  // this paints the actual OS status bar background
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // avatar left, bell right
    padding: 16,
    marginTop: 16,
  },


  avatar: { 
    width: width * 0.12, 
    height: width * 0.12, 
    borderRadius: width * 0.1 ,
    right: -5,
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
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "white",
  },
  badge: {
    position: "absolute",
    right: -8,
    top: -3,
    backgroundColor: "white",
    borderRadius: 10,
    width: 15,
    height: 15,
    justifyContent: "center",
    alignItems : "center",
  },
  badgeText: {
    color: "#007F7F",
    fontSize: 10,
    fontWeight: "bold",
    right: -1,
    top: -1,
  },

  topBackground: {
    backgroundColor:"#007F7F",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    top: 20,
  },
  
statsContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginHorizontal: 10,
  marginTop: 20,
  borderWidth: 2,
  borderColor: "#00000040",
  height: 195,
  width: 330,
  right: -10,
  shadowColor: "white",   // translucent black
  shadowOpacity: 0.5,
  shadowRadius: 20,
  borderRadius: 20,
  top: 20,
  left: 5,
},

statCard: {
  alignItems: "center",
  paddingVertical: 40,
  marginHorizontal: 4,           
  backgroundColor: "#FFF",     
  borderRadius: 4,
  height: 170,
  width: 98,
  top: 12,
  borderRadius: 20,
},

statNumber: {
  fontSize: 35,
  fontWeight: "bold",
  color: "#057474",
  marginBottom: 4,
},

statLabel: {
  fontSize: 15    ,
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
    top: 15,
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
    marginTop: 15,
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
    marginBottom: 20,
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
