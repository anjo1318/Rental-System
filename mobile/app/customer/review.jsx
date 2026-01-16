import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,Pressable,} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import Header from "../components/header";
import ScreenWrapper from "../components/screenwrapper";

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
    id: 3,
    name: "Kenneth",
    rating: 4,
    comment:
      "The Phone 13 Pro delivers powerful performance, stunning visuals with its ProMotion display, and excellent camera features in a sleek, durable design.",
  },
];

export default function Reviews() {
  const router = useRouter();

  return (
     <ScreenWrapper>
        <Header
          title="Reviews"
          backgroundColor="#007F7F"
        />
      
      <ScrollView>
      {/* Reviews */}
      <View style={styles.titleRow}>
      <Text style={styles.titleText}>5.0 ⭐ </Text>
      <Text style={styles.titleText2}> Reviews (108+)</Text>
      </View>
      {reviews.map((item) => (
        <View key={item.id} style={styles.reviewCard}>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Icon name="person" size={20} color="#777" />
            </View>

            <View style={styles.content}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.date}>Yesterday</Text>
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

      <Pressable style={styles.bookButton}>
  <Text style={styles.bookText}>Book Now</Text>
</Pressable>
    </ScrollView>
      </ScreenWrapper>
  );
}


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F5F5" 
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
    padding: 20,
  },
  titleText: {
    fontSize: 12,
  },
   titleText2: {
    fontSize: 14,
    fontWeight: 700,
  },
  reviewCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#05747480", 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
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

  date: {
    fontSize: 12,
    color: "#888",
  },

  stars: {
    flexDirection: "row",
    marginVertical: 4,
  },

  comment: {
    width: "290",
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
    textAlign: "justify",
    right: 40,
    top: 5,
    
  },

  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#057474',
    marginHorizontal: 90,
    top: 200,
  },
  bookText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },

});
