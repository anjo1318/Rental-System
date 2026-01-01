// utils/registerPushToken.js
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export async function registerPushToken() {
  if (!Device.isDevice) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  const platform = Device.osName?.toLowerCase();

  await axios.post('/api/push-token', {
    token,
    platform,
  });
}
