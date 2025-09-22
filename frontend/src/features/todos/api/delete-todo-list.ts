import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

import { todoQueryKeys } from "./query-keys";

export function useDeleteTodoList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) => {
      await apiFetch(`/todo/lists/${listId}`, { method: "DELETE" });
      return listId;
    },
    onSuccess: (listId) => {
      toast.success("List deleted");
      queryClient.removeQueries({ queryKey: todoQueryKeys.list(listId) });
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error("Unable to delete list", { description: error.message });
    },
  });
}
