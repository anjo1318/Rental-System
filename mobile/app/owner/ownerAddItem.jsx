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
  Dimensions
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import { Picker } from "@react-native-picker/picker";


const API_URL = process.env.EXPO_PUBLIC_API_URL;

const { height } = Dimensions.get("window");

export default function OwnerAddItem() {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState(null);
  const [token, setToken] = useState(null);

  // Form fields
  const [productName, setProductName] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [specification, setSpecification] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState([]);


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
  // Required field validation
if (!productName.trim() || !pricePerHour || !ownerId) {
  Alert.alert(
    "Validation Error",
    "Product name, price per hour, and owner information are required."
  );
  return;
}

// Price validation
const parsedPrice = Number(pricePerHour);
if (isNaN(parsedPrice) || parsedPrice <= 0) {
  Alert.alert(
    "Validation Error",
    "Price per hour must be a valid number greater than zero."
  );
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
      title: productName.trim(),                              // Maps to backend 'title'
      description: productDescription?.trim() || null,        // Maps to backend 'description'
      pricePerDay: Number(pricePerHour),                      // Maps to backend 'pricePerDay'
      category: category?.trim() || null,
      location: location?.trim() || null,
      itemImages: uploadedImageUrls,                          // Array of image URLs
      ownerId: parseInt(ownerId),
      availability: true,                                     // Optional: defaults to true in backend
      quantity: 1,                                            // Optional: defaults to 1 in backend
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
      setProductName("");
      setProductBrand("");
      setPricePerHour("");
      setSpecification("");
      setCategory("");
      setLocation("");
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
        <Text style={styles.headerTitle}>Add New Product</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
{/* PRODUCT NAME */}
<View style={styles.pickerContainer}>
  {!productName && (
    <Text style={styles.pickerOverlayText}>Product Name *</Text>
  )}
  <Picker
    selectedValue={productName}
    onValueChange={(itemValue) => setProductName(itemValue)}
    style={{ color: productName ? "#000" : "transparent", width: "100%" }}
  >
    <Picker.Item label="Select Product Name" value="" color="#888" />
    <Picker.Item label="Laptop" value="laptop" />
    <Picker.Item label="Smartphone" value="smartphone" />
    <Picker.Item label="Tablet" value="tablet" />
    <Picker.Item label="Camera" value="camera" />
    <Picker.Item label="Gaming Console" value="gaming_console" />
    <Picker.Item label="Projector" value="projector" />
    <Picker.Item label="Drone" value="drone" />
  </Picker>
</View>

{/* PRODUCT BRAND */}
<View style={styles.pickerContainer}>
  {!productBrand && (
    <Text style={styles.pickerOverlayText}>Product Brand *</Text>
  )}
  <Picker
    selectedValue={productBrand}
    onValueChange={(itemValue) => setProductBrand(itemValue)}
    style={{ color: productBrand ? "#000" : "transparent", width: "100%" }}
  >
    <Picker.Item label="Select Product Brand" value="" color="#888" />
    <Picker.Item label="Apple" value="apple" />
    <Picker.Item label="Samsung" value="samsung" />
    <Picker.Item label="Sony" value="sony" />
    <Picker.Item label="Dell" value="dell" />
    <Picker.Item label="HP" value="hp" />
    <Picker.Item label="Lenovo" value="lenovo" />
    <Picker.Item label="Asus" value="asus" />
    <Picker.Item label="Canon" value="canon" />
    <Picker.Item label="Nikon" value="nikon" />
  </Picker>
</View>

        <TextInput
          style={styles.input}
          placeholder="Price Per Hour *"
          value={pricePerHour}
          onChangeText={setPricePerHour}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Specification"
          value={specification}
          onChangeText={setSpecification}
          multiline
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Product Description( actual condition) *"
          value={productDescription}
          onChangeText={setProductDescription}
          multiline
        />
        
{/* CATEGORY */}
<View style={styles.pickerContainer}>
  {!category && (
    <Text style={styles.pickerOverlayText}>Category *</Text>
  )}
  <Picker
    selectedValue={category}
    onValueChange={(itemValue) => setCategory(itemValue)}
    style={{ color: category ? "#000" : "transparent", width: "100%" }}
  >
    <Picker.Item label="Select Category" value="" color="#888" />
    <Picker.Item label="Personal Electronics" value="personal_electronics" />
    <Picker.Item label="Office Equipment" value="office_equipment" />
    <Picker.Item label="Photography & Video" value="photography_video" />
    <Picker.Item label="Gaming & Entertainment" value="gaming_entertainment" />
    <Picker.Item label="Presentation Equipment" value="presentation_equipment" />
  </Picker>
</View>

{/* LOCATION */}
<View style={styles.pickerContainer}>
  {!location && (
    <Text style={styles.pickerOverlayText}>Location *</Text>
  )}
  <Picker
    selectedValue={location}
    onValueChange={(itemValue) => setLocation(itemValue)}
    style={{ color: location ? "#000" : "transparent", width: "100%" }}
  >
    <Picker.Item label="Select Location" value="" color="#888" />
      <Picker.Item label="Anoling" value="Anoling" />
      <Picker.Item label="Bacungan" value="Bacungan" />
      <Picker.Item label="Bangbang" value="Bangbang" />
      <Picker.Item label="Banilad" value="Banilad" />
      <Picker.Item label="Buli" value="Buli" />
      <Picker.Item label="Cacawan" value="Cacawan" />
      <Picker.Item label="Calingag" value="Calingag" />
      <Picker.Item label="Del Razon" value="Del Razon" />
      <Picker.Item label="Guinhawa" value="Guinhawa" />
      <Picker.Item label="Inclanay" value="Inclanay" />
      <Picker.Item label="Lumambayan" value="Lumambayan" />
      <Picker.Item label="Malaya" value="Malaya" />
      <Picker.Item label="Maliancog" value="Maliancog" />
      <Picker.Item label="Maningcol" value="Maningcol" />
      <Picker.Item label="Marayos" value="Marayos" />
      <Picker.Item label="Marfrancisco" value="Marfrancisco" />
      <Picker.Item label="Nabuslot" value="Nabuslot" />
      <Picker.Item label="Pagalagala" value="Pagalagala" />
      <Picker.Item label="Palayan" value="Palayan" />
      <Picker.Item label="Pambisan Malaki" value="Pambisan Malaki" />
      <Picker.Item label="Pambisan Munti" value="Pambisan Munti" />
      <Picker.Item label="Panggulayan" value="Panggulayan" />
      <Picker.Item label="Papandayan" value="Papandayan" />
      <Picker.Item label="Pili" value="Pili" />
      <Picker.Item label="Quinabigan" value="Quinabigan" />
      <Picker.Item label="Ranzo" value="Ranzo" />
      <Picker.Item label="Rosario" value="Rosario" />
      <Picker.Item label="Sabang" value="Sabang" />
      <Picker.Item label="Sta. Isabel" value="Sta. Isabel" />
      <Picker.Item label="Sta. Maria" value="Sta. Maria" />
      <Picker.Item label="Sta. Rita" value="Sta. Rita" />
      <Picker.Item label="Sto. Nino (Santo Niño)" value="Sto. Nino (Santo Niño)" />
      <Picker.Item label="Wawa" value="Wawa" />
      <Picker.Item label="Zone I (Pob.)" value="Zone I (Pob.)" />
      <Picker.Item label="Zone II (Pob.)" value="Zone II (Pob.)" />
      <Picker.Item label="Zone III (Pob.)" value="Zone III (Pob.)" />
      <Picker.Item label="Zone IV (Pob.)" value="Zone IV (Pob.)" />
    </Picker>
</View>

        

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
    paddingVertical: 25,
    paddingHorizontal: 16,
    backgroundColor:"#007F7F",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: "center",
  },
  backButton: {
    right: 80,
    top: 10,
  },
  headerTitle: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "600",
    top: 10,
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
  pickerContainer: {
  width: "100%",
  borderWidth: 1,
  borderRadius: 8,
  borderColor: "#ccc",
  backgroundColor: "#FFF",
  justifyContent: "center",
  marginBottom: 12,
  paddingHorizontal: 12,
  paddingVertical: Platform.OS === "ios" ? 12 : 4,
},

  pickerOverlayText: {
  position: "absolute",
  left: 12,
  fontSize: 14,
  color: "#888",
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