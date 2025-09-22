import { useQuery } from "@tanstack/react-query";

import { todoListDetailOptions } from "../api/get-todo-list-detail";

export function useTodoListDetail(listId: string | undefined) {
  return useQuery({
    ...todoListDetailOptions(listId ?? ""),
    enabled: Boolean(listId),
  });
}
