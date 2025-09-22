import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { TodoItem, TodoStatus } from "../api/schemas";
import { statusAccent, statusLabels, statusOptions } from "../utils/status";

const statusCycles: TodoStatus[] = ["todo", "in_progress", "blocked", "done"];

type TodoItemCardProps = {
  item: TodoItem;
  onStatusChange: (status: TodoStatus) => void;
  onDelete: () => void;
};

export function TodoItemCard({ item, onStatusChange, onDelete }: TodoItemCardProps) {
  return (
    <Card className="grid gap-3 p-4" data-testid="todo-item-card">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-medium leading-tight">{item.title}</h3>
          {item.description ? (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          ) : null}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Item actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStatusChange(nextStatus(item.status))}>
              Mark as {statusLabels[nextStatus(item.status)]}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              Delete item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={item.status} onValueChange={(value) => onStatusChange(value as TodoStatus)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {item.tags.length ? (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                #{tag.name}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1", statusAccent[item.status])}>
          {statusLabels[item.status]}
        </span>
        <span>Updated {new Date(item.updated_at).toLocaleString()}</span>
      </div>
    </Card>
  );
}

function nextStatus(current: TodoStatus): TodoStatus {
  const index = statusCycles.indexOf(current);
  const nextIndex = (index + 1) % statusCycles.length;
  return statusCycles[nextIndex];
}
