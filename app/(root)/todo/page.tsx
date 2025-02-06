"use client";

import { useUserStore } from "@/store/user-store";
import { useTransition } from "react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Loader2,
  Pencil,
  CheckSquare,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { UpdateSecretMessageModal } from "./_components/update-task-modal";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { User, Clock, Filter } from "lucide-react";

import {
  createTask,
  deleteTask,
  getTasksByUserId,
  updateTaskCompletion,
} from "@/actions/task";

import { cn } from "@/lib/utils";
import { CreateTaskModal } from "./_components/create-task-modal";

type Task = {
  id: number;
  content: string;
  user_id: string;
  is_done: boolean;
  priority_level: string;
};

const TodoPage = () => {
  const { user } = useUserStore();

  const [isPending, startTransition] = useTransition();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState({
    taskId: 0,
    content: "",
    priorityLevel: "",
  });

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [task, setTask] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const completedTasks = tasks.filter((task) => task.is_done).length;
  const progressPercentage =
    tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.is_done;
    if (filter === "completed") return task.is_done;

    return true;
  });

  const handleGetTasks = async () => {
    if (!user?.id) return;

    await getTasksByUserId(user?.id)
      .then((res) => {
        setTasks(res);
      })
      .catch(() => {
        toast.error("Failed to fetch tasks. Please try again.");
      });
  };

  const handleDeleteTask = async (taskId: number) => {
    await deleteTask({ id: taskId })
      .then(() => {
        setTasks(tasks.filter((task) => task.id !== taskId));
        toast.success("Task deleted successfully!");
      })
      .catch(() => {
        toast.error("Failed to delete task. Please try again.");
      });
  };

  const toggleTaskCompletion = async (isDone: boolean, taskId: number) => {
    await updateTaskCompletion(isDone, taskId)
      .then((res) => {
        if (res.error) {
          toast.error("Failed to update task. Please try again.");
          return;
        }
        if (res.success) {
          toast.success("Task updated successfully!");
        }

        handleGetTasks();
      })
      .catch(() => {
        toast.error("Failed to update task. Please try again.");
      });
  };

  const handleOpenDeleteDialog = ({
    taskId,
    content,
    priorityLevel,
  }: {
    taskId: number;
    content: string;
    priorityLevel: string;
  }) => {
    setIsDeleteDialogOpen(true);
    setSelectedTask({ taskId, content, priorityLevel });
  };

  const handleOpenUpdateDialog = ({
    taskId,
    content,
    priorityLevel,
  }: {
    taskId: number;
    content: string;
    priorityLevel: string;
  }) => {
    setIsUpdateDialogOpen(true);
    setSelectedTask({ taskId, content, priorityLevel });
  };

  useEffect(() => {
    handleGetTasks();
    return () => setTasks([]);
  }, [user?.id]);

  return (
    <>
      <main className="w-full h-full flex justify-center items-start flex-col p-6">
        <header className="flex flex-col mb-6 gap-6 w-full">
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 mr-4">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold">To-do List</h2>
                <p className="text-muted-foreground">Manage your daily tasks</p>
              </div>
            </div>
          </div>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Task Manager</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Status bar */}
        <div className="flex items-center justify-between w-full mb-6 bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.name} (You)</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {completedTasks} of {tasks.length} tasks completed
          </div>
        </div>

        <Card className="w-full mx-auto border-none shadow-md">
          <CardContent className="p-6 space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>You're task progress:</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress
                value={progressPercentage}
                className="h-2"
                indicatorColor="bg-blue-500/80"
              />
            </div>

            <div className="flex justify-between flex-1 gap-10">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create task
              </Button>

              {/* Filter */}
              <div className="flex justify-between items-center">
                <Select
                  value={filter}
                  onValueChange={(value: any) => setFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter tasks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tasks List */}
            {tasks.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredTasks.map((task, index) => (
                    <div
                      key={index}
                      className={cn(
                        "group flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md",
                        task.is_done && "bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  toggleTaskCompletion(task.is_done, task.id)
                                }
                              >
                                {task.is_done ? (
                                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                ) : (
                                  <Circle className="h-5 w-5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {task.is_done
                                ? "Mark as incomplete"
                                : "Mark as complete"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div
                          className={cn(
                            "flex-1 flex justify-start items-center gap-2",
                            task.is_done && "text-muted-foreground line-through"
                          )}
                        >
                          {task.content}
                          <Badge
                            variant="outline"
                            className={cn(
                              task.priority_level === "HIGH" &&
                                "bg-red-500 text-white",
                              task.priority_level === "MEDIUM" &&
                                "bg-yellow-500 text-white",
                              task.priority_level === "LOW" &&
                                "bg-green-500 text-white"
                            )}
                          >
                            {task.priority_level}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleOpenUpdateDialog({
                                    taskId: task.id,
                                    content: task.content,
                                    priorityLevel: task.priority_level,
                                  })
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit task</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600"
                                onClick={() =>
                                  handleOpenDeleteDialog({
                                    taskId: task.id,
                                    content: task.content,
                                    priorityLevel: task.priority_level,
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete task</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>All clear!</AlertTitle>
                <AlertDescription>
                  You have no tasks yet. Add some tasks to get started.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </main>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => handleDeleteTask(selectedTask?.taskId)}
        title="Delete task"
        description="Are you sure you want to delete this task?"
        cancelText="Cancel"
        confirmText="Confirm"
        variant="destructive"
      />

      <UpdateSecretMessageModal
        setIsOpen={setIsUpdateDialogOpen}
        isOpen={isUpdateDialogOpen}
        updateMessagesList={handleGetTasks}
        selectedTask={{
          taskId: selectedTask?.taskId,
          content: selectedTask?.content,
          priorityLevel: selectedTask?.priorityLevel,
        }}
      />

      <CreateTaskModal
        setIsOpen={setIsCreateDialogOpen}
        isOpen={isCreateDialogOpen}
        updateMessagesList={handleGetTasks}
        selectedTask={{
          taskId: selectedTask?.taskId,
          content: selectedTask?.content,
        }}
      />
    </>
  );
};

export default TodoPage;
