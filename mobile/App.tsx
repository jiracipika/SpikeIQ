import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PlayerLookupScreen } from "@/screens/PlayerLookupScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <PlayerLookupScreen />
    </SafeAreaProvider>
  );
}
