import { useTimer } from "@/contexts/timer";
import Logger from "@/lib/logger";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Pressable } from "react-native";

const HeaderTimerButton = () => {
  const logger = useMemo(() => new Logger("HeaderTimerButton"), []);

  const { activeTask, startTimer, stopTimer } = useTimer();

  const scale = useRef(new Animated.Value(1)).current;

  // ${activeTask && "animate-spin"}
  //   logger.log({
  //     // activeTask,
  //     scale,
  //   });

  //   ${activeTask != null ? "animate-spin" : ""}

  useEffect(() => {
    if (activeTask) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.4, // grow
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1, // shrink back
            duration: 600,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      scale.stopAnimation();
      scale.setValue(1);
    }
  }, [activeTask]);

  return (
    <Pressable
      disabled={activeTask == null}
      className={`relative overflow-visible mr-4 p-3 bg-primary-500 rounded-full flex items-center justify-center disabled:opacity-50`}
      onPress={() => stopTimer()}
    >
      {/* <Animated.View
        className={`mr-4 p-3 bg-primary-500 rounded-full flex items-center justify-center disabled:opacity-50`}
        // style={{
        //   transform: [{ scale }],
        //   backgroundColor: "#3b82f6",
        //   padding: 12,
        //   borderRadius: 999,
        //   alignItems: "center",
        //   justifyContent: "center",
        // }}
      > */}

      <Animated.View
        className="absolute inset-0 rounded-full bg-blue-500/30"
        style={{
          transform: [{ scale }],
          opacity: activeTask ? 1 : 0, // hide when timer is inactive
        }}
      />

      {activeTask ? (
        <Feather name="pause" size={18} color="white" />
      ) : (
        <Feather name="play" size={18} color="white" />
      )}
      {/* </Animated.View> */}
    </Pressable>
  );
};

export default HeaderTimerButton;
