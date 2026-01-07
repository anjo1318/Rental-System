import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
const { width, height } = Dimensions.get("window");

// 📏 Responsive constants
const HEADER_HEIGHT = Math.max(64, Math.round(height * 0.08));
const ICON_BOX = Math.round(width * 0.10);
const ICON_SIZE = Math.max(20, Math.round(width * 0.06));
const TITLE_FONT = Math.max(16, Math.round(width * 0.045));
const PADDING_H = Math.round(width * 0.02);
const MARGIN_TOP = Math.round(height * 0.025);
const PADDING_V = Math.min(Math.round(height * 0.0), 8);

export default function Profile() {
  const router = useRouter();
  const [avatar, setAvatar] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [OWNER_ID, setOwnerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setOwnerId(user.id);
        console.log('✅ User loaded from storage in Profile:', user);
        setIsLoading(false);
        return user.id;
      } else {
        console.log('❌ No user data found, redirecting to login');
        router.replace('/login');
        return null;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      router.replace('/login');
      return null;
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "You need to allow access to your gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleNavigation = (route) => {
    router.push(route);
  };

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('user');
              router.replace('/first');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Show loading screen while data is being loaded
  if (isLoading || !currentUser) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        <View style={styles.topBackground}>

          
        <View style={[styles.profileContainer, { marginTop: MARGIN_TOP }]}>
          <View style={[styles.iconBox, { width: ICON_BOX }]}>
            <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconPress}>
              <Icon name="arrow-back" size={ICON_SIZE} color="#000" />
            </Pressable>
          </View>

          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.pageName, { fontSize: TITLE_FONT }]}>
            Profile
          </Text>

            <View style={[styles.iconBox, { width: ICON_BOX }]} />
          </View>
        </View>
      </View>

      {/* User Profile Section */}
      <View style={styles.userContainer}>
        <View style={styles.userRow}>
          <Pressable onPress={pickImage} style={styles.userPressable}>
            <View style={styles.avatarWrapper}>
              <Image
                source={avatar ? { uri: avatar } : require("../../assets/images/avatar.png")}
                style={styles.avatar}
              />
              <Pressable style={styles.cameraButton} onPress={pickImage}>
                <Image
                  source={require("../../assets/images/camera_icon.png")}
                  style={styles.cameraImage}
                  resizeMode="contain"
                />
              </Pressable>
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.username}>{currentUser.firstName} {currentUser.lastName}</Text>
              <Text style={styles.gmail}>{currentUser.emailAddress}</Text>
            </View>
          </Pressable>

          <Pressable style={styles.editRow} onPress={() => router.push("customer/edit_profile")}>
            <Icon name="border-color" size={15} color="#7e7e7e" />
            <Text style={styles.editText}>Edit Profile</Text>
          </Pressable>
        </View>
      </View>

      {/* General Section */}
      <View style={styles.historyContainer}>
        <Text style={styles.generalText}>General</Text>
        <Pressable style={styles.historyRow} onPress={() => router.push("customer/history")}>
          <View style={styles.historyPhotoWrapper}>
            <Image
              source={require("../../assets/images/history.png")}
              style={styles.historyAvatar}
            />
          </View>
          <Text style={styles.historyText}>History of Rent</Text>
          <Icon name="arrow-forward-ios" style={styles.historyArrowIcon} />
        </Pressable>
      </View>    

      <View style={styles.notifContainer}>
        <Pressable style={styles.notifRow} onPress={() => router.push("customer/notifications")}>
          <View style={styles.notifPhotoWrapper}>
            <Image
              source={require("../../assets/images/notifications.png")}
              style={styles.notifAvatar}
            />
          </View>
          <Text style={styles.notifText}>Notifications</Text>
          <Icon name="arrow-forward-ios" style={styles.notifArrowIcon} />
        </Pressable>
      </View>    

      {/* Support Section */}
      <View style={styles.settingsContainer}>
        <Text style={styles.supportText}>Support</Text>
        <Pressable style={styles.settingsRow} onPress={() => router.push("customer/settings")}>
          <View style={styles.settingsPhotoWrapper}>
            <Image
              source={require("../../assets/images/settings.png")}
              style={styles.settingsAvatar}
            />
          </View>
          <Text style={styles.settingsText}>Settings</Text>
          <Icon name="arrow-forward-ios" style={styles.settingsArrowIcon} />
        </Pressable>
      </View>    

      <View style={styles.privacyContainer}>
        <Pressable style={styles.privacyRow} onPress={() => router.push("customer/privacy")}>
          <View style={styles.privacyPhotoWrapper}>
            <Image
              source={require("../../assets/images/privacy.png")}
              style={styles.privacyAvatar}
            />
          </View>
          <Text style={styles.privacyText}>Privacy Policy</Text>
          <Icon name="arrow-forward-ios" style={styles.privacyArrowIcon} />
        </Pressable>
      </View>    

      <View style={styles.chatContainer}>
        <Pressable style={styles.chatRow} onPress={() => router.push("customer/chat")}>
          <View style={styles.chatPhotoWrapper}>
            <Image
              source={require("../../assets/images/chat.png")}
              style={styles.chatAvatar}
            />
          </View>
          <Text style={styles.chatText}>Chat with EzRent</Text>
          <Icon name="arrow-forward-ios" style={styles.chatArrowIcon} />
        </Pressable>
      </View>    

      {/* Logout Section */}
      <View style={styles.outContainer}>
        <Pressable style={styles.outRow} onPress={handleLogout}>
          <Text style={styles.outText}>Log out</Text>
      
        </Pressable>
      </View>    

      {/* Bottom Navigation */}
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
            <Icon name={navItem.icon} size={24} color="#656565" />
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerWrapper: {
    width: "100%",
    borderBottomWidth: 3,
    borderBottomColor:"#007F7F",
    justifyContent: "center",
    backgroundColor:"#007F7F",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
   topBackground: {
    backgroundColor:"#007F7F",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  userContainer: {
    padding: 13,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  userPressable: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatarWrapper: {
    position: "relative",
    width: width * 0.15,
    height: width * 0.15,
    overflow: "visible",
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: (width * 0.15) / 2,
    borderColor: "transparent",
  },

  cameraButton: {
    position: "absolute",
    bottom: -(width * 0.001),
    right: -(width * 0.001),
    width: width * 0.06,
    height: width * 0.06,
    backgroundColor: "#fff",
    borderRadius: (width * 0.07) / 2,
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
    resizeMode: "cover",
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
    fontSize: width * 0.045,
    fontWeight: "700",
    color: "#000",
    marginBottom: 10,
  },

  historyContainer: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },

  historyPhotoWrapper: {
    position: "relative",
    width: width * 0.09,
    height: width * 0.09,
    overflow: "visible",
    marginLeft: 10,


  },

  historyAvatar: {
    width: "70%",
    height: "70%",
    marginLeft: 5,
    marginTop: 5,
  },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#CFE7E6", 
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  historyText: {
    marginLeft: 10,
    fontSize: width * 0.037,
    color: "#313131",
    fontWeight: "600",
    
  },

  historyArrowIcon: {
    fontSize: 15,
    color: "#7e7e7e",
    marginLeft: 155,
  },


  notifContainer: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },

  notifPhotoWrapper: {
    position: "relative",
    width: width * 0.09,
    height: width * 0.09,
    overflow: "visible",
    marginLeft: 10,
  },

  notifAvatar: {
    width: "70%",
    height: "75%",
    marginLeft: 5,
    marginTop: 5,
  },

  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#CFE7E6", 
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  notifText: {
    marginLeft: 10,
    fontSize: width * 0.037,
    color: "#313131",
    fontWeight: "600",
  },

  notifArrowIcon: {
    fontSize: 15,
    color: "#7e7e7e",
    marginLeft: 168,
  },

  supportText: {
    marginLeft: 13,
    fontSize: width * 0.045,
    fontWeight: "700",
    color: "#000",
    marginTop: 15,
    marginBottom: 10,
  },

  settingsContainer: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },

  settingsPhotoWrapper: {
    position: "relative",
    width: width * 0.09,
    height: width * 0.09,
    overflow: "visible",
    marginLeft: 10,
  },

  settingsAvatar: {
    width: "72%",
    height: "75%",
    marginLeft: 5,
    marginTop: 5,
  },

