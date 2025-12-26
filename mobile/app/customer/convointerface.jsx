import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const HEADER_HEIGHT = Math.max(64, Math.round(height * 0.09));
const ICON_BOX = Math.round(width * 0.10);
const ICON_SIZE = Math.max(20, Math.round(width * 0.06));
const TITLE_FONT = Math.max(16, Math.round(width * 0.045));
const PADDING_H = Math.round(width * 0.02);
const MARGIN_TOP = Math.round(height * 0.02);

export default function Chat() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Status bar */}
      <StatusBar barStyle="light-content" backgroundColor="#057474" />

      {/* ✅ HEADER COPIED FROM message.jsx */}
      <View style={[styles.headerWrapper, { height: HEADER_HEIGHT }]}>
        <View style={styles.topBackground}>
          <View
            style={[
              styles.profileContainer,
              { paddingHorizontal: PADDING_H, marginTop: MARGIN_TOP },
            ]}
          >
            {/* Back */}
            <View style={[styles.iconBox, { width: ICON_BOX }]}>
              <Pressable
                onPress={() => router.back()}
                hitSlop={10}
                style={styles.iconPress}
              >
                <Icon name="arrow-back" size={ICON_SIZE} color="#FFF" />
              </Pressable>
            </View>

            {/* Title */}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.pageName, { fontSize: TITLE_FONT }]}
            >
              Kenneth Senorin
            </Text>

            {/* Placeholder */}
            <View style={[styles.iconBox, { width: ICON_BOX }]} />
          </View>
        </View>
      </View>

      {/* Chat Body */}
      <ScrollView contentContainerStyle={styles.chatBody}>
        {/* Buyer */}
        <View style={[styles.bubble, styles.buyerBubble]}>
          <Text style={styles.buyerText}>
            Good morning Ma'am/Sir, I have a concern about the device you've posted.
          </Text>
        </View>

        {/* Seller */}
        <View style={[styles.bubble, styles.sellerBubble]}>
          <Text style={styles.sellerText}>
            Yah sure Sir, what is your concern?
          </Text>
        </View>

        {/* Buyer with image */}
        <View style={[styles.bubble, styles.buyerBubble]}>
          <Image
            source={{ uri: "https://i.imgur.com/Wv2XG9P.png" }}
            style={styles.productImage}
          />
          <Text style={styles.buyerText}>
            About this device, may I know how long you have had the device since
            you purchased it?
          </Text>
        </View>

        {/* Seller */}
        <View style={[styles.bubble, styles.sellerBubble]}>
          <Text style={styles.sellerText}>
            It has been almost 1 year since I bought it.
          </Text>
        </View>
      </ScrollView>

      {/* Input */}
      <View style={styles.inputWrapper}>
        <Pressable>
          <Icon name="add-circle-outline" size={26} color="#057474" />
        </Pressable>

        <TextInput
          placeholder="Type a message..."
          style={styles.input}
          placeholderTextColor="#999"
        />

        <Pressable>
          <Icon name="send" size={24} color="#057474" />
        </Pressable>
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
    backgroundColor: "#007F7F",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  topBackground: {
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
  },

  iconPress: {
    padding: width * 0.02,
  },

  pageName: {
    color: "#FFF",
    textAlign: "center",
    flex: 1,
    fontWeight: "600",
    top: 10,
  },

  chatBody: {
    padding: 16,
    paddingBottom: 90,
  },

  bubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  buyerBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#78CFCB",
  },

  sellerBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  buyerText: {
    color: "#000",
  },

  sellerText: {
    color: "#000",
  },

  productImage: {
    width: 245,
    height: 120,
    borderRadius: 6,
    marginBottom: 6,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  input: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    fontSize: 14,
  },
});
