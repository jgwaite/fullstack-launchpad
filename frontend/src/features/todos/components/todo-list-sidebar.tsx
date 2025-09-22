import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { TodoListSummary } from "../api/schemas";
import { useDeleteTodoList } from "../api/delete-todo-list";
import { CreateListDialog } from "./create-list-dialog";

const emptyStateCopy = {
  title: "Create your first list",
  description: "Lists help teams group work by product area, squad, or initiative.",
};

type TodoListSidebarProps = {
  lists: TodoListSummary[] | undefined;
  isLoading: boolean;
  selectedListId?: string;
  onSelect: (listId: string) => void;
  onCreated: (listId: string) => void;
};

export function TodoListSidebar({
  lists,
  isLoading,
  selectedListId,
  onSelect,
  onCreated,
}: TodoListSidebarProps) {
  const deleteList = useDeleteTodoList();

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    if (!lists?.length) {
      return (
        <Card className="border-dashed bg-muted/40 p-6 text-center">
          <h3 className="text-lg font-medium">{emptyStateCopy.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {emptyStateCopy.description}
          </p>
        </Card>
      );
    }

    return (
      <ul className="space-y-2">
        {lists.map((todoList) => {
          const isActive = todoList.id === selectedListId;
          return (
            <li key={todoList.id}>
              <button
                type="button"
                onClick={() => onSelect(todoList.id)}
                className={cn(
                  "w-full rounded-lg border bg-card px-4 py-3 text-left transition",
                  "hover:border-primary/60 hover:shadow-sm",
                  isActive ? "border-primary shadow-md" : "border-border",
                )}
                data-testid={`todo-list-${todoList.id}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium leading-tight line-clamp-1">
                      {todoList.name}
                    </p>
                    {todoList.description ? (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {todoList.description}
                      </p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    {todoList.item_count} tasks
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Updated {new Date(todoList.updated_at).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    className="text-destructive transition hover:text-destructive/70"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteList.mutate(todoList.id, {
                        onSuccess: () => {
                          if (todoList.id === selectedListId && lists.length > 1) {
                            const next = lists.find((entry) => entry.id !== todoList.id);
                            if (next) onSelect(next.id);
                          } else if (lists.length === 1) {
                            onSelect("");
                          }
                        },
                      });
                    }}
                    data-testid={`delete-todo-list-${todoList.id}`}
                  >
                    Delete
                  </button>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }, [deleteList, isLoading, lists, onSelect, selectedListId]);

  return (
    <aside className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lists</h2>
        <CreateListDialog
          onCreated={(id) => {
            onCreated(id);
            onSelect(id);
          }}
        />
      </div>
      <div className="max-h-[calc(100vh-220px)] space-y-2 overflow-y-auto pr-2">
        {content}
      </div>
    </aside>
  );
}
