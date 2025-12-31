import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { RFValue } from "react-native-responsive-fontsize";
import { usePathname } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

// 📏 Responsive constants
const HEADER_HEIGHT = Math.max(64, Math.round(height * 0.09));
const ICON_BOX = Math.round(width * 0.10);
const ICON_SIZE = Math.max(20, Math.round(width * 0.06));
const TITLE_FONT = Math.max(16, Math.round(width * 0.045));
const PADDING_H = Math.round(width * 0.02);
const MARGIN_TOP = Math.round(height * 0.025);
const PADDING_V = Math.min(Math.round(height * 0.0), 8);

export default function TimeDuration() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [bookedItems, setBookedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState({});
  const [userId, setUserId] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        console.log("From local storage", userData);
        
        const userIdValue = user.id || user.userId || user._id || "";
        
        if (userIdValue && userIdValue !== "N/A" && userIdValue !== "null" && userIdValue !== "undefined") {
          setUserId(userIdValue);
        } else {
          console.error("Invalid user ID found:", userIdValue);
        }
      } else {
        console.error("No user data found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Fetch booked items
  useEffect(() => {
    if (userId) {
      fetchBookedItems();
    }
  }, [userId]);

  const fetchBookedItems = async () => {
    try {
      setLoading(true);
  
      if (!process.env.EXPO_PUBLIC_API_URL) {
        throw new Error("API URL is missing");
      }
  
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/book/booked-items/${userId}`
      );
  
      console.log("API response:", response.data);
  
      if (response.data?.success) {
        const ongoingItems = (response.data.data || []).filter(
          item => item.status === "ongoing"
        );
        setBookedItems(ongoingItems);
      } else {
        setBookedItems([]);
      }
    } catch (error) {
      console.error("Fetch error:", error.message);
      setBookedItems([]);
    } finally {
      setLoading(false);
    }
  };
  

  // Calculate time remaining for each booking
  const calculateTimeRemaining = (returnDate) => {
    const now = new Date().getTime();
    const returnTime = new Date(returnDate).getTime();
    const difference = returnTime - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, expired: false };
  };

  // Update timers every second
  useEffect(() => {
    if (bookedItems.length === 0) return;
  
    const interval = setInterval(() => {
      const newTimers = {};
      bookedItems.forEach(item => {
        newTimers[item.id] = calculateTimeRemaining(item.returnDate);
      });
      setTimers(newTimers);
    }, 1000);
  
    return () => clearInterval(interval);
  }, [bookedItems]);
  

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Parse image URL
  const getImageUrl = (itemImage) => {
    try {
      let url = itemImage;
  
      if (typeof itemImage === "string") {
        const parsed = JSON.parse(itemImage);
        url = Array.isArray(parsed) ? parsed[0] : itemImage;
      }
  
      // 🔥 Fix broken protocol
      if (url && url.startsWith("ttp")) {
        url = "h" + url;
      }
  
      // 🔒 Force https
      if (url && url.startsWith("http://")) {
        url = url.replace("http://", "https://");
      }
  
      return url;
    } catch {
      return null;
    }
  };
  

  // Render booking card
  const renderBookingCard = (item) => {
    const timer = timers[item.id] || { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };

    return (
      <View key={item.id} style={styles.card}>
        {/* Device info */}
        <View style={styles.deviceRow}>
        <Image
          source={{
            uri: getImageUrl(item.itemImage) ||
              "https://via.placeholder.com/150",
          }}
          style={styles.deviceImage}
          onError={(e) =>
            console.log("Image load error:", e.nativeEvent.error)
          }
        />

          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{item.product}</Text>
            <Text style={styles.categoryText}>{item.category}</Text>
            <View style={styles.statusOngoing}>
              <Text style={styles.statusText}>Ongoing</Text>
            </View>
          </View>
        </View>

        {/* Timer - Always show for ongoing items */}
        {timer.expired ? (
          <View style={styles.expiredContainer}>
            <Icon name="access-time" size={40} color="#FF5252" />
            <Text style={styles.expiredText}>Rental Period Ended</Text>
          </View>
        ) : (
          <View style={styles.timerRow}>
            {[
              { value: String(timer.days).padStart(2, '0'), label: "Days" },
              { value: String(timer.hours).padStart(2, '0'), label: "Hours" },
              { value: String(timer.minutes).padStart(2, '0'), label: "Minutes" },
              { value: String(timer.seconds).padStart(2, '0'), label: "Seconds" },
            ].map((timeItem, index) => (
              <View key={index} style={styles.timeBox}>
                <Text style={styles.timeValue}>{timeItem.value}</Text>
                <Text style={styles.timeLabel}>{timeItem.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Dates */}
        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Start Date:</Text>
            <Text style={styles.dateText}>{formatDate(item.pickUpDate)}</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Return Date:</Text>
            <Text style={styles.dateText}>{formatDate(item.returnDate)}</Text>
          </View>
        </View>

        {/* Rental Details */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>
              {item.rentalDuration} {item.rentalPeriod}(s)
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total:</Text>
            <Text style={styles.detailValue}>₱{parseFloat(item.grandTotal).toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentRow}>
          <Icon name="payment" size={16} color="#666" />
          <Text style={styles.paymentText}>{item.paymentMethod}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Status bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View
        style={[
          styles.headerWrapper,
          {
            height: HEADER_HEIGHT,
            paddingHorizontal: PADDING_H,
            paddingVertical: PADDING_V,
          },
        ]}
      >
        <View style={styles.topBackground}>
          <View style={[styles.profileContainer, { marginTop: MARGIN_TOP }]}>
            <View style={[styles.iconBox, { width: ICON_BOX }]}>
              <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconPress}>
                <Icon name="arrow-back" size={ICON_SIZE} color="#fff" />
              </Pressable>
            </View>

            <Text style={[styles.pageName, { fontSize: TITLE_FONT }]}>
              Time Duration
            </Text>

            <View style={[styles.iconBox, { width: ICON_BOX }]} />
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentWrapper}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#057474" />
            <Text style={styles.loadingText}>Loading your bookings...</Text>
          </View>
        ) : bookedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="schedule" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No ongoing rentals</Text>
            <Text style={styles.emptySubtext}>Your active rental timers will appear here</Text>
          </View>
        ) : (
          bookedItems.map(renderBookingCard)
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { name: "Home", icon: "home", route: "/customer/home" },
          { name: "Book", icon: "shopping-cart", route: "/customer/book" },
          { name: "Message", icon: "mail", route: "/customer/message" },
          { name: "Time", icon: "schedule", route: "/customer/time" },
        ].map((navItem, index) => {
          const isActive = pathname === navItem.route;

          return (
            <Pressable
              key={index}
              style={styles.navButton}
              onPress={() => router.push(navItem.route)}
            >
              <Icon
                name={navItem.icon}
                size={24}
                color={isActive ? "#057474" : "#999"}
              />
              <Text
                style={[
                  styles.navText,
                  { color: isActive ? "#057474" : "#999" },
                ]}
              >
                {navItem.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E1D6",
  },

  /* Header */
  headerWrapper: {
    width: "100%",
    backgroundColor: "#007F7F",
    borderBottomWidth: 2,
    borderBottomColor: "#007F7F",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconBox: {
    alignItems: "center",
    justifyContent: "center",
  },

  iconPress: {
    padding: width * 0.015,
    borderRadius: 6,
  },

  pageName: {
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    flex: 1,
    paddingHorizontal: 6,
  },

  topBackground: {
    backgroundColor: "#007F7F",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  /* Content */
  scrollView: {
    flex: 1,
  },

  contentWrapper: {
    padding: 16,
    paddingBottom: 80,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },

  loadingText: {
    marginTop: 12,
    fontSize: RFValue(12),
    color: "#666",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },

  emptyText: {
    fontSize: RFValue(16),
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },

  emptySubtext: {
    fontSize: RFValue(12),
    color: "#999",
    marginTop: 8,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },

  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  deviceImage: {
    width: 70,
    height: 70,
    resizeMode: "cover",
    marginRight: 12,
    borderRadius: 8,
  },

  deviceInfo: {
    flex: 1,
  },

  deviceName: {
    fontSize: RFValue(14),
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },

  categoryText: {
    fontSize: RFValue(11),
    color: "#666",
    marginBottom: 6,
  },

  statusOngoing: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    backgroundColor: "#2196F3",
  },

  statusText: {
    fontSize: RFValue(10),
    fontWeight: "600",
    color: "#fff",
  },

  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    paddingHorizontal: 8,
  },

  timeBox: {
    alignItems: "center",
    flex: 1,
  },

  timeValue: {
    fontSize: RFValue(20),
    fontWeight: "700",
    color: "#057474",
  },

  timeLabel: {
    fontSize: RFValue(9),
    color: "#777",
    marginTop: 2,
  },

  expiredContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    marginBottom: 16,
  },

  expiredText: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#FF5252",
    marginLeft: 8,
  },

  dateRow: {
    marginBottom: 12,
  },

  dateItem: {
    marginBottom: 8,
  },

  dateLabel: {
    fontSize: RFValue(10),
    color: "#999",
    marginBottom: 2,
  },

  dateText: {
    fontSize: RFValue(12),
    color: "#333",
    fontWeight: "500",
  },

  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginBottom: 8,
  },

  detailItem: {
    flex: 1,
  },

  detailLabel: {
    fontSize: RFValue(10),
    color: "#999",
    marginBottom: 4,
  },

  detailValue: {
    fontSize: RFValue(13),
    fontWeight: "600",
    color: "#000",
  },

  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },

  paymentText: {
    fontSize: RFValue(11),
    color: "#666",
    marginLeft: 6,
  },

  /* Bottom Nav */
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: height * 0.015,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#00000040",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  navButton: {
    alignItems: "center",
    flex: 1,
    zIndex: 10,
  },

  navText: {
    fontWeight: "bold",
    fontSize: width * 0.03,
    marginTop: height * 0.005,
  },
});