import React from "react";
import { View } from "react-native";
import HeaderElapsedTimer from "../task/HeaderElapsedTimer";
import HeaderTimerButton from "../task/HeaderTimerButton";

const HeaderRight = () => {
  return (
    <View className="flex-row gap-4 items-center mr-4">
      <HeaderElapsedTimer />
      <HeaderTimerButton />
    </View>
  );
};

export default HeaderRight;
