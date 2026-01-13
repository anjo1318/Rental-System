import { Stack } from "expo-router";
import ScreenWrapper from "./components/screenwrapper"; // adjust path

export default function Layout() {
  return (
    <ScreenWrapper backgroundColor="#007F7F">
      <Stack screenOptions={{ headerShown: false }} />
    </ScreenWrapper>
  );
}
