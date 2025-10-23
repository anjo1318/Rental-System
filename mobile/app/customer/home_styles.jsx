import { StyleSheet, Dimensions,Platform } from "react-native";

const { width, height } = Dimensions.get("window");

const CARD_MARGIN = 16;
const CARD_WIDTH = (width - 16 * 2 - CARD_MARGIN) / 2;
const CARD_HEIGHT = height * 0.45;

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // avatar left, bell right
    padding: 16,
    marginTop: 16,
  },

  avatar: { 
    width: width * 0.1, 
    height: width * 0.1, 
    borderRadius: width * 0.05 
  },
  
  username: { 
    marginLeft: width * 0.03, 
    fontWeight: "bold", 
    fontSize: width * 0.04 
  },

  notificationWrapper: {
    marginLeft: "auto", 
    marginRight: 16,
    position: "relative",
    width: width * 0.10,
    height: width * 0.10,
    borderRadius: (width * 0.12) / 2,
    borderWidth: 2,
    borderColor: "#057474",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    right: -8,
    top: -8,
    backgroundColor: "#057474",
    borderRadius: 10,
    width: 17,
    height: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007F7F",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    height: 45,
    backgroundColor: "#fff",
  },
  leftIcon: { 
    marginRight: 8 
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },
  rightIcon: { 
    marginLeft: 8 
  },

  sectionTitle: {
    fontWeight: "bold",
    fontSize: width * 0.045,
    marginLeft: width * 0.04,
    paddingVertical: height * 0.025,
  },

  featuredCard: {
    width: width * 0.65,
    height: height * 0.30,
    borderRadius: width * 0.03,
    marginLeft: width * 0.04,
    overflow: "hidden",
  },
  featuredImage: { 
    width: "100%", 
    height: "100%", 
    resizeMode: "cover" 
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#fff",
    borderRadius: width * 0.05,
    borderWidth: .1,
    overflow: "hidden",
    marginBottom: width * 0.04,
  },

  upperHalf: {
    flex: 0.9,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E6E1D6",
  },
  itemImage: {
    width: "100%",
    height: "95%",
    resizeMode: "cover",
  },
  lowerHalf: {
    flex: 1.1,
    flexDirection: "column",
    justifyContent: "space-between", // pushes elements apart
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
  },

  title: {
    fontWeight: "bold",
    fontSize: width * 0.04,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  ratingValue: {
    fontSize: width * 0.035,
    color: "#555",
    marginRight: 4,
  },
  starIcon: {
    fontSize: width * 0.035,
    color: "#f5a623",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",   // ✅ center icon with multi-line text
    marginLeft: -8,
    marginTop: 10,
  },

  iconContainer: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
  },

  location: {
    fontSize: width * 0.035,
    color: "#555",
    flexShrink: 1,
    flexWrap: "wrap",
  },

  price: {
    fontWeight: "bold",
    fontSize: width * 0.04,
    marginTop: 12,
  },
  availabilityBadge: {
    width: "100%",        // 🔥 makes it full width
    paddingVertical: 3,   // top & bottom spacing
    alignItems: "center", // center the text horizontally
    justifyContent: "center", // center vertically
    marginBottom: 6,
  },

  availabilityText: {
    color: "#fff",       // white text so it's readable on green/orange
    fontSize: 14,
    fontWeight: "400",
  },

  

  categoryButton: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderRadius: 20,
    backgroundColor: "transparent",
    marginLeft: width * 0.04,
  },
  activeCategory: { backgroundColor: "#007F7F" },
  categoryText: { fontSize: width * 0.035, color: "#555" },
  activeCategoryText: { color: "#fff", fontWeight: "bold" },
    
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#057474",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.08,
    paddingBottom: Platform.OS === "ios" ? height * 0.02 : 0,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 10,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.2)",
    zIndex: 99, // ✅ ensures it stays above other content
  },

  navButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  navIcon: {
    fontSize: Math.min(width * 0.06, 26),
    color: "#fff",
  },

  navText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: Math.min(width * 0.03, 13),
    marginTop: height * 0.004,
  },

 
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});

export default styles;