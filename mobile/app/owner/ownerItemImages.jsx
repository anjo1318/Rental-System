import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  Image, 
  ScrollView, 
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
            <View key={index} style={styles.imageWrapper}>
              <Image
                source={{ uri: imgUrl }}
                style={styles.image}
              />
            </View>
          ))
        ) : (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: "https://via.placeholder.com/400x300?text=No+Image" }}
              style={styles.image}
            />
          </View>
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
