import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { usePathname } from "expo-router";
import CustomerBottomNav from '../components/CustomerBottomNav';

const { width, height } = Dimensions.get("window");

// ✅ Responsive constants derived from screen size
const HEADER_HEIGHT = Math.max(64, Math.round(height * 0.09));
const ICON_BOX = Math.round(width * 0.10);
const ICON_SIZE = Math.max(20, Math.round(width * 0.06));
const TITLE_FONT = Math.max(16, Math.round(width * 0.045));
const PADDING_H = Math.round(width * 0.02);
const MARGIN_TOP = Math.round(height * 0.02);

export default function Messages() {
  const router = useRouter();
  const pathname = usePathname();

  const messages = [
    { id: 1, name: "Kenneth Senorin", text: "Good morning Ma'am/Sir, I have a concern about ...", date: "Today" },
    { id: 2, name: "John Michael Sevilla", text: "Good morning Ma'am/Sir, I have a concern about ...", date: "Friday" },
    { id: 3, name: "John Jori", text: "Good morning Ma'am/Sir, I have a concern about ...", date: "8/29" },
    { id: 4, name: "John Jori Noverario", text: "Good morning Ma'am/Sir, I have a concern about ...", date: "8/29" },
    { id: 5, name: "John Jori Noverario", text: "Good morning Ma'am/Sir, I have a concern about ...", date: "8/29" },
  ];

  return (
    <View style={styles.container}>
      <CustomerBottomNav/>

      {/* Status bar */}
      <StatusBar barStyle="light-content" backgroundColor="#057474" />

      {/* Header */}
      <View style={[styles.headerWrapper, { height: HEADER_HEIGHT }]}>
        <View style={styles.topBackground}>
          <View
            style={[
              styles.profileContainer,
              { paddingHorizontal: PADDING_H, marginTop: MARGIN_TOP },
            ]}
          >
            <View style={[styles.iconBox, { width: ICON_BOX }]}>
              <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconPress}>
                <Icon name="arrow-back" size={ICON_SIZE} color="#FFF" />
              </Pressable>
            </View>

            <Text style={[styles.pageName, { fontSize: TITLE_FONT }]}>Messages</Text>

            <View style={[styles.iconBox, { width: ICON_BOX }]} />
          </View>
        </View>
      </View>

      {/* 🔽 Messages List (ADDED ONLY THIS PART) */}
      <ScrollView contentContainerStyle={styles.messageList}>
        {messages.map((item) => (
          <Pressable
            key={item.id}
            style={styles.messageItem}
            onPress={() => router.push("/customer/convointerface")}
          >
            <View style={styles.bottomDivider} />
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=3" }}
              style={styles.avatar}
            />
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text style={styles.sender}>{item.name}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <Text style={styles.preview} numberOfLines={1}>
                {item.text}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#E6E1D6" 
  },

  headerWrapper: {
    width: "100%",
    backgroundColor: "#007F7F",
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
    top: 10,
    left: 10,
  },

  iconPress: { 
    padding: width * 0.02 
  },

  topBackground: {
    backgroundColor: "#007F7F",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  pageName: {
    color: "#FFF",
    textAlign: "center",
    flex: 1,
    fontWeight: "600",
    top: 10,
  },

  /* 🔽 Message styles */
  messageList: {
    paddingBottom: height * 0.12,
  },

  messageItem: {
    flexDirection: "row",
    backgroundColor: "#E6E1D6",
    padding: 20,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },

  bottomDivider: {
    position: "absolute",
    bottom: 0,
    left: 68,
    right: 0,
    height: 1,
    backgroundColor: "#05747480",
  },


  messageContent: {
    flex: 1,
  },

  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sender: {
    fontWeight: "600",
    color: "#000",
  },

  date: {
    fontSize: 12,
    color: "#888",
  },

  preview: {
    color: "#666",
    marginTop: 4,
  },

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

  navButton: { alignItems: "center", flex: 1 },

  navText: {
    fontWeight: "bold",
    fontSize: width * 0.03,
    marginTop: height * 0.005,
  },
});
