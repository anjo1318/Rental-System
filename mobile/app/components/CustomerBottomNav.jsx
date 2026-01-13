import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, } from "react-native";
import { useRouter, useSegments } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function CustomerBottomNav() {
  const router = useRouter();
  const segments = useSegments(); 
  const currentRoute = `/${segments.join("/")}`;
  const insets = useSafeAreaInsets();

  const navItems = [
    { name: "Home", icon: "home", route: "/customer/home" },
    { name: "Book", icon: "shopping-cart", route: "/customer/book" },
    { name: "Message", icon: "mail", route: "/customer/message" },
    { name: "Time", icon: "schedule", route: "/customer/time" },
  ];

  return (
    <View style={[styles.bottomNav,
        {
          paddingBottom: insets.bottom - 10, // ✅ sits ABOVE system navbar
        },
      ]}
      >
      {navItems.map((navItem) => {
        const isActive = currentRoute === navItem.route;
        return (
        <Pressable
          key={navItem.route}
          style={styles.navButton}
          onPress={() => {
            if (!isActive) {
              router.push(navItem.route);
            }
          }}
        >
          <View style={styles.iconContainer}>
            <Icon
              name={navItem.icon}
              size={24}
              color={isActive ? "#057474" : "#999"}
              style={{ transform: [{ translateY: isActive ? -5 : -3 }] }}
            />
            <Text
              style={[
                styles.navText,
                { color: isActive ? "#057474" : "#999", transform: [{ translateY: isActive ? -5 : -7 }] },
              ]}
            >
              {navItem.name}
            </Text>
          </View>
        </Pressable>

        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#00000040",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // ✅ isolated movement
  },
  navText: {
    fontWeight: "600",
    fontSize: Math.min(width * 0.03, 13),
    marginTop: height * 0.004,
  },
});
