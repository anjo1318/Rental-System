import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, BackHandler } from "react-native";
import { useRouter, useSegments, useFocusEffect } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");

export default function CustomerBottomNav() {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = `/${segments.join("/")}`;

  const navItems = [
    { name: "Home", icon: "home", route: "/customer/home" },
    { name: "Book", icon: "shopping-cart", route: "/customer/book" },
    { name: "Message", icon: "mail", route: "/customer/message" },
    { name: "Time", icon: "schedule", route: "/customer/time" },
  ];

  // Handle Android back button - always go to home
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (currentRoute !== "/customer/home") {
          router.replace("/customer/home");
          return true; // Prevent default behavior
        }
        return false; // Let default behavior happen (exit app)
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      
      return () => subscription.remove(); // ✅ Use subscription.remove() instead
    }, [currentRoute, router])
  );

  return (
    <View style={styles.bottomNav}>
      {navItems.map((navItem) => {
        const isActive = currentRoute === navItem.route;
        return (
          <Pressable
            key={navItem.route}
            style={styles.navButton}
            onPress={() => {
              if (!isActive) {
                router.replace(navItem.route);
              }
            }}
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
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navText: {
    fontWeight: "600",
    fontSize: Math.min(width * 0.03, 13),
    marginTop: height * 0.004,
  },
});