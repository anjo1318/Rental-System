import React from "react";
import { View, Text, StyleSheet, Dimensions, Pressable, StatusBar } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { RFValue } from "react-native-responsive-fontsize";

const { width, height } = Dimensions.get("window");

// 📏 Responsive constants
const ICON_BOX = Math.round(width * 0.10);   // 12% of screen width
const ICON_SIZE = Math.round(width * 0.06);  // 6% of screen width
const PADDING_H = Math.round(width * 0.04);  // horizontal padding scales
const MARGIN_TOP = Math.round(height * 0.06); // top margin scales
const HEADER_HEIGHT = Math.max(60, Math.round(height * 0.12)); // adaptive header height
const PADDING_V = Math.round(height * 0.015); // vertical padding scales

export default function ProfileHeader() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Status bar settings */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFF"
        translucent={false}
      />

      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.profileContainer}>
          {/* left: back button */}
          <View style={styles.iconBox}>
            <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconPress}>
              <Icon name="arrow-back" size={ICON_SIZE} color="#000" />
            </Pressable>
          </View>

          {/* center: page title */}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.pageName}
          >
            Time Duration
          </Text>

          {/* right: placeholder to keep title centered */}
          <View style={styles.iconBox} />
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
    paddingVertical: PADDING_V,
    height: HEADER_HEIGHT,
    justifyContent: "center",
    paddingTop: MARGIN_TOP,
    paddingHorizontal: PADDING_H,
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: ICON_BOX,
    alignItems: "center",
    justifyContent: "center",
  },

  iconPress: {
    padding: width * 0.015, // scales with screen width
    borderRadius: 6,
  },

  pageName: {
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    flex: 1,
    fontSize: RFValue(16, 680), // responsive font size
    paddingHorizontal: 6,
  },
});
