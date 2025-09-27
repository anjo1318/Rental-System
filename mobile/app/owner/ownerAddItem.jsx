import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function OwnerAddItem() {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState(null);
  const [token, setToken] = useState(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState("1"); // New quantity field
  const [imageUrls, setImageUrls] = useState([""]); // Array for multiple images

  const [loading, setLoading] = useState(false);

  // Load owner info & token
  useEffect(() => {
    const loadOwner = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const savedToken = await AsyncStorage.getItem("token");

        if (userData && savedToken) {
          const user = JSON.parse(userData);
          setOwnerId(user.id);
          setToken(savedToken);
        } else {
          router.replace("owner/ownerLogin");
        }
      } catch (err) {
        console.error("Error loading owner:", err);
        router.replace("owner/ownerLogin");
      }
    };

    loadOwner();
  }, []);

  // Add new image URL input
  const addImageInput = () => {
    if (imageUrls.length < 5) { // Limit to 5 images max
      setImageUrls([...imageUrls, ""]);
    } else {
      Alert.alert("Limit Reached", "You can add up to 5 images maximum.");
    }
  };

  // Remove image URL input
  const removeImageInput = (index) => {
    if (imageUrls.length > 1) {
      const newImageUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(newImageUrls);
    }
  };

  // Update specific image URL
  const updateImageUrl = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  // Submit handler
  const handleAddItem = async () => {
    if (!title || !pricePerDay || !ownerId) {
      Alert.alert("Validation Error", "Title, Price per day, and Owner ID are required.");
      return;
    }

    // Validate quantity
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      Alert.alert("Validation Error", "Quantity must be at least 1.");
      return;
    }

    setLoading(true);
    try {
      // Filter out empty image URLs
      const validImageUrls = imageUrls.filter(url => url.trim() !== "");
      
      const newItem = {
        title,
        description,
        pricePerDay,
        category,
        location,
        quantity: parsedQuantity,
        itemImages: validImageUrls.length > 0 ? validImageUrls : undefined,
        ownerId,
      };

      const response = await axios.post(`${API_URL}/api/item`, newItem, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Success", "Item added successfully!");
      router.replace("owner/ownerHome");
    } catch (error) {
      console.error("❌ Error creating item:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Failed to add item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("owner/ownerHome")} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Add Item</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Title *"
          value={title}
          onChangeText={setTitle}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        
        <TextInput
          style={styles.input}
          placeholder="Price Per Day *"
          keyboardType="numeric"
          value={pricePerDay}
          onChangeText={setPricePerDay}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Quantity *"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />

        {/* Multiple Image URLs Section */}
        <View style={styles.imageSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Item Images</Text>
            <Pressable onPress={addImageInput} style={styles.addButton}>
              <Icon name="add" size={20} color="#057474" />
              <Text style={styles.addButtonText}>Add Image</Text>
            </Pressable>
          </View>

          {imageUrls.map((url, index) => (
            <View key={index} style={styles.imageInputContainer}>
              <TextInput
                style={[styles.input, styles.imageInput]}
                placeholder={`Image URL ${index + 1}`}
                value={url}
                onChangeText={(value) => updateImageUrl(index, value)}
              />
              {imageUrls.length > 1 && (
                <Pressable
                  onPress={() => removeImageInput(index)}
                  style={styles.removeButton}
                >
                  <Icon name="remove" size={20} color="#FF6B6B" />
                </Pressable>
              )}
            </View>
          ))}
        </View>

        <Pressable style={styles.submitButton} onPress={handleAddItem} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Add Item</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E1D6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#057474",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "600",
  },
  form: {
    padding: 16,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  imageSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addButtonText: {
    color: "#057474",
    fontSize: 14,
    marginLeft: 4,
    fontWeight: "500",
  },
  imageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  imageInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
    backgroundColor: "#FFE5E5",
    borderRadius: 6,
  },
  submitButton: {
    backgroundColor: "#057474",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});