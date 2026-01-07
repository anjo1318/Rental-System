import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
  RefreshControl
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FeatherIcon from "react-native-vector-icons/Feather";
import MaterialCommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { RFValue } from "react-native-responsive-fontsize";
import OwnerBottomNav from '../components/OwnerBottomNav';
import CustomerBottomNav from '../components/CustomerBottomNav';
import * as Notifications from 'expo-notifications';
import { Vibration } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,  // ✅ New
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const sendRentalEndedNotification = async (productName) => {
  try {
    // Vibrate the phone
    Vibration.vibrate([0, 500, 200, 500]); // Pattern: wait 0ms, vibrate 500ms, wait 200ms, vibrate 500ms

    // Send notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Rental Period Ended",
        body: `Your rental period for ${productName} has ended. Please return the item to the owner.`,
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};


const { width, height } = Dimensions.get("window");

const HEADER_HEIGHT = height * 0.11;
const PADDING_H = width * 0.05;
const PADDING_V = height * 0.02;
const MARGIN_TOP = height * 0.04;
const ICON_BOX = width * 0.1;
const ICON_SIZE = width * 0.06;
const TITLE_FONT = RFValue(16);

export default function TimeDuration() {
  const router = useRouter();
  const pathname = usePathname();
  const [bookedItems, setBookedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState(null);
  const [timers, setTimers] = useState({});
  const [startingRent, setStartingRent] = useState({});
  const [notifiedItems, setNotifiedItems] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOngoingAndForApproval();
    setRefreshing(false);
  };


// 1. Timer with immediate notifications
useEffect(() => {
  if (bookedItems.length === 0) return;

  const interval = setInterval(() => {
    const now = new Date();
    const newTimers = {};

    bookedItems.forEach((item) => {
      if (item.status === 'ongoing') {
        const returnDate = new Date(item.returnDate);
        const diff = returnDate - now;

        if (diff <= 0) {
          newTimers[item.id] = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            expired: true,
          };

          if (!notifiedItems.has(item.id)) {
            sendRentalEndedNotification(item.product);
            setNotifiedItems(prev => new Set([...prev, item.id]));
          }
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          newTimers[item.id] = { days, hours, minutes, seconds, expired: false };
        }
      }
    });

    setTimers(newTimers);
  }, 1000);

  return () => clearInterval(interval);
}, [bookedItems, notifiedItems]);

// 2. Request permissions
useEffect(() => {
  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications to receive rental reminders.'
      );
    }
  };

  requestNotificationPermissions();
}, []);

// 3. Load owner
useEffect(() => {
  loadOwner();
}, []);

// 4. Fetch when owner loads
useEffect(() => {
  if (ownerId) fetchOngoingAndForApproval();
}, [ownerId]);


  // Schedule notification for when rental ends
const scheduleRentalEndNotification = async (item) => {
  try {
    const returnDate = new Date(item.returnDate);
    const now = new Date();
    
    // Only schedule if return date is in the future
    if (returnDate > now) {
      // Cancel any existing notification for this item
      const existingId = await AsyncStorage.getItem(`notification_${item.id}`);
      if (existingId) {
        await Notifications.cancelScheduledNotificationAsync(existingId);
      }

      // Schedule new notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Rental Period Ended!",
          body: `Your rental for "${item.product}" has ended. Please return it to the owner.`,
          data: { 
            itemId: item.id, 
            type: 'rental_ended',
            product: item.product 
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          badge: 1,
        },
        trigger: {
          date: returnDate,
        },
      });

      // Also schedule a reminder 1 hour before
      const oneHourBefore = new Date(returnDate.getTime() - (60 * 60 * 1000));
      if (oneHourBefore > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "⏳ Rental Ending Soon",
            body: `Your rental for "${item.product}" ends in 1 hour!`,
            data: { 
              itemId: item.id, 
              type: 'rental_reminder',
              product: item.product 
            },
            sound: true,
          },
          trigger: {
            date: oneHourBefore,
          },
        });
      }

      // Store notification ID
      await AsyncStorage.setItem(`notification_${item.id}`, notificationId);
      console.log('Scheduled notifications for:', item.product);
    }
  } catch (error) {
    console.error("Error scheduling notification:", error);
  }
};

