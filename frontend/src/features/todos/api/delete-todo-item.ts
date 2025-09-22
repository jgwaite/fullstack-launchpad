import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

import { todoQueryKeys } from "./query-keys";

export function useDeleteTodoItem(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      await apiFetch(`/todo/items/${itemId}`, { method: "DELETE" });
      return itemId;
    },
    onSuccess: () => {
      toast.success("Item removed");
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.list(listId) });
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error("Unable to delete item", { description: error.message });
    },
  });
}
