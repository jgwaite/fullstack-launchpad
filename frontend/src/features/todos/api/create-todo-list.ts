import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

import { todoListReadSchema } from "./schemas";
import { todoQueryKeys } from "./query-keys";

const payloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type CreateTodoListInput = z.infer<typeof payloadSchema>;

export function useCreateTodoList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTodoListInput) => {
      const payload = payloadSchema.parse(input);
      const response = await apiFetch("/todo/lists", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return todoListReadSchema.parse(response);
    },
    onSuccess: (created) => {
      toast.success(`Created list “${created.name}”`);
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error("Unable to create list", { description: error.message });
    },
  });
}
