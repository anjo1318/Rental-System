import { StyleSheet, Dimensions,Platform } from "react-native";

const { width, height } = Dimensions.get("window");

const CARD_MARGIN = 16;
const CARD_WIDTH = (width - 16 * 2 - CARD_MARGIN) / 2;
const CARD_HEIGHT = height * 0.45;

const styles = StyleSheet.create({

  searchContainer: {
     flex: 1, 
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007F7F",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginVertical: 10,
    height: 45,
    backgroundColor: "#fff",
    top: 10,
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

  topBackground: {
    backgroundColor:"#007F7F",
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  searchRow: {
  flexDirection: "row",
  alignItems: "center",
},

  backButton: {
  padding: 4,
  top: 10,
  justifyContent: "center",
  alignItems: "center",
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
    borderWidth: 1,
    borderColor: "#007F7F99",
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
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#057474",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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

const filterStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backdrop: {
    flex: 1,
  },
  modal: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "70%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  placeholder: {
    color: "#999",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  doneButton: {
    marginTop: 100,
    backgroundColor: "#007F7F",
    paddingVertical: 12,
    borderRadius: 10,
    width: "70%",
    alignItems: "center",
    alignSelf: "center",
  },
  doneText: {
    color: "#fff",
    fontWeight: "600",
  },
});


export { styles, filterStyles };
