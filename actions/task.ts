"use server";

import { createClient } from "@/utils/supabase/server";

export const getTasksByUserId = async (userId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createTask = async ({
  content,
  priorityLevel,
  userId,
}: {
  content: string;
  priorityLevel: string;
  userId: string;
}) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .insert([{ content, user_id: userId, priority_level: priorityLevel }]);

  if (error) {
    return {
      error: true,
      message: "Failed to create task. Please try again.",
    };
  }

  return {
    success: true,
    message: "Task has been added!",
  };
};

export const deleteTask = async ({ id }: { id: number }) => {
  const supabase = await createClient();

  const { error } = await supabase.from("tasks").delete().match({ id });

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    message: "Task has been deleted!",
  };
};

export const updateTaskCompletion = async (isDone: boolean, id: number) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ is_done: !isDone })
    .match({ id });

  if (error) {
    return {
      error: true,
      message: "Failed to update task. Please try again.",
    };
  }

  return {
    success: true,
    message: "Task status has been updated",
  };
};

export const updateTaskContent = async ({
  content,
  priorityLevel,
  taskId,
}: {
  content: string;
  priorityLevel: string;
  taskId: number;
}) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ content, priority_level: priorityLevel })
    .match({ id: taskId });

  if (error) {
    return {
      error: true,
      message: "Failed to update task. Please try again.",
    };
  }

  return {
    success: true,
    message: "Task has been updated successfully.",
  };
};
