import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const { width, height } = Dimensions.get("window");

// 📏 Responsive constants
const HEADER_HEIGHT = Math.max(64, Math.round(height * 0.08)); // at least 64px
const ICON_BOX = Math.round(width * 0.10); // 12% of width for icon slots
const ICON_SIZE = Math.max(20, Math.round(width * 0.06)); // icons scale with width
const TITLE_FONT = Math.max(16, Math.round(width * 0.045)); // title font adapts to width
const PADDING_H = Math.round(width * 0.02); // horizontal padding scales
const MARGIN_TOP = Math.round(height * 0.025); // top margin scales
const PADDING_V = Math.min(Math.round(height * 0.0), 8); // vertical padding with cap

export default function ProfileHeader() {
  const router = useRouter();
  const [avatar, setAvatar] = useState(null);

  const pickImage = async () => {
    // Ask for permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "You need to allow access to your gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // allow crop
      aspect: [1, 1], // square crop
      quality: 1, // best quality
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri); // save the selected image URI
    }
  };

  return (
    <View style={styles.container}>
      {/* Status bar settings */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

      {/* Header */}
      <View
        style={[
          styles.headerWrapper,
          {
            height: HEADER_HEIGHT,
            paddingHorizontal: PADDING_H,
            paddingVertical: PADDING_V,
          },
        ]}
      >
        <View style={[styles.profileContainer, { marginTop: MARGIN_TOP }]}>
          {/* left: back button */}
          <View style={[styles.iconBox, { width: ICON_BOX }]}>
            <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconPress}>
              <Icon name="arrow-back" size={ICON_SIZE} color="#000" />
            </Pressable>
          </View>

          {/* center: page title */}
          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.pageName, { fontSize: TITLE_FONT }]}>
            Profile
          </Text>

          {/* right: placeholder */}
          <View style={[styles.iconBox, { width: ICON_BOX }]} />
        </View>
      </View>

      {/* 👇 Outside header */}
      <View style={styles.userContainer}>
        {/* Whole row: avatar + texts + edit profile */}
        <View style={styles.userRow}>
          {/* Avatar + texts */}
          <Pressable onPress={pickImage} style={styles.userPressable}>
            <View style={styles.avatarWrapper}>
              <Image
                source={avatar ? { uri: avatar } : require("../../assets/images/avatar.png")}
                style={styles.avatar}
              />
              {/* Camera PNG overlay */}
              <Pressable style={styles.cameraButton} onPress={pickImage}>
                <Image
                  source={require("../../assets/images/camera_icon.png")}
                  style={styles.cameraImage}
                  resizeMode="contain"
                />
              </Pressable>
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.username}>Marco Polo</Text>
              <Text style={styles.gmail}>marcopolo@gmail.com</Text>
            </View>
          </Pressable>

          {/* Edit button on far right */}
          <Pressable style={styles.editRow} onPress={() => router.push("customer/edit_profile")}>
            <Icon name="border-color" size={15} color="#7e7e7e" />
            <Text style={styles.editText}>Edit Profile</Text>
          </Pressable>
        </View>
      </View>

      <View>
        <Text style={styles.generalText}>General</Text>
          <Pressable style={styles.historyRow} onPress={() => router.push("customer/edit_profile")}>
            <View style={styles.historyPhotoWrapper}>
              <Image
                source={avatar ? { uri: avatar } : require("../../assets/images/history.png")}
                style={styles.historyAvatar}
              />
            </View>
            <Text style={styles.historyText}>History of Rent</Text>
            <Icon name="arrow-forward-ios" style={styles.historyArrowIcon} />
          </Pressable>
      </View>    

       <View>
          <Pressable style={styles.notifRow} onPress={() => router.push("customer/edit_profile")}>
            <View style={styles.notifPhotoWrapper}>
              <Image
                source={avatar ? { uri: avatar } : require("../../assets/images/notifications.png")}
                style={styles.notifAvatar}
              />
            </View>
            <Text style={styles.notifText}>Notifications</Text>
            <Icon name="arrow-forward-ios" style={styles.notifArrowIcon} />
          </Pressable>
      </View>    

       <View>
        <Text style={styles.supportText}>Support</Text>
          <Pressable style={styles.settingsRow} onPress={() => router.push("customer/edit_profile")}>
            <View style={styles.settingsPhotoWrapper}>
              <Image
                source={avatar ? { uri: avatar } : require("../../assets/images/settings.png")}
                style={styles.settingsAvatar}
              />
            </View>
            <Text style={styles.settingsText}>Settings</Text>
            <Icon name="arrow-forward-ios" style={styles.settingsArrowIcon} />
          </Pressable>
      </View>    

      <View>
          <Pressable style={styles.privacyRow} onPress={() => router.push("customer/edit_profile")}>
            <View style={styles.privacyPhotoWrapper}>
              <Image
                source={avatar ? { uri: avatar } : require("../../assets/images/privacy.png")}
                style={styles.privacyAvatar}
              />
            </View>
            <Text style={styles.privacyText}>Privacy Poilcy</Text>
            <Icon name="arrow-forward-ios" style={styles.privacyArrowIcon} />
          </Pressable>
      </View>    

      <View>
          <Pressable style={styles.chatRow} onPress={() => router.push("customer/edit_profile")}>
            <View style={styles.chatPhotoWrapper}>
              <Image
                source={avatar ? { uri: avatar } : require("../../assets/images/chat.png")}
                style={styles.chatAvatar}
              />
            </View>
            <Text style={styles.chatText}>Chat with EzRent</Text>
            <Icon name="arrow-forward-ios" style={styles.chatArrowIcon} />
          </Pressable>
      </View>    

      <View style={styles.outContainer}>
          <Pressable style={styles.outRow} onPress={() => router.push("customer/edit_profile")}>
            <View style={styles.outPhotoWrapper}>
              <Image
                source={avatar ? { uri: avatar } : require("../../assets/images/logout.png")}
                style={styles.outAvatar}
              />
            </View>
            <Text style={styles.outText}>Log out</Text>
            <Icon name="arrow-forward-ios" style={styles.outArrowIcon} />
          </Pressable>
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
    borderBottomWidth: 3,
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
    padding: width * 0.015,
    borderRadius: 6,
  },

  pageName: {
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    flex: 1,
    marginRight: 10,
  },

  userContainer: {
    padding: 13,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // keeps edit button on far right
  },

  userPressable: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // takes available space so Edit stays right
  },

  avatarWrapper: {
    position: "relative", // ensures overlay can position inside
    width: width * 0.15,
    height: width * 0.15,
    overflow: "visible", // allow half-outside badge to show
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: (width * 0.15) / 2,
    borderWidth: 2,
    borderColor: "#ccc",
  },

