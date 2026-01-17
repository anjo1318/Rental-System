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
  RefreshControl,
  BackHandler
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import FeatherIcon from "react-native-vector-icons/Feather";
import MaterialCommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OwnerBottomNav from '../components/OwnerBottomNav';
import SubHeader from "../components/subheader";
import ScreenWrapper from "../components/screenwrapper";

const { width, height } = Dimensions.get("window");

const CARD_MARGIN = 7;
const CARD_WIDTH = (width - 16 * 2 - CARD_MARGIN) / 2;
const CARD_HEIGHT = height * 0.33;


export default function OwnerHome() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    rented: 0,
    monthlyEarnings: 0,
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [OWNER_ID, setOwnerId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
      setRefreshing(true);
      await fetchOwnerItems();
      setRefreshing(false);
    };

    // ✅ ADD THIS ENTIRE BLOCK - Handle back button to exit app
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
     <ScreenWrapper backgroundColor="#007F7F">
        <View style={styles.header}>
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
            <View style={styles.userInfo}>
              <Text style={styles.username}>
                {currentUser?.firstName} {currentUser?.lastName}
              </Text>

              <Text style={styles.email}>
                {currentUser?.email || currentUser?.emailAddress}
              </Text>
          </View>
           
            <View style={styles.notificationWrapper}>
              <Pressable onPress={() => router.push("owner/ownerRequest")}>
    <Image
   source={require("../../assets/images/notification.png")}
   style={{ width: 37, height: 37 }}
   resizeMode="contain"
 />
              </Pressable>
            </View>
          </View>
        </View>


       
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
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

 
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: "#3D7BFF", borderWidth: 1, borderColor: "white", right: -5 },
            ]}
          >
            <Text style={[styles.statLabel, { color: "white" }]}>Total Unit</Text>
            <View style={styles.numberContainer}>
              <Text style={[styles.statNumber, { color: "white" }]}>{stats.total}</Text>
              <Image
                source={require("../../assets/images/total.png")}
                style={styles.lowerLeftIcon}
              />
            </View>
          </View>
              
          <View
            style={[
              styles.statCard,
              { backgroundColor: "#00CA2C", borderWidth: 1, borderColor: "white" },
            ]}
          >
            <Text style={[styles.statLabel, { color: "white" }]}>Vacant Unit</Text>
            <View style={styles.numberContainer}>
              <Text style={[styles.statNumber, { color: "white" }]}>{stats.available}</Text>
              <Image
                source={require("../../assets/images/occupied.png")}
                style={[styles.lowerLeftIcon, { height: 20, width: 20 }]}
              />
            </View>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: "#FF2125", borderWidth: 1, borderColor: "white", right: 5 },
            ]}
          >
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

        <View style={styles.subHeader}></View>

        <View style={styles.lowerCard}>

        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialIcon name="search" size={20} color="#057474" style={styles.leftIcon} />
          <TextInput
            placeholder="Search your items.."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#057474"
          />
          <MaterialIcon name="tune" size={20} color="#057474" style={styles.rightIcon} />
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
            columnWrapperStyle={{ justifyContent: "center", marginBottom: 16 }}
            scrollEnabled={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        ) : (
          <View style={styles.noItemsContainer}>
            <MaterialIcon name="inventory" size={64} color="#ccc" />
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
      </View>

      </ScrollView>
      <OwnerBottomNav/>
      </ScreenWrapper>

    </>
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
  paddingVertical: 34,
  paddingHorizontal: 16,
  top: 19,
    

  },
 subHeader: {
    position: "relative",
    backgroundColor: "#007F7F",
    padding: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
      zIndex: 1000,
  width: "100%",
  bottom: 203,
  },

  container: {
  flex: 1,
  backgroundColor: "#F6F6F6", // ✅ everything below header is white
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
    marginTop: 7,
    position: "relative",
    borderRadius: (width * 0.12) / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#00000020",
    height: 175,
    width: 340,
    shadowColor: "white",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    borderRadius: 20,
    
    top: 5,
    backgroundColor: "#fff",
  },

  statCard: {
    alignItems: "center",
    paddingVertical: 40,
    marginHorizontal: 4,
    backgroundColor: "#FFF",
    borderRadius: 4,
    height: 155,
    width: 98,
    top: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D7D7D7",
  },

  statNumber: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#057474",
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 13,
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
    bottom: 5,
    left: -25,
    width: 20,
    height: 17,
  },

  lowerCard: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    borderRadius: 20,
    bottom: 10,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 25,
    paddingHorizontal: 13,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#057474",
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
    borderColor: "#057474BF",
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
    marginHorizontal: 6, 
    
    backgroundColor: "#FFF",
    borderRadius: 5,
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

  navButton: {
    alignItems: "center",
    flex: 1,
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
  },
  addNewButton: {
    alignItems: "center",
    flex: 1,
    position: "relative",
    top: -20,
  },
  addNewCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#656565",
  },
});
