import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { RFValue } from "react-native-responsive-fontsize";
import { usePathname } from "expo-router";

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

      {/* 🔽 ADDED CONTENT BELOW HEADER (ONLY THIS PART) */}
      <View style={styles.contentWrapper}>
        <View style={styles.card}>
          {/* Device info */}
          <View style={styles.deviceRow}>
            <Image
              source={{ uri: "https://i.imgur.com/Wv2XG9P.png" }}
              style={styles.deviceImage}
            />
            <Text style={styles.deviceName}>Acer Aspire Predator</Text>
          </View>

          {/* Timer */}
          <View style={styles.timerRow}>
            {[
              { value: "03", label: "Days" },
              { value: "12", label: "Hours" },
              { value: "55", label: "Minutes" },
              { value: "17", label: "Seconds" },
            ].map((item, index) => (
              <View key={index} style={styles.timeBox}>
                <Text style={styles.timeValue}>{item.value}</Text>
                <Text style={styles.timeLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Dates */}
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>
              Start : November 13, 2025
            </Text>
            <Text style={styles.dateText}>
              Ended : November 18, 2025
            </Text>
          </View>
        </View>
      </View>

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

  /* Header (unchanged) */
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

  /* 🔽 NEW CONTENT STYLES */
  contentWrapper: {
    padding: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },

  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  deviceImage: {
    width: 60,
    height: 40,
    resizeMode: "contain",
    marginRight: 12,
  },

  deviceName: {
    fontSize: RFValue(14),
    fontWeight: "600",
  },

  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
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
    fontSize: RFValue(10),
    color: "#777",
  },

  dateRow: {
    marginTop: 4,
  },

  dateText: {
    fontSize: RFValue(11),
    color: "#555",
  },

  /* Bottom Nav (unchanged) */
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
