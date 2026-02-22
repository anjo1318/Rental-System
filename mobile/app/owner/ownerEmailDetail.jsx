import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter, useLocalSearchParams } from "expo-router";
import ScreenWrapper from "../components/screenwrapper";

const { width } = Dimensions.get("window");

export default function OwnerEmailDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  const {
    product,
    renterName,
    ownerEmail,
    rentalPrice,
    totalAmount,
    productImage,
    bookingDate,
    sentAt,
    status,
    bookingId,
  } = params;

  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      if (!sentAt) return;
      const sent = new Date(sentAt).getTime();
      const deadline = sent + 24 * 60 * 60 * 1000;
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [sentAt]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(parseFloat(amount) || 0);
  };

  const commission = ((parseFloat(totalAmount) || 0) * 0.3).toFixed(2);

  // Parse productImage if JSON array
  let imageUrl = null;
  if (productImage) {
    try {
      const parsed = JSON.parse(productImage);
      imageUrl = Array.isArray(parsed) ? parsed[0] : productImage;
    } catch {
      imageUrl = productImage;
    }
  }

  const isExpired = timeRemaining === "Expired";

  return (
    <ScreenWrapper>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* ── ALERT CARD ── */}
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View style={styles.alertIconWrap}>
                <Icon name="warning" size={24} color="#fff" />
              </View>
              <Text style={styles.alertTitle}>PAYMENT PENDING</Text>
            </View>
            <View style={styles.alertBody}>
              <Text style={styles.alertText}>
                Failure to remit the required payment within{" "}
                <Text style={styles.alertTextBold}>24 hours</Text> may result in{" "}
                <Text style={styles.alertTextBold}>account suspension</Text>.
              </Text>
            </View>
          </View>

          {/* ── PRODUCT CARD ── */}
          <View style={styles.productCard}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.productImagePlaceholder}>
                <Icon name="inventory-2" size={32} color="#ccc" />
              </View>
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {product || "Rental Item"}
              </Text>
              <Text style={styles.productMeta}>
                <Text style={styles.metaLabel}>Renter: </Text>
                <Text style={styles.metaValue}>{renterName || "N/A"}</Text>
              </Text>
              <Text style={styles.productMeta}>
                <Text style={styles.metaLabel}>Date: </Text>
                <Text style={styles.metaValue}>{formatDate(bookingDate)}</Text>
              </Text>
            </View>
          </View>

          {/* ── PRICING SECTION ── */}
          <View style={styles.pricingCard}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Rental Price:</Text>
              <Text style={styles.pricingValue}>
                {formatCurrency(rentalPrice)}
              </Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Admin Commission (30%):</Text>
              <Text style={styles.pricingValue}>
                {formatCurrency(commission)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.pricingRow}>
              <Text style={styles.totalLabel}>TOTAL AMOUNT DUE:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </View>

          {/* ── TIMER ── */}
          <View
            style={[styles.timerCard, isExpired && styles.timerCardExpired]}
          >
            <Icon
              name="hourglass-empty"
              size={20}
              color={isExpired ? "#999" : "#E74C3C"}
            />
            <Text
              style={[styles.timerLabel, isExpired && styles.timerLabelExpired]}
            >
              Time Remaining:
            </Text>
            <Text
              style={[styles.timerValue, isExpired && styles.timerValueExpired]}
            >
              {timeRemaining || "Calculating..."}
            </Text>
          </View>

          {/* ── BOOKING ID ── */}
          <Text style={styles.bookingId}>Booking ID: {bookingId}</Text>
        </Animated.View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#C0392B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  scroll: { flex: 1, backgroundColor: "#F4F4F4" },
  scrollContent: { padding: 16, paddingBottom: 40 },

  // Alert Card
  alertCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#C0392B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  alertHeader: {
    backgroundColor: "#C0392B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  alertIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1.2,
  },
  alertBody: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#E74C3C",
  },
  alertText: {
    fontSize: 13.5,
    color: "#C0392B",
    lineHeight: 20,
  },
  alertTextBold: {
    fontWeight: "700",
  },

  // Product Card
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  productImage: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  productImagePlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: { flex: 1 },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  productMeta: { fontSize: 13, color: "#555", marginBottom: 2 },
  metaLabel: { color: "#888" },
  metaValue: { fontWeight: "600", color: "#333" },

  // Pricing Card
  pricingCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  pricingLabel: { fontSize: 14, color: "#666" },
  pricingValue: { fontSize: 14, fontWeight: "600", color: "#333" },
  divider: {
    height: 1.5,
    backgroundColor: "#E74C3C",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C0392B",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#C0392B",
  },

  // Timer
  timerCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  timerCardExpired: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
  },
  timerLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#E74C3C",
  },
  timerLabelExpired: { color: "#999" },
  timerValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#C0392B",
    letterSpacing: 1.5,
  },
  timerValueExpired: { color: "#999" },

  // Status
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statusText: {
    fontSize: 13,
    color: "#555",
    flex: 1,
  },

  // Booking ID
  bookingId: {
    textAlign: "center",
    fontSize: 11,
    color: "#bbb",
    fontFamily: "monospace",
    marginTop: 4,
  },
});
