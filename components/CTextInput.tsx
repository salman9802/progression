import { useTheme } from "@/providers/ThemeProvider";
import React from "react";
import { StyleSheet, TextInput } from "react-native";
import colors from "tailwindcss/colors";

type CTextInputProps = React.ComponentProps<typeof TextInput> & {};

const CTextInput = ({ className, ...props }: CTextInputProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <TextInput
      className={`w-full px-6 py-3 rounded-md bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 ${className}`}
      placeholderTextColor={
        resolvedTheme === "light" ? colors.neutral[600] : colors.neutral[500]
      }
      {...props}
    />
  );
};

export default CTextInput;

const styles = StyleSheet.create({});
