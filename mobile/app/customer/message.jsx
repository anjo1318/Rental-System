import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

// ✅ Responsive constants derived from screen size
const HEADER_HEIGHT = Math.max(64, Math.round(height * 0.09)); // at least 64px
const ICON_BOX = Math.round(width * 0.10); // 12% of width for icon slots
const ICON_SIZE = Math.max(20, Math.round(width * 0.06)); // icons scale with width
const TITLE_FONT = Math.max(16, Math.round(width * 0.045)); // title font adapts to width
const PADDING_H = Math.round(width * 0.02); // horizontal padding scales
const MARGIN_TOP = Math.round(height * 0.02); // top margin scales

export default function Messages() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Status bar */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="#057474"
        translucent={false}
      />

      {/* Header */}
      <View style={[styles.headerWrapper, { height: HEADER_HEIGHT }]}>
        <View style={[styles.profileContainer, { paddingHorizontal: PADDING_H, marginTop: MARGIN_TOP }]}>
          {/* Left: back button */}
          <View style={[styles.iconBox, { width: ICON_BOX }]}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={styles.iconPress}
            >
              <Icon name="arrow-back" size={ICON_SIZE} color="#FFF" />
            </Pressable>
          </View>

          {/* Center: page title */}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.pageName, { fontSize: TITLE_FONT }]}
          >
            Messages
          </Text>

          {/* Right: placeholder (keeps title centered) */}
          <View style={[styles.iconBox, { width: ICON_BOX }]} />
        </View>
      </View>

      {/* Body */}
      <View style={styles.bodyWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent}></ScrollView>
      </View>
      {/* 🔹 Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { name: "Home", icon: "home", route: "customer/home" },
          { name: "Book", icon: "shopping-cart", route: "customer/book" },
          { name: "Message", icon: "mail", route: "customer/message" },
          { name: "Time", icon: "schedule", route: "customer/time" },
        ].map((navItem, index) => (
          <Pressable
            key={index}
            style={styles.navButton}
            hitSlop={10}
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
  container: {
    flex: 1,
    backgroundColor: "#E6E1D6",
  },

  headerWrapper: {
    width: "100%",
    backgroundColor: "#057474",
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
    justifyContent: "center",
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
    padding: width * 0.02, // tap area scales with width
    borderRadius: 6,
  },

  pageName: {
    color: "#FFF",
    textAlign: "center",
    flex: 1,
    paddingHorizontal: width * 0.015, // keeps spacing consistent
    fontWeight: "600",
  },

  bodyWrapper: {
    flex: 1,
    paddingHorizontal: width * 0.04, // responsive padding
    paddingBottom: height * 0.04, // scales bottom padding
    justifyContent: "space-between",
  },

  scrollContent: {
    flexGrow: 1,
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
    flex: 1,
    zIndex: 10, 
  },
    
  navText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.03,
    marginTop: height * 0.005,
  },

  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});
