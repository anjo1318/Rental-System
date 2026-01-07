import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function ReviewProduct() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Destructure with fallbacks
  const { 
    itemId = '', 
    ownerId = '', 
    customerId = '', 
    productName = 'Product',
    productImage = '' 
  } = params;
  
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    // Debug: Log received parameters
    console.log('ReviewProduct received params:', {
      itemId,
      ownerId,
      customerId,
      productName,
      productImage
    });
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        console.log('User data loaded:', { firstName: user.firstName, lastName: user.lastName });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const getImageUrl = (imageData) => {
    if (!imageData) return "https://via.placeholder.com/150";
    
    try {
      const parsed = JSON.parse(imageData);
      return parsed[0] || "https://via.placeholder.com/150";
    } catch {
      return imageData || "https://via.placeholder.com/150";
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Please select a star rating");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Please write a description of your experience");
      return;
    }

    // Validate required parameters
    if (!itemId || !ownerId || !customerId) {
      Alert.alert("Error", "Missing required information. Please try again.");
      console.error('Missing params:', { itemId, ownerId, customerId });
      return;
    }

    try {
      setLoading(true);
      
      const reviewData = {
        itemId: parseInt(itemId),
        customerId: parseInt(customerId),
        ownerId: parseInt(ownerId),
        firstName,
        lastName,
        description: description.trim(),
        starRating: rating,
      };

      console.log('Submitting review with:', reviewData);

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/review/review-product`,
        reviewData
      );

      console.log('Review response:', response.data);

      if (response.data.success) {
        Alert.alert(
          "Success",
          "Thank you for your review!",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      console.error("Error response:", error.response?.data);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to submit review. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Icon
              name={star <= rating ? "star" : "star-border"}
              size={40}
              color={star <= rating ? "#FFD700" : "#CCC"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.pageName}>Write a Review</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Info with Image */}
        <View style={styles.productInfoContainer}>
          <Image
            source={{ uri: getImageUrl(productImage) }}
            style={styles.productImage}
            resizeMode="cover"
            onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
          />
          <View style={styles.productTextContainer}>
            <Text style={styles.productNameLabel}>Reviewing:</Text>
            <Text style={styles.productName}>{productName || "Product"}</Text>
          </View>
        </View>

        {/* Debug Info - Remove this after testing */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
              ItemID: {itemId || 'Missing'} | OwnerID: {ownerId || 'Missing'} | CustomerID: {customerId || 'Missing'}
            </Text>
          </View>
        )}

        {/* Star Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How was your experience?</Text>
          <Text style={styles.sectionSubtitle}>Tap to rate</Text>
          {renderStars()}
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating} {rating === 1 ? "star" : "stars"}
            </Text>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tell us more</Text>
          <Text style={styles.sectionSubtitle}>
            Share your experience with this rental
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe your experience with this product..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>
            {description.length}/500 characters
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmitReview}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Icon name="send" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  headerWrapper: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    marginTop: 25,
  },
  pageName: {
    fontWeight: "600",
    color: "#000",
    fontSize: 18,
    flex: 1,
    textAlign: "center",
    marginTop: 25,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  productInfoContainer: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  productTextContainer: {
    flex: 1,
  },
  productNameLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  debugContainer: {
    backgroundColor: "#FFF3CD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFC107",
  },
  debugText: {
    fontSize: 11,
    color: "#856404",
    fontFamily: "monospace",
  },
  section: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#057474",
    marginTop: 8,
  },
  textArea: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#000",
    minHeight: 150,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});