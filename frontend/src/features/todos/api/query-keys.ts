export const todoQueryKeys = {
  all: ["todo"] as const,
  lists: () => [...todoQueryKeys.all, "lists"] as const,
  list: (listId: string) => [...todoQueryKeys.lists(), listId] as const,
};
