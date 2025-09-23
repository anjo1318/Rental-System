import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function OwnerEditItem() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState({
    title: '',
    description: '',
    category: '',
    pricePerDay: '',
    itemImage: '',
    availability: true
  });

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const categories = [
    'Electronics',
    'Tools',
    'Sports',
    'Furniture',
    'Vehicles',
    'Clothing',
    'Books',
    'Kitchen',
    'Garden',
    'Other'
  ];

  // Fetch item details
  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching item details for ID:', id);
      
      if (!id) {
        Alert.alert("Error", "No item ID provided");
        router.back();
        return;
      }

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Session Expired", "Please login again", [
          { text: "OK", onPress: () => router.replace("owner/ownerLogin") }
        ]);
        return;
      }

      const response = await axios.get(`${API_URL}/api/item/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Fetch item response:", {
        success: response.data.success,
        item: response.data.data
      });

      if (response.data.success) {
        const itemData = response.data.data;
        setItem({
          title: itemData.title || '',
          description: itemData.description || '',
          category: itemData.category || '',
          pricePerDay: itemData.pricePerDay?.toString() || '',
          itemImage: itemData.itemImage || '',
          availability: itemData.availability !== undefined ? itemData.availability : true
        });
      } else {
        Alert.alert("Error", response.data.message || "Failed to load item");
        router.back();
      }
    } catch (error) {
      console.error("❌ Error fetching item:", error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        Alert.alert("Session Expired", "Please login again", [
          { text: "OK", onPress: () => router.replace("owner/ownerLogin") }
        ]);
      } else if (error.response?.status === 404) {
        Alert.alert("Error", "Item not found", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else if (error.response?.status === 403) {
        Alert.alert("Error", "You don't have permission to view this item");
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        Alert.alert("Timeout", "Request timed out. Please try again.");
      } else if (error.message.includes('Network Error')) {
        Alert.alert("Network Error", "Please check your internet connection and try again");
      } else {
        Alert.alert("Error", `Failed to load item: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update item
  const updateItem = async () => {
    // Validation
    if (!item.title.trim()) {
      Alert.alert("Validation Error", "Please enter an item title");
      return;
    }
    if (!item.description.trim()) {
      Alert.alert("Validation Error", "Please enter an item description");
      return;
    }
    if (!item.category) {
      Alert.alert("Validation Error", "Please select a category");
      return;
    }
    if (!item.pricePerDay || parseFloat(item.pricePerDay) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid price per day");
      return;
    }

    try {
      setSaving(true);
      console.log('Updating item with ID:', id);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Session Expired", "Please login again", [
          { text: "OK", onPress: () => router.replace("owner/ownerLogin") }
        ]);
        return;
      }

      const updateData = {
        title: item.title.trim(),
        description: item.description.trim(),
        category: item.category,
        pricePerDay: parseFloat(item.pricePerDay),
        itemImage: item.itemImage,
        availability: item.availability
      };

      console.log('Update data:', updateData);

      const response = await axios.put(`${API_URL}/api/item/${id}`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ Update response:", {
        success: response.data.success,
        message: response.data.message
      });

      if (response.data.success) {
        Alert.alert("Success", "Item updated successfully!", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("Error", response.data.error || "Failed to update item");
      }
    } catch (error) {
      console.error("❌ Error updating item:", error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        Alert.alert("Session Expired", "Please login again", [
          { text: "OK", onPress: () => router.replace("owner/ownerLogin") }
        ]);
      } else if (error.response?.status === 403) {
        Alert.alert("Error", "You don't have permission to update this item");
      } else if (error.response?.status === 404) {
        Alert.alert("Error", "Item not found");
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        Alert.alert("Timeout", "Request timed out. Please try again.");
      } else if (error.message.includes('Network Error')) {
        Alert.alert("Network Error", "Please check your internet connection and try again");
      } else {
        Alert.alert("Error", `Failed to update item: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Pick image
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setItem(prev => ({
          ...prev,
          itemImage: result.assets[0].uri
        }));
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#057474" />
        <Text style={styles.loadingText}>Loading item details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Item</Text>
        <TouchableOpacity
          onPress={updateItem}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          activeOpacity={0.7}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Item Image</Text>
          <TouchableOpacity 
            style={styles.imageContainer} 
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {item.itemImage ? (
              <Image source={{ uri: item.itemImage }} style={styles.itemImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="add-a-photo" size={48} color="#999" />
                <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Item Title *</Text>
          <TextInput
            style={styles.input}
            value={item.title}
            onChangeText={(text) => setItem(prev => ({ ...prev, title: text }))}
            placeholder="Enter item title"
            placeholderTextColor="#999"
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={item.description}
            onChangeText={(text) => setItem(prev => ({ ...prev, description: text }))}
            placeholder="Enter item description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={item.category}
              onValueChange={(value) => setItem(prev => ({ ...prev, category: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Select category" value="" />
              {categories.map((category) => (
                <Picker.Item key={category} label={category} value={category} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.label}>Price Per Day (₱) *</Text>
          <TextInput
            style={styles.input}
            value={item.pricePerDay}
            onChangeText={(text) => setItem(prev => ({ ...prev, pricePerDay: text }))}
            placeholder="0.00"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.label}>Availability</Text>
          <View style={styles.availabilityContainer}>
            <TouchableOpacity
              style={[
                styles.availabilityButton,
                item.availability && styles.availabilityButtonActive
              ]}
              onPress={() => setItem(prev => ({ ...prev, availability: true }))}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.availabilityButtonText,
                item.availability && styles.availabilityButtonTextActive
              ]}>
                Available
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.availabilityButton,
                !item.availability && styles.availabilityButtonActive
              ]}
              onPress={() => setItem(prev => ({ ...prev, availability: false }))}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.availabilityButtonText,
                !item.availability && styles.availabilityButtonTextActive
              ]}>
                Not Available
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E1D6",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#057474",
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "600",
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 70,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  picker: {
    height: 50,
  },
  imageContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    height: 200,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  availabilityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  availabilityButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  availabilityButtonActive: {
    backgroundColor: '#057474',
    borderColor: '#057474',
  },
  availabilityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  availabilityButtonTextActive: {
    color: '#FFF',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 50,
  },
});