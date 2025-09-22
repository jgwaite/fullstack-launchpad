import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";

import { useCreateTodoList } from "../api/create-todo-list";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CreateListDialogProps = {
  onCreated?: (listId: string) => void;
};

export function CreateListDialog({ onCreated }: CreateListDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "" },
  });
  const createList = useCreateTodoList();

  const isSubmitting = createList.isPending;

  const handleSubmit = form.handleSubmit(async (values) => {
    const result = await createList.mutateAsync(values);
    form.reset();
    setOpen(false);
    onCreated?.(result.id);
  });

  useEffect(() => {
    if (!createList.isPending && createList.isError) {
      form.setFocus("name");
    }
  }, [createList.isPending, createList.isError, form]);

  useEffect(() => {
    if (!open) {
      form.reset({ name: "", description: "" });
    }
  }, [form, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New list</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>Create a todo list</DialogTitle>
            <DialogDescription>
              Organise work into focused lists and invite visibility into active tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                Name
              </label>
              <Input id="name" {...form.register("name")} placeholder="Product roadmap" />
              {form.formState.errors.name ? (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="description">
                Description <span className="text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                id="description"
                rows={3}
                {...form.register("description")}
                placeholder="Define purpose, owners, or relevant context"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create list"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
