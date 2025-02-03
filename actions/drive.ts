"use server";

import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

type FileData = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  created_at: string;
  user_id: string;
};

const BUCKET_NAME = "drive";

export const uploadFile = async ({
  file,
  userId,
}: {
  file: File;
  userId: string;
}) => {
  try {
    const supabase = createClient();

    // Generate a unique filename to prevent collisions
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await (await supabase).storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) {
      return {
        error: "Failed to upload file",
        success: false,
      };
    }

    // Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = (await supabase).storage.from(BUCKET_NAME).getPublicUrl(filePath);

    // Store file metadata in the database
    const { error: dbError } = await (await supabase).from("files").insert({
      name: file.name,
      size: file.size,
      type: file.type,
      url: publicUrl,
      path: filePath,
      user_id: userId,
    });

    if (dbError) {
      // If database insert fails, delete the uploaded file
      await (await supabase).storage.from(BUCKET_NAME).remove([filePath]);

      return {
        error: "Failed to save file metadata",
        success: false,
      };
    }

    return {
      success: true,
      data: {
        url: publicUrl,
        name: file.name,
      },
    };
  } catch (error) {
    return {
      error: "Something went wrong",
      success: false,
    };
  }
};

export const getFiles = async (userId: string) => {
  try {
    const supabase = createClient();

    const { data, error } = await (await supabase)
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        error: "Failed to fetch files",
        success: false,
      };
    }

    return {
      success: true,
      data: data as FileData[],
    };
  } catch (error) {
    return {
      error: "Something went wrong",
      success: false,
    };
  }
};

export const deleteFile = async ({
  fileId,
  userId,
  filePath,
}: {
  fileId: number;
  userId: string;
  filePath: string;
}) => {
  try {
    const supabase = createClient();

    // Delete file from storage
    const { error: storageError } = await (await supabase).storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (storageError) {
      return {
        error: true,
        message: "Failed to delete file from storage",
      };
    }

    // Delete file metadata from database
    const { error: dbError } = await (await supabase)
      .from("files")
      .delete()
      .eq("id", fileId)
      .eq("user_id", userId);

    if (dbError) {
      return {
        error: true,
        message: "Failed to delete file metadata",
        serverError: dbError,
      };
    }

    return {
      success: true,
      message: "File has been deleted successfully",
    };
  } catch (error) {
    return {
      error: true,
      message: "Something went wrong",
    };
  }
};

// actions/drive.ts
export const updateFile = async ({
  fileId,
  userId,
  newFile,
  filePath,
}: {
  fileId: number;
  userId: string;
  newFile: File;
  filePath: string;
}) => {
  try {
    const supabase = createClient();

    // Delete the old file
    const { error: deleteError } = await (await supabase).storage
      .from("drive")
      .remove([filePath]);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return {
        error: "Failed to delete old file",
        success: false,
      };
    }

    // Upload new file
    const { error: uploadError } = await (await supabase).storage
      .from("drive")
      .upload(filePath, newFile, {
        cacheControl: "0",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return {
        error: "Failed to upload new file",
        success: false,
      };
    }

    // Get the signed URL
    const { data: signedData } = await (await supabase).storage
      .from("drive")
      .createSignedUrl(filePath, 60 * 60);

    // Update file metadata including the new file name
    const { error: updateError } = await (
      await supabase
    )
      .from("files")
      .update({
        name: newFile.name, // Update to new file's name
        size: newFile.size,
        type: newFile.type,
        url: signedData?.signedUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fileId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Update error:", updateError);
      return {
        error: "Failed to update file data",
        success: false,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update error:", error);
    return {
      error: "Something went wrong",
      success: false,
    };
  }
};
