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


  // Remove image
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };



// Simplified uploadImages function using fetch (more reliable than axios for React Native)
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

      console.log(`Making request to: ${API_URL}/api/upload/image`);

      const response = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type with fetch and FormData - let it set automatically
        },
        body: formData,
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP Error ${response.status}:`, errorText);
        throw new Error(`Upload failed: HTTP ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`Upload response:`, responseData);

      if (responseData.success && responseData.imageUrl) {
        uploadedUrls.push(responseData.imageUrl);
        console.log(`✅ Image ${i + 1} uploaded successfully`);
      } else {
        throw new Error(`Upload failed: ${responseData.error || 'Unknown error'}`);
      }
    }

    console.log('All images uploaded successfully:', uploadedUrls);
    return uploadedUrls;

  } catch (error) {
    console.error('❌ Error uploading images:', error);
    throw error; // Re-throw to be handled by handleAddItem
  } finally {
    setUploadingImages(false);
  }
};

// Simplified handleAddItem function
const handleAddItem = async () => {
  // Validation
  if (!title || !pricePerDay || !ownerId) {
    Alert.alert("Validation Error", "Title, Price per day, and Owner ID are required.");
    return;
  }

  const parsedQuantity = parseInt(quantity);
  if (isNaN(parsedQuantity) || parsedQuantity < 1) {
    Alert.alert("Validation Error", "Quantity must be at least 1.");
    return;
  }

  setLoading(true);
  
  try {
    console.log('Starting item creation process...');
    console.log('API_URL:', API_URL);
    
    // Upload images first
    let uploadedImageUrls = [];
    if (images.length > 0) {
      console.log('Uploading images...');
      uploadedImageUrls = await uploadImages();
    }
    
    console.log('Creating item with uploaded images:', uploadedImageUrls);
    
    // Create item
    const newItem = {
      title: title.trim(),
      description: description?.trim() || null,
      pricePerDay: parseFloat(pricePerDay),
      category: category?.trim() || null,
      location: location?.trim() || null,
      quantity: parsedQuantity,
      availability: true,
      itemImages: uploadedImageUrls,
      ownerId: parseInt(ownerId),
    };

    console.log('Sending item data:', newItem);

    const response = await fetch(`${API_URL}/api/item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newItem),
    });

    console.log('Item creation response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP Error ${response.status}:`, errorText);
      throw new Error(`Failed to create item: HTTP ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Item creation response:', responseData);

    if (responseData.success) {
      Alert.alert("Success", "Item added successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setPricePerDay("");
      setCategory("");
      setLocation("");
      setQuantity("1");
      setImages([]);
      
      // Navigate back
      router.replace("owner/ownerHome");
    } else {
      throw new Error(responseData.error || 'Failed to create item');
    }

  } catch (error) {
    console.error("Error in handleAddItem:", error);
    
    let errorMessage = "Failed to add item. Please try again.";
    
    if (error.message) {
      errorMessage = error.message;
    }
    
    Alert.alert("Error", errorMessage);
  } finally {
    setLoading(false);
  }
};

// Also fix the image picker to ensure proper MIME types
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
      const asset = result.assets[0];
      
      // Fix MIME type
      let mimeType = 'image/jpeg';
      if (asset.mimeType) {
        mimeType = asset.mimeType;
      } else if (asset.uri) {
        const extension = asset.uri.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'png': mimeType = 'image/png'; break;
          case 'jpg': case 'jpeg': mimeType = 'image/jpeg'; break;
          case 'gif': mimeType = 'image/gif'; break;
          case 'webp': mimeType = 'image/webp'; break;
        }
      }
      
      const newImage = {
        uri: asset.uri,
        type: mimeType,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        size: asset.fileSize,
      };
      
      console.log('Adding image:', newImage);
      setImages([...images, newImage]);
    }
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert("Error", "Failed to pick image");
  }
};

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
      const newImages = result.assets.map((asset, index) => {
        let mimeType = 'image/jpeg';
        if (asset.mimeType) {
          mimeType = asset.mimeType;
        } else if (asset.uri) {
          const extension = asset.uri.split('.').pop()?.toLowerCase();
          switch (extension) {
            case 'png': mimeType = 'image/png'; break;
            case 'jpg': case 'jpeg': mimeType = 'image/jpeg'; break;
            case 'gif': mimeType = 'image/gif'; break;
            case 'webp': mimeType = 'image/webp'; break;
          }
        }
        
        return {
          uri: asset.uri,
          type: mimeType,
          name: asset.fileName || `image_${Date.now()}_${index}.jpg`,
          size: asset.fileSize,
        };
      });
      
      console.log('Adding multiple images:', newImages);
      setImages([...images, ...newImages]);
    }
  } catch (error) {
    console.error('Error picking images:', error);
    Alert.alert("Error", "Failed to pick images");
  }
};


  const uploadImagesWithFetch = async () => {
    if (images.length === 0) {
      return [];
    }

    console.log('Using fetch for upload...');
    setUploadingImages(true);
    const uploadedUrls = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        console.log(`Fetch uploading image ${i + 1}:`, image);
        
        const formData = new FormData();
        formData.append('image', {
          uri: image.uri,
          type: image.type,
          name: image.name,
        });

        const response = await fetch(`${API_URL}/api/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for fetch with FormData
          },
          body: formData,
        });

        console.log('Fetch response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('Fetch response data:', responseData);
        
        if (responseData.success && responseData.imageUrl) {
          uploadedUrls.push(responseData.imageUrl);
          console.log(`✅ Image ${i + 1} uploaded with fetch`);
        } else {
          throw new Error(`Upload failed: ${responseData.error || 'Unknown error'}`);
        }
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Fetch upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    } finally {
      setUploadingImages(false);
    }
  };

  const testServerConnection = async () => {
  try {
    console.log('Testing server connection...');
    const response = await axios.get(`${API_URL}/api/health`, {
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    console.log('Server connection test:', response.status, response.data);
    return true;
  } catch (error) {
    console.error('Server connection failed:', error.message);
    return false;
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