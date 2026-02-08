import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Keyboard,
  Platform,
  useWindowDimensions,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const INPUT_CONTAINER_LIFT = 40;
const INPUT_BAR_HEIGHT = 90; // Approximate height of input bar

export default function ChatBody({
  messages,
  currentUserId,
  newMessage,
  setNewMessage,
  handleSendMessage,
  sending,
}) {
  const scrollViewRef = useRef();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate the total space needed at the bottom
  // When keyboard is visible, only add space for the input bar itself plus a small buffer
  const inputBarTotalHeight = keyboardHeight > 0 
    ? INPUT_BAR_HEIGHT + 20 // Just enough space for the input bar when keyboard is open
    : INPUT_BAR_HEIGHT;

  return (
    <View style={{ flex: 1 }}>
      {/* MESSAGE LIST */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.chatBody,
          {
            paddingBottom: inputBarTotalHeight,
          }
        ]}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="chat-bubble-outline" size={70} color="#ccc" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start the conversation by sending a message
            </Text>
          </View>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <View
                key={message.id}
                style={[
                  styles.bubble,
                  isOwn ? styles.buyerBubble : styles.sellerBubble,
                ]}
              >
                <Text style={isOwn ? styles.buyerText : styles.sellerText}>
                  {message.content}
                </Text>

                <Text style={styles.timestamp}>
                  {formatTime(message.createdAt)}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* INPUT BAR */}
      <View
        style={[
          styles.inputWrapper,
          {
            bottom:
              keyboardHeight > 0
                ? Math.max(0, keyboardHeight - insets.bottom) +
                  INPUT_CONTAINER_LIFT
                : 0,

            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        <Pressable disabled>
          <Icon name="add-circle-outline" size={26} color="#057474" />
        </Pressable>

        <TextInput
          placeholder="Type a message..."
          style={styles.input}
          placeholderTextColor="#999"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
          editable={!sending}
        />

        <Pressable
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#057474" />
          ) : (
            <Icon
              name="send"
              size={24}
              color={newMessage.trim() ? "#057474" : "#ccc"}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chatBody: {
    padding: 16,
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },

  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
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
    fontSize: 15,
  },

  sellerText: {
    color: "#000",
    fontSize: 15,
  },

  timestamp: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
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
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#057474",
  },
});
