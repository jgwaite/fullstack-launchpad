import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

import { todoItemSchema } from "./schemas";
import { todoQueryKeys } from "./query-keys";

const payloadSchema = z.object({
  listId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  notes: z.string().optional(),
  due_date: z.coerce.date().optional().nullable(),
  status: z
    .enum(["todo", "in_progress", "blocked", "done"], {
      invalid_type_error: "Invalid status",
    })
    .optional(),
  position: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateTodoItemInput = z.input<typeof payloadSchema>;

export function useCreateTodoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTodoItemInput) => {
      const parsed = payloadSchema.parse(input);
      const response = await apiFetch(`/todo/lists/${parsed.listId}/items`, {
        method: "POST",
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
    onSuccess: (created) => {
      toast.success("Item added to list");
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.list(created.list_id) });
    },
    onError: (error: Error) => {
      toast.error("Unable to add item", { description: error.message });
    },
  });
}
