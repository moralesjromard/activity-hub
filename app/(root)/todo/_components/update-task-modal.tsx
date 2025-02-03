"use client";

import { useEffect, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { updateTaskContent } from "@/actions/task";

type SelectedTask = {
  taskId: number;
  content: string;
};

interface updateSecretMessageModalProps {
  setIsOpen: (newValue: boolean) => void;
  isOpen: boolean;
  updateMessagesList: () => void;
  selectedTask: SelectedTask;
}

const formSchema = z.object({
  newContent: z.string().min(3, {
    message: "Message must be at least 3 characters.",
  }),
});

export const UpdateSecretMessageModal = ({
  setIsOpen,
  isOpen,
  updateMessagesList,
  selectedTask,
}: updateSecretMessageModalProps) => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newContent: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      updateTaskContent({
        taskId: selectedTask?.taskId,
        content: values.newContent,
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
          return toast.success(res.message);
        }
      });

      console.log(values);
    });
  };

  useEffect(() => {
    form.setValue("newContent", selectedTask.content);
  }, [isOpen]);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update task</DialogTitle>
          <DialogDescription>
            Update the content of the task you selected.
          </DialogDescription>
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
                      placeholder="Update task content"
                      {...field}
                    />
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
              {isPending ? "Updating task..." : "Update task"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
