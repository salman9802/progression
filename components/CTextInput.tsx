import { useTheme } from "@/providers/ThemeProvider";
import React, { forwardRef } from "react";
import { StyleSheet, TextInput } from "react-native";
import colors from "tailwindcss/colors";

type CTextInputProps = React.ComponentPropsWithRef<typeof TextInput> & {
  // ref?: React.Ref<TextInput> | undefined;
};

// const CTextInput = ({ className, ref, ...props }: CTextInputProps) => {
//   const { resolvedTheme } = useTheme();

//   return (
//     <TextInput
//       ref={ref}
//       className={`w-full px-6 py-3 rounded-md bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 ${className}`}
//       placeholderTextColor={
//         resolvedTheme === "light" ? colors.neutral[600] : colors.neutral[500]
//       }
//       {...props}
//     />
//   );
// };

const CTextInput = forwardRef<TextInput, CTextInputProps>((props, ref) => {
  const { className, ...remainingProps } = props;
  const { resolvedTheme } = useTheme();

  return (
    <TextInput
      ref={ref}
      className={`w-full px-6 py-3 rounded-md bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 ${className}`}
      placeholderTextColor={
        resolvedTheme === "light" ? colors.neutral[600] : colors.neutral[500]
      }
      {...remainingProps}
    />
  );
});

export default CTextInput;

const styles = StyleSheet.create({});
