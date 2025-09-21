import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, Pressable, StatusBar,Image,Alert, } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { RFValue } from "react-native-responsive-fontsize";
import * as ImagePicker from "expo-image-picker";

const { width, height } = Dimensions.get("window");

// 📏 Responsive constants (bounded so large screens don't get huge gaps)
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
      allowsEditing: true,       // allow crop
      aspect: [1, 1],            // square crop
      quality: 1,                // best quality
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri); // save the selected image URI
    }
  };
return (
  <View style={styles.container}>
    {/* Status bar settings */}
    <StatusBar
      barStyle="dark-content"
      backgroundColor="#FFF"
      translucent={false}
    />

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
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={styles.iconPress}
          >
            <Icon name="arrow-back" size={ICON_SIZE} color="#000" />
          </Pressable>
        </View>

        {/* center: page title */}
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.pageName, { fontSize: TITLE_FONT }]}
        >
          Profile
        </Text>

        {/* right: placeholder */}
        <View style={[styles.iconBox, { width: ICON_BOX }]} />
      </View>
    </View>

    {/* 👇 Outside header */}
    <View style={styles.userContainer}>
      <Pressable onPress={pickImage} style={styles.userPressable}>
        <Image
          source={
            avatar
              ? { uri: avatar }
              : require("../../assets/images/avatar.png")
          }
          style={styles.avatar}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.username}>Marco Polo</Text>
        </View>
        
      </Pressable>
    </View>
  </View>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E1D6",
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
    padding: 16,
    marginTop: 10,
  },
  userPressable: {
    flexDirection: 'row',       
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: width * 0.04, 
  },
  avatar: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: (width * 0.25) / 2,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  username: {
    fontWeight: "bold", 
    fontSize: width * 0.04,
    marginBottom: 10,
  },

});
