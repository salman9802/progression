import { TTaskDetails } from "@/db/schema";
import { useStartTimer, useStopTimer } from "@/hooks/tasks";
import React from "react";

const TimerContext = React.createContext<{
  activeTask: TTaskDetails | null;
  startTimer: (task: TTaskDetails) => void;
  stopTimer: () => void;
  elapsedSeconds: number;
} | null>(null);

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTask, setActiveTask] = React.useState<TTaskDetails | null>(null);
  const [startTime, setStartTime] = React.useState<number | null>(null);
  const [now, setNow] = React.useState(() => Date.now());

  // Effect to update tick
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // start timer
  const startTimerMutation = useStartTimer();
  const startTimer = (task: TTaskDetails) => {
    if (activeTask != null || startTime != null) {
      if (activeTask) stopTimer();
    }

    setActiveTask(task);
    setStartTime(Date.now());

    startTimerMutation.mutate(task.id);
  };

  // stop timer
  const stopTimerMutation = useStopTimer();
  const stopTimer = () => {
    if (activeTask == null || startTime == null) return;

    const elapsed = Math.floor(Date.now() - startTime);

    stopTimerMutation.mutate(
      {
        id: activeTask.id,
        elapsed,
      },
      //   {
      //     onError: (error) => {
      //       console.error(error);
      //     },
      //   },
    );

    setActiveTask(null);
    setStartTime(null);
  };

  // elapsed seconds
  let elapsedSeconds = startTime ? Math.floor((now - startTime) / 1000) : 0;
  elapsedSeconds = elapsedSeconds < 0 ? 0 : elapsedSeconds;

  const value = {
    activeTask,
    startTimer,
    stopTimer,
    elapsedSeconds,
  };

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
};

export function useTimer() {
  const value = React.useContext(TimerContext);
  if (value == null) {
    throw new Error(
      "Error: `useTimer` can only be used inside `<TimerProvider />`",
    );
  }
  return value;
}
