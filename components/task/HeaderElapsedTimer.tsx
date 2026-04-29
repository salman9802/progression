import { useTimer } from "@/contexts/timer";
import React from "react";
import { Text } from "react-native";

const HeaderElapsedTimer = () => {
  const { elapsedSeconds } = useTimer();

  const minutes = React.useMemo(
    () =>
      Math.floor(elapsedSeconds / 60)
        .toString()
        .padStart(2, "0"),
    [elapsedSeconds],
  );
  const seconds = React.useMemo(
    () => (elapsedSeconds % 60).toString().padStart(2, "0"),
    [elapsedSeconds],
  );

  return (
    <Text className="text-xl font-semibold font-mono text-neutral-900 dark:text-neutral-50">
      {minutes}:{seconds}
    </Text>
  );
};

export default HeaderElapsedTimer;
