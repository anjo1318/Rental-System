import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const scale = SCREEN_WIDTH / 375;
const INPUT_ICON_SIZE = Math.round(24 * scale);
const INPUT_FONT_SIZE = Math.max(13, Math.round(14 * scale));
const INPUT_BAR_PADDING_V = Math.max(10, Math.round(SCREEN_HEIGHT * 0.018));

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

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* MESSAGE LIST */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.chatBody}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon
              name="chat-bubble-outline"
              size={Math.round(SCREEN_WIDTH * 0.17)}
              color="#ccc"
            />
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

      {/* INPUT BAR — no longer absolute, sits naturally at bottom */}
      <View
        style={[
          styles.inputWrapper,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom : INPUT_BAR_PADDING_V,
            paddingTop: INPUT_BAR_PADDING_V,
          },
        ]}
      >
        <Pressable disabled hitSlop={8}>
          <Icon name="add-circle-outline" size={INPUT_ICON_SIZE} color="#057474" />
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
          hitSlop={8}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#057474" />
          ) : (
            <Icon
              name="send"
              size={INPUT_ICON_SIZE}
              color={newMessage.trim() ? "#057474" : "#ccc"}
            />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  chatBody: {
    padding: Math.round(SCREEN_WIDTH * 0.04),
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Math.round(SCREEN_HEIGHT * 0.08),
  },

  emptyText: {
    fontSize: Math.max(15, Math.round(SCREEN_WIDTH * 0.045)),
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },

  emptySubtext: {
    fontSize: Math.max(12, Math.round(SCREEN_WIDTH * 0.035)),
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: Math.round(SCREEN_WIDTH * 0.08),
  },

  bubble: {
    maxWidth: "80%",
    padding: Math.round(SCREEN_WIDTH * 0.026),
    borderRadius: 8,
    marginBottom: Math.round(SCREEN_HEIGHT * 0.012),
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
    fontSize: INPUT_FONT_SIZE,
  },

  sellerText: {
    color: "#000",
    fontSize: INPUT_FONT_SIZE,
  },

  timestamp: {
    fontSize: Math.max(10, Math.round(SCREEN_WIDTH * 0.028)),
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },

  // No more position: absolute — input bar is part of the normal flow
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Math.round(SCREEN_WIDTH * 0.03),
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },

  input: {
    flex: 1,
    marginHorizontal: Math.round(SCREEN_WIDTH * 0.025),
    paddingVertical: Math.round(SCREEN_HEIGHT * 0.013),
    paddingHorizontal: Math.round(SCREEN_WIDTH * 0.03),
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    fontSize: INPUT_FONT_SIZE,
    maxHeight: Math.round(SCREEN_HEIGHT * 0.13),
    borderWidth: 1,
    borderColor: "#057474",
  },
});
