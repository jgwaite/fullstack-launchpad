import { create } from "zustand";

import type { TodoStatus } from "@/features/todos/api/schemas";

export type TodoStatusFilter = "all" | TodoStatus;

type TodoBoardState = {
  selectedListId?: string;
  statusFilter: TodoStatusFilter;
  searchTerm: string;
  setSelectedListId: (listId?: string) => void;
  setStatusFilter: (filter: TodoStatusFilter) => void;
  setSearchTerm: (term: string) => void;
  reset: () => void;
};

export const useTodoBoardStore = create<TodoBoardState>((set) => ({
  selectedListId: undefined,
  statusFilter: "all",
  searchTerm: "",
  setSelectedListId: (selectedListId) => set({ selectedListId }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  reset: () => set({ selectedListId: undefined, statusFilter: "all", searchTerm: "" }),
}));
