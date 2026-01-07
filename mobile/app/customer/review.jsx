import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const reviews = [
  {
    id: 1,
    name: "Alex Martin",
    rating: 5,
    comment:
      "The Phone 13 Pro delivers powerful performance, stunning visuals with its ProMotion display, and excellent camera features in a sleek, durable design.",
  },
  {
    id: 2,
    name: "Jasmin",
    rating: 4,
    comment:
      "The Phone 13 Pro delivers powerful performance, stunning visuals with its ProMotion display, and excellent camera features in a sleek, durable design.",
  },
  {
    id: 3,
    name: "Kenneth",
    rating: 4,
    comment:
      "The Phone 13 Pro delivers powerful performance, stunning visuals with its ProMotion display, and excellent camera features in a sleek, durable design.",
  },
];

export default function Reviews() {
  return (
    <ScrollView>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>5.0 ⭐ Reviews (108+)</Text>
      </View>

      {/* Reviews */}
      {reviews.map((item) => (
        <View key={item.id} style={styles.reviewCard}>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Icon name="person" size={20} color="#777" />
            </View>

            <View style={styles.content}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.verified}>Verified</Text>
              </View>

              <View style={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    name="star"
                    size={16}
                    color={i < item.rating ? "#FFC107" : "#E0E0E0"}
                  />
                ))}
              </View>

              <Text style={styles.comment}>{item.comment}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  reviewCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },

  verified: {
    fontSize: 12,
    color: "#888",
  },

  stars: {
    flexDirection: "row",
    marginVertical: 4,
  },

  comment: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
});
