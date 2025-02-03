"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: true,
      message: "Incorrect email or password!",
    };
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    data: {
      id: data.user.id,
      name: data.user.user_metadata.display_name,
      email: data.user.email!,
      created_at: data.user.created_at,
    },
  };
};

export const register = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  const supabase = await createClient();

  // Sign up the user with their metadata
  const {
    data: { user },
    error: signUpError,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
      },
    },
  });

  if (signUpError) {
    // If error includes "already registered", it means email exists
    if (signUpError.message.toLowerCase().includes("already registered")) {
      return {
        emailError: true,
        message: "Email is already taken!",
      };
    }

    return {
      error: true,
      message: signUpError.message,
    };
  }

  if (!user) {
    return {
      error: true,
      message: "Failed to create user",
    };
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    data: {
      id: user.id,
      name: user.user_metadata.display_name,
      email: user.email!,
      created_at: user.created_at,
    },
  };
};

export const logout = async () => {
  const supabase = await createClient();

  const { error: logoutError } = await supabase.auth.signOut();

  if (logoutError) {
    return {
      error: true,
      message: "Failed to logout!",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
};
