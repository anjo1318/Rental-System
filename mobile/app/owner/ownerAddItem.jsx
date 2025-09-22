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
  const [itemImage, setItemImage] = useState("");

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

  // Submit handler
  const handleAddItem = async () => {
    if (!title || !pricePerDay || !ownerId) {
      Alert.alert("Validation Error", "Title, Price per day, and Owner ID are required.");
      return;
    }

    setLoading(true);
    try {
      const newItem = {
        title,
        description,
        pricePerDay,
        category,
        location,
        itemImage,
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
        <TextInput
          style={styles.input}
          placeholder="Item Image URL"
          value={itemImage}
          onChangeText={setItemImage}
        />

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
