import type { UseQueryResult } from "@tanstack/react-query";
import React from "react";
import { Text, View } from "react-native";
import Spinner from "./Spinner";

type QueryStateProps<T> = {
  query: UseQueryResult<T>;
  loadingFallback?: React.ReactNode;
  errorFallback?: (error: unknown) => React.ReactNode;
  emptyFallback?: React.ReactNode;
  children: (data: T) => React.ReactNode;

  /* for debugging purpose */
  showLoader?: boolean;
  showEmpty?: boolean;
};
export function QueryState<T>({
  query,
  loadingFallback = <Spinner className="size-5" />,
  errorFallback,
  emptyFallback = null,
  children,
  showLoader = false,
  showEmpty = false,
}: QueryStateProps<T>) {
  if (showLoader) return <>{loadingFallback}</>;
  if (showEmpty) return <>{emptyFallback}</>;
  if (query.isLoading) return <>{loadingFallback}</>;

  if (query.isError)
    return (
      <>
        {errorFallback?.(query.error) ?? (
          <View className="px-4 py-2 rounded-md bg-neutral-300 dark:bg-neutral-800">
            {/* <Text className="text-red-500">An error occurred</Text> */}
            <Text className="text-red-500 font-semibold">
              {query.error.name}: {query.error.message}
            </Text>
            {/* <Text className="text-red-500 font-semibold">
              Message: {query.error.message}
            </Text> */}
            <Text className="text-red-500 font-semibold">
              Cause:{" "}
              {query.error.cause
                ? JSON.stringify(query.error.cause, null, 2)
                : "Unknown Cause"}
            </Text>
            <Text className="my-2 px-4 py-2 rounded-md whitespace-pre-wrap text-red-500 bg-neutral-200  dark:bg-neutral-700">
              {query.error.stack}
            </Text>
          </View>
        )}
      </>
    );

  if (
    query.data === undefined ||
    (Array.isArray(query.data) && query.data.length === 0)
  )
    return <>{emptyFallback}</>;

  return <>{children(query.data)}</>;
}
