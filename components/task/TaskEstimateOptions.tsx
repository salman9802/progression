import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type QuickEstimateOptionsProps = {
  estimatedSeconds: number | undefined;
  onEstimateChange: (esimatedSeconds: number) => any;
};

const TaskEstimateOptions = ({
  estimatedSeconds,
  onEstimateChange,
}: QuickEstimateOptionsProps) => {
  return (
    <View className="w-full">
      <View className="flex-row gap-2 w-full">
        {/* -5 mins */}
        <TouchableOpacity
          onPress={() => {
            if (estimatedSeconds == undefined) onEstimateChange(-300);
            else onEstimateChange(estimatedSeconds - 300);
          }}
          className="flex-1 basis-0 my-2 bg-neutral-100 dark:bg-neutral-700 gap-3 px-4 py-2 rounded-md"
        >
          <Text className="text-red-500 font-medium font-mono">-5 mins</Text>
        </TouchableOpacity>

        {/* -10 mins */}
        <TouchableOpacity
          onPress={() => {
            if (estimatedSeconds == undefined) onEstimateChange(-600);
            else onEstimateChange(estimatedSeconds - 600);
          }}
          className="flex-1 basis-0 my-2 bg-neutral-100 dark:bg-neutral-700 gap-3 px-4 py-2 rounded-md"
        >
          <Text className="text-red-500 font-medium font-mono">-10 mins</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-2">
        {/* -5 mins */}
        <TouchableOpacity
          onPress={() => {
            if (estimatedSeconds == undefined) onEstimateChange(+300);
            else onEstimateChange(estimatedSeconds + 300);
          }}
          className="flex-1 basis-0 my-2 bg-neutral-100 dark:bg-neutral-700 gap-3 px-4 py-2 rounded-md"
        >
          <Text className="text-primary-500 font-medium font-mono">
            +5 mins
          </Text>
        </TouchableOpacity>

        {/* +10 mins */}
        <TouchableOpacity
          onPress={() => {
            if (estimatedSeconds == undefined) onEstimateChange(+600);
            else onEstimateChange(estimatedSeconds + 600);
          }}
          className="flex-1 basis-0 my-2 bg-neutral-100 dark:bg-neutral-700 gap-3 px-4 py-2 rounded-md"
        >
          <Text className="text-primary-500 font-medium font-mono">
            +10 mins
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TaskEstimateOptions;
