import { useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTodoBoardStore } from "@/stores/useTodoBoardStore";

import type { TodoListDetail } from "../api/schemas";
import { useTodoLists } from "../hooks/use-todo-lists";
import { useTodoListDetail } from "../hooks/use-todo-list-detail";
import { TodoListSidebar } from "./todo-list-sidebar";
import { TodoListDetailPanel } from "./todo-list-detail-panel";

export function TodoDashboard() {
  const {
    data: lists,
    isLoading,
    isFetching,
    isError,
    error,
  } = useTodoLists();

  const selectedListId = useTodoBoardStore((state) => state.selectedListId);
  const setSelectedListId = useTodoBoardStore((state) => state.setSelectedListId);

  useEffect(() => {
    if (!lists?.length) {
      setSelectedListId(undefined);
      return;
    }
    const currentExists = selectedListId ? lists.some((list) => list.id === selectedListId) : false;
    if (!selectedListId) {
      setSelectedListId(lists[0].id);
      return;
    }
    if (!currentExists && !isFetching) {
      setSelectedListId(lists[0].id);
    }
  }, [isFetching, lists, selectedListId, setSelectedListId]);

  const detailQuery = useTodoListDetail(selectedListId);
  const selectedListSummary = lists?.find((list) => list.id === selectedListId);
  const derivedDetail: TodoListDetail | undefined =
    detailQuery.data ??
    (selectedListSummary
      ? {
          ...selectedListSummary,
          items: [],
        }
      : undefined);

  return (
    <div className="grid gap-10 lg:grid-cols-[320px,1fr]">
      <TodoListSidebar
        lists={lists}
        isLoading={isLoading}
        selectedListId={selectedListId}
        onSelect={(id) => setSelectedListId(id || undefined)}
        onCreated={(id) => setSelectedListId(id)}
      />
      <section>
        {isError ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load lists</AlertTitle>
            <AlertDescription>{error?.message ?? "Unexpected error"}</AlertDescription>
          </Alert>
        ) : null}

        {detailQuery.isLoading ? (
          <Card className="grid gap-4 p-6">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
          </Card>
        ) : null}

        {derivedDetail ? <TodoListDetailPanel list={derivedDetail} /> : null}

        {!derivedDetail && !detailQuery.isLoading && !lists?.length ? (
          <Card className="flex h-full min-h-[420px] items-center justify-center border-dashed bg-muted/40 p-10 text-center">
            <div className="max-w-md space-y-3">
              <h2 className="text-xl font-semibold">Create a list to get started</h2>
              <p className="text-sm text-muted-foreground">
                Capture high-level goals, break them into tasks, and showcase delivery momentum—all in one board.
              </p>
            </div>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
