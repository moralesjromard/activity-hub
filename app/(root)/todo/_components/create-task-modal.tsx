"use client";

import { useEffect, useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { createTask, updateTaskContent } from "@/actions/task";
import { useUserStore } from "@/store/user-store";

type SelectedTask = {
  taskId: number;
  content: string;
};

interface CreateTaskModalProps {
  setIsOpen: (newValue: boolean) => void;
  isOpen: boolean;
  updateMessagesList: () => void;
  selectedTask: SelectedTask;
}

const formSchema = z.object({
  newContent: z.string().min(3, {
    message: "Message must be at least 3 characters.",
  }),
  priorityLevel: z.string().min(1, {
    message: "Priority level is required.",
  }),
});

export const CreateTaskModal = ({
  setIsOpen,
  isOpen,
  updateMessagesList,
  selectedTask,
}: CreateTaskModalProps) => {
  const { user } = useUserStore();

  const [isPending, startTransition] = useTransition();
  const [priorityLevel, setPriorityLevel] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newContent: "",
      priorityLevel: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) return null;

    startTransition(() => {
      createTask({
        content: values.newContent,
        priorityLevel: values.priorityLevel,
        userId: user?.id,
      }).then((res) => {
        if (res.error) {
          form.setError("newContent", {
            type: "manual",
            message: res.message,
          });
        }
        if (res.error) {
          setIsOpen(false);
          return toast.error(res.message);
        }
        if (res.success) {
          setIsOpen(false);
          updateMessagesList();
          form.reset();
          return toast.success(res.message);
        }
      });

      console.log(values);
    });
  };

  useEffect(() => {
    form.setValue("newContent", selectedTask.content);
  }, [isOpen]);

  useEffect(() => {
    form.setValue("priorityLevel", priorityLevel);
  }, [priorityLevel]);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
          <DialogDescription>Add your task here.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="updateSecretMessageForm"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="newContent"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="w-full h-12"
                      placeholder="What's on your mind?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priorityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      value={priorityLevel}
                      onValueChange={(value: any) => {
                        setPriorityLevel(value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select priority level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">LOW</SelectItem>
                        <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                        <SelectItem value="HIGH">HIGH</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
          <DialogFooter>
            <Button
              form="updateSecretMessageForm"
              type="submit"
              disabled={isPending}
            >
              {isPending && <LoaderCircle className="h-5 w-5 animate-spin" />}
              {isPending ? "Adding task..." : "Add task"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
