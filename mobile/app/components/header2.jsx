import React from "react";
import { View, Text, StyleSheet, Dimensions, Pressable, StatusBar, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const HEADER_HEIGHT = Math.max(64, Math.round(height * 0.10));
const ICON_BOX = Math.round(width * 0.10);
const ICON_SIZE = Math.max(20, Math.round(width * 0.07));
const TITLE_FONT = Math.max(16, Math.round(width * 0.045));
const PADDING_H = Math.round(width * 0.02);
const MARGIN_TOP = Math.round(height * 0.04);

export default function Header({ title = "Title", backgroundColor = "#057474" }) {
  const router = useRouter();

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={backgroundColor}
        translucent={false}
      />

      <View style={[styles.headerWrapper, { height: HEADER_HEIGHT, backgroundColor }]}>
        <View
          style={[
            styles.profileContainer,
            { paddingHorizontal: PADDING_H, marginTop: MARGIN_TOP },
          ]}
        >
          {/* Back Button */}
          <View style={[styles.iconBox, { width: ICON_BOX }]}>
           <Pressable
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/customer/home"); // change fallback if needed
                }
              }}
              hitSlop={10}
              style={styles.iconPress}
            >
              <Icon name="arrow-back" size={ICON_SIZE} color="#fff" />
            </Pressable>
          </View>

          {/* Title */}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.pageName, { fontSize: TITLE_FONT }]}
          >
            {title}
          </Text>
            
          {/* Notification */}
          <View style={styles.notificationWrapper}>
            <Pressable onPress={() => router.push("customer/notifications")}>
             <Image
               source={require("../../assets/images/notification.png")}
               style={{ width: 37, height: 37 }}
               resizeMode="contain"
             />
            </Pressable>
          </View>

        </View>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  headerWrapper: {
    width: "100%",
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
    padding: width * 0.02,
    borderRadius: 6,
  },
  pageName: {
    color: "#fff",
    textAlign: "center",
    flex: 1,
    fontWeight: "600",
  },
notificationWrapper: {
    marginLeft: "auto", 
    marginRight: 5,
    marginTop: 7,
    position: "relative",
    borderRadius: (width * 0.12) / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  badge: {
    position: "absolute",
    right: -4,
    top: 1,
    backgroundColor: "#007F7F",
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },

  badgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "700",
    
  },

});
