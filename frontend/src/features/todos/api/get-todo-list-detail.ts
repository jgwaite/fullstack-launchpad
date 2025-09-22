import { queryOptions } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";

import { todoListDetailSchema } from "./schemas";
import { todoQueryKeys } from "./query-keys";

export const todoListDetailOptions = (listId: string) =>
  queryOptions({
    queryKey: todoQueryKeys.list(listId),
    queryFn: async () => {
      const response = await apiFetch(`/todo/lists/${listId}?include_items=true`);
      return todoListDetailSchema.parse(response);
    },
    enabled: Boolean(listId),
  });
