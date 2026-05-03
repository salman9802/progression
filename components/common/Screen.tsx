import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = React.ComponentProps<typeof SafeAreaView>;

export default function Screen({ children }: ScreenProps) {
  return <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>;
}
