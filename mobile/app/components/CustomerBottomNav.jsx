import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");

export default function CustomerBottomNav({ role = "customer" }) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = {
    customer: [
      { name: "Home", icon: "home", route: "/customer/home" },
      { name: "Book", icon: "shopping-cart", route: "/customer/book" },
      { name: "Message", icon: "mail", route: "/customer/message" },
      { name: "Time", icon: "schedule", route: "/customer/time" },
    ],
  };

  const currentNavItems = navItems[role] || navItems.customer;

  return (
    <View style={styles.bottomNav}>
      {currentNavItems.map((navItem, index) => {
        const isActive = pathname.startsWith(navItem.route);

        return (
          <Pressable
            key={index}
            style={styles.navButton}
            hitSlop={10}
            onPress={() => {
              if (!pathname.startsWith(navItem.route)) {
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
    zIndex: 1000,    // 🔥 stay above content
    elevation: 10,   // 🔥 Android
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