



import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");


const HORIZONTAL_PADDING = 16; // FlatList horizontal padding
const CARD_MARGIN = 16; // space between two cards
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_MARGIN) / 2;
const CARD_HEIGHT = height * 0.35; // adjustable card height
const BORDER_RADIUS = Math.round(width * 0.02);
const PADDING = Math.round(width * 0.02);
const IMAGE_RATIO = 0.7; // 70%



export default function Review() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Cellphone", "Projector", "Laptop", "Speaker"];

  const navigationItems = [
    { name: "Home", icon: "home", route: "Home" },
    { name: "Book", icon: "book", route: "Book" },
    { name: "Message", icon: "message", route: "Message" },
    { name: "Time", icon: "schedule", route: "Time" },
  ];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/api/item`
        );
        if (response.data.success) {
          setItems(response.data.message);
        } else {
          setError("Failed to fetch items");
        }
      } catch (err) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleNavigation = (route) => {
    navigation.navigate(route);
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (error)
    return (
      <View style={styles.center}>
        <Text>Error: {error}</Text>
      </View>
    );

  // Filter items based on search and category
  const filteredItems = items.filter((item) => {
    const matchCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const renderItem = ({ item }) => (
  <View style={styles.card}>
    {/* Upper half for image */}
    <View style={styles.upperHalf}>
      <Image source={{ uri: item.itemImage }} style={styles.itemImage} />
    </View>

    {/* Lower half for text */}
    <View style={styles.lowerHalf}>
      {/* Title */}
      <Text style={styles.title}>{item.title}</Text>

      {/* Rating */}
      <View style={styles.ratingRow}>
        <Text style={styles.ratingValue}>5.0</Text>
        <Text style={styles.starIcon}>⭐</Text>
      </View>

      {/* Location */}
      <Text style={styles.location}>{item.location}</Text>

      {/* Price */}
      <Text style={styles.price}>₱{item.pricePerDay}</Text>
    </View>
  </View>
);



  return (
      <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Top Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=3" }}
            style={styles.avatar}
          />
          <Text style={styles.username}>Marco Polo</Text>

          {/* Notification Icon with Badge */}
          <View style={styles.notificationWrapper}>
            <Icon name="notifications-none" size={24} color="#057474" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        {/* Left Search Icon */}
        <Icon name="search" size={20} color="#cccccc" style={styles.leftIcon} />

        {/* TextInput */}
        <TextInput
          placeholder="Search your devices.."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#555"
        />

        {/* Right Filter Icon */}
        <Icon name="tune" size={20} color="gray" style={styles.rightIcon} />
      </View>
      
        {/* Featured Devices */}
        <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Featured Devices</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredItems.slice(0, 5).map((item) => (
            <View key={item.id} style={styles.featuredCard}>
              <Image
                source={{ uri: item.itemImage }}
                style={styles.featuredImage}
              />
            </View>
          ))}
        </ScrollView>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>Our Recommendations</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10 }}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.categoryButton,
                activeCategory === cat && styles.activeCategory,
              ]}
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

        {/* Item List */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 16,
          }}
          scrollEnabled={false} // since inside ScrollView
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {navigationItems.map((navItem, index) => (
          <Pressable
            key={index}
            style={styles.navButton}
            onPress={() => handleNavigation(navItem.route)}
          >
            <Icon name={navItem.icon} size={24} color="#fff" />
            <Text style={styles.navText}>{navItem.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: width * 0.04,
    position: "relative",
    marginTop: height * 0.03,
  },

  avatar: { 
    width: width * 0.1, 
    height: width * 0.1, 
    borderRadius: width * 0.05 
  },
  
  username: { 
    marginLeft: width * 0.03, 
    fontWeight: "bold", 
    fontSize: width * 0.04 
  },
  
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // avatar left, bell right
    padding: 16,
    marginTop: 40,
  },
  notificationWrapper: {
    marginLeft: "auto", // pushes it to the right
    marginRight: 16,
    position: "relative",
    width: width * 0.10,   // circle size
    height: width * 0.10,
    borderRadius: (width * 0.12) / 2,
    borderWidth: 2,
    borderColor: "#057474", // green border
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: "#057474",
    borderRadius: 10,
    width: 15,
    height: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007F7F",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    height: 45,
    backgroundColor: "#fff",
  },

  leftIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },

  rightIcon: {
    marginLeft: 8,
  },


  sectionTitle: {
    fontWeight: "bold",
    fontSize: width * 0.045,
    marginLeft: width * 0.04,
    paddingVertical: height * 0.025,
  },

  featuredCard: {
    width: width * 0.65,
    height: height * 0.30,
    borderRadius: width * 0.03,
    marginLeft: width * 0.04,
    overflow: "hidden",
  },
  featuredImage: { 
    width: "100%", 
    height: "100%", 
    resizeMode: "cover" 
  },

   card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#fff",
    borderRadius: width * 0.05,
    borderWidth: .1,
    overflow: "hidden", // keeps rounded corners clean
    marginBottom: width * 0.04,
  },

  upperHalf: {
    flex: 1, // 50% of card
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E6E1D6",

  },

  itemImage: {
    width: "85%",   // adjustable
    height: "85%",  // adjustable
    resizeMode: "contain",
    borderRadius: width * 0.03,
  },

  lowerHalf: {
  flex: 1,
  justifyContent: "flex-start",
  paddingHorizontal: 8,   // left padding
  paddingTop: 8,
},

title: {
  fontWeight: "bold",
  fontSize: width * 0.04,
  marginBottom: 8,
},

ratingRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 2,
},

ratingValue: {
  fontSize: width * 0.035,
  color: "#555",
  marginRight: 4,
},

starIcon: {
  fontSize: width * 0.035,
  color: "#f5a623",  // golden star color
},

location: {
  fontSize: width * 0.035,
  color: "#555",
  marginBottom: 2,
},

price: {
  fontWeight: "bold",
  fontSize: width * 0.04,
  marginTop: 12,
},

  categoryButton: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderRadius: 20,
    backgroundColor: "transparent",
    marginLeft: width * 0.04,
  },
  activeCategory: { 
    backgroundColor: "#007F7F" 
  },
  categoryText: { 
    fontSize: width * 0.035, 
    color: "#555" 
  },
  activeCategoryText: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: height * 0.015,
    backgroundColor: "#057474",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: { 
    alignItems: "center", 
    flex: 1 
  },
  navText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: width * 0.03, 
    marginTop: height * 0.005 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});
