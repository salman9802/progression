import { useTimer } from "@/contexts/timer";
import React from "react";
import { Text } from "react-native";

const HeaderElapsedTimer = () => {
  const { startTime } = useTimer();

  const [now, setNow] = React.useState(() => Date.now());

  let elapsedSeconds = startTime ? Math.floor((now - startTime) / 1000) : 0;
  elapsedSeconds = elapsedSeconds < 0 ? 0 : elapsedSeconds;

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

  // Effect to update tick
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Text className="text-xl font-semibold font-mono text-neutral-900 dark:text-neutral-50">
      {minutes}:{seconds}
    </Text>
  );
};

export default HeaderElapsedTimer;
