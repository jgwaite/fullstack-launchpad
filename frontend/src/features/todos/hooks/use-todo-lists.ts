import { useQuery } from "@tanstack/react-query";

import { todoListsOptions } from "../api/get-todo-lists";

export function useTodoLists() {
  return useQuery(todoListsOptions());
}
