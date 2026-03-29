import { View } from "react-native";

function Skeleton({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      data-slot="skeleton"
      className={`animate-pulse rounded-md bg-gray-300 ${className}`}
      {...props}
    />
  );
}

export { Skeleton };
