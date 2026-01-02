import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Dimensions
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import FeatherIcon from "react-native-vector-icons/Feather";
import MaterialCommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { RFValue } from "react-native-responsive-fontsize";
import OwnerBottomNav from '../components/OwnerBottomNav';



const { width, height } = Dimensions.get("window");

// Responsive values
const HEADER_HEIGHT = height * 0.11;
const PADDING_H = width * 0.05;
const PADDING_V = height * 0.02;
const MARGIN_TOP = height * 0.01;
const ICON_BOX = width * 0.1;
const ICON_SIZE = width * 0.06;
const TITLE_FONT = RFValue(16);


export default function OwnerListing() {
  const router = useRouter();
  const pathname = usePathname();

  const [ownerId, setOwnerId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Create axios instance with interceptors
  const createAPI = async () => {
    const token = await AsyncStorage.getItem("token");
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('Creating API with token:', token ? 'Token exists' : 'No token');
    console.log('Base URL:', process.env.EXPO_PUBLIC_API_URL);
    
    const api = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL,
      timeout: 15000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Response interceptor for error handling
    api.interceptors.response.use(
      (response) => {
        console.log('API Success:', response.status, response.config.url);
        return response;
      },
      (error) => {
        console.error('API Error Details:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        return Promise.reject(error);
      }
    );

    return api;
  };

  const loadOwner = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");
      
      console.log('User data exists:', !!userData);
      console.log('Token exists:', !!token);
      
      if (userData && token) {
        const user = JSON.parse(userData);
        console.log("Loaded user:", { id: user.id, email: user.email });
        setOwnerId(user.id);
        await fetchOwnerItems(user.id);
      } else {
        console.log('No user data or token found, redirecting to login');
        router.replace("owner/ownerLogin");
      }
    } catch (err) {
      console.error("Error loading owner:", err);
      Alert.alert("Error", "Failed to load user data");
      router.replace("owner/ownerLogin");
    }
  };

  const fetchOwnerItems = async (ownerIdParam = null) => {
    try {
      setLoading(true);
      const currentOwnerId = ownerIdParam || ownerId;
      
      if (!currentOwnerId) {
        console.error("No owner ID available");
        return;
      }

      console.log('Fetching items for owner:', currentOwnerId);
      const api = await createAPI();
      
      // Use consistent endpoint format
      const response = await api.get(`/api/item/owner/${currentOwnerId}`);

      console.log("Fetch API Response:", {
        success: response.data.success,
        itemCount: response.data.data?.length || 0,
        message: response.data.message
      });

      if (response.data.success) {
        setItems(
          response.data.data.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category || 'Uncategorized',
            pricePerDay: item.pricePerDay.toString(),
            itemImage: item.itemImage || "https://via.placeholder.com/150",
            isAvailable: item.availability,
          }))
        );
      } else {
        setItems([]);
        Alert.alert("Info", response.data.message || "No items found");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      
      if (error.response?.status === 401) {
        Alert.alert("Session Expired", "Please login again", [
          { text: "OK", onPress: () => router.replace("owner/ownerLogin") }
        ]);
      } else if (error.response?.status === 403) {
        Alert.alert("Access Denied", "You don't have permission to view these items");
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        Alert.alert("Timeout", "Request timed out. Please try again.");
      } else if (error.message.includes('Network Error')) {
        Alert.alert("Network Error", "Please check your internet connection and try again");
      } else {
        Alert.alert("Error", `Failed to load items: ${error.message}`);
      }
      
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/item`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching items:", error.response?.data || error.message);
      throw error;
    }
  };

  // READ (single item by id)
  const fetchItemById = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/item/${id}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching item:", error.response?.data || error.message);
      throw error;
    }
  };

  const createItem = async (itemData) => {
    try {
      const response = await axios.post(`${API_URL}/api/item`, itemData);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating item:", error.response?.data || error.message);
      throw error;
    }
  };

  // UPDATE
  const updateItem = async (id, updateData) => {
    try {
      const response = await axios.put(`${API_URL}/api/item/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error("❌ Error updating item:", error.response?.data || error.message);
      throw error;
    }
  };

  const deleteItem = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/api/item/${id}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error deleting item:", error.response?.data || error.message);
      throw error;
    }
  };

  // Edit item
  const editItem = (id) => {
    console.log("Navigating to edit item:", id);
    router.push(`owner/ownerEditItem?id=${id}`);
  };

  // Toggle item availability using correct endpoint
  const toggleAvailability = async (itemId, currentAvailability) => {
    try {
      console.log("Toggling availability for item:", itemId, "from", currentAvailability, "to", !currentAvailability);
      
      // Update local state immediately for better UX
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId 
            ? { ...item, isAvailable: !currentAvailability }
            : item
        )
      );

      const api = await createAPI();
      
      // FIXED: Remove duplicate base URL
      const response = await api.put(`/api/item/${itemId}`, {
        availability: !currentAvailability
      });
      
      console.log("Toggle response:", {
        success: response.data.success,
        message: response.data.message
      });
      
      if (!response.data.success) {
        // Revert local state if API call failed
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === itemId 
              ? { ...item, isAvailable: currentAvailability }
              : item
          )
        );
        Alert.alert("Error", response.data.error || "Failed to update availability");
      }
    } catch (error) {
      console.error("Toggle availability error:", error);
      
      // Revert local state if API call failed
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId 
            ? { ...item, isAvailable: currentAvailability }
            : item
        )
      );
      
      if (error.response?.status === 404) {
        Alert.alert("Error", "Item not found");
      } else if (error.response?.status === 403) {
        Alert.alert("Error", "You don't have permission to update this item");
      } else if (error.response?.status === 401) {
        Alert.alert("Session Expired", "Please login again", [
          { text: "OK", onPress: () => router.replace("owner/ownerLogin") }
        ]);
      } else {
        Alert.alert("Error", `Failed to update availability: ${error.message}`);
      }
    }
  };

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchOwnerItems();
  };

  // Add item navigation
  const addNewItem = () => {
    console.log("Navigating to add item");
    router.push("owner/ownerAddItem");
  };

  useEffect(() => {
    loadOwner();
  }, []);

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={0.9} style={styles.imageContainer}>
        <Image source={{ uri: item.itemImage }} style={styles.itemImage} />
      </TouchableOpacity>
      
      <View style={styles.itemInfo}>
        <Text style={styles.title}>{item.title}</Text>
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.price}>₱{item.pricePerDay}/day</Text>
        
        <View style={styles.availabilityContainer}>
          <Text style={[
            styles.availabilityText,
            { color: item.isAvailable ? '#4CAF50' : '#FF5722' }
          ]}>
            {item.isAvailable ? 'Available' : 'Not Available'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              console.log("Toggle availability pressed for item:", item.id);
              toggleAvailability(item.id, item.isAvailable);
              onRefresh();
            }}
            style={[
              styles.toggleButton,
              { backgroundColor: item.isAvailable ? '#FF5722' : '#4CAF50' }
            ]}
          >
            <Text style={styles.toggleButtonText}>
              {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => {
            console.log("Edit button pressed for item:", item.id);
            editItem(item.id);
          }} 
          style={[styles.actionButton, styles.editButton]}
        >
          <Icon name="edit" size={18} color="#FFF" />
          <Text style={[styles.actionText, styles.actionTextWhite]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => {
            console.log("Delete button pressed for item:", item.id);
            deleteItem(item.id);
            onRefresh();
          }} 
          style={[styles.actionButton, styles.deleteButton]}
        >
          <Icon name="delete" size={18} color="#FFF" />
          <Text style={[styles.actionText, styles.actionTextWhite]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#057474" />
        <Text style={styles.loadingText}>Loading your items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => {
            console.log("Back button pressed");
            router.replace("owner/ownerHome");
          }} 
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Items ({items.length})</Text>
        <TouchableOpacity 
          activeOpacity={0.5}
          onPress={() => {
            console.log("Add button pressed");
            addNewItem();
          }} 
          style={styles.addButton}
        >
          <Icon name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      {/* 
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items by name or category..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#999"
        />
        {search.length > 0 && (
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => setSearch("")} 
            style={styles.clearButton}
          >
            <Icon name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      */}

      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inventory" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {search ? 'No matching items' : 'No items yet'}
            </Text>
            <Text style={styles.emptyText}>
              {search 
                ? 'Try adjusting your search terms' 
                : 'Tap the + button to add your first item'}
            </Text>
            {!search && (
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={addNewItem} 
                style={styles.addFirstItemButton}
              >
                <Text style={styles.addFirstItemText}>Add First Item</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

       <OwnerBottomNav/>
      </View>
  
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#E6E1D6" 
  },
  centered: {
    justifyContent: "center", 
    alignItems: "center"
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: 10, 
    backgroundColor:"#007F7F",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: { 
    padding: 12,
    borderRadius: 8,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#FFF",
    flex: 1,
    textAlign: 'center'
  },
  addButton: {
    padding: 4,
    borderRadius: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 10,
  },
  searchContainer: { 
    flexDirection: "row", 
    backgroundColor: "#FFF", 
    margin: 16, 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    alignItems: "center",
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    minHeight: 52
  },
  searchInput: { 
    flex: 1, 
    height: 48,
    marginLeft: 12,
    fontSize: 16
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContainer: {
    padding: 16,
    paddingTop: 20
  },
  card: { 
    backgroundColor: "#FFF", 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16
  },
  itemImage: { 
    width: "100%", 
    height: 180, 
    borderRadius: 12
  },
  itemInfo: {
    marginBottom: 16
  },
  title: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#333",
    marginBottom: 6
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20
  },
  category: { 
    fontSize: 14, 
    color: "#057474",
    fontWeight: "600",
    marginBottom: 6,
    textTransform: 'capitalize'
  },
  price: { 
    fontSize: 22, 
    fontWeight: "800", 
    color: "#057474",
    marginBottom: 12
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '700'
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minHeight: 40,
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  toggleButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700'
  },
  actions: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    gap: 12
  },
  actionButton: { 
    flexDirection: "row", 
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  editButton: {
    backgroundColor: '#057474'
  },
  deleteButton: {
    backgroundColor: '#FF5722'
  },
  actionText: { 
    marginLeft: 8, 
    fontSize: 16,
    fontWeight: '700'
  },
  actionTextWhite: {
    color: '#FFF'
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
    fontWeight: '500'
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#666',
    marginTop: 20,
    marginBottom: 12
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24
  },
  addFirstItemButton: {
    backgroundColor: '#057474',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginTop: 20,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addFirstItemText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700'
  },
  /* Bottom Nav */
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#00000040",
    alignItems: "center",
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
  addNewButton: {
    alignItems: "center",
    flex: 1,
    position: "relative",
    top: -20,
  },
  navButton: {
    alignItems: "center",
    flex: 1,
    zIndex: 10,
  },

  navText: {
    fontWeight: "bold",
    fontSize: width * 0.03,
    marginTop: height * 0.005,
  },
});