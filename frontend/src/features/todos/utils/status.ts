import type { TodoStatus } from "../api/schemas";

export const statusOrder: TodoStatus[] = [
  "todo",
  "in_progress",
  "blocked",
  "done",
];

export const statusLabels: Record<TodoStatus, string> = {
  todo: "Todo",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
};

export const statusAccent: Record<TodoStatus, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100",
  blocked: "bg-destructive/10 text-destructive",
  done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100",
};

export const statusOptions = statusOrder.map((status) => ({
  value: status,
  label: statusLabels[status],
}));
