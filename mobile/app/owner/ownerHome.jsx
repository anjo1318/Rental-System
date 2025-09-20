import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

export default function ownerHome() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Cellphone", "Projector", "Laptop", "Speaker"];

  const navigationItems = [
    { name: "Dashboard", icon: "home", route: "ownerDashboard", isImage: false },
    { name: "Listing", icon: "list-alt", route: "ownerListing", isImage: false },
    { name: "Request", icon: require("../../assets/images/request.png"), route: "ownerRequest", isImage: true },
    { name: "Time", icon: "schedule", route: "ownerTime", isImage: false },
  ];

  // Mock data for demo
  const mockItems = [
    {
      id: 1,
      title: "iPhone 14 Pro",
      itemImage: "https://via.placeholder.com/150",
      location: "Makati City",
      pricePerDay: "500",
      category: "Cellphone",
      isAvailable: true,
    },
    {
      id: 2,
      title: "MacBook Air M2",
      itemImage: "https://via.placeholder.com/150",
      location: "BGC, Taguig",
      pricePerDay: "1200",
      category: "Laptop",
      isAvailable: false,
    },
  ];

  const handleNavigation = (route) => {
    router.push(`/${route}`);
  };

  // Filter items based on search and category
  const filteredItems = mockItems.filter((item) => {
    const matchCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase());
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

        {/* Status Badge */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.isAvailable ? "#4CAF50" : "#FF5722" },
            ]}
          >
            <Text style={styles.statusText}>
              {item.isAvailable ? "Available" : "Rented"}
            </Text>
          </View>
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
        {/* Header with Back Button and Title */}
        <View style={styles.headerWrapper}>
          <View style={styles.profileContainer}>
            <Pressable onPress={() => router.back()}
              hitSlop={10}
              style={{ zIndex: 10 }} 
              >
              <Icon name="arrow-back" size={24} color="#FFF" />
            </Pressable>
            <Text style={styles.pageName}>Owner Dashboard</Text>

            {/* Notification Icon with Badge */}
            <View style={styles.notificationWrapper}>
              <Icon name="notifications-none" size={24} color="#FFF" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Rented</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>₱2,450</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#cccccc"
            style={styles.leftIcon}
          />
          <TextInput
            placeholder="Search your items.."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#555"
          />
          <Icon name="tune" size={20} color="gray" style={styles.rightIcon} />
        </View>

        {/* Featured Items */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Your Featured Items</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {mockItems.map((item) => (
            <View key={item.id} style={styles.featuredCard}>
              <Image
                source={{ uri: item.itemImage }}
                style={styles.featuredImage}
              />
            </View>
          ))}
        </ScrollView>

        {/* Item Categories */}
        <Text style={styles.sectionTitle}>Manage Your Items</Text>
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
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />

        {/* Add Item Button */}
        <View style={styles.addButtonContainer}>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/addItem")}
          >
            <Icon name="add" size={24} color="#FFF" />
            <Text style={styles.addButtonText}>Add New Item</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {navigationItems.map((navItem, index) => (
          <Pressable
            key={index}
            style={styles.navButton}
            onPress={() => handleNavigation(navItem.route)}
          >
            {navItem.isImage ? (
              <Image
                source={navItem.icon}
                style={{ width: 24, height: 24, tintColor: "#fff" }}
                resizeMode="contain"
              />
            ) : (
              <Icon name={navItem.icon} size={24} color="#fff" />
            )}
            <Text style={styles.navText}>{navItem.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E1D6",
  },
  headerWrapper: {
    width: "100%",
    backgroundColor: "#057474",
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  pageName: {
    fontSize: width * 0.045,
    color: "#FFF",
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginLeft: -24,
  },
  notificationWrapper: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF5722",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#057474",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 25,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leftIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  rightIcon: {
    marginLeft: 10,
  },
  featuredSection: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featuredCard: {
    width: 120,
    height: 80,
    marginRight: 12,
    marginLeft: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginRight: 10,
    marginLeft: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  activeCategory: {
    backgroundColor: "#057474",
    borderColor: "#057474",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  activeCategoryText: {
    color: "#FFF",
    fontWeight: "500",
  },
  card: {
    width: (width - 48) / 2,
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upperHalf: {
    height: 120,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  lowerHalf: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  statusRow: {
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "500",
  },
  location: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#057474",
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#057474",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#057474",
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  navButton: {
    alignItems: "center",
    flex: 1,
  },
  navText: {
    color: "#FFF",
    fontSize: 10,
    marginTop: 4,
  },
});
