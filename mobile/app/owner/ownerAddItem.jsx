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
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';

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
  const [quantity, setQuantity] = useState("1");
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

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

  // Request permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload images!'
        );
      }
    })();
  }, []);

  // Pick single image
  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit Reached", "You can add up to 5 images maximum.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage = {
          uri: result.assets[0].uri,
          type: result.assets[0].type || 'image/jpeg',
          name: result.assets[0].fileName || `image_${Date.now()}.jpg`,
          size: result.assets[0].fileSize,
        };
        setImages([...images, newImage]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // Pick multiple images
  const pickMultipleImages = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit Reached", "You can add up to 5 images maximum.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: Math.min(5 - images.length, 5),
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset, index) => ({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `image_${Date.now()}_${index}.jpg`,
          size: asset.fileSize,
        }));
        setImages([...images, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert("Error", "Failed to pick images");
    }
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  // Upload images to server using your existing API structure
  // Updated uploadImages function with better debugging
  const uploadImages = async () => {
    if (images.length === 0) {
      console.log('No images to upload');
      return [];
    }

    console.log(`Starting upload of ${images.length} images...`);
    setUploadingImages(true);
    const uploadedUrls = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        console.log(`Uploading image ${i + 1}/${images.length}: ${image.name}`);
        
        const formData = new FormData();
        formData.append('image', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `image_${Date.now()}_${i}.jpg`,
        });

        console.log('FormData created for image:', {
          uri: image.uri,
          type: image.type,
          name: image.name,
          size: image.size
        });

        const uploadResponse = await axios.post(
          `${API_URL}/api/upload/image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
            timeout: 30000,
          }
        );

        console.log(`Upload response for image ${i + 1}:`, uploadResponse.data);

        if (uploadResponse.data.success && uploadResponse.data.imageUrl) {
          uploadedUrls.push(uploadResponse.data.imageUrl);
          console.log(`✅ Image ${i + 1} uploaded successfully:`, uploadResponse.data.imageUrl);
        } else {
          console.error(`❌ Image ${i + 1} upload failed:`, uploadResponse.data);
          throw new Error(`Upload failed for image ${i + 1}: ${uploadResponse.data.error || 'Unknown error'}`);
        }
      }

      console.log('All images uploaded successfully:', uploadedUrls);
      return uploadedUrls;

    } catch (error) {
      console.error('❌ Error uploading images:', error);
      
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      // More specific error messages
      let errorMessage = 'Failed to upload images';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Invalid image file';
      } else if (error.response?.status === 413) {
        errorMessage = 'Image file too large. Please use smaller images.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timeout. Please try again with smaller images.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      throw new Error(errorMessage);
    } finally {
      setUploadingImages(false);
    }
  };

  // Updated handleAddItem function for your React Native component
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
      console.log('Starting item creation process...');
      
      // Upload images first if any selected
      const uploadedImageUrls = await uploadImages();
      console.log('Uploaded image URLs:', uploadedImageUrls);
      
      const newItem = {
        title: title.trim(),
        description: description?.trim() || null,
        pricePerDay: parseFloat(pricePerDay),
        category: category?.trim() || null,
        location: location?.trim() || null,
        quantity: parsedQuantity,
        availability: true, // Set default availability
        itemImages: uploadedImageUrls.length > 0 ? uploadedImageUrls : [], // Send as array, empty array if no images
        ownerId: parseInt(ownerId),
      };

      console.log('Creating item with data:', newItem);

      const response = await axios.post(`${API_URL}/api/item`, newItem, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000, // 30 second timeout
      });

      console.log('Item creation response:', response.data);

      if (response.data.success) {
        Alert.alert("Success", "Item added successfully!");
        
        // Reset form
        setTitle("");
        setDescription("");
        setPricePerDay("");
        setCategory("");
        setLocation("");
        setQuantity("1");
        setImages([]);
        
        // Navigate back to home
        router.replace("owner/ownerHome");
      } else {
        throw new Error(response.data.error || 'Failed to create item');
      }

    } catch (error) {
      console.error("Error creating item:", error);
      console.error("Error response:", error.response?.data);
      
      let errorMessage = "Failed to add item.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Error", errorMessage);
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

        {/* Image Upload Section */}
        <View style={styles.imageSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Item Images ({images.length}/5)</Text>
            <View style={styles.buttonGroup}>
              <Pressable onPress={pickImage} style={styles.addButton}>
                <Icon name="add-a-photo" size={16} color="#057474" />
                <Text style={styles.addButtonText}>Add</Text>
              </Pressable>
              <Pressable onPress={pickMultipleImages} style={styles.addButton}>
                <Icon name="photo-library" size={16} color="#057474" />
                <Text style={styles.addButtonText}>Multiple</Text>
              </Pressable>
            </View>
          </View>

          {/* Display selected images */}
          {images.length > 0 && (
            <ScrollView horizontal style={styles.imagePreviewContainer} showsHorizontalScrollIndicator={false}>
              {images.map((image, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  <Pressable
                    onPress={() => removeImage(index)}
                    style={styles.removeImageButton}
                  >
                    <Icon name="close" size={16} color="#FFF" />
                  </Pressable>
                  <Text style={styles.imageIndex}>{index + 1}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          {images.length === 0 && (
            <View style={styles.noImagesContainer}>
              <Icon name="image" size={48} color="#ccc" />
              <Text style={styles.noImagesText}>No images selected</Text>
              <Text style={styles.noImagesSubText}>Tap "Add" to select images</Text>
            </View>
          )}
        </View>

        <Pressable 
          style={[styles.submitButton, (loading || uploadingImages) && styles.submitButtonDisabled]} 
          onPress={handleAddItem} 
          disabled={loading || uploadingImages}
        >
          {loading || uploadingImages ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFF" />
              <Text style={styles.loadingText}>
                {uploadingImages ? "Uploading images..." : "Creating item..."}
              </Text>
            </View>
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F0F8F8",
    borderRadius: 6,
  },
  addButtonText: {
    color: "#057474",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  imagePreviewContainer: {
    marginBottom: 12,
  },
  imagePreviewWrapper: {
    marginRight: 8,
    position: "relative",
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  imageIndex: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "#FFF",
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  noImagesContainer: {
    alignItems: "center",
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  noImagesText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    fontWeight: "500",
  },
  noImagesSubText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#057474",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: "#999",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFF",
    fontSize: 14,
    marginLeft: 8,
  },
});