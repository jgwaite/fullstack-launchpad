import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

import { todoItemSchema } from "./schemas";
import { todoQueryKeys } from "./query-keys";

const payloadSchema = z.object({
  itemId: z.string().uuid(),
  listId: z.string().uuid(),
  title: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  due_date: z.coerce.date().optional().nullable(),
  status: z.enum(["todo", "in_progress", "blocked", "done"]).optional(),
  position: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateTodoItemInput = z.input<typeof payloadSchema>;

export function useUpdateTodoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTodoItemInput) => {
      const parsed = payloadSchema.parse(input);
      const response = await apiFetch(`/todo/items/${parsed.itemId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: parsed.title,
          description: parsed.description,
          notes: parsed.notes,
          due_date: parsed.due_date?.toISOString(),
          status: parsed.status,
          position: parsed.position,
          tags: parsed.tags,
        }),
      });
      return todoItemSchema.parse(response);
    },
    onSuccess: (updated) => {
      toast.success("Item updated");
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.list(updated.list_id) });
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error("Unable to update item", { description: error.message });
    },
  });
}
