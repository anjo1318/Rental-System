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

export default function OwnerItemImages({ images }) {
  const scrollRef = useRef();
  const [activeIndex, setActiveIndex] = useState(0);

  // Parse images safely - handle different formats
  const imageArray = React.useMemo(() => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return [];
    }

    // If first element is already a URL string, use the array as-is
    if (typeof images[0] === 'string' && images[0].startsWith('http')) {
      return images;
    }

    // If first element is a JSON string, try to parse it
    if (typeof images[0] === 'string') {
      try {
        const parsed = JSON.parse(images[0]);
        return Array.isArray(parsed) ? parsed : [images[0]];
      } catch (e) {
        console.log("Failed to parse images, using as-is:", e);
        return images;
      }
    }

    return images;
  }, [images]);

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
            <Image
              key={index}
              source={{ uri: imgUrl }}
              style={styles.image}
            />
          ))
        ) : (
          <Image
            source={{ uri: "https://via.placeholder.com/400x300?text=No+Image" }}
            style={styles.image}
          />
        )}
      </ScrollView>

      {/* Dot Indicators - only show if there are multiple images */}
      {imageArray.length > 1 && (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: width - 32, // full width minus margins
    height: 280,
    resizeMode: "cover",
    marginRight: 0,
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