// Cancel scheduled notification
const cancelScheduledNotification = async (itemId) => {
  try {
    const notificationId = await AsyncStorage.getItem(`notification_${itemId}`);
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await AsyncStorage.removeItem(`notification_${itemId}`);
      console.log('Cancelled notification for item:', itemId);
    }
  } catch (error) {
    console.error("Error canceling notification:", error);
  }
};


  const loadOwner = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return router.replace("customer/login");

      const user = JSON.parse(userData);
      setOwnerId(user.id);
    } catch (err) {
      console.error(err);
      router.replace("customer/login");
    }
  };

  const fetchOngoingAndForApproval = async () => {
    try {
      setLoading(true);
  
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/book/ongoing-for-approval-customer/${ownerId}`
      );
  
      const items = res.data.data || [];
      setBookedItems(items);
      console.log("API response of ongoing-for-approval-customer",items);
  
      // ADD THESE LINES:
      // Schedule notifications for all ongoing rentals
      for (const item of items) {
        if (item.status === 'ongoing') {
          await scheduleRentalEndNotification(item);
        } else {
          // Cancel notifications for non-ongoing items
          await cancelScheduledNotification(item.id);
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };



  const getImageUrl = (itemImage) => {
    try {
      const parsed = JSON.parse(itemImage);
      return parsed[0];
    } catch {
      return "https://via.placeholder.com/150";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderBookingCard = (item) => {
    const timer = timers[item.id] || { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };
    const isBooked = item.status === 'booked';
    const isOngoing = item.status === 'ongoing';

    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.deviceRow}>
          <Image
            source={{
              uri: getImageUrl(item.itemImage) || "https://via.placeholder.com/150",
            }}
            style={styles.deviceImage}
            onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
          />

          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{item.product}</Text>
            <Text style={styles.categoryText}>{item.category}</Text>
            <View style={isBooked ? styles.statusBooked : styles.statusOngoing}>
              <Text style={styles.statusText}>{isBooked ? 'Out for Delivery' : 'Ongoing'}</Text>
            </View>
          </View>
        </View>

       

    {isOngoing && (
      timer.expired ? (
        <>
          <View style={styles.expiredContainer}>
            <MaterialIcons name="access-time" size={40} color="#FF5252" />
            <Text style={styles.expiredText}>Rental Period Ended</Text>
          </View>
          
          {/* Add Action Buttons */}
          <View style={styles.actionButtonsContainer}>
          <Pressable 
            style={styles.reviewButton}
            onPress={() => {
              console.log('Navigating with params:', {
                itemId: String(item.itemId),
                ownerId: String(item.ownerId),
                customerId: String(ownerId),
                productName: item.product,
                productImage: item.itemImage
              });
              router.push({
                pathname: "/customer/reviewProducts",
                params: {
                  itemId: String(item.itemId),
                  ownerId: String(item.ownerId),
                  customerId: String(ownerId),
                  productName: item.product,
                  productImage: item.itemImage  // Add this line
                }
              });
            }}
          >
            <MaterialIcons name="rate-review" size={20} color="#fff" />
            <Text style={styles.reviewButtonText}>Write Review</Text>
          </Pressable>

            <Pressable 
              style={styles.rentAgainButton}
              onPress={() => {
                // Navigate to product details or booking page to rent again
                router.push({
                  pathname: "customer/productDetails", // or wherever you handle new bookings
                  params: {
                    itemId: item.itemId,
                  }
                });
              }}
            >
              <MaterialIcons name="refresh" size={20} color="#057474" />
              <Text style={styles.rentAgainButtonText}>Rent Again</Text>
            </Pressable>
          </View>
        </>
      ) : (

            <View style={styles.timerRow}>
              {[
                { value: String(timer.days).padStart(2, "0"), label: "Days" },
                { value: String(timer.hours).padStart(2, "0"), label: "Hours" },
                { value: String(timer.minutes).padStart(2, "0"), label: "Minutes" },
                { value: String(timer.seconds).padStart(2, "0"), label: "Seconds" },
              ].map((timeItem, index) => (
                <View key={index} style={styles.timeBox}>
                  <Text style={styles.timeValue}>{timeItem.value}</Text>
                  <Text style={styles.timeLabel}>{timeItem.label}</Text>
                </View>
              ))}
            </View>
          )
        )}

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

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
          <MaterialIcons name="payment" size={16} color="#666" />
            <Text style={styles.detailValue}>{item.paymentMethod || "N/A"}</Text>
            <Text style={styles.detailValue}>
               
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total:</Text>
            <Text style={styles.detailValue}>
              ₱{item.grandTotal ? parseFloat(item.grandTotal).toFixed(2) : item.amount}
            </Text>
          </View>
        </View>

        <View style={styles.paymentRow}>

          <Text style={styles.paymentText}>{item.address}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <CustomerBottomNav/>

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
                <Ionicons name="arrow-back" size={ICON_SIZE} color="#fff" />
              </Pressable>
            </View>

            <Text style={[styles.pageName, { fontSize: TITLE_FONT }]}>
              Time Duration
            </Text>

            <View style={[styles.iconBox, { width: ICON_BOX }]} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentWrapper}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007F7F"]}      // Android
            tintColor="#007F7F"       // iOS
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#057474" />
            <Text style={styles.loadingText}>Loading your bookings...</Text>
          </View>
        ) : bookedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="schedule" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No ongoing rentals</Text>
            <Text style={styles.emptySubtext}>Your active rental timers will appear here</Text>
          </View>
        ) : (
          bookedItems.map(renderBookingCard)
        )}
      </ScrollView>
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
    padding: width * 0.001,
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

  statusBooked: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    backgroundColor: "#FF9800",
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

  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },

  startButtonDisabled: {
    backgroundColor: "#A5D6A7",
  },

  startButtonText: {
    color: "#fff",
    fontSize: RFValue(13),
    fontWeight: "600",
    marginLeft: 8,
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
    backgroundColor: "#fff",
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#00000040",
    alignItems: "center",
  },

  addNewButton: {
    alignItems: "center",
    flex: 1,
    position: "relative",
    top: -20,
  },
  addNewCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#656565",
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
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  
  reviewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  
  reviewButtonText: {
    color: "#fff",
    fontSize: RFValue(12),
    fontWeight: "600",
  },
  
  rentAgainButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#057474",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  
  rentAgainButtonText: {
    color: "#057474",
    fontSize: RFValue(12),
    fontWeight: "600",
  },
});