settingsRow: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 8,
  paddingVertical: 8,
  borderRadius: 15,
  borderWidth: 1,
  borderColor: "#CFE7E6", 
  backgroundColor: "#FFFFFF",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
},



  settingsText: {
    marginLeft: 10,
    fontSize: width * 0.037,
    color: "#313131",
    fontWeight: "600",
  },

  settingsArrowIcon: {
    fontSize: 15,
    color: "#7e7e7e",
    marginLeft: 195,
    marginTop: 5,
  },

  privacyContainer: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  privacyPhotoWrapper: {
    position: "relative",
    width: width * 0.09,
    height: width * 0.09,
    overflow: "visible",
    marginLeft: 10,
  },

  privacyAvatar: {
    width: "70%",
    height: "75%",
    marginLeft: 5,
    marginTop: 5,
  },

  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#CFE7E6", 
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  privacyText: {
    marginLeft: 10,
    fontSize: width * 0.037,
    color: "#313131",
    fontWeight: "600",
  },

  privacyArrowIcon: {
    fontSize: 15,
    color: "#7e7e7e",
    marginLeft: 159,
    marginTop: 5,
  },

  chatContainer: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  chatPhotoWrapper: {
    position: "relative",
    width: width * 0.09,
    height: width * 0.09,
    overflow: "visible",
    marginLeft: 10,
  },

  chatAvatar: {
    width: "70%",
    height: "75%",
    marginLeft: 5,
    marginTop: 5,
  },

  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#CFE7E6", 
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  chatText: {
    marginLeft: 10,
    fontSize: width * 0.037,
    color: "#313131",
    fontWeight: "600",
  },

  chatArrowIcon: {
    fontSize: 15,
    color: "#7e7e7e",
    marginLeft: 141,
    marginTop: 5,
  },

  outContainer: {
    width: "92%",
    marginTop: 105,
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#057474", 
  },

  outPhotoWrapper: {
    position: "relative",
    width: width * 0.09,
    height: width * 0.09,
    overflow: "visible",
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
    marginTop: 1,
    fontWeight: "600",
    
  },

  outArrowIcon: {
    fontSize: 15,
    color: "#7e7e7e",
    marginLeft: 208,
    marginTop: 1,
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
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#00000040",
  },
    
  navText: {
    color: "#656565",
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