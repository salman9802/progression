// import BottomSheet from "@gorhom/bottom-sheet";
// import React from "react";
// import { TextInputProps, View } from "react-native";
// import CTextInput from "../CTextInput";

// type QuickAddTaskProps = TextInputProps & {
//   open: boolean;
// };

// const QuickAddTask = ({ open }: QuickAddTaskProps) => {
//   const bottomSheetRef = React.useRef<null | BottomSheet>(null);

//   const snapPoints = React.useMemo(() => ["25%", "50%"], []);

//   React.useEffect(() => {
//     if (open) bottomSheetRef.current?.expand();
//     else bottomSheetRef.current?.close();
//   }, [open]);

//   return (
//     <View>
//       <BottomSheet
//         ref={bottomSheetRef}
//         index={-1}
//         snapPoints={snapPoints}
//         enablePanDownToClose
//         keyboardBehavior="interactive"
//       >
//         <View className="p-8">
//           <CTextInput placeholder="Quick Add Task" />
//         </View>
//       </BottomSheet>
//     </View>
//   );
// };

// export default QuickAddTask;

import colors from "@/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInputProps,
  View,
} from "react-native";
import CTextInput from "../CTextInput";

type QuickAddTaskProps = TextInputProps;

export type QuickAddTaskRef = {
  open: () => void;
  close: () => void;
};

const QuickAddTask = forwardRef<QuickAddTaskRef, QuickAddTaskProps>(
  ({ ...inputProps }, ref) => {
    // const insets = useSafeAreaInsets();
    const sheetRef = useRef<BottomSheetModal>(null);

    const snapPoints = ["25%", "50%"];

    // expose open/close methods
    useImperativeHandle(ref, () => ({
      // open: () => sheetRef.current?.present(),
      // close: () => sheetRef.current?.dismiss(),

      open: () => setOpen(true),
      close: () => setOpen(false),
    }));

    // console.log("QuickAddTask re-render");
    // console.log("sheetRef.current", sheetRef.current);

    // return (
    //   <BottomSheetModal
    //     ref={sheetRef}
    //     snapPoints={snapPoints}
    //     keyboardBehavior="interactive"
    //     enablePanDownToClose
    //     index={0}
    //   >
    //     <View style={{ padding: 16 }}>
    //       <CTextInput {...inputProps} />
    //     </View>
    //   </BottomSheetModal>
    // );

    const [open, setOpen] = useState(false);

    const screenHeight = Dimensions.get("window").height;

    const translateY = useRef(new Animated.Value(screenHeight)).current;

    // const inputRef = useRef<TextInput>(null);
    // useEffect(() => {
    //   // console.log("inputRef", inputRef);
    //   const timeout = setTimeout(() => {
    //     inputRef.current?.focus();
    //   }, 500);

    //   return () => clearTimeout(timeout);
    // }, [open]);

    useEffect(() => {
      if (open) {
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }, [open]);

    return (
      <Modal
        visible={open}
        transparent
        //  animationType="slide"
        animationType="none"
      >
        {/* `Modal`'s do not avoid keyboard. Wrapping it's children in a <KeyboardAvoidingView />` component. */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={{
              paddingHorizontal: 8,
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
            {/* 👇 BACKDROP (tap outside to close) */}
            <Pressable
              // className="backdrop-blur-2xl"
              className="absolute inset-0"
              style={{ flex: 1 }}
              onPress={() => setOpen(false)}
            >
              <BlurView
                intensity={50}
                tint="dark" // "light" | "dark" | "default"
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
              />
            </Pressable>
            <Animated.View
              style={{
                transform: [{ translateY }],
                // backgroundColor: "white",
                padding: 16,
                // paddingBottom: 16 + insets.bottom,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
              className="relative bg-neutral-200 dark:bg-neutral-600"
            >
              <CTextInput /* ref={inputRef} */ {...inputProps} autoFocus />
              <Text className="absolute right-6 top-1/2 text-mono text-sm px-2 py-1 rounded-md bg-primary-300/10 text-primary-300">
                <Text>Enter</Text>
                <AntDesign name="enter" size={12} color={colors.primary[500]} />
              </Text>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  },
);

export default QuickAddTask;
