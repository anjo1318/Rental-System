import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  Dimensions 
} from "react-native";

const { width } = Dimensions.get("window");

export default function ItemImages({ images }) {
  const scrollRef = useRef();
  const [activeIndex, setActiveIndex] = useState(0);

  // Parse JSON string to array
  let imageArray = [];

try {
  if (images && images.length > 0) {
    const parsed = JSON.parse(images[0]);

    if (Array.isArray(parsed)) {
      imageArray = parsed.map(url =>
        url.replace(/^http:\/\//, "https://").replace(/\\+$/, "")
      );
    }
  }
} catch (e) {
  console.warn("Error parsing images:", e);
  imageArray = [];
}


  const onScroll = (event) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / width);
    if (slide !== activeIndex) {
      setActiveIndex(slide);
    }
  };

  return (
    <View style={styles.imageContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
       {imageArray.length > 0 ? (
  imageArray.map((imgUrl, index) => (
    <View key={index} style={styles.imageWrapper}>
      <Image
        source={{ uri: imgUrl || "https://via.placeholder.com/400x300" }}
        style={styles.image}
      />
    </View>
  ))
) : (
  <View style={styles.imageWrapper}>
    <Image
      source={{ uri: "https://via.placeholder.com/400x300" }}
      style={styles.image}
    />
  </View>
)}

      </ScrollView>

      {/* Dot Indicators */}
      <View style={styles.dotsContainer}>
        {imageArray.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { opacity: index === activeIndex ? 1 : 0.3 }
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    marginBottom: 10,
    borderRadius: 0,      // optional: remove rounded corners if you want true edge-to-edge
  overflow: "hidden",
  backgroundColor: "#EDEDED",
  },
  imageWrapper: {
  width: width,
  height: 280,
  backgroundColor: "#EDEDED",
  overflow: "hidden",
},

image: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},


  dotsContainer: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    height: 8,
    width: 8,
    backgroundColor: "#FFF",
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
