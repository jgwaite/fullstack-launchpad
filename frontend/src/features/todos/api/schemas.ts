import { z } from "zod";

export const todoStatusSchema = z.enum(["todo", "in_progress", "blocked", "done"]);

export type TodoStatus = z.infer<typeof todoStatusSchema>;

export const todoTagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});

export const todoItemSchema = z.object({
  id: z.string().uuid(),
  list_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  due_date: z.string().datetime().nullable().optional(),
  status: todoStatusSchema,
  position: z.number().int().nonnegative(),
  completed_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  tags: z.array(todoTagSchema),
});

export type TodoItem = z.infer<typeof todoItemSchema>;

export const todoListReadSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type TodoListRead = z.infer<typeof todoListReadSchema>;

export const todoListSummarySchema = todoListReadSchema.extend({
  item_count: z.number().int().nonnegative(),
});

export type TodoListSummary = z.infer<typeof todoListSummarySchema>;

export const todoListDetailSchema = todoListSummarySchema.extend({
  items: z.array(todoItemSchema),
});

export type TodoListDetail = z.infer<typeof todoListDetailSchema>;

export const todoListsResponseSchema = z.array(todoListSummarySchema);

export type TodoListsResponse = z.infer<typeof todoListsResponseSchema>;
