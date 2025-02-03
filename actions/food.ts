"use server";

import { v4 as uuidv4 } from "uuid";

import { createClient } from "@/utils/supabase/server";
import { FoodList } from "@/app/(root)/food/_components/food-post-list";
import { FoodReview } from "@/app/(root)/food/_components/food-post";

const BUCKET_NAME = "foods";

export const uploadFood = async ({
  userId,
  foodName,
  foodDescription,
  image,
}: {
  userId: string;
  foodName: string;
  foodDescription: string;
  image: File;
}) => {
  const supabase = createClient();

  // Generate a unique filename to prevent collisions
  const imageExt = image.name.split(".").pop();
  const imageName = `${uuidv4()}.${imageExt}`;
  const imagePath = `${userId}/${imageName}`;

  // Upload image to bucket
  const { error: uploadError } = await (await supabase).storage
    .from(BUCKET_NAME)
    .upload(imagePath, image);

  if (uploadError) {
    return {
      error: true,
      message: "Failed to upload image",
      serverError: uploadError,
    };
  }

  // Get the public URL for the uploaded image
  const {
    data: { publicUrl },
  } = (await supabase).storage.from(BUCKET_NAME).getPublicUrl(imagePath);

  // Store the food data in the database
  const { error } = await (await supabase).from("foods").insert({
    user_id: userId,
    name: foodName,
    description: foodDescription,
    url: publicUrl,
  });

  if (error) {
    // If database insert fails, delete the uploaded image
    await (await supabase).storage.from(BUCKET_NAME).remove([imagePath]);

    return {
      error: true,
      message: "Failed to save food data",
    };
  }

  return {
    success: true,
    message: "Food added successfully",
  };
};

type FoodResponse =
  | FoodList[]
  | { error: true; message: string; serverError: any };

export const getFoods = async (): Promise<FoodResponse> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("foods")
    .select(
      `
        *,
        profiles (
          user_id,
          name,
          email
        )
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return {
      error: true,
      message: "Failed to fetch foods",
      serverError: error,
    };
  }

  return data as FoodList[]; // Explicitly cast data as Food[]
};

export const createFoodReview = async ({
  userId,
  foodId,
  comment,
}: {
  userId: string;
  foodId: number;
  comment: string;
}) => {
  const supabase = await createClient();

  const { error: createError } = await supabase.from("food_reviews").insert({
    user_id: userId,
    food_id: foodId,
    comment: comment,
  });

  if (createError) {
    return {
      error: true,
      message: "Failed to create food review",
    };
  }

  return {
    success: true,
    message: "Food review created successfully",
  };
};

type FoodReviewResponse =
  | FoodReview[]
  | { error: true; message: string; serverError: any };

export const getFoodReviews = async ({
  foodId,
}: {
  foodId: number;
}): Promise<FoodReviewResponse> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("food_reviews")
    .select(
      `
      *,
      profiles (
        user_id,
        name,
        email
      )
    `
    )
    .eq("food_id", foodId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      error: true,
      message: "Failed to fetch food reviews",
      serverError: error,
    };
  }

  return data as FoodReview[];
};

export const updateFoodReview = async ({
  foodReviewId,
  comment,
}: {
  foodReviewId: number;
  comment: string;
}) => {
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("food_reviews")
    .update({
      comment,
    })
    .match({ id: foodReviewId });

  if (updateError) {
    return {
      error: true,
      message: "Failed to update food review",
    };
  }

  return {
    success: true,
    message: "Food review updated successfully",
  };
};

export const deleteFoodReview = async ({
  foodReviewId,
}: {
  foodReviewId: number;
}) => {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("food_reviews")
    .delete()
    .match({ id: foodReviewId });

  if (deleteError) {
    return {
      error: true,
      message: "Failed to delete food review",
    };
  }

  return {
    success: true,
    message: "Food review deleted successfully",
  };
};
