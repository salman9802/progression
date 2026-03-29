import type { UseQueryResult } from "@tanstack/react-query";
import React from "react";
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
          <div className="text-red-500">An error occurred</div>
        )}
      </>
    );

  if (query.data === undefined) return <>{emptyFallback}</>;

  return <>{children(query.data)}</>;
}
