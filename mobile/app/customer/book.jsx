import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, Pressable, StatusBar } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

// ✅ Responsive constants (bounded so they don’t blow up on tablets or collapse on small screens)
const HEADER_HEIGHT = Math.min(Math.max(60, height * 0.09), 110); // min 60, max 110
const ICON_BOX = Math.max(40, width * 0.00); // min 40px
const ICON_SIZE = Math.max(20, width * 0.07); // min 20px
const TITLE_FONT = Math.max(16, Math.round(width * 0.045)); // adaptive title font
const BADGE_SIZE = Math.max(12, Math.round(width * 0.045)); // badge scales with width
const PADDING_H = Math.min(Math.max(7, width * 0.02), 20); // horizontal padding (min 12, max 28)
const MARGIN_TOP = Math.min(Math.round(height * 0.1), 20); // small top margin

export default function BookedItem() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Status bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

      {/* Header */}
      <View style={[styles.headerWrapper, { height: HEADER_HEIGHT, paddingTop: MARGIN_TOP }]}>
        <View style={[styles.profileContainer, { paddingHorizontal: PADDING_H }]}>
          {/* Left: back button */}
          <View style={[styles.iconBox, { width: ICON_BOX }]}>
            <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconPress}>
              <Icon name="arrow-back" size={ICON_SIZE} color="#000" />
            </Pressable>
          </View>

          {/* Center: page title */}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.pageName, { fontSize: TITLE_FONT }]}
          >
            Booked Item
          </Text>

          {/* Right: notification */}
          <View style={[styles.iconBox, { width: ICON_BOX }]}>
            <View
              style={[
                styles.notificationWrapper,
                {
                  width: ICON_BOX * 0.8,
                  height: ICON_BOX * 0.8,
                  borderRadius: (ICON_BOX * 0.8) / 2,
                },
              ]}
            >
              <Icon name="notifications-none" size={Math.round(ICON_SIZE * 0.9)} color="#057474" />
              <View
                style={[
                  styles.badge,
                  {
                    width: BADGE_SIZE,
                    height: BADGE_SIZE,
                    borderRadius: BADGE_SIZE / 2,
                    right: -BADGE_SIZE * 0.25,
                    top: -BADGE_SIZE * 0.25,
                  },
                ]}
              >
                <Text style={[styles.badgeText, { fontSize: BADGE_SIZE * 0.45 }]}>2</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Body */}
      <View style={styles.bodyWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent}></ScrollView>

        {/* Bottom buttons */}
        <View style={styles.bottomContainer}>
          <Pressable style={[styles.button, styles.deleteButton, { flex: 0, width: "30%" }]}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>

          <Pressable style={[styles.button, styles.proceedButton, { flex: 0, width: "60%" }]}>
            <Text style={styles.proceedText}>Proceed to Renting</Text>
          </Pressable>
        </View>
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
    backgroundColor: "#FFF",
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
    justifyContent: "center",
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // keeps title centered
    height: "100%",
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

  notificationWrapper: {
    position: "relative",
    borderWidth: 1.5,
    borderColor: "#057474",
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    position: "absolute",
    backgroundColor: "#057474",
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "white",
    fontWeight: "bold",
  },

  bodyWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 30,
    justifyContent: "space-between",
  },

  scrollContent: {
    flexGrow: 1,
  },

  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
  },

  deleteButton: {
    backgroundColor: "#FFF",
    borderColor: "#D40004",
    borderWidth: 0.7,
    borderRadius: 10,
  },

  proceedButton: {
    backgroundColor: "#057474",
    borderRadius: 10,
  },

  deleteText: {
    color: "#D40004",
    fontSize: 13,
  },

  proceedText: {
    color: "#FFF",
    fontSize: 13,
  },
});
