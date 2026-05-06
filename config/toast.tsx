// import { BaseToast, BaseToastProps } from "react-native-toast-message";
// import { View, Text } from "react-native";

// export const toastConfig = {
//   success: (props: BaseToastProps) => (
//     <BaseToast
//       {...props}
//       style={{ borderLeftWidth: 0, backgroundColor: "transparent" }}
//       contentContainerStyle={{ paddingHorizontal: 0 }}
//       text1Style={{ display: "none" }}
//       renderContent={() => (
//         <View className="bg-white dark:bg-neutral-800 px-4 py-3 rounded-xl">
//           <Text className="text-neutral-900 dark:text-neutral-100">
//             {props.text1}
//           </Text>
//         </View>
//       )}
//     />
//   ),
// };

import { Text, View } from "react-native";
import { BaseToast, ErrorToast } from "react-native-toast-message";
import colors from "tailwindcss/colors";

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        // borderLeftWidth: 0,
        // backgroundColor: "transparent",
        borderLeftColor: colors.green[500],
      }}
      contentContainerStyle={{ paddingHorizontal: 0 }}
      text1Style={{ paddingHorizontal: 24 }}
      text2Style={{ paddingHorizontal: 24 }}
      renderLeadingIcon={() => null}
      renderTrailingIcon={() => null}
      renderContent={() => (
        <View className="bg-white border-l-green-500 dark:bg-neutral-800 px-4 py-3 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700">
          <Text className="text-neutral-900 dark:text-neutral-100 font-medium">
            {props.text1}
          </Text>
          {props.text2 && (
            <Text className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              {props.text2}
            </Text>
          )}
        </View>
      )}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        // borderLeftColor: "transparent",
        // backgroundColor: "transparent",
        borderLeftColor: colors.red[500],
      }}
      contentContainerStyle={{ paddingHorizontal: 0 }}
      text1Style={{ paddingHorizontal: 24 }}
      renderContent={() => (
        <View className="bg-red-50 dark:bg-red-900/30 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800">
          <Text className="text-red-700 dark:text-red-300 font-medium">
            {props.text1}
          </Text>
        </View>
      )}
    />
  ),
};
