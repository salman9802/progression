import React from "react";
import { View } from "react-native";

type SpinnerProps = {
  className?: string;
};

const Spinner = ({ className }: SpinnerProps) => {
  return (
    <View
      className={`size-16 animate-spin rounded-full border-4 border-gray-300 border-t-primary-500 ${className ?? ""}`}
    />
  );
};

export default Spinner;
