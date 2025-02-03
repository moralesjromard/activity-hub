"use server";

import { Note } from "@/app/(root)/notes/page";
import { createClient } from "@/utils/supabase/server";

type NoteResponse = Note[] | { error: true; message: string };

export const getNotes = async (userId: string): Promise<NoteResponse> => {
  const supabase = await createClient();

  const { data: notes, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      error: true,
      message: "Failed to fetch notes",
    };
  }

  return notes as Note[];
};

export const createNotes = async ({ userId }: { userId: string }) => {
  const supabase = await createClient();

  const { error: createError } = await supabase
    .from("notes")
    .insert([{ user_id: userId, title: "Untitled", note: "" }]);

  if (createError) {
    return {
      error: true,
      message: "Failed to create note",
    };
  }

  return {
    success: true,
    message: "You're note has been added",
  };
};

export const updateNotes = async ({
  noteId,
  title,
  note,
}: {
  noteId: number;
  title: string;
  note: string;
}) => {
  const supabase = await createClient();

  const { data, error: updateError } = await supabase
    .from("notes")
    .update({ title: title === "" ? "Untitled" : title, note })
    .match({ id: noteId });

  if (updateError) {
    return {
      error: true,
      message: "Failed to update note",
    };
  }

  return {
    success: true,
    message: "Note has been updated",
    noteId: noteId,
  };
};

export const deleteNotes = async ({ noteId }: { noteId: number }) => {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("notes")
    .delete()
    .match({ id: noteId });

  if (deleteError) {
    return {
      error: true,
      message: "Failed to delete note",
    };
  }

  return {
    success: true,
    message: "Note has been deleted",
  };
};
