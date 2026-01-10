import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import ItemImages from "./itemImages";
import Header from "../components/header";

export default function ItemDetailForGuest() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setCustomer(user);
        }
      } catch (err) {
        console.error("Error loading customer:", err);
      }
    };

    loadCustomer();
  }, []);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        console.log("Fetching item with ID:", id);
        const res = await axios.get(`${API_URL}/api/item/${id}`);
        
        if (res.data.success && res.data.data) {
          setItem(res.data.data);
          console.log("Item fetched successfully:", res.data.data.title);
        } else {
          Alert.alert("Error", "Item not found");
          router.back();
        }
      } catch (err) {
        console.error("❌ Error fetching item:", err.response?.data || err.message);
        Alert.alert("Error", "Failed to fetch item");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    } else {
      console.error("No item ID provided");
      Alert.alert("Error", "No item ID provided");
      router.back();
    }
  }, [id]);

  const handleBooking = () => {
    router.replace("/customer/loginInterface");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#057474" />
        <Text style={styles.loadingText}>Loading item details...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Icon name="error-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Item not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackButton}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Gadget Details"
        backgroundColor="#007F7F"
      />


      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Item Images */}
        <ItemImages images={item.itemImages} />

        {/* Price and Title Section */}
        <View style={[styles.detailLine, { borderTopColor: '#00000040' }]}/>      
        <View style={styles.infoSection}>
          <View style={styles.priceRow}>
            <Text style={{ fontSize: 20, color: "#057474" }}>₱</Text>
            <Text style={styles.price}>{item.pricePerDay}</Text>
            <Text style={styles.priceUnit}>per hour</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>5.0</Text>
              <Icon name="star" size={16} color="#FFD700" />
            </View>
          </View>

          <Text style={styles.title}>{item.title}</Text>

          {/* Owner Info */}
          
          <View style={styles.ownerContainer}>
            <Image
              source={{ uri: "https://via.placeholder.com/40" }}
              style={styles.avatar}
            />
            <Text style={styles.ownerText}>
              Hello {customer?.firstName || 'User'}{" "}
              <Icon name="verified" size={16} color="#3498db" />
            </Text>
          </View>

          {/* Brand */}
            
            <Text style={styles.detailLabel}>Brand</Text>
            <Text style={styles.detailValue}>Acer</Text>
          </View>
        
        <View style={styles.detailLine2}></View>
        <View style={styles.detailLine4}></View>
        <View style={styles.detailLine}></View>
        {/* Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specification</Text>
          <View style={styles.specItem}>
            <Text style={styles.specKey}>Processor:</Text>
            <Text style={styles.specValue}>Intel Core i7 (10th Gen)</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specKey}>Graphics:</Text>
            <Text style={styles.specValue}>NVIDIA GeForce RTX 3060 6GB GDDR6</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specKey}>Memory:</Text>
            <Text style={styles.specValue}>16GB DDR4 RAM</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specKey}>Storage:</Text>
            <Text style={styles.specValue}>512GB SSD</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specKey}>Display:</Text>
            <Text style={styles.specValue}>15.6" Full HD (1920x1080) IPS, 144Hz refresh rate</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specKey}>Operating System:</Text>
            <Text style={styles.specValue}>Windows 11 Home (Activated)</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specKey}>Keyboard:</Text>
            <Text style={styles.specValue}>RGB backlit gaming keyboard</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specKey}>Connectivity:</Text>
            <Text style={styles.specValue}>Wi-Fi 6, Bluetooth 5.0, HDMI, USB 3.2 ports</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specKey}>Battery:</Text>
            <Text style={styles.specValue}>Good battery health, lasts 3–5 hours</Text>
          </View>
        </View>


        {/* Description */}
        <View style={styles.detailLine}></View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description (actual condition)</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        {/* Reviews */}
        <View style={[styles.detailLine, { borderTopColor: '#00000040' }]}
        />
        <View style={[styles.detailLine, { borderTopColor: '#00000040' }]}
        />

<View style={styles.section}>
  <Text style={styles.sectionTitle}>Review (1)</Text>

  <Pressable
  style={({ pressed }) => [
    styles.reviewCard,
    pressed && { opacity: 0.85 },
  ]}
  onPress={() => router.replace("/customer/loginInterface")}
>
    <View style={styles.reviewHeader}>
      <Image
        source={{ uri: "https://via.placeholder.com/40" }}
        style={styles.reviewAvatar}
      />
      <View style={styles.reviewHeaderText}>
        <Text style={styles.reviewerName}>Mr. Kenneth</Text>

        <View style={styles.stars}>
          <Icon name="star" size={14} color="#FFD700" />
          <Icon name="star" size={14} color="#FFD700" />
          <Icon name="star" size={14} color="#FFD700" />
          <Icon name="star" size={14} color="#FFD700" />
          <Icon name="star-border" size={14} color="#FFD700" />
        </View>
      </View>
    </View>
   
    <Text style={styles.reviewText}>
      Okay naman sya maganda at maayos ang takbo ng Acer Predator Helios 300 mabilis,
      malinis, at parang brand new pa rin gamitin; walang lag at perfect para sa gaming
      at school works, highly recommended!
    </Text>

  </Pressable>
</View>
        <View style={[styles.detailLine3, { borderTopColor: '#00000040' }]}
/>
      </ScrollView>


      {/* Fixed Action Buttons */}
      
      <View style={styles.actionContainer}>
      <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => router.replace("/customer/loginInterface")}
          activeOpacity={0.8}
        >
          <Icon name="chat-bubble-outline" size={20} color="#057474" />
          <Text style={styles.chatButtonText}>Chat Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBooking}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {  
    flex: 1, 
    backgroundColor: "#fff" 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  infoSection: {
    backgroundColor: '#FFF',
    padding: 16,
    bottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#057474',
    marginLeft: 4,
  },
  priceUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    top: 20,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  ownerText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  detailLine: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#0574744D',
  },
  detailLine2: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#0574744D',
    bottom: 105,
    
  },
 detailLine4: {
    paddingTop: 12,
    borderTopColor: '#0574744D',
    bottom: 50,
    borderTopWidth: 1,
    
  },
   detailLine3: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#0574744D',
    top: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    top: 40,
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    top: 40,
    left: 5,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  specItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  specKey: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    width: 130,
  },
  specValue: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  reviewCard: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  reviewHeaderText: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },

  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#fff",
    bottom: 10,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#057474',
  },
  chatButtonText: {
    color: '#057474',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#057474',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  disabledButton: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500'
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center'
  },
  goBackButton: {
    backgroundColor: '#057474',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20
  },
  goBackText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  }
});