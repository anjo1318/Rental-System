import { Stack } from "expo-router";
import { useEffect } from "react";
import usePushNotifications from './hooks/usePushNotifications' 

export default function Layout() {

  const { expoPushToken, notification } = usePushNotifications();

  useEffect(() => {
    if (expoPushToken) {
      console.log("✅ Expo Push Token:", expoPushToken);
      // TODO: Send to your backend if needed
    }
  }, [expoPushToken]);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
