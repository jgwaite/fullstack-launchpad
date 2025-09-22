import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { useCreateTodoItem } from "../api/create-todo-item";
import { statusOptions } from "../utils/status";

const schema = z.object({
  listId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["todo", "in_progress", "blocked", "done"]).default("todo"),
  due_date: z.coerce.date().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

type CreateItemDialogProps = {
  listId: string;
};

export function CreateItemDialog({ listId }: CreateItemDialogProps) {
  const [open, setOpen] = useState(false);
  const createItem = useCreateTodoItem();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      listId,
      title: "",
      notes: "",
      tags: "",
      status: "todo",
    },
  });

  const isSubmitting = createItem.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    const tags = values.tags
      ? values.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined;

    await createItem.mutateAsync({
      listId: values.listId,
      title: values.title,
      notes: values.notes,
      tags,
      due_date: values.due_date ?? undefined,
      status: values.status,
    });

    form.reset({ ...form.getValues(), title: "", notes: "", tags: "" });
    setOpen(false);
  });

  useEffect(() => {
    form.setValue("listId", listId);
  }, [form, listId]);

  useEffect(() => {
    if (!open) {
      form.reset({ listId, title: "", notes: "", tags: "", status: "todo", due_date: undefined });
    }
  }, [form, listId, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Add task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Create a task</DialogTitle>
            <DialogDescription>Capture actionable work within this list.</DialogDescription>
          </DialogHeader>
          <input type="hidden" value={listId} {...form.register("listId")} />
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Write the app shell" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Add extra context or acceptance criteria"
              {...form.register("notes")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as FormValues["status"])}
              >
                <SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <Label>Due date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className={cn(
                      "w-full justify-start",
                      !form.watch("due_date") && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("due_date")
                      ? form.watch("due_date")!.toLocaleDateString()
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <input
                    type="date"
                    className="w-full cursor-pointer border-none bg-transparent p-4 text-sm outline-none"
                    value={form.watch("due_date")?.toISOString().slice(0, 10) ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      form.setValue("due_date", value ? new Date(value) : undefined);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Separate tags with commas"
              {...form.register("tags")}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
