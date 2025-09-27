import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Image } from "react-native"; 

const { width, height } = Dimensions.get("window");

// ✅ Responsive constants derived from screen size
const HEADER_HEIGHT = Math.max(64, Math.round(height * 0.08)); // at least 64px
const ICON_BOX = Math.round(width * 0.10); // 12% of width for icon slots
const ICON_SIZE = Math.max(20, Math.round(width * 0.06)); // icons scale with width
const TITLE_FONT = Math.max(16, Math.round(width * 0.045)); // title font adapts to width
const PADDING_H = Math.round(width * 0.02); // horizontal padding scales
const MARGIN_TOP = Math.round(height * 0.02); // top margin scales

export default function Messages() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Status bar */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="#E6E1D6"
        translucent={false}
      />

      {/* Header */}
      <View style={[styles.headerWrapper, { height: HEADER_HEIGHT }]}>
        <View style={[styles.profileContainer, { paddingHorizontal: PADDING_H, marginTop: MARGIN_TOP }]}>
          {/* Left: back button */}
          <View style={[styles.iconBox, { width: ICON_BOX }]}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={styles.iconPress}
            >
              <Icon name="arrow-back" size={ICON_SIZE} color="#000" />
            </Pressable>
          </View>

          {/* Center: page title */}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.pageName, { fontSize: TITLE_FONT }]}
          >
            Notifications
          </Text>

          {/* Right: placeholder (keeps title centered) */}
          <View style={[styles.iconBox, { width: ICON_BOX }]} />
        </View>
      </View>

      {/* Body */}
      <View style={styles.bodyWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

       <Text style={styles.sectionTitle}>Today</Text>

       <View style={styles.infoContainer}>
          {/* 🔹 First container */}
          <View style={styles.box}>
            <View style={styles.row}>
              <Image
                source={require("../../assets/images/success.png")} 
                style={styles.imagePlaceholder}
                resizeMode="contain"
              />
              <View style={styles.textBlock}>
                <View style={styles.rowBetween}>
                  <Text style={styles.title}>Renting Successful</Text>
                  <Text style={styles.time}>10:00 am</Text>
                </View>
                <Text style={styles.description}>
                  Your device is ready! Check your email for the booking and instructions. Safe travels!
                </Text>
              </View>
            </View>
          </View>

          {/* 🔹 First container with 2 images */}
          <View style={[styles.box2]}>
            <View style={styles.row}>
              <Image
                source={require("../../assets/images/check.png")} // first image
                style={styles.imagePlaceholder2}
                resizeMode="contain"
              />
              <Image
                source={require("../../assets/images/payment.png")} // second image
                style={styles.imagePlaceholder3}
                resizeMode="contain"
              />
              <View style={styles.textBlock2}>
                <View style={styles.rowBetween}>
                  <Text style={styles.title2}>Payment Notification</Text>
                  <Text style={styles.time}>10:00 am</Text>
                </View>
                <Text style={styles.description2}>
                  Your payment was processed successfully! Enjoy using it.
                </Text>
              </View>
            </View>
          </View>

          {/* 🔹 Third container */}
          <View style={styles.box}>
            <View style={styles.row}>
              <Image
                source={require("../../assets/images/rent_time.png")} // ✅ put your .png file here
                style={styles.imagePlaceholder}
                resizeMode="contain"
              />
              <View style={styles.textBlock}>
                <View style={styles.rowBetween}>
                  <Text style={styles.title}>Rent Pickup/Drop-off time</Text>
                  <Text style={styles.time}>9:00 am</Text>
                </View>
                <Text style={styles.description}>
                 Pickup time confirmed! See you at [Time] for your rental. Drop-off Time Confirmed! Please 
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle2}>Previous</Text>

           {/* 🔹 Second container with 2 images */}
          <View style={[styles.box2]}>
            <View style={styles.row}>
              <Image
                source={require("../../assets/images/check.png")} // first image
                style={styles.imagePlaceholder2}
                resizeMode="contain"
              />
              <Image
                source={require("../../assets/images/warning.png")} // second image
                style={styles.imagePlaceholder3}
                resizeMode="contain"
              />
              <View style={styles.textBlock2}>
                <View style={styles.rowBetween}>
                  <Text style={styles.title2}>Late Returning Warning</Text>
                  <Text style={styles.time}>Yesterday</Text>
                </View>
                <Text style={styles.description2}>
                  Late Return Alert! Please return the car as soon as possible to avoid extra charges.
                </Text>
              </View>
            </View>
          </View>


        </View>
        </ScrollView>
      </View>
     
      {/* 🔹 Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { name: "Home", icon: "home", route: "customer/home" },
          { name: "Book", icon: "shopping-cart", route: "customer/book" },
          { name: "Message", icon: "mail", route: "customer/message" },
          { name: "Time", icon: "schedule", route: "customer/time" },
        ].map((navItem, index) => (
          <Pressable
            key={index}
            style={styles.navButton}
            hitSlop={10}
            onPress={() => handleNavigation(navItem.route)}
          >
            <Icon name={navItem.icon} size={24} color="#fff" />
            <Text style={styles.navText}>{navItem.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  headerWrapper: {
    width: "100%",
    backgroundColor: "#FFF",
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
    justifyContent: "center",
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconBox: {
    alignItems: "center",
    justifyContent: "center",
  },

  iconPress: {
    padding: width * 0.02, // tap area scales with width
    borderRadius: 6,
  },

  pageName: {
    color: "#000",
    textAlign: "center",
    flex: 1,
    paddingHorizontal: width * 0.015, // keeps spacing consistent
    fontWeight: "600",
  },

  bodyWrapper: {
    flex: 1,
    paddingBottom: height * 0.04, // scales bottom padding
    justifyContent: "space-between",
  },

  scrollContent: {
    flexGrow: 1,
  },

  sectionTitle: {
    fontWeight: "600",
    marginTop: 10,
    fontSize: 17,
    marginLeft: 20,
  },
  sectionTitle2: {
    fontWeight: "600",
    fontSize: 17,
    marginLeft: 20,
    paddingVertical: 10
   
  },


  box: {
    width: "100%",
    backgroundColor: "#fff",
    marginBottom: 15,
    paddingVertical: 15,
  },
   box2: {
    width: "100%",
    marginBottom: 15,
    paddingVertical: 15,
  },


  row: {
    flexDirection: "row",
    alignItems: "flex-start",  // 🔹 align image + text block at top
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  textBlock: {
    flex: 1,
    marginTop: 10,
    marginRight: 10,
  },
  textBlock2: {
    flex: 1,
    marginRight: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginRight: 20,
  },
  title2: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },

  time: {
    fontSize: 11,
    color: "#666",
  },

  description: {
    fontSize: 12,
    color: "#333",
    marginTop: 2,  // small gap under title
  },
  description2: {
    fontSize: 12,
    color: "#333",
    
  },
  imagePlaceholder: {
    width: 35,
    height: 35,
    margin: 15,           // keeps spacing inside the box
    flexShrink: 0,        // 🔹 prevents shrinking/stretching
    alignSelf: "flex-start", // 🔹 image always aligns at top
  
  },

  imagePlaceholder2: {
    width: 35,
    height: 35,
    marginLeft: 5,   // spacing between image(s) and text
    marginTop: 7,
  },

  imagePlaceholder3: {
    width: 35,
    height: 35,
    marginRight: 10,   // spacing between second image and text
    marginLeft: 7,     // spacing between first & second image
    marginTop: 7,
  },


  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: height * 0.015,
    backgroundColor: "#057474",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: { 
    alignItems: "center", 
    flex: 1,
    zIndex: 10, 
  },
    
  navText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.03,
    marginTop: height * 0.005,
  },

  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});
