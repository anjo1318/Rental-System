import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { RFValue } from "react-native-responsive-fontsize";

const { width, height } = Dimensions.get("window");

// 📏 Responsive constants (bounded so large screens don't get huge gaps)
const HEADER_HEIGHT = Math.max(64, Math.round(height * 0.08));
const ICON_BOX = Math.round(width * 0.10);
const ICON_SIZE = Math.max(20, Math.round(width * 0.06));
const TITLE_FONT = Math.max(16, Math.round(width * 0.045));
const PADDING_H = Math.round(width * 0.02);
const MARGIN_TOP = Math.round(height * 0.025);
const PADDING_V = Math.min(Math.round(height * 0.0), 8);

export default function TimeDuration() {
  const router = useRouter();

  // ✅ Define navigation handler here
  const handleNavigation = (path) => {
    router.push(`/${path}`);
  };

  return (
    <View style={styles.container}>
      {/* Status bar settings */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFF"
        translucent={false}
      />

      {/* Header */}
      <View
        style={[
          styles.headerWrapper,
          { height: HEADER_HEIGHT, paddingHorizontal: PADDING_H, paddingVertical: PADDING_V },
        ]}
      >
        <View style={styles.topBackground}>
        <View style={[styles.profileContainer, { marginTop: MARGIN_TOP }]}>
          {/* left: back button */}
          <View style={[styles.iconBox, { width: ICON_BOX }]}>
            <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconPress}>
              <Icon name="arrow-back" size={ICON_SIZE} color="#000" />
            </Pressable>
          </View>

          {/* center: page title */}
          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.pageName, { fontSize: TITLE_FONT }]}>
            Time Duration
          </Text>

          {/* right: placeholder for layout balance */}
           <View style={[styles.iconBox, { width: ICON_BOX }]} />
          </View>
        </View>
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
    backgroundColor:"#007F7F",
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
    color: "#000",
    textAlign: "center",
    flex: 1,
    paddingHorizontal: 6,
  },

  topBackground: {
    backgroundColor:"#007F7F",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
});
