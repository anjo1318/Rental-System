import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function OwnerBottomNav({ role = "owner" }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const navItems = [
    { name: "Home", icon: "home", type: "material", route: "/owner/ownerHome" },
    {
      name: "Lists",
      icon: "format-list-bulleted",
      type: "material",
      route: "/owner/ownerListing",
    },
    {
      name: "Add New",
      icon: "plus",
      type: "community",
      route: "/owner/ownerAddItem",
      special: true,
    },
    {
      name: "Message",
      icon: "message-text-outline",
      type: "community",
      route: "/owner/ownerMessages",
    },
    {
      name: "Time",
      icon: "clock-outline",
      type: "community",
      route: "/owner/ownerTime",
    },
  ];

  const renderIcon = (item, isActive, size = 24) => {
    const color = isActive ? "#057474" : "#999";

    return item.type === "community" ? (
      <MaterialCommunityIcons name={item.icon} size={size} color={color} />
    ) : (
      <MaterialIcons name={item.icon} size={size} color={color} />
    );
  };

  return (
    <View
      style={[
        styles.bottomNav,
        {
          paddingBottom: insets.bottom - 20,
        },
      ]}
    >
      {navItems.map((item, index) => {
        const isActive = pathname.startsWith(item.route);

        // FLOATING ADD BUTTON
        if (item.special) {
          return (
            <Pressable
              key={index}
              style={styles.addNewButton}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.addNewCircle}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={32}
                  color="#057474"
                />
              </View>
              <Text style={styles.navText}>{item.name}</Text>
            </Pressable>
          );
        }

        // NORMAL TABS
  // NORMAL TABS
return (
  <Pressable
    key={index}
    style={styles.navButton}
    hitSlop={10}
    onPress={() => {
      if (!isActive) router.push(item.route);
    }}
  >
    <View
      style={[
        styles.tabContent,
        {
          transform: [{ translateY: isActive ? -7 : -7 }],
        },
      ]}
    >
      {renderIcon(item, isActive)}
      <Text
        style={[
          styles.navText,
          { color: isActive ? "#057474" : "#999" },
        ]}
      >
        {item.name}
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
    paddingVertical: 3,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#00000040",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 20,
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

  addNewButton: {
    alignItems: "center",
    flex: 1,
    top: -20,
  },
 
  addNewCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    borderWidth: 2,
    borderColor: "#057474",
  },
  tabContent: {
  alignItems: "center",
  justifyContent: "center",
},

});