cameraButton: {
  position: "absolute",
  bottom: -(width * 0.001), // half outside vertically
  right: -(width * 0.001), // half outside horizontally
  width: width * 0.06, // fixed width for the circle
  height: width * 0.06, // fixed height for the circle
  backgroundColor: "#fff", // background still white
  borderRadius: (width * 0.07) / 2, // perfectly round
  borderWidth: 1,
  borderColor: "#eee",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  zIndex: 10,
  elevation: 6,
},

cameraImage: {
  width: "110%",
  height: "110%",
  resizeMode: "cover", // makes image cover the container
},

  nameContainer: {
    marginLeft: width * 0.015,
    justifyContent: "center",
  },

  username: {
    fontWeight: "bold",
    fontSize: width * 0.033,
    marginTop: 15,
  },

  gmail: {
    fontSize: width * 0.032,
    marginBottom: 15,
    paddingVertical: 2,
  },

  editRow: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  editText: {
    marginLeft: 4,
    fontSize: width * 0.030,
    color: "#7f7f7f",
  },

  generalText: {
    marginLeft: 13,
    fontSize: width * 0.05,
    fontWeight: "700",
    color: "#000",

  },
  historyPhotoWrapper: {
    position: "relative", // ensures overlay can position inside
    width: width * 0.09,
    height: width * 0.09,
    overflow: "visible", // allow half-outside badge to show
    marginLeft: 10,
    marginTop: 12,
  },

  historyAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: (width * 0.15) / 2,
    borderWidth: 2,
    borderColor: "#ccc",
  },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  historyText: {
    marginLeft: 10,
    fontSize: width * 0.037,
    color: "#313131",
    marginTop: 10,
    fontWeight: "600",
  },
  historyArrowIcon: {
    fontSize: 15, // 👈 or use width * 0.03 for responsive
    color: "#7e7e7e",
    marginLeft: 170, // space from the text
    marginTop: 10,
  },
  notifPhotoWrapper: {
    position: "relative", // ensures overlay can position inside
    width: width * 0.09,
    height: width * 0.09,
    overflow: "visible", // allow half-outside badge to show
    marginLeft: 10,
    marginTop: 12,
  },

  notifAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: (width * 0.15) / 2,
    borderWidth: 2,
    borderColor: "#ccc",
  },

  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  notifText: {
    marginLeft: 10,
    fontSize: width * 0.037,
    color: "#313131",
    marginTop: 10,
    fontWeight: "600",
  },
  notifArrowIcon: {
    fontSize: 15, // 👈 or use width * 0.03 for responsive
    color: "#7e7e7e",
    marginLeft: 183, // space from the text
    marginTop: 10,
  },

  supportText: {
    marginLeft: 13,
    fontSize: width * 0.05,
    fontWeight: "700",
    color: "#000",
    marginTop: 15,
  },
  settingsPhotoWrapper: {
    position: "relative", // ensures overlay can position inside
    width: width * 0.09,
    height: width * 0.09,
    overflow: "visible", // allow half-outside badge to show
    marginLeft: 10,
    marginTop: 12,
  },

  settingsAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: (width * 0.15) / 2,
    borderWidth: 2,
    borderColor: "#ccc",
  },

  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  settingsText: {
    marginLeft: 10,
    fontSize: width * 0.037,
    color: "#313131",
    marginTop: 10,
    fontWeight: "600",
  },
  settingsArrowIcon: {
    fontSize: 15, // 👈 or use width * 0.03 for responsive
    color: "#7e7e7e",
    marginLeft: 210, // space from the text
    marginTop: 10,
  },

  privacyPhotoWrapper: {
    position: "relative", // ensures overlay can position inside
    width: width * 0.09,
    height: width * 0.09,
    overflow: "visible", // allow half-outside badge to show
    marginLeft: 10,
    marginTop: 12,
  },

  privacyAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: (width * 0.15) / 2,
    borderWidth: 2,
    borderColor: "#ccc",
  },

  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  privacyText: {
    marginLeft: 10,
    fontSize: width * 0.037,
    color: "#313131",
    marginTop: 10,
    fontWeight: "600",
  },
  privacyArrowIcon: {
    fontSize: 15, // 👈 or use width * 0.03 for responsive
    color: "#7e7e7e",
    marginLeft: 174, // space from the text
    marginTop: 10,
  },

  chatPhotoWrapper: {
    position: "relative", // ensures overlay can position inside
    width: width * 0.09,
    height: width * 0.09,
    overflow: "visible", // allow half-outside badge to show
    marginLeft: 10,
    marginTop: 12,
  },

  chatAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: (width * 0.15) / 2,
    borderWidth: 2,
    borderColor: "#ccc",
  },

  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  chatText: {
    marginLeft: 10,
    fontSize: width * 0.037,
    color: "#313131",
    marginTop: 10,
    fontWeight: "600",
  },
  chatArrowIcon: {
    fontSize: 15, // 👈 or use width * 0.03 for responsive
    color: "#7e7e7e",
    marginLeft: 156, // space from the text
    marginTop: 10,
  },

  outContainer: {
    marginTop: 200
  },

   outPhotoWrapper: {
    position: "relative", // ensures overlay can position inside
    width: width * 0.09,
    height: width * 0.09,
    overflow: "visible", // allow half-outside badge to show
    marginLeft: 10,
  },

  outAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: (width * 0.15) / 2,
    borderWidth: 2,
    borderColor: "#ccc",
  },

  outRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  outText: {
    marginLeft: 10,
    fontSize: width * 0.037,
    color: "#313131",
    marginTop: 10,
    fontWeight: "600",
  },
  outArrowIcon: {
    fontSize: 15, // 👈 or use width * 0.03 for responsive
    color: "#7e7e7e",
    marginLeft: 208, // space from the text
    marginTop: 10,
  },


  navButton: { 
    alignItems: "center", 
    flex: 1,
    zIndex: 10, 
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
