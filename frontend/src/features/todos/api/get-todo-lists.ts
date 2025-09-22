import { queryOptions } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";

import { todoListsResponseSchema } from "./schemas";
import { todoQueryKeys } from "./query-keys";

export const todoListsOptions = () =>
  queryOptions({
    queryKey: todoQueryKeys.lists(),
    queryFn: async () => {
      const response = await apiFetch("/todo/lists");
      return todoListsResponseSchema.parse(response);
    },
    staleTime: 30_000,
  });
