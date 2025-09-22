import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTodoBoardStore } from "@/stores/useTodoBoardStore";

import type { TodoListDetail, TodoStatus } from "../api/schemas";
import { useDeleteTodoItem } from "../api/delete-todo-item";
import { useUpdateTodoItem } from "../api/update-todo-item";
import { statusLabels } from "../utils/status";
import { CreateItemDialog } from "./create-item-dialog";
import { TodoItemCard } from "./todo-item-card";

const filters: (TodoStatus | "all")[] = ["all", "todo", "in_progress", "blocked", "done"];

type TodoListDetailPanelProps = {
  list: TodoListDetail;
};

export function TodoListDetailPanel({ list }: TodoListDetailPanelProps) {
  const statusFilter = useTodoBoardStore((state) => state.statusFilter);
  const setStatusFilter = useTodoBoardStore((state) => state.setStatusFilter);
  const searchTerm = useTodoBoardStore((state) => state.searchTerm);
  const setSearchTerm = useTodoBoardStore((state) => state.setSearchTerm);

  const deleteItem = useDeleteTodoItem(list.id);
  const updateItem = useUpdateTodoItem();

  const filteredItems = useMemo(() => {
    return list.items.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;
      const matchesSearch = searchTerm
        ? [item.title, item.description ?? "", item.notes ?? "", item.tags.map((tag) => tag.name).join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [list.items, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">{list.name}</h2>
          {list.description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{list.description}</p>
          ) : null}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>Created {new Date(list.created_at).toLocaleDateString()}</span>
          <span aria-hidden>•</span>
          <span>{list.items.length} tasks</span>
        </div>
        </div>
        <CreateItemDialog listId={list.id} />
      </div>

      <Card className="space-y-4 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter}
                size="sm"
                variant={statusFilter === filter ? "default" : "ghost"}
                onClick={() => setStatusFilter(filter)}
              >
                {filter === "all" ? "All" : statusLabels[filter]}
              </Button>
            ))}
          </div>
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Filter by keyword or tag"
            className="max-w-sm"
          />
        </div>
        <Separator />
        <div className="space-y-3">
          {filteredItems.length ? (
            filteredItems.map((item) => (
              <TodoItemCard
                key={item.id}
                item={item}
                onStatusChange={(status) =>
                  updateItem.mutate({ itemId: item.id, listId: list.id, status })
                }
                onDelete={() => deleteItem.mutate(item.id)}
              />
            ))
          ) : (
            <Card className="border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              No tasks match the current filters.
            </Card>
          )}
        </div>
      </Card>

      <TagSummary items={list.items} />
    </div>
  );
}

function TagSummary({ items }: { items: TodoListDetail["items"] }) {
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      item.tags.forEach((tag) => {
        counts.set(tag.name, (counts.get(tag.name) ?? 0) + 1);
      });
    });
    return counts;
  }, [items]);

  if (!tagCounts.size) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Tags across this list</h3>
      <div className="flex flex-wrap gap-2">
        {[...tagCounts.entries()].map(([name, count]) => (
          <Badge key={name} variant="outline">
            #{name}
            <span className="ml-1 text-muted-foreground">{count}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
}
