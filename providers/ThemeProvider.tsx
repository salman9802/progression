// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { StatusBar } from "expo-status-bar";
// import { useColorScheme } from "nativewind";
// import React from "react";
// import { Appearance, View } from "react-native";

// interface ThemeProviderProps {
//   children: React.ReactNode;
// }

// type TTheme = "light" | "dark";
// type TThemeType = "light" | "dark" | "system";

// type ThemeContextType = {
//   theme: TThemeType;
//   //   toggleTheme: () => void;
//   updatePreference: (theme: TThemeType) => any;
// };

// export const ThemeContext = React.createContext<ThemeContextType>({
//   theme: "system",
//   //   toggleTheme: () => {},
//   updatePreference: () => {},
// });

// export const ThemeProvider = ({ children }: ThemeProviderProps) => {
//   const { setColorScheme } = useColorScheme();
//   //   const [currentTheme, setCurrentTheme] = React.useState<TTheme>(
//   //     Appearance.getColorScheme() ? Appearance.getColorScheme() : "light"
//   //   );

//   const [preference, setPreference] = React.useState<TThemeType>("system");
//   const [systemTheme, setSystemTheme] = React.useState(
//     Appearance.getColorScheme()
//   );

//   /* const toggleTheme = () => {
//     const newTheme = currentTheme === "light" ? "dark" : "light";
//     setCurrentTheme(newTheme);
//     setColorScheme(newTheme);
//   }; */

//   // Load saved preference
//   React.useEffect(() => {
//     (async () => {
//       const saved = await AsyncStorage.getItem("theme");
//       if (saved) setPreference(saved as TThemeType);
//     })();
//   }, []);

//   const updatePreference = async (theme: TThemeType) => {
//     // if (theme === preference) return;
//     // setPreference(theme);
//     // setColorScheme(theme);
//     setPreference(theme);
//     await AsyncStorage.setItem("theme", theme);
//   };

//   // Listen to system changes
//   React.useEffect(() => {
//     const sub = Appearance.addChangeListener(({ colorScheme }) => {
//       setSystemTheme(colorScheme);
//     });
//     return () => sub.remove();
//   }, []);

//   // Apply theme to NativeWind
//   React.useEffect(() => {
//     const appliedTheme = preference === "system" ? systemTheme : preference;

//     if (appliedTheme) {
//       setColorScheme(appliedTheme);
//     }
//   }, [preference, systemTheme]);

//   return (
//     <ThemeContext.Provider value={{ theme: preference, updatePreference }}>
//       <StatusBar style={preference === "dark" ? "light" : "dark"} />
//       <View /* style={themes[currentTheme]} */ className="flex-1">
//         {children}
//       </View>
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => {
//   const context = React.useContext(ThemeContext);
//   if (!context) {
//     throw new Error("useTheme must be used within a ThemeProvider");
//   }
//   return context;
// };

import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React from "react";
import { Appearance, View } from "react-native";
import colors from "tailwindcss/colors";

type TTheme = "light" | "dark";
type TThemeType = "light" | "dark" | "system";

type ThemeContextType = {
  theme: TThemeType;
  resolvedTheme: TTheme;
  updatePreference: (theme: TThemeType) => Promise<void>;
};

export const ThemeContext = React.createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  updatePreference: async () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { setColorScheme } = useColorScheme();

  const [preference, setPreference] = React.useState<TThemeType>("system");
  const [systemTheme, setSystemTheme] = React.useState<TTheme>(
    Appearance.getColorScheme() ?? "light",
  );

  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load saved preference
  React.useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("theme");
      if (saved) setPreference(saved as TThemeType);
      setIsLoaded(true);
    })();
  }, []);

  // Listen to system changes
  React.useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme ?? "light");
    });
    return () => sub.remove();
  }, []);

  const resolvedTheme: TTheme =
    preference === "system" ? systemTheme : preference;

  // Apply to NativeWind
  React.useEffect(() => {
    setColorScheme(resolvedTheme);
  }, [resolvedTheme]);

  const updatePreference = async (theme: TThemeType) => {
    setPreference(theme);
    await AsyncStorage.setItem("theme", theme);
  };

  // Optional: prevent flash before loading
  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider
      value={{ theme: preference, resolvedTheme, updatePreference }}
    >
      <StatusBar
        style={resolvedTheme === "dark" ? "light" : "dark"}
        translucent={false}
        // backgroundColor="transparent"
        backgroundColor={
          resolvedTheme === "light" ? colors.neutral[100] : colors.neutral[900]
        }
      />
      <View className="flex-1">{children}</View>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => React.useContext(ThemeContext);
