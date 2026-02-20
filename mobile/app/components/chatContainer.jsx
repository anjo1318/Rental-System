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



export default function ChatBody({
  messages,
  currentUserId,
  newMessage,
  setNewMessage,
  handleSendMessage,
  sending,
}) {
  const scrollViewRef = useRef();
  const insets = useSafeAreaInsets()
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { height: windowHeight } = useWindowDimensions();


  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

const showSub = Keyboard.addListener(showEvent, (e) => {
  setKeyboardHeight(e.endCoordinates.height);
});

const hideSub = Keyboard.addListener(hideEvent, () => {
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

 return (
<View style={{ flex: 1, paddingBottom: keyboardHeight > 0 ? keyboardHeight : insets.bottom }}>
      {/* MESSAGE LIST */}
      <ScrollView
  ref={scrollViewRef}
  style={{ flex: 1 }}
  contentContainerStyle={styles.chatBody}
  onContentSizeChange={() =>
    scrollViewRef.current?.scrollToEnd({ animated: true })
  }
  keyboardShouldPersistTaps="handled"
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
      style={styles.inputWrapper}
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
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 20,
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
  paddingVertical: 12,   // ⬅ adjustable
  minHeight: 64,         // ⬅ adjustable: prevents bar from collapsing
  backgroundColor: "#fff",
  borderTopWidth: 1,
  borderTopColor: "#ddd",
},
  input: {
  flex: 1,
  marginHorizontal: 10,
  paddingVertical: 12,      // ⬅ adjustable
  paddingHorizontal: 12,
  backgroundColor: "#F0F0F0",
  borderRadius: 20,
  fontSize: 14,
  minHeight: 44,            // ⬅ adjustable: prevents input from being too short
  maxHeight: 120,           // ⬅ adjustable: how tall multiline can grow
  borderWidth: 1,
  borderColor: "#057474",
  textAlignVertical: "center", // fixes Android vertical alignment
